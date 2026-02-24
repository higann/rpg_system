// src/lib/actions/habitActions.ts

import { Habit, Skill, CharacterProfile } from '@/lib/models/types';
import { calculateWillPowerGain, calculateWillPowerPenalty } from '@/lib/formulas/willPower';
import { calculateCharacterLevel } from '@/lib/formulas/characterLevel';
import { determineSkillTier, getTierPoints } from '@/lib/formulas/intelligence';
import { wasCompletedToday, shouldBreakStreak } from '@/lib/utils/dateUtils';

/**
 * Check if a habit value meets the daily goal
 */
export function meetsGoal(habit: Habit, value?: number): boolean {
  if (habit.type === 'boolean') {
    return value === 1;
  } else if (habit.type === 'number' && habit.dailyGoal !== undefined) {
    return value !== undefined && value >= habit.dailyGoal;
  }
  return true;
}

/**
 * XP earned per habit completion for linked skill
 * Boolean: 10 XP flat
 * Number: 10 XP × value
 */
export function calculateHabitXP(habit: Habit, value?: number): number {
  if (habit.type === 'boolean') return 10;
  if (habit.type === 'number' && value !== undefined) return 10 * value;
  return 0;
}

/**
 * Complete a habit — the core action.
 * Updates: WillPower (streak-based), habit stats, linked skill XP, character level.
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
  goalMet: boolean;
} {
  if (wasCompletedToday(habit.lastCompletedDate)) {
    // For number habits: allow re-entry within the same day.
    // Adjust totalVolume by the delta so Knowledge/Luck update correctly.
    if (habit.type === 'number' && value !== undefined) {
      const oldValue = habit.lastValue ?? 0;
      const delta = value - oldValue;
      const oldVolume = habit.totalVolume ?? oldValue * habit.totalCompletions;

      const updatedHabit: Habit = {
        ...habit,
        lastValue: value,
        totalVolume: Math.max(0, oldVolume + delta),
      };

      let updatedProfile = { ...profile };
      const hi = profile.habits.findIndex(h => h.id === habit.id);
      if (hi !== -1) {
        updatedProfile.habits = [...profile.habits];
        updatedProfile.habits[hi] = updatedHabit;
      }

      return { updatedHabit, updatedProfile, willPowerChange: 0, xpGained: 0, goalMet: meetsGoal(habit, value) };
    }
    throw new Error('Habit already completed today');
  }

  const goalMet = meetsGoal(habit, value);
  const currentCompletions = habit.totalCompletions || 0;
  const currentStreak = habit.currentStreak || 0;

  // WP gain is based on current streak (longer streaks = bigger reward)
  const willPowerChange = goalMet ? calculateWillPowerGain(currentStreak) : 0;

  // Update habit
  const updatedHabit: Habit = {
    ...habit,
    totalCompletions: goalMet ? currentCompletions + 1 : currentCompletions,
    lastCompletedDate: new Date(),
    currentStreak: goalMet
      ? (shouldBreakStreak(habit.lastCompletedDate) ? 1 : currentStreak + 1)
      : currentStreak,
  };

  if (value !== undefined && habit.type === 'number') {
    updatedHabit.lastValue = value;
    updatedHabit.totalVolume = (habit.totalVolume ?? 0) + value;
  }

  const xpGained = goalMet ? calculateHabitXP(habit, value) : 0;

  let updatedProfile = { ...profile };
  let tierPromotion: { skillName: string; oldTier: string; newTier: string } | undefined;

  // Update linked skill XP
  if (goalMet && habit.linkedSkill) {
    const skillIndex = profile.skills.findIndex(
      s => s.id === habit.linkedSkill || s.name === habit.linkedSkill
    );

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

      if (oldTier !== newTier) {
        tierPromotion = { skillName: skill.name, oldTier, newTier };
      }
    }
  }

  // Update WillPower
  if (goalMet) {
    const currentWP = profile.stats.willPower ?? 0;
    updatedProfile.stats = {
      ...profile.stats,
      willPower: Math.round((currentWP + willPowerChange) * 10) / 10,
    };
  }

  // Update habit in profile
  const habitIndex = profile.habits.findIndex(h => h.id === habit.id);
  if (habitIndex !== -1) {
    updatedProfile.habits = [...profile.habits];
    updatedProfile.habits[habitIndex] = updatedHabit;
  }

  // Recalculate level from updated habit completions
  updatedProfile.level = calculateCharacterLevel(updatedProfile.habits);

  return { updatedHabit, updatedProfile, willPowerChange, xpGained, tierPromotion, goalMet };
}

/**
 * Miss a habit — apply WillPower penalty proportional to broken streak.
 * No penalty if streak was 0 (habit was never maintained).
 */
export function performHabitMiss(
  habit: Habit,
  profile: CharacterProfile
): {
  updatedHabit: Habit;
  updatedProfile: CharacterProfile;
  willPowerChange: number;
} {
  const currentStreak = habit.currentStreak || 0;
  const penalty = calculateWillPowerPenalty(currentStreak);
  const willPowerChange = -penalty;

  const updatedHabit: Habit = {
    ...habit,
    currentStreak: 0,
  };

  const currentWP = profile.stats.willPower ?? 0;
  const updatedProfile: CharacterProfile = {
    ...profile,
    stats: {
      ...profile.stats,
      willPower: Math.max(0, Math.round((currentWP + willPowerChange) * 10) / 10),
    },
  };

  const habitIndex = profile.habits.findIndex(h => h.id === habit.id);
  if (habitIndex !== -1) {
    updatedProfile.habits = [...profile.habits];
    updatedProfile.habits[habitIndex] = updatedHabit;
  }

  return { updatedHabit, updatedProfile, willPowerChange };
}

/**
 * Check all habits for missed days and apply penalties.
 * Should be run when the user opens the app each day.
 */
export function checkMissedHabits(profile: CharacterProfile): CharacterProfile {
  let updatedProfile = { ...profile };

  profile.habits.forEach(habit => {
    if (shouldBreakStreak(habit.lastCompletedDate) && habit.currentStreak > 0) {
      const result = performHabitMiss(habit, updatedProfile);
      updatedProfile = result.updatedProfile;
      console.log(`⚠️ ${habit.name}: Streak broken. WP ${result.willPowerChange}`);
    }
  });

  return updatedProfile;
}
