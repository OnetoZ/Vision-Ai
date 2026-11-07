import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Video, Eye, ThumbsUp, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface YouTubeVideoListProps {
  competitorId?: string;
}

export interface YouTubeVideoItem {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  published_at: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  thumbnail_url?: string;
  is_short?: boolean;
}

export const YouTubeVideoList: React.FC<YouTubeVideoListProps> = ({ competitorId }) => {
  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ['youtube-videos', competitorId],
    queryFn: async (): Promise<YouTubeVideoItem[]> => {
      if (!competitorId) return [];
      try {
        const response = await fetchApi(`/youtube/competitors/${competitorId}/videos`);
        return Array.isArray(response) ? response : (response.videos || []);
      } catch {
        return [];
      }
    },
    enabled: !!competitorId,
  });

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading video feed...
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
        <Video className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="font-medium text-foreground">No recent videos found</p>
        <p className="text-xs text-muted-foreground mt-1">
          When this channel publishes new uploads or shorts, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tracked Releases ({videos.length})
        </h4>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-7 text-xs">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {videos.map((vid) => (
          <div
            key={vid.id || vid.video_id}
            className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-all flex gap-3"
          >
            {vid.thumbnail_url ? (
              <img
                src={vid.thumbnail_url}
                alt={vid.title}
                className="w-24 h-16 rounded object-cover shrink-0 border border-border/50 bg-secondary"
              />
            ) : (
              <div className="w-24 h-16 rounded bg-secondary flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                  {vid.title}
                </h5>
                <a
                  href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-red-500 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {formatNumber(vid.view_count)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {formatNumber(vid.like_count)}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" /> {formatDate(vid.published_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeVideoList;

