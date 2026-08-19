import json
import logging
from bs4 import BeautifulSoup
import google.generativeai as genai
from config import get_settings

logger = logging.getLogger(__name__)

def extract_company_intelligence(html: str, source_url: str) -> dict:
    """
    Extract structured company intelligence using Gemini from raw HTML text.
    Returns a dictionary containing Company Profile, Services, Solutions, and Products.
    """
    settings = get_settings()
    if not settings.GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set. Cannot run AI extraction.")
        return {}

    try:
        # Strip HTML to reduce tokens
        soup = BeautifulSoup(html, "lxml")
        for script in soup(["script", "style", "nav", "footer"]): # Remove noisy tags
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        # Limit to 30k characters to fit within a fast Gemini flash context comfortably without timing out
        text = text[:30000]

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')
        
        prompt = f"""
        You are a top-tier business intelligence analyst. Your job is to analyze the following extracted website text
        and construct a deeply structured JSON profile of the company. Do not hallucinate or guess. If information is not 
        publicly available, use null or an empty list.

        Analyze the text and return a JSON object exactly matching this schema:
        {{
          "brand_name": "String",
          "legal_name": "String",
          "industry": "String",
          "business_type": "String (e.g., B2B SaaS, Agency, E-commerce)",
          "country": "String",
          "primary_market": "String",
          "description": "String",
          "tagline": "String",
          "value_proposition": "String",
          "business_model": "String",
          "target_customers": ["String", "String"],
          "target_industries": ["String"],
          "primary_problems_solved": ["String"],
          "business_categories": ["String"],
          "products": [
            {{
               "name": "String",
               "category": "String",
               "description": "String",
               "features": ["String"],
               "benefits": ["String"]
            }}
          ],
          "services": [
            {{
               "name": "String",
               "description": "String",
               "target_customer": "String",
               "features": ["String"]
            }}
          ],
          "solutions": [
            {{
               "name": "String",
               "problem_solved": "String",
               "target_industry": "String",
               "features": ["String"]
            }}
          ]
        }}
        
        CRITICAL: Respond ONLY with the JSON. No markdown blocks, no introduction.
        
        TEXT TO ANALYZE:
        {text}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text.strip())
        data["source_url"] = source_url
        return data

    except Exception as e:
        logger.error(f"Failed to extract intelligence: {e}")
        return {}
