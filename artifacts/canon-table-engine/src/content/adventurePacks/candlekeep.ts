export interface AdventurePackEntry {
  id: string;
  title: string;
  adventureCode: string;
  summary: string;
  recommendedLevel: string;
}

export const CANDLEKEEP_ADVENTURE_PACK: AdventurePackEntry[] = [
  {
    id: "cm01",
    title: "The Scrivener's Tale",
    adventureCode: "CM1",
    summary: "A city-based mystery involving the Candlekeep library and a missing font.",
    recommendedLevel: "1-3",
  },
  {
    id: "cm02",
    title: "The Publisher's Page",
    adventureCode: "CM2",
    summary: "An encounter with a ghostly scribe and a haunted collection of scrolls.",
    recommendedLevel: "1-3",
  },
  {
    id: "cm03",
    title: "The Canopic Being",
    adventureCode: "CM3",
    summary: "A mysterious mummy escaped from a far-off tomb threatens Candlekeep.",
    recommendedLevel: "2-4",
  },
];
