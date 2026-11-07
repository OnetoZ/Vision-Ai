import { useState } from 'react';
import { Sparkles, Target, AlertTriangle, TrendingUp, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useInsights, Insight as ApiInsight } from '@/hooks/useInsights';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'opportunity':
      return Target;
    case 'threat':
      return AlertTriangle;
    case 'trend':
    case 'recommendation':
      return TrendingUp;
    default:
      return Sparkles;
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'opportunity':
      return 'border-success/30 bg-success/5';
    case 'threat':
      return 'border-destructive/30 bg-destructive/5';
    case 'trend':
    case 'recommendation':
      return 'border-primary/30 bg-primary/5';
    default:
      return 'border-border bg-card';
  }
};

const getIconStyles = (type: string) => {
  switch (type) {
    case 'opportunity':
      return 'text-success bg-success/20';
    case 'threat':
      return 'text-destructive bg-destructive/20';
    case 'trend':
    case 'recommendation':
      return 'text-primary bg-primary/20';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const Insights = () => {
  const [activeFilter, setActiveFilter] = useState<'high' | 'opportunity' | 'actioned' | null>(null);
  
  const { insights, isLoading, generateInsights } = useInsights();

  const highImpactCount = insights.filter((i) => i.priority === 'high').length;
  const opportunityCount = insights.filter((i) => i.insight_type === 'opportunity').length;
  const actionedCount = 0; // We don't have actioned status in backend yet

  const filteredInsights = insights.filter((insight) => {
    if (!activeFilter) return true;
    if (activeFilter === 'high') return insight.priority === 'high';
    if (activeFilter === 'opportunity') return insight.insight_type === 'opportunity';
    return true;
  });

  return (
    <AppLayout>
      <Header
        title="AI Insights"
        subtitle="Strategic recommendations powered by AI analysis"
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className={cn("metric-card cursor-pointer transition-all hover:border-primary", activeFilter === 'new' && 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]')}
            onClick={() => setActiveFilter(activeFilter === 'new' ? null : 'new')}
          >
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">New Insights</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{newCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending review</p>
          </div>
          <div 
            className={cn("metric-card cursor-pointer transition-all hover:border-destructive", activeFilter === 'high' && 'border-destructive shadow-[0_0_15px_rgba(var(--destructive),0.2)]')}
            onClick={() => setActiveFilter(activeFilter === 'high' ? null : 'high')}
          >
            <div className="flex items-center gap-2 text-destructive mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">High Impact</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{highImpactCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </div>
          <div 
            className={cn("metric-card cursor-pointer transition-all hover:border-success", activeFilter === 'opportunity' && 'border-success shadow-[0_0_15px_rgba(var(--success),0.2)]')}
            onClick={() => setActiveFilter(activeFilter === 'opportunity' ? null : 'opportunity')}
          >
            <div className="flex items-center gap-2 text-success mb-3">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Opportunities</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{opportunitiesCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Growth signals</p>
          </div>
          <div 
            className={cn("metric-card cursor-pointer transition-all hover:border-accent", activeFilter === 'actioned' && 'border-accent shadow-[0_0_15px_rgba(var(--accent),0.2)]')}
            onClick={() => setActiveFilter(activeFilter === 'actioned' ? null : 'actioned')}
          >
            <div className="flex items-center gap-2 text-accent mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Actioned</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {actionedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Insights Log</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(null)}
              className={cn("transition-all duration-300", activeFilter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none')}
            >
              Show All Insights
            </Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl glass-card">
              <p className="text-muted-foreground">No insights found.</p>
              <Button 
                onClick={() => generateInsights.mutate({})} 
                className="mt-4"
                disabled={isLoading || generateInsights.isPending}
              >
                {generateInsights.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Insights"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight) => {
              const TypeIcon = getTypeIcon(insight.insight_type);
              
              return (
                <div
                  key={insight.id}
                  className={cn(
                    'glass-card rounded-xl p-5 border transition-all hover:scale-[1.01]',
                    getTypeStyles(insight.insight_type)
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl', getIconStyles(insight.insight_type))}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                insight.priority === 'high' && 'badge-danger',
                                insight.priority === 'medium' && 'badge-warning',
                                insight.priority === 'low' && 'badge-info'
                              )}
                            >
                              {insight.priority} priority
                            </span>
                            <span
                              className={cn(
                                'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                                !insight.is_read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {!insight.is_read && <Sparkles className="w-3 h-3" />}
                              {!insight.is_read ? 'New' : 'Read'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground text-lg">{insight.title}</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(insight.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">{insight.description}</p>
                      {insight.action_items && insight.action_items.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-foreground mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {insight.action_items.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                          Take Action
                        </Button>
                        <Button variant="outline" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </AppLayout>
  );
};

export default Insights;