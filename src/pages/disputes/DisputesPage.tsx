import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDisputes, updateDisputeStatus, escalateDispute, sendDisputeEmail, exportDisputes } from '@/lib/disputes';
import type { Dispute } from '@/lib/disputes';
import { DisputesFilters, type DisputesFiltersState } from './DisputesFilters';
import { getColumns, type DisputesColumnsActions } from './columns';
import { DataTable } from '@/components/DataTable';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DisputesFiltersState>({
    search: '',
    status: [],
    type: [],
    severity: 'all',
    overdue: false,
    healerId: '',
    seekerId: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [summary, setSummary] = useState({ open: 0, safety: 0, overdue: 0, inReview: 0 });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
    isLoading: false
  });

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDisputes({
        ...filters,
        status: filters.status.join(',') || undefined,
        type: filters.type.join(',') || undefined
      });
      
      const items = data.data || [];
      
      const sortedData = [...items].sort((a, b) => {
        if (a.severity === 'safety' && b.severity !== 'safety') return -1;
        if (a.severity !== 'safety' && b.severity === 'safety') return 1;
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      setDisputes(sortedData);
      
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary({
          open: items.filter(d => d.status === 'open').length,
          safety: items.filter(d => d.severity === 'safety').length,
          overdue: items.filter(d => d.isOverdue).length,
          inReview: items.filter(d => d.status === 'in_review').length,
        });
      }
    } catch (error) {
      console.error(error);
      alert('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const showToast = useCallback((msg: string, isError = false) => {
    // Basic fallback without accessing ToastContext since we can't find it directly
    alert(isError ? `Error: ${msg}` : `Success: ${msg}`);
  }, []);

  const actions: DisputesColumnsActions = useMemo(() => ({
    onMarkInReview: (id) => {
      setConfirmModal({
        isOpen: true,
        title: 'Mark as In Review',
        description: 'Are you sure you want to mark this dispute as In Review?',
        isLoading: false,
        onConfirm: async () => {
          setConfirmModal(p => ({ ...p, isLoading: true }));
          try {
            await updateDisputeStatus(id, 'in_review');
            showToast('Dispute marked as In Review');
            fetchDisputes();
          } catch (e) {
            showToast('Failed to update status', true);
          } finally {
            setConfirmModal(p => ({ ...p, isOpen: false, isLoading: false }));
          }
        }
      });
    },
    onEscalate: (id) => {
      setConfirmModal({
        isOpen: true,
        title: 'Escalate to Safety',
        description: 'Are you sure you want to escalate this dispute to Safety severity?',
        isLoading: false,
        onConfirm: async () => {
          setConfirmModal(p => ({ ...p, isLoading: true }));
          try {
            await escalateDispute(id);
            showToast('Dispute escalated to Safety');
            fetchDisputes();
          } catch (e) {
            showToast('Failed to escalate dispute', true);
          } finally {
            setConfirmModal(p => ({ ...p, isOpen: false, isLoading: false }));
          }
        }
      });
    },
    onSendEmail: (id) => {
      setConfirmModal({
        isOpen: true,
        title: 'Send Notification',
        description: 'This will send an email notification to the involved parties. Continue?',
        isLoading: false,
        onConfirm: async () => {
          setConfirmModal(p => ({ ...p, isLoading: true }));
          try {
            await sendDisputeEmail(id);
            showToast('Email notification sent successfully');
          } catch (e) {
            showToast('Failed to send email', true);
          } finally {
            setConfirmModal(p => ({ ...p, isOpen: false, isLoading: false }));
          }
        }
      });
    },
    onCopyPath: (msg) => showToast(msg)
  }), [fetchDisputes, showToast]);

  const columns = useMemo(() => getColumns(actions), [actions]);

  const handleExport = async () => {
    try {
      const blob = await exportDisputes({
        ...filters,
        status: filters.status.join(',') || undefined,
        type: filters.type.join(',') || undefined
      });
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'disputes-export.csv');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        alert("Downloaded export file successfully");
      }
    } catch (e) {
      showToast('Failed to export disputes', true);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <style>{`
        tr:has([data-safety="true"]) {
          border-left: 4px solid #ef4444 !important;
        }
        tr:has([data-overdue="true"]) {
          background-color: #fef2f2 !important;
        }
        .dark tr:has([data-overdue="true"]) {
          background-color: rgba(69, 10, 10, 0.2) !important;
        }
      `}</style>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disputes Queue</h1>
          <p className="text-muted-foreground">Manage and triage platform disputes.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <DisputesFilters 
        filters={filters}
        setFilters={setFilters}
        summary={summary}
      />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-64">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No disputes found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              We couldn't find any disputes matching your filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="w-full relative overflow-x-auto">
            <DataTable columns={columns} data={disputes} />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(x => ({ ...x, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        isLoading={confirmModal.isLoading}
        confirmText="Confirm Action"
      />
    </div>
  );
}
