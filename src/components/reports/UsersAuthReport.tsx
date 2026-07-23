import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Download, RefreshCw, CheckCircle, XCircle, ShieldCheck, Mail, Calendar, Clock, ArrowUpDown } from "lucide-react";
import Papa from "papaparse";
import { DataTable } from "../DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { getAuthUsersReport, type AuthUserRecord } from "../../api/reports";
import { StatsCard } from "../StatsCard";

export function UsersAuthReport() {
  const [users, setUsers] = useState<AuthUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterVerified, setFilterVerified] = useState<string>("all"); // "all" | "verified" | "unverified"

  // 5-minute cache reference
  const cacheRef = useRef<{ data: AuthUserRecord[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchUsersData = async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cacheRef.current && now - cacheRef.current.timestamp < CACHE_DURATION) {
      setUsers(cacheRef.current.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getAuthUsersReport();
      setUsers(data);
      cacheRef.current = { data, timestamp: Date.now() };
    } catch (err) {
      console.error("Error loading auth users:", err);
      setError(err instanceof Error ? err.message : "Failed to load registered user accounts from Firebase Auth.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Filtered users list based on search query & verification status filter, sorted by creationTime descending
  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      const identifier = (u.email || u.phoneNumber || u.uid || "").toLowerCase();

      const matchesSearch =
        !query ||
        identifier.includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phoneNumber?.toLowerCase().includes(query) ||
        u.uid?.toLowerCase().includes(query) ||
        u.displayName?.toLowerCase().includes(query);

      const matchesVerified =
        filterVerified === "all" ||
        (filterVerified === "verified" && u.emailVerified) ||
        (filterVerified === "unverified" && !u.emailVerified);

      return matchesSearch && matchesVerified;
    });

    return list.sort((a, b) => {
      const timeA = a.creationTime ? new Date(a.creationTime).getTime() : 0;
      const timeB = b.creationTime ? new Date(b.creationTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [users, searchQuery, filterVerified]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const verified = users.filter((u) => u.emailVerified).length;
    const unverified = total - verified;
    return { total, verified, unverified };
  }, [users]);

  // Export to CSV helper
  const handleExportCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) return;

    const exportData = filteredUsers.map((u) => ({
      "Identifier": u.email || u.phoneNumber || "No Email Address Provided",
      "Display Name": u.displayName || "N/A",
      "Providers": u.providers && u.providers.length > 0
        ? u.providers.map(p => p === "password" ? "Email/Password" : p === "google.com" ? "Google" : p === "facebook.com" ? "Facebook" : p === "phone" ? "Phone" : p).join(", ")
        : "Email/Password",
      "Created": u.creationTime ? new Date(u.creationTime).toLocaleString() : "N/A",
      "Signed In": (u.lastSignInTime || u.creationTime) ? new Date(u.lastSignInTime || u.creationTime).toLocaleString() : "N/A",
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registered_user_accounts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table Columns Definition (Matching Firebase Console Authentication tab)
  const columns: ColumnDef<AuthUserRecord>[] = [
    {
      accessorKey: "email",
      header: "Identifier",
      cell: ({ row }) => {
        const u = row.original;
        const initial = u.displayName
          ? u.displayName.charAt(0).toUpperCase()
          : u.email
          ? u.email.charAt(0).toUpperCase()
          : "U";

        const identifier = u.email || u.phoneNumber || "No Email Address Provided";

        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4318FF]/10 text-[#4318FF] dark:bg-[#4318FF]/20 flex items-center justify-center font-bold text-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[#1b254b] dark:text-white truncate">
                {u.displayName || (u.email ? "Registered User" : u.phoneNumber ? "Phone User" : "User Account")}
              </p>
              <p className="text-xs text-[#A3AED0] dark:text-gray-400 truncate flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {identifier}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "providers",
      header: "Providers",
      cell: ({ row }) => {
        const rawProviders = row.original.providers && row.original.providers.length > 0
          ? row.original.providers
          : ["password"];

        const formatProvider = (p: string) => {
          if (p === "password") return "Email/Password";
          if (p === "google.com") return "Google";
          if (p === "facebook.com") return "Facebook";
          if (p === "apple.com") return "Apple";
          if (p === "phone") return "Phone";
          return p;
        };

        return (
          <div className="flex flex-wrap gap-1">
            {rawProviders.map((p, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 flex items-center gap-1"
              >
                {formatProvider(p)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "creationTime",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1.5 hover:text-[#1b254b] dark:hover:text-white transition-colors focus:outline-none"
        >
          Created
          <ArrowUpDown className="h-3 w-3 text-[#A3AED0]" />
        </button>
      ),
      cell: ({ row }) => {
        const dateStr = row.original.creationTime;
        return (
          <span className="text-xs font-medium text-[#1b254b] dark:text-gray-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#A3AED0]" />
            {dateStr ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "lastSignInTime",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1.5 hover:text-[#1b254b] dark:hover:text-white transition-colors focus:outline-none"
        >
          Signed In
          <ArrowUpDown className="h-3 w-3 text-[#A3AED0]" />
        </button>
      ),
      cell: ({ row }) => {
        const dateStr = row.original.lastSignInTime || row.original.creationTime;
        return (
          <span className="text-xs font-medium text-[#1b254b] dark:text-gray-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#A3AED0]" />
            {dateStr ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => {
        const isVerified = row.original.emailVerified;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isVerified
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
            }`}
          >
            {isVerified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {isVerified ? "Verified" : "Unverified"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          title="Total Firebase Accounts"
          value={metrics.total.toString()}
          description="Registered users in Firebase Auth"
          icon={<ShieldCheck className="h-6 w-6 text-[#4318FF]" />}
        />
        <StatsCard
          title="Verified Email Accounts"
          value={metrics.verified.toString()}
          description={`${metrics.total > 0 ? Math.round((metrics.verified / metrics.total) * 100) : 0}% verification rate`}
          icon={<CheckCircle className="h-6 w-6 text-emerald-500" />}
        />
        <StatsCard
          title="Unverified Accounts"
          value={metrics.unverified.toString()}
          description="Pending email confirmation"
          icon={<XCircle className="h-6 w-6 text-amber-500" />}
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-[#111C44] p-4 rounded-2xl shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
            <input
              type="text"
              placeholder="Search by Identifier (email, phone, name)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all"
            />
          </div>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchUsersData(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 text-[#1b254b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            title="Refresh accounts list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4318FF] hover:bg-[#3311CC] text-white shadow-md shadow-[#4318FF]/20 transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-xs text-red-700 dark:text-red-300">
          <span className="font-bold">Error loading user list:</span> {error}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#111C44] rounded-2xl p-4 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] border border-gray-100 dark:border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-[#A3AED0] text-xs font-medium space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#4318FF]" />
            <p>Fetching registered user accounts from Firebase Authentication...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredUsers} />
        )}
      </div>
    </div>
  );
}

export default UsersAuthReport;
