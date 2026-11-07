import React, { useState } from 'react';
import {
  Youtube,
  ExternalLink,
  Users,
  Video,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { YouTubeCompetitor, useYouTubeCompetitors } from '@/hooks/useYouTubeCompetitors';
import YouTubeVideoList from './YouTubeVideoList';

interface YouTubeChannelCardProps {
  competitor: YouTubeCompetitor;
}

export const YouTubeChannelCard: React.FC<YouTubeChannelCardProps> = ({ competitor }) => {
  const [expanded, setExpanded] = useState(false);
  const { rescanCompetitor, deleteCompetitor } = useYouTubeCompetitors();

  const channel = competitor.channel || {};
  const isSelf = competitor.competitor_type === 'self';

  const formatNumber = (num?: number | null) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Card className="glass-card overflow-hidden border-border/50 hover:border-border transition-all">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Channel Info */}
          <div className="flex items-start gap-4">
            {channel.thumbnail_url ? (
              <img
                src={channel.thumbnail_url}
                alt={channel.channel_name || competitor.name}
                className="w-12 h-12 rounded-xl object-cover border border-border shadow-sm shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shrink-0">
                <Youtube className="w-6 h-6" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground text-base">
                  {channel.channel_name || competitor.name}
                </h3>
                {isSelf && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    Your Channel
                  </span>
                )}
                {channel.channel_handle && (
                  <span className="text-xs text-muted-foreground">
                    @{channel.channel_handle.replace(/^@/, '')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-red-400" />
                  {formatNumber(channel.subscriber_count ?? competitor.subscriber_count)} subscribers
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  {formatNumber(channel.video_count ?? competitor.video_count)} videos
                </span>
                {competitor.url && (
                  <a
                    href={competitor.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View on YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => rescanCompetitor.mutate(competitor.id)}
              disabled={rescanCompetitor.isPending}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rescanCompetitor.isPending ? 'animate-spin' : ''}`} />
              Rescan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Hide Videos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> View Videos
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (window.confirm(`Delete ${competitor.name} from tracking?`)) {
                  deleteCompetitor.mutate(competitor.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <YouTubeVideoList competitorId={competitor.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeChannelCard;
