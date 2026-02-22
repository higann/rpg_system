// src/components/Charts/StatsRadarChart.tsx
'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Stats } from '@/lib/models/types';

interface StatsRadarChartProps {
  stats: Stats;
}

// Logarithmic soft caps — reaching these values shows ~100% on the chart.
// Values beyond the cap are clamped to 100%.
// Using log scale so early progress (10→100) is just as visible as late progress (100→1000).
const LOG_CAPS = {
  willPower:    1000,  // log10: 10WP→33%  100WP→67%  1000→100%
  intelligence:  300,  // log10: 10→44%    50→72%     300→100%
  knowledge:    1000,
  luck:          500,  // log10: 10→38%    50→73%     500→100%
};

const STAT_META = {
  'Will Power':   { color: 'var(--stat-wp)' },
  'Intelligence': { color: 'var(--stat-int)' },
  'Knowledge':    { color: 'var(--stat-kn)' },
  'Luck':         { color: 'var(--stat-lk)' },
} as Record<string, { color: string }>;

/**
 * Logarithmic normalization to 0–100.
 * value=1  → 0%  (then floored to 5% for shape visibility)
 * value=10 → ~33% (with logCap=1000)
 * value=logCap → 100%
 */
function normalize(value: number, logCap: number): number {
  if (value <= 1) return 5;
  const n = (Math.log(value) / Math.log(logCap)) * 100;
  return Math.min(Math.max(n, 5), 100);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  const color = STAT_META[point.stat]?.color ?? 'var(--accent)';
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.5rem 0.75rem',
    }}>
      <p style={{ fontSize: '0.6875rem', color, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {point.stat}
      </p>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
        {Math.round(point.raw).toLocaleString()}
      </p>
    </div>
  );
}

export function StatsRadarChart({ stats }: StatsRadarChartProps) {
  const data = [
    { stat: 'Will Power',   value: normalize(stats.willPower   ?? 0, LOG_CAPS.willPower),    raw: stats.willPower   ?? 0 },
    { stat: 'Intelligence', value: normalize(stats.intelligence ?? 0, LOG_CAPS.intelligence), raw: stats.intelligence ?? 0 },
    { stat: 'Knowledge',    value: normalize(stats.knowledge    ?? 0, LOG_CAPS.knowledge),    raw: stats.knowledge    ?? 0 },
    { stat: 'Luck',         value: normalize(stats.luck         ?? 0, LOG_CAPS.luck),          raw: stats.luck         ?? 0 },
  ];

  const isBaseline = data.every(d => d.raw <= 1);

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data} outerRadius="65%">
          <PolarGrid stroke="rgba(34,211,238,0.1)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="stat"
            tick={({ x, y, payload }: any) => {
              const color = STAT_META[payload.value]?.color ?? '#8892a4';
              return (
                <text
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={11}
                  fontWeight={600}
                  letterSpacing="0.04em"
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="rgba(34,211,238,0.6)"
            fill="rgba(34,211,238,0.08)"
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>

      {isBaseline && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center' }}>
            Complete habits to fill your stats
          </p>
        </div>
      )}
    </div>
  );
}
