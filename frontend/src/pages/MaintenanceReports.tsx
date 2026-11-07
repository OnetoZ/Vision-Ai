import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { useMaintenance, MaintenanceFinding } from '@/hooks/useMaintenance';
import { Link2Off, ShieldAlert, Zap, AlertTriangle, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const MaintenanceReports = () => {
  const { data, isLoading, error } = useMaintenance();
  
  const findings = data?.findings || [];
  
  const brokenLinks = findings.filter(f => f.rule === 'BROKEN_LINK');
  const sslIssues = findings.filter(f => f.rule.startsWith('SSL_'));
  const speedIssues = findings.filter(f => f.rule.startsWith('PAGESPEED_'));

  return (
    <AppLayout>
      <Header
        title="Maintenance & Health Dashboard"
        subtitle="Track broken links, site speed, and SSL certificate health across competitors."
      />
      
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
           <div className="text-destructive p-4 bg-destructive/10 rounded-lg">
             Failed to load maintenance data. Please try again.
           </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Link2Off className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Link2Off className="w-4 h-4 text-destructive" />
                    Broken Links
                  </h3>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {brokenLinks.length}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">dead URLs</span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Pages returning 4xx or 5xx errors.
                  </p>
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-warning" />
                    SSL Certificate Warnings
                  </h3>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {sslIssues.length}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">expiring/expired</span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Certificates expiring in less than 30 days.
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    PageSpeed Issues
                  </h3>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {speedIssues.length}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">poor performing</span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Lighthouse scores below 90/100.
                  </p>
                </div>
              </div>
            </div>

            {/* Tracked Sites Health Table */}
            <div className="glass-card rounded-xl overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Tracked Sites Health</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                    <tr>
                      <th className="px-6 py-4 font-medium">Site</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Issues</th>
                      <th className="px-6 py-4 font-medium">Last Analyzed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.trackedSites?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No sites are currently being tracked.
                        </td>
                      </tr>
                    ) : (
                      data?.trackedSites?.map((site) => (
                        <tr key={site.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{site.name}</div>
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
                              {site.url.replace(/^https?:\/\//, '')}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full border",
                              site.type === 'self' ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-secondary-foreground border-border"
                            )}>
                              {site.type === 'self' ? 'My Company' : 'Competitor'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {site.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : site.status === 'crawling' ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="capitalize">{site.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {site.issuesCount === 0 && site.status === 'completed' ? (
                              <span className="text-success font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Healthy
                              </span>
                            ) : site.issuesCount > 0 ? (
                              <span className="text-destructive font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {site.issuesCount} Issues
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                            {site.lastAnalyzed ? format(new Date(site.lastAnalyzed), 'MMM d, yyyy h:mm a') : 'Pending'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Findings Table */}
            <div className="glass-card rounded-xl overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Maintenance Findings Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                    <tr>
                      <th className="px-6 py-4 font-medium">Severity</th>
                      <th className="px-6 py-4 font-medium">Competitor</th>
                      <th className="px-6 py-4 font-medium">Issue Type</th>
                      <th className="px-6 py-4 font-medium">URL</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium">Discovered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {findings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No maintenance issues found! All tracked sites are healthy.
                        </td>
                      </tr>
                    ) : (
                      findings.map((finding) => (
                        <tr key={finding.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                              finding.severity === 'critical' ? "bg-destructive/10 text-destructive border-destructive/20" :
                              finding.severity === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                              finding.severity === 'medium' ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-muted text-muted-foreground border-border"
                            )}>
                              {finding.severity === 'critical' ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {finding.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                            {finding.competitorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                              {finding.rule.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <a 
                              href={finding.pageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline max-w-[200px] truncate block"
                              title={finding.pageUrl}
                            >
                              {finding.pageUrl.replace(/^https?:\/\//, '')}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground max-w-xs">
                            {finding.description}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                            {finding.date ? format(new Date(finding.date), 'MMM d, yyyy') : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default MaintenanceReports;
