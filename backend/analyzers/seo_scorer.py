def calculate_seo_scores(pages_data: list[dict], competitor_id: str, crawl_run_id: str) -> tuple[list[dict], dict]:
    """
    Calculate deterministic SEO scores based on extracted page data.
    Returns a tuple of (findings, scores_dict).
    """
    findings = []
    
    # Trackers for aggregate scoring
    score_categories = {
        "technical": {"max": 0, "earned": 0},
        "on_page": {"max": 0, "earned": 0},
        "performance": {"max": 0, "earned": 0},
        "content": {"max": 0, "earned": 0},
        "structured_data": {"max": 0, "earned": 0},
        "internal_linking": {"max": 0, "earned": 0},
        "crawlability": {"max": 0, "earned": 0},
    }
    
    issue_counts = {
        "critical_issues": 0,
        "high_issues": 0,
        "medium_issues": 0,
        "low_issues": 0,
    }
    
    def add_finding(page_url: str, rule: str, category: str, severity: str, desc: str, points: float):
        findings.append({
            "page_url": page_url,
            "rule": rule,
            "category": category,
            "severity": severity,
            "description": desc,
            "points_lost": points,
        })
        score_categories[category]["earned"] -= points
        
        if severity == "critical": issue_counts["critical_issues"] += 1
        elif severity == "high": issue_counts["high_issues"] += 1
        elif severity == "medium": issue_counts["medium_issues"] += 1
        elif severity == "low": issue_counts["low_issues"] += 1

    # Evaluate each page
    for page in pages_data:
        url = page["url"]
        seo = page.get("seo", {})
        
        # Base points per page (distribute evenly)
        for cat in score_categories:
            score_categories[cat]["max"] += 100
            score_categories[cat]["earned"] += 100
            
        # 1. Technical / Crawlability
        status_code = page.get("status_code", 200)
        if status_code >= 400:
            add_finding(url, "BROKEN_LINK", "crawlability", "critical", f"Page returned {status_code} error", 100.0)
            
        if not seo.get("canonical_url"):
            add_finding(url, "MISSING_CANONICAL", "technical", "medium", "Missing canonical URL tag", 15.0)
            
        # 2. On-Page
        title = seo.get("title")
        if not title:
            add_finding(url, "MISSING_TITLE", "on_page", "high", "Missing title tag", 40.0)
        elif len(title) < 10 or len(title) > 60:
            add_finding(url, "BAD_TITLE_LENGTH", "on_page", "medium", f"Title length ({len(title)}) outside optimal range (10-60 chars)", 15.0)
            
        desc = seo.get("meta_description")
        if not desc:
            add_finding(url, "MISSING_META_DESC", "on_page", "high", "Missing meta description", 30.0)
        elif len(desc) < 50 or len(desc) > 160:
            add_finding(url, "BAD_DESC_LENGTH", "on_page", "medium", f"Description length ({len(desc)}) outside optimal range (50-160 chars)", 15.0)
            
        h1s = seo.get("h1", [])
        if not h1s:
            add_finding(url, "MISSING_H1", "on_page", "high", "Missing H1 heading", 30.0)
        elif len(h1s) > 1:
            add_finding(url, "MULTIPLE_H1", "on_page", "medium", "Multiple H1 headings found", 10.0)
            
        # 3. Content & Images
        images_count = seo.get("images_count", 0)
        images_without_alt = seo.get("images_without_alt", 0)
        if images_without_alt > 0:
            pts = min(30.0, images_without_alt * 5.0)
            add_finding(url, "MISSING_ALT_TEXT", "content", "medium", f"{images_without_alt} images missing alt text", pts)
            
        word_count = page.get("content", {}).get("word_count", 0)
        if word_count < 300:
            add_finding(url, "THIN_CONTENT", "content", "high", f"Thin content detected ({word_count} words)", 25.0)
            
        # 4. Internal Linking
        internal_links = seo.get("internal_links_count", 0)
        if internal_links == 0:
            add_finding(url, "ORPHAN_PAGE_RISK", "internal_linking", "high", "No internal links found on page", 35.0)

    # Calculate final scores (0-100)
    scores = {}
    for cat, vals in score_categories.items():
        if vals["max"] == 0:
            scores[cat] = 100
        else:
            pct = (vals["earned"] / vals["max"]) * 100
            scores[cat] = max(0, min(100, int(pct)))
            
    # Overall is a weighted average
    overall = int(
        (scores["on_page"] * 0.3) +
        (scores["technical"] * 0.2) +
        (scores["content"] * 0.2) +
        (scores["crawlability"] * 0.15) +
        (scores["internal_linking"] * 0.1) +
        (scores["structured_data"] * 0.05)
    )
    scores["overall"] = overall
    scores["total_issues"] = sum(issue_counts.values())
    scores.update(issue_counts)
    
    return findings, scores
