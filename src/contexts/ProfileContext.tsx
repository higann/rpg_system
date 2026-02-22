// src/contexts/ProfileContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { CharacterProfile, Stats, Habit, Skill } from '@/lib/models/types';
import { loadProfile, saveProfile, initializeProfile, loadAvatar, saveAvatar, deleteAvatar } from '@/lib/storage/localStorage';
import { fetchProfileFromDB, saveProfileToDB, deleteProfileFromDB } from '@/lib/storage/supabaseStorage';
import { calculateAllStats } from '@/lib/formulas';
import { supabase } from '@/lib/supabase/client';

interface ProfileContextType {
  profile: CharacterProfile | null;
  stats: Stats;
  isLoading: boolean;

  // Auth
  user: User | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Avatar — stored locally only, never synced to database
  avatar: string | null;
  setAvatar: (base64: string | null) => void;

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ willPower: 1, knowledge: 1, luck: 1, intelligence: 1 });
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent writing back to DB when we've just loaded from it
  const skipNextDBSync = useRef(false);

  // ── Auth listener ────────────────────────────────────────────────────────────
  useEffect(() => {
    setAvatarState(loadAvatar());

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (currentUser) {
          setIsLoading(true);
          // Try loading from Supabase first, fall back to localStorage cache
          const dbProfile = await fetchProfileFromDB(currentUser.id);
          if (dbProfile) {
            skipNextDBSync.current = true;
            setProfile(dbProfile);
            saveProfile(dbProfile); // update local cache
            setStats(calculateAllStats(dbProfile));
          } else {
            // No DB profile yet — check localStorage cache (e.g. offline or first login)
            const localProfile = loadProfile();
            if (localProfile) {
              setProfile(localProfile);
              setStats(calculateAllStats(localProfile));
            }
          }
          setIsLoading(false);
        }
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setStats({ willPower: 1, knowledge: 1, luck: 1, intelligence: 1 });
        setIsLoading(false);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile || isLoading) return;

    saveProfile(profile); // always keep local cache fresh
    setStats(calculateAllStats(profile));

    if (skipNextDBSync.current) {
      skipNextDBSync.current = false;
      return;
    }

    if (user) {
      saveProfileToDB(user.id, profile).catch(console.error);
    }
  }, [profile, isLoading]);

  // ── Avatar ───────────────────────────────────────────────────────────────────
  const setAvatar = (base64: string | null) => {
    base64 ? saveAvatar(base64) : deleteAvatar();
    setAvatarState(base64);
  };

  // ── Auth actions ─────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ── Profile actions ──────────────────────────────────────────────────────────
  const createProfile = (name: string) => {
    const newProfile = initializeProfile(name);
    setProfile(newProfile);
    saveProfile(newProfile);
    if (user) saveProfileToDB(user.id, newProfile).catch(console.error);
  };

  const updateProfile = (updates: Partial<CharacterProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  const deleteProfile = async () => {
    setProfile(null);
    localStorage.removeItem('life-rpg-profile');
    if (user) await deleteProfileFromDB(user.id).catch(console.error);
  };

  // ── Habit actions ────────────────────────────────────────────────────────────
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdDate'>) => {
    if (!profile) return;
    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
    };
    setProfile({ ...profile, habits: [...profile.habits, newHabit] });
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    if (!profile) return;
    setProfile({ ...profile, habits: profile.habits.map(h => h.id === habitId ? { ...h, ...updates } : h) });
  };

  const deleteHabit = (habitId: string) => {
    if (!profile) return;
    setProfile({ ...profile, habits: profile.habits.filter(h => h.id !== habitId) });
  };

  // ── Skill actions ────────────────────────────────────────────────────────────
  const addSkill = (skillData: Omit<Skill, 'id' | 'createdDate'>) => {
    if (!profile) return;
    const newSkill: Skill = {
      ...skillData,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
    };
    setProfile({ ...profile, skills: [...profile.skills, newSkill] });
  };

  const updateSkill = (skillId: string, updates: Partial<Skill>) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.map(s => s.id === skillId ? { ...s, ...updates } : s) });
  };

  const deleteSkill = (skillId: string) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter(s => s.id !== skillId) });
  };

  const refreshStats = () => {
    if (profile) setStats(calculateAllStats(profile));
  };

  const value: ProfileContextType = {
    profile, stats, isLoading,
    user, authLoading, signIn, signUp, signOut,
    avatar, setAvatar,
    createProfile, updateProfile, deleteProfile,
    addHabit, updateHabit, deleteHabit,
    addSkill, updateSkill, deleteSkill,
    refreshStats,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) throw new Error('useProfileContext must be used within a ProfileProvider');
  return context;
}
