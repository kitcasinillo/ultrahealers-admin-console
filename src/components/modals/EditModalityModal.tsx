import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { EmojiPicker } from "../pickers/EmojiPicker";

interface EditModalityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: { name: string; icon: string };
  setFormData: (data: any) => void;
  onEdit: () => void;
}

export function EditModalityModal({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData, 
  onEdit 
}: EditModalityModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px] p-8 border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-[#1b254b]">Edit Modality</DialogTitle>
          <DialogDescription className="text-[#A3AED0] text-[15px] pt-1">
            Update the name or icon of this modality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-bold text-[#1b254b] ml-1">Name</Label>
            <Input 
              id="edit-name" 
              className="h-12 px-4 rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none dark:text-white font-medium focus:ring-2 focus:ring-[#4318FF]/20"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#1b254b] ml-1">Emoji / Icon</Label>
            <EmojiPicker 
              value={formData.icon} 
              onChange={(icon) => setFormData({ ...formData, icon })} 
            />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold text-[#A3AED0] hover:text-[#1b254b] transition-all">Cancel</Button>
          </DialogClose>
          <Button onClick={onEdit} className="h-12 px-8 bg-[#4318FF] hover:bg-[#3311db] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(67,24,255,0.39)]">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
