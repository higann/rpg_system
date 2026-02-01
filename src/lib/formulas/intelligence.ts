// src/lib/formulas/intelligence.ts

import { Skill, SkillTier, TIER_THRESHOLDS, TIER_POINTS } from '../models/types';

/**
 * Determine skill tier based on XP
 * S: 2500+, A: 1000+, B: 500+, C: 250+, D: 100+
 */
export function determineSkillTier(xp: number): SkillTier {
  if (xp >= TIER_THRESHOLDS.S) return 'S';
  if (xp >= TIER_THRESHOLDS.A) return 'A';
  if (xp >= TIER_THRESHOLDS.B) return 'B';
  if (xp >= TIER_THRESHOLDS.C) return 'C';
  return 'D';
}

/**
 * Get Intelligence points for a tier
 * S: 100, A: 50, B: 25, C: 10, D: 5
 */
export function getTierPoints(tier: SkillTier): number {
  return TIER_POINTS[tier];
}

/**
 * Calculate Intelligence contribution for a single skill
 * Returns the tier points (cached value should match)
 */
export function calculateSkillIntelligence(skill: Skill): number {
  const tier = determineSkillTier(skill.xp);
  return getTierPoints(tier);
}

/**
 * Calculate total Intelligence from all skills
 * Intelligence = Sum of tier points across all skills
 */
export function calculateIntelligence(skills: Skill[]): number {
  return skills.reduce((total, skill) => {
    return total + calculateSkillIntelligence(skill);
  }, 0);
}

/**
 * Update a skill's tier and intelligence contribution based on current XP
 * Mutates the skill object!
 */
export function updateSkillTier(skill: Skill): void {
  skill.tier = determineSkillTier(skill.xp);
  skill.intelligenceContribution = getTierPoints(skill.tier);
}

/**
 * Calculate XP needed to reach next tier
 * Returns null if already at S tier (max)
 */
export function getXpToNextTier(currentXp: number): number | null {
  if (currentXp >= TIER_THRESHOLDS.S) return null; // Already S tier
  if (currentXp >= TIER_THRESHOLDS.A) return TIER_THRESHOLDS.S - currentXp;
  if (currentXp >= TIER_THRESHOLDS.B) return TIER_THRESHOLDS.A - currentXp;
  if (currentXp >= TIER_THRESHOLDS.C) return TIER_THRESHOLDS.B - currentXp;
  return TIER_THRESHOLDS.C - currentXp;
}