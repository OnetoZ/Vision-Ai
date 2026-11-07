import React, { useState } from 'react';
import { FileText, ExternalLink, TrendingUp, BarChart3, Info, RefreshCw, Flame, Globe, Youtube } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContentTracker } from '@/hooks/useContentTracker';
import { useYouTubeCompetitors } from '@/hooks/useYouTubeCompetitors';
import YouTubeVideoList from '@/components/youtube/YouTubeVideoList';

const Content = () => {
  const [sourceFilter, setSourceFilter] = useState<'website' | 'youtube'>('website');
  const { data: trackerData, isLoading, refetch } = useContentTracker();
  const { competitors: ytCompetitors } = useYouTubeCompetitors();
  const [selectedYtCompId, setSelectedYtCompId] = useState<string | null>(null);

  const getMomentumBadge = (momentum: string) => {
    switch (momentum) {
      case 'High':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low':
        return 'text-muted-foreground bg-secondary border-border';
      default:
        return 'bg-secondary';
    }
  };

  const totalArticles = (trackerData || []).reduce((acc, curr) => acc + (curr.articleCount || 0), 0);
  const activeCompetitors = (trackerData || []).filter(c => (c.articleCount || 0) > 0).length;

  return (
    <AppLayout>
      <Header
        title="Content Tracker"
        subtitle="Monitor competitor publishing frequency and strategic content shifts"
      />
      <div className="p-6 space-y-6">
        {/* Source Switcher */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Button
            variant={sourceFilter === 'website' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => setSourceFilter('website')}
          >
            <Globe className="w-3.5 h-3.5" />
            Website Articles & Pages
          </Button>
          <Button
            variant={sourceFilter === 'youtube' ? 'default' : 'outline'}
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => setSourceFilter('youtube')}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            YouTube Video Tracking ({ytCompetitors.length} Channels)
          </Button>
        </div>

        {sourceFilter === 'youtube' && (
          <div className="space-y-6">
            {ytCompetitors.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center border border-dashed">
                <Youtube className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-foreground text-base">No YouTube Channels Tracked</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add competitor YouTube channels to track video releases, Shorts vs long-form cadence, and performance.
                </p>
                <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => window.location.href = '/competitors'}>
                  Add YouTube Competitor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Channel Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground mr-1">Select Channel:</span>
                  {ytCompetitors.map((c) => {
                    const active = (selectedYtCompId || ytCompetitors[0]?.id) === c.id;
                    return (
                      <Button
                        key={c.id}
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        className="text-xs h-7 gap-1.5"
                        onClick={() => setSelectedYtCompId(c.id)}
                      >
                        <Youtube className="w-3 h-3 text-red-500" />
                        {c.channel?.channel_name || c.name}
                      </Button>
                    );
                  })}
                </div>

                <div className="glass-card rounded-xl p-5">
                  <YouTubeVideoList competitorId={selectedYtCompId || ytCompetitors[0]?.id} />
                </div>
              </div>
            )}
          </div>
        )}

        {sourceFilter === 'website' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl p-5 border-l-4 border-primary shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Articles Tracked</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalArticles}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 border-l-4 border-success shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Publishers</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{activeCompetitors}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 border-l-4 border-warning shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Competitors Monitored</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{(trackerData || []).length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 border-l-4 border-accent shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Crawler Status</p>
                  <p className="text-sm font-semibold text-foreground mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Active
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => refetch()} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Competitors Publishing Overview */}
            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Competitor Content Velocity</h3>
                <Badge variant="outline" className="text-xs">Live Sync</Badge>
              </div>
              <div className="divide-y divide-border/40">
                {isLoading ? (
                  <div className="flex justify-center p-8 text-muted-foreground text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading content metrics...
                  </div>
                ) : (trackerData || []).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <p>No competitor websites configured yet. Add competitors to begin tracking their content.</p>
                  </div>
                ) : (
                  (trackerData || []).map((comp) => (
                    <div key={comp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{comp.name}</span>
                          <Badge variant="outline" className={getMomentumBadge(comp.momentum || 'Low')}>
                            {comp.momentum === 'High' && <Flame className="w-3 h-3 mr-1 inline" />}
                            {comp.momentum || 'Normal'} Momentum
                          </Badge>
                        </div>
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-md"
                        >
                          {comp.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Cadence</p>
                          <p className="text-sm font-medium text-foreground">{comp.publishingFrequency || '1-2 posts / week'}</p>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <p className="text-xs text-muted-foreground">Articles</p>
                          <p className="text-base font-bold text-primary">{comp.articleCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Content Feed */}
            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Recent Detected Articles & Changes</h3>
              </div>
              <div className="p-5 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8 text-muted-foreground text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading feed...
                  </div>
                ) : (trackerData || []).every(c => !c.feed || c.feed.length === 0) ? (
                  <div className="p-8 rounded-xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-muted-foreground text-sm">
                    <Info className="w-6 h-6 mb-2 text-warning" />
                    <p className="font-medium">No recent articles or pages detected</p>
                    <p className="text-xs mt-1">Crawl competitors or run a content sync to populate changes.</p>
                  </div>
                ) : (
                  (trackerData || []).map((comp) => (
                    (comp.feed || []).map((post: any, idx: number) => (
                      <div key={`${comp.id}-${idx}`} className="p-4 rounded-lg bg-card/60 border border-border/50 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary">{comp.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{post.discovered_at || post.date || 'Recently detected'}</span>
                          </div>
                          <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            {post.title || post.url || 'Updated Page'}
                          </h4>
                          {post.snippet && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{post.snippet}</p>
                          )}
                        </div>
                        {post.url && (
                          <Button size="icon" variant="ghost" asChild className="shrink-0 h-8 w-8">
                            <a href={post.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Content;
