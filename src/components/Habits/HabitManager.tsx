'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useSkills } from '@/hooks/useSkills';
import { Habit } from '@/lib/models/types';
import { EditHabitForm } from './EditHabitForm';

export function HabitManager({ initialAdding = false }: { initialAdding?: boolean }) {
  const { habits, addHabit, deleteHabit } = useHabits();
  const { skills } = useSkills();
  const [isAdding, setIsAdding] = useState(initialAdding);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'boolean' | 'number'>('boolean');
  const [unit, setUnit] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number | undefined>(undefined);
  const [linkedSkill, setLinkedSkill] = useState<string>('');
  const [contributesToKnowledge, setContributesToKnowledge] = useState(false);
  const [knowledgeCategory, setKnowledgeCategory] = useState<'reading' | 'coding' | 'language' | 'other'>('reading');
  const [knowledgeMultiplier, setKnowledgeMultiplier] = useState(1);
  const [contributesToLuck, setContributesToLuck] = useState(false);
  const [luckMultiplier, setLuckMultiplier] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addHabit({
      name,
      type,
      unit: type === 'number' ? unit : undefined,
      dailyGoal: type === 'number' ? dailyGoal : undefined,
      contributesTo: {
        willPower: true,
        knowledge: contributesToKnowledge
          ? { category: knowledgeCategory, volumeMultiplier: knowledgeMultiplier }
          : undefined,
        luck: contributesToLuck ? { volumeMultiplier: luckMultiplier } : undefined,
      },
      linkedSkill: linkedSkill || undefined,
      totalCompletions: 0,
      currentStreak: 0,
    });

    setName('');
    setType('boolean');
    setUnit('');
    setDailyGoal(undefined);
    setLinkedSkill('');
    setContributesToKnowledge(false);
    setContributesToLuck(false);
    setIsAdding(false);
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] outline-none transition-colors'
    + ' bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent-20)]';

  return (
    <div className="space-y-6">
      {!isAdding && (
        <button onClick={() => setIsAdding(true)} className="btn-primary">
          New Habit
        </button>
      )}

      {/* Add form */}
      {isAdding && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-[var(--text)] mb-5">Create Habit</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)] mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputCls}
                placeholder="e.g., Morning Meditation"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)] mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'boolean' | 'number')}
                className={inputCls}
              >
                <option value="boolean">Yes / No</option>
                <option value="number">Numeric</option>
              </select>
            </div>

            {type === 'number' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)] mb-1.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className={inputCls}
                    placeholder="pages, minutes, reps…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)] mb-1.5">
                    Daily Goal
                  </label>
                  <input
                    type="number"
                    value={dailyGoal || ''}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className={inputCls}
                    placeholder="e.g., 10"
                    min="1"
                    required
                  />
                  <p className="text-[11px] text-[var(--text-3)] mt-1">
                    Values below this threshold won't count as completed
                  </p>
                </div>
              </>
            )}

            {skills.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)] mb-1.5">
                  Linked Skill (optional)
                </label>
                <select
                  value={linkedSkill}
                  onChange={e => setLinkedSkill(e.target.value)}
                  className={inputCls}
                >
                  <option value="">None</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.tier}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Knowledge */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contributesToKnowledge}
                  onChange={e => setContributesToKnowledge(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-sm text-[var(--text-2)]">Contributes to Knowledge</span>
              </label>
              {contributesToKnowledge && (
                <div className="ml-6 mt-2 space-y-2">
                  <select value={knowledgeCategory} onChange={e => setKnowledgeCategory(e.target.value as any)} className={inputCls}>
                    <option value="reading">Reading</option>
                    <option value="coding">Coding</option>
                    <option value="language">Language</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="number" min="0.1" step="0.1"
                    value={knowledgeMultiplier}
                    onChange={e => setKnowledgeMultiplier(Number(e.target.value))}
                    className={inputCls}
                    placeholder="Points per unit"
                  />
                </div>
              )}
            </div>

            {/* Luck */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contributesToLuck}
                  onChange={e => setContributesToLuck(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-sm text-[var(--text-2)]">Contributes to Luck</span>
              </label>
              {contributesToLuck && (
                <div className="ml-6 mt-2">
                  <input
                    type="number" min="1" step="1"
                    value={luckMultiplier}
                    onChange={e => setLuckMultiplier(Number(e.target.value))}
                    className={inputCls}
                    placeholder="Points per unit"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit modal */}
      {editingHabit && (
        <EditHabitForm
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSuccess={() => setEditingHabit(null)}
        />
      )}

      {/* Habit list */}
      <div className="space-y-2">
        <p className="stat-label mb-3">Your Habits</p>
        {habits.length === 0 ? (
          <p className="text-sm text-[var(--text-3)]">No habits yet. Create your first one.</p>
        ) : (
          habits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{habit.name}</p>
                <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                  {habit.type === 'boolean' ? 'Yes / No' : `${habit.unit}${habit.dailyGoal ? ` · goal ${habit.dailyGoal}` : ''}`}
                  {' · '}streak {habit.currentStreak} · {habit.totalCompletions} total
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingHabit(habit)}
                  className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-[11px] text-[var(--text-3)] hover:text-rose-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
