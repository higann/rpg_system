// src/hooks/useHabits.ts
'use client';

import { useProfileContext } from '@/contexts/ProfileContext';
import { Habit } from '@/lib/models/types';
import { wasCompletedToday } from '@/lib/utils/dateUtils';
import { performHabitCompletion, performHabitMiss, checkMissedHabits } from '@/lib/actions/habitActions';

export function useHabits() {
  const { profile, addHabit, updateHabit, deleteHabit, updateProfile } = useProfileContext();

  const habits = profile?.habits || [];

  /**
   * Complete a habit with proper XP/streak/stat updates
   */
  const completeHabit = (habitId: string, value?: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !profile) return;

    try {
      const result = performHabitCompletion(habit, profile, value);

      // Update the entire profile with all changes (including recalculated level)
      updateProfile({
        habits: result.updatedProfile.habits,
        skills: result.updatedProfile.skills,
        stats: result.updatedProfile.stats,
        level: result.updatedProfile.level,
      });

      // Log success
      if (result.goalMet) {
        console.log(`✅ ${habit.name} completed!`);
        console.log(`   Will Power: ${result.willPowerChange > 0 ? '+' : ''}${result.willPowerChange.toFixed(2)}`);
        if (result.xpGained > 0) {
          console.log(`   XP gained: +${result.xpGained}`);
        }
        if (result.tierPromotion) {
          console.log(`   🎉 ${result.tierPromotion.skillName} promoted: ${result.tierPromotion.oldTier} → ${result.tierPromotion.newTier}!`);
        }
      } else {
        console.log(`⚠️ ${habit.name} logged, but goal not met (no rewards)`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(error.message);
      }
    }
  };

  /**
   * Manually mark a habit as missed
   */
  const missHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !profile) return;

    const result = performHabitMiss(habit, profile);

    updateProfile({
      habits: result.updatedProfile.habits,
      stats: result.updatedProfile.stats,
    });

    console.log(`⚠️ ${habit.name} missed. Will Power ${result.willPowerChange.toFixed(2)}`);
    return result;
  };

  /**
   * Run daily check for missed habits
   */
  const runDailyCheck = () => {
    if (!profile) return;

    const updatedProfile = checkMissedHabits(profile);

    updateProfile({
      habits: updatedProfile.habits,
      stats: updatedProfile.stats,
    });
  };

  /**
   * Get habits that need to be done today
   */
  const getTodaysHabits = () => {
    return habits.filter(h => !wasCompletedToday(h.lastCompletedDate));
  };

  /**
   * Get habits completed today
   */
  const getCompletedToday = () => {
    return habits.filter(h => wasCompletedToday(h.lastCompletedDate));
  };

  return {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    missHabit,
    runDailyCheck,
    getTodaysHabits,
    getCompletedToday,
  };
}
