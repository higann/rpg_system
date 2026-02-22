// src/components/Skills/AddSkillForm.tsx
'use client';

import { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { determineSkillTier, getTierPoints } from '@/lib/formulas/intelligence';

interface AddSkillFormProps {
  onClose: () => void;
  onSuccess: () => void;
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
  width: '100%', maxWidth: 440,
  maxHeight: '90vh', overflowY: 'auto',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.875rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: '0.875rem',
  outline: 'none',
};

export function AddSkillForm({ onClose, onSuccess }: AddSkillFormProps) {
  const { addSkill } = useSkills();
  const [formData, setFormData] = useState({ name: '', xp: 0 });

  const previewTier = determineSkillTier(formData.xp);
  const previewPoints = getTierPoints(previewTier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tier = determineSkillTier(formData.xp);
    const intelligenceContribution = getTierPoints(tier);
    addSkill({ name: formData.name, xp: formData.xp, tier, intelligenceContribution });
    onSuccess();
    onClose();
  };

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="stat-label">Skills</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>New Skill</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name */}
            <div>
              <p className="stat-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Name</p>
              <input
                type="text" required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Chess, Programming, Guitar"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Starting XP */}
            <div>
              <p className="stat-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Starting XP <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
              <input
                type="number" min="0" step="1"
                value={formData.xp || ''}
                onChange={e => setFormData({ ...formData, xp: e.target.value ? parseInt(e.target.value) : 0 })}
                style={inputStyle}
                placeholder="0"
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>
                Leave at 0 to start fresh, or enter existing XP to set initial tier
              </p>
            </div>

            {/* Tier preview */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
              <p className="stat-label" style={{ marginBottom: '0.625rem' }}>Starting tier</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>Tier</span>
                <span className={`tier-badge tier-${previewTier}`}>{previewTier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>Intelligence contribution</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--stat-int)' }}>+{previewPoints}</span>
              </div>
            </div>

            {/* Tier reference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
              {[
                ['D', '0–249 XP', '+5'],
                ['C', '250–499 XP', '+10'],
                ['B', '500–999 XP', '+25'],
                ['A', '1000–2499 XP', '+50'],
              ].map(([tier, xp, pts]) => (
                <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`tier-badge tier-${tier}`}>{tier}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>{xp} · {pts} INT</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                <span className="tier-badge tier-S">S</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>2500+ XP · +100 INT</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create skill</button>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
