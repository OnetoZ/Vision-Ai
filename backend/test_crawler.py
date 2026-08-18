import asyncio
from bs4 import BeautifulSoup
from crawler.fetcher import Fetcher
from extractors.content_extractor import extract_content_data

async def main():
    fetcher = Fetcher()
    print("Fetching page with Playwright...")
    html, content_type, status_code = await fetcher.fetch_with_playwright("https://example.com")
    print(f"Status: {status_code}, Length: {len(html)}")
    
    print("\nExtracting with Trafilatura...")
    soup = BeautifulSoup(html, "lxml")
    content = extract_content_data(soup, html=html)
    
    print(f"Word count: {content['word_count']}")
    print("Preview:")
    print(content['main_text'][:500])

if __name__ == "__main__":
    asyncio.run(main())
