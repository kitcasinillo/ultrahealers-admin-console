import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { getDisputes, updateDisputeStatus, escalateDispute, sendDisputeEmail, exportDisputes } from '@/lib/disputes';
import type { Dispute } from '@/lib/disputes';
import { DisputesFilters, type DisputesFiltersState } from './DisputesFilters';
import { getColumns, type DisputesColumnsActions } from './columns';
import { DataTable } from '@/components/DataTable';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function DisputesPage() {
  const { showToast } = useToast();
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
      showToast('Failed to load disputes', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);


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
            showToast('Failed to update status', 'error');
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
            showToast('Failed to escalate dispute', 'error');
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
            showToast('Failed to send email', 'error');
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
        showToast("Downloaded export file successfully");
      }
    } catch (e) {
      showToast('Failed to export disputes', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        tr:has([data-safety="true"]) {
          border-left: 6px solid #ef4444 !important;
        }
      `}</style>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Disputes Queue</h2>
          <p className="text-[#A3AED0] text-sm mt-1 font-medium">Manage and triage platform disputes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport} 
            className="flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-semibold py-2.5 px-5 rounded-full transition-all text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <DisputesFilters 
        filters={filters}
        setFilters={setFilters}
        summary={summary}
      />

      <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
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
