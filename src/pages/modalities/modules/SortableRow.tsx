import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { cn } from "../../../lib/utils";
import { type Modality } from "../../../lib/modalities";

interface SortableRowProps {
  modality: Modality;
  onEdit: (m: Modality) => void;
  onDelete: (m: Modality) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function SortableRow({ modality, onEdit, onDelete, onToggleActive }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: modality.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-gray-100 dark:border-white/5 transition-colors bg-white dark:bg-[#111C44]",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <td className="p-4 w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#A3AED0] hover:text-[#4318FF]">
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="p-5 font-bold text-[15px] text-[#1b254b] dark:text-white">
        {modality.name}
      </td>
      <td className="p-5 text-2xl">
        {modality.icon}
      </td>
      <td className="p-5">
        <Badge variant="secondary" className="bg-[#F4F7FE] dark:bg-white/5 text-[#4318FF] dark:text-[#01A3B4] font-bold px-3 py-1 text-xs">
          {modality.listingsCount} Listings
        </Badge>
      </td>
      <td className="p-5">
        <Switch
          checked={modality.active}
          onCheckedChange={(checked: boolean) => onToggleActive(modality.id, checked)}
        />
      </td>
      <td className="p-5 text-[#A3AED0] text-sm font-bold">
        {new Date(modality.createdAt).toLocaleDateString()}
      </td>
      <td className="p-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onEdit(modality)} className="h-9 w-9 text-[#A3AED0] hover:text-[#4318FF] dark:hover:text-white bg-[#F4F7FE] dark:bg-white/5 rounded-lg transition-all cursor-pointer">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(modality)} className="h-9 w-9 text-[#A3AED0] hover:text-red-500 bg-[#F4F7FE] dark:bg-white/5 rounded-lg transition-all cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
