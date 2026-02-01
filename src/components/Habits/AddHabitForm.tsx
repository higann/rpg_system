// src/components/Habits/AddHabitForm.tsx
'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useSkills } from '@/hooks/useSkills';

interface AddHabitFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddHabitForm({ onClose, onSuccess }: AddHabitFormProps) {
  const { addHabit } = useHabits();
  const { skills } = useSkills();

  const [formData, setFormData] = useState({
    name: '',
    type: 'boolean' as 'boolean' | 'number',
    unit: '',
    contributesWillPower: true,
    contributesKnowledge: false,
    knowledgeCategory: 'other' as 'reading' | 'coding' | 'language' | 'other',
    knowledgeMultiplier: 1,
    contributesLuck: false,
    luckMultiplier: 10,
    linkedSkill: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contributesTo: any = {};
    
    if (formData.contributesWillPower) {
      contributesTo.willPower = true;
    }
    
    if (formData.contributesKnowledge) {
      contributesTo.knowledge = {
        category: formData.knowledgeCategory,
        volumeMultiplier: formData.knowledgeMultiplier,
      };
    }
    
    if (formData.contributesLuck) {
      contributesTo.luck = {
        volumeMultiplier: formData.luckMultiplier,
      };
    }

    addHabit({
      name: formData.name,
      type: formData.type,
      unit: formData.unit || undefined,
      contributesTo,
      totalCompletions: 0,
      currentStreak: 0,
      linkedSkill: formData.linkedSkill || undefined,
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
        className="bg-[#1a1f3a] border border-cyan-500/30 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10000
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-400">Create New Habit</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none w-8 h-8 flex items-center justify-center"
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Habit Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                placeholder="e.g., Morning Meditation"
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="boolean"
                    checked={formData.type === 'boolean'}
                    onChange={() => setFormData({ ...formData, type: 'boolean' })}
                    className="text-cyan-500"
                  />
                  <span className="text-white">✓ Yes/No (checkbox)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="number"
                    checked={formData.type === 'number'}
                    onChange={() => setFormData({ ...formData, type: 'number' })}
                    className="text-cyan-500"
                  />
                  <span className="text-white">🔢 Track Amount</span>
                </label>
              </div>
            </div>

            {/* Unit (only for number type) */}
            {formData.type === 'number' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit (optional)
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., minutes, pages, km"
                />
              </div>
            )}

            {/* Stats Contribution */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contributes To</h3>
              
              {/* Will Power */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contributesWillPower}
                  onChange={(e) => setFormData({ ...formData, contributesWillPower: e.target.checked })}
                  className="w-5 h-5 text-cyan-500"
                />
                <span className="text-cyan-400 font-medium">💪 Will Power</span>
                <span className="text-xs text-gray-500">(All habits contribute to discipline)</span>
              </label>

              {/* Knowledge */}
              <div className="mb-4">
                <label className="flex items-center gap-3 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contributesKnowledge}
                    onChange={(e) => setFormData({ ...formData, contributesKnowledge: e.target.checked })}
                    className="w-5 h-5 text-green-500"
                  />
                  <span className="text-green-400 font-medium">📚 Knowledge</span>
                </label>
                {formData.contributesKnowledge && (
                  <div className="ml-8 mt-2 space-y-2">
                    <select
                      value={formData.knowledgeCategory}
                      onChange={(e) => setFormData({ ...formData, knowledgeCategory: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value="reading">Reading</option>
                      <option value="coding">Coding</option>
                      <option value="language">Language</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.knowledgeMultiplier || ''}
                        onChange={(e) => setFormData({   ...formData, knowledgeMultiplier: e.target.value ? parseFloat(e.target.value) : 1 
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Volume multiplier (e.g., 1 = 1 point per unit)"
                        />
                  </div>
                )}
              </div>

              {/* Luck */}
              <div className="mb-4">
                <label className="flex items-center gap-3 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contributesLuck}
                    onChange={(e) => setFormData({ ...formData, contributesLuck: e.target.checked })}
                    className="w-5 h-5 text-yellow-500"
                  />
                  <span className="text-yellow-400 font-medium">🍀 Luck</span>
                  <span className="text-xs text-gray-500">(Networking, trying new things)</span>
                </label>
                {formData.contributesLuck && (
                  <div className="ml-8 mt-2">
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.luckMultiplier || ''}
                        onChange={(e) => setFormData({  ...formData, luckMultiplier: e.target.value ? parseInt(e.target.value) : 10 
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Volume multiplier"
                        />
                  </div>
                )}
              </div>
            </div>

            {/* Link to Skill */}
            {skills.length > 0 && (
              <div className="border-t border-gray-700 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link to Skill (optional)
                </label>
                <select
                  value={formData.linkedSkill}
                  onChange={(e) => setFormData({ ...formData, linkedSkill: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">None</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.tier})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Completing this habit will add XP to the linked skill
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Create Habit
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