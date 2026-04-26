import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ConfirmModal } from "../../components/modals/ConfirmModal";

import { SortableRow } from "./modules/SortableRow";
import { AddModalityModal } from "../../components/modals/AddModalityModal";
import { EditModalityModal } from "../../components/modals/EditModalityModal";

import { fetchModalities, type Modality } from "../../lib/modalities";

export default function Modalities() {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [currentModality, setCurrentModality] = useState<Modality | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadModalities = async () => {
      try {
        setIsLoading(true);
        const items = await fetchModalities();
        setModalities(items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to load modalities:", error);
        toast.error("Failed to load modalities from backend.");
      } finally {
        setIsLoading(false);
      }
    };

    loadModalities();
  }, []);

  const filteredModalities = useMemo(() => {
    return modalities.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modalities, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredModalities.length / itemsPerPage);
  const paginatedModalities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredModalities.slice(start, start + itemsPerPage);
  }, [filteredModalities, currentPage]);

  // Handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModalities((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems;
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    const modality = modalities.find(m => m.id === id);
    setModalities(prev => prev.map(m => m.id === id ? { ...m, active } : m));
    toast.error(`Backend support for changing modality status is not available yet${modality ? ` for "${modality.name}"` : ""}.`);
  };

  const handleAdd = () => {
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      toast.error("Please provide a modality name.");
      return;
    }

    toast.error("Backend support for creating modalities is not available yet.");
    setIsAddModalOpen(false);
    setFormData({ name: "", icon: "" });
  };

  const handleEdit = () => {
    if (!currentModality) return;
    toast.error(`Backend support for editing "${currentModality.name}" is not available yet.`);
    setIsEditModalOpen(false);
    setCurrentModality(null);
    setFormData({ name: "", icon: "" });
  };

  const handleDelete = () => {
    if (!currentModality) return;
    toast.error(`Backend support for deleting "${currentModality.name}" is not available yet.`);
    setIsConfirmDeleteOpen(false);
    setCurrentModality(null);
  };

  const handleReseed = () => {
    toast.error("Backend support for reseeding modalities is not available yet.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#1b254b] dark:text-white tracking-tight">Modalities</h2>
          <p className="text-[#A3AED0] text-[15px] font-medium mt-1">Manage healing modalities and platform assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleReseed}
            className="text-[#4318FF] font-bold text-sm h-11 hover:bg-[#F4F7FE] dark:hover:bg-white/5 px-4 cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restore Defaults
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4318FF] hover:bg-[#3311db] text-white font-bold h-11 rounded-xl px-6 shadow-[0_4px_14px_0_rgba(67,24,255,0.39)] cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-5" />
            Add Modality
          </Button>
        </div>
      </div>

      <div className="w-full mt-2">
          <div className="bg-white dark:bg-[#111C44] rounded-[22px] p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5">
            <div className="mb-6 max-w-sm">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#A3AED0]" />
                <Input
                  placeholder="Search modalities..."
                  className="pl-12 h-12 rounded-[14px] bg-[#F4F7FE] dark:bg-white/5 border-none dark:text-white font-medium placeholder:text-[#A3AED0]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4318FF] border-t-transparent" />
              </div>
            ) : modalities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 py-16 text-center text-sm font-medium text-[#A3AED0]">
                No modalities were returned by the backend.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0] w-10"></th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Name</th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Icon/Emoji</th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Listings</th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Active</th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Created</th>
                          <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#A3AED0]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        <SortableContext
                          items={paginatedModalities.map(m => m.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {paginatedModalities.map((modality) => (
                            <SortableRow
                              key={modality.id}
                              modality={modality}
                              onEdit={(m) => {
                                setCurrentModality(m);
                                setFormData({ name: m.name, icon: m.icon });
                                setIsEditModalOpen(true);
                              }}
                              onDelete={(m) => {
                                setCurrentModality(m);
                                setIsConfirmDeleteOpen(true);
                              }}
                              onToggleActive={handleToggleActive}
                            />
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </DndContext>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-6 pb-2">
                  <div className="mr-auto text-xs font-medium text-[#A3AED0]">
                    Drag, add, edit, delete, and reseed actions are still UI-only until backend write endpoints exist.
                  </div>
                  <button
                    className="flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-bold py-2 px-4 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="text-sm font-medium text-[#A3AED0] px-2 flex items-center">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <button
                    className="flex items-center bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-[#4318FF] dark:text-white font-bold py-2 px-4 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
      </div>

      <AddModalityModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        formData={formData}
        setFormData={setFormData}
        onAdd={handleAdd}
      />

      <EditModalityModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        onEdit={handleEdit}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Modality"
        description={
          currentModality?.listingsCount && currentModality.listingsCount > 0
            ? `Warning: There are ${currentModality.listingsCount} listings currently using "${currentModality?.name}". Deleting it may cause issues for these listings. Are you sure?`
            : `Are you sure you want to delete "${currentModality?.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
