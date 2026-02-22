// src/lib/storage/localStorage.ts

import { CharacterProfile, Stats, Skill, Habit } from '../models/types';

const STORAGE_KEY = 'life-rpg-profile';
const AVATAR_KEY = 'life-rpg-avatar';
const STORAGE_VERSION = 1;

// ── Avatar (device-local, never synced to database) ──────────────────────────

export function saveAvatar(base64: string): void {
  localStorage.setItem(AVATAR_KEY, base64);
}

export function loadAvatar(): string | null {
  return localStorage.getItem(AVATAR_KEY);
}

export function deleteAvatar(): void {
  localStorage.removeItem(AVATAR_KEY);
}

/**
 * Initialize a new character profile with default values
 */
export function initializeProfile(name: string): CharacterProfile {
  return {
    name,
    level: 0,
    stats: {
      willPower: 1,
      knowledge: 1,
      luck: 1,
      intelligence: 1,
    },
    skills: [],
    habits: [],
    statsHistory: [],
    createdDate: new Date(),
    lastActiveDate: new Date(),
    version: STORAGE_VERSION,
  };
}

/**
 * Save profile to localStorage
 * Handles JSON serialization including Date objects
 */
export function saveProfile(profile: CharacterProfile): void {
  try {
    const serialized = JSON.stringify(profile, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('✅ Profile saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save profile:', error);
    throw new Error('Failed to save profile to localStorage');
  }
}

/**
 * Load profile from localStorage
 * Returns null if no profile exists
 */
export function loadProfile(): CharacterProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      console.log('ℹ️ No profile found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(stored, (key, value) => {
      // Convert ISO strings back to Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
    
    // Validate version (for future migrations)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('⚠️ Profile version mismatch. Migration may be needed.');
      // In future, call migration function here
    }
    
    console.log('✅ Profile loaded from localStorage');
    return parsed as CharacterProfile;
  } catch (error) {
    console.error('❌ Failed to load profile:', error);
    return null;
  }
}

/**
 * Delete profile from localStorage
 * Use with caution!
 */
export function deleteProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Profile deleted from localStorage');
  } catch (error) {
    console.error('❌ Failed to delete profile:', error);
  }
}

/**
 * Check if a profile exists in localStorage
 */
export function hasProfile(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Export profile as JSON file (for backup/transfer)
 */
export function exportProfile(profile: CharacterProfile): void {
  const json = JSON.stringify(profile, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `life-rpg-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  console.log('✅ Profile exported');
}

/**
 * Import profile from JSON file
 */
export function importProfile(jsonString: string): CharacterProfile {
  try {
    const profile = JSON.parse(jsonString, (key, value) => {
      // Handle Date deserialization
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    // Validate required fields
    if (!profile.name || !profile.stats || !profile.habits || !profile.skills) {
      throw new Error('Invalid profile format');
    }
    
    console.log('✅ Profile imported');
    return profile as CharacterProfile;
  } catch (error) {
    console.error('❌ Failed to import profile:', error);
    throw new Error('Invalid profile JSON');
  }
}

/**
 * Update last active date
 * Call this whenever the user interacts with the app
 */
export function updateLastActive(profile: CharacterProfile): void {
  profile.lastActiveDate = new Date();
  saveProfile(profile);
}