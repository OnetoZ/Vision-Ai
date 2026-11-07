import { AlertCircle, DollarSign, FileText, Package, TrendingUp, Clock, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSEOGaps } from '@/hooks/useCompetitors';
import { useInsights } from '@/hooks/useInsights';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pricing':
      return DollarSign;
    case 'content':
      return FileText;
    case 'product':
      return Package;
    case 'seo':
      return TrendingUp;
    case 'alert':
      return AlertCircle;
    default:
      return Activity;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'pricing':
      return 'text-success bg-success/20';
    case 'content':
      return 'text-primary bg-primary/20';
    case 'product':
      return 'text-accent bg-accent/20';
    case 'seo':
      return 'text-warning bg-warning/20';
    case 'alert':
      return 'text-destructive bg-destructive/20';
    default:
      return 'text-muted-foreground bg-secondary';
  }
};

const ActivityFeed = () => {
  const navigate = useNavigate();
  const { data: seoGaps, isLoading: gapsLoading } = useSEOGaps();
  const { insights, isLoading: insightsLoading } = useInsights();

  // Combine gaps and insights into a single activity feed
  const activities = [
    ...(seoGaps || []).map(gap => ({
      id: gap.id,
      type: 'seo',
      title: gap.issue_type,
      description: gap.issue_description,
      competitor: gap.competitor_scans?.competitors?.name || 'Competitor',
      time: gap.created_at,
      priority: gap.severity,
      link: '/seo'
    })),
    ...(insights || []).map(insight => ({
      id: insight.id,
      type: insight.insight_type === 'threat' ? 'alert' : 'product',
      title: insight.title,
      description: insight.description,
      competitor: 'Vision AI',
      time: insight.created_at,
      priority: insight.priority,
      link: '/insights'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  const isLoading = gapsLoading || insightsLoading;

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Timeline</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate('/insights')}>
          Full Feed
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin relative p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground animate-pulse">
            Loading timeline...
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-center">
            No recent activity detected.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
            {activities.map((activity) => {
              const Icon = getTypeIcon(activity.type);
              const colorClass = getTypeColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="relative flex items-start gap-4 group cursor-pointer"
                  onClick={() => navigate(activity.link)}
                >
                  {/* Timeline Dot & Icon */}
                  <div className={cn(
                    'mt-1 w-10 h-10 rounded-full flex items-center justify-center z-10 p-2 transition-all duration-200 group-hover:scale-110 shadow-sm border border-border bg-background',
                    colorClass
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {activity.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex-shrink-0 mt-1">
                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-foreground/70 font-medium">
                        {activity.competitor}
                      </span>
                      {activity.priority === 'high' && (
                        <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" title="High Priority" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
