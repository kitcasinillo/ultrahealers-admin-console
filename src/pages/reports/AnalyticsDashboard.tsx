import { useState, useEffect, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { BaseBarChart } from '../../components/Charts/BaseBarChart';
import { BaseAreaChart } from '../../components/Charts/BaseAreaChart';
import { fetchAnalyticsStats, type AnalyticsData } from '../../api/analytics';
import { cn } from '../../lib/utils';

const formatSeconds = (sec: number): string => {
  if (!sec || isNaN(sec)) return '0s';
  const mins = Math.floor(sec / 60);
  const remainder = sec % 60;
  if (mins === 0) return `${remainder}s`;
  return `${mins}m ${remainder}s`;
};

const DOMAIN_OPTIONS = [
  { id: 'admin-console.ultrahealers.com', label: 'Admin Console', badge: 'admin', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 border-blue-200/50' },
  { id: 'healers.ultrahealers.com', label: 'Healer App', badge: 'healers', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 border-purple-200/50' },
  { id: 'seekers.ultrahealers.com', label: 'Seeker App', badge: 'seekers', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 border-emerald-200/50' },
  { id: 'ultrahealers.com', label: 'Main Website', badge: 'website', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 border-slate-200/50' }
];

const formatDomainBadge = (domainStr?: string) => {
  if (!domainStr) return null;
  const dom = domainStr.toLowerCase();
  
  if (dom.includes('admin') || dom.includes(':5173') || dom.includes(':3000')) {
    return { label: 'admin', full: domainStr, badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50' };
  }
  if (dom.startsWith('seeker') || dom.includes('seekers.') || dom.includes('seeker-app') || dom.includes(':5174') || dom.includes(':3001')) {
    return { label: 'seekers', full: domainStr, badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50' };
  }
  if (dom.startsWith('healer') || dom.includes('healers.ultrahealers') || dom.includes('healer-app') || dom.includes(':5175') || dom.includes(':3002')) {
    return { label: 'healers', full: domainStr, badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/50' };
  }
  return { label: 'website', full: domainStr, badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/50' };
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

const formatClickLabel = (rawStr: string): { title: string; eventId: string } => {
  if (!rawStr) return { title: 'Interactive Element', eventId: 'global_interactive_element' };

  const legacyMap: Record<string, { title: string; eventId: string }> = {
    'Action Button': { title: 'Primary Action Button', eventId: 'global_action_button' },
    'Button Click': { title: 'Interactive Control', eventId: 'global_button_click' },
    'Icon / Action (Button)': { title: 'Icon Action Button', eventId: 'global_icon_action_button' },
    'Link Click': { title: 'Navigation Link', eventId: 'global_navigation_link' },
    'Interactive Element': { title: 'Interactive UI Element', eventId: 'global_interactive_element' }
  };

  if (legacyMap[rawStr]) {
    return legacyMap[rawStr];
  }

  if (rawStr.includes('_')) {
    const parts = rawStr.split('_').filter(Boolean);
    const words = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    
    let title = words.join(' ');
    if (parts[0] === 'nav' && parts.length > 1) {
      title = words.slice(1).join(' ');
    } else if (parts[0] === 'modal' && parts.length > 1) {
      title = `${words.slice(1).join(' ')} (Modal)`;
    }

    return { title, eventId: rawStr };
  }

  return { title: rawStr, eventId: rawStr };
};

export function AnalyticsDashboard() {
  const [range, setRange] = useState<string>('30d');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['all']);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDomainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchAnalyticsStats(range, selectedDomains);
      setData(stats);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range, selectedDomains]);

  const handleToggleDomain = (domainId: string) => {
    if (domainId === 'all') {
      setSelectedDomains(['all']);
      return;
    }

    if (selectedDomains.includes('all')) {
      setSelectedDomains([domainId]);
      return;
    }

    let updated = [...selectedDomains];
    if (updated.includes(domainId)) {
      updated = updated.filter(id => id !== domainId);
    } else {
      updated.push(domainId);
    }

    if (updated.length === 0 || updated.length === DOMAIN_OPTIONS.length) {
      setSelectedDomains(['all']);
    } else {
      setSelectedDomains(updated);
    }
  };

  const handleSelectOnlyDomain = (domainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedDomains([domainId]);
  };

  const getDomainTriggerLabel = () => {
    if (selectedDomains.includes('all') || selectedDomains.length === DOMAIN_OPTIONS.length) {
      return 'All Subdomains';
    }
    if (selectedDomains.length === 0) {
      return 'No Subdomain Selected';
    }
    if (selectedDomains.length === 1) {
      const found = DOMAIN_OPTIONS.find(d => d.id === selectedDomains[0]);
      return found ? found.label : selectedDomains[0];
    }
    const selectedLabels = DOMAIN_OPTIONS
      .filter(d => selectedDomains.includes(d.id))
      .map(d => d.label.replace(' App', '').replace(' Console', ''));
    return selectedLabels.join(', ');
  };

  const summary = data?.summary || {
    totalPageviews: 0,
    totalSessions: 0,
    avgDurationSeconds: 0,
    bounceRatePercent: 0
  };


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

  const referrerChartData = (data?.topReferrers || []).slice(0, 10).map((item) => ({
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
          {/* Multi-Select Subdomain Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
              className="flex items-center gap-2 bg-gray-50 dark:bg-[#1B254B] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-[#1B254B] dark:text-white hover:bg-gray-100 dark:hover:bg-[#111C44] transition-colors"
            >
              <Globe className="w-4 h-4 text-[#4318FF]" />
              <span>{getDomainTriggerLabel()}</span>
              <ChevronDown className={cn("w-4 h-4 text-[#A3AED0] transition-transform", isDomainDropdownOpen && "rotate-180")} />
            </button>

            {isDomainDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111C44] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5 text-xs font-bold text-[#A3AED0]">
                  <span>Filter Subdomains</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDomains(['all'])}
                    className="text-[#4318FF] hover:underline"
                  >
                    Select All
                  </button>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {DOMAIN_OPTIONS.map((opt) => {
                    const isChecked = !selectedDomains.includes('all') ? selectedDomains.includes(opt.id) : true;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleToggleDomain(opt.id)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-semibold text-[#1B254B] dark:text-white select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-gray-300 text-[#4318FF] focus:ring-[#4318FF] w-4 h-4 accent-[#4318FF]"
                          />
                          <span>{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleSelectOnlyDomain(opt.id, e)}
                            className="text-[10px] font-bold text-[#4318FF] hover:bg-blue-100 dark:hover:bg-blue-900/50 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 transition-colors"
                            title={`Show telemetry for ${opt.label} only`}
                          >
                          </button>
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border", opt.badgeClass)}>
                            {opt.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
          description={summary.trends?.pageviewsLabel || "Real-time telemetry"}
          icon={<Eye className="h-6 w-6 text-[#4318FF]" />}
          trend={summary.trends?.pageviewsTrend || "neutral"}
        />
        <StatsCard
          title="Unique Sessions"
          value={summary.totalSessions.toLocaleString()}
          description={summary.trends?.sessionsLabel || "Real-time telemetry"}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          trend={summary.trends?.sessionsTrend || "neutral"}
        />
        <StatsCard
          title="Avg. Session Duration"
          value={formatSeconds(summary.avgDurationSeconds)}
          description={summary.trends?.durationLabel || "Real-time telemetry"}
          icon={<Clock className="h-6 w-6 text-teal-500" />}
          trend={summary.trends?.durationTrend || "neutral"}
        />
        <StatsCard
          title="Bounce Rate"
          value={`${summary.bounceRatePercent}%`}
          description={summary.trends?.bounceRateLabel || "Real-time telemetry"}
          icon={<TrendingDown className="h-6 w-6 text-amber-500" />}
          trend={summary.trends?.bounceRateTrend || "neutral"}
        />
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
              height="h-[180px] sm:h-[200px]"
            />
          ) : (
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl h-52 flex items-center justify-center text-sm text-[#A3AED0]">
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
              height="h-[180px] sm:h-[200px]"
            />
          ) : (
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl h-52 flex items-center justify-center text-sm text-[#A3AED0]">
              No referrer data logged for this timeframe
            </div>
          )}
        </div>
      </div>

      {/* Behavioral Insights: Top Pages, Click Maps, High Drop-offs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Pages & Time-on-page */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#4318FF]" />
            Top 10 Pageviews & Duration
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[310px] overflow-y-auto pr-1">
            {(data?.topPages || []).slice(0, 10).length > 0 ? (
              data?.topPages.slice(0, 10).map((page, idx) => {
                const badge = formatDomainBadge(page.domain);
                return (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div className="truncate max-w-[220px]" title={`${page.domain || ''}${page.path}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-[#1B254B] dark:text-white truncate">
                          {formatRouteTitle(page.path)}
                        </span>
                        {badge && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0", badge.badgeClass)}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A3AED0] block truncate">
                        {page.domain ? `${page.domain}${page.path}` : page.path} • Avg: {formatSeconds(page.avgTimeSeconds)}
                      </span>
                    </div>
                    <span className="font-bold text-[#4318FF] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg text-xs">
                      {page.views} views
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No pageviews recorded</p>
            )}
          </div>
        </div>

        {/* Popular Click Events / Button Clicks */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-teal-500" />
            Top 10 Click Interactions
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[310px] overflow-y-auto pr-1">
            {(data?.topClicks || []).slice(0, 10).length > 0 ? (
              data?.topClicks.slice(0, 10).map((click, idx) => {
                const labelObj = formatClickLabel(click.element);
                const badge = formatDomainBadge(click.domain);
                return (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div className="truncate max-w-[220px]" title={`${labelObj.title} (${labelObj.eventId}) - ${click.domain || ''}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-[#1B254B] dark:text-white truncate">
                          {labelObj.title}
                        </span>
                        {badge && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0", badge.badgeClass)}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A3AED0] block truncate font-mono">
                        {click.domain ? `${click.domain} › ${labelObj.eventId}` : labelObj.eventId}
                      </span>
                    </div>
                    <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg text-xs">
                      {click.count} clicks
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#A3AED0] py-6 text-center">No click events logged</p>
            )}
          </div>
        </div>

        {/* High Exit / Drop-off Pages */}
        <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <h2 className="text-md font-bold text-[#1B254B] dark:text-white flex items-center gap-2">
            <LogOut className="w-4 h-4 text-amber-500" />
            Top 10 Drop-off / Exit Pages
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[310px] overflow-y-auto pr-1">
            {(data?.topExits || []).slice(0, 10).length > 0 ? (
              data?.topExits.slice(0, 10).map((exit, idx) => {
                const badge = formatDomainBadge(exit.domain);
                return (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div className="truncate max-w-[220px]" title={`${exit.domain || ''}${exit.path}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-[#1B254B] dark:text-white truncate">
                          {formatRouteTitle(exit.path)}
                        </span>
                        {badge && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0", badge.badgeClass)}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A3AED0] block truncate">
                        {exit.domain ? `${exit.domain}${exit.path}` : exit.path}
                      </span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg text-xs">
                      {exit.count} exits
                    </span>
                  </div>
                );
              })
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
