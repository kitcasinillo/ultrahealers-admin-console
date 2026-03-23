import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog"

interface CancelBookingModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    bookingName?: string
    isCancelling: boolean
    type?: "session" | "enrollment"
}

export function CancelBookingModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    bookingName, 
    isCancelling,
    type = "session"
}: CancelBookingModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="rounded-[30px] p-8 border-none shadow-3xl bg-white dark:bg-[#111C44]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-[#1b254b] dark:text-white">
                        Cancel this {type}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[15px] font-medium text-[#A3AED0] pt-2 leading-relaxed">
                        You are about to cancel the {type} for <span className="text-[#1b254b] dark:text-white font-bold">"{bookingName}"</span>.
                        This will mark the record as cancelled in your staging environment.
                        <br /><br />
                        <span className="text-red-500 font-bold">Warning: This action cannot be reversed.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                    <AlertDialogCancel className="rounded-2xl border-none bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 h-12 px-6 font-bold text-[#1b254b] dark:text-white transition-all">
                        No, keep it
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isCancelling}
                        className="rounded-2xl bg-red-500 hover:bg-red-600 h-12 px-8 font-bold text-white shadow-xl shadow-red-100 dark:shadow-none transition-all"
                    >
                        {isCancelling ? "Processing..." : `Yes, Cancel ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
