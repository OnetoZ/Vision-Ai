"""robots.txt parser."""
from urllib.parse import urlparse
import httpx


class RobotsParser:
    """Parse and check robots.txt rules."""

    def __init__(self):
        self.disallowed: list[str] = []
        self.allowed: list[str] = []
        self.sitemaps: list[str] = []
        self.crawl_delay: float | None = None
        self.raw_content: str = ""
        self.found: bool = False

    async def fetch(self, base_url: str, client: httpx.AsyncClient) -> None:
        """Fetch and parse robots.txt from a domain."""
        parsed = urlparse(base_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        try:
            resp = await client.get(robots_url, timeout=10.0, follow_redirects=True)
            if resp.status_code == 200:
                self.found = True
                self.raw_content = resp.text
                self._parse(resp.text)
        except Exception:
            pass  # No robots.txt or unreachable

    def _parse(self, content: str) -> None:
        """Parse robots.txt content."""
        current_agent = None
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" not in line:
                continue
            key, _, value = line.partition(":")
            key = key.strip().lower()
            value = value.strip()

            if key == "user-agent":
                current_agent = value
            elif key == "disallow" and value and current_agent in ("*", "VisionAI-Crawler"):
                self.disallowed.append(value)
            elif key == "allow" and value and current_agent in ("*", "VisionAI-Crawler"):
                self.allowed.append(value)
            elif key == "sitemap" and value:
                self.sitemaps.append(value)
            elif key == "crawl-delay" and current_agent in ("*", "VisionAI-Crawler"):
                try:
                    self.crawl_delay = float(value)
                except ValueError:
                    pass

    def is_allowed(self, url: str) -> bool:
        """Check if a URL is allowed to be crawled."""
        parsed = urlparse(url)
        path = parsed.path

        # Check allowed first (more specific rules take priority)
        for rule in self.allowed:
            if path.startswith(rule):
                return True

        for rule in self.disallowed:
            if rule == "/":
                # Disallow all — but check if there's a specific allow
                return False
            if path.startswith(rule):
                return False

        return True
