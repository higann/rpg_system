// src/lib/actions/habitActions.ts

import { Habit, Skill, CharacterProfile } from '@/lib/models/types';
import { calculateWillPowerChange } from '@/lib/formulas/willPower';
import { determineSkillTier, getTierPoints } from '@/lib/formulas/intelligence';
import { wasCompletedToday, shouldBreakStreak } from '@/lib/utils/dateUtils';

/**
 * XP earned per habit completion
 * Boolean habits: 10 XP flat
 * Number habits: 10 XP × value
 */
export function calculateHabitXP(habit: Habit, value?: number): number {
  if (habit.type === 'boolean') {
    return 10;
  } else if (habit.type === 'number' && value !== undefined) {
    return 10 * value;
  }
  return 0;
}

/**
 * Complete a habit - the core action
 * Updates: habit stats, Will Power, linked skill XP, tier promotions
 */
export function performHabitCompletion(
  habit: Habit,
  profile: CharacterProfile,
  value?: number
): {
  updatedHabit: Habit;
  updatedProfile: CharacterProfile;
  willPowerChange: number;
  xpGained: number;
  tierPromotion?: { skillName: string; oldTier: string; newTier: string };
} {
  // Prevent double-completion
  if (wasCompletedToday(habit.lastCompletedDate)) {
    throw new Error('Habit already completed today');
  }

  const currentCompletions = habit.totalCompletions || 0;
  const currentStreak = habit.currentStreak || 0;

  // Calculate Will Power change
  const willPowerChange = calculateWillPowerChange(1, currentCompletions);

  // Update habit
  const updatedHabit: Habit = {
    ...habit,
    totalCompletions: currentCompletions + 1,
    lastCompletedDate: new Date(),
    currentStreak: shouldBreakStreak(habit.lastCompletedDate) ? 1 : currentStreak + 1,
  };

  if (value !== undefined && habit.type === 'number') {
    updatedHabit.lastValue = value;
  }

  // Calculate XP for linked skill
  const xpGained = calculateHabitXP(habit, value);
  
  let updatedProfile = { ...profile };
  let tierPromotion: { skillName: string; oldTier: string; newTier: string } | undefined;

  // Update linked skill if exists
  if (habit.linkedSkill) {
    const skillIndex = profile.skills.findIndex(s => s.id === habit.linkedSkill || s.name === habit.linkedSkill);
    
    if (skillIndex !== -1) {
      const skill = profile.skills[skillIndex];
      const oldTier = skill.tier;
      const newXp = skill.xp + xpGained;
      const newTier = determineSkillTier(newXp);
      const newContribution = getTierPoints(newTier);

      const updatedSkill: Skill = {
        ...skill,
        xp: newXp,
        tier: newTier,
        intelligenceContribution: newContribution,
      };

      updatedProfile.skills = [...profile.skills];
      updatedProfile.skills[skillIndex] = updatedSkill;

      // Check if tier changed
      if (oldTier !== newTier) {
        tierPromotion = {
          skillName: skill.name,
          oldTier,
          newTier,
        };
      }
    }
  }

  // Update Will Power
  const currentWP = profile.stats.willPower || 1000;
  updatedProfile.stats = {
    ...profile.stats,
    willPower: currentWP + willPowerChange,
  };

  // Update habit in profile
  const habitIndex = profile.habits.findIndex(h => h.id === habit.id);
  if (habitIndex !== -1) {
    updatedProfile.habits = [...profile.habits];
    updatedProfile.habits[habitIndex] = updatedHabit;
  }

  return {
    updatedHabit,
    updatedProfile,
    willPowerChange,
    xpGained,
    tierPromotion,
  };
}

/**
 * Miss a habit - apply penalty
 * Only affects Will Power (Knowledge/Luck/Intelligence have no penalties)
 */
export function performHabitMiss(
  habit: Habit,
  profile: CharacterProfile
): {
  updatedHabit: Habit;
  updatedProfile: CharacterProfile;
  willPowerChange: number;
} {
  const currentCompletions = habit.totalCompletions || 0;
  
  // Calculate Will Power penalty
  const willPowerChange = calculateWillPowerChange(0, currentCompletions);

  // Reset streak
  const updatedHabit: Habit = {
    ...habit,
    currentStreak: 0,
  };

  // Apply penalty
  const currentWP = profile.stats.willPower || 1000;
  const updatedProfile: CharacterProfile = {
    ...profile,
    stats: {
      ...profile.stats,
      willPower: Math.max(0, currentWP + willPowerChange), // Floor at 0
    },
  };

  // Update habit in profile
  const habitIndex = profile.habits.findIndex(h => h.id === habit.id);
  if (habitIndex !== -1) {
    updatedProfile.habits = [...profile.habits];
    updatedProfile.habits[habitIndex] = updatedHabit;
  }

  return {
    updatedHabit,
    updatedProfile,
    willPowerChange,
  };
}

/**
 * Check all habits for missed days and apply penalties
 * Should be run daily or when user opens the app
 */
export function checkMissedHabits(profile: CharacterProfile): CharacterProfile {
  let updatedProfile = { ...profile };
  let totalPenalty = 0;

  profile.habits.forEach(habit => {
    // If habit should have been done but wasn't (streak broken)
    if (shouldBreakStreak(habit.lastCompletedDate) && habit.currentStreak > 0) {
      const result = performHabitMiss(habit, updatedProfile);
      updatedProfile = result.updatedProfile;
      totalPenalty += result.willPowerChange;
      
      console.log(`⚠️ ${habit.name}: Streak broken. Will Power ${result.willPowerChange.toFixed(2)}`);
    }
  });

  if (totalPenalty < 0) {
    console.log(`📉 Total Will Power penalty: ${totalPenalty.toFixed(2)}`);
  }

  return updatedProfile;
}