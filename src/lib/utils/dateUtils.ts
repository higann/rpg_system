// src/lib/utils/dateUtils.ts

import { differenceInDays, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

/**
 * Check if a habit was completed today
 */
export function wasCompletedToday(lastCompletedDate?: Date): boolean {
  if (!lastCompletedDate) return false;
  return isToday(lastCompletedDate);
}

/**
 * Check if a habit was completed yesterday
 */
export function wasCompletedYesterday(lastCompletedDate?: Date): boolean {
  if (!lastCompletedDate) return false;
  return isYesterday(lastCompletedDate);
}

/**
 * Calculate days since last completion
 */
export function daysSinceCompletion(lastCompletedDate?: Date): number {
  if (!lastCompletedDate) return Infinity;
  return differenceInDays(new Date(), lastCompletedDate);
}

/**
 * Check if streak should be broken (missed a day)
 */
export function shouldBreakStreak(lastCompletedDate?: Date): boolean {
  if (!lastCompletedDate) return false;
  const days = daysSinceCompletion(lastCompletedDate);
  return days > 1; // Missed more than 1 day
}

/**
 * Human-readable "time ago" format
 */
export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date at midnight (for comparisons)
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}