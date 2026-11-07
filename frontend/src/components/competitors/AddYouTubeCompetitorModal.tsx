import React, { useState } from 'react';
import { Youtube, Loader2, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useYouTubeCompetitors } from '@/hooks/useYouTubeCompetitors';
import { toast } from 'sonner';

interface AddYouTubeCompetitorModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSelf?: boolean;
}

const AddYouTubeCompetitorModal = ({
  children,
  open,
  onOpenChange,
  isSelf = false,
}: AddYouTubeCompetitorModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [url, setUrl] = useState('');

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const { competitors, addCompetitor } = useYouTubeCompetitors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a YouTube channel URL or ID.');
      return;
    }

    if (competitors.some((c) => c.url.toLowerCase() === url.trim().toLowerCase())) {
      toast.error('This YouTube channel is already being tracked.');
      return;
    }

    try {
      await addCompetitor.mutateAsync(url.trim());
      setUrl('');
      setOpen(false);
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to add YouTube channel');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-red-600 hover:bg-red-700 text-white transition-all gap-2 shadow-sm">
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">{isSelf ? 'Track Your Channel' : 'Add YouTube Channel'}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <Youtube className="w-5 h-5" />
              </div>
              <DialogTitle>{isSelf ? 'Track Your Channel' : 'Track YouTube Competitor'}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Add any public YouTube channel to analyze upload patterns, video formats, engagement benchmarks, and content gaps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="yt-url">YouTube Channel URL or Handle</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <Input
                  id="yt-url"
                  placeholder="https://www.youtube.com/@channelname or UC..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <Info className="w-3.5 h-3.5 text-red-400" /> Supported Formats
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Channel handle: <code>https://youtube.com/@mkbhd</code></li>
                <li>Channel URL: <code>https://youtube.com/channel/UC...</code></li>
                <li>Custom URL: <code>https://youtube.com/c/customname</code></li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addCompetitor.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={addCompetitor.isPending}
            >
              {addCompetitor.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                'Add Channel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYouTubeCompetitorModal;
