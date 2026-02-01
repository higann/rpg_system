// src/lib/formulas/willPower.ts

import { FORMULA_CONSTANTS } from '../models/types';

/**
 * Calculate habit freshness factor
 * Fresh habits (low completions) = high freshness (challenging)
 * Old habits (high completions) = low freshness (automatic)
 * 
 * Formula: 1 / (1 + completions / 50)
 * 
 * Examples:
 * - 10 completions → 0.83 (fresh)
 * - 50 completions → 0.50 (forming)
 * - 100 completions → 0.33 (established)
 * - 500 completions → 0.09 (automatic)
 */
export function calculateHabitFreshness(completions: number): number {
  return 1 / (1 + completions / FORMULA_CONSTANTS.HABIT_FRESHNESS_DIVISOR);
}

/**
 * Calculate expected performance for ELO calculation
 * Fresh habits are harder to maintain (lower expected)
 * Old habits are easier to maintain (higher expected)
 * 
 * Formula: 1 - (freshness × 0.8)
 */
export function calculateExpected(freshness: number): number {
  return 1 - (freshness * FORMULA_CONSTANTS.FRESHNESS_MULTIPLIER);
}

/**
 * Calculate Will Power change using ELO formula with habit aging
 * 
 * @param actual - 1 if completed, 0 if missed
 * @param completions - Total times this habit has been completed
 * @param K - Sensitivity constant (default: 32)
 * @returns Change in Will Power (can be positive or negative)
 * 
 * How it works:
 * - New habits: Big gains when completed, moderate penalty when missed
 * - Old habits: Small gains when completed, HEAVY penalty when missed
 *   (You're expected to maintain automatic behaviors!)
 */
export function calculateWillPowerChange(
  actual: 0 | 1,
  completions: number,
  K: number = FORMULA_CONSTANTS.WILL_POWER_K
): number {
  const freshness = calculateHabitFreshness(completions);
  const expected = calculateExpected(freshness);
  
  // ELO formula: K × (Actual - Expected)
  const change = K * (actual - expected);
  
  // Round to 2 decimal places for cleaner numbers
  return Math.round(change * 100) / 100;
}

/**
 * Calculate total Will Power from all habits
 * 
 * @param currentWillPower - Current Will Power value
 * @param habitChanges - Array of changes from each habit
 * @returns New Will Power value
 */
export function calculateTotalWillPower(
  currentWillPower: number,
  habitChanges: number[]
): number {
  const totalChange = habitChanges.reduce((sum, change) => sum + change, 0);
  const newWillPower = currentWillPower + totalChange;
  
  // Floor at 0 (can't have negative Will Power)
  return Math.max(0, Math.round(newWillPower * 100) / 100);
}