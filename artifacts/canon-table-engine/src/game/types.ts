export interface GameRule {
  id: string;
  name: string;
  description: string;
}

export interface CombatAction {
  id: string;
  actorId: string;
  targetId?: string;
  description: string;
  isLegendary: boolean;
}

export interface CanonReference {
  sourceBook: string;
  sourceId: string;
  pageRef: string;
}
