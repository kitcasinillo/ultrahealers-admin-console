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
  ChevronDown,
  Calendar,
  Check,
  Layers
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { BaseBarChart } from '../../components/Charts/BaseBarChart';
import { BaseAreaChart } from '../../components/Charts/BaseAreaChart';
import { fetchAnalyticsStats, type AnalyticsData } from '../../api/analytics';
import { cn } from '../../lib/utils';

const GRANULARITY_OPTIONS = [
  { id: 'auto', label: 'Auto (Default)', description: 'Smart horizon grouping based on filter range' },
  { id: 'day', label: 'Daily', description: 'Detailed day-by-day telemetry points' },
  { id: 'week', label: 'Weekly', description: '7-day interval aggregated buckets' },
  { id: 'month', label: 'Monthly', description: 'Calendar month aggregated totals' },
];

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

const RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 Days', sub: 'Past week of telemetry' },
  { id: '30d', label: 'Last 30 Days', sub: 'Past 30 days of data' },
  { id: '90d', label: 'Last 90 Days', sub: 'Past 3 months of telemetry' },
  { id: 'ytd', label: 'Year to Date', sub: 'From Jan 1 to present' },
  { id: 'all', label: 'All Time', sub: 'Complete historical logs' },
];

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } catch {
    return dateStr;
  }
};

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
    '/listings': 'Healer Session Listings',
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
  if (path.startsWith('/listings/')) return `${domainPrefix}Healer Session Detail`;
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

  const reservedPrefixes = /^(healers|seekers|retreats|listings|bookings|users|nav|modal|reports|disputes|finance|campaigns|modalities|settings|home)$/i;
  const isUid = (part: string) => /^[A-Za-z0-9_-]{20,36}$/.test(part) && !reservedPrefixes.test(part);

  if (rawStr.includes('_')) {
    const parts = rawStr.split('_').filter(Boolean).filter(part => !isUid(part));
    const words = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    
    let title = words.join(' ');
    if (parts[0] === 'nav' && parts.length > 1) {
      title = words.slice(1).join(' ');
    } else if (parts[0] === 'modal' && parts.length > 1) {
      title = `${words.slice(1).join(' ')} (Modal)`;
    }

    const eventId = parts.join('_');
    return { title, eventId };
  }

  return { title: rawStr, eventId: rawStr };
};

