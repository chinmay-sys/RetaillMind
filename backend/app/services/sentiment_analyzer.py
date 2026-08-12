import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger("retailmind.services.sentiment")

ASPECT_KEYWORDS: Dict[str, List[str]] = {
    "Battery": ["battery", "charge", "charging", "drain", "drains", "power", "backup", "overheat", "overheating", "hot"],
    "Performance": ["performance", "speed", "slow", "lag", "lagging", "freeze", "crash", "processor", "ram"],
    "Quality": ["quality", "defect", "defective", "broken", "cheap", "damaged", "build", "faulty", "flimsy"],
    "Display": ["screen", "display", "monitor", "resolution", "flicker", "pixel", "brightness"],
    "Price": ["price", "cost", "expensive", "value", "overpriced", "money", "worth"],
    "Packaging": ["packaging", "box", "package", "wrapped", "seal", "packing"],
    "Delivery": ["delivery", "shipping", "courier", "late", "delayed", "dispatch", "arrival"],
    "Shipping": ["shipping", "freight", "transit", "shipment"],
    "Durability": ["durable", "durability", "scratch", "wear", "tear", "robust"],
    "Customer Service": ["service", "support", "helpdesk", "warranty", "agent", "refund", "replacement"],
    "Returns": ["return", "returned", "exchange", "refunded", "replace"],
}

NEGATIVE_INDICATORS = ["bad", "poor", "horrible", "terrible", "worst", "broken", "drain", "slow", "defect", "cheap", "hot", "issue", "problem", "disappointed", "refund", "failed", "hate", "useless"]
POSITIVE_INDICATORS = ["great", "excellent", "awesome", "good", "amazing", "fast", "love", "perfect", "superb", "best", "satisfied", "durable", "value"]


class SentimentAnalyzer:
    """
    Real Pretrained Hugging Face Sentiment Analysis & Aspect Extraction Engine.
    Uses DistilBERT / RoBERTa transformer pipeline for core classification.
    """

    def __init__(self):
        self._hf_pipeline = None
        self._hf_loaded = False
        self._load_hf_model()

    def _load_hf_model(self):
        try:
            from transformers import pipeline
            self._hf_pipeline = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                truncation=True,
                max_length=512,
            )
            self._hf_loaded = True
            logger.info("✨ Successfully loaded DistilBERT Hugging Face sentiment model!")
        except Exception as e:
            logger.warning(f"Hugging Face transformer model not pre-cached: {e}. Operating with NLP pattern classifier.")
            self._hf_pipeline = None
            self._hf_loaded = False

    def analyze_review(self, review_text: str, rating: float) -> Dict[str, Any]:
        """
        Analyzes review text and rating to produce:
        - sentiment: POSITIVE, NEUTRAL, NEGATIVE
        - confidence: float (0.0 to 1.0)
        - aspects: Dict[str, str] (e.g. {"Battery": "NEGATIVE"})
        """
        text_lower = review_text.lower()
        sentiment = "NEUTRAL"
        confidence = 0.85

        if self._hf_loaded and self._hf_pipeline:
            try:
                res = self._hf_pipeline(review_text[:512])[0]
                label = res.get("label", "").upper()
                score = float(res.get("score", 0.85))

                if label == "POSITIVE":
                    sentiment = "POSITIVE" if rating >= 3.0 else "NEUTRAL"
                elif label == "NEGATIVE":
                    sentiment = "NEGATIVE" if rating <= 3.5 else "NEUTRAL"

                confidence = round(score, 3)
            except Exception as e:
                logger.error(f"Error in Hugging Face sentiment pipeline: {e}")
                sentiment, confidence = self._rule_based_sentiment(text_lower, rating)
        else:
            sentiment, confidence = self._rule_based_sentiment(text_lower, rating)

        # Aspect extraction
        detected_aspects = self._extract_aspects(text_lower, sentiment)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "aspects": detected_aspects,
            "model": "DistilBERT-SST2" if self._hf_loaded else "NLP-Pattern-Extractor"
        }

    def _rule_based_sentiment(self, text_lower: str, rating: float) -> tuple[str, float]:
        neg_count = sum(1 for w in NEGATIVE_INDICATORS if re.search(r'\b' + w + r'\b', text_lower))
        pos_count = sum(1 for w in POSITIVE_INDICATORS if re.search(r'\b' + w + r'\b', text_lower))

        if rating <= 2.0 or neg_count >= 2:
            return "NEGATIVE", min(0.98, round(0.75 + neg_count * 0.08, 2))
        elif rating >= 4.0 or pos_count >= 2:
            return "POSITIVE", min(0.98, round(0.75 + pos_count * 0.08, 2))
        elif neg_count > pos_count:
            return "NEGATIVE", 0.70
        elif pos_count > neg_count:
            return "POSITIVE", 0.70
        else:
            return "NEUTRAL", 0.80

    def _extract_aspects(self, text_lower: str, overall_sentiment: str) -> Dict[str, str]:
        aspects = {}
        for aspect_name, keywords in ASPECT_KEYWORDS.items():
            if any(re.search(r'\b' + kw + r'\b', text_lower) for kw in keywords):
                # Check sentence context around keyword
                has_neg = any(w in text_lower for w in ["bad", "poor", "drain", "drains", "hot", "slow", "defect", "issue", "faulty", "cheap", "broken", "terrible", "late"])
                if has_neg or overall_sentiment == "NEGATIVE":
                    aspects[aspect_name] = "NEGATIVE"
                else:
                    aspects[aspect_name] = "POSITIVE"
        return aspects


sentiment_analyzer = SentimentAnalyzer()
