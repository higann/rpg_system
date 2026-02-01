// src/lib/models/types.ts

/**
 * Habit contribution configuration
 */
export interface HabitContributions {
    willPower: true; // Always contributes to Will Power (universal)
    knowledge?: {
      category: 'reading' | 'coding' | 'language' | 'other';
      volumeMultiplier: number; // Points per unit
    };
    luck?: {
      volumeMultiplier: number;
    };
  }
  
  /**
   * Core Habit model
   */
  export interface Habit {
    id: string;
    name: string;
    type: 'boolean' | 'number';
    unit?: string; // For number types (e.g., "pages", "hours", "minutes")
    
    // Stat contributions
    contributesTo: HabitContributions;
    
    // Will Power ELO tracking
    totalCompletions: number; // For freshness calculation
    
    // For volume stats
    lastValue?: number; // Last entered value for number-type habits
    
    // Linked skill (affects Intelligence indirectly via XP)
    linkedSkill?: string; // Skill ID or name
    
    // Tracking
    lastCompletedDate?: Date;
    currentStreak: number;
    createdDate: Date;
  }
  
  /**
   * Stats object
   */
  export interface Stats {
    willPower: number; // ELO rating
    knowledge: number; // Linear volume total
    luck: number; // Linear volume total
    intelligence: number; // Sum of skill tier points
  }
  
  /**
   * Skill tiers
   */
  export type SkillTier = 'S' | 'A' | 'B' | 'C' | 'D';
  
  /**
   * Skill model
   */
  export interface Skill {
    id: string;
    name: string;
    xp: number;
    tier: SkillTier;
    intelligenceContribution: number; // Cached tier point value
    createdDate: Date;
  }
  
  /**
   * Daily stats snapshot for history tracking
   */
  export interface StatsSnapshot {
    date: Date;
    stats: Stats;
    completionRate: number; // Daily habit completion rate (0-1)
  }
  
  /**
   * Complete character profile
   */
  export interface CharacterProfile {
    // Identity
    name: string;
    displayPicture?: string;
    
    // Overall progression
    level: number; // Character Level ELO
    
    // Stats
    stats: Stats;
    
    // Collections
    skills: Skill[];
    habits: Habit[];
    
    // History tracking
    statsHistory: StatsSnapshot[];
    
    // Metadata
    weight?: number;
    languages?: string[];
    createdDate: Date;
    lastActiveDate: Date;
    
    // Data versioning
    version: number; // For future migrations
  }
  
  /**
   * Tier XP thresholds
   */
  export const TIER_THRESHOLDS = {
    S: 2500,
    A: 1000,
    B: 500,
    C: 250,
    D: 100,
  } as const;
  
  /**
   * Tier Intelligence points
   */
  export const TIER_POINTS = {
    S: 100,
    A: 50,
    B: 25,
    C: 10,
    D: 5,
  } as const;
  
  /**
   * Formula constants (tunable)
   */
  export const FORMULA_CONSTANTS = {
    WILL_POWER_K: 32, // ELO sensitivity for Will Power
    CHARACTER_LEVEL_K: 50, // ELO sensitivity for Character Level
    HABIT_FRESHNESS_DIVISOR: 50, // Completions divisor for freshness calc
    FRESHNESS_MULTIPLIER: 0.8, // Expected calculation multiplier
  } as const;