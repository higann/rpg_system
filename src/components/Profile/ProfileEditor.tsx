// src/components/Profile/ProfileEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileContext } from '@/contexts/ProfileContext';

interface ProfileEditorProps {
  isOpen: boolean;
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
  width: '100%', maxWidth: 400,
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

export function ProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const { profile, updateProfile } = useProfile();
  const { avatar, setAvatar } = useProfileContext();
  const [name, setName] = useState(profile?.name || 'Adventurer');
  const [imagePreview, setImagePreview] = useState<string | null>(avatar);

  useEffect(() => {
    if (isOpen) {
      setName(profile?.name || 'Adventurer');
      setImagePreview(avatar);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ name: name.trim() || 'Adventurer' });
    setAvatar(imagePreview);
    onClose();
  };

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="stat-label">Profile</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>Edit Profile</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}
            >
              ×
            </button>
          </div>

          {/* Avatar preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'var(--surface-2)', border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', fontSize: '2.5rem',
            }}>
              {imagePreview
                ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--text-3)' }}>◉</span>
              }
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>
                Upload image
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              {imagePreview && (
                <button
                  onClick={() => setImagePreview(null)}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-3)', cursor: 'pointer', padding: '0.5rem 0.75rem' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                >
                  Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>Max 2 MB · JPG, PNG, GIF</p>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p className="stat-label" style={{ marginBottom: '0.375rem' }}>Name</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adventurer"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>Save</button>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
