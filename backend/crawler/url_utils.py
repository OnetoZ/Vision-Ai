"""URL validation, normalization, and SSRF protection."""
import ipaddress
import socket
from urllib.parse import urlparse, urljoin, urlunparse


# Private/internal IP ranges to block (SSRF protection)
BLOCKED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1",
    "metadata.google.internal", "169.254.169.254",
}


def is_valid_url(url: str) -> bool:
    """Check if URL is valid and safe to crawl."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.hostname:
            return False
        if parsed.hostname in BLOCKED_HOSTS:
            return False
        # Check for private IP addresses
        try:
            ip = ipaddress.ip_address(parsed.hostname)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return False
        except ValueError:
            # Not an IP address, it's a hostname — resolve it
            try:
                resolved = socket.getaddrinfo(parsed.hostname, None)
                for info in resolved:
                    addr = info[4][0]
                    ip = ipaddress.ip_address(addr)
                    if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                        return False
            except socket.gaierror:
                return False  # DNS resolution failed
        return True
    except Exception:
        return False


def normalize_url(url: str) -> str:
    """Normalize a URL by removing fragments and trailing slashes."""
    parsed = urlparse(url)
    # Remove fragment
    normalized = urlunparse((
        parsed.scheme,
        parsed.netloc.lower(),
        parsed.path.rstrip("/") or "/",
        parsed.params,
        parsed.query,
        "",  # no fragment
    ))
    return normalized


def format_url(url: str) -> str:
    """Ensure URL has a scheme."""
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url


def is_same_domain(url: str, base_url: str) -> bool:
    """Check if URL belongs to the same domain as base."""
    try:
        url_host = urlparse(url).hostname or ""
        base_host = urlparse(base_url).hostname or ""
        # Strip www prefix for comparison
        url_host = url_host.lstrip("www.")
        base_host = base_host.lstrip("www.")
        return url_host == base_host
    except Exception:
        return False


def resolve_url(href: str, base_url: str) -> str | None:
    """Resolve a relative URL against a base URL."""
    try:
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)
        if parsed.scheme not in ("http", "https"):
            return None
        return normalize_url(absolute)
    except Exception:
        return None


def is_crawlable_url(url: str) -> bool:
    """Check if URL points to a crawlable page (not a file download)."""
    parsed = urlparse(url)
    path = parsed.path.lower()
    skip_extensions = {
        ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico",
        ".css", ".js", ".xml", ".json", ".zip", ".tar", ".gz", ".mp3",
        ".mp4", ".avi", ".mov", ".woff", ".woff2", ".ttf", ".eot",
        ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    }
    for ext in skip_extensions:
        if path.endswith(ext):
            return False
    return True
