// src/components/Skills/SkillsGrid.tsx
'use client';

import { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { getXpToNextTier } from '@/lib/formulas/intelligence';
import { TIER_THRESHOLDS } from '@/lib/models/types';
import { AddSkillForm } from './AddSkillForm';
import { EditSkillForm } from './EditSkillForm';

export function SkillsGrid({ initialShowAdd = false }: { initialShowAdd?: boolean }) {
  const { skills, deleteSkill, addSkillXP } = useSkills();
  const [showAddForm, setShowAddForm] = useState(initialShowAdd);
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
    // Tier ranges derived from TIER_THRESHOLDS in types.ts
    const tierRanges: Record<string, { min: number; max: number }> = {
      D: { min: 0, max: TIER_THRESHOLDS.C },
      C: { min: TIER_THRESHOLDS.C, max: TIER_THRESHOLDS.B },
      B: { min: TIER_THRESHOLDS.B, max: TIER_THRESHOLDS.A },
      A: { min: TIER_THRESHOLDS.A, max: TIER_THRESHOLDS.S },
      S: { min: TIER_THRESHOLDS.S, max: TIER_THRESHOLDS.S * 2 }, // visual cap at 2× S threshold
    };

    const range = tierRanges[tier];
    if (!range) return 100;

    const progress = ((currentXp - range.min) / (range.max - range.min)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <p className="text-sm text-[var(--text-3)] mb-4">No skills yet. Add your first to start earning Intelligence.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          Add Skill
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
        <p className="stat-label">Your Skills</p>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">Add Skill</button>
      </div>

      {Object.entries(groupedSkills).map(([tier, tierSkills]) => {
        if (tierSkills.length === 0) return null;

        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`tier-badge tier-${tier}`}>{tier}</span>
              <span className="text-[11px] text-[var(--text-3)]">{tierSkills.length} skill{tierSkills.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {tierSkills.map(skill => {
                const xpToNext = getXpToNextTier(skill.xp);
                const progress = getXpProgress(skill.xp, skill.tier);

                return (
                  <div
                    key={skill.id}
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{skill.name}</p>
                        <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                          {skill.xp} XP · +{skill.intelligenceContribution} INT
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingSkill(skill)}
                          className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${skill.name}"?`)) deleteSkill(skill.id); }}
                          className="text-[11px] text-[var(--text-3)] hover:text-rose-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1.5">
                        <span>{tier === 'S' ? 'Max tier' : 'To next tier'}</span>
                        <span>{xpToNext === null ? '—' : `${xpToNext} XP`}</span>
                      </div>
                      <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: 'var(--stat-int)' }}
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
                        onChange={e => setXpInputs({ ...xpInputs, [skill.id]: e.target.value ? parseInt(e.target.value) : 0 })}
                        className="flex-1 px-3 py-1.5 rounded-lg text-sm text-[var(--text)] outline-none"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                        placeholder="XP amount"
                      />
                      <button onClick={() => handleAddXP(skill.id)} className="btn-primary px-3 py-1.5">
                        Add XP
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