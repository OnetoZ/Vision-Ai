import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { useInsights } from '@/hooks/useInsights';
import { Button } from '@/components/ui/button';

const InsightsPanel = () => {
  const navigate = useNavigate();
  const { insights, isLoading, generateInsights } = useInsights();

  const displayInsights = (insights || []).slice(0, 3);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl border border-border/50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-semibold text-foreground">AI Strategic Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground">Analyzing market signals...</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">AI Intelligence Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/insights')}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {displayInsights.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground mb-3">No insights generated yet.</p>
            <Button size="sm" onClick={() => generateInsights.mutate()} disabled={generateInsights.isPending}>
              Generate Insights
            </Button>
          </div>
        ) : (
          displayInsights.map((insight: any, idx: number) => (
            <div
              key={insight.id || idx}
              className="p-3 rounded-lg bg-card/60 border border-border/40 hover:border-primary/40 transition-all cursor-pointer"
              onClick={() => navigate('/insights')}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1 rounded-md bg-primary/10 text-primary">
                  {insight.type === 'pricing' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : insight.priority === 'high' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{insight.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{insight.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
