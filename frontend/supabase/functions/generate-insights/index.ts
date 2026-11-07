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
    const { competitors, scans, type = 'general' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a strategic competitive intelligence analyst specializing in the web agency industry. Your role is to analyze competitor data and provide actionable business insights.

Generate insights that are:
1. Specific and actionable - not generic advice
2. Based on the actual data provided
3. Prioritized by potential business impact
4. Categorized as: opportunity, threat, trend, or recommendation

For each insight, provide:
- A clear, compelling title
- A detailed description explaining the significance
- Specific action items the user can take
- Priority level (high, medium, low)`;

    const userPrompt = `Analyze these web agency competitors and their latest scan data to generate strategic insights:

Competitors:
${JSON.stringify(competitors, null, 2)}

Recent Scans:
${JSON.stringify(scans, null, 2)}

Analysis Type: ${type}

Generate 3-5 high-quality insights. Return as JSON:
{
  "insights": [
    {
      "type": "opportunity" | "threat" | "trend" | "recommendation",
      "title": "string",
      "description": "string", 
      "action_items": ["string"],
      "priority": "high" | "medium" | "low"
    }
  ]
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
      throw new Error('AI insight generation failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No insights generated');
    }

    let insights;
    try {
      insights = JSON.parse(content);
    } catch {
      insights = { insights: [] };
    }

    console.log('Insights generated:', insights.insights?.length || 0);

    return new Response(
      JSON.stringify({ success: true, ...insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Insight generation failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
