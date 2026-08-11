"""
Kaggle Dataset Loader for RetailMind AI.
Downloads and parses 'ahmdayman/retail-sales-dataset' and 'shahnawaj9/online-retail' datasets via kagglehub.
"""
import os
import glob
import random
import logging

logger = logging.getLogger("retailmind")

KAGGLE_DATASETS = [
    "ahmdayman/retail-sales-dataset",
    "shahnawaj9/online-retail"
]

def download_kaggle_dataset(dataset_handle: str = "ahmdayman/retail-sales-dataset") -> str | None:
    """Download specified Kaggle dataset using kagglehub."""
    try:
        import kagglehub
        logger.info(f"⏬ Downloading Kaggle dataset '{dataset_handle}'...")
        path = kagglehub.dataset_download(dataset_handle)
        logger.info(f"✅ Kaggle dataset downloaded to: {path}")
        return path
    except Exception as e:
        logger.warning(f"⚠️ Could not download Kaggle dataset '{dataset_handle}' via kagglehub: {e}")
        return None

def load_kaggle_products_and_sales(max_items: int = 50, dataset_handle: str = "ahmdayman/retail-sales-dataset"):
    """
    Parses the downloaded Kaggle dataset and extracts structured product & sales records.
    Checks local bundled data first, then falls back to Kaggle download.
    """
    # ── 1. Check for bundled local dataset first ──────────────────────────
    import pathlib
    local_data_dir = pathlib.Path(__file__).parent.parent / "data"
    local_csv_files = list(local_data_dir.glob("*.csv")) + list(local_data_dir.glob("*.xlsx")) if local_data_dir.exists() else []
    
    if local_csv_files:
        logger.info(f"📂 Found local dataset: {local_csv_files[0]}")
        return _parse_dataset_file(str(local_csv_files[0]), max_items)

    # ── 2. Try Kaggle download ────────────────────────────────────────────
    path = download_kaggle_dataset(dataset_handle)
    if not path and dataset_handle != "shahnawaj9/online-retail":
        path = download_kaggle_dataset("shahnawaj9/online-retail")

    if not path or not os.path.exists(path):
        return None, None

    dataset_files = glob.glob(os.path.join(path, "*.csv")) + glob.glob(os.path.join(path, "*.xlsx"))
    if not dataset_files:
        logger.warning(f"⚠️ No CSV/XLSX dataset files found in {path}")
        return None, None

    return _parse_dataset_file(dataset_files[0], max_items)


def _parse_dataset_file(target_file: str, max_items: int = 50):

    try:
        import pandas as pd
        if target_file.endswith('.xlsx'):
            df = pd.read_excel(target_file, nrows=max_items * 10)
        else:
            df = pd.read_csv(target_file, encoding='ISO-8859-1', nrows=max_items * 10)

        # Standardize column names (case-insensitive)
        cols_lower = {c.lower().replace(' ', '_'): c for c in df.columns}
        
        # Check for ahmdayman/retail-sales-dataset specific columns
        cat_col = cols_lower.get('product_category', cols_lower.get('category', None))
        price_col = cols_lower.get('price_per_unit', cols_lower.get('unitprice', cols_lower.get('price', cols_lower.get('unit_price', None))))
        desc_col = cols_lower.get('description', cols_lower.get('item_name', cat_col))
        sku_col = cols_lower.get('transaction_id', cols_lower.get('stockcode', cols_lower.get('sku', cols_lower.get('product_id', None))))
        qty_col = cols_lower.get('quantity', cols_lower.get('qty', None))

        if not price_col:
            logger.warning(f"⚠️ Could not find expected price column in {df.columns}")
            return None, None

        # Filter valid records
        df = df.dropna(subset=[price_col])
        if qty_col and qty_col in df.columns:
            df = df[df[qty_col] > 0]
        df = df[df[price_col] > 0]

        extracted_products = []
        if cat_col and cat_col in df.columns:
            # Format from ahmdayman/retail-sales-dataset
            grouped = df.groupby(cat_col).first().reset_index()
            categories_found = grouped[cat_col].tolist()
            
            # Expand into items per category
            for i, row in enumerate(df.head(max_items).itertuples()):
                cat_attr = cat_col.replace(' ', '_')
                sku_attr = sku_col.replace(' ', '_') if sku_col else None
                price_attr = price_col.replace(' ', '_')
                c_name = str(getattr(row, cat_attr, 'Retail Goods')).strip().title()
                price_val = float(getattr(row, price_attr, 49.99) or 49.99)
                
                selling_price = round(price_val * 85 if price_val < 500 else price_val, 2)
                unit_cost = round(selling_price * 0.70, 2)
                suggested_price = round(selling_price * 0.95, 2)
                
                t_id = str(getattr(row, sku_attr, f'TXN-{1000 + i}')).strip() if sku_attr else f"TXN-{1000 + i}"
                # Realistic Product Name Catalog per Category
                CATALOG = {
                    "Electronics": [
                        "Gaming Laptop Pro X1", "UltraBook Elite 15", "WorkStation Pro Max 27\"",
                        "Budget Chromebook 14", "Desktop All-in-One PC", "4K Monitor UHD 32\"",
                        "Mechanical Gaming Keyboard RGB", "Wireless Mouse Elite", "USB-C Hub 7-in-1",
                        "Noise Cancelling Headset Pro", "Webcam 4K AutoFocus", "NVMe SSD 1TB High-Speed",
                        "External HDD 2TB Portable", "Smart LED Desk Lamp", "Laptop Stand Ergonomic"
                    ],
                    "Clothing": [
                        "Men's Slim Fit Denim Jacket", "Women's Designer Cotton Saree", "Casual Polo T-Shirt Pack",
                        "Athletic Running Shoes Pro", "Leather Bifold Wallet Classic", "Sports Zip-Up Hoodie",
                        "Designer Silk Scarf", "Winter Fleece Jacket", "Formal Leather Shoes"
                    ],
                    "Beauty": [
                        "Organic Skin Revitalizing Serum", "Matte Finish Liquid Lipstick Set",
                        "Hydrating Herbal Face Cream", "Vitamin C Brightening Facial Wash", "Luxury Botanical Perfume 100ml",
                        "Argan Oil Hair Treatment", "Exfoliating Scrub Lotion"
                    ],
                    "Home & Decor": [
                        "White Hanging Heart T-Light Holder", "Heart Of Wicker Basket Small",
                        "Smart LED Ambient Light Strip", "Ergonomic Memory Foam Pillow", "Ceramic Decorative Vase Set"
                    ],
                    "Kitchen & Dining": [
                        "Regency Cakestand 3 Tier", "Set 3 Retrospot Tea Tins", "Smart Electric Pressure Cooker",
                        "Stainless Steel Chef Knife Set", "Non-Stick Frying Pan 28cm"
                    ]
                }
                
                # Retrieve specific product name or cycle from catalog
                cat_items = CATALOG.get(c_name, CATALOG.get("Electronics", []))
                if cat_items:
                    item_name = cat_items[i % len(cat_items)]
                else:
                    MASTER = [
                        "Gaming Laptop Pro X1", "UltraBook Elite 15", "Mechanical Gaming Keyboard RGB",
                        "Wireless Mouse Elite", "4K Monitor UHD 32\"", "Noise Cancelling Headset Pro",
                        "NVMe SSD 1TB High-Speed", "Smart LED Desk Lamp", "Laptop Stand Ergonomic",
                        "Men's Slim Fit Denim Jacket", "Organic Skin Revitalizing Serum"
                    ]
                    item_name = MASTER[i % len(MASTER)]

                extracted_products.append({
                    "sku": f"RSD-{t_id}",
                    "name": item_name,
                    "category": c_name,
                    "unit_cost": unit_cost,
                    "selling_price": selling_price,
                    "suggested_price": suggested_price,
                    "min_price": round(unit_cost * 1.1, 2),
                    "max_price": round(selling_price * 1.3, 2),
                    "stock": random.randint(20, 400)
                })

        else:
            # Format from shahnawaj9/online-retail
            grouped = df.groupby(desc_col).first().reset_index()
            for i, row in enumerate(grouped.head(max_items).itertuples()):
                desc = str(getattr(row, desc_col)).strip().title()
                sku = str(getattr(row, sku_col)).strip() if sku_col and hasattr(row, sku_col) else f"KGL-{1000 + i}"
                price_val = float(getattr(row, price_col)) if hasattr(row, price_col) else 19.99
                
                selling_price = round(price_val * 85 if price_val < 500 else price_val, 2)
                unit_cost = round(selling_price * 0.70, 2)
                suggested_price = round(selling_price * 0.95, 2)
                
                desc_upper = desc.upper()
                if any(k in desc_upper for k in ['BAG', 'BOX', 'HOLDER', 'CASE', 'STORAGE']):
                    cat = "Storage & Organizers"
                elif any(k in desc_upper for k in ['LIGHT', 'LAMP', 'CANDLE', 'DECORATION', 'HEART']):
                    cat = "Home & Decor"
                elif any(k in desc_upper for k in ['MUG', 'CUP', 'PLATE', 'GLASS', 'BOWL', 'BOTTLE']):
                    cat = "Kitchen & Dining"
                elif any(k in desc_upper for k in ['PAPER', 'PENCIL', 'PEN', 'NOTEBOOK', 'CARD']):
                    cat = "Stationery & Craft"
                else:
                    cat = "Retail Consumer Goods"

                extracted_products.append({
                    "sku": sku,
                    "name": desc[:80],
                    "category": cat,
                    "unit_cost": unit_cost,
                    "selling_price": selling_price,
                    "suggested_price": suggested_price,
                    "min_price": round(unit_cost * 1.1, 2),
                    "max_price": round(selling_price * 1.3, 2),
                    "stock": random.randint(15, 350)
                })

        logger.info(f"✨ Successfully extracted {len(extracted_products)} products from dataset ({target_file})!")
        return extracted_products, df

    except Exception as e:
        logger.error(f"❌ Failed to parse Kaggle dataset: {e}")
        return None, None

