import { useMemo, useState } from "react";
import { Search, Smile } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EMOJI_LIST } from "../../lib/modalities";
import { cn } from "../../lib/utils";

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [search, setSearch] = useState("");

  const filteredEmojis = useMemo(() => {
    return EMOJI_LIST.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.char.includes(search) || 
      !search
    );
  }, [search]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("w-full h-12 justify-between px-4 rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none font-medium hover:bg-[#E2E8F0] dark:hover:bg-white/10", className)}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">{value || "✨"}</span>
            <span className="text-[#1b254b] dark:text-white">{value ? "Selected Emoji" : "Pick an emoji"}</span>
          </span>
          <Smile className="h-5 w-5 text-[#A3AED0]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start"
        className="p-3 w-[min(380px,calc(100vw-48px))] rounded-2xl border border-gray-100 dark:border-white/5 shadow-2xl bg-white dark:bg-[#111C44] outline-none overflow-hidden"
      >
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AED0]" />
            <Input 
              placeholder="Search symbols..." 
              className="pl-10 h-10 rounded-xl bg-[#F4F7FE] dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-7 gap-1 max-h-[max(200px,30vh)] overflow-y-auto pr-1 custom-scrollbar">
          {filteredEmojis.map((emoji) => (
            <DropdownMenuItem 
              key={`${emoji.char}-${emoji.name}`} 
              className="h-11 w-11 p-0 flex items-center justify-center text-xl rounded-xl cursor-pointer hover:bg-[#F4F7FE] dark:hover:bg-white/5 focus:bg-[#F4F7FE] dark:focus:bg-white/10 transition-colors"
              onClick={() => {
                onChange(emoji.char);
                setSearch("");
              }}
            >
              {emoji.char}
            </DropdownMenuItem>
          ))}
          {filteredEmojis.length === 0 && (
            <div className="col-span-full py-8 text-center text-[#A3AED0] text-sm">
              No symbols found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
