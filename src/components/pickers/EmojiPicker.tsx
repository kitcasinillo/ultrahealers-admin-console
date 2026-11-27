import { useState } from "react";
import { Search, Smile } from "lucide-react";
import { EmojiPicker as FrimousseEmojiPicker } from "frimousse";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-12 justify-between px-4 rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none font-medium hover:bg-[#E2E8F0] dark:hover:bg-white/10",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">{value || "✨"}</span>
            <span className="text-[#1b254b] dark:text-white">
              {value ? "Selected Emoji" : "Pick an emoji"}
            </span>
          </span>
          <Smile className="h-5 w-5 text-[#A3AED0]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="pointer-events-auto p-0 w-[min(360px,calc(100vw-48px))] rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl bg-white dark:bg-[#111C44] outline-none overflow-hidden"
      >
        <FrimousseEmojiPicker.Root
          columns={8}
          onEmojiSelect={({ emoji }) => {
            onChange(emoji);
            setOpen(false);
          }}
          className="isolate flex h-[360px] w-full flex-col bg-white dark:bg-[#111C44]"
        >
          <div className="p-3 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
              <FrimousseEmojiPicker.Search
                placeholder="Search emojis..."
                className="w-full pl-9 pr-3 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none text-sm font-medium text-[#1b254b] dark:text-white placeholder:text-[#A3AED0] outline-none focus:ring-2 focus:ring-[#4318FF]/20"
              />
            </div>
          </div>

          <FrimousseEmojiPicker.Viewport className="relative flex-1 overflow-y-auto px-2 outline-none custom-scrollbar">
            <FrimousseEmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#A3AED0]">
              Loading emojis...
            </FrimousseEmojiPicker.Loading>

            <FrimousseEmojiPicker.Empty className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[#A3AED0]">
              {({ search }) =>
                search ? `No emoji found for "${search}"` : "No emojis found."
              }
            </FrimousseEmojiPicker.Empty>

            <FrimousseEmojiPicker.List
              className="pb-2 select-none"
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div
                    {...props}
                    className="bg-white/95 dark:bg-[#111C44]/95 backdrop-blur-xs px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A3AED0]"
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }) => (
                  <div {...props} className="scroll-my-1.5 px-1">
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }) => (
                  <button
                    type="button"
                    {...props}
                    className="flex size-10 items-center justify-center rounded-xl text-xl cursor-pointer transition-colors data-[active]:bg-[#F4F7FE] dark:data-[active]:bg-white/10"
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </FrimousseEmojiPicker.Viewport>

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/5 px-3 py-2 bg-gray-50/50 dark:bg-white/[0.02]">
            <FrimousseEmojiPicker.ActiveEmoji>
              {({ emoji }) =>
                emoji ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg leading-none">{emoji.emoji}</span>
                    <span className="truncate text-xs font-medium text-[#1b254b] dark:text-white capitalize">
                      {emoji.label}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[#A3AED0]">
                    Select an emoji...
                  </span>
                )
              }
            </FrimousseEmojiPicker.ActiveEmoji>

            <FrimousseEmojiPicker.SkinToneSelector
              type="button"
              title="Change skin tone"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F7FE] dark:bg-white/5 hover:bg-[#E2E8F0] dark:hover:bg-white/10 text-base cursor-pointer transition-colors"
            />
          </div>
        </FrimousseEmojiPicker.Root>
      </PopoverContent>
    </Popover>
  );
}
