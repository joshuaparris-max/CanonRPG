import { rollDie } from "./dice";

export interface Combatant {
  name: string;
  hp: number;
  armorClass: number;
  initiative: number;
  hitBonus: number;
  damageDie: number;
}

export interface CombatResult {
  attacker: string;
  defender: string;
  attackRoll: number;
  damage: number;
  hit: boolean;
}

export function rollInitiative(combatant: Combatant): number {
  return rollDie(20) + combatant.initiative;
}

export function resolveAttack(attacker: Combatant, defender: Combatant): CombatResult {
  const attackRoll = rollDie(20) + attacker.hitBonus;
  const hit = attackRoll >= defender.armorClass;
  const damage = hit ? rollDie(attacker.damageDie) : 0;
  return { attacker: attacker.name, defender: defender.name, attackRoll, damage, hit };
}

export function applyDamage(defender: Combatant, damage: number): Combatant {
  return { ...defender, hp: Math.max(defender.hp - damage, 0) };
}
