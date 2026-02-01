// src/lib/formulas/__tests__/willPower.test.ts

import {
    calculateHabitFreshness,
    calculateExpected,
    calculateWillPowerChange,
    calculateTotalWillPower,
  } from '../willPower';
  
  /**
   * Manual test runner
   * Run with: npx tsx src/lib/formulas/__tests__/willPower.test.ts
   * (You'll need to install tsx: npm install -D tsx)
   */
  
  console.log('=== Will Power Formula Tests ===\n');
  
  // Test 1: Habit Freshness
  console.log('Test 1: Habit Freshness');
  console.log('10 completions:', calculateHabitFreshness(10)); // Expected: ~0.83
  console.log('50 completions:', calculateHabitFreshness(50)); // Expected: 0.50
  console.log('100 completions:', calculateHabitFreshness(100)); // Expected: ~0.33
  console.log('500 completions:', calculateHabitFreshness(500)); // Expected: ~0.09
  console.log('');
  
  // Test 2: Expected Performance
  console.log('Test 2: Expected Performance');
  console.log('Freshness 0.83:', calculateExpected(0.83)); // Expected: ~0.34
  console.log('Freshness 0.50:', calculateExpected(0.50)); // Expected: 0.60
  console.log('Freshness 0.33:', calculateExpected(0.33)); // Expected: ~0.74
  console.log('Freshness 0.09:', calculateExpected(0.09)); // Expected: ~0.93
  console.log('');
  
  // Test 3: Will Power Change - New Habit (10 completions)
  console.log('Test 3: New Habit (10 completions)');
  console.log('Complete:', calculateWillPowerChange(1, 10)); // Expected: ~+21
  console.log('Miss:', calculateWillPowerChange(0, 10)); // Expected: ~-11
  console.log('');
  
  // Test 4: Will Power Change - Established Habit (100 completions)
  console.log('Test 4: Established Habit (100 completions)');
  console.log('Complete:', calculateWillPowerChange(1, 100)); // Expected: ~+9
  console.log('Miss:', calculateWillPowerChange(0, 100)); // Expected: ~-23
  console.log('');
  
  // Test 5: Will Power Change - Automatic Habit (500 completions)
  console.log('Test 5: Automatic Habit (500 completions)');
  console.log('Complete:', calculateWillPowerChange(1, 500)); // Expected: ~+2
  console.log('Miss:', calculateWillPowerChange(0, 500)); // Expected: ~-30
  console.log('');
  
  // Test 6: Total Will Power Calculation
  console.log('Test 6: Total Will Power');
  const currentWP = 1000;
  const changes = [21, 9, 2, -11]; // Mixed results
  console.log('Starting Will Power:', currentWP);
  console.log('Changes:', changes);
  console.log('New Will Power:', calculateTotalWillPower(currentWP, changes));
  console.log('');
  
  console.log('✅ All tests complete!');