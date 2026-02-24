// src/lib/formulas/knowledge.ts

import { Habit } from '../models/types';

/**
 * Calculate Knowledge from habits that contribute to it
 * Knowledge = Sum of (completions × volume multiplier) for all knowledge habits
 * 
 * This is a pure volume system - no diminishing returns!
 * Every page read, every lesson completed adds value forever.
 */
export function calculateKnowledge(habits: Habit[]): number {
  let totalKnowledge = 0;

  habits.forEach(habit => {
    // Use optional chaining to safely access nested properties
    const knowledgeConfig = habit.contributesTo?.knowledge;
    
    if (knowledgeConfig) {
      const { volumeMultiplier } = knowledgeConfig;
      
      if (habit.type === 'number') {
        // Use totalVolume (true cumulative sum). Fall back to lastValue × completions
        // for habits that pre-date this field.
        const vol = habit.totalVolume ?? (habit.lastValue ?? 0) * habit.totalCompletions;
        totalKnowledge += vol * volumeMultiplier;
      } else if (habit.type === 'boolean') {
        totalKnowledge += habit.totalCompletions * volumeMultiplier;
      }
    }
  });

  return Math.round(totalKnowledge * 100) / 100;
}

/**
 * Calculate Knowledge by category (for detailed breakdown)
 * Returns an object like: { reading: 3470, coding: 890, language: 200 }
 */
export function calculateKnowledgeByCategory(habits: Habit[]): Record<string, number> {
  const categories: Record<string, number> = {
    reading: 0,
    coding: 0,
    language: 0,
    other: 0,
  };

  habits.forEach(habit => {
    const knowledgeConfig = habit.contributesTo?.knowledge;
    
    if (knowledgeConfig) {
      const { category, volumeMultiplier } = knowledgeConfig;
      
      let value = 0;
      if (habit.type === 'number') {
        const vol = habit.totalVolume ?? (habit.lastValue ?? 0) * habit.totalCompletions;
        value = vol * volumeMultiplier;
      } else if (habit.type === 'boolean') {
        value = habit.totalCompletions * volumeMultiplier;
      }
      
      categories[category] += value;
    }
  });

  // Round all values
  Object.keys(categories).forEach(key => {
    categories[key] = Math.round(categories[key] * 100) / 100;
  });

  return categories;
}