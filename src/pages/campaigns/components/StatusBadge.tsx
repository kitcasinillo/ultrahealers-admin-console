import type { CampaignStatus } from "../utils/type"
import { STATUS_STYLES, STATUS_ICONS } from "../utils"

interface StatusBadgeProps {
    status: CampaignStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles = STATUS_STYLES[status]
    const isSending = status === "sending"

    return (
        <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles.bg} ${styles.text} ${styles.darkBg} ${styles.darkText} ${isSending ? "animate-pulse" : ""}`}
        >
            {STATUS_ICONS[status]}
            {status}
        </div>
    )
}