export function AnalyticsDashboard() {
  const [range, setRange] = useState<string>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['all']);
  const [acquisitionGranularity, setAcquisitionGranularity] = useState<'auto' | 'day' | 'week' | 'month'>('auto');
  const [highlightedSeries, setHighlightedSeries] = useState<'all' | 'seekers' | 'healers'>('all');
  
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState<boolean>(false);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  const [isGranularityDropdownOpen, setIsGranularityDropdownOpen] = useState<boolean>(false);
  const granularityDropdownRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDomainDropdownOpen(false);
      }
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(event.target as Node)) {
        setIsRangeDropdownOpen(false);
      }
      if (granularityDropdownRef.current && !granularityDropdownRef.current.contains(event.target as Node)) {
        setIsGranularityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchAnalyticsStats(
        range,
        selectedDomains,
        range === 'custom' ? customStartDate : undefined,
        range === 'custom' ? customEndDate : undefined,
        acquisitionGranularity !== 'auto' ? acquisitionGranularity : undefined
      );
      setData(stats);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (range === 'custom') {
      if (customStartDate && customEndDate) {
        loadData();
      }
    } else {
      loadData();
    }
  }, [range, selectedDomains, customStartDate, customEndDate, acquisitionGranularity]);

  const getRangeTriggerLabel = () => {
    if (range === 'custom') {
      if (customStartDate && customEndDate) {
        return `${formatShortDate(customStartDate)} – ${formatShortDate(customEndDate)}`;
      }
      return 'Custom Date Range';
    }
    const found = RANGE_OPTIONS.find(r => r.id === range);
    return found ? found.label : 'Last 30 Days';
  };

  const getGranularityTriggerLabel = () => {
    if (acquisitionGranularity === 'day') return 'Daily';
    if (acquisitionGranularity === 'week') return 'Weekly';
    if (acquisitionGranularity === 'month') return 'Monthly';
    return 'Auto (Default)';
  };

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
            Real-time cross-subdomain traffic, user acquisition trends, and behavioral insights across ultrahealers.com
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

          {/* Enhanced Date Range Dropdown */}
          <div className="relative" ref={rangeDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
              className="flex items-center gap-2.5 bg-gray-50 dark:bg-[#1B254B] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-[#1B254B] dark:text-white hover:bg-gray-100 dark:hover:bg-[#111C44] transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4 text-[#4318FF] dark:text-[#01A3B4]" />
              <span>{getRangeTriggerLabel()}</span>
              <ChevronDown className={cn("w-4 h-4 text-[#A3AED0] transition-transform", isRangeDropdownOpen && "rotate-180")} />
            </button>

            {isRangeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111C44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-3.5 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#4318FF] dark:text-[#01A3B4]" />
                    <span>Time Horizon</span>
                  </div>
                  {range === 'custom' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRange('30d');
                        setCustomStartDate('');
                        setCustomEndDate('');
                        setIsRangeDropdownOpen(false);
                      }}
                      className="text-[11px] text-[#4318FF] dark:text-[#01A3B4] hover:underline normal-case font-semibold"
                    >
                      Reset Preset
                    </button>
                  )}
                </div>

                {/* Preset Options List */}
                <div className="space-y-1">
                  {RANGE_OPTIONS.map((opt) => {
                    const isSelected = range === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRange(opt.id);
                          setIsRangeDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-left transition-colors select-none",
                          isSelected
                            ? "bg-blue-50 dark:bg-white/10 text-[#4318FF] dark:text-white font-bold"
                            : "hover:bg-gray-50 dark:hover:bg-white/5 text-[#1B254B] dark:text-gray-200"
                        )}
                      >
                        <div>
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[10px] text-[#A3AED0] font-medium mt-0.5">{opt.sub}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#4318FF] dark:text-[#01A3B4] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Range Section */}
                <div className="pt-2.5 border-t border-gray-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider">
                      Custom Date Range
                    </span>
                    {range === 'custom' && (
                      <span className="text-[10px] font-semibold text-[#01A3B4] bg-[#01A3B4]/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A3AED0]">FROM</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => {
                          setCustomStartDate(e.target.value);
                          setRange('custom');
                        }}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#1B254B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 focus:border-[#4318FF] [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A3AED0]">TO</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => {
                          setCustomEndDate(e.target.value);
                          setRange('custom');
                        }}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#1B254B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 focus:border-[#4318FF] [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {range === 'custom' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          loadData();
                        }
                        setIsRangeDropdownOpen(false);
                      }}
                      className="w-full mt-1 bg-[#4318FF] hover:bg-[#3311CC] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                    >
                      Apply Custom Range
                    </button>
                  )}
                </div>
              </div>
            )}
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
      <div>
        {(() => {
          const totalSeekersCount = (data?.monthlyAcquisition || []).reduce((acc, curr) => acc + (curr.seekers || 0), 0);
          const totalHealersCount = (data?.monthlyAcquisition || []).reduce((acc, curr) => acc + (curr.healers || 0), 0);
          
          return acquisitionChartData.length > 0 ? (
            <BaseAreaChart
              title={(() => {
                const activeMode = acquisitionGranularity !== 'auto' ? acquisitionGranularity : (
                  range === '7d' ? 'day' : (range === '30d' || range === '90d' ? 'week' : 'month')
                );
                if (activeMode === 'day') return 'User Acquisition Trends (Daily)';
                if (activeMode === 'week') return 'User Acquisition Trends (Weekly)';
                if (activeMode === 'month') return 'User Acquisition Trends (Monthly)';
                return 'User Acquisition Trends';
              })()}
              data={acquisitionChartData}
              showLegend={false}
              headerRight={
                <div className="relative" ref={granularityDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsGranularityDropdownOpen(!isGranularityDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-[#1B254B] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#1B254B] dark:text-white hover:bg-gray-100 dark:hover:bg-[#111C44] transition-colors shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#4318FF] dark:text-[#01A3B4]" />
                    <span className="text-[#A3AED0]">Group by:</span>
                    <span className="font-bold">{getGranularityTriggerLabel()}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-[#A3AED0] transition-transform", isGranularityDropdownOpen && "rotate-180")} />
                  </button>

                  {isGranularityDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111C44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-3 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="pb-2 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold text-[#A3AED0] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[#4318FF] dark:text-[#01A3B4]" />
                        <span>Aggregation Interval</span>
                      </div>

                      <div className="space-y-1">
                        {GRANULARITY_OPTIONS.map((opt) => {
                          const isSelected = acquisitionGranularity === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setAcquisitionGranularity(opt.id as any);
                                setIsGranularityDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-left transition-colors select-none",
                                isSelected
                                  ? "bg-blue-50 dark:bg-white/10 text-[#4318FF] dark:text-white font-bold"
                                  : "hover:bg-gray-50 dark:hover:bg-white/5 text-[#1B254B] dark:text-gray-200"
                              )}
                            >
                              <div>
                                <div className="text-xs font-bold">{opt.label}</div>
                                <div className="text-[10px] font-medium text-[#A3AED0] mt-0.5">{opt.description}</div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#4318FF] dark:text-[#01A3B4] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              }
              areas={[
                {
                  dataKey: 'Seekers',
                  name: 'Seeker Signups',
                  stroke: '#7C3AED',
                  fillOpacity: highlightedSeries === 'all' || highlightedSeries === 'seekers' ? 0.35 : 0.03,
                  strokeOpacity: highlightedSeries === 'all' || highlightedSeries === 'seekers' ? 1 : 0.15,
                  strokeWidth: highlightedSeries === 'seekers' ? 3.5 : 2
                },
                {
                  dataKey: 'Healers',
                  name: 'Healer Signups',
                  stroke: '#01A3B4',
                  fillOpacity: highlightedSeries === 'all' || highlightedSeries === 'healers' ? 0.35 : 0.03,
                  strokeOpacity: highlightedSeries === 'all' || highlightedSeries === 'healers' ? 1 : 0.15,
                  strokeWidth: highlightedSeries === 'healers' ? 3.5 : 2
                }
              ]}
              footerRight={
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHighlightedSeries(prev => prev === 'seekers' ? 'all' : 'seekers')}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none",
                      highlightedSeries === 'seekers'
                        ? "bg-purple-100 dark:bg-purple-900/50 border-[#7C3AED] ring-2 ring-[#7C3AED]/40 shadow-xs scale-[1.02]"
                        : "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30 hover:bg-purple-100/70 dark:hover:bg-purple-900/40"
                    )}
                    title={highlightedSeries === 'seekers' ? "Click to show all trends" : "Click to highlight Seeker Signups trend"}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                      Seeker Signups: <strong className="text-xs font-bold text-[#7C3AED] ml-1">{totalSeekersCount.toLocaleString()}</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHighlightedSeries(prev => prev === 'healers' ? 'all' : 'healers')}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none",
                      highlightedSeries === 'healers'
                        ? "bg-teal-100 dark:bg-teal-900/50 border-[#01A3B4] ring-2 ring-[#01A3B4]/40 shadow-xs scale-[1.02]"
                        : "bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/30 hover:bg-teal-100/70 dark:hover:bg-teal-900/40"
                    )}
                    title={highlightedSeries === 'healers' ? "Click to show all trends" : "Click to highlight Healer Signups trend"}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#01A3B4]" />
                    <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                      Healer Signups: <strong className="text-xs font-bold text-[#01A3B4] ml-1">{totalHealersCount.toLocaleString()}</strong>
                    </span>
                  </button>
                </div>
              }
            />
          ) : (
            <div className="bg-white dark:bg-[#111C44] p-6 rounded-2xl h-64 flex items-center justify-center text-sm text-[#A3AED0]">
              No user acquisition records found for the selected period
            </div>
          );
        })()}
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
