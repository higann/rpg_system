// src/lib/formulas/characterLevel.ts

import { FORMULA_CONSTANTS } from '../models/types';

/**
 * Calculate Character Level change using ELO formula
 * Based on daily habit completion rate vs expected performance
 * 
 * How it works:
 * - Early levels (100-300): Expected to complete ~10-30% of habits → easy to level up
 * - Mid levels (500): Expected to complete ~50% → moderate difficulty
 * - High levels (800-900): Expected to complete ~80-90% → requires consistency
 * 
 * @param completionRate - Daily completion rate (0.0 to 1.0)
 *                         Example: 7 out of 10 habits = 0.7
 * @param currentLevel - Current character level
 * @param K - Sensitivity constant (default: 50)
 * @returns Change in Character Level (can be positive or negative)
 */
export function calculateCharacterLevelChange(
  completionRate: number,
  currentLevel: number,
  K: number = FORMULA_CONSTANTS.CHARACTER_LEVEL_K
): number {
  // Expected performance = current level as a percentage
  // Level 500 → expected 50% completion rate
  // Level 800 → expected 80% completion rate
  const expected = currentLevel / 1000;
  
  // ELO formula: K × (Actual - Expected)
  const change = K * (completionRate - expected);
  
  // Round to 2 decimal places
  return Math.round(change * 100) / 100;
}

/**
 * Calculate new Character Level after applying change
 * 
 * @param currentLevel - Current level
 * @param change - Change from calculateCharacterLevelChange
 * @returns New level (floored at 0)
 */
export function applyCharacterLevelChange(
  currentLevel: number,
  change: number
): number {
  const newLevel = currentLevel + change;
  
  // Floor at 0 (can't have negative level)
  return Math.max(0, Math.round(newLevel * 100) / 100);
}

/**
 * Calculate daily completion rate
 * 
 * @param completedCount - Number of habits completed today
 * @param totalCount - Total number of active habits
 * @returns Completion rate (0.0 to 1.0)
 */
export function calculateCompletionRate(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100) / 100;
}

/**
 * Get expected completion rate for a given level
 * Useful for showing users what they need to maintain
 */
export function getExpectedCompletionRate(level: number): number {
  return Math.round((level / 1000) * 100) / 100;
}