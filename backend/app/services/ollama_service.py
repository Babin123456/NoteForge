import httpx
import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, default_model: str = settings.DEFAULT_MODEL):
        self.base_url = base_url.rstrip('/')
        self.default_model = default_model

    async def check_health(self) -> Dict[str, Any]:
        """Check if local Ollama server is running and reachable."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/version")
                if res.status_code == 200:
                    data = res.json()
                    return {"status": "connected", "version": data.get("version"), "base_url": self.base_url}
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
        return {"status": "disconnected", "version": None, "base_url": self.base_url}

    async def list_models(self) -> List[Dict[str, Any]]:
        """List locally available models in Ollama."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return data.get("models", [])
        except Exception as e:
            logger.warning(f"Failed to list Ollama models: {e}")
        return []

    async def generate_completion(self, prompt: str, system_prompt: str = "", model: Optional[str] = None, format_json: bool = True) -> str:
        """
        Calls Ollama generate endpoint with optional JSON format enforcement.
        """
        active_model = model or self.default_model
        payload = {
            "model": active_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.2, # Low temperature for accurate, grounded educational content
                "num_ctx": 4096
            }
        }
        if format_json:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            res = await client.post(f"{self.base_url}/api/generate", json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Ollama generation failed ({res.status_code}): {res.text}")
            result_json = res.json()
            return result_json.get("response", "")

    def extract_and_parse_json(self, raw_text: str) -> Any:
        """
        Safely extracts JSON from model response even if surrounded by markdown fences.
        """
        text = raw_text.strip()
        # Remove markdown codeblocks if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback regex search for json block
            match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            raise ValueError(f"Failed to parse valid JSON from AI response: {text[:200]}...")

ollama_client = OllamaClient()
