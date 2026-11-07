import { Users, Lightbulb, AlertTriangle, Activity, Loader2, Target, RefreshCw, Clock, Gauge, TrendingUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { useCompetitors, useSEOGaps, type SEOGap } from '@/hooks/useCompetitors';
import { useInsights } from '@/hooks/useInsights';
import { useSEOAdvisor } from '@/hooks/useSEOAdvisor';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { competitors, isLoading: competitorsLoading, refetch: refetchCompetitors } = useCompetitors();
  const { data: seoGaps, refetch: refetchGaps } = useSEOGaps();
  const { insights, generateInsights } = useInsights();
  const { data: advisorData } = useSEOAdvisor();

  const myCompany = competitors.find(c => c.competitor_type === 'self');
  const mySEO = advisorData?.find(c => c.id === myCompany?.id);
  const rawGaps: SEOGap[] = Array.isArray(seoGaps) ? seoGaps : ((seoGaps as any)?.gaps || []);
  const highPriorityGaps = rawGaps.filter((g: SEOGap) => g?.severity === 'high').length;

  const handleRefresh = async () => {
    await Promise.all([
      refetchCompetitors(),
      refetchGaps()
    ]);
  };

  const formatLastScan = () => {
    if (!myCompany?.last_scanned_at) return 'Scan Now';
    try {
      const d = new Date(myCompany.last_scanned_at);
      if (isNaN(d.getTime())) return 'Scan Now';
      return `Last scanned ${formatDistanceToNow(d, { addSuffix: true })}`;
    } catch {
      return 'Scan Now';
    }
  };

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        subtitle={`Welcome back! Here's the latest analysis for ${myCompany?.name || 'your company'}.`}
      />
      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall SEO Score"
            value={mySEO?.scores.overall || 0}
            valueSuffix="/ 100"
            change={mySEO?.scores.overall ? mySEO.scores.overall - 50 : 0}
            changeLabel="vs industry avg"
            icon={<Gauge className="w-5 h-5" />}
            variant={mySEO?.scores.overall && mySEO.scores.overall >= 80 ? 'success' : mySEO?.scores.overall && mySEO.scores.overall >= 60 ? 'warning' : 'danger'}
            onClick={() => navigate('/seo')}
          />
          <MetricCard
            title="Content Quality"
            value={mySEO?.scores.content || 0}
            valueSuffix="/ 100"
            change={mySEO?.scores.content ? mySEO.scores.content - 50 : 0}
            changeLabel="vs industry avg"
            icon={<TrendingUp className="w-5 h-5" />}
            variant={mySEO?.scores.content && mySEO.scores.content >= 80 ? 'success' : mySEO?.scores.content && mySEO.scores.content >= 60 ? 'warning' : 'danger'}
            onClick={() => navigate('/seo')}
          />
          <MetricCard
            title="Technical Health"
            value={mySEO?.scores.technical || 0}
            valueSuffix="/ 100"
            change={mySEO?.scores.technical ? mySEO.scores.technical - 50 : 0}
            changeLabel="vs industry avg"
            icon={<Search className="w-5 h-5" />}
            variant={mySEO?.scores.technical && mySEO.scores.technical >= 80 ? 'success' : mySEO?.scores.technical && mySEO.scores.technical >= 60 ? 'warning' : 'danger'}
            onClick={() => navigate('/seo')}
          />
          <MetricCard
            title="Active Alerts"
            value={highPriorityGaps}
            change={0}
            changeLabel="need attention"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant={highPriorityGaps > 0 ? "danger" : "success"}
            onClick={() => navigate('/gap-finder')}
          />
        </div>

        {/* Quick Actions */}
        {myCompany && (
          <div className="flex gap-3">
            <Button
              onClick={() => generateInsights.mutate({})}
              disabled={generateInsights.isPending}
              className="bg-gradient-primary"
            >
              {generateInsights.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {formatLastScan()}
            </Button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsChart showOnlySelf={true} />
            <ActivityFeed />
          </div>

          {/* Right Column - Insights */}
          <div className="lg:col-span-1 space-y-6">
            <InsightsPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
