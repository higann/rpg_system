// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useStats } from '@/hooks/useStats';
import { TabNav } from '@/components/Navigation/TabNav';
import { StatsRadarChart } from '@/components/Charts/StatsRadarChart';
import { AddHabitForm } from '@/components/Habits/AddHabitForm';
import { TodayTracker } from '@/components/Habits/TodayTracker';
import { MonthlyTracker } from '@/components/Habits/MonthlyTracker';
import { HabitManager } from '@/components/Habits/HabitManager';
import { SkillsGrid } from '@/components/Skills/SkillsGrid';

type Tab = 'dashboard' | 'habits' | 'skills';

function HabitsSubTabs() {
  const [subTab, setSubTab] = useState<'tracker' | 'manage'>('tracker');

  return (
    <>
      {/* Sub-navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setSubTab('tracker')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'tracker'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Monthly Tracker
        </button>
        <button
          onClick={() => setSubTab('manage')}
          className={`px-4 py-2 font-medium transition ${
            subTab === 'manage'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚙️ Manage Habits
        </button>
      </div>

      {/* Content */}
      {subTab === 'tracker' && <MonthlyTracker />}
      {subTab === 'manage' && <HabitManager />}
    </>
  );
}
export default function Home() {
  const { profile, hasProfile, createProfile, deleteProfile } = useProfile();
  const { stats } = useStats();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddHabit, setShowAddHabit] = useState(false); // ADD THIS LINE

  // If no profile, show creation screen
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Life RPG
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Transform your habits into epic quests. Level up your life.
          </p>
          <button
            onClick={() => createProfile('Adventurer')}
            className="btn-primary text-lg"
          >
            ⚔️ Begin Your Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-background">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[var(--bg-dark)]/80 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {profile?.name}
            </h1>
            <p className="text-sm text-gray-400">Level {profile?.level}</p>
          </div>
          <button
            onClick={() => {
              if (confirm('🗑️ Delete all progress and start over?')) {
                deleteProfile();
              }
            }}
            className="px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition"
          >
            Reset Data
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
          
            {/* Today's Progress Summary */}
<div className="mb-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
  <div className="flex justify-between items-center">
    <div>
      <h3 className="text-lg font-semibold text-cyan-400 mb-1">Today&apos;s Progress</h3>
      <p className="text-sm text-gray-400">
        {(() => {
          const habits = profile?.habits || [];
          const today = new Date().toDateString();
          const completedToday = habits.filter(h => 
            h.lastCompletedDate && new Date(h.lastCompletedDate).toDateString() === today
          ).length;
          return `${completedToday} of ${habits.length} habits completed`;
        })()}
      </p>
    </div>
    <div className="text-right">
      <p className="text-3xl font-bold text-white">
        {(() => {
          const habits = profile?.habits || [];
          if (habits.length === 0) return 0;
          const today = new Date().toDateString();
          const completedToday = habits.filter(h => 
            h.lastCompletedDate && new Date(h.lastCompletedDate).toDateString() === today
          ).length;
          return Math.round((completedToday / habits.length) * 100);
        })()}%
      </p>
      <p className="text-xs text-gray-400">Completion Rate</p>
    </div>
  </div>
</div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
              {/* LEFT COLUMN - Profile Card */}
              <div className="profile-card">
                {/* Avatar */}
                <div className="avatar-circle">
                  👤
                </div>

                {/* Name, Level, EXP */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-cyan-400 mb-1">
                    {profile?.name || 'Adventurer'}
                  </h2>
                  <p className="text-gray-400">
                    Level <span className="text-white font-semibold">{profile?.level || 100}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    EXP: <span className="text-purple-400">0 / 1000</span>
                  </p>
                </div>

                {/* Stats List */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Stats</h3>
                  <div className="space-y-1">
                    <div className="stat-row">
                      <span className="text-gray-400">Will Power</span>
                      <span className="text-cyan-400 font-bold">
                        {stats.willPower == null || isNaN(stats.willPower) ? '1000' : stats.willPower.toFixed(0)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="text-gray-400">Intelligence</span>
                      <span className="text-purple-400 font-bold">
                        {stats.intelligence == null || isNaN(stats.intelligence) ? '0' : stats.intelligence}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="text-gray-400">Knowledge</span>
                      <span className="text-green-400 font-bold">
                        {stats.knowledge == null || isNaN(stats.knowledge) ? '0' : stats.knowledge.toFixed(0)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="text-gray-400">Luck</span>
                      <span className="text-yellow-400 font-bold">
                        {stats.luck == null || isNaN(stats.luck) ? '0' : stats.luck.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Skills</h3>
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="space-y-2">
                      {profile.skills.map(skill => (
                        <div 
                          key={skill.id} 
                          className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-purple-500/50 transition"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-white font-medium">{skill.name}</span>
                              <p className="text-xs text-gray-400 mt-1">
                                {skill.xp} XP • +{skill.intelligenceContribution} INT
                              </p>
                            </div>
                            <span className={`tier-badge tier-${skill.tier}`}>
                              {skill.tier}
                            </span>
                          </div>
                          {/* XP Progress Bar */}
                          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                              style={{ 
                                width: `${Math.min((skill.xp / (skill.tier === 'S' ? 2500 : skill.tier === 'A' ? 2500 : skill.tier === 'B' ? 1000 : skill.tier === 'C' ? 500 : 250)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No skills yet. Click &quot;Add Skill&quot; to start!
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Radar Chart */}
              <div className="flex items-center justify-center">
                <div className="w-full">
                  <StatsRadarChart stats={stats} />
                </div>
              </div>
            </div>

            {/* Quick Actions - Floating Bottom Right */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
              <button
                onClick={() => setActiveTab('habits')}
                className="btn-primary shadow-lg flex items-center gap-2"
                title="Go to Habits to add new habit"
              >
                ✓ Add Habit
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className="btn-secondary shadow-lg flex items-center gap-2"
                title="Go to Skills to add new skill"
              >
                🎯 Add Skill
              </button>
            </div>
          </>
        )}

        {/* HABITS TAB */}
          {activeTab === 'habits' && (
            <div>
              <HabitsSubTabs />
            </div>
          )}

       {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div>
            <SkillsGrid />
          </div>
        )}
      </main>
    </div>
  );
}