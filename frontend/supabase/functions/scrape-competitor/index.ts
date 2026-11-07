import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, competitorId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Scrape the website with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape website' }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract metadata from the scraped content
    const content = scrapeData.data || scrapeData;
    const metadata = content.metadata || {};
    const markdown = content.markdown || '';
    const html = content.html || '';
    const links = content.links || [];

    // Extract SEO metrics from HTML
    const seoMetrics = extractSEOMetrics(html, markdown, metadata, links);
    
    // Extract pricing data if available
    const pricingData = extractPricingData(markdown);

    // Content analysis
    const contentAnalysis = {
      wordCount: markdown.split(/\s+/).filter(Boolean).length,
      headings: extractHeadings(markdown),
      images: (html.match(/<img/gi) || []).length,
      internalLinks: links.filter((l: string) => l.includes(new URL(formattedUrl).hostname)).length,
      externalLinks: links.filter((l: string) => !l.includes(new URL(formattedUrl).hostname)).length,
    };

    console.log('Scrape successful, extracted SEO metrics and content analysis');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          metadata: {
            title: metadata.title || '',
            description: metadata.description || '',
            ogImage: metadata.ogImage || '',
            favicon: metadata.favicon || '',
          },
          seoMetrics,
          pricingData,
          contentAnalysis,
          rawContent: markdown.substring(0, 10000), // Limit raw content size
          links: links.slice(0, 100), // Limit links
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractSEOMetrics(html: string, markdown: string, metadata: any, links: string[]) {
  const issues: { type: string; description: string; severity: string }[] = [];
  
  // Title analysis
  const title = metadata.title || '';
  if (!title) {
    issues.push({ type: 'missing_title', description: 'Page is missing a title tag', severity: 'high' });
  } else if (title.length > 60) {
    issues.push({ type: 'title_too_long', description: `Title is ${title.length} characters (should be under 60)`, severity: 'medium' });
  } else if (title.length < 30) {
    issues.push({ type: 'title_too_short', description: `Title is only ${title.length} characters (aim for 50-60)`, severity: 'low' });
  }

  // Description analysis
  const description = metadata.description || '';
  if (!description) {
    issues.push({ type: 'missing_description', description: 'Page is missing a meta description', severity: 'high' });
  } else if (description.length > 160) {
    issues.push({ type: 'description_too_long', description: `Description is ${description.length} characters (should be under 160)`, severity: 'medium' });
  } else if (description.length < 70) {
    issues.push({ type: 'description_too_short', description: `Description is only ${description.length} characters (aim for 120-160)`, severity: 'low' });
  }

  // H1 analysis
  const h1Matches = markdown.match(/^# .+$/gm) || [];
  if (h1Matches.length === 0) {
    issues.push({ type: 'missing_h1', description: 'Page is missing an H1 heading', severity: 'high' });
  } else if (h1Matches.length > 1) {
    issues.push({ type: 'multiple_h1', description: `Page has ${h1Matches.length} H1 headings (should have only 1)`, severity: 'medium' });
  }

  // Image alt text analysis
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
  const totalImages = (html.match(/<img/gi) || []).length;
  if (imgWithoutAlt > 0) {
    issues.push({ type: 'images_missing_alt', description: `${imgWithoutAlt} of ${totalImages} images are missing alt text`, severity: 'medium' });
  }

  // Internal linking
  const hostname = new URL(metadata.sourceURL || 'https://example.com').hostname;
  const internalLinks = links.filter((l: string) => {
    try {
      return new URL(l).hostname === hostname;
    } catch {
      return false;
    }
  }).length;
  
  if (internalLinks < 3) {
    issues.push({ type: 'low_internal_links', description: `Only ${internalLinks} internal links found (aim for at least 3-5)`, severity: 'low' });
  }

  // Mobile viewport
  if (!html.includes('viewport')) {
    issues.push({ type: 'missing_viewport', description: 'Page may not be mobile-friendly (no viewport meta tag)', severity: 'high' });
  }

  // Calculate SEO score
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  const score = Math.max(0, 100 - (highIssues * 20) - (mediumIssues * 10) - (lowIssues * 5));

  return {
    score,
    titleLength: title.length,
    descriptionLength: description.length,
    h1Count: h1Matches.length,
    totalLinks: links.length,
    internalLinks,
    externalLinks: links.length - internalLinks,
    issues,
  };
}

function extractPricingData(markdown: string) {
  const prices: { amount: string; context: string }[] = [];
  
  // Match common price patterns
  const pricePatterns = [
    /\$[\d,]+(?:\.\d{2})?(?:\/mo(?:nth)?|\/yr|\/year)?/gi,
    /USD\s*[\d,]+(?:\.\d{2})?/gi,
    /€[\d,]+(?:\.\d{2})?/gi,
    /£[\d,]+(?:\.\d{2})?/gi,
  ];

  for (const pattern of pricePatterns) {
    const matches = markdown.match(pattern) || [];
    for (const match of matches) {
      // Get some context around the price
      const index = markdown.indexOf(match);
      const start = Math.max(0, index - 50);
      const end = Math.min(markdown.length, index + match.length + 50);
      const context = markdown.substring(start, end).replace(/\n/g, ' ').trim();
      
      prices.push({ amount: match, context });
    }
  }

  return {
    found: prices.length > 0,
    prices: prices.slice(0, 10), // Limit to 10 prices
  };
}

function extractHeadings(markdown: string) {
  const headings: { level: number; text: string }[] = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }
  }

  return headings.slice(0, 20); // Limit to 20 headings
}
