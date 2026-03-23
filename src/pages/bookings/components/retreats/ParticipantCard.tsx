import { User, Mail } from "lucide-react"

interface ParticipantCardProps {
    name: string
    email?: string
    role: "Participant" | "Host"
    userId?: string
    colorClass: string
}

export function ParticipantCard({ name, email, role, userId, colorClass }: ParticipantCardProps) {
    return (
        <div className="bg-white dark:bg-[#111C44] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-6 flex items-center gap-2">
                <User className={`h-5 w-5 ${colorClass === 'green' ? 'text-green-500' : 'text-indigo-500'}`} /> {role} Details
            </h3>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        colorClass === 'green' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                        {name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-[#1b254b] dark:text-white">{name}</span>
                        {email && (
                            <div className="flex items-center gap-1.5 text-xs text-[#A3AED0] font-medium">
                                <Mail className="h-3 w-3" /> {email}
                            </div>
                        )}
                    </div>
                </div>
                {userId && (
                    <div className="mt-2 pt-4 border-t border-gray-50 dark:border-white/5">
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-[#A3AED0] font-medium">User ID</span>
                            <span className="text-[#1b254b] dark:text-white font-mono text-xs">{userId.slice(0, 12)}...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
