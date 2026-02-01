// src/components/Habits/MonthlyTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Habit } from '@/lib/models/types';

export function MonthlyTracker() {
  const { habits, completeHabit } = useHabits();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Record<string, Record<string, Record<number, number>>>>({});
  const [isLoaded, setIsLoaded] = useState(false); // ADD THIS LINE

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getMonthKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    return `${y}-${m.toString().padStart(2, '0')}`;
  };

  const currentMonthKey = getMonthKey(currentDate);
  const now = new Date();
  const isCurrentMonth = currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth();
  const today = isCurrentMonth ? now.getDate() : null;

  // Load from localStorage - runs ONCE on mount
useEffect(() => {
  const saved = localStorage.getItem('life-rpg-monthly-tracker');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setMonthlyData(parsed);
      console.log('✅ Monthly data loaded from localStorage');
    } catch (e) {
      console.error('❌ Failed to load monthly data:', e);
    }
  }
  setIsLoaded(true); // Mark as loaded even if nothing was in storage
}, []);

// Save to localStorage - only AFTER initial load
useEffect(() => {
  if (isLoaded) {
    localStorage.setItem('life-rpg-monthly-tracker', JSON.stringify(monthlyData));
    console.log('💾 Monthly data saved to localStorage');
  }
}, [monthlyData, isLoaded]);

const handleValueChange = (habitId: string, day: number, value: string) => {
  setMonthlyData(prev => {
    const newData = { ...prev };
    if (!newData[habitId]) newData[habitId] = {};
    if (!newData[habitId][currentMonthKey]) newData[habitId][currentMonthKey] = {};

    if (value === '') {
      delete newData[habitId][currentMonthKey][day];
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        newData[habitId][currentMonthKey][day] = numValue;
      }
    }
    return newData;
  });

  // Trigger formula engine update OUTSIDE of state setter
  if (day === today && value !== '') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        // Use setTimeout to defer until next tick (after render completes)
        setTimeout(() => {
          completeHabit(habitId, habit.type === 'number' ? numValue : undefined);
        }, 0);
      }
    }
  }
};

  const getValue = (habitId: string, day: number) => {
    const value = monthlyData[habitId]?.[currentMonthKey]?.[day];
    return value !== undefined ? value : '';
  };

  const getChartData = () => {
    if (!selectedHabit) return [];
    return days.map(day => ({
      day,
      value: monthlyData[selectedHabit]?.[currentMonthKey]?.[day] ?? 0,
    }));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthDisplay = `${monthNames[month]} ${year}`;

  const selectedHabitObj = habits.find(h => h.id === selectedHabit);

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">No habits yet!</p>
        <p className="text-sm text-gray-500">Create your first habit to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Monthly Tracker</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition"
          >
            ← Previous
          </button>
          <span className="text-lg font-semibold text-cyan-400 min-w-[160px] text-center">
            {monthDisplay}
          </span>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition"
          >
            Next →
          </button>
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid + Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        {/* Left: Data Table */}
        <div className="overflow-x-auto bg-gray-800/50 rounded-lg border border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-gray-900 border border-gray-700 px-4 py-2 text-left text-gray-300 font-semibold">
                  Habit
                </th>
                {days.map(day => (
                  <th
                    key={day}
                    className={`border border-gray-700 px-2 py-2 text-center min-w-[60px] font-medium ${
                      today === day ? 'bg-cyan-900/50 text-cyan-400' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr
                  key={habit.id}
                  onClick={() => setSelectedHabit(habit.id)}
                  className={`cursor-pointer transition ${
                    selectedHabit === habit.id
                      ? 'bg-cyan-900/30'
                      : 'hover:bg-gray-700/30'
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-gray-900 border border-gray-700 px-4 py-2 font-medium text-white">
                    {habit.name}
                    {habit.unit && (
                      <span className="text-gray-500 text-sm ml-2">({habit.unit})</span>
                    )}
                  </td>
                  {days.map(day => (
                    <td
                      key={day}
                      className={`border border-gray-700 p-0 ${
                        today === day ? 'bg-cyan-900/20' : ''
                      }`}
                    >
                        <input
                        type="number"
                        step="1"
                        min="0"
                        style={{ 
                            color: '#ffffff',
                            backgroundColor: today === day ? 'rgba(8, 145, 178, 0.2)' : 'transparent'
                        }}
                        className={`w-full px-2 py-2 text-center border-0 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        value={getValue(habit.id, day)}
                        onChange={(e) => handleValueChange(habit.id, day, e.target.value)}
                        placeholder="-"
                        />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Chart */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            {selectedHabitObj ? `${selectedHabitObj.name} Progress` : 'Habit Progress'}
          </h3>
          {selectedHabit ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  label={{
                    value: selectedHabitObj?.unit || 'Value',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#9ca3af'
                  }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-gray-500">Click a habit row to view progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}