// src/components/Navigation/TabNav.tsx
'use client';

import { useState } from 'react';

type Tab = 'dashboard' | 'habits' | 'skills';

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="border-b border-gray-700 mb-8">
      <div className="flex gap-1">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => onTabChange('habits')}
          className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
        >
          ✓ Habits
        </button>
        <button
          onClick={() => onTabChange('skills')}
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
        >
          🎯 Skills
        </button>
      </div>
    </nav>
  );
}