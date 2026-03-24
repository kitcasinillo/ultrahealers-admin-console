import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, History, FilterX, Download } from "lucide-react";
import { useAuditLogs } from "./useAuditLogs";
import type { AuditLogEntry } from "./types";
import { ActionBadge, ResourceBadge, ChangesView } from "./components";
import { ACTION_OPTIONS, RESOURCE_OPTIONS } from "./utils";
import { toast } from "react-hot-toast";

export function AuditLog() {
  const {
    logs,
    loading,
    isRefreshing,
    handleRefresh,
    searchQuery, setSearchQuery,
    adminFilter, setAdminFilter,
    actionFilter, setActionFilter,
    resourceFilter, setResourceFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    adminOptions
  } = useAuditLogs();

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "Admin", "Action", "Resource Type", "Resource ID", "Changes", "IP Address"];
    const csvRows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.adminName,
      log.action,
      log.resourceType,
      log.resourceId,
      typeof log.changes === 'object' ? JSON.stringify(log.changes).replace(/"/g, '""') : log.changes,
      log.ipAddress
    ].map(val => `"${val}"`).join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${logs.length} entries to CSV`);
  };

  const columns: ColumnDef<AuditLogEntry>[] = useMemo(() => [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#1b254b] dark:text-white">
            {new Date(row.original.timestamp).toLocaleDateString()}
          </span>
          <span className="text-[10px] text-[#A3AED0] font-medium">
            {new Date(row.original.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "adminName",
      header: "Admin",
      cell: ({ row }) => (
        <span className="font-bold text-[#1b254b] dark:text-white">{row.original.adminName}</span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <ActionBadge action={row.original.action} />,
    },
    {
      accessorKey: "resourceType",
      header: "Resource Type",
      cell: ({ row }) => <ResourceBadge resource={row.original.resourceType} />,
    },
    {
      accessorKey: "resourceId",
      header: "Resource ID",
      cell: ({ row }) => (
        <code className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[#4318FF] dark:text-[#01A3B4] font-bold">
          {row.original.resourceId}
        </code>
      ),
    },
    {
      accessorKey: "changes",
      header: "Changes",
      cell: ({ row }) => <ChangesView changes={row.original.changes} />,
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="text-[10px] text-[#A3AED0] font-mono">{row.original.ipAddress}</span>
      ),
    },
  ], []);

  const hasActiveFilters = searchQuery || adminFilter !== "All" || actionFilter !== "All" || resourceFilter !== "All" || startDate || endDate;

  const clearFilters = () => {
    setSearchQuery("");
    setAdminFilter("All");
    setActionFilter("All");
    setResourceFilter("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">
              Audit Logs
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-[#01A3B4] p-2"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={loading || logs.length === 0}
              className="ml-2 rounded-xl border-[#e0e7ff] dark:border-white/10 text-[#4318FF] dark:text-white font-bold h-10 px-4 gap-2 shadow-sm hover:bg-[#F4F7FE] dark:hover:bg-white/5"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium">
            Monitor and track administrative actions across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#111C44] px-4 py-2 rounded-2xl shadow-sm border border-transparent dark:border-white/5">
            <History className="h-5 w-5 text-[#4318FF]" />
            <span className="text-sm font-bold text-[#1b254b] dark:text-white">{logs.length} Entries Found</span>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
            <Input
              placeholder="Search by admin or resource ID..."
              className="pl-10 rounded-xl border-gray-100 dark:border-white/10 bg-[#F4F7FE] dark:bg-white/5 focus-visible:ring-[#4318FF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="bg-[#F4F7FE] dark:bg-white/5 text-[#1b254b] dark:text-white text-sm font-bold rounded-xl border-none px-4 py-2.5 outline-none min-w-[140px]"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
          >
            {adminOptions.map(admin => (
              <option key={admin} value={admin}>{admin === "All" ? "All Admins" : admin}</option>
            ))}
          </select>

          <select
            className="bg-[#F4F7FE] dark:bg-white/5 text-[#1b254b] dark:text-white text-sm font-bold rounded-xl border-none px-4 py-2.5 outline-none min-w-[140px]"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            {ACTION_OPTIONS.map(action => (
              <option key={action} value={action}>{action === "All" ? "All Actions" : action.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            className="bg-[#F4F7FE] dark:bg-white/5 text-[#1b254b] dark:text-white text-sm font-bold rounded-xl border-none px-4 py-2.5 outline-none min-w-[140px]"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            {RESOURCE_OPTIONS.map(resource => (
              <option key={resource} value={resource}>{resource === "All" ? "All Resources" : resource}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-[#F4F7FE] dark:bg-white/5 px-4 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#A3AED0] uppercase">From</span>
            <input 
              type="date" 
              className="bg-transparent text-[#1b254b] dark:text-white text-xs font-bold outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-[10px] font-bold text-[#A3AED0] uppercase px-1">To</span>
            <input 
              type="date" 
              className="bg-transparent text-[#1b254b] dark:text-white text-xs font-bold outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-[#A3AED0] hover:text-red-500 font-bold gap-2"
            >
                <FilterX className="h-4 w-4" />
                Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="h-10 w-10 text-[#4318FF] animate-spin" />
            <p className="text-[#A3AED0] font-bold animate-pulse">Loading Audit Logs...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>
    </div>
  );
}
