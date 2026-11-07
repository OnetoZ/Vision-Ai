import { useState } from 'react';
import { Globe, Loader2, Plus } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCompetitors } from '@/hooks/useCompetitors';
import { toast } from 'sonner';

interface AddCompetitorModalProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const AddCompetitorModal = ({ children, open, onOpenChange }: AddCompetitorModalProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<'direct' | 'indirect' | 'aspirational'>('direct');

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const { competitors, addCompetitor } = useCompetitors();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (competitors.length >= 10) {
            toast.error('Maximum limit of 10 competitors reached.');
            return;
        }

        if (competitors.some(c => c.url.toLowerCase() === url.toLowerCase())) {
            toast.error('This competitor URL is already being tracked.');
            return;
        }

        try {
            await addCompetitor.mutateAsync({
                url,
                name,
                type,
                industry: 'Web Agency',
            });

            setUrl('');
            setName('');
            toast.success("Competitor added successfully!");
            setOpen(false);
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to add competitor");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Competitor</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass-card sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Competitor</DialogTitle>
                        <DialogDescription>
                            Enter the competitive landscape details. We'll start a background crawl immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Competitor Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Acme Corp"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">Website URL</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://competitor.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="pl-10 bg-background/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Competitor Type</Label>
                            <Select value={type} onValueChange={(value: 'direct' | 'indirect' | 'aspirational') => setType(value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct">Direct Competitor</SelectItem>
                                    <SelectItem value="indirect">Indirect Competitor</SelectItem>
                                    <SelectItem value="aspirational">Aspirational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addCompetitor.isPending} className="bg-gradient-primary">
                            {addCompetitor.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add & Analyze
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCompetitorModal;
