// src/components/Habits/EditHabitForm.tsx
'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useSkills } from '@/hooks/useSkills';
import { Habit } from '@/lib/models/types';

interface EditHabitFormProps {
  habit: Habit;
  onClose: () => void;
  onSuccess: () => void;
}

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
};

const PANEL: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  width: '100%', maxWidth: 520,
  maxHeight: '90vh', overflowY: 'auto',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.875rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: '0.875rem',
  outline: 'none',
};

export function EditHabitForm({ habit, onClose, onSuccess }: EditHabitFormProps) {
  const { updateHabit } = useHabits();
  const { skills } = useSkills();

  const [formData, setFormData] = useState({
    name: habit.name,
    type: habit.type as 'boolean' | 'number',
    unit: habit.unit || '',
    contributesWillPower: !!habit.contributesTo.willPower,
    contributesKnowledge: !!habit.contributesTo.knowledge,
    knowledgeCategory: (habit.contributesTo.knowledge?.category || 'other') as 'reading' | 'coding' | 'language' | 'other',
    knowledgeMultiplier: habit.contributesTo.knowledge?.volumeMultiplier || 1,
    contributesLuck: !!habit.contributesTo.luck,
    luckMultiplier: habit.contributesTo.luck?.volumeMultiplier || 10,
    linkedSkill: habit.linkedSkill || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contributesTo: any = {};
    if (formData.contributesWillPower) contributesTo.willPower = true;
    if (formData.contributesKnowledge) contributesTo.knowledge = { category: formData.knowledgeCategory, volumeMultiplier: formData.knowledgeMultiplier };
    if (formData.contributesLuck) contributesTo.luck = { volumeMultiplier: formData.luckMultiplier };
    updateHabit(habit.id, { name: formData.name, type: formData.type, unit: formData.unit || undefined, contributesTo, linkedSkill: formData.linkedSkill || undefined });
    onSuccess();
    onClose();
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.375rem' };

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="stat-label">Habits</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>Edit Habit</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name */}
            <div>
              <p className="stat-label" style={labelStyle}>Name</p>
              <input
                type="text" required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Morning Meditation"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Type */}
            <div>
              <p className="stat-label" style={labelStyle}>Type</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['boolean', 'number'] as const).map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio" value={t}
                      checked={formData.type === t}
                      onChange={() => setFormData({ ...formData, type: t })}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                      {t === 'boolean' ? 'Yes / No' : 'Numeric'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Unit (number only) */}
            {formData.type === 'number' && (
              <div>
                <p className="stat-label" style={labelStyle}>Unit</p>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., minutes, pages, km"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
            )}

            {/* Contributes to */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <p className="stat-label" style={{ marginBottom: '0.75rem' }}>Contributes to</p>

              {/* Will Power */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox" checked={formData.contributesWillPower}
                  onChange={e => setFormData({ ...formData, contributesWillPower: e.target.checked })}
                  style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--stat-wp)' }}>Will Power</span>
              </label>

              {/* Knowledge */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: formData.contributesKnowledge ? '0.5rem' : 0 }}>
                  <input
                    type="checkbox" checked={formData.contributesKnowledge}
                    onChange={e => setFormData({ ...formData, contributesKnowledge: e.target.checked })}
                    style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--stat-kn)' }}>Knowledge</span>
                </label>
                {formData.contributesKnowledge && (
                  <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <select
                      value={formData.knowledgeCategory}
                      onChange={e => setFormData({ ...formData, knowledgeCategory: e.target.value as any })}
                      style={{ ...inputStyle }}
                    >
                      <option value="reading">Reading</option>
                      <option value="coding">Coding</option>
                      <option value="language">Language</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="number" min="0.1" step="0.1"
                      value={formData.knowledgeMultiplier || ''}
                      onChange={e => setFormData({ ...formData, knowledgeMultiplier: e.target.value ? parseFloat(e.target.value) : 1 })}
                      style={inputStyle}
                      placeholder="Points per unit"
                    />
                  </div>
                )}
              </div>

              {/* Luck */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: formData.contributesLuck ? '0.5rem' : 0 }}>
                  <input
                    type="checkbox" checked={formData.contributesLuck}
                    onChange={e => setFormData({ ...formData, contributesLuck: e.target.checked })}
                    style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--stat-lk)' }}>Luck</span>
                </label>
                {formData.contributesLuck && (
                  <div style={{ marginLeft: '1.5rem' }}>
                    <input
                      type="number" min="1" step="1"
                      value={formData.luckMultiplier || ''}
                      onChange={e => setFormData({ ...formData, luckMultiplier: e.target.value ? parseInt(e.target.value) : 10 })}
                      style={inputStyle}
                      placeholder="Points per unit"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Linked skill */}
            {skills.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <p className="stat-label" style={labelStyle}>Linked skill (optional)</p>
                <select
                  value={formData.linkedSkill}
                  onChange={e => setFormData({ ...formData, linkedSkill: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">None</option>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tier})</option>)}
                </select>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>Completing this habit adds XP to the linked skill</p>
              </div>
            )}

            {/* Stats summary */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <p className="stat-label" style={{ marginBottom: '0.375rem' }}>Current stats</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Streak: {habit.currentStreak || 0} days</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Total completions: {habit.totalCompletions || 0}</p>
                {habit.lastCompletedDate && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Last completed: {new Date(habit.lastCompletedDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save changes</button>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
