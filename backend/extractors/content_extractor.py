import re
import trafilatura
from bs4 import BeautifulSoup


def extract_content_data(soup: BeautifulSoup, html: str | None = None) -> dict:
    """Extract main text content and statistics using Trafilatura."""
    
    main_text = ""
    if html:
        extracted = trafilatura.extract(html, include_links=True, include_images=False)
        if extracted:
            main_text = extracted

    if not main_text:
        # Fallback to BeautifulSoup if Trafilatura fails or html not provided
        # Remove unwanted tags before extracting text
        soup_copy = BeautifulSoup(str(soup), "lxml")
        for tag in soup_copy(["script", "style", "noscript", "header", "footer", "nav", "aside", "svg"]):
            tag.decompose()

        # Get raw text
        text = soup_copy.get_text(separator=" ", strip=True)
        # Clean up whitespace
        main_text = re.sub(r'\s+', ' ', text).strip()
    
    # Calculate word count
    words = main_text.split()
    word_count = len(words)
    
    # Extract paragraphs for context analysis
    paragraphs = []
    for p in soup.find_all("p"):
        p_text = p.get_text(strip=True)
        if len(p_text.split()) > 5:  # Ignore very short paragraphs
            paragraphs.append(p_text)
            
    return {
        "main_text": main_text,
        "word_count": word_count,
        "paragraphs": paragraphs,
        "paragraph_count": len(paragraphs)
    }
