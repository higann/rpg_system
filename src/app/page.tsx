'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileContext } from '@/contexts/ProfileContext';
import { AuthPage } from '@/components/Auth/AuthPage';
import { useStats } from '@/hooks/useStats';
import { TabNav } from '@/components/Navigation/TabNav';
import { StatsRadarChart } from '@/components/Charts/StatsRadarChart';
import { MonthlyTracker } from '@/components/Habits/MonthlyTracker';
import { HabitManager } from '@/components/Habits/HabitManager';
import { SkillsGrid } from '@/components/Skills/SkillsGrid';
import { StatTooltip } from '@/components/UI/StatTooltip';
import { FormulaInfoModal } from '@/components/UI/FormulaInfoModal';
import { ProfileEditor } from '@/components/Profile/ProfileEditor';

type Tab = 'dashboard' | 'habits' | 'skills';

function HabitsSubTabs({ initialSubTab = 'tracker', initialAdding = false }: { initialSubTab?: 'tracker' | 'manage'; initialAdding?: boolean }) {
  const [subTab, setSubTab] = useState<'tracker' | 'manage'>(initialSubTab);

  return (
    <>
      <div className="flex gap-6 mb-6 border-b border-[var(--border)]">
        {(['tracker', 'manage'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              subTab === t
                ? 'text-white border-b border-[var(--accent)]'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {t === 'tracker' ? 'Monthly Tracker' : 'Manage Habits'}
          </button>
        ))}
      </div>
      {subTab === 'tracker' ? <MonthlyTracker /> : <HabitManager initialAdding={initialAdding} />}
    </>
  );
}

