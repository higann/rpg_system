// src/lib/formulas/luck.ts

import { Habit } from '../models/types';

/**
 * Calculate Luck from luck-tagged habits
 * Luck = Sum of (completions × volume multiplier) for all luck habits
 * 
 * Linear system like Knowledge - no diminishing returns!
 */
export function calculateLuck(habits: Habit[]): number {
  let totalLuck = 0;

  habits.forEach(habit => {
    // Use optional chaining
    const luckConfig = habit.contributesTo?.luck;
    
    if (luckConfig) {
      const { volumeMultiplier } = luckConfig;
      
      if (habit.type === 'number' && habit.lastValue) {
        totalLuck += habit.lastValue * habit.totalCompletions * volumeMultiplier;
      } else if (habit.type === 'boolean') {
        totalLuck += habit.totalCompletions * volumeMultiplier;
      }
    }
  });

  return Math.round(totalLuck * 100) / 100;
}