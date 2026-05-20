export interface AdventureNode {
  id: string;
  label: string;
  description: string;
}

export interface Adventure {
  id: string;
  title: string;
  sourceBook: string;
  startingLevel: number;
  recommendedCharacters: string;
  nodes: AdventureNode[];
}

export interface CampaignMode {
  id: string;
  title: string;
  adventures: Adventure[];
  requiresCrossover?: boolean;
}

export const ADVENTURES: Adventure[] = [
  {
    id: "cm_joy",
    title: "The Joy of Extradimensional Spaces",
    sourceBook: "CM",
    startingLevel: 1,
    recommendedCharacters: "4 characters, level 1",
    nodes: [
      { id: "cm_joy_01", label: "Introduction / Hooks", description: "Adventure hooks and how the party becomes involved." },
      { id: "cm_joy_02", label: "Candlekeep Arrival", description: "Arrival at Candlekeep and initial investigation." },
      { id: "cm_joy_03", label: "Library Investigation", description: "Researching the extradimensional mystery." },
      { id: "cm_joy_04", label: "Strange Occurrences", description: "Investigating anomalies and gathering clues." },
      { id: "cm_joy_05", label: "Discovery Section", description: "Entering the extradimensional space." },
      { id: "cm_joy_06", label: "Final Encounter", description: "Confronting the source of the strangeness." },
      { id: "cm_joy_07", label: "Aftermath", description: "Resolving the situation and rewards." },
    ],
  },
  {
    id: "cm_mazfroth",
    title: "Mazfroth's Mighty Digressions",
    sourceBook: "CM",
    startingLevel: 2,
    recommendedCharacters: "4 characters, level 2-3",
    nodes: [
      { id: "cm_maz_01", label: "Introduction / Hooks", description: "Adventure hooks and initial contact." },
      { id: "cm_maz_02", label: "Candlekeep Arrival", description: "Arrival and initial library investigation." },
      { id: "cm_maz_03", label: "Research Phase", description: "Tracking the dangerous tome." },
      { id: "cm_maz_04", label: "Complication", description: "A twist complicates the investigation." },
      { id: "cm_maz_05", label: "Major Encounter", description: "Confronting the threat to the library." },
      { id: "cm_maz_06", label: "Resolution", description: "Resolving the danger." },
      { id: "cm_maz_07", label: "Aftermath", description: "Concluding events and rewards." },
    ],
  },
  {
    id: "typ_sunless",
    title: "The Sunless Citadel",
    sourceBook: "TFTYP",
    startingLevel: 1,
    recommendedCharacters: "4 characters, level 1",
    nodes: [
      { id: "typ_sun_01", label: "Introduction / Hooks", description: "How the party learns of the citadel." },
      { id: "typ_sun_02", label: "Journey to the Citadel", description: "Travel and the ravine approach." },
      { id: "typ_sun_03", label: "Outpost Level", description: "First level encounters and exploration." },
      { id: "typ_sun_04", label: "Goblin Territory", description: "Goblin-held areas of the dungeon." },
      { id: "typ_sun_05", label: "Dragon Shrine", description: "The draconic shrine section." },
      { id: "typ_sun_06", label: "Twig Blight Warren", description: "The plant-infested lower area." },
      { id: "typ_sun_07", label: "Belak's Grove", description: "The Twilight Grove and its guardian." },
      { id: "typ_sun_08", label: "Final Encounter", description: "Confronting the ultimate threat." },
      { id: "typ_sun_09", label: "Aftermath", description: "Escaping the citadel and rewards." },
    ],
  },
  {
    id: "typ_forge",
    title: "The Forge of Fury",
    sourceBook: "TFTYP",
    startingLevel: 3,
    recommendedCharacters: "4 characters, level 3-4",
    nodes: [
      { id: "typ_for_01", label: "Introduction / Hooks", description: "Learning of the dwarven fortress." },
      { id: "typ_for_02", label: "Mountain's Throat", description: "Entrance to the dungeon complex." },
      { id: "typ_for_03", label: "Great Underhalls", description: "The main halls and early encounters." },
      { id: "typ_for_04", label: "Glitterhame", description: "The natural cavern area." },
      { id: "typ_for_05", label: "The Sinkhole", description: "Submerged section." },
      { id: "typ_for_06", label: "Foundry", description: "The forge level and its occupants." },
      { id: "typ_for_07", label: "Final Encounter", description: "Confronting the forge's master." },
      { id: "typ_for_08", label: "Aftermath", description: "Recovering the legendary weapon and rewards." },
    ],
  },
  {
    id: "typ_tamoachan",
    title: "The Hidden Shrine of Tamoachan",
    sourceBook: "TFTYP",
    startingLevel: 5,
    recommendedCharacters: "4 characters, level 5-6",
    nodes: [
      { id: "typ_tam_01", label: "Introduction / Hooks", description: "Being trapped in the shrine." },
      { id: "typ_tam_02", label: "Lower Ruins Entrance", description: "Initial exploration under the gas threat." },
      { id: "typ_tam_03", label: "Upper Ruins", description: "The upper level of the shrine complex." },
      { id: "typ_tam_04", label: "The Shrine", description: "Inner shrine and its guardians." },
      { id: "typ_tam_05", label: "Final Chamber", description: "The hidden heart of the shrine." },
      { id: "typ_tam_06", label: "Aftermath", description: "Escaping and examining the rewards." },
    ],
  },
  {
    id: "typ_whitepl",
    title: "White Plume Mountain",
    sourceBook: "TFTYP",
    startingLevel: 8,
    recommendedCharacters: "4 characters, level 8",
    nodes: [
      { id: "typ_wpm_01", label: "Introduction / Hooks", description: "The stolen weapons and the quest." },
      { id: "typ_wpm_02", label: "Dungeon Entrance", description: "Entering the mountain dungeon." },
      { id: "typ_wpm_03", label: "Frictionless Corridor", description: "The infamous slippery passage." },
      { id: "typ_wpm_04", label: "Inverted Ziggurat", description: "The underwater section." },
      { id: "typ_wpm_05", label: "Spinning Cylinder", description: "The rotating room puzzle." },
      { id: "typ_wpm_06", label: "Wave / Whelm / Blackrazor Area", description: "Recovering the legendary weapons." },
      { id: "typ_wpm_07", label: "Final Encounter", description: "Dealing with Keraptis." },
      { id: "typ_wpm_08", label: "Aftermath", description: "Escaping and returning the weapons." },
    ],
  },
  {
    id: "typ_deadinthay",
    title: "Dead in Thay",
    sourceBook: "TFTYP",
    startingLevel: 9,
    recommendedCharacters: "4-6 characters, level 9-11",
    nodes: [
      { id: "typ_dit_01", label: "Introduction / Hooks", description: "The threat from the Doomvault." },
      { id: "typ_dit_02", label: "Doomvault Entrance", description: "Gaining access to the fortress." },
      { id: "typ_dit_03", label: "Gatehouse", description: "The gatehouse sector." },
      { id: "typ_dit_04", label: "Temples Sector", description: "Temples dedicated to dark powers." },
      { id: "typ_dit_05", label: "Labs Sector", description: "Szass Tam's experimental laboratories." },
      { id: "typ_dit_06", label: "Dungeons Sector", description: "Prison areas and dungeon cells." },
      { id: "typ_dit_07", label: "Masters' Domain", description: "The lich lords' personal domains." },
      { id: "typ_dit_08", label: "Phylactery Vault", description: "The ultimate objective." },
      { id: "typ_dit_09", label: "Aftermath", description: "Escaping and the aftermath." },
    ],
  },
  {
    id: "typ_giants",
    title: "Against the Giants",
    sourceBook: "TFTYP",
    startingLevel: 11,
    recommendedCharacters: "4-6 characters, level 11-14",
    nodes: [
      { id: "typ_atg_01", label: "Introduction / Hooks", description: "The giant menace and the call to action." },
      { id: "typ_atg_02", label: "Steading of the Hill Giant Chief", description: "First giant stronghold." },
      { id: "typ_atg_03", label: "Glacial Rift of the Frost Giant Jarl", description: "Second stronghold in frozen reaches." },
      { id: "typ_atg_04", label: "Hall of the Fire Giant King", description: "The final giant stronghold." },
      { id: "typ_atg_05", label: "Drow Connection", description: "Discovering who is behind the giants." },
      { id: "typ_atg_06", label: "Aftermath", description: "Resolving the giant threat and rewards." },
    ],
  },
  {
    id: "typ_tomb",
    title: "Tomb of Horrors",
    sourceBook: "TFTYP",
    startingLevel: 10,
    recommendedCharacters: "4-6 characters, level 10-12",
    nodes: [
      { id: "typ_toh_01", label: "Introduction / Hooks", description: "Learning of the demi-lich's tomb." },
      { id: "typ_toh_02", label: "Dungeon Entrance", description: "Navigating the tomb's entrance and first traps." },
      { id: "typ_toh_03", label: "False Tomb Section", description: "Deadly false chambers." },
      { id: "typ_toh_04", label: "Main Tomb", description: "The deeper tomb levels." },
      { id: "typ_toh_05", label: "Demi-Lich Chamber", description: "The final confrontation." },
      { id: "typ_toh_06", label: "Aftermath", description: "Escaping the tomb and aftermath." },
    ],
  },
];

export const CAMPAIGN_MODES: CampaignMode[] = [
  {
    id: "candlekeep",
    title: "Candlekeep Mysteries",
    adventures: ADVENTURES.filter((a) => a.sourceBook === "CM"),
  },
  {
    id: "yawning_portal",
    title: "Tales from the Yawning Portal",
    adventures: ADVENTURES.filter((a) => a.sourceBook === "TFTYP"),
  },
  {
    id: "ravnica",
    title: "Guildmasters' Guide to Ravnica",
    adventures: [],
    requiresCrossover: true,
  },
];

export function getAdventure(id: string): Adventure | undefined {
  return ADVENTURES.find((a) => a.id === id);
}

export function getNode(adventureId: string, nodeId: string): AdventureNode | undefined {
  const adventure = getAdventure(adventureId);
  return adventure?.nodes.find((n) => n.id === nodeId);
}
