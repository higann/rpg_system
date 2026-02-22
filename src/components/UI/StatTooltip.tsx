'use client';

import { useState } from 'react';

interface StatTooltipProps {
  stat: 'willPower' | 'intelligence' | 'knowledge' | 'luck';
  value: number;
  children: React.ReactNode;
}

export function StatTooltip({ stat, value, children }: StatTooltipProps) {
  const [show, setShow] = useState(false);

  const configs: Record<string, { label: string; color: string; formula: string; lines: string[] }> = {
    willPower: {
      label: 'Will Power',
      color: 'var(--stat-wp)',
      formula: 'ELO-based · starts at 1000',
      lines: [
        'All habits contribute via ELO rating',
        'Completing habits gains ELO points',
        'Breaking streaks loses ELO points',
        'Older habits (100+ completions) give less gain',
      ],
    },
    intelligence: {
      label: 'Intelligence',
      color: 'var(--stat-int)',
      formula: 'Sum of skill tier contributions',
      lines: [
        'D Tier (0–249 XP) → +5 INT',
        'C Tier (250–499 XP) → +10 INT',
        'B Tier (500–999 XP) → +25 INT',
        'A Tier (1000–2499 XP) → +50 INT',
        'S Tier (2500+ XP) → +100 INT',
      ],
    },
    knowledge: {
      label: 'Knowledge',
      color: 'var(--stat-kn)',
      formula: 'Linear — completions × multiplier',
      lines: [
        'Reading, Coding, Language, Other habits',
        'Each completion adds volume × multiplier',
        `Current total: ${value.toFixed(0)} points`,
        'Never decreases',
      ],
    },
    luck: {
      label: 'Luck',
      color: 'var(--stat-lk)',
      formula: 'Opportunity exposure — completions × multiplier',
      lines: [
        'Networking, outreach, trying new things',
        'Each completion adds volume × multiplier',
        `Current total: ${value.toFixed(0)} points`,
        'Increases surface area for serendipity',
      ],
    },
  };

  const cfg = configs[stat];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <p className="stat-label mb-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginBottom: '0.625rem', fontFamily: 'var(--font-geist-mono)' }}>
              {cfg.formula}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {cfg.lines.map((line, i) => (
                <p key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-2)' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid var(--border-2)',
          }} />
        </div>
      )}
    </div>
  );
}
