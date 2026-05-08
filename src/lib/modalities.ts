import { collection, query, where, getCountFromServer, or } from "firebase/firestore";
import api from "@/lib/api";
import { db } from "./firebase";

export interface Modality {
  id: string;
  name: string;
  icon: string;
  listingsCount: number;
  active: boolean;
  order: number;
  createdAt: string;
  slug?: string;
  synonyms?: string[];
}

export const EMOJI_LIST = [
  { char: "✨", name: "sparkles" }, { char: "🙌", name: "hands" }, { char: "💎", name: "gem" }, { char: "🧘", name: "meditation" },
  { char: "🃏", name: "cards" }, { char: "🍃", name: "leaf" }, { char: "🔥", name: "fire" }, { char: "💧", name: "drop" },
  { char: "🌙", name: "moon" }, { char: "☀️", name: "sun" }, { char: "🌈", name: "rainbow" }, { char: "⚖️", name: "balance" },
  { char: "🛡️", name: "shield" }, { char: "🧬", name: "dna" }, { char: "🔮", name: "crystal ball" }, { char: "🧿", name: "evil eye" },
  { char: "🪈", name: "flute" }, { char: "🪔", name: "lamp" }, { char: "🕯️", name: "candle" }, { char: "💆‍♀️", name: "massage" },
  { char: "💆‍♂️", name: "massage" }, { char: "🧠", name: "brain" }, { char: "❤️", name: "heart" }, { char: "🍀", name: "clover" },
  { char: "🌸", name: "flower" }, { char: "🌱", name: "sprout" }, { char: "🦋", name: "butterfly" }, { char: "🦅", name: "eagle" },
  { char: "🐺", name: "wolf" }, { char: "🦉", name: "owl" }, { char: "☀️", name: "sun" }, { char: "⭐", name: "star" },
  { char: "🌟", name: "star" }, { char: "🌠", name: "star" }, { char: "☁️", name: "cloud" }, { char: "⚡", name: "bolt" },
  { char: "❄️", name: "snow" }, { char: "🌊", name: "wave" }, { char: "☄️", name: "comet" }, { char: "🏹", name: "bow" },
  { char: "🏺", name: "amphora" }, { char: "🪵", name: "wood" }, { char: "🪴", name: "potted plant" }, { char: "🌵", name: "cactus" },
  { char: "🌴", name: "palm" }, { char: "🌳", name: "tree" }, { char: "🍁", name: "maple" }, { char: "🍄", name: "mushroom" },
  { char: "🐚", name: "shell" }, { char: "🪨", name: "rock" }, { char: "🪐", name: "planet" }, { char: "🔭", name: "telescope" },
  { char: "🗝️", name: "key" }, { char: "📜", name: "scroll" }, { char: "📖", name: "book" }, { char: "🔔", name: "bell" },
  { char: "🏵️", name: "rosette" }, { char: "🌻", name: "sunflower" }, { char: "🌼", name: "blossom" }, { char: "🌷", name: "tulip" },
  { char: "🍇", name: "grapes" }, { char: "🍎", name: "apple" }, { char: "🍯", name: "honey" }, { char: "🍵", name: "tea" },
  { char: "🥢", name: "chopsticks" }, { char: "🥄", name: "spoon" }, { char: "🏺", name: "jar" }, { char: "🧘‍♀️", name: "yoga" },
  { char: "🧘‍♂️", name: "yoga" }, { char: "👁️", name: "eye" }, { char: "👂", name: "ear" }, { char: "👃", name: "nose" },
  { char: "👅", name: "tongue" }, { char: "👋", name: "wave" }, { char: "🤚", name: "hand" }, { char: "🖐️", name: "hand" },
  { char: "✋", name: "hand" }, { char: "🖖", name: "vulcan" }, { char: "👌", name: "ok" }, { char: "🤌", name: "pinched" },
  { char: "🤏", name: "pinched" }, { char: "✌️", name: "peace" }, { char: "🤞", name: "fingers crossed" }, { char: "🤟", name: "love" },
  { char: "🤘", name: "metal" }, { char: "🤙", name: "call me" }, { char: "👈", name: "left" }, { char: "👉", name: "right" },
  { char: "👆", name: "up" }, { char: "👇", name: "down" }, { char: "💪", name: "strong" }, { char: "🦾", name: "robotic" },
  { char: "🤝", name: "handshake" }, { char: "🙏", name: "pray" }, { char: "✍️", name: "writing" }, { char: "🤳", name: "selfie" }
];

