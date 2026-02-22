// src/lib/formulas/willPower.ts

// WillPower: Streak-weighted point accumulation
// Starts at 0. Grows with consistency. Breaking streaks hurts proportionally.

export const WP_BASE = 10;            // Base WP per completion
export const WP_STREAK_BONUS = 0.05;  // +5% per streak day
export const WP_STREAK_CAP = 10;      // Streak bonus caps at 10 days (+50% max)
export const WP_MISS_RATE = 2;        // WP lost per streak day on miss

/**
 * WP earned for completing a habit today
 * Formula: 10 × (1 + min(streak, 10) × 0.05)
 *
 * streak  0  → +10 WP
 * streak  5  → +12.5 WP
 * streak 10+ → +15 WP (capped)
 *
 * Long streaks are more rewarding — but also riskier to break.
 */
export function calculateWillPowerGain(currentStreak: number): number {
  const multiplier = 1 + Math.min(currentStreak, WP_STREAK_CAP) * WP_STREAK_BONUS;
  return Math.round(WP_BASE * multiplier * 10) / 10;
}

/**
 * WP lost for breaking a streak (missing a day)
 * Formula: streak × 2
 * No penalty if streak was 0 — can't lose what you never built.
 *
 * streak  0  →  0 WP lost
 * streak  5  → 10 WP lost
 * streak 10  → 20 WP lost
 * streak 20  → 40 WP lost
 */
export function calculateWillPowerPenalty(currentStreak: number): number {
  if (currentStreak <= 0) return 0;
  return currentStreak * WP_MISS_RATE;
}

/**
 * Apply a WP delta to the current value, floored at 0
 */
export function applyWillPowerChange(current: number, delta: number): number {
  return Math.max(0, Math.round((current + delta) * 10) / 10);
}
