import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, Info, AlertCircle, Zap, Shield, Target, Sparkles, RefreshCw, BarChart } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePriceMonitor, PriceMonitorData } from '@/hooks/usePriceMonitor';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

const pricingData = [
  { name: 'Acme Corp', basic: 29, pro: 79, enterprise: 199 },
  { name: 'TechFlow', basic: 19, pro: 49, enterprise: 149 },
  { name: 'DataSync', basic: 25, pro: 69, enterprise: 179 },
  { name: 'CloudBase', basic: 35, pro: 89, enterprise: 249 },
  { name: 'StartupX', basic: 15, pro: 39, enterprise: 99 },
];

const priceChanges = [
  {
    id: '1',
    competitor: 'Acme Corp',
    tier: 'Pro',
    oldPrice: 49,
    newPrice: 79,
    change: 61,
    date: '2 days ago',
  },
  {
    id: '2',
    competitor: 'StartupX',
    tier: 'Enterprise',
    oldPrice: 149,
    newPrice: 99,
    change: -34,
    date: '5 days ago',
  },
  {
    id: '3',
    competitor: 'TechFlow',
    tier: 'Basic',
    oldPrice: 25,
    newPrice: 19,
    change: -24,
    date: '1 week ago',
  },
];

const Pricing = () => {
  const { data: monitorData, isLoading } = usePriceMonitor();

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'Aggressive': return <Zap className="w-4 h-4 text-warning" />;
      case 'Balanced': return <Shield className="w-4 h-4 text-primary" />;
      case 'Premium': return <Sparkles className="w-4 h-4 text-accent" />;
      case 'Penetration': return <Target className="w-4 h-4 text-success" />;
      default: return null;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Entry': return 'bg-secondary text-muted-foreground';
      case 'Mid': return 'bg-primary/10 text-primary border-primary/20';
      case 'Premium': return 'bg-accent/10 text-accent border-accent/20';
      case 'Enterprise': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-secondary';
    }
  };

  const chartData = (monitorData || []).map(item => ({
    name: item.name,
    entry: item.plans[0]?.price || 0,
    mid: item.plans[1]?.price || 0,
  }));

  return (
    <AppLayout>
      <Header
        title="Price Monitor"
        subtitle="Understand competitor pricing strategies and market positioning"
      />
      <div className="p-6 space-y-6">
        {/* Price Monitor Table */}
        <div className="glass-card rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Market Comparison</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Auto-detected pricing tiers and strategy analysis</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Competitor</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Tier</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Change</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing pricing pages...
                      </div>
                    </td>
                  </tr>
                ) : (monitorData || []).map((item) => (
                  item.plans.map((plan, idx) => (
                    <tr key={plan.id} className="hover:bg-secondary/50 transition-colors group">
                      <td className="px-5 py-4">
                        {idx === 0 && (
                          <div>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground">{item.url}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground font-medium">{plan.name}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold text-foreground">
                          {plan.currency}{plan.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0", getTierBadge(plan.tier))}>
                          {plan.tier}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-muted-foreground">
                        {plan.lastChange}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStrategyIcon(plan.strategy)}
                          <span className="text-xs font-semibold text-foreground">{plan.strategy}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Strategic Positioning</h3>
              <div className="flex gap-4 text-[10px] uppercase font-bold">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Entry</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> Mid</div>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="entry" fill="hsl(189, 94%, 53%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="mid" fill="hsl(262, 80%, 60%)" radius={[2, 2, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Strategy Insights */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Pricing Intelligence</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:scale-125 transition-transform">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h4 className="text-xs font-bold text-primary uppercase mb-1">Market Sentiment</h4>
                <p className="text-sm text-foreground font-medium">Competitors are shifting towards Value-Based tiers.</p>
                <p className="text-xs text-muted-foreground mt-1">3 tracking points detected an increase in "Pro" tier features while maintaining high entry-level competition.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-secondary/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Entry Avg.</p>
                  <p className="text-xl font-bold text-foreground">₹1,240</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-secondary/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Volatility</p>
                  <p className="text-xl font-bold text-warning">Medium</p>
                </div>
              </div>

              <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border">
                Export Strategic Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Pricing;
