import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

type TemplateType = "healerEmail" | "seekerEmail";

interface PreviewMockData {
  firstName?: string;
  unreadCount?: number;
  senderNames?: string[];
  listingTitle?: string;
  actionUrl?: string;
}

const DEFAULT_MOCK_DATA: Record<TemplateType, PreviewMockData> = {
  healerEmail: {
    firstName: "Jane",
    unreadCount: 3,
    senderNames: ["John D.", "Alice M."],
    listingTitle: "Reiki Energy Healing Session",
    actionUrl: "https://ultrahealers.com/dashboard",
  },
  seekerEmail: {
    firstName: "Alex",
    unreadCount: 2,
    senderNames: ["Dr. Maya Lin"],
    listingTitle: "Sound Bath & Breathwork",
    actionUrl: "https://ultrahealers.com/dashboard",
  },
};

export function EmailPreview() {
  const [template, setTemplate] = useState<TemplateType>("healerEmail");
  const [mockDataText, setMockDataText] = useState<string>(
    JSON.stringify(DEFAULT_MOCK_DATA.healerEmail, null, 2)
  );
  const [renderedData, setRenderedData] = useState<PreviewMockData>(
    DEFAULT_MOCK_DATA.healerEmail
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTemplateChange = (nextTemplate: TemplateType) => {
    setTemplate(nextTemplate);
    const nextDefault = DEFAULT_MOCK_DATA[nextTemplate];
    setMockDataText(JSON.stringify(nextDefault, null, 2));
    setRenderedData(nextDefault);
    setJsonError(null);
  };

  const handleRenderPreview = () => {
    try {
      const parsed = JSON.parse(mockDataText) as PreviewMockData;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Mock data must be a JSON object.");
      }
      setRenderedData(parsed);
      setJsonError(null);
      toast.success("Email preview updated.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Invalid JSON format.";
      setJsonError(msg);
      toast.error("Invalid JSON in mock data.");
    }
  };

  const isHealer = template === "healerEmail";
  const recipientName = renderedData.firstName?.trim() || (isHealer ? "Healer" : "Seeker");
  const senderList = Array.isArray(renderedData.senderNames) && renderedData.senderNames.length > 0
    ? renderedData.senderNames
    : [isHealer ? "Client" : "Practitioner"];
  const totalUnread = Number.isFinite(Number(renderedData.unreadCount)) && Number(renderedData.unreadCount) > 0
    ? Number(renderedData.unreadCount)
    : senderList.length;
  const conversationCount = senderList.length;
  const listingTitle = renderedData.listingTitle?.trim() || "Untitled Service";
  const actionUrl = renderedData.actionUrl?.trim() || "https://ultrahealers.com/dashboard";

  const subjectText = `You have ${conversationCount} conversation${conversationCount > 1 ? "s" : ""} with unread messages - Ultra Healers`;

  return (
    <div className="bg-white dark:bg-[#111C44] rounded-3xl p-6 shadow-[0_10px_30px_0_rgba(11,20,55,0.06)] dark:shadow-none border border-transparent dark:border-white/5 lg:col-span-2">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 flex items-center justify-center text-[#4318FF] dark:text-[#01A3B4]">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1b254b] dark:text-white">Email Template Preview</h3>
            <p className="text-sm text-[#A3AED0] font-medium">Verify unread-message email rendering with sample data</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Template</label>
            <div className="relative">
              <select
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
                className="w-full px-4 py-2.5 bg-[#F4F7FE] dark:bg-white/5 border-none rounded-xl text-sm font-medium text-[#1b254b] dark:text-white focus:ring-2 focus:ring-[#4318FF] appearance-none pr-10 cursor-pointer"
              >
                <option value="healerEmail">healerEmail (Unread Messages)</option>
                <option value="seekerEmail">seekerEmail (Unread Messages)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1b254b] dark:text-white mb-2">Mock Data (JSON)</label>
            <textarea
              rows={9}
              value={mockDataText}
              onChange={(e) => setMockDataText(e.target.value)}
              className="w-full px-4 py-3 bg-[#1b254b] text-green-400 font-mono text-xs rounded-xl border-none focus:ring-2 focus:ring-[#01A3B4]"
            />
            {jsonError && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{jsonError}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRenderPreview}
            className="flex items-center justify-center gap-2 bg-[#4318FF] text-white w-full py-3 rounded-xl font-bold hover:bg-[#3311db] transition-all text-sm cursor-pointer"
          >
            Render Preview
          </button>
        </div>

        <div className="md:col-span-2">
          <div className="h-full min-h-[340px] border border-gray-200 dark:border-white/10 rounded-2xl bg-white flex flex-col overflow-hidden text-black">
            <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 px-4 py-2.5 text-xs text-gray-500 font-mono flex gap-2">
              <span className="shrink-0">Subject:</span>
              <span className="text-black dark:text-white font-bold truncate">{subjectText}</span>
            </div>

            <div className="flex-1 bg-white overflow-y-auto">
              <div className="max-w-[600px] mx-auto font-sans">
                <div
                  className="p-7 text-center"
                  style={{ background: "linear-gradient(135deg, #01A3B4 0%, #0891b2 100%)" }}
                >
                  <h1 className="text-white font-bold text-2xl m-0">Ultra Healers</h1>
                  <p className="text-white/90 text-sm mt-2 mb-0">You have unread messages</p>
                </div>

                <div className="p-7">
                  <h2 className="text-[#333] text-lg font-bold mb-4">Hi {recipientName},</h2>
                  <p className="text-[#666] text-sm leading-relaxed mb-6">
                    You have <strong className="text-[#333]">{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</strong>{" "}
                    across <strong className="text-[#333]">{conversationCount} conversation{conversationCount > 1 ? "s" : ""}</strong>.
                  </p>

                  <div className="space-y-3 my-6">
                    {senderList.map((sender, idx) => {
                      const perConvUnread = idx === 0
                        ? Math.max(1, totalUnread - (senderList.length - 1))
                        : 1;
                      return (
                        <div
                          key={`${sender}-${idx}`}
                          className="bg-[#f8f9fa] p-4 rounded-lg border-l-4 border-[#01A3B4]"
                        >
                          <h4 className="m-0 mb-1.5 text-[#01A3B4] font-bold text-sm">
                            {listingTitle}
                          </h4>
                          <p className="m-0 mb-1 text-[#666] text-xs">
                            <strong>{isHealer ? "Seeker" : "Healer"}:</strong> {sender}
                          </p>
                          <p className="m-0 mb-1 text-[#666] text-xs">
                            <strong>Unread messages:</strong> {perConvUnread}
                          </p>
                          <p className="m-0 text-[#999] text-[11px]">
                            Last message: Just now
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center my-7">
                    <a
                      href={actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-[#01A3B4] text-white px-7 py-3 rounded-md font-bold text-sm no-underline"
                    >
                      View Messages
                    </a>
                  </div>

                  <p className="text-[#999] text-xs mt-7 pt-5 border-t border-gray-200">
                    This is an automated notification from Ultra Healers. You can manage your notification preferences in your account settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
