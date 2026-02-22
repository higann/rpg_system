// src/lib/formulas/characterLevel.ts

// Character Level: Derived from total habit completions across all habits.
// Uses sqrt for classic RPG progression — early levels come fast, later ones require sustained effort.
// Starts at 0. No upper bound.

import { Habit } from '../models/types';

/**
 * Calculate Character Level from cumulative habit completions.
 * Formula: floor(sqrt(totalCompletions / 2))
 *
 *  2 completions  → level 1
 *  8              → level 2
 * 18              → level 3
 * 50              → level 5
 * 200             → level 10
 * 800             → level 20
 * 2000            → level 31
 */
export function calculateCharacterLevel(habits: Habit[]): number {
  const total = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
  return Math.floor(Math.sqrt(total / 2));
}

/**
 * Total completions needed to reach a given level
 */
export function completionsForLevel(level: number): number {
  return level * level * 2;
}

/**
 * Progress toward the next level (0–1)
 */
export function getLevelProgress(habits: Habit[]): {
  totalCompletions: number;
  level: number;
  nextAt: number;
  progress: number;
} {
  const total = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
  const level = Math.floor(Math.sqrt(total / 2));
  const current = completionsForLevel(level);
  const next = completionsForLevel(level + 1);
  const progress = next === current ? 1 : (total - current) / (next - current);
  return { totalCompletions: total, level, nextAt: next, progress: Math.min(1, Math.max(0, progress)) };
}

/**
 * Expected daily completion rate (as percentage) for a given level.
 * Scales from 0% at level 0 up to a 90% ceiling.
 *
 * level  0 →  0% expected
 * level 10 → 30% expected
 * level 20 → 60% expected
 * level 30 → 90% expected (capped)
 */
export function getExpectedCompletionRate(level: number): number {
  return Math.min(90, level * 3);
}

/**
 * Completion rate for a given day (0–1 fraction)
 */
export function calculateCompletionRate(completedCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100) / 100;
}
