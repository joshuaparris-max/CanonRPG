export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  abilityScores: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  maxHp: number;
  currentHp: number;
  tempHp: number;
  ac: number;
  passivePerception: number;
  skillProficiencies: string[];
  savingThrowProficiencies: string[];
  spellSlots?: {
    level1: { total: number; used: number };
    level2: { total: number; used: number };
    level3: { total: number; used: number };
    level4: { total: number; used: number };
    level5: { total: number; used: number };
    level6: { total: number; used: number };
    level7: { total: number; used: number };
    level8: { total: number; used: number };
    level9: { total: number; used: number };
  };
  equipment: string;
  conditions: string[];
}

export interface SessionState {
  campaignMode: string;
  adventureId: string;
  currentNodeId: string;
  sessionLog: string[];
  dmNotes: string;
  lastSaved: number;
  schemaVersion: string;
}

export interface NodeOverride {
  id: string;
  pageRef: string;
  chapter: string;
  keyedArea: string;
  sceneTitle: string;
  dmPrivateNote: string;
  playerSafeSummary: string;
  readAloud: string;
  linkedNPCs: string[];
  linkedMonsters: string[];
  linkedItems: string[];
  linkedTraps: string[];
  skillChecks: { attribute: string; dc: number; description: string }[];
  savingThrows: { attribute: string; dc: number; description: string }[];
  encounterDifficulty: string;
  nextNodes: string[];
  completed: boolean;
  readyToRun: boolean;
}

export interface SourcebookEntry {
  id: string;
  name: string;
  sourceBook: string;
  sourceId: string;
  pageRef: string;
  localOnly: boolean;
  enteredByUser: boolean;
}

export interface Monster extends SourcebookEntry {
  ac: number;
  maxHP: number;
  initiativeMod: number;
  speedNote: string;
  attackBonus: number;
  damageFormula: string;
  savingThrowBonuses: string;
  conditionNotes: string;
  traitsActionsNotes: string;
  cr: string;
  xp: number;
}

export interface NPC extends SourcebookEntry {
  role: string;
  attitude: string;
  privateNotes: string;
  linkedNodeIds: string;
}

export interface Item extends SourcebookEntry {
  rarity: string;
  itemType: string;
  assignedCharacterId: string;
  privateNotes: string;
}

export interface Spell extends SourcebookEntry {
  level: number;
  school: string;
  privateNotes: string;
}

export interface Trap extends SourcebookEntry {
  triggerNote: string;
  dc: number;
  saveCheckType: string;
  damageFormula: string;
  privateNotes: string;
}

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  initiative: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  ac: number;
  conditions: string[];
  isConcentrating: boolean;
  initiativeMod: number;
  attackBonus?: number;
  damageFormula?: string;
  deathSaves?: {
    successes: number;
    failures: number;
  };
}

export interface CombatState {
  isActive: boolean;
  combatants: Combatant[];
  round: number;
  activeTurnIndex: number;
  log: string[];
}
