// src/components/UI/FormulaInfoModal.tsx
'use client';

interface FormulaInfoModalProps {
  onClose: () => void;
}

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
};

const PANEL: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  width: '100%', maxWidth: 560,
  maxHeight: '90vh', overflowY: 'auto',
};

const SECTION: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '1rem',
};

export function FormulaInfoModal({ onClose }: FormulaInfoModalProps) {
  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="stat-label">Formula reference</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>How Stats Work</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Will Power */}
            <div style={{ ...SECTION, borderLeftColor: 'var(--stat-wp)', borderLeftWidth: 2 }}>
              <p className="stat-label" style={{ color: 'var(--stat-wp)', marginBottom: '0.375rem' }}>Will Power — Streak Points</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
                Starts at 0. Every completion earns points — longer streaks earn more. Breaking a streak costs points proportional to how long it was.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  'Gain: +10 × (1 + min(streak, 10) × 5%)',
                  'Streak 0 → +10 WP · Streak 10+ → +15 WP',
                  'Miss penalty: −(streak × 2) WP',
                  'Miss streak 5 → −10 WP · Miss streak 10 → −20 WP',
                  'WP never goes below 0',
                ].map(l => (
                  <p key={l} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l}</p>
                ))}
              </div>
            </div>

            {/* Intelligence */}
            <div style={{ ...SECTION, borderLeftColor: 'var(--stat-int)', borderLeftWidth: 2 }}>
              <p className="stat-label" style={{ color: 'var(--stat-int)', marginBottom: '0.375rem' }}>Intelligence — Skill Mastery</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
                Sum of contributions from all skills. Each skill contributes based on its XP tier.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                {[
                  ['D', '0–249 XP', '+5 INT'],
                  ['C', '250–499 XP', '+10 INT'],
                  ['B', '500–999 XP', '+25 INT'],
                  ['A', '1000–2499 XP', '+50 INT'],
                ].map(([tier, xp, int]) => (
                  <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`tier-badge tier-${tier}`}>{tier}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>{xp} → {int}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                  <span className="tier-badge tier-S">S</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>2500+ XP → +100 INT</span>
                </div>
              </div>
            </div>

            {/* Knowledge */}
            <div style={{ ...SECTION, borderLeftColor: 'var(--stat-kn)', borderLeftWidth: 2 }}>
              <p className="stat-label" style={{ color: 'var(--stat-kn)', marginBottom: '0.375rem' }}>Knowledge — Volume Accumulation</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
                Linear accumulation — every page, every hour counts. No diminishing returns.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {['Formula: completions × volume multiplier', 'Categories: Reading, Coding, Language, Other', 'Example: 50 pages (×1.0) → +50 Knowledge', 'Never decreases'].map(l => (
                  <p key={l} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l}</p>
                ))}
              </div>
            </div>

            {/* Luck */}
            <div style={{ ...SECTION, borderLeftColor: 'var(--stat-lk)', borderLeftWidth: 2 }}>
              <p className="stat-label" style={{ color: 'var(--stat-lk)', marginBottom: '0.375rem' }}>Luck — Opportunity Exposure</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
                Measures how much you expose yourself to opportunities — networking, cold outreach, new experiences.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {['Formula: completions × multiplier', 'Examples: events, emails, trying new restaurants', 'You create your own luck by increasing surface area'].map(l => (
                  <p key={l} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l}</p>
                ))}
              </div>
            </div>

            {/* Level */}
            <div style={SECTION}>
              <p className="stat-label" style={{ marginBottom: '0.375rem' }}>Character Level — Completion Milestones</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '0.625rem' }}>
                Derived from total habit completions across all habits. Starts at 0, no upper bound.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  'Formula: floor(√(totalCompletions / 2))',
                  '2 completions → Level 1',
                  '8 → Level 2 · 50 → Level 5',
                  '200 → Level 10 · 800 → Level 20',
                ].map(l => (
                  <p key={l} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{l}</p>
                ))}
              </div>
            </div>

            {/* Flow */}
            <div style={SECTION}>
              <p className="stat-label" style={{ marginBottom: '0.5rem' }}>How habits update stats</p>
              <ol style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  'Enter data in Monthly Tracker for today',
                  'Will Power updates: +10–15 WP based on streak',
                  'Knowledge / Luck add volume if configured',
                  'Linked skill gains XP on completion',
                  'Intelligence recalculates if tier changed',
                  'Character Level recalculates from total completions',
                  'All changes save to localStorage',
                ].map((step, i) => (
                  <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
