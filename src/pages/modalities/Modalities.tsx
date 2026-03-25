import { useState, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ConfirmModal } from "../../components/modals/ConfirmModal";

import { SortableRow } from "./modules/SortableRow";
import { MediaLibraryTab } from "./modules/MediaLibraryTab";
import { AddModalityModal } from "../../components/modals/AddModalityModal";
import { EditModalityModal } from "../../components/modals/EditModalityModal";

import { type Modality, mockModalities, initializeModalitiesIfEmpty } from "../../lib/modalities";

export default function Modalities() {
  const [modalities, setModalities] = useState<Modality[]>(mockModalities);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [currentModality, setCurrentModality] = useState<Modality | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredModalities = useMemo(() => {
    return modalities.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modalities, searchQuery]);

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
    setModalities(prev => prev.map(m => m.id === id ? { ...m, active } : m));
  };

  const handleAdd = () => {
    const newModality: Modality = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      icon: formData.icon || "✨",
      listingsCount: 0,
      active: true,
      order: modalities.length,
      createdAt: new Date().toISOString()
    };
    setModalities([...modalities, newModality]);
    setIsAddModalOpen(false);
    setFormData({ name: "", icon: "" });
  };

  const handleEdit = () => {
    if (!currentModality) return;
    setModalities(prev => prev.map(m => m.id === currentModality.id ? { ...m, name: formData.name, icon: formData.icon } : m));
    setIsEditModalOpen(false);
    setCurrentModality(null);
    setFormData({ name: "", icon: "" });
  };

  const handleDelete = () => {
    if (!currentModality) return;
    setModalities(prev => prev.filter(m => m.id !== currentModality.id));
    setIsConfirmDeleteOpen(false);
    setCurrentModality(null);
  };

  const handleReseed = () => {
    const defaultData = initializeModalitiesIfEmpty();
    setModalities(defaultData);
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

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-transparent border-b border-gray-100 dark:border-white/5 w-full justify-start rounded-none h-auto p-0 mb-8 gap-10">
          <TabsTrigger
            value="list"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#4318FF] data-[state=active]:text-[#4318FF] dark:data-[state=active]:text-white rounded-none bg-transparent px-0 py-4 font-bold text-[15px] text-[#A3AED0] transition-all border-b-2 border-transparent hover:text-[#1b254b] dark:hover:text-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Modalities List
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#4318FF] data-[state=active]:text-[#4318FF] dark:data-[state=active]:text-white rounded-none bg-transparent px-0 py-4 font-bold text-[15px] text-[#A3AED0] transition-all border-b-2 border-transparent hover:text-[#1b254b] dark:hover:text-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Media Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
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
                      items={filteredModalities.map(m => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredModalities.map((modality) => (
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
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <MediaLibraryTab />
        </TabsContent>
      </Tabs>

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
