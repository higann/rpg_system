// src/lib/formulas/index.ts

import { CharacterProfile, Stats, Habit } from '../models/types';
import { calculateWillPowerChange } from './willPower';
import { calculateKnowledge } from './knowledge';
import { calculateLuck } from './luck';
import { calculateIntelligence } from './intelligence';
import { calculateCharacterLevelChange, calculateCompletionRate } from './characterLevel';

/**
 * Master calculation engine - recalculates ALL stats from current profile state
 * 
 * This is the core function that should be called whenever:
 * - A habit is completed
 * - A habit is missed
 * - Skills are updated
 * - You want to refresh the dashboard
 */
export function calculateAllStats(profile: CharacterProfile): Stats {
  const { habits, skills } = profile;
  
  // 1. Calculate Knowledge (linear volume)
  const knowledge = calculateKnowledge(habits);
  
  // 2. Calculate Luck (linear volume)
  const luck = calculateLuck(habits);
  
  // 3. Calculate Intelligence (skill tier points)
  const intelligence = calculateIntelligence(skills);
  
  // 4. Calculate Will Power (ELO with aging)
  // Note: Will Power calculation happens per-habit during completion
  // This just returns the current value from profile
  // (Will Power updates happen in habitActions.ts)
  const willPower = profile.stats.willPower;
  
  return {
    willPower,
    knowledge,
    luck,
    intelligence,
  };
}

/**
 * Calculate Will Power contribution from a single habit completion/miss
 * Used when tracking habits in real-time
 * 
 * @param habit - The habit being completed or missed
 * @param completed - true if completed, false if missed
 * @returns Will Power change value
 */
export function calculateHabitWillPowerChange(
  habit: Habit,
  completed: boolean
): number {
  return calculateWillPowerChange(
    completed ? 1 : 0,
    habit.totalCompletions
  );
}

/**
 * Calculate new Character Level based on today's habit completion
 * Should be called at end of day or when viewing daily summary
 * 
 * @param completedHabits - Number of habits completed today
 * @param totalHabits - Total number of active habits
 * @param currentLevel - Current character level
 * @returns New character level
 */
export function calculateNewCharacterLevel(
  completedHabits: number,
  totalHabits: number,
  currentLevel: number
): number {
  const completionRate = calculateCompletionRate(completedHabits, totalHabits);
  const change = calculateCharacterLevelChange(completionRate, currentLevel);
  
  return Math.max(0, currentLevel + change);
}

/**
 * Get a breakdown of stat contributions for transparency
 * Useful for showing users WHERE their stats come from
 */
export interface StatBreakdown {
  stat: 'willPower' | 'knowledge' | 'luck' | 'intelligence';
  total: number;
  contributions: Array<{
    source: string; // Habit name or skill name
    value: number;
    type: 'habit' | 'skill';
  }>;
}

/**
 * Generate stat breakdowns for all stats
 * Shows exactly which habits/skills contribute to each stat
 */
export function generateStatBreakdowns(profile: CharacterProfile): StatBreakdown[] {
  const breakdowns: StatBreakdown[] = [];
  
  // Knowledge breakdown
  const knowledgeContributions = profile.habits
    .filter(h => h.contributesTo.knowledge)
    .map(h => ({
      source: h.name,
      value: h.totalCompletions * (h.contributesTo.knowledge?.volumeMultiplier || 1),
      type: 'habit' as const,
    }));
  
  breakdowns.push({
    stat: 'knowledge',
    total: calculateKnowledge(profile.habits),
    contributions: knowledgeContributions,
  });
  
  // Luck breakdown
  const luckContributions = profile.habits
    .filter(h => h.contributesTo.luck)
    .map(h => ({
      source: h.name,
      value: h.totalCompletions * (h.contributesTo.luck?.volumeMultiplier || 1),
      type: 'habit' as const,
    }));
  
  breakdowns.push({
    stat: 'luck',
    total: calculateLuck(profile.habits),
    contributions: luckContributions,
  });
  
  // Intelligence breakdown
  const intelligenceContributions = profile.skills.map(s => ({
    source: s.name,
    value: s.intelligenceContribution,
    type: 'skill' as const,
  }));
  
  breakdowns.push({
    stat: 'intelligence',
    total: calculateIntelligence(profile.skills),
    contributions: intelligenceContributions,
  });
  
  return breakdowns;
}

// Re-export individual formula functions for direct use
export * from './willPower';
export * from './knowledge';
export * from './luck';
export * from './intelligence';
export * from './characterLevel';