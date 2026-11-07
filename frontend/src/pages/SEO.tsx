import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Link2, Gauge, Target, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useSEOAdvisor, SEOAdvisorData } from '@/hooks/useSEOAdvisor';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const SEO = () => {
  const { data: advisorData, isLoading } = useSEOAdvisor();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getCategoryData = () => {
    if (expandedId && advisorData) {
      const comp = advisorData.find(c => c.id === expandedId);
      if (comp) {
        return [
          { subject: 'On-Page', score: comp.scores.onPage, fullMark: 100 },
          { subject: 'Technical', score: comp.scores.technical, fullMark: 100 },
          { subject: 'Content', score: comp.scores.content, fullMark: 100 },
        ];
      }
    }
    
    // Average across all
    if (advisorData && advisorData.length > 0) {
      const avgOnPage = Math.round(advisorData.reduce((acc, curr) => acc + curr.scores.onPage, 0) / advisorData.length);
      const avgTechnical = Math.round(advisorData.reduce((acc, curr) => acc + curr.scores.technical, 0) / advisorData.length);
      const avgContent = Math.round(advisorData.reduce((acc, curr) => acc + curr.scores.content, 0) / advisorData.length);
      return [
        { subject: 'On-Page', score: avgOnPage, fullMark: 100 },
        { subject: 'Technical', score: avgTechnical, fullMark: 100 },
        { subject: 'Content', score: avgContent, fullMark: 100 },
      ];
    }
    
    return [];
  };

  const categoryData = getCategoryData();

  return (
    <AppLayout>
      <Header
        title="SEO Advisor"
        subtitle="Compare SEO strength across competitors and identify winning strategies"
      />
      <div className="p-6 space-y-6">
        {/* Top Competitor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(advisorData || []).slice(0, 5).map(comp => (
            <div key={comp.id} className="glass-card rounded-xl p-4 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden">
               {comp.scores.overall >= 90 && (
                 <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-primary">
                    <Target className="w-3 h-3" /> SEO Leader
                 </div>
               )}
               <div className="flex items-center gap-2 mb-3">
                 <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs", 
                   comp.scores.overall >= 90 ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning")}>
                   {comp.name.substring(0, 2).toUpperCase()}
                 </div>
                 <span className="font-semibold text-foreground text-sm truncate">{comp.name}</span>
               </div>
               <div className="flex items-baseline">
                 <span className={cn("text-3xl font-black", getScoreColor(comp.scores.overall))}>{comp.scores.overall}</span>
               </div>
            </div>
          ))}
        </div>
        {/* Top Section: Overall SEO Scores Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-6">Overall SEO Scores</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={advisorData || []} layout="vertical" barSize={24} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }} />
                  <Bar dataKey="scores.overall" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center">
             <h3 className="font-semibold text-foreground mb-2">SEO Category Breakdown</h3>
             <p className="text-sm text-muted-foreground text-center mb-6">
                {expandedId && advisorData ? 
                   `Performance for ${advisorData.find(c => c.id === expandedId)?.name}` : 
                   'Average Performance across all competitors'}
             </p>
             <div className="flex-1 w-full flex items-center justify-center h-[200px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                      <PolarGrid stroke="hsl(215, 20%, 35%)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="opacity-50 text-center">
                    <p className="text-xs text-muted-foreground italic text-center max-w-sm">
                      Select a competitor from the detailed comparison table below to view their specific category breakdown.
                    </p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="glass-card rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Detailed Comparison</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Click a competitor to view detailed drill-down</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-[200px]">Competitor</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">On-Page SEO</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Technical SEO</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Content SEO</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall</th>
                  <th className="px-5 py-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing SEO landscape...
                      </div>
                    </td>
                  </tr>
                ) : (advisorData || []).map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className={cn(
                        "hover:bg-secondary/50 transition-colors cursor-pointer group",
                        expandedId === item.id && "bg-secondary/40"
                      )}
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.url}</div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className={cn("text-sm font-bold w-6", getScoreColor(item.scores.onPage))}>{item.scores.onPage}</span>
                           <Progress value={item.scores.onPage} className={cn("w-16 h-1.5", item.scores.onPage >= 80 ? "[&>div]:bg-success" : item.scores.onPage >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive")} />
                        </div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className={cn("text-sm font-bold w-6", getScoreColor(item.scores.technical))}>{item.scores.technical}</span>
                           <Progress value={item.scores.technical} className={cn("w-16 h-1.5", item.scores.technical >= 80 ? "[&>div]:bg-success" : item.scores.technical >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive")} />
                        </div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className={cn("text-sm font-bold w-6", getScoreColor(item.scores.content))}>{item.scores.content}</span>
                           <Progress value={item.scores.content} className={cn("w-16 h-1.5", item.scores.content >= 80 ? "[&>div]:bg-success" : item.scores.content >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive")} />
                        </div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className={cn("text-sm font-bold w-6 text-primary")}>{item.scores.overall}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                        {expandedId === item.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </td>
                    </tr>

                    {/* Drill-down Section */}
                    {expandedId === item.id && (
                      <tr className="bg-secondary/20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <td colSpan={6} className="px-10 py-8 border-y border-border/10">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* On-Page SEO Drill-down */}
                            <div className="space-y-5">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <Gauge className="w-4 h-4 text-primary" />
                                On-Page SEO Breakdown
                              </h4>
                              <div className="space-y-4">
                                {item.details.onPage.checks.map((check, i) => (
                                  <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{check.label}</span>
                                      <span className={cn("font-bold", getScoreColor(check.score))}>{check.score}</span>
                                    </div>
                                    <Progress value={check.score} className="h-1.5" />
                                    {check.issue && (
                                      <p className="text-[10px] text-destructive flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        {check.issue}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Technical SEO Drill-down */}
                            <div className="space-y-5">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <Search className="w-4 h-4 text-accent" />
                                Technical SEO Checklist
                              </h4>
                              <div className="space-y-4">
                                {item.details.technical.checks.map((check, i) => (
                                  <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{check.label}</span>
                                      <span className={cn("font-bold", getScoreColor(check.score))}>{check.score}</span>
                                    </div>
                                    <Progress value={check.score} className="h-1.5" />
                                    {check.issue && (
                                      <p className="text-[10px] text-destructive flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        {check.issue}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Content SEO Drill-down */}
                            <div className="space-y-5">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <TrendingUp className="w-4 h-4 text-success" />
                                Content Strategy Insights
                              </h4>
                              <div className="space-y-4">
                                {item.details.content.checks.map((check, i) => (
                                  <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{check.label}</span>
                                      <span className={cn("font-bold", getScoreColor(check.score))}>{check.score}</span>
                                    </div>
                                    <Progress value={check.score} className="h-1.5" />
                                    {check.issue && (
                                      <p className="text-[10px] text-destructive flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        {check.issue}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                <div className="pt-4 bg-primary/5 rounded-lg p-3 border border-primary/10">
                                  <p className="text-[10px] font-bold text-primary uppercase mb-1">Gap Finder Suggestion</p>
                                  <p className="text-xs text-muted-foreground italic">"Increase service page depth by 500 words to match competitor average."</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Search className="w-4 h-4" />
              <span className="text-sm">Avg. Landscape Score</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {advisorData?.length ? Math.round(advisorData.reduce((acc, curr) => acc + curr.scores.overall, 0) / advisorData.length) : 0}
            </p>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Target className="w-4 h-4" />
              <span className="text-sm">Critical Issues</span>
            </div>
            <p className="text-3xl font-bold text-destructive">12</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Top Competitor</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {advisorData?.length ? [...advisorData].sort((a, b) => b.scores.overall - a.scores.overall)[0]?.name : 'N/A'}
            </p>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Gauge className="w-4 h-4" />
              <span className="text-sm">Scan Refresh</span>
            </div>
            <p className="text-lg font-medium text-foreground">Ready</p>
            <Button variant="ghost" size="sm" className="px-0 h-auto text-primary text-xs mt-1">Request new scan</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SEO;
