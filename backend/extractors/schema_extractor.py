import json
from bs4 import BeautifulSoup


def extract_schema_data(soup: BeautifulSoup) -> dict:
    """Extract Schema.org JSON-LD structured data from HTML."""
    data = {
        "types": [],
        "raw_schemas": []
    }

    script_tags = soup.find_all("script", type="application/ld+json")
    for script in script_tags:
        try:
            content = script.string
            if content:
                parsed = json.loads(content)
                
                # Handle both array and single object JSON-LD
                items = parsed if isinstance(parsed, list) else [parsed]
                
                for item in items:
                    if isinstance(item, dict):
                        data["raw_schemas"].append(item)
                        # Extract the schema type
                        schema_type = item.get("@type")
                        if schema_type:
                            if isinstance(schema_type, list):
                                data["types"].extend(schema_type)
                            else:
                                data["types"].append(schema_type)
        except (json.JSONDecodeError, Exception):
            continue

    # Remove duplicates
    data["types"] = list(set(data["types"]))
    return data
