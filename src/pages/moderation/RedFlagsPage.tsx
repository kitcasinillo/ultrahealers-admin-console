import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ShieldAlert,
  Search,
  Download,
  RefreshCcw,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { logAdminAction } from "@/lib/audit";
import {
  getRedFlags,
  deleteRedFlag,
  exportRedFlagsCsv,
  RED_FLAG_CATEGORY_LABELS,
  RED_FLAG_STATUS_LABELS,
  type RedFlagAlert,
  type RedFlagSummary,
} from "@/lib/redFlags";
import { RedFlagDetailModal } from "./RedFlagDetailModal";

export function RedFlagsPage() {
  const { showToast } = useToast();
  const { user } = useAdminAuth();

  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [summary, setSummary] = useState<RedFlagSummary>({
    open: 0,
    highSeverity: 0,
    total: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [selectedAlert, setSelectedAlert] = useState<RedFlagAlert | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RedFlagAlert | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRedFlags({
        status: statusFilter,
        severity: severityFilter,
        category: categoryFilter,
        search,
      });
      setAlerts(res.alerts);
      setSummary(res.summary);
    } catch (error) {
      console.error("Failed to fetch red flags:", error);
      showToast("Failed to load red flag alerts", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, categoryFilter, search, showToast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleExport = () => {
    const blob = exportRedFlagsCsv(alerts);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `red-flag-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteRedFlag(deleteTarget.id);
      await logAdminAction({
        adminId: user?.uid || "unknown",
        adminEmail: user?.email || "unknown",
        action: "red_flag_deleted",
        module: "Moderation",
        targetId: deleteTarget.id,
        targetName: `${deleteTarget.senderName} (${deleteTarget.bookingId})`,
      });
      showToast("Red flag alert deleted", "success");
      setDeleteTarget(null);
      fetchAlerts();
    } catch (error) {
      console.error("Failed to delete red flag:", error);
      showToast("Failed to delete red flag alert", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<RedFlagAlert>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-xs text-[#1b254b] dark:text-gray-200 whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ),
      },
      {
        accessorKey: "senderName",
        header: "Sender",
        cell: ({ row }) => {
          const item = row.original;
          const profilePath =
            item.senderType === "healer"
              ? `/users/healers/${item.senderId}`
              : `/users/seekers/${item.senderId}`;
          return (
            <div className="flex flex-col gap-0.5">
              <Link
                to={profilePath}
                className="font-semibold text-sm text-[#1b254b] dark:text-white hover:text-[#4318FF] dark:hover:text-[#01A3B4]"
              >
                {item.senderName}
              </Link>
              <span className="text-[10px] uppercase font-bold text-[#A3AED0]">
                {item.senderType}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "bookingId",
        header: "Booking",
        cell: ({ row }) => (
          <Link
            to={`/bookings/sessions/${row.original.bookingId}`}
            className="font-mono text-xs text-[#4318FF] dark:text-[#01A3B4] hover:underline"
          >
            {row.original.bookingId.slice(0, 12)}
            {row.original.bookingId.length > 12 ? "…" : ""}
          </Link>
        ),
      },
      {
        accessorKey: "categories",
        header: "Triggers",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.original.categories.map((cat) => (
              <span
                key={cat}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
              >
                {RED_FLAG_CATEGORY_LABELS[cat] || cat}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => {
          const sev = row.original.severity;
          const styles: Record<string, string> = {
            high: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
            medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
            low: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
          };
          return (
            <span
              className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                styles[sev] || styles.low
              }`}
            >
              {sev}
            </span>
          );
        },
      },
      {
        accessorKey: "text",
        header: "Message Snippet",
        cell: ({ row }) => (
          <p className="text-xs text-gray-700 dark:text-gray-300 max-w-[260px] truncate" title={row.original.text}>
            {row.original.text}
          </p>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          const styles: Record<string, string> = {
            open: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
            reviewed: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
            dismissed: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10",
            action_taken: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
          };
          return (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[st] || styles.open}`}>
              {RED_FLAG_STATUS_LABELS[st] || st}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedAlert(row.original)}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Review
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(row.original)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
              title="Delete Alert"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1b254b] dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Red Flag Moderation Queue
          </h1>
          <p className="text-sm text-[#A3AED0] mt-1">
            Review chat messages flagged for personal contact info or off-platform payment attempts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAlerts} className="gap-1.5">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={alerts.length === 0}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Open Alerts</p>
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">{summary.open}</p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">High Severity (Open)</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">
            {summary.highSeverity}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Total Flagged</p>
            <ShieldAlert className="w-4 h-4 text-[#4318FF] dark:text-[#01A3B4]" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">{summary.total}</p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Reviewed / Resolved</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">
            {summary.resolved}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111C44] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#A3AED0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sender, booking ID, or message..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0B1437] text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="action_taken">Action Taken</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="off_platform_payment">Off-Platform Payment</option>
          <option value="phone">Phone Number</option>
          <option value="email">Email Address</option>
          <option value="url">External Link</option>
          <option value="social_handle">Social / Off-Platform</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111C44] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={alerts} />
        )}
      </div>

      {/* Detail Review Modal */}
      <RedFlagDetailModal
        alert={selectedAlert}
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        onUpdated={() => fetchAlerts()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Red Flag Alert"
        description="Are you sure you want to permanently delete this red flag alert? This action will be recorded in the audit log."
        confirmText="Delete Alert"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
