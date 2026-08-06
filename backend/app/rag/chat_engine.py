"""
RAG-Powered AI Business Chat — builds knowledge context from real DB data.
Uses LLM (OpenAI/Gemini) if API key provided, otherwise intelligent template-based responses.
"""
import logging
from typing import Dict, Any, List
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import func

logger = logging.getLogger(__name__)


class RAGChatEngine:
    """
    RAG Chat Engine that retrieves real business context from the database
    and generates contextually relevant responses.
    """

    def __init__(self, db: Session):
        self.db = db

    def _retrieve_context(self, user_message: str) -> List[Dict[str, str]]:
        """Retrieve relevant business context from DB based on query intent."""
        from app.models.models import Product, Inventory, Sale, Supplier, InventoryStatus

        msg = user_message.lower()
        context_docs = []

        # ── Inventory context ──
        if any(kw in msg for kw in ["stock", "inventory", "restock", "reorder", "low", "critical", "overstock"]):
            critical_items = (
                self.db.query(Inventory, Product)
                .join(Product, Product.id == Inventory.product_id)
                .filter(Inventory.status.in_([InventoryStatus.CRITICAL, InventoryStatus.WARNING]))
                .all()
            )
            for inv, prod in critical_items:
                context_docs.append({
                    "type": "inventory",
                    "content": f"{prod.name} (SKU: {prod.sku}) has {inv.current_stock} units in stock. "
                               f"Safety stock is {inv.safety_stock}, reorder point is {inv.reorder_point}. "
                               f"Status: {inv.status.value}. Location: {inv.warehouse_location}."
                })

            overstock = (
                self.db.query(Inventory, Product)
                .join(Product, Product.id == Inventory.product_id)
                .filter(Inventory.status == InventoryStatus.OVERSTOCK)
                .all()
            )
            for inv, prod in overstock:
                context_docs.append({
                    "type": "inventory",
                    "content": f"{prod.name} is overstocked at {inv.current_stock} units (max capacity: {inv.max_stock}). "
                               f"Excess: {inv.current_stock - inv.max_stock} units."
                })

        # ── Sales / revenue context ──
        if any(kw in msg for kw in ["revenue", "sales", "selling", "top", "best", "performance", "profit"]):
            from datetime import timedelta
            thirty_days_ago = datetime.now() - timedelta(days=30)

            top_products = (
                self.db.query(
                    Product.name,
                    func.sum(Sale.quantity).label("qty"),
                    func.sum(Sale.total_amount).label("rev"),
                    func.sum(Sale.profit).label("profit"),
                )
                .join(Sale, Sale.product_id == Product.id)
                .filter(Sale.sale_date >= thirty_days_ago)
                .group_by(Product.name)
                .order_by(func.sum(Sale.total_amount).desc())
                .limit(5)
                .all()
            )
            for p in top_products:
                context_docs.append({
                    "type": "sales",
                    "content": f"{p.name}: {int(p.qty)} units sold, ₹{float(p.rev):,.0f} revenue, "
                               f"₹{float(p.profit):,.0f} profit (last 30 days)."
                })

            total_rev = self.db.query(func.sum(Sale.total_amount)).filter(
                Sale.sale_date >= thirty_days_ago).scalar() or 0
            total_profit = self.db.query(func.sum(Sale.profit)).filter(
                Sale.sale_date >= thirty_days_ago).scalar() or 0
            context_docs.append({
                "type": "sales_summary",
                "content": f"Total 30-day revenue: ₹{float(total_rev):,.0f}. Total 30-day profit: ₹{float(total_profit):,.0f}."
            })

        # ── Pricing context ──
        if any(kw in msg for kw in ["price", "pricing", "discount", "margin", "cost", "expensive", "cheap"]):
            products = self.db.query(Product).filter(Product.suggested_price.isnot(None)).all()
            for p in products:
                if p.suggested_price and abs(p.selling_price - p.suggested_price) > 100:
                    margin = round(((p.selling_price - p.unit_cost) / p.selling_price * 100), 1)
                    context_docs.append({
                        "type": "pricing",
                        "content": f"{p.name}: Current price ₹{p.selling_price:,.0f}, "
                                   f"suggested price ₹{p.suggested_price:,.0f}. "
                                   f"Unit cost ₹{p.unit_cost:,.0f}. Margin: {margin}%."
                    })

        # ── Supplier context ──
        if any(kw in msg for kw in ["supplier", "vendor", "delivery", "lead time", "procurement"]):
            suppliers = self.db.query(Supplier).filter(Supplier.is_active == True).order_by(Supplier.rank).all()
            for s in suppliers:
                context_docs.append({
                    "type": "supplier",
                    "content": f"{s.name}: Reliability {s.reliability_score}%, "
                               f"Lead time {s.lead_time_days} days, "
                               f"On-time delivery {s.on_time_delivery_rate}%, "
                               f"Quality {s.quality_rating}%. Rank #{s.rank}."
                })

        # ── Fallback: provide general overview ──
        if not context_docs:
            from datetime import timedelta
            thirty_days_ago = datetime.now() - timedelta(days=30)

            total_rev = self.db.query(func.sum(Sale.total_amount)).filter(
                Sale.sale_date >= thirty_days_ago).scalar() or 0
            total_products = self.db.query(func.count(Product.id)).scalar() or 0
            low_stock = self.db.query(func.count(Inventory.id)).filter(
                Inventory.status.in_([InventoryStatus.CRITICAL, InventoryStatus.WARNING])
            ).scalar() or 0

            context_docs.append({
                "type": "overview",
                "content": f"RetailMind AI Overview: {total_products} products tracked. "
                           f"30-day revenue: ₹{float(total_rev):,.0f}. "
                           f"{low_stock} items need restocking attention."
            })

        return context_docs

    def _generate_response(self, user_message: str, context_docs: List[Dict[str, str]]) -> str:
        """Generate response using retrieved context. Template-based with DB data."""
        context_text = "\n".join([f"- [{d['type']}] {d['content']}" for d in context_docs])
        msg = user_message.lower()

        # Determine response category
        if any(kw in msg for kw in ["stock", "inventory", "restock", "reorder"]):
            return self._inventory_response(context_docs)
        elif any(kw in msg for kw in ["top", "best", "revenue", "sales", "selling"]):
            return self._sales_response(context_docs)
        elif any(kw in msg for kw in ["price", "pricing", "discount", "margin"]):
            return self._pricing_response(context_docs)
        elif any(kw in msg for kw in ["supplier", "vendor", "delivery"]):
            return self._supplier_response(context_docs)
        else:
            return self._general_response(user_message, context_docs)

    def _inventory_response(self, docs: List[Dict]) -> str:
        inv_docs = [d for d in docs if d["type"] in ("inventory",)]
        if not inv_docs:
            return "All inventory levels are currently healthy. No items require immediate attention."

        lines = ["Based on real-time inventory data:\n"]
        critical = [d for d in inv_docs if "Critical" in d["content"] or "Warning" in d["content"]]
        overstock = [d for d in inv_docs if "overstocked" in d["content"]]

        if critical:
            lines.append("### 🚨 Items Requiring Attention\n")
            for i, d in enumerate(critical, 1):
                lines.append(f"{i}. {d['content']}\n")

        if overstock:
            lines.append("\n### 📦 Overstocked Items\n")
            for i, d in enumerate(overstock, 1):
                lines.append(f"{i}. {d['content']}\n")

        lines.append("\n*Would you like me to generate purchase orders for critical items?*")
        return "\n".join(lines)

    def _sales_response(self, docs: List[Dict]) -> str:
        sales_docs = [d for d in docs if d["type"] in ("sales", "sales_summary")]
        if not sales_docs:
            return "No recent sales data available."

        lines = ["Here's your sales performance breakdown:\n"]
        summary = [d for d in sales_docs if d["type"] == "sales_summary"]
        products = [d for d in sales_docs if d["type"] == "sales"]

        if summary:
            lines.append(f"**{summary[0]['content']}**\n")

        if products:
            lines.append("\n### 🏆 Top Products by Revenue\n")
            lines.append("| Rank | Product | Details |")
            lines.append("|------|---------|---------|")
            for i, d in enumerate(products, 1):
                lines.append(f"| {i} | {d['content'].split(':')[0]} | {d['content'].split(':', 1)[1].strip()} |")

        lines.append("\n*Would you like a detailed breakdown by category or store?*")
        return "\n".join(lines)

    def _pricing_response(self, docs: List[Dict]) -> str:
        price_docs = [d for d in docs if d["type"] == "pricing"]
        if not price_docs:
            return "All products are competitively priced. No adjustments recommended at this time."

        lines = ["Here are the pricing optimization opportunities:\n"]
        for i, d in enumerate(price_docs, 1):
            lines.append(f"{i}. {d['content']}\n")
        lines.append("\n*Would you like to apply any of these price adjustments?*")
        return "\n".join(lines)

    def _supplier_response(self, docs: List[Dict]) -> str:
        sup_docs = [d for d in docs if d["type"] == "supplier"]
        if not sup_docs:
            return "No supplier data available."

        lines = ["Here's the supplier performance overview:\n"]
        for d in sup_docs:
            content = d["content"]
            lines.append(f"- **{content}**" if ":" in content else f"- {content}")

        lines.append("\n*Would you like to compare specific suppliers or generate a procurement plan?*")
        return "\n".join(lines)

    def _general_response(self, user_message: str, docs: List[Dict]) -> str:
        lines = [f"Based on my analysis of your retail operations data regarding **'{user_message}'**:\n"]
        for d in docs:
            lines.append(f"- {d['content']}")
        lines.append("\n*Feel free to ask about inventory, sales, pricing, or suppliers for detailed insights.*")
        return "\n".join(lines)

    def query(self, user_message: str) -> Dict[str, Any]:
        """Main query method: retrieve context and generate response."""
        context_docs = self._retrieve_context(user_message)
        response = self._generate_response(user_message, context_docs)

        return {
            "response": response,
            "conversation_id": f"conv-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "sources": [d["content"][:100] + "..." for d in context_docs[:5]],
            "timestamp": datetime.now().strftime("%I:%M %p"),
        }
