"""Async HTTP fetcher with rate limiting."""
import asyncio
import time
import httpx
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
