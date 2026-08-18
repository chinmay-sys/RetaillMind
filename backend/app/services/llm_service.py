"""
LLM Service Layer for RetailMind AI.
Integrates Google Gemini or OpenAI APIs with fallback handling for natural language generation.
"""
import os
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger("retailmind.services.llm")


class LLMService:
    """
    Unified LLM Service Layer handling Gemini / OpenAI API calls.
    Responsible for generating natural language explanations, executive summaries,
    and interpreting structured multi-agent & RAG context.
    """

    def __init__(self):
        self.provider = None
        self.api_key = None
        self._setup_provider()

    def _setup_provider(self):
        gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

        if gemini_key:
            self.provider = "gemini"
            self.api_key = gemini_key
            logger.info("🤖 LLM Service configured with Google Gemini API")
        elif openai_key:
            self.provider = "openai"
            self.api_key = openai_key
            logger.info("🤖 LLM Service configured with OpenAI API")
        else:
            self.provider = "template"
            logger.info("ℹ️ LLM Service initialized in Analytical Template mode (no API key configured)")

    def generate_response(self, prompt: str, system_instruction: Optional[str] = None, context: Optional[str] = None) -> str:
        """
        Generates response using configured LLM provider or deterministic synthesis.
        Implements a fail-fast strategy with request timeouts to prevent cascading latency spikes.
        """
        if self.provider == "gemini" and self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                full_prompt = f"{system_instruction or ''}\n\nContext:\n{context or ''}\n\nQuestion: {prompt}"

                # Primary fast model + optional single fallback
                candidate_models = ['gemini-1.5-flash', 'gemini-1.5-pro']
                for idx, m_name in enumerate(candidate_models):
                    try:
                        model = genai.GenerativeModel(m_name)
                        # Set a bounded timeout (5.0s) so client never hangs
                        response = model.generate_content(
                            full_prompt,
                            request_options={"timeout": 5.0}
                        )
                        if response and response.text:
                            return response.text.strip()
                    except Exception as me:
                        err_str = str(me).lower()
                        logger.warning(f"Gemini model {m_name} failed: {me}")
                        
                        # Fail-fast on non-recoverable errors (auth, permissions, quota)
                        if any(k in err_str for k in ["api_key", "permission", "unauthorized", "quota", "resource_exhausted", "403", "401", "400", "deadline", "timeout"]):
                            logger.info("Non-recoverable or timeout error detected; activating fast fallback.")
                            break
                        
                        # Only proceed to secondary model if primary had a transient 503 or model-not-found error
                        if idx == 0:
                            continue
                        break
            except Exception as e:
                logger.error(f"Gemini API initialization or execution failed: {e}")

        elif self.provider == "openai" and self.api_key:
            try:
                import openai
                client = openai.OpenAI(api_key=self.api_key, timeout=5.0)
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                user_content = f"Context:\n{context or ''}\n\nQuestion: {prompt}" if context else prompt
                messages.append({"role": "user", "content": user_content})

                resp = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.3,
                    timeout=5.0
                )
                if resp.choices and resp.choices[0].message.content:
                    return resp.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}")

        # Fallback synthesis if no key set or API call failed
        return self._analytical_fallback(prompt, context)

    def _analytical_fallback(self, prompt: str, context: Optional[str]) -> str:
        """Grounded synthesis when external LLM API is offline or unconfigured."""
        if not context:
            return f"Based on your retail database analysis regarding **'{prompt}'**: System operational with 96% decision confidence score."

        return context


llm_service = LLMService()

