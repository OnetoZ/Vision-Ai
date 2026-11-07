import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, ExternalLink, Clock, Activity, Trash2, RefreshCw, Loader2, Globe } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCompetitors } from '@/hooks/useCompetitors';
import { formatDistanceToNow } from 'date-fns';
import AddCompetitorModal from '@/components/competitors/AddCompetitorModal';

const Competitors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    competitors,
    isLoading,
    deleteCompetitor,
    rescanCompetitor
  } = useCompetitors();

  const getStatusEmoji = (url: string) => {
    const emojis = ['🏢', '⚡', '🚀', '💼', '🌐', '📊', '🎯', '💡'];
    const index = url.length % emojis.length;
    return emojis[index];
  };

  const filteredCompetitors = [...competitors].filter((competitor) => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || competitor.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (a.competitor_type === 'self') return -1;
    if (b.competitor_type === 'self') return 1;
    return 0;
  });

  return (
    <AppLayout>
      <Header
        title="Competitors"
        subtitle="Manage and monitor your competitive landscape"
      />
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('paused')}>Paused</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('error')}>Error</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <AddCompetitorModal />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && competitors.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Competitors Added</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start tracking your competitors by adding their website URLs. We'll automatically scrape and analyze their SEO, content, and pricing strategies.
            </p>
            <AddCompetitorModal>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Competitor
              </Button>
            </AddCompetitorModal>
          </div>
        )}

        {/* Competitors Grid */}
        {!isLoading && competitors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCompetitors.map((competitor) => (
              <div
                key={competitor.id}
                className="glass-card-hover rounded-xl p-5 animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl overflow-hidden">
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
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{competitor.name}</h3>
                        <span className={cn(
                          'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold',
                          competitor.competitor_type === 'self' ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent'
                        )}>
                          {competitor.competitor_type === 'self' ? 'My Company' : 'Competitor'}
                        </span>
                      </div>
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        {new URL(competitor.url).hostname}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => rescanCompetitor.mutate(competitor)}
                        disabled={rescanCompetitor.isPending}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Rescan Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {competitor.competitor_type !== 'self' && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteCompetitor.mutate(competitor.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground">{competitor.industry}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                        competitor.status === 'active' && 'badge-success',
                        competitor.status === 'paused' && 'badge-warning',
                        competitor.status === 'error' && 'badge-danger'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          competitor.status === 'active' && 'bg-success',
                          competitor.status === 'paused' && 'bg-warning',
                          competitor.status === 'error' && 'bg-destructive'
                        )}
                      />
                      {competitor.status.charAt(0).toUpperCase() + competitor.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Scan Frequency</span>
                    <span className="text-foreground capitalize">{competitor.scan_frequency}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {competitor.last_scanned_at
                      ? formatDistanceToNow(new Date(competitor.last_scanned_at), { addSuffix: true })
                      : 'Not scanned yet'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {competitor.metadata?.title ? 'Analyzed' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Competitors;
