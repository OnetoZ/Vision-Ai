"""Main crawl orchestrator — discovers and crawls pages for a competitor."""
import asyncio
import hashlib
import json
import time
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from crawler.fetcher import Fetcher
from crawler.robots_parser import RobotsParser
from crawler.sitemap_parser import SitemapParser
from crawler.url_utils import (
    format_url, is_same_domain, is_crawlable_url,
    normalize_url, resolve_url, is_valid_url,
)
from extractors.seo_extractor import extract_seo_data
from extractors.schema_extractor import extract_schema_data
from extractors.content_extractor import extract_content_data
from extractors.product_extractor import extract_product_data
from extractors.pricing_extractor import extract_pricing_data
from analyzers.seo_scorer import calculate_seo_scores
from models.crawl import CrawlRun
from models.page import Page
from models.finding import SEOFinding
from models.score import SEOScore
from models.content import ContentSnapshot
from models.product import ProductSnapshot
from models.pricing import PricingSnapshot
from models.competitor import Competitor
from models.gap import CompetitorGap

settings = get_settings()


async def run_crawl(competitor_id: str, crawl_run_id: str, db_factory) -> None:
    """Run a full crawl for a competitor. Called as a background task."""
    async with db_factory() as db:
        try:
            # Update crawl status
            crawl_run = await db.get(CrawlRun, crawl_run_id)
            if not crawl_run:
                return
            crawl_run.status = "crawling"
            crawl_run.started_at = datetime.now(timezone.utc)
            await db.commit()

            competitor = await db.get(Competitor, competitor_id)
            if not competitor:
                return

            base_url = format_url(competitor.url)

            # Create fetcher and client
            fetcher = Fetcher()
            async with fetcher.create_client() as client:
                # Phase 1: Fetch robots.txt
                robots = RobotsParser()
                await robots.fetch(base_url, client)

                # Adjust delay from robots.txt crawl-delay
                if robots.crawl_delay and robots.crawl_delay > fetcher.delay:
                    fetcher.delay = min(robots.crawl_delay, 5.0)

                # Phase 2: Discover sitemap URLs
                sitemap = SitemapParser()
                sitemap_urls = robots.sitemaps or [f"{urlparse(base_url).scheme}://{urlparse(base_url).netloc}/sitemap.xml"]
                await sitemap.fetch(sitemap_urls, client)

                # Phase 3: Build URL queue
                urls_to_crawl: list[str] = []
                visited: set[str] = set()

                # Start with homepage
                homepage = normalize_url(base_url)
                urls_to_crawl.append(homepage)

                # Add sitemap URLs
                for url in sitemap.urls:
                    if is_same_domain(url, base_url) and url not in urls_to_crawl:
                        urls_to_crawl.append(url)

                # Phase 4: Crawl pages
                pages_data = []
                max_pages = settings.CRAWL_MAX_PAGES
                crawl_index = 0

                while crawl_index < len(urls_to_crawl) and len(visited) < max_pages:
                    url = urls_to_crawl[crawl_index]
                    crawl_index += 1

                    if url in visited:
                        continue
                    if not is_crawlable_url(url):
                        continue
                    if not robots.is_allowed(url):
                        continue

                    visited.add(url)

                    # Fetch the page
                    start_time = time.monotonic()
                    response = await fetcher.fetch(url, client)
                    elapsed_ms = int((time.monotonic() - start_time) * 1000)

                    if response is None:
                        crawl_run.pages_failed += 1
                        await db.commit()
                        continue

                    content_type = response.headers.get("content-type", "")
                    if "text/html" not in content_type and "application/xhtml" not in content_type:
                        continue

                    html = response.text
                    page_size = len(response.content)

                    # Build redirect chain
                    redirect_chain = []
                    if response.history:
                        redirect_chain = [str(r.url) for r in response.history]

                    # Extract SEO data
                    soup = BeautifulSoup(html, "lxml")
                    seo_data = extract_seo_data(soup, url, base_url)
                    schema_data = extract_schema_data(soup)
                    content_data = extract_content_data(soup)
                    product_data = extract_product_data(soup, html)
                    pricing_data_page = extract_pricing_data(html)

                    # Discover internal links
                    for link in seo_data.get("internal_links", []):
                        resolved = resolve_url(link, url)
                        if resolved and is_same_domain(resolved, base_url) and resolved not in visited and resolved not in urls_to_crawl:
                            urls_to_crawl.append(resolved)

                    # Content hash for change detection
                    main_text = content_data.get("main_text", "")
                    content_hash = hashlib.md5(main_text.encode()).hexdigest() if main_text else None

                    # Store page data
                    page = Page(
                        id=str(uuid.uuid4()),
                        crawl_run_id=crawl_run_id,
                        competitor_id=competitor_id,
                        url=url,
                        status_code=response.status_code,
                        final_url=str(response.url),
                        redirect_chain=json.dumps(redirect_chain) if redirect_chain else None,
                        response_time_ms=elapsed_ms,
                        page_size_bytes=page_size,
                        content_type=content_type,
                        title=seo_data.get("title"),
                        title_length=seo_data.get("title_length"),
                        meta_description=seo_data.get("meta_description"),
                        meta_description_length=seo_data.get("meta_description_length"),
                        h1=json.dumps(seo_data.get("h1", [])),
                        h2=json.dumps(seo_data.get("h2", [])),
                        h3=json.dumps(seo_data.get("h3", [])),
                        canonical_url=seo_data.get("canonical_url"),
                        meta_robots=seo_data.get("meta_robots"),
                        word_count=content_data.get("word_count", 0),
                        internal_links_count=seo_data.get("internal_links_count", 0),
                        external_links_count=seo_data.get("external_links_count", 0),
                        images_count=seo_data.get("images_count", 0),
                        images_without_alt=seo_data.get("images_without_alt", 0),
                        has_og_tags=seo_data.get("has_og_tags", False),
                        has_twitter_tags=seo_data.get("has_twitter_tags", False),
                        schema_types=json.dumps(schema_data.get("types", [])),
                        raw_content_hash=content_hash,
                    )
                    db.add(page)

                    # Store content snapshot
                    snapshot = ContentSnapshot(
                        id=str(uuid.uuid4()),
                        crawl_run_id=crawl_run_id,
                        competitor_id=competitor_id,
                        page_url=url,
                        title=seo_data.get("title"),
                        meta_description=seo_data.get("meta_description"),
                        content_hash=content_hash,
                        word_count=content_data.get("word_count", 0),
                    )
                    db.add(snapshot)

                    # Store product snapshots
                    for product in product_data:
                        prod_snap = ProductSnapshot(
                            id=str(uuid.uuid4()),
                            crawl_run_id=crawl_run_id,
                            competitor_id=competitor_id,
                            page_url=url,
                            product_name=product.get("name"),
                            price=product.get("price"),
                            currency=product.get("currency"),
                            availability=product.get("availability"),
                        )
                        db.add(prod_snap)

                    pages_data.append({
                        "url": url,
                        "seo": seo_data,
                        "schema": schema_data,
                        "content": content_data,
                        "products": product_data,
                        "pricing": pricing_data_page,
                        "status_code": response.status_code,
                    })

                    crawl_run.pages_discovered = len(visited)
                    crawl_run.pages_analyzed = len(pages_data)
                    await db.commit()

            # Phase 5: Analyze — generate SEO findings and scores
            crawl_run.status = "analyzing"
            await db.commit()

            findings, scores = calculate_seo_scores(pages_data, competitor_id, crawl_run_id)

            for finding in findings:
                f = SEOFinding(
                    id=str(uuid.uuid4()),
                    crawl_run_id=crawl_run_id,
                    competitor_id=competitor_id,
                    page_url=finding["page_url"],
                    rule=finding["rule"],
                    category=finding["category"],
                    severity=finding["severity"],
                    description=finding["description"],
                    points_lost=finding["points_lost"],
                )
                db.add(f)

            score = SEOScore(
                id=str(uuid.uuid4()),
                crawl_run_id=crawl_run_id,
                competitor_id=competitor_id,
                overall=scores["overall"],
                technical=scores["technical"],
                on_page=scores["on_page"],
                performance=scores["performance"],
                content=scores["content"],
                structured_data=scores["structured_data"],
                internal_linking=scores["internal_linking"],
                crawlability=scores["crawlability"],
                total_issues=scores["total_issues"],
                critical_issues=scores["critical_issues"],
                high_issues=scores["high_issues"],
                medium_issues=scores["medium_issues"],
                low_issues=scores["low_issues"],
            )
            db.add(score)

            # Store aggregated pricing snapshot
            all_prices = []
            for p in pages_data:
                for price_info in p.get("pricing", []):
                    try:
                        val = float(price_info["amount"].replace("$", "").replace(",", "").replace("€", "").replace("£", "").split("/")[0])
                        all_prices.append(val)
                    except (ValueError, KeyError):
                        pass

            if all_prices:
                pricing_snap = PricingSnapshot(
                    id=str(uuid.uuid4()),
                    crawl_run_id=crawl_run_id,
                    competitor_id=competitor_id,
                    min_price=min(all_prices),
                    max_price=max(all_prices),
                    avg_price=sum(all_prices) / len(all_prices),
                    product_count=len(all_prices),
                    price_details=json.dumps([{"amount": p} for p in all_prices[:50]]),
                )
                db.add(pricing_snap)

            # Update crawl status to completed
            crawl_run.status = "completed"
            crawl_run.completed_at = datetime.now(timezone.utc)
            crawl_run.pages_discovered = len(visited)
            crawl_run.pages_analyzed = len(pages_data)

            # Update competitor
            competitor.status = "active"
            competitor.last_scanned_at = datetime.now(timezone.utc)

            await db.commit()

        except Exception as e:
            try:
                crawl_run = await db.get(CrawlRun, crawl_run_id)
                if crawl_run:
                    crawl_run.status = "failed"
                    crawl_run.error_message = str(e)[:500]
                    crawl_run.completed_at = datetime.now(timezone.utc)

                competitor = await db.get(Competitor, competitor_id)
                if competitor:
                    competitor.status = "error"

                await db.commit()
            except Exception:
                pass
