from bs4 import BeautifulSoup
from extractors.schema_extractor import extract_schema_data


def extract_product_data(soup: BeautifulSoup, html: str) -> list[dict]:
    """Extract product information from Schema.org and HTML."""
    products = []
    
    # 1. Try to get from Schema.org (most reliable)
    schema_data = extract_schema_data(soup)
    for schema in schema_data.get("raw_schemas", []):
        schema_type = schema.get("@type", "")
        is_product = schema_type == "Product" or (isinstance(schema_type, list) and "Product" in schema_type)
        
        if is_product:
            product = {
                "name": schema.get("name"),
                "price": None,
                "currency": None,
                "availability": None
            }
            
            # Extract offer details
            offers = schema.get("offers", {})
            if isinstance(offers, list) and len(offers) > 0:
                offers = offers[0]
                
            if isinstance(offers, dict):
                product["price"] = str(offers.get("price")) if offers.get("price") else None
                product["currency"] = offers.get("priceCurrency")
                
                availability = offers.get("availability", "")
                if availability:
                    if "InStock" in availability:
                        product["availability"] = "InStock"
                    elif "OutOfStock" in availability:
                        product["availability"] = "OutOfStock"
                        
            if product["name"]:
                products.append(product)
                
    # If we found schema products, return them
    if products:
        return products
        
    return products
