import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { seoMetrics, contentAnalysis, competitorName, competitorUrl } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert SEO analyst specializing in web agency websites. Analyze the provided SEO metrics and content analysis data to identify gaps, issues, and opportunities for improvement.

For each issue found, provide:
1. A clear issue type (e.g., "missing_meta_description", "poor_heading_structure", "low_content_quality")
2. A detailed description of the problem
3. A specific, actionable recommendation to fix it
4. An impact score from 1-100 (how much fixing this would improve SEO)
5. A severity level: "high", "medium", or "low"

Focus on actionable insights that can be immediately implemented. Be specific about what's wrong and exactly how to fix it.`;

    const userPrompt = `Analyze this web agency website and identify all SEO gaps and issues:

Competitor: ${competitorName}
URL: ${competitorUrl}

SEO Metrics:
${JSON.stringify(seoMetrics, null, 2)}

Content Analysis:
${JSON.stringify(contentAnalysis, null, 2)}

Provide a comprehensive analysis with specific issues and recommendations. Return your analysis as JSON with this structure:
{
  "gaps": [
    {
      "issue_type": "string",
      "issue_description": "string",
      "recommendation": "string",
      "impact_score": number,
      "severity": "high" | "medium" | "low"
    }
  ],
  "overall_assessment": "string",
  "quick_wins": ["string"],
  "priority_actions": ["string"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No analysis generated');
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // If JSON parsing fails, create a structured response
      analysis = {
        gaps: seoMetrics.issues?.map((issue: any) => ({
          issue_type: issue.type,
          issue_description: issue.description,
          recommendation: `Fix the ${issue.type.replace(/_/g, ' ')} issue`,
          impact_score: issue.severity === 'high' ? 80 : issue.severity === 'medium' ? 50 : 30,
          severity: issue.severity,
        })) || [],
        overall_assessment: content,
        quick_wins: [],
        priority_actions: [],
      };
    }

    console.log('SEO gap analysis completed');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing SEO gaps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
