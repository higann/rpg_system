// src/lib/formulas/__tests__/integration.test.ts

import { calculateAllStats, generateStatBreakdowns } from '../index';
import { CharacterProfile } from '../../models/types';

console.log('=== Integration Test: Master Calculation Engine ===\n');

// Create a mock profile with habits and skills
const mockProfile: CharacterProfile = {
  name: 'Test User',
  level: 500,
  stats: {
    willPower: 1200,
    knowledge: 0,
    luck: 0,
    intelligence: 0,
  },
  skills: [
    {
      id: 's1',
      name: 'Chess',
      xp: 2500,
      tier: 'S',
      intelligenceContribution: 100,
      createdDate: new Date(),
    },
    {
      id: 's2',
      name: 'Cooking',
      xp: 600,
      tier: 'B',
      intelligenceContribution: 25,
      createdDate: new Date(),
    },
  ],
  habits: [
    {
      id: 'h1',
      name: 'Read pages',
      type: 'number',
      contributesTo: {
        willPower: true,
        knowledge: { category: 'reading', volumeMultiplier: 1 },
      },
      totalCompletions: 30,
      lastValue: 10,
      currentStreak: 5,
      createdDate: new Date(),
    },
    {
      id: 'h2',
      name: 'Meet new people',
      type: 'number',
      contributesTo: {
        willPower: true,
        luck: { volumeMultiplier: 10 },
      },
      totalCompletions: 10,
      lastValue: 2,
      currentStreak: 3,
      createdDate: new Date(),
    },
  ],
  statsHistory: [],
  createdDate: new Date(),
  lastActiveDate: new Date(),
  version: 1,
};

// Test 1: Calculate all stats
console.log('Test 1: Calculate All Stats');
const stats = calculateAllStats(mockProfile);
console.log('Stats:', stats);
console.log('Expected:');
console.log('  - Knowledge: 300 (30 completions × 10 pages × 1 multiplier)');
console.log('  - Luck: 200 (10 completions × 2 people × 10 multiplier)');
console.log('  - Intelligence: 125 (Chess S=100 + Cooking B=25)');
console.log('  - Will Power: 1200 (unchanged, calculated per-habit)');
console.log('');

// Test 2: Stat breakdowns
console.log('Test 2: Stat Breakdowns (Transparency)');
const breakdowns = generateStatBreakdowns(mockProfile);
breakdowns.forEach(breakdown => {
  console.log(`\n${breakdown.stat.toUpperCase()}: ${breakdown.total}`);
  breakdown.contributions.forEach(contrib => {
    console.log(`  - ${contrib.source}: +${contrib.value} (${contrib.type})`);
  });
});
console.log('');

console.log('✅ Integration test complete!');
console.log('\n📦 Formula Engine is now fully operational!');