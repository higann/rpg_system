// src/components/Skills/SkillsGrid.tsx
'use client';

import { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { getXpToNextTier } from '@/lib/formulas/intelligence';
import { AddSkillForm } from './AddSkillForm';
import { EditSkillForm } from './EditSkillForm';

export function SkillsGrid() {
  const { skills, deleteSkill, addSkillXP } = useSkills();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<typeof skills[0] | null>(null);
  const [xpInputs, setXpInputs] = useState<{ [key: string]: number }>({});
  

  const handleAddXP = (skillId: string) => {
    const amount = xpInputs[skillId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid XP amount');
      return;
    }
    addSkillXP(skillId, amount);
    setXpInputs({ ...xpInputs, [skillId]: 0 });
  };

  const getXpProgress = (currentXp: number, tier: string): number => {
    const thresholds: { [key: string]: { min: number; max: number } } = {
      D: { min: 0, max: 250 },
      C: { min: 250, max: 500 },
      B: { min: 500, max: 1000 },
      A: { min: 1000, max: 2500 },
      S: { min: 2500, max: 5000 },
    };

    const range = thresholds[tier];
    if (!range) return 100;

    if (tier === 'S') {
      // S tier has no upper limit, show progress to 5000 as max
      return Math.min((currentXp / 5000) * 100, 100);
    }

    const progress = ((currentXp - range.min) / (range.max - range.min)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-400 mb-2">No skills yet!</p>
          <p className="text-sm text-gray-500">Start building your expertise and boost your Intelligence stat.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Create Your First Skill
        </button>

        {showAddForm && (
          <AddSkillForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        )}
      </div>
    );
  }

  // Group skills by tier
  const groupedSkills: { [key: string]: typeof skills } = {
    S: skills.filter(s => s.tier === 'S'),
    A: skills.filter(s => s.tier === 'A'),
    B: skills.filter(s => s.tier === 'B'),
    C: skills.filter(s => s.tier === 'C'),
    D: skills.filter(s => s.tier === 'D'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Skills</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Add Skill
        </button>
      </div>

      {/* Skills by Tier */}
      {Object.entries(groupedSkills).map(([tier, tierSkills]) => {
        if (tierSkills.length === 0) return null;

        return (
          <div key={tier}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className={`tier-badge tier-${tier}`}>{tier} Tier</span>
              <span className="text-gray-500 text-sm">({tierSkills.length} skills)</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tierSkills.map(skill => {
                const xpToNext = getXpToNextTier(skill.xp);
                const progress = getXpProgress(skill.xp, skill.tier);

                return (
                  <div
                    key={skill.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition"
                  >
                    {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="text-white font-semibold text-lg">{skill.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">
                            {skill.xp} XP • +{skill.intelligenceContribution} Intelligence
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                            onClick={() => setEditingSkill(skill)}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => {
                                if (confirm(`Delete "${skill.name}"?`)) {
                                deleteSkill(skill.id);
                                }
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                            >
                            Delete
                            </button>
                        </div>
                        </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress to {tier === 'S' ? 'Max' : 'Next Tier'}</span>
                        <span>{xpToNext === null ? 'Max Level' : `${xpToNext} XP needed`}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Add XP */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={xpInputs[skill.id] || ''}
                        onChange={(e) => setXpInputs({ 
                          ...xpInputs, 
                          [skill.id]: e.target.value ? parseInt(e.target.value) : 0 
                        })}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="XP amount"
                      />
                      <button
                        onClick={() => handleAddXP(skill.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-sm font-medium"
                      >
                        + Add XP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

        {showAddForm && (
        <AddSkillForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
        />
        )}

        {editingSkill && (
        <EditSkillForm
            skill={editingSkill}
            onClose={() => setEditingSkill(null)}
            onSuccess={() => setEditingSkill(null)}
        />
        )}
    </div>
  );
}