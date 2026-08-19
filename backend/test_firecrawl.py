import os
from dotenv import load_dotenv
from firecrawl import FirecrawlApp

load_dotenv()
api_key = os.getenv("FIRECRAWL_API_KEY")
try:
    app = FirecrawlApp(api_key=api_key)
    response = app.scrape("https://example.com", formats=['html'])
    print(dir(response))
    if hasattr(response, 'html'):
        print(type(response.html))
        print(response.html[:100])
except Exception as e:
    print(f"Error occurred: {e}")
