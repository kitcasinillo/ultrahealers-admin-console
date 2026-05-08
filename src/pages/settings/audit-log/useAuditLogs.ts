import { useState, useMemo, useCallback, useEffect } from "react";
import type { AuditLogEntry } from "./types";
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/data/audit-logs.json");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
  }, [fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof log.changes === 'string' && log.changes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAdmin = adminFilter === "All" || log.adminName === adminFilter;
      const matchesAction = actionFilter === "All" || log.action === actionFilter;
      const matchesResource = resourceFilter === "All" || log.resourceType === resourceFilter;
      
      const logDate = new Date(log.timestamp);
      const matchesStartDate = !startDate || logDate >= new Date(startDate);
      const matchesEndDate = !endDate || logDate <= new Date(endDate + "T23:59:59");

      return matchesSearch && matchesAdmin && matchesAction && matchesResource && matchesStartDate && matchesEndDate;
    });
  }, [logs, searchQuery, adminFilter, actionFilter, resourceFilter, startDate, endDate]);

  const adminOptions = useMemo(() => {
    const admins = Array.from(new Set(logs.map(log => log.adminName)));
    return ["All", ...admins];
  }, [logs]);

  return {
    logs: filteredLogs,
    totalCount: logs.length,
    loading,
    isRefreshing,
    handleRefresh,
    // Filters
    searchQuery, setSearchQuery,
    adminFilter, setAdminFilter,
    actionFilter, setActionFilter,
    resourceFilter, setResourceFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    adminOptions
  };
}
