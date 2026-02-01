// src/lib/formulas/__tests__/characterLevel.test.ts

import {
    calculateCharacterLevelChange,
    applyCharacterLevelChange,
    calculateCompletionRate,
    getExpectedCompletionRate,
  } from '../characterLevel';
  
  console.log('=== Character Level Formula Tests ===\n');
  
  // Test 1: Completion Rate Calculation
  console.log('Test 1: Completion Rate');
  console.log('7/10 habits:', calculateCompletionRate(7, 10)); // Expected: 0.7
  console.log('10/10 habits:', calculateCompletionRate(10, 10)); // Expected: 1.0
  console.log('0/10 habits:', calculateCompletionRate(0, 10)); // Expected: 0.0
  console.log('');
  
  // Test 2: Expected Performance at Different Levels
  console.log('Test 2: Expected Completion Rates');
  console.log('Level 100:', getExpectedCompletionRate(100), '(10%)');
  console.log('Level 300:', getExpectedCompletionRate(300), '(30%)');
  console.log('Level 500:', getExpectedCompletionRate(500), '(50%)');
  console.log('Level 800:', getExpectedCompletionRate(800), '(80%)');
  console.log('Level 900:', getExpectedCompletionRate(900), '(90%)');
  console.log('');
  
  // Test 3: Level Change - Early Game (Level 100)
  console.log('Test 3: Early Game (Level 100, expected 10%)');
  console.log('Complete 50% (0.5):', calculateCharacterLevelChange(0.5, 100)); // Expected: ~+20
  console.log('Complete 20% (0.2):', calculateCharacterLevelChange(0.2, 100)); // Expected: ~+5
  console.log('Complete 0% (0.0):', calculateCharacterLevelChange(0.0, 100)); // Expected: ~-5
  console.log('');
  
  // Test 4: Level Change - Mid Game (Level 500)
  console.log('Test 4: Mid Game (Level 500, expected 50%)');
  console.log('Complete 90% (0.9):', calculateCharacterLevelChange(0.9, 500)); // Expected: ~+20
  console.log('Complete 50% (0.5):', calculateCharacterLevelChange(0.5, 500)); // Expected: 0
  console.log('Complete 20% (0.2):', calculateCharacterLevelChange(0.2, 500)); // Expected: ~-15
  console.log('');
  
  // Test 5: Level Change - End Game (Level 800)
  console.log('Test 5: End Game (Level 800, expected 80%)');
  console.log('Complete 100% (1.0):', calculateCharacterLevelChange(1.0, 800)); // Expected: ~+10
  console.log('Complete 90% (0.9):', calculateCharacterLevelChange(0.9, 800)); // Expected: ~+5
  console.log('Complete 70% (0.7):', calculateCharacterLevelChange(0.7, 800)); // Expected: ~-5
  console.log('Complete 50% (0.5):', calculateCharacterLevelChange(0.5, 800)); // Expected: ~-15
  console.log('');
  
  // Test 6: Apply Level Change
  console.log('Test 6: Applying Level Changes');
  const level = 500;
  const change1 = calculateCharacterLevelChange(0.9, level);
  console.log(`Level ${level} + change ${change1} =`, applyCharacterLevelChange(level, change1));
  
  const change2 = calculateCharacterLevelChange(0.2, level);
  console.log(`Level ${level} + change ${change2} =`, applyCharacterLevelChange(level, change2));
  console.log('');
  
  // Test 7: Floor at 0 (can't go negative)
  console.log('Test 7: Level Floor');
  console.log('Level 10 - 50 change:', applyCharacterLevelChange(10, -50), '(floored at 0)');
  console.log('');
  
  console.log('✅ All tests complete!');