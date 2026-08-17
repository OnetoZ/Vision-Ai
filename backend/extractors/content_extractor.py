import re
from bs4 import BeautifulSoup


def extract_content_data(soup: BeautifulSoup) -> dict:
    """Extract main text content and statistics from HTML."""
    
    # Remove unwanted tags before extracting text
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside", "svg"]):
        tag.decompose()

    # Get raw text
    text = soup.get_text(separator=" ", strip=True)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Calculate word count
    words = text.split()
    word_count = len(words)
    
    # Extract paragraphs for context analysis
    paragraphs = []
    for p in soup.find_all("p"):
        p_text = p.get_text(strip=True)
        if len(p_text.split()) > 5:  # Ignore very short paragraphs
            paragraphs.append(p_text)
            
    return {
        "main_text": text,
        "word_count": word_count,
        "paragraphs": paragraphs,
        "paragraph_count": len(paragraphs)
    }
