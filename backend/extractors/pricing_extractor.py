import re


def extract_pricing_data(html: str) -> list[dict]:
    """Extract pricing information from raw HTML using regex."""
    prices = []
    
    # Remove HTML tags to search plain text
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text)
    
    # Common price patterns: $99, $99.99, $99/mo, 99 USD
    price_patterns = [
        r'\$[\d,]+(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|yr|year))?',
        r'(?:USD|EUR|GBP)\s*[\d,]+(?:\.\d{2})?',
        r'€[\d,]+(?:\.\d{2})?',
        r'£[\d,]+(?:\.\d{2})?',
    ]
    
    for pattern in price_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            price_str = match.group(0)
            
            # Extract surrounding context (50 chars before and after)
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            context = text[start:end].strip()
            
            # Avoid duplicate prices
            if not any(p["amount"] == price_str for p in prices):
                prices.append({
                    "amount": price_str,
                    "context": context
                })
                
    return prices
