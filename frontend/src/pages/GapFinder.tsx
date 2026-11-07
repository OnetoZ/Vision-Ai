import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  Loader2,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart,
  Youtube,
  Globe,
} from 'lucide-react';
import { useGapFinder } from '@/hooks/useGapFinder';
import { useYouTubeGaps, useYouTubeCompetitors } from '@/hooks/useYouTubeCompetitors';
import { cn } from '@/lib/utils';
import { useCompetitors } from '@/hooks/useCompetitors';

export interface GeneralGap {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  company?: string;
}

export interface TopicComparison {
  topic: string;
  best_competitor: string;
  best_practice: string;
  my_company_situation: string;
  improvements: { action: string; impact: string }[];
}

export interface FinalSuggestion {
  category: string;
  suggestion: string;
}

const GapFinder = () => {
  const [activeTab, setActiveTab] = useState<'website' | 'youtube'>('website');
  const { data: analysis, isLoading, generateAnalysis, isGenerating } = useGapFinder();
  const { competitors } = useCompetitors();
  const { gaps: ytGaps, isLoading: isYtGapsLoading, generateGaps: generateYtGaps } = useYouTubeGaps();
  const { competitors: ytCompetitors } = useYouTubeCompetitors();

  // Combine feature and pricing gaps from hook
  const featureGaps = analysis?.feature_gaps || [];
  const pricingGaps = analysis?.pricing_gaps || [];
  const allWebsiteGaps: GeneralGap[] = [...featureGaps, ...pricingGaps];

  const getImpactColor = (impact: string = 'medium') => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'medium': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      case 'low': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-muted-foreground border-border bg-secondary';
    }
  };

  const getEffortColor = (effort: string = 'medium') => {
    switch (effort.toLowerCase()) {
      case 'high': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'medium': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      case 'low': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-muted-foreground border-border bg-secondary';
    }
  };

  const getPriorityInfo = (impact: string = 'medium', effort: string = 'medium') => {
    const i = impact.toLowerCase();
    const e = effort.toLowerCase();
    
    if (i === 'high' && e === 'low') {
      return { label: 'Quick Win', color: 'bg-primary/10 text-primary border-primary/20', icon: Zap };
    }
    if (i === 'high') {
      return { label: 'Strategic Priority', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Target };
    }
    if (i === 'medium' && (e === 'low' || e === 'medium')) {
      return { label: 'Consider', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Layers };
    }
    return { label: 'Secondary', color: 'bg-secondary text-muted-foreground border-border', icon: CheckCircle2 };
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Header 
          title="Market Gap Finder" 
          subtitle="Deep competitive analysis and strategic growth opportunities"
        >
          {activeTab === 'website' ? (
            <Button 
              onClick={() => generateAnalysis()} 
              disabled={isGenerating || competitors?.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Market...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run AI Gap Analysis
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => generateYtGaps && generateYtGaps.mutate && generateYtGaps.mutate()} 
              disabled={isYtGapsLoading || ytCompetitors?.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md transition-all gap-2"
            >
              {isYtGapsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Discovering Content Gaps...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Discover YouTube Gaps
                </>
              )}
            </Button>
          )}
        </Header>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Button
            variant={activeTab === 'website' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => setActiveTab('website')}
          >
            <Globe className="w-3.5 h-3.5" />
            Website & Product Gaps ({allWebsiteGaps.length})
          </Button>
          <Button
            variant={activeTab === 'youtube' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => setActiveTab('youtube')}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            YouTube Content Gaps ({ytGaps?.length || 0})
          </Button>
        </div>

        {/* AI Insight Summary Banner */}
        <Card className="glass-card border-l-4 border-l-primary overflow-hidden">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Opportunity Intelligence</h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                {activeTab === 'website'
                  ? `Analyzing market positioning across ${competitors?.length || 0} competitors. Discover feature whitespace, pricing discrepancies, and positioning advantages.`
                  : `Evaluating ${ytCompetitors?.length || 0} competitor channels for high-demand, underserved video topics and formats.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── TAB 1: WEBSITE GAPS ── */}
        {activeTab === 'website' && (
          <div>
            {isGenerating || isLoading ? (
              <Card className="glass-card mt-4">
                <CardContent className="p-16 text-center">
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-primary absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Generating Gap Intelligence...</h3>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                    AI is analyzing market signals, competitor pricing tiers, and product feature parity.
                  </p>
                </CardContent>
              </Card>
            ) : allWebsiteGaps.length === 0 ? (
              <Card className="glass-card mt-4">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No Market Gaps Generated Yet</h3>
                  <p className="text-muted-foreground text-xs max-w-md mx-auto mb-6">
                    {competitors.length === 0
                      ? 'Add competitors first to enable automated gap analysis.'
                      : 'Run AI Gap Analysis to evaluate feature deficits and market opportunities.'}
                  </p>
                  {competitors.length === 0 ? (
                    <Button size="sm" onClick={() => window.location.href = '/competitors'}>
                      Add Competitors
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => generateAnalysis()} disabled={isGenerating}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Gap Analysis Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 mt-4">
                {/* Feature Gaps Section */}
                {featureGaps.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h2 className="text-base font-bold text-foreground">Feature & Capability Whitespace</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {featureGaps.map((gap, idx) => (
                        <GeneralGapCard
                          key={`feature-${idx}`}
                          gap={gap}
                          getPriorityInfo={getPriorityInfo}
                          getImpactColor={getImpactColor}
                          getEffortColor={getEffortColor}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Pricing Gaps Section */}
                {pricingGaps.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-amber-500" />
                      <h2 className="text-base font-bold text-foreground">Pricing & Packaging Gaps</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {pricingGaps.map((gap, idx) => (
                        <GeneralGapCard
                          key={`pricing-${idx}`}
                          gap={gap}
                          getPriorityInfo={getPriorityInfo}
                          getImpactColor={getImpactColor}
                          getEffortColor={getEffortColor}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: YOUTUBE GAPS ── */}
        {activeTab === 'youtube' && (
          <div>
            {isYtGapsLoading ? (
              <Card className="glass-card mt-4">
                <CardContent className="p-16 text-center">
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <Youtube className="w-5 h-5 text-red-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Scanning Video Topic Landscape...</h3>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                    Comparing audience search intent and competitor video frequency.
                  </p>
                </CardContent>
              </Card>
            ) : (!ytGaps || ytGaps.length === 0) ? (
              <Card className="glass-card mt-4">
                <CardContent className="p-12 text-center">
                  <Youtube className="w-12 h-12 text-red-500/40 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No YouTube Gaps Detected Yet</h3>
                  <p className="text-muted-foreground text-xs max-w-md mx-auto mb-6">
                    {ytCompetitors.length === 0
                      ? 'Add YouTube channels in the YouTube Intelligence tab to track topic opportunities.'
                      : 'Click Discover YouTube Gaps to identify untapped video concepts.'}
                  </p>
                  {ytCompetitors.length === 0 ? (
                    <Button size="sm" onClick={() => window.location.href = '/youtube'}>
                      Configure YouTube Channels
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => generateYtGaps?.mutate?.()}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Discover YouTube Gaps
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ytGaps.map((gap: any, idx: number) => (
                    <Card key={gap.id || idx} className="glass-card border-l-4 border-l-red-500 overflow-hidden hover:border-red-500/60 transition-all">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-foreground text-sm">{gap.topic}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 shrink-0">
                            Score: {gap.opportunity_score || 85}/100
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {gap.description || 'High audience interest with low direct competitor coverage.'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                          <span>Competition: <strong className="text-foreground capitalize">{gap.competition_level || 'Low'}</strong></span>
                          {gap.evidence?.target_audience && (
                            <span>Audience: <strong className="text-foreground">{gap.evidence.target_audience}</strong></span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const GeneralGapCard = ({
  gap,
  getPriorityInfo,
  getImpactColor,
  getEffortColor,
}: {
  gap: GeneralGap;
  getPriorityInfo: any;
  getImpactColor: any;
  getEffortColor: any;
}) => {
  const priority = getPriorityInfo(gap.impact, gap.effort);
  const PriorityIcon = priority.icon;

  return (
    <Card className="glass-card group border-l-4 border-l-primary hover:border-border transition-all">
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm">{gap.title}</h3>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1', priority.color)}>
              <PriorityIcon className="w-2.5 h-2.5" />
              {priority.label}
            </span>
            {gap.company && (
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                {gap.company}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{gap.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-2 md:pt-0 md:pl-4">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-semibold">Impact</p>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded border inline-block mt-0.5', getImpactColor(gap.impact))}>
              {gap.impact}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-semibold">Effort</p>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded border inline-block mt-0.5', getEffortColor(gap.effort))}>
              {gap.effort}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GapFinder;
