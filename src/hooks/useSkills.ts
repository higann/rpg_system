// src/hooks/useSkills.ts
'use client';

import { useProfileContext } from '@/contexts/ProfileContext';
import { Skill, SkillTier } from '@/lib/models/types';
import { determineSkillTier, getTierPoints, getXpToNextTier } from '@/lib/formulas/intelligence';

/**
 * Hook for skill CRUD operations and tier management
 */
export function useSkills() {
  const { profile, addSkill, updateSkill, deleteSkill } = useProfileContext();
  
  const skills = profile?.skills || [];

  /**
   * Add XP to a skill and update tier if threshold crossed
   */
  const addSkillXP = (skillId: string, xp: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    const newXp = skill.xp + xp;
    const newTier = determineSkillTier(newXp);
    const newContribution = getTierPoints(newTier);

    // Check if tier changed
    const tierChanged = newTier !== skill.tier;

    updateSkill(skillId, {
      xp: newXp,
      tier: newTier,
      intelligenceContribution: newContribution,
    });

    if (tierChanged) {
      console.log(`🎉 ${skill.name} promoted to ${newTier} tier!`);
    }
  };

  /**
   * Get skill by ID
   */
  const getSkill = (skillId: string): Skill | undefined => {
    return skills.find(s => s.id === skillId);
  };

  /**
   * Get skills by tier
   */
  const getSkillsByTier = (tier: SkillTier): Skill[] => {
    return skills.filter(s => s.tier === tier);
  };

  /**
   * Get XP needed for skill to reach next tier
   */
  const getXpNeeded = (skillId: string): number | null => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return null;
    return getXpToNextTier(skill.xp);
  };

  return {
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    addSkillXP,
    getSkill,
    getSkillsByTier,
    getXpNeeded,
  };
}