export default function Home() {
  const { profile, hasProfile, createProfile, deleteProfile } = useProfile();
  const { avatar, authLoading, user, signOut } = useProfileContext();
  const { stats } = useStats();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [habitsMount, setHabitsMount] = useState({ key: 0, subTab: 'tracker' as 'tracker' | 'manage', adding: false });
  const [skillsMount, setSkillsMount] = useState({ key: 0, openAdd: false });

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>LOADING</p>
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!user) return <AuthPage />;

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-[var(--text-3)] text-xs font-semibold uppercase tracking-widest mb-4">Life RPG</p>
          <h1 className="text-4xl font-bold mb-3 text-[var(--text)]">
            Level up your life.
          </h1>
          <p className="text-[var(--text-2)] mb-8 text-sm leading-relaxed">
            Track habits as quests. Build skills. Watch your stats climb.
          </p>
          <button
            onClick={() => createProfile('Adventurer')}
            className="btn-primary text-sm px-6 py-3"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // ── Compute today's completion ────────────────────────────────────────────
  const habits = profile?.habits || [];
  const today = new Date().toDateString();
  const completedToday = habits.filter(
    h => h.lastCompletedDate && new Date(h.lastCompletedDate).toDateString() === today
  ).length;
  const completionPct = habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100);
  // Expected completion rate scales with level: level 10 → 30%, level 30 → 90% (cap)
  const expectedPct = Math.min(90, (profile?.level || 0) * 3);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-md"
        style={{ borderColor: 'var(--border)', background: 'rgba(9,9,15,0.88)' }}
      >
        <div className="page-header-inner">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-3)] pr-4 border-r border-[var(--border)]">
              Life RPG
            </span>
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="page-main">

        {/* ── Dashboard ──────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Today's status strip */}
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-[var(--border)]">
              <div>
                <p className="stat-label mb-1">Today</p>
                <p className="text-sm text-[var(--text-2)]">
                  {completedToday} of {habits.length} {habits.length === 1 ? 'habit' : 'habits'} completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold font-mono text-[var(--text)]">{completionPct}%</p>
                <p className={`text-xs mt-0.5 ${completionPct >= expectedPct ? 'text-emerald-400' : 'text-[var(--text-3)]'}`}>
                  {completionPct >= expectedPct ? `+${completionPct - expectedPct}% above target` : `${expectedPct}% needed`}
                </p>
              </div>
            </div>

            {/* Two-column layout: profile card fixed 380px left, chart fills right */}
            <div className="dashboard-layout">

              {/* Left — profile card */}
              <div className="profile-card dashboard-profile flex flex-col gap-6">

                {/* Avatar + identity */}
                <div className="text-center">
                  <div className="avatar-circle">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: '1.75rem' }}>◉</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-[var(--text)]">
                      {profile?.name || 'Adventurer'}
                    </h2>
                    <span
                      className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded"
                      style={{ background: 'var(--accent-10)', color: 'var(--accent)', border: '1px solid var(--accent-20)' }}
                    >
                      LV {profile?.level ?? 0}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                  >
                    Edit profile
                  </button>
                </div>

                {/* Stats */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="stat-label">Stats</p>
                    <button
                      onClick={() => setShowFormulaInfo(true)}
                      className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                    >
                      How it works
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Will Power */}
                    <StatTooltip stat="willPower" value={stats.willPower || 1000}>
                      <div
                        className="p-3 rounded-xl cursor-help transition-colors group"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <p className="stat-label">Will Power</p>
                        <p className="stat-value" style={{ color: 'var(--stat-wp)' }}>
                          {isNaN(stats.willPower) ? '1000' : stats.willPower.toFixed(0)}
                        </p>
                      </div>
                    </StatTooltip>

                    {/* Intelligence */}
                    <StatTooltip stat="intelligence" value={stats.intelligence || 0}>
                      <div
                        className="p-3 rounded-xl cursor-help transition-colors"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <p className="stat-label">Intelligence</p>
                        <p className="stat-value" style={{ color: 'var(--stat-int)' }}>
                          {isNaN(stats.intelligence) ? '0' : stats.intelligence}
                        </p>
                      </div>
                    </StatTooltip>

                    {/* Knowledge */}
                    <StatTooltip stat="knowledge" value={stats.knowledge || 0}>
                      <div
                        className="p-3 rounded-xl cursor-help transition-colors"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <p className="stat-label">Knowledge</p>
                        <p className="stat-value" style={{ color: 'var(--stat-kn)' }}>
                          {isNaN(stats.knowledge) ? '0' : stats.knowledge.toFixed(0)}
                        </p>
                      </div>
                    </StatTooltip>

                    {/* Luck */}
                    <StatTooltip stat="luck" value={stats.luck || 0}>
                      <div
                        className="p-3 rounded-xl cursor-help transition-colors"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <p className="stat-label">Luck</p>
                        <p className="stat-value" style={{ color: 'var(--stat-lk)' }}>
                          {isNaN(stats.luck) ? '0' : stats.luck.toFixed(0)}
                        </p>
                      </div>
                    </StatTooltip>
                  </div>

                  {/* Character Level — full width, below grid */}
                  <div
                    className="mt-2 p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="stat-label">Character Level</p>
                      <p className="text-lg font-bold font-mono text-[var(--text)]">
                        {profile?.level ?? 0}
                      </p>
                    </div>
                    {/* Progress bar: today vs expected */}
                    <div
                      className="h-[2px] rounded-full overflow-hidden mb-2"
                      style={{ background: 'var(--surface-3)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(completionPct, 100)}%`,
                          background: completionPct >= expectedPct ? '#34d399' : 'var(--accent)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-3)]">
                      <span>Target {expectedPct}%</span>
                      <span className={completionPct >= expectedPct ? 'text-emerald-400' : ''}>
                        Today {completionPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <p className="stat-label mb-3">Skills</p>
                    <div className="space-y-2">
                      {profile.skills.map(skill => (
                        <div
                          key={skill.id}
                          className="p-3 rounded-lg flex items-center justify-between"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        >
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">{skill.name}</p>
                            <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                              {skill.xp} XP · +{skill.intelligenceContribution} INT
                            </p>
                          </div>
                          <span className={`tier-badge tier-${skill.tier}`}>{skill.tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — radar chart */}
              <div className="dashboard-chart">
                <div className="dashboard-chart-inner">
                  <StatsRadarChart stats={stats} />
                </div>
              </div>
            </div>

            {showFormulaInfo && <FormulaInfoModal onClose={() => setShowFormulaInfo(false)} />}
          </>
        )}

        {/* ── Habits ─────────────────────────────────────────────────────── */}
        {activeTab === 'habits' && (
          <HabitsSubTabs
            key={habitsMount.key}
            initialSubTab={habitsMount.subTab}
            initialAdding={habitsMount.adding}
          />
        )}

        {/* ── Skills ─────────────────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <SkillsGrid
            key={skillsMount.key}
            initialShowAdd={skillsMount.openAdd}
          />
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="border-t mt-auto"
        style={{ borderColor: 'var(--border)', background: 'rgba(9,9,15,0.88)' }}
      >
        <div className="page-footer-inner">
          <p className="footer-version text-[10px] font-semibold tracking-widest uppercase text-[var(--text-3)]">
            Life RPG · v1.0
          </p>
          <div className="footer-buttons">
            <button
              onClick={() => {
                setHabitsMount(p => ({ key: p.key + 1, subTab: 'manage', adding: true }));
                setActiveTab('habits');
              }}
              className="btn-secondary"
            >
              Add Habit
            </button>
            <button
              onClick={() => {
                setSkillsMount(p => ({ key: p.key + 1, openAdd: true }));
                setActiveTab('skills');
              }}
              className="btn-secondary"
            >
              Add Skill
            </button>
            <button
              onClick={() => {
                if (confirm('Delete all progress and start over?')) deleteProfile();
              }}
              className="text-[11px] text-[var(--text-3)] hover:text-rose-400 transition-colors px-2"
            >
              Reset
            </button>
            <button
              onClick={signOut}
              className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors px-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </footer>

      <ProfileEditor isOpen={showProfileEditor} onClose={() => setShowProfileEditor(false)} />
    </div>
  );
}
