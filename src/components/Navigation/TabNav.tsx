'use client';

type Tab = 'dashboard' | 'habits' | 'skills';

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'habits',    label: 'Habits'    },
  { id: 'skills',    label: 'Skills'    },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="flex gap-1">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`tab ${activeTab === id ? 'active' : ''}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
