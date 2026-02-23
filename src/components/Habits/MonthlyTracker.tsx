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
  const [isLoaded, setIsLoaded] = useState(false);

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
        console.log('✓ Monthly data loaded from localStorage');
      } catch (e) {
        console.error('✗ Failed to load monthly data:', e);
      }
    }
    setIsLoaded(true);
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

    // For boolean habits complete immediately on change; number habits wait for blur
    if (day === today && value !== '') {
      const habit = habits.find(h => h.id === habitId);
      if (habit && habit.type === 'boolean') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setTimeout(() => {
            completeHabit(habitId, undefined);
          }, 0);
        }
      }
    }
  };

  // For number-type habits: fire completeHabit once when the user finishes
  // typing (onBlur), so the stat engine receives the final value, not each
  // intermediate keystroke.
  const handleNumberBlur = (habitId: string, day: number) => {
    if (day !== today) return;
    const stored = monthlyData[habitId]?.[currentMonthKey]?.[day];
    if (stored === undefined) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    completeHabit(habitId, stored);
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
      <div className="py-16 text-center">
        <p className="text-sm text-[var(--text-3)]">No habits yet — create one in Manage Habits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <p className="stat-label">{monthDisplay}</p>
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousMonth} className="btn-secondary px-3 py-1.5">←</button>
          <button onClick={goToNextMonth} className="btn-secondary px-3 py-1.5">→</button>
          {!isCurrentMonth && (
            <button onClick={goToCurrentMonth} className="btn-secondary text-xs">Today</button>
          )}
        </div>
      </div>

      {/* Grid + Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
        {/* Left: Data Table */}
        <div
          className="overflow-x-auto rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-20 px-4 py-2.5 text-left"
                  style={{
                    background: 'var(--surface-2)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-3)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Habit
                </th>
                {days.map(day => (
                  <th
                    key={day}
                    className="px-0 py-2 text-center w-[34px]"
                    style={{
                      background: today === day ? 'var(--accent-10)' : 'var(--surface-2)',
                      borderBottom: '1px solid var(--border)',
                      color: today === day ? 'var(--accent)' : 'var(--text-3)',
                      fontSize: '0.625rem',
                      fontWeight: today === day ? 700 : 500,
                    }}
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
                  style={{
                    background: selectedHabit === habit.id ? 'var(--accent-10)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedHabit !== habit.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (selectedHabit !== habit.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td
                    className="sticky left-0 z-10 px-4 py-2 text-sm font-medium"
                    style={{
                      background: 'var(--surface)',
                      borderRight: '1px solid var(--border)',
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {habit.name}
                  </td>
                  {days.map(day => {
                    const rawValue = getValue(habit.id, day);
                    const numericValue = rawValue === '' ? 0 : Number(rawValue);
                    const meetsGoal = habit.type === 'number' && habit.dailyGoal !== undefined && numericValue >= habit.dailyGoal;

                    return (
                      <td
                        key={day}
                        className="p-0 w-[34px] h-[34px]"
                        style={{ borderRight: '1px solid var(--border)' }}
                      >
                        {habit.type === 'boolean' ? (
                          <div className="flex items-center justify-center w-full h-full">
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer accent-cyan-400"
                              style={{ opacity: today === day || numericValue === 1 ? 1 : 0.35 }}
                              checked={numericValue === 1}
                              onChange={e => handleValueChange(habit.id, day, e.target.checked ? '1' : '0')}
                            />
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="1"
                            min="0"
                            style={{
                              width: '100%',
                              height: '100%',
                              padding: '0 4px',
                              textAlign: 'center',
                              fontSize: '0.6875rem',
                              border: 'none',
                              outline: 'none',
                              background: today === day ? 'var(--accent-10)' : 'transparent',
                              color: meetsGoal ? 'var(--stat-kn)' : 'var(--text-2)',
                            }}
                            value={rawValue === '' ? '' : numericValue}
                            onChange={e => handleValueChange(habit.id, day, e.target.value)}
                            onBlur={() => handleNumberBlur(habit.id, day)}
                            placeholder="·"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Chart */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="stat-label mb-4">
            {selectedHabitObj ? selectedHabitObj.name : 'Select a habit'}
          </p>
          {selectedHabit ? (
            <div className="tracker-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--text-3)"
                  tick={{ fill: 'var(--text-3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-3)"
                  tick={{ fill: 'var(--text-3)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: selectedHabitObj?.unit || '', angle: -90, position: 'insideLeft', fill: 'var(--text-3)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                  labelStyle={{ color: 'var(--text-2)' }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div className="tracker-chart-box flex items-center justify-center">
              <p className="text-xs text-[var(--text-3)]">Select a habit row to view its chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
