"""sitemap.xml parser."""
import httpx
from bs4 import BeautifulSoup
from crawler.url_utils import normalize_url


class SitemapParser:
    """Discover and parse sitemap.xml files."""

    def __init__(self):
        self.urls: list[str] = []
        self.found: bool = False

    async def fetch(self, sitemap_urls: list[str], client: httpx.AsyncClient) -> None:
        """Fetch and parse sitemap(s)."""
        for url in sitemap_urls:
            await self._fetch_single(url, client, depth=0)

    async def _fetch_single(self, url: str, client: httpx.AsyncClient, depth: int) -> None:
        """Fetch a single sitemap, handling sitemap indexes recursively."""
        if depth > 3:  # Prevent infinite recursion
            return
        try:
            resp = await client.get(url, timeout=15.0, follow_redirects=True)
            if resp.status_code != 200:
                return
            self.found = True
            soup = BeautifulSoup(resp.text, "lxml-xml")

            # Check if it's a sitemap index
            sitemap_tags = soup.find_all("sitemap")
            if sitemap_tags:
                for sitemap_tag in sitemap_tags:
                    loc = sitemap_tag.find("loc")
                    if loc and loc.text:
                        await self._fetch_single(loc.text.strip(), client, depth + 1)
                return

            # Regular sitemap — extract URLs
            url_tags = soup.find_all("url")
            for url_tag in url_tags:
                loc = url_tag.find("loc")
                if loc and loc.text:
                    normalized = normalize_url(loc.text.strip())
                    if normalized not in self.urls:
                        self.urls.append(normalized)

        except Exception:
            pass  # Sitemap unreachable or invalid
