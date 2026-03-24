import { SchedulerPanel } from "./components/SchedulerPanel";
import { TestNotification } from "./components/TestNotification";
import { EventDispatcher } from "./components/EventDispatcher";
import { EmailPreview } from "./components/EmailPreview";

export function Notifications() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#1b254b] dark:text-white">Notifications & Events</h2>
                    <p className="text-[#A3AED0] text-sm mt-1 font-medium">
                        Manage email schedules, trigger test notifications, and dispatch system events.
                    </p>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <SchedulerPanel />
                <TestNotification />
                <EventDispatcher />
                <EmailPreview />
            </div>
        </div>
    );
}

