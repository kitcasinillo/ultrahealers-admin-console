import { useState, useEffect, useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Lightbulb,
  Search,
  Download,
  RefreshCcw,
  Eye,
  Trash2,
  Mail,
  Sparkles,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/ToastContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { logAdminAction } from "@/lib/audit";
import {
  getFeedbackList,
  deleteFeedback,
  exportFeedbackCsv,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_IMPACT_LABELS,
  FEEDBACK_STATUS_LABELS,
  type FeedbackItem,
  type FeedbackSummary,
} from "@/lib/feedback";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { SendFeedbackPromptModal } from "./SendFeedbackPromptModal";

export function FeedbackPage() {
  const { showToast } = useToast();
  const { user } = useAdminAuth();

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary>({
    new: 0,
    underReview: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [appSourceFilter, setAppSourceFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeedbackList({
        status: statusFilter,
        category: categoryFilter,
        appSource: appSourceFilter,
        impact: impactFilter,
        search,
      });
      setItems(res.items);
      setSummary(res.summary);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      showToast("Failed to load feature requests", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, appSourceFilter, impactFilter, search, showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleExport = () => {
    const blob = exportFeedbackCsv(items);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feature-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteFeedback(deleteTarget.id);
      await logAdminAction({
        adminId: user?.uid || "unknown",
        adminEmail: user?.email || "unknown",
        action: "feedback_deleted",
        module: "Feedback",
        targetId: deleteTarget.id,
        targetName: deleteTarget.title,
      });
      showToast("Feedback item deleted", "success");
      setDeleteTarget(null);
      fetchItems();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      showToast("Failed to delete feedback item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<FeedbackItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-[#1b254b] dark:text-gray-200 whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Request",
        cell: ({ row }) => (
          <div className="max-w-[280px]">
            <p className="font-semibold text-sm text-[#1b254b] dark:text-white truncate">
              {row.original.title}
            </p>
            <p className="text-xs text-[#A3AED0] truncate">{row.original.description}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 whitespace-nowrap">
            {FEEDBACK_CATEGORY_LABELS[row.original.category] || row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "impact",
        header: "Impact",
        cell: ({ row }) => {
          const imp = row.original.impact;
          const styles: Record<string, string> = {
            critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
            important: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
            nice_to_have: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
          };
          return (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[imp] || styles.important}`}>
              {FEEDBACK_IMPACT_LABELS[imp] || imp}
            </span>
          );
        },
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#1b254b] dark:text-white">
              {row.original.userName}
            </span>
            <span className="text-[10px] uppercase font-bold text-[#A3AED0]">
              {row.original.userRole} • {row.original.appSource}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          const styles: Record<string, string> = {
            new: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
            under_review: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
            planned: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
            in_progress: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
            completed: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
            declined: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10",
          };
          return (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[st] || styles.new}`}>
              {FEEDBACK_STATUS_LABELS[st] || st}
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
              onClick={() => setSelectedItem(row.original)}
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
              title="Delete Feedback"
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
            <Lightbulb className="w-6 h-6 text-[#01A3B4]" />
            Feature Requests &amp; Feedback
          </h1>
          <p className="text-sm text-[#A3AED0] mt-1">
            Collect, triage, and track user feature requests from in-app widgets and email prompts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPromptOpen(true)}
            className="bg-[#01A3B4] hover:bg-[#0891b2] text-white gap-1.5"
          >
            <Mail className="w-4 h-4" />
            Send Email Prompt
          </Button>
          <Button variant="outline" size="sm" onClick={fetchItems} className="gap-1.5">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={items.length === 0}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">New Requests</p>
            <Inbox className="w-4 h-4 text-[#01A3B4]" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">{summary.new}</p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Planned / In Progress</p>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">
            {summary.planned + summary.inProgress}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Completed</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">
            {summary.completed}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111C44] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#A3AED0]">Total Submissions</p>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#1b254b] dark:text-white mt-2">{summary.total}</p>
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
            placeholder="Search title, description, user..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0B1437] text-[#1b254b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="under_review">Under Review</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="feature_request">Feature Request</option>
          <option value="improvement">Improvement</option>
          <option value="bug_report">Bug Report</option>
          <option value="general">General</option>
        </select>

        <select
          value={impactFilter}
          onChange={(e) => setImpactFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Impacts</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="nice_to_have">Nice to have</option>
        </select>

        <select
          value={appSourceFilter}
          onChange={(e) => setAppSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1437] text-[#1b254b] dark:text-white"
        >
          <option value="all">All Apps</option>
          <option value="seeker-app">Seeker App</option>
          <option value="healer-app">Healer App</option>
          <option value="retreats-app">Retreats App</option>
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
          <DataTable columns={columns} data={items} />
        )}
      </div>

      {/* Modals */}
      <FeedbackDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onUpdated={() => fetchItems()}
      />

      <SendFeedbackPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feedback Entry"
        description="Are you sure you want to permanently delete this feature request? This action will be recorded in the audit log."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
