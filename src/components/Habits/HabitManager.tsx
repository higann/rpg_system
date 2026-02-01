// src/components/Habits/HabitManager.tsx
'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { AddHabitForm } from './AddHabitForm';

export function HabitManager() {
  const { habits, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Manage Habits</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Add Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-2">No habits yet</p>
          <p className="text-sm text-gray-500">Create your first habit to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(habit => (
            <div
              key={habit.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{habit.name}</h4>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Type: {habit.type === 'boolean' ? 'Yes/No' : 'Number'}</span>
                    {habit.unit && <span>Unit: {habit.unit}</span>}
                    <span>Streak: {habit.currentStreak || 0} days</span>
                    <span>Total: {habit.totalCompletions || 0}</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {habit.contributesTo.willPower && (
                      <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded">💪 Will Power</span>
                    )}
                    {habit.contributesTo.knowledge && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">📚 Knowledge</span>
                    )}
                    {habit.contributesTo.luck && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">🍀 Luck</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${habit.name}"?`)) {
                      deleteHabit(habit.id);
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddHabitForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}