import re
import json
from bs4 import BeautifulSoup
import google.generativeai as genai
from config import get_settings

def extract_pricing_data(html: str) -> list[dict]:
    """Extract pricing information from raw HTML using Gemini."""
    settings = get_settings()
    if not settings.GOOGLE_API_KEY:
        return []
        
    try:
        # Strip html to reduce tokens
        soup = BeautifulSoup(html, "lxml")
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
        text = soup.get_text(separator=' ', strip=True)
        # Take first 10k chars to avoid limits
        text = text[:10000]
        
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')
        
        prompt = f"""
        Extract the pricing plans from the following text extracted from a competitor's website.
        Identify the plan names and their prices, features, and limits.
        
        Respond ONLY with a valid JSON array of objects. Do not use markdown blocks like ```json.
        Each object must have:
        - "plan_name": string (the name of the plan/service)
        - "price": number (just the numeric value, e.g. 5000)
        - "currency": string (the currency symbol, e.g. "₹" or "$")
        - "billing_period": string (e.g. "monthly", "annual", "one-time", "custom")
        - "features": ["string"] (list of features included)
        - "limits": ["string"] (list of limits or restrictions)
        - "target_customer": string (who this plan is for)
        - "cta": string (the call to action text, e.g. "Buy Now", "Contact Sales")
        - "pricing_type": string (either "public", "contact_sales", or "not_public")
        
        If a plan says "Contact Sales", set pricing_type to "contact_sales" and price to null.
        
        Text to analyze:
        {text}
        """
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        prices = json.loads(response_text)
        if not isinstance(prices, list):
            prices = [prices]
            
        return prices
    except Exception as e:
        print(f"Gemini pricing extraction failed: {e}")
        return []

