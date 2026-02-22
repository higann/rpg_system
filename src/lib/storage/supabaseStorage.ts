// src/lib/storage/supabaseStorage.ts
// Supabase read/write for the profile. Avatar and monthly tracker stay in localStorage.

import { supabase } from '@/lib/supabase/client';
import { CharacterProfile } from '@/lib/models/types';

// ── Serialization ─────────────────────────────────────────────────────────────
// Date objects don't survive JSON round-trips through Postgres JSONB unless we
// wrap them. We use the same { __type: 'Date', value: ISO } convention as the
// localStorage layer so both stores are compatible.

function serialize(profile: CharacterProfile): object {
  return JSON.parse(
    JSON.stringify(profile, (_, v) =>
      v instanceof Date ? { __type: 'Date', value: v.toISOString() } : v
    )
  );
}

function deserialize(data: any): CharacterProfile {
  return JSON.parse(JSON.stringify(data), (_, v) =>
    v && typeof v === 'object' && v.__type === 'Date' ? new Date(v.value) : v
  );
}

// ── Profile CRUD ──────────────────────────────────────────────────────────────

export async function fetchProfileFromDB(userId: string): Promise<CharacterProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return deserialize(data.data);
}

export async function saveProfileToDB(userId: string, profile: CharacterProfile): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, data: serialize(profile) }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function deleteProfileFromDB(userId: string): Promise<void> {
  await supabase.from('profiles').delete().eq('user_id', userId);
}