const modalityIcons: Record<string, string> = {
  reiki: "🙌",
  tarot: "🃏",
  chakra: "🧘",
  crystal: "💎",
  aura: "✨",
  sound: "🔔",
  meditation: "🧘",
  breathwork: "🌬️",
  astrology: "🔮",
  massage: "💆‍♀️",
};

const pickIcon = (slug?: string, label?: string) => {
  const key = `${slug || ""} ${label || ""}`.toLowerCase();
  const match = Object.entries(modalityIcons).find(([token]) => key.includes(token));
  return match?.[1] || "✨";
};

export const fetchModalities = async (): Promise<Modality[]> => {
  const response = await api.get<{ success: boolean; modalities: Array<Record<string, any>> }>("/api/modalities");

  const modalities = (response.data.modalities || []).map((item, index) => ({
    id: String(item.id || item.slug || index),
    slug: typeof item.slug === "string" ? item.slug : undefined,
    name: String(item.label || item.name || item.slug || "Unnamed modality"),
    icon: pickIcon(item.slug, item.label || item.name),
    listingsCount: Number(item.listingsCount || 0),
    active: item.active !== false,
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
  }));

  // Fetch actual counts from Firestore to ensure data fidelity
  try {
    const results = await Promise.all(modalities.map(async (m) => {
      try {
        const countSnap = await getCountFromServer(
          query(
            collection(db, "listings"),
            or(
              where("category", "==", m.name),
              where("category", "array-contains", m.name),
              where("modality", "==", m.name),
              where("modality", "array-contains", m.name)
            )
          )
        );
        
        return { ...m, listingsCount: countSnap.data().count };
      } catch (err) {
        console.error(`Failed to fetch count for ${m.name}:`, err);
        return m;
      }
    }));
    return results;
  } catch (error) {
    console.error("Failed to fetch all modality counts:", error);
    return modalities;
  }
};

export const createModality = async (data: { name: string; icon: string }): Promise<Modality> => {
  try {
    const response = await api.post<{ success: boolean; modality: Record<string, any> }>("/api/modalities", data);
    if (!response.data.success) {
      throw new Error("Failed to create modality");
    }
    const item = response.data.modality;
    return {
      id: String(item.id || item.slug),
      slug: typeof item.slug === "string" ? item.slug : undefined,
      name: String(item.label || item.name || item.slug || "Unnamed modality"),
      icon: String(item.icon || pickIcon(item.slug, item.label || item.name)),
      listingsCount: Number(item.listingsCount || 0),
      active: item.active !== false,
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : 999,
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
    };
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const updateModality = async (id: string, data: Partial<Modality>): Promise<Modality> => {
  try {
    // Backend takes name, icon, active, etc.
    const response = await api.put<{ success: boolean; modality: Record<string, any> }>(`/api/modalities/${id}`, data);
    if (!response.data.success) {
      throw new Error("Failed to update modality");
    }
    const item = response.data.modality;
    return {
      id: String(item.id || item.slug),
      slug: typeof item.slug === "string" ? item.slug : undefined,
      name: String(item.label || item.name || item.slug || "Unnamed modality"),
      icon: String(item.icon || pickIcon(item.slug, item.label || item.name)),
      listingsCount: Number(item.listingsCount || 0),
      active: item.active !== false,
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : 999,
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
    };
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const deleteModality = async (id: string): Promise<void> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/api/modalities/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to delete modality");
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};
