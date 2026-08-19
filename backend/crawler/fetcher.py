"""Async HTTP fetcher with rate limiting."""
import asyncio
import time
import httpx
from playwright.async_api import async_playwright
try:
    from firecrawl import FirecrawlApp
except ImportError:
    FirecrawlApp = None
from config import get_settings

settings = get_settings()


class Fetcher:
    """Async HTTP fetcher with configurable rate limiting and timeouts."""

    def __init__(self, delay: float | None = None, user_agent: str | None = None):
        self.delay = delay or settings.CRAWL_DELAY_SECONDS
        self.user_agent = user_agent or settings.USER_AGENT
        self._last_request_time: float = 0
        self._lock = asyncio.Lock()

    async def fetch(self, url: str, client: httpx.AsyncClient) -> httpx.Response | None:
        """Fetch a URL with rate limiting. Returns None on error."""
        async with self._lock:
            # Respect crawl delay
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self.delay:
                await asyncio.sleep(self.delay - elapsed)
            self._last_request_time = time.monotonic()

        try:
            response = await client.get(
                url,
                timeout=20.0,
                follow_redirects=True,
                headers={
                    "User-Agent": self.user_agent,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                },
            )
            return response
        except httpx.TimeoutException:
            return None
        except httpx.ConnectError:
            return None
        except Exception:
            return None

    def create_client(self) -> httpx.AsyncClient:
        """Create an httpx async client with proper settings."""
        return httpx.AsyncClient(
            follow_redirects=True,
            timeout=httpx.Timeout(20.0, connect=10.0),
            limits=httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
            ),
            headers={
                "User-Agent": self.user_agent,
            },
        )

    async def fetch_with_playwright(self, url: str) -> tuple[str, str, int]:
        """Fetch a URL using Playwright. Returns (html, content_type, status_code)."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self.delay:
                await asyncio.sleep(self.delay - elapsed)
            self._last_request_time = time.monotonic()

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=self.user_agent,
                    viewport={"width": 1280, "height": 720}
                )
                page = await context.new_page()
                
                # Navigate and wait for network idle to ensure JS loads
                response = await page.goto(url, wait_until="networkidle", timeout=30000)
                
                if not response:
                    await browser.close()
                    return "", "", 0

                html = await page.content()
                content_type = response.headers.get("content-type", "")
                status_code = response.status
                
                await browser.close()
                return html, content_type, status_code
        except Exception:
            return "", "", 0

    async def fetch_with_firecrawl(self, url: str) -> tuple[str, str, int]:
        """Fetch a URL using Firecrawl API. Returns (html, content_type, status_code)."""
        if not FirecrawlApp or not settings.FIRECRAWL_API_KEY:
            # Fallback if firecrawl is not configured
            return await self.fetch_with_playwright(url)
            
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self.delay:
                await asyncio.sleep(self.delay - elapsed)
            self._last_request_time = time.monotonic()

        try:
            # Note: Firecrawl API is primarily synchronous via the SDK, but we run it in an executor or just call it directly.
            # Using asyncio.to_thread for the synchronous SDK call to avoid blocking the event loop.
            app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
            
            def do_scrape():
                return app.scrape(url, formats=['html'])
                
            response = await asyncio.to_thread(do_scrape)
            
            html = getattr(response, 'html', '')

            
            if not html:
                return "", "", 0
                
            return html, "text/html", 200
        except Exception as e:
            print(f"Firecrawl fetch failed for {url}: {e}")
            return "", "", 0
