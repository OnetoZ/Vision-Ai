"""SEO data extraction from HTML using BeautifulSoup."""
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from crawler.url_utils import is_same_domain


def extract_seo_data(soup: BeautifulSoup, page_url: str, base_url: str) -> dict:
    """Extract all SEO-relevant data from a parsed HTML page."""
    data = {}

    # Title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else None
    data["title"] = title
    data["title_length"] = len(title) if title else 0

    # Meta description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    description = meta_desc.get("content", "").strip() if meta_desc else None
    data["meta_description"] = description
    data["meta_description_length"] = len(description) if description else 0

    # Headings
    data["h1"] = [h.get_text(strip=True) for h in soup.find_all("h1")]
    data["h2"] = [h.get_text(strip=True) for h in soup.find_all("h2")]
    data["h3"] = [h.get_text(strip=True) for h in soup.find_all("h3")]

    # Canonical
    canonical = soup.find("link", attrs={"rel": "canonical"})
    data["canonical_url"] = canonical.get("href", "").strip() if canonical else None

    # Meta robots
    robots_meta = soup.find("meta", attrs={"name": "robots"})
    data["meta_robots"] = robots_meta.get("content", "").strip() if robots_meta else None

    # Viewport (mobile-friendliness check)
    viewport = soup.find("meta", attrs={"name": "viewport"})
    data["has_viewport"] = viewport is not None

    # Images
    images = soup.find_all("img")
    data["images_count"] = len(images)
    images_without_alt = 0
    for img in images:
        alt = img.get("alt")
        if alt is None or alt.strip() == "":
            images_without_alt += 1
    data["images_without_alt"] = images_without_alt

    # Links
    all_links = soup.find_all("a", href=True)
    internal_links = []
    external_links = []
    nofollow_links = []

    for link in all_links:
        href = link.get("href", "").strip()
        if not href or href.startswith("#") or href.startswith("javascript:") or href.startswith("mailto:") or href.startswith("tel:"):
            continue

        rel = link.get("rel", [])
        if isinstance(rel, str):
            rel = [rel]

        if is_same_domain(href, base_url) or href.startswith("/") or href.startswith("./"):
            internal_links.append(href)
        else:
            external_links.append(href)

        if "nofollow" in rel:
            nofollow_links.append(href)

    data["internal_links"] = internal_links
    data["internal_links_count"] = len(internal_links)
    data["external_links"] = external_links
    data["external_links_count"] = len(external_links)

    # Open Graph
    og_title = soup.find("meta", attrs={"property": "og:title"})
    og_desc = soup.find("meta", attrs={"property": "og:description"})
    og_image = soup.find("meta", attrs={"property": "og:image"})
    og_url = soup.find("meta", attrs={"property": "og:url"})
    data["has_og_tags"] = any([og_title, og_desc, og_image])
    data["og"] = {
        "title": og_title.get("content", "") if og_title else None,
        "description": og_desc.get("content", "") if og_desc else None,
        "image": og_image.get("content", "") if og_image else None,
        "url": og_url.get("content", "") if og_url else None,
    }

    # Twitter Card
    tw_card = soup.find("meta", attrs={"name": "twitter:card"})
    tw_title = soup.find("meta", attrs={"name": "twitter:title"})
    tw_desc = soup.find("meta", attrs={"name": "twitter:description"})
    tw_image = soup.find("meta", attrs={"name": "twitter:image"})
    data["has_twitter_tags"] = any([tw_card, tw_title])
    data["twitter"] = {
        "card": tw_card.get("content", "") if tw_card else None,
        "title": tw_title.get("content", "") if tw_title else None,
        "description": tw_desc.get("content", "") if tw_desc else None,
        "image": tw_image.get("content", "") if tw_image else None,
    }

    return data
