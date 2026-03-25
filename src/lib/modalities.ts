export interface Modality {
  id: string;
  name: string;
  icon: string; // Emoji or Icon name/URL
  listingsCount: number;
  active: boolean;
  order: number;
  createdAt: string;
}

export const mockModalities: Modality[] = [
  {
    id: "1",
    name: "Aura Cleansing",
    icon: "✨",
    listingsCount: 15,
    active: true,
    order: 0,
    createdAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Reiki Healing",
    icon: "🙌",
    listingsCount: 42,
    active: true,
    order: 1,
    createdAt: "2024-11-21T11:30:00Z",
  },
  {
    id: "3",
    name: "Crystal Therapy",
    icon: "💎",
    listingsCount: 28,
    active: true,
    order: 2,
    createdAt: "2024-11-22T09:15:00Z",
  },
  {
    id: "4",
    name: "Chakra Balancing",
    icon: "🧘",
    listingsCount: 35,
    active: false,
    order: 3,
    createdAt: "2024-11-23T14:45:00Z",
  },
  {
    id: "5",
    name: "Tarot Reading",
    icon: "🃏",
    listingsCount: 20,
    active: true,
    order: 4,
    createdAt: "2024-11-24T16:20:00Z",
  },
];

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

export const initializeModalitiesIfEmpty = () => {
    console.log("Re-seeding modalities to defaults...");
    // In real app, this would hit API or write back to Firestore
    return [...mockModalities];
};
