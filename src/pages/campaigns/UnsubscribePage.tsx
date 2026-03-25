import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle } from "lucide-react"

export function UnsubscribePage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

    useEffect(() => {
        // Mocking the unsubscribe process
        if (!token) {
            setStatus("error")
            return
        }
        
        const timeout = setTimeout(() => {
            // Mock random success or failure if needed, defaulting to success for valid token
            if (token === "invalid") {
                setStatus("error")
            } else {
                setStatus("success")
            }
        }, 800)

        return () => clearTimeout(timeout)
    }, [token])

    return (
        <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0B1437] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111C44] max-w-md w-full rounded-[24px] shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 p-8 text-center space-y-6">
                
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-12 h-12 border-4 border-[#4318FF]/20 border-t-[#4318FF] rounded-full animate-spin"></div>
                        <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">Processing your request...</h2>
                        <p className="text-[#A3AED0] text-sm">Please wait while we update your preferences.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1b254b] dark:text-white">Successfully Unsubscribed</h2>
                        <p className="text-[#A3AED0] text-sm leading-relaxed">
                            You have been successfully removed from our mailing list. You will no longer receive marketing emails from UltraHealers. 
                        </p>
                        <p className="text-[#A3AED0] text-sm mt-4">
                            You can safely close this page.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1b254b] dark:text-white">Update Failed</h2>
                        <p className="text-[#A3AED0] text-sm leading-relaxed">
                            We were unable to process your unsubscribe request. The link may have expired or is invalid.
                        </p>
                        <p className="text-[#A3AED0] text-sm mt-4">
                            Please contact support if you continue to receive unwanted emails.
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}
