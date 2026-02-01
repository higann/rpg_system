// src/contexts/ProfileContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CharacterProfile, Stats, Habit, Skill } from '@/lib/models/types';
import { loadProfile, saveProfile, initializeProfile } from '@/lib/storage/localStorage';
import { calculateAllStats } from '@/lib/formulas';

interface ProfileContextType {
  profile: CharacterProfile | null;
  stats: Stats;
  isLoading: boolean;
  
  // Profile actions
  createProfile: (name: string) => void;
  updateProfile: (updates: Partial<CharacterProfile>) => void;
  deleteProfile: () => void;
  
  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdDate'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  
  // Skill actions
  addSkill: (skill: Omit<Skill, 'id' | 'createdDate'>) => void;
  updateSkill: (skillId: string, updates: Partial<Skill>) => void;
  deleteSkill: (skillId: string) => void;
  
  // Utility
  refreshStats: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    willPower: 1000,
    knowledge: 0,
    luck: 0,
    intelligence: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loaded = loadProfile();
    if (loaded) {
      setProfile(loaded);
      setStats(calculateAllStats(loaded));
    }
    setIsLoading(false);
  }, []);

  // Auto-save whenever profile changes
  useEffect(() => {
    if (profile && !isLoading) {
      saveProfile(profile);
      // Recalculate stats
      setStats(calculateAllStats(profile));
    }
  }, [profile, isLoading]);

  // Create new profile
  const createProfile = (name: string) => {
    const newProfile = initializeProfile(name);
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  // Update profile
  const updateProfile = (updates: Partial<CharacterProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  // Delete profile
  const deleteProfile = () => {
    setProfile(null);
    localStorage.removeItem('life-rpg-profile');
  };

  // Add habit
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdDate'>) => {
    if (!profile) return;
    
    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
    };
    
    setProfile({
      ...profile,
      habits: [...profile.habits, newHabit],
    });
  };

  // Update habit
  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      habits: profile.habits.map(h =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    });
  };

  // Delete habit
  const deleteHabit = (habitId: string) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      habits: profile.habits.filter(h => h.id !== habitId),
    });
  };

  // Add skill
  const addSkill = (skillData: Omit<Skill, 'id' | 'createdDate'>) => {
    if (!profile) return;
    
    const newSkill: Skill = {
      ...skillData,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
    };
    
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill],
    });
  };

  // Update skill
  const updateSkill = (skillId: string, updates: Partial<Skill>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      skills: profile.skills.map(s =>
        s.id === skillId ? { ...s, ...updates } : s
      ),
    });
  };

  // Delete skill
  const deleteSkill = (skillId: string) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s.id !== skillId),
    });
  };

  // Manually refresh stats
  const refreshStats = () => {
    if (profile) {
      setStats(calculateAllStats(profile));
    }
  };

  const value: ProfileContextType = {
    profile,
    stats,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    addHabit,
    updateHabit,
    deleteHabit,
    addSkill,
    updateSkill,
    deleteSkill,
    refreshStats,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook to use the context
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}