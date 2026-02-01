// src/hooks/useProfile.ts
'use client';

import { useProfileContext } from '@/contexts/ProfileContext';

/**
 * Hook to access and modify the user's profile
 */
export function useProfile() {
  const { profile, isLoading, createProfile, updateProfile, deleteProfile } = useProfileContext();
  
  return {
    profile,
    isLoading,
    hasProfile: profile !== null,
    createProfile,
    updateProfile,
    deleteProfile,
  };
}