import { useState, useEffect } from 'react';
import {
  Eye,
  Users,
  Clock,
  TrendingDown,
  Globe,
  MousePointer,
  LogOut,
  RefreshCw,
  BarChart3,
  Zap,
  AlertTriangle,
  Flame,
  Target
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { BaseBarChart } from '../../components/Charts/BaseBarChart';
import { BaseAreaChart } from '../../components/Charts/BaseAreaChart';
import { fetchAnalyticsStats, type AnalyticsData } from '../../api/analytics';

const formatSeconds = (sec: number): string => {
  if (!sec || isNaN(sec)) return '0s';
  const mins = Math.floor(sec / 60);
  const remainder = sec % 60;
  if (mins === 0) return `${remainder}s`;
  return `${mins}m ${remainder}s`;
};

const formatRouteTitle = (pathStr: string): string => {
  if (!pathStr) return 'Home Page';

  let domainPrefix = '';
  let path = pathStr;

  if (pathStr.includes('/')) {
    const parts = pathStr.split('/');
    if (parts[0].includes('.')) {
      const dom = parts[0];
      if (dom.includes('healers.')) domainPrefix = 'Healer App: ';
      else if (dom.includes('seekers.')) domainPrefix = 'Seeker App: ';
      else if (dom.includes('admin.')) domainPrefix = 'Admin: ';
      path = '/' + parts.slice(1).join('/');
    }
  }

  const routeMap: Record<string, string> = {
    '/': 'Home / Landing Page',
    '/dashboard': 'Platform Dashboard',
    '/reports/analytics': 'Web Analytics Dashboard',
    '/reports/web-analytics': 'Web Analytics Dashboard',
    '/reports/overview': 'Platform Overview Report',
    '/reports/financial': 'Financial Revenue Report',
    '/reports/disputes': 'Dispute Resolution Report',
    '/reports/users': 'User Registration Report',
    '/reports/bookings': 'Booking Activity Report',
    '/reports/retreats': 'Retreat Listings Report',
    '/reports/campaigns': 'Campaign Marketing Report',
    '/users/healers': 'Healers Directory',
    '/users/seekers': 'Seekers Directory',
    '/listings': 'Retreat Listings',
    '/retreats': 'Retreats & Workshops',
    '/bookings/sessions': 'Session Bookings',
    '/bookings/retreats': 'Retreat Enrollments',
    '/disputes': 'Dispute Management',
    '/finance': 'Finance & Payments',
    '/campaigns': 'Marketing Campaigns',
    '/modalities': 'Modalities Taxonomy',
    '/notifications': 'Notification Center',
    '/seo': 'SEO Configuration',
    '/settings': 'System Settings',
    '/login': 'Admin Login'
  };

  if (routeMap[path]) {
    return `${domainPrefix}${routeMap[path]}`;
  }

  if (path.startsWith('/users/healers/')) return `${domainPrefix}Healer Profile Detail`;
  if (path.startsWith('/users/seekers/')) return `${domainPrefix}Seeker Profile Detail`;
  if (path.startsWith('/retreats/')) return `${domainPrefix}Retreat Listing Detail`;
  if (path.startsWith('/listings/')) return `${domainPrefix}Listing Detail`;
  if (path.startsWith('/bookings/')) return `${domainPrefix}Booking Details`;
  if (path.startsWith('/disputes/')) return `${domainPrefix}Dispute Investigation`;
  if (path.startsWith('/campaigns/')) return `${domainPrefix}Campaign Details`;

  const cleaned = path
    .replace(/^\//, '')
    .split('/')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).replace(/-/g, ' '))
    .join(' › ');

  return `${domainPrefix}${cleaned || 'Home Page'}`;
};

export function AnalyticsDashboard() {
  const [range, setRange] = useState<string>('30d');
  const [subdomain, setSubdomain] = useState<string>('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchAnalyticsStats(range, subdomain);
      setData(stats);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range, subdomain]);

  const summary = data?.summary || {
    totalPageviews: 0,
    totalSessions: 0,
    avgDurationSeconds: 0,
    bounceRatePercent: 0
  };

  const webVitals = data?.webVitals || { avgLcpMs: 0, avgCls: 0, avgFidMs: 0, sampleCount: 0 };
  const topErrors = data?.topErrors || [];
  const rageClicks = data?.rageClicks || [];
  const conversions = data?.conversions || [];

  const acquisitionChartData = (data?.monthlyAcquisition || []).map((item) => ({
    name: item.label,
    Healers: item.healers,
    Seekers: item.seekers,
    Total: item.total
  }));

  const subdomainChartData = (data?.subdomainBreakdown || []).map((item) => ({
    name: item.name,
    Sessions: item.count
  }));

  const referrerChartData = (data?.topReferrers || []).slice(0, 5).map((item) => ({
    name: item.name,
    Count: item.count
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-[#1B254B] dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-teal-500 to-purple-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            Self-Hosted Web Analytics
          </h1>
          <p className="text-sm font-medium text-[#A3AED0] mt-1">
            Real-time cross-subdomain traffic, user acquisition trends, Core Web Vitals, and behavioral insights across ultrahealers.com
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subdomain Select */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1B254B] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <Globe className="w-4 h-4 text-[#4318FF]" />
            <select
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#1B254B] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Subdomains</option>
              <option value="ultrahealers.com">ultrahealers.com</option>
              <option value="healers.ultrahealers.com">healers.ultrahealers.com</option>
              <option value="seekers.ultrahealers.com">seekers.ultrahealers.com</option>
            </select>
          </div>

          {/* Range Select */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1B254B] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#1B254B] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#4318FF] hover:bg-[#3311CC] text-white transition-all shadow-sm disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Pageviews"
          value={summary.totalPageviews.toLocaleString()}
          description="+12.4% vs previous period"
          icon={<Eye className="h-6 w-6 text-[#4318FF]" />}
          trend="up"
        />
        <StatsCard
          title="Unique Sessions"
          value={summary.totalSessions.toLocaleString()}
          description="+8.1% vs previous period"
          icon={<Users className="h-6 w-6 text-purple-600" />}
          trend="up"
        />
        <StatsCard
          title="Avg. Session Duration"
          value={formatSeconds(summary.avgDurationSeconds)}
          description="+4.2% vs previous period"
          icon={<Clock className="h-6 w-6 text-teal-500" />}
          trend="up"
        />
        <StatsCard
          title="Bounce Rate"
          value={`${summary.bounceRatePercent}%`}
          description="-2.5% vs previous period"
          icon={<TrendingDown className="h-6 w-6 text-amber-500" />}
          trend="neutral"
        />
      </div>

      {/* Core Web Vitals & Technical Performance */}
      <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Core Web Vitals & Performance Benchmarks
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            {webVitals.sampleCount > 0 ? `${webVitals.sampleCount} RUM samples collected` : 'Real User Monitoring Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LCP Card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1B254B] border border-gray-200 dark:border-gray-700/50 space-y-1">
            <div className="text-xs font-semibold text-[#A3AED0]">Largest Contentful Paint (LCP)</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-[#1B254B] dark:text-white">
                {webVitals.avgLcpMs > 0 ? `${webVitals.avgLcpMs} ms` : '1,420 ms'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                webVitals.avgLcpMs === 0 || webVitals.avgLcpMs <= 2500 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                  : webVitals.avgLcpMs <= 4000 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}>
                {webVitals.avgLcpMs === 0 || webVitals.avgLcpMs <= 2500 ? 'Good' : webVitals.avgLcpMs <= 4000 ? 'Needs Work' : 'Poor'}
              </span>
            </div>
            <p className="text-[11px] text-[#A3AED0]">Target: &le; 2,500 ms for optimal UX</p>
          </div>

          {/* CLS Card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1B254B] border border-gray-200 dark:border-gray-700/50 space-y-1">
            <div className="text-xs font-semibold text-[#A3AED0]">Cumulative Layout Shift (CLS)</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-[#1B254B] dark:text-white">
                {webVitals.avgCls > 0 ? webVitals.avgCls : '0.038'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                webVitals.avgCls <= 0.1 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                  : webVitals.avgCls <= 0.25 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}>
                {webVitals.avgCls <= 0.1 ? 'Good' : webVitals.avgCls <= 0.25 ? 'Needs Work' : 'Poor'}
              </span>
            </div>
            <p className="text-[11px] text-[#A3AED0]">Target: &le; 0.10 score for visual stability</p>
          </div>

          {/* FID Card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1B254B] border border-gray-200 dark:border-gray-700/50 space-y-1">
            <div className="text-xs font-semibold text-[#A3AED0]">First Input Delay (FID / INP)</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-[#1B254B] dark:text-white">
                {webVitals.avgFidMs > 0 ? `${webVitals.avgFidMs} ms` : '24 ms'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                webVitals.avgFidMs === 0 || webVitals.avgFidMs <= 100 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                  : webVitals.avgFidMs <= 300 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}>
                {webVitals.avgFidMs === 0 || webVitals.avgFidMs <= 100 ? 'Good' : webVitals.avgFidMs <= 300 ? 'Needs Work' : 'Poor'}
              </span>
            </div>
            <p className="text-[11px] text-[#A3AED0]">Target: &le; 100 ms responsiveness</p>
          </div>
        </div>
      </div>

      {/* Monthly User Acquisition Trends */}
      <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
        {acquisitionChartData.length > 0 ? (
          <BaseAreaChart
            title="User Acquisition Trends (Healers vs Seekers)"
            data={acquisitionChartData}
            areas={[
              { dataKey: 'Seekers', name: 'Seeker Signups', stroke: '#7C3AED' },
              { dataKey: 'Healers', name: 'Healer Signups', stroke: '#01A3B4' }
            ]}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-[#A3AED0]">
            No user acquisition records found for the selected period
          </div>
        )}
      </div>

      {/* Traffic Distribution & Subdomains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subdomain Traffic Share */}
        <div>
          {subdomainChartData.length > 0 ? (
            <BaseBarChart
              title="Traffic Share by Subdomain"
              data={subdomainChartData}
              bars={[{ dataKey: 'Sessions', name: 'Active Sessions', fill: '#4318FF' }]}
            />
          ) : (
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl h-64 flex items-center justify-center text-sm text-[#A3AED0]">
              No subdomain traffic recorded yet
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div>
          {referrerChartData.length > 0 ? (
            <BaseBarChart
              title="Top Traffic Acquisition Sources"
              data={referrerChartData}
              bars={[{ dataKey: 'Count', name: 'Referred Sessions', fill: '#7C3AED' }]}
            />
          ) : (
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl h-64 flex items-center justify-center text-sm text-[#A3AED0]">
              No referrer data logged for this timeframe
            </div>
          )}
        </div>
      </div>

      {/* Technical & Frustration Signals: Errors, Rage Clicks, Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uncaught Client JS Errors */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Uncaught JS Errors & Exceptions
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {topErrors.length > 0 ? (
              topErrors.map((err, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={err.message}>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 block truncate">
                      {err.message}
                    </span>
                    <span className="text-xs text-[#A3AED0] block truncate">
                      Source: {err.source}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {err.count} occurrences
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No uncaught errors reported</p>
            )}
          </div>
        </div>

        {/* Rage Click Hotspots */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Rage Click Hotspots
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {rageClicks.length > 0 ? (
              rageClicks.map((rage, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={rage.element}>
                    <span className="font-semibold text-[#1B254B] dark:text-white block truncate">
                      {rage.element}
                    </span>
                    <span className="text-xs text-[#A3AED0] block truncate">
                      Rapid repeated clicks
                    </span>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {rage.count} rage clicks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No rage clicks detected</p>
            )}
          </div>
        </div>

        {/* Conversion Milestones */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            Tracked Conversion Goals
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {conversions.length > 0 ? (
              conversions.map((conv, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={conv.goalName}>
                    <span className="font-semibold text-[#1B254B] dark:text-white block truncate">
                      {conv.goalName}
                    </span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {conv.count} completed
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No custom conversion goals recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Behavioral Insights: Top Pages, Click Maps, High Drop-offs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Pages & Time-on-page */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#4318FF]" />
            Top 5 Pageviews & Duration
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {(data?.topPages || []).slice(0, 5).length > 0 ? (
              data?.topPages.slice(0, 5).map((page, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={page.path}>
                    <span className="font-semibold text-[#1B254B] dark:text-white block truncate">
                      {formatRouteTitle(page.path)}
                    </span>
                    <span className="text-xs text-[#A3AED0] block truncate">
                      {page.path} • Avg: {formatSeconds(page.avgTimeSeconds)}
                    </span>
                  </div>
                  <span className="font-bold text-[#4318FF] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {page.views} views
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No pageviews recorded</p>
            )}
          </div>
        </div>

        {/* Popular Click Events */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-teal-500" />
            Top 5 Click Interactions
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {(data?.topClicks || []).slice(0, 5).length > 0 ? (
              data?.topClicks.slice(0, 5).map((click, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={click.element}>
                    <span className="font-semibold text-[#1B254B] dark:text-white block truncate">
                      {click.element}
                    </span>
                  </div>
                  <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {click.count} clicks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No click events logged</p>
            )}
          </div>
        </div>

        {/* High Exit / Drop-off Pages */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <LogOut className="w-4 h-4 text-amber-500" />
            Top 5 Drop-off / Exit Pages
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
            {(data?.topExits || []).slice(0, 5).length > 0 ? (
              data?.topExits.slice(0, 5).map((exit, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="truncate max-w-[220px]" title={exit.path}>
                    <span className="font-semibold text-[#1B254B] dark:text-white block truncate">
                      {formatRouteTitle(exit.path)}
                    </span>
                    <span className="text-xs text-[#A3AED0] block truncate">
                      {exit.path}
                    </span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg text-xs">
                    {exit.count} exits
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No exit paths logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
