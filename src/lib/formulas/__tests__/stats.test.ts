// src/lib/formulas/__tests__/stats.test.ts

/**
 * Manual test runner
 * Run with: npx tsx src/lib/formulas/__tests__/stats.test.ts
 * Or use: npm test -- stats
 */

import { calculateKnowledge, calculateKnowledgeByCategory } from '../knowledge';
import { calculateLuck } from '../luck';
import { calculateIntelligence, determineSkillTier, getXpToNextTier } from '../intelligence';
import { Habit, Skill } from '../../models/types';

console.log('=== Knowledge, Luck & Intelligence Tests ===\n');

// Test Knowledge
console.log('Test 1: Knowledge Calculation');
const knowledgeHabits: Habit[] = [
  {
    id: '1',
    name: 'Read pages',
    type: 'number',
    contributesTo: {
      willPower: true,
      knowledge: { category: 'reading', volumeMultiplier: 1 },
    },
    totalCompletions: 30, // 30 days
    lastValue: 10, // 10 pages per day
    currentStreak: 5,
    createdDate: new Date(),
  },
  {
    id: '2',
    name: 'Code practice',
    type: 'number',
    unit: 'hours',
    contributesTo: {
      willPower: true,
      knowledge: { category: 'coding', volumeMultiplier: 5 },
    },
    totalCompletions: 20,
    lastValue: 2, // 2 hours per day
    currentStreak: 3,
    createdDate: new Date(),
  },
];

console.log('Knowledge habits:', knowledgeHabits.map(h => h.name));
console.log('Total Knowledge:', calculateKnowledge(knowledgeHabits));
console.log('By Category:', calculateKnowledgeByCategory(knowledgeHabits));
console.log('');

// Test Luck
console.log('Test 2: Luck Calculation');
const luckHabits: Habit[] = [
  {
    id: '3',
    name: 'Meet new people',
    type: 'number',
    contributesTo: {
      willPower: true,
      luck: { volumeMultiplier: 10 },
    },
    totalCompletions: 15,
    lastValue: 2, // 2 people per day
    currentStreak: 2,
    createdDate: new Date(),
  },
];

console.log('Luck habits:', luckHabits.map(h => h.name));
console.log('Total Luck:', calculateLuck(luckHabits));
console.log('');

// Test Intelligence
console.log('Test 3: Intelligence Calculation');
const skills: Skill[] = [
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
    xp: 1200,
    tier: 'A',
    intelligenceContribution: 50,
    createdDate: new Date(),
  },
  {
    id: 's3',
    name: 'Guitar',
    xp: 300,
    tier: 'C',
    intelligenceContribution: 10,
    createdDate: new Date(),
  },
];

console.log('Skills:', skills.map(s => `${s.name} (${s.tier}, ${s.xp} XP)`));
console.log('Total Intelligence:', calculateIntelligence(skills));
console.log('');

// Test Skill Tier Determination
console.log('Test 4: Skill Tier Boundaries');
console.log('100 XP:', determineSkillTier(100), '(should be D)');
console.log('250 XP:', determineSkillTier(250), '(should be C)');
console.log('500 XP:', determineSkillTier(500), '(should be B)');
console.log('1000 XP:', determineSkillTier(1000), '(should be A)');
console.log('2500 XP:', determineSkillTier(2500), '(should be S)');
console.log('');

// Test XP to Next Tier
console.log('Test 5: XP to Next Tier');
console.log('150 XP needs:', getXpToNextTier(150), 'more (to reach C at 250)');
console.log('600 XP needs:', getXpToNextTier(600), 'more (to reach A at 1000)');
console.log('2600 XP needs:', getXpToNextTier(2600), '(already S tier)');
console.log('');

console.log('✅ All tests complete!');