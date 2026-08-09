"""
Standalone seed runner — run this directly with:
  python run_seed.py
from inside the backend directory (no -m flag needed).
"""
import sys
import os

# Make sure 'app' package is on the path
sys.path.insert(0, os.path.dirname(__file__))

from app.seed import seed

if __name__ == "__main__":
    print("🚀 Starting RetailMind AI database seed...")
    seed(force=True)
    print("✅ Done!")
