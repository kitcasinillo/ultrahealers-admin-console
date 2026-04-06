import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "./ui/dialog"
import { Button } from "./ui/button"

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-[#A3AED0]">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-xl font-bold">
                        {cancelText}
                    </Button>
                    <Button 
                        variant={variant} 
                        onClick={onConfirm} 
                        disabled={isLoading} 
                        className="rounded-xl font-bold"
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
