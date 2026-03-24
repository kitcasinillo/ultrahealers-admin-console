import { Badge } from "@/components/ui/badge";
import type { ActionType, ResourceType } from "./types";
import { formatActionLabel, formatResourceLabel } from "./utils";
import { cn } from "@/lib/utils";

export function ActionBadge({ action }: { action: ActionType }) {
  const styles: Record<ActionType, string> = {
    Created: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    Updated: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    Deleted: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    Campaign_sent: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    Dispute_decided: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    Login: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    Settings_changed: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  };

  return (
    <Badge variant="outline" className={cn("rounded-full font-bold px-3 py-0.5 text-[10px]", styles[action])}>
      {formatActionLabel(action)}
    </Badge>
  );
}

export function ResourceBadge({ resource }: { resource: ResourceType }) {
  return (
    <span className="font-medium text-[#A3AED0]">
      {formatResourceLabel(resource)}
    </span>
  );
}

export function ChangesView({ changes }: { changes: any }) {
  if (!changes) return <span className="text-[#A3AED0] italic text-xs">No detail</span>;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (typeof changes === 'string') {
    return <span className="text-xs text-[#1b254b] dark:text-white font-medium line-clamp-2">{capitalize(changes)}</span>;
  }

  // Handle common "from/to" pattern
  // Example: { "status": { "from": "pending", "to": "active" } }
  // Example: { "platformFee": { "from": 10, "to": 12 } }
  if (typeof changes === 'object' && !Array.isArray(changes)) {
    const keys = Object.keys(changes);
    if (keys.length === 1) {
      const field = keys[0];
      const val = changes[field];
      if (val && typeof val === 'object' && 'from' in val && 'to' in val) {
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#A3AED0] font-bold uppercase text-[9px]">{field}:</span>
            <span className="text-[#1b254b] dark:text-white/60 line-through decoration-[#FF5B5B]/30">{String(val.from)}</span>
            <span className="text-[#A3AED0]">→</span>
            <span className="text-emerald-500 font-bold">{String(val.to)}</span>
          </div>
        );
      }
      
      // Handle { "title": "Bali Retreat" }
      if (typeof val === 'string' || typeof val === 'number') {
        const displayVal = typeof val === 'string' ? capitalize(val) : String(val);
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#A3AED0] font-bold uppercase text-[9px]">{field}:</span>
            <span className="text-[#1b254b] dark:text-white font-medium">{displayVal}</span>
          </div>
        );
      }
    }
  }

  return (
    <div className="text-[10px] font-mono bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 max-w-[250px] overflow-hidden">
      <pre className="text-[#1b254b] dark:text-white/80 whitespace-pre-wrap leading-tight">
        {JSON.stringify(changes, null, 1)}
      </pre>
    </div>
  );
}
