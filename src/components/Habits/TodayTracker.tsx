// src/components/Habits/TodayTracker.tsx
'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/lib/models/types';

export function TodayTracker() {
  const { habits, completeHabit } = useHabits();
  const [numberInputs, setNumberInputs] = useState<{ [key: string]: number }>({});

  const today = new Date().toDateString();
  const todayHabits = habits.filter(h => 
    !h.lastCompletedDate || new Date(h.lastCompletedDate).toDateString() !== today
  );
  const completedToday = habits.filter(h => 
    h.lastCompletedDate && new Date(h.lastCompletedDate).toDateString() === today
  );

  const handleComplete = (habit: Habit) => {
    if (habit.type === 'number') {
      const value = numberInputs[habit.id];
      if (!value || value <= 0) {
        alert('Please enter a valid number');
        return;
      }
      completeHabit(habit.id, value);
      setNumberInputs({ ...numberInputs, [habit.id]: 0 });
    } else {
      completeHabit(habit.id);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No habits yet!</p>
        <p className="text-sm text-gray-600">Create your first habit to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Habits */}
      {todayHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            ⏳ To Do Today ({todayHabits.length})
          </h3>
          <div className="space-y-2">
            {todayHabits.map(habit => (
              <div
                key={habit.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition"
              >
                <div className="flex items-center gap-4">
                  {habit.type === 'boolean' ? (
                    <>
                      <button
                        onClick={() => handleComplete(habit)}
                        className="w-6 h-6 rounded border-2 border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/20 transition flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{habit.name}</p>
                        <p className="text-xs text-gray-400">
                          🔥 {habit.currentStreak || 0} day streak • {habit.totalCompletions || 0} total
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={numberInputs[habit.id] || ''}
                        onChange={(e) => setNumberInputs({ ...numberInputs, [habit.id]: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="0"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {habit.name} {habit.unit && <span className="text-gray-500 text-sm">({habit.unit})</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          🔥 {habit.currentStreak || 0} day streak • {habit.totalCompletions || 0} total
                        </p>
                      </div>
                      <button
                        onClick={() => handleComplete(habit)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                      >
                        ✓
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            ✓ Completed Today ({completedToday.length})
          </h3>
          <div className="space-y-2">
            {completedToday.map(habit => (
              <div
                key={habit.id}
                className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-green-500/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{habit.name}</p>
                    <p className="text-xs text-gray-400">
                      🔥 {habit.currentStreak || 0} day streak
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Done */}
      {todayHabits.length === 0 && completedToday.length > 0 && (
        <div className="text-center py-8 bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-xl font-bold text-cyan-400 mb-1">All Done!</p>
          <p className="text-sm text-gray-400">You&apos;ve completed all your habits today.</p>
        </div>
      )}
    </div>
  );
}