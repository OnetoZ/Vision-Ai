import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Youtube,
  Plus,
  Video,
  Target,
  FileBarChart,
  RefreshCw,
  Search,
  Sparkles,
  BarChart3,
  TrendingUp,
  Loader2,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useYouTubeCompetitors, useYouTubeGaps } from '@/hooks/useYouTubeCompetitors';
import { useInsights } from '@/hooks/useInsights';
import AddYouTubeCompetitorModal from '@/components/competitors/AddYouTubeCompetitorModal';
import YouTubeChannelCard from '@/components/youtube/YouTubeChannelCard';
import YouTubeVideoList from '@/components/youtube/YouTubeVideoList';

type YouTubeTab = 'channels' | 'videos' | 'gaps' | 'insights' | 'reports';

const YouTubeIntelligence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (): YouTubeTab => {
    const path = location.pathname;
    if (path.includes('/youtube/videos')) return 'videos';
    if (path.includes('/youtube/gaps')) return 'gaps';
    if (path.includes('/youtube/insights')) return 'insights';
    if (path.includes('/youtube/reports')) return 'reports';
    return 'channels';
  };

  const [activeTab, setActiveTab] = useState<YouTubeTab>(getTabFromPath());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const { competitors, isLoading, refetch } = useYouTubeCompetitors();
  const { gaps: ytGaps, isLoading: isGapsLoading, generateGaps } = useYouTubeGaps();
  const { insights } = useInsights();

  const ytInsights = (insights || []).filter((i: any) => i.source_type === 'youtube');

  const myChannel = competitors.find((c) => c.competitor_type === 'self');
  const competitorChannels = competitors.filter((c) => c.competitor_type !== 'self');

  const filteredCompetitorChannels = competitorChannels.filter((c) => {
    const name = c.channel?.channel_name || c.name || '';
    const handle = c.channel?.channel_handle || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || handle.toLowerCase().includes(query);
  });

  const activeChannelId = selectedChannelId || competitors[0]?.id;

  const handleTabChange = (tab: YouTubeTab) => {
    setActiveTab(tab);
    if (tab === 'channels') navigate('/youtube');
    else navigate(`/youtube/${tab}`);
  };

  return (
    <AppLayout>
      <Header
        title="YouTube Competitive Intelligence"
        subtitle="Track channel performance, video velocity, and audience content gaps"
      >
        <AddYouTubeCompetitorModal />
      </Header>

      <div className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 flex-wrap">
          <Button
            variant={activeTab === 'channels' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => handleTabChange('channels')}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            Channels ({competitors.length})
          </Button>

          <Button
            variant={activeTab === 'videos' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => handleTabChange('videos')}
          >
            <Video className="w-3.5 h-3.5 text-blue-400" />
            Video Releases
          </Button>

          <Button
            variant={activeTab === 'gaps' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => handleTabChange('gaps')}
          >
            <Target className="w-3.5 h-3.5 text-amber-500" />
            Topic Whitespace ({ytGaps?.length || 0})
          </Button>

          <Button
            variant={activeTab === 'insights' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => handleTabChange('insights')}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            AI Insights ({ytInsights.length})
          </Button>

          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => handleTabChange('reports')}
          >
            <FileBarChart className="w-3.5 h-3.5 text-indigo-400" />
            Performance Reports
          </Button>
        </div>

        {/* ── TAB 1: CHANNELS ── */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* My Channel Section */}
            {myChannel && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Channel</h3>
                <YouTubeChannelCard competitor={myChannel} />
              </section>
            )}

            {/* Competitor Channels Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Competitors ({competitorChannels.length})
                </h3>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-red-500" /> Loading channels...
                </div>
              ) : competitorChannels.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center border border-dashed">
                  <Youtube className="w-12 h-12 text-red-500/40 mx-auto mb-3" />
                  <h3 className="font-bold text-foreground text-base">No Competitor Channels Tracked</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                    Add YouTube channels of your competitors to benchmark upload velocity and performance.
                  </p>
                  <AddYouTubeCompetitorModal />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredCompetitorChannels.map((channel) => (
                    <YouTubeChannelCard key={channel.id} competitor={channel} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── TAB 2: VIDEOS ── */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            {competitors.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center border border-dashed">
                <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-bold text-foreground text-base">No Channels Configured</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add YouTube channels to track new uploads and shorts automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Channel Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground mr-1">Select Channel:</span>
                  {competitors.map((c) => {
                    const active = (selectedChannelId || competitors[0]?.id) === c.id;
                    return (
                      <Button
                        key={c.id}
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        className="text-xs h-7 gap-1.5"
                        onClick={() => setSelectedChannelId(c.id)}
                      >
                        <Youtube className="w-3 h-3 text-red-500" />
                        {c.channel?.channel_name || c.name}
                      </Button>
                    );
                  })}
                </div>

                <div className="glass-card rounded-xl p-5">
                  <YouTubeVideoList competitorId={activeChannelId} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: GAPS ── */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base">YouTube Content Gaps</h3>
                <p className="text-xs text-muted-foreground">Topics and video formats with high interest but low competition</p>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs"
                onClick={() => generateGaps?.mutate?.()}
                disabled={isGapsLoading || competitors.length === 0}
              >
                {isGapsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Discover New Gaps
              </Button>
            </div>

            {(!ytGaps || ytGaps.length === 0) ? (
              <div className="glass-card rounded-xl p-12 text-center border border-dashed">
                <Target className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h4 className="font-bold text-foreground text-sm">No Topic Gaps Identified</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                  Run YouTube Gap Analysis to discover high-value video opportunities.
                </p>
                <Button size="sm" onClick={() => generateGaps?.mutate?.()}>
                  Generate Gaps
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ytGaps.map((gap: any, idx: number) => (
                  <Card key={gap.id || idx} className="glass-card border-l-4 border-l-amber-500">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{gap.topic}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Score: {gap.opportunity_score || 85}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{gap.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: INSIGHTS ── */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-base">YouTube Competitive Insights</h3>
            {ytInsights.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center border border-dashed">
                <Sparkles className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No YouTube Insights Generated Yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Run channel scans to trigger automated AI performance insights.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {ytInsights.map((insight: any) => (
                  <Card key={insight.id} className="glass-card border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground text-sm">{insight.title}</h4>
                        <span className="text-[10px] uppercase font-bold text-primary">{insight.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: REPORTS ── */}
        {activeTab === 'reports' && (
          <div className="glass-card rounded-xl p-8 text-center space-y-4">
            <FileBarChart className="w-12 h-12 text-indigo-400 mx-auto" />
            <div>
              <h3 className="font-bold text-foreground text-base">YouTube Performance Benchmark Report</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Aggregated cross-channel analytics covering subscriber velocity, average view rates, and upload schedules.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                Export Summary
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default YouTubeIntelligence;
