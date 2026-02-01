// src/components/Charts/StatsRadarChart.tsx
'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Stats } from '@/lib/models/types';

interface StatsRadarChartProps {
  stats: Stats;
}

export function StatsRadarChart({ stats }: StatsRadarChartProps) {
  // Normalize stats for radar chart (0-100 scale for visualization)
  const normalizeWillPower = (wp: number) => Math.min((wp / 2000) * 100, 100); // 2000 = max expected
  const normalizeKnowledge = (k: number) => Math.min((k / 5000) * 100, 100); // 5000 = max expected
  const normalizeLuck = (l: number) => Math.min((l / 3000) * 100, 100);
  const normalizeIntelligence = (i: number) => Math.min((i / 500) * 100, 100); // 500 = max (5 S-tier skills)

  const data = [
    {
      stat: 'Will',
      value: normalizeWillPower(stats.willPower || 1000),
      fullMark: 100,
    },
    {
      stat: 'Intelligence',
      value: normalizeIntelligence(stats.intelligence || 0),
      fullMark: 100,
    },
    {
      stat: 'Knowledge',
      value: normalizeKnowledge(stats.knowledge || 0),
      fullMark: 100,
    },
    {
      stat: 'Luck',
      value: normalizeLuck(stats.luck || 0),
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(0, 240, 255, 0.3)" />
        <PolarAngleAxis 
          dataKey="stat" 
          tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 600 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Radar
          name="Stats"
          dataKey="value"
          stroke="#00f0ff"
          fill="#00f0ff"
          fillOpacity={0.6}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}