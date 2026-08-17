"""
Qdrant-Powered Vector Search & Semantic RAG Engine.
Indexes unstructured retail business knowledge documents and policies into Qdrant.
Provides top-k semantic document retrieval for AI Chat & Decision Center.
"""
import os
import logging
import math
from typing import List, Dict, Any, Optional

logger = logging.getLogger("retailmind.rag.qdrant")

RETAIL_KNOWLEDGE_DOCS = [
    {
        "id": 1,
        "title": "Inventory Reorder Policy & Safety Stock Standard",
        "category": "Inventory Policy",
        "content": "Safety stock is maintained at 20% of peak monthly demand. Reorder points trigger automatically when stock falls below 1.2x safety stock level. Critical stock alerts require immediate Purchase Order generation to rank #1 primary supplier."
    },
    {
        "id": 2,
        "title": "Pricing Elasticity & Margin Safeguard Guidelines",
        "category": "Pricing Policy",
        "content": "All retail price adjustments must maintain a minimum 20% gross margin protection guardrail (selling_price >= 1.25 * unit_cost). Price matches on competitor channels (Amazon, Flipkart) are recommended if margin permits and competitor price is >5% lower."
    },
    {
        "id": 3,
        "title": "Supplier SLA & Multi-Criteria Vendor Scoring (MCDA)",
        "category": "Supplier Policy",
        "content": "Active suppliers are evaluated quarterly across On-Time Delivery (40% weight), Quality Score (30% weight), Lead Time SLA (20% weight), and Cost Index (10% weight). Vendors falling below 90% OTD are flagged for lead-time audit."
    },
    {
        "id": 4,
        "title": "Clearance & Markdown Strategy for Overstocked Inventory",
        "category": "Merchandising Policy",
        "content": "Overstock items (current_stock > max_stock capacity for 30+ consecutive days) trigger progressive markdown discounts: 10% for minor overstock, 20% for 1.5x capacity, and 30% for deadstock clearance."
    },
    {
        "id": 5,
        "title": "Demand Forecast Model Specification (XGBoost)",
        "category": "Analytics Policy",
        "content": "Demand forecasting combines historical daily sales, day-of-week seasonality, rolling 7-day and 30-day moving averages, and Indian retail festival multipliers (Diwali +45%, Year-end +35%, Republic Day +15%)."
    }
]


class QdrantRAGEngine:
    """
    Qdrant Vector Database Engine.
    Handles embedding generation, vector indexing, and semantic similarity retrieval.
    """

    def __init__(self):
        self.client = None
        self.vector_dim = 64
        self.collection_name = "retail_knowledge"
        self._init_qdrant()

    def _embed_text(self, text: str) -> List[float]:
        """
        Semantic vector embedding generator (dimension 64).
        Combines domain vocabulary term weights, n-gram hashing, and L2 normalization.
        """
        domain_weights: Dict[str, int] = {
            "inventory": 2, "reorder": 5, "safety": 8, "stock": 11, "warehouse": 14,
            "pricing": 17, "margin": 20, "elasticity": 23, "competitor": 26, "discount": 29,
            "supplier": 32, "vendor": 35, "lead": 38, "delivery": 41, "sla": 44,
            "demand": 47, "forecast": 50, "xgboost": 53, "seasonality": 56, "festival": 59,
            "clearance": 61, "markdown": 62, "policy": 63,
        }
        
        words = text.lower().split()
        vec = [0.0] * self.vector_dim
        
        for w in words:
            clean_w = ''.join(c for c in w if c.isalnum())
            if not clean_w:
                continue
            if clean_w in domain_weights:
                slot = domain_weights[clean_w] % self.vector_dim
                vec[slot] += 3.5
            # Character n-gram projection
            for i, ch in enumerate(clean_w):
                idx = (ord(ch) * 17 + i * 3) % self.vector_dim
                vec[idx] += 0.25
        
        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / norm, 4) for x in vec]

    def _init_qdrant(self):
        """Initializes Qdrant client and indexes retail knowledge docs."""
        try:
            from qdrant_client import QdrantClient  # type: ignore
            from qdrant_client.models import Distance, VectorParams, PointStruct  # type: ignore

            self.client = QdrantClient(":memory:")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.vector_dim, distance=Distance.COSINE),
            )

            points = []
            for doc in RETAIL_KNOWLEDGE_DOCS:
                vec = self._embed_text(doc["title"] + " " + doc["content"])
                points.append(
                    PointStruct(
                        id=doc["id"],
                        vector=vec,
                        payload=doc
                    )
                )

            self.client.upsert(collection_name=self.collection_name, points=points)
            logger.info(f"✨ Successfully indexed {len(points)} knowledge documents into Qdrant Vector Store!")
        except Exception as e:
            logger.warning(f"Qdrant vector store initialization note: {e}")
            self.client = None

    def search_knowledge(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Performs top-k vector similarity retrieval for query."""
        if self.client:
            try:
                query_vector = self._embed_text(query)
                results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    limit=top_k
                )
                return [res.payload for res in results if res.payload]
            except Exception as e:
                logger.error(f"Qdrant search error: {e}")

        # Fallback keyword matching over knowledge docs
        q_lower = query.lower()
        matches = []
        for doc in RETAIL_KNOWLEDGE_DOCS:
            if any(term in q_lower for term in doc["content"].lower().split()):
                matches.append(doc)
        return matches[:top_k] if matches else RETAIL_KNOWLEDGE_DOCS[:top_k]


qdrant_rag_engine = QdrantRAGEngine()
