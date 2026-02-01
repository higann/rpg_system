// src/components/Skills/EditSkillForm.tsx
'use client';

import { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { determineSkillTier, getTierPoints } from '@/lib/formulas/intelligence';
import { Skill } from '@/lib/models/types';

interface EditSkillFormProps {
  skill: Skill;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSkillForm({ skill, onClose, onSuccess }: EditSkillFormProps) {
  const { updateSkill } = useSkills();
  const [formData, setFormData] = useState({
    name: skill.name,
    xp: skill.xp,
  });

  const previewTier = determineSkillTier(formData.xp);
  const previewPoints = getTierPoints(previewTier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tier = determineSkillTier(formData.xp);
    const intelligenceContribution = getTierPoints(tier);

    updateSkill(skill.id, {
      name: formData.name,
      xp: formData.xp,
      tier,
      intelligenceContribution,
    });

    onSuccess();
    onClose();
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1f3a] border border-purple-500/30 rounded-lg w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10000
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-400">Edit Skill</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none w-8 h-8 flex items-center justify-center"
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Chess, Programming, Guitar"
              />
            </div>

            {/* XP */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total XP
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.xp || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  xp: e.target.value ? parseInt(e.target.value) : 0 
                })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjust total XP to recalculate tier
              </p>
            </div>

            {/* Tier Preview */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300 text-sm">Current Tier</span>
                <span className={`tier-badge tier-${skill.tier} text-lg`}>
                  {skill.tier}
                </span>
              </div>
              {previewTier !== skill.tier && (
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-purple-500/30">
                  <span className="text-gray-300 text-sm">New Tier</span>
                  <span className={`tier-badge tier-${previewTier} text-lg`}>
                    {previewTier}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Intelligence Contribution</span>
                <span className="text-purple-400 font-bold">
                  {previewPoints !== skill.intelligenceContribution && (
                    <span className="text-gray-500 line-through mr-2">+{skill.intelligenceContribution}</span>
                  )}
                  +{previewPoints}
                </span>
              </div>
            </div>

            {/* Tier Thresholds Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-400 mb-2">Tier Thresholds:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>D Tier: 0-249 XP (+5 INT)</div>
                <div>C Tier: 250-499 XP (+10 INT)</div>
                <div>B Tier: 500-999 XP (+25 INT)</div>
                <div>A Tier: 1000-2499 XP (+50 INT)</div>
                <div className="col-span-2">S Tier: 2500+ XP (+100 INT)</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}