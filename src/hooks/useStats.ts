// src/hooks/useStats.ts
'use client';

import { useProfileContext } from '@/contexts/ProfileContext';

/**
 * Hook to access live-calculated stats
 * Stats auto-update whenever habits or skills change
 */
export function useStats() {
  const { stats, refreshStats } = useProfileContext();
  
  return {
    stats,
    refreshStats,
  };
}