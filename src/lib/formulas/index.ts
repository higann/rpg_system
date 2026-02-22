// src/lib/formulas/index.ts

import { CharacterProfile, Stats } from '../models/types';
import { calculateKnowledge } from './knowledge';
import { calculateLuck } from './luck';
import { calculateIntelligence } from './intelligence';
import { calculateCharacterLevel } from './characterLevel';

/**
 * Master calculation engine — recalculates all derived stats from current profile state.
 * Will Power is stored directly on the profile (updated per-action in habitActions.ts).
 * Level is recalculated here from total habit completions.
 */
export function calculateAllStats(profile: CharacterProfile): Stats {
  return {
    willPower: Math.max(1, profile.stats.willPower),
    knowledge: Math.max(1, calculateKnowledge(profile.habits)),
    luck: Math.max(1, calculateLuck(profile.habits)),
    intelligence: Math.max(1, calculateIntelligence(profile.skills)),
  };
}

/**
 * Recalculate and return the character level derived from habits.
 * Call this whenever habits are mutated.
 */
export function recalculateLevel(profile: CharacterProfile): number {
  return calculateCharacterLevel(profile.habits);
}

// Re-export individual formula functions
export * from './willPower';
export * from './knowledge';
export * from './luck';
export * from './intelligence';
export * from './characterLevel';
