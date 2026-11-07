import { MoreHorizontal, ExternalLink, TrendingUp, TrendingDown, Clock, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCompetitors } from '@/hooks/useCompetitors';
import { calculateHealthScore, getHealthColor, getHealthLabel } from '@/lib/healthScore';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CompetitorList = () => {
  const navigate = useNavigate();
  const { competitors, isLoading } = useCompetitors();

  const getStatusEmoji = (url: string) => {
    const emojis = ['🏢', '⚡', '🚀', '💼', '🌐', '📊', '🎯', '💡'];
    const index = url.length % emojis.length;
    return emojis[index];
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Tracked Competitors</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary"
          onClick={() => navigate('/competitors')}
        >
          View All
        </Button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading competitors...</div>
        ) : competitors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No competitors tracked yet.</div>
        ) : (
          [...competitors].sort((a, b) => {
            if (a.competitor_type === 'self') return -1;
            if (b.competitor_type === 'self') return 1;
            return 0;
          }).slice(0, 5).map((competitor) => {
            const getDeterministicScore = (seed: string, offset: number) => {
              let hash = 0;
              const combinedSeed = seed + offset;
              for (let i = 0; i < combinedSeed.length; i++) {
                hash = combinedSeed.charCodeAt(i) + ((hash << 5) - hash);
              }
              return 60 + (Math.abs(hash) % 35); // Score between 60-95
            };

            const healthScore = calculateHealthScore({
              seo: getDeterministicScore(competitor.id, 1),
              content: getDeterministicScore(competitor.id, 2),
              pricing: 75,
              stability: 90
            });
            const type = competitor.metadata?.type || 'direct';

            return (
              <div
                key={competitor.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/competitors`)}
              >
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden">
                  <img 
                    src={`https://s2.googleusercontent.com/s2/favicons?domain=${new URL(competitor.url).hostname}&sz=128`} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.textContent = getStatusEmoji(competitor.url);
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{competitor.name}</p>
                    <span className={cn(
                      'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold',
                      competitor.competitor_type === 'self' ? 'bg-primary text-primary-foreground' :
                      competitor.competitor_type === 'direct' ? 'bg-primary/10 text-primary' :
                      competitor.competitor_type === 'indirect' ? 'bg-accent/10 text-accent' :
                      'bg-warning/10 text-warning'
                    )}>
                      {competitor.competitor_type === 'self' ? 'My Company' : competitor.competitor_type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="hidden sm:flex ml-2">
                  {competitor.competitor_type !== 'self' && (
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompetitorList;
