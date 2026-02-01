// src/lib/storage/__tests__/localStorage.test.ts

import {
    initializeProfile,
    saveProfile,
    loadProfile,
    hasProfile,
    deleteProfile,
  } from '../localStorage';
  
  console.log('=== localStorage Tests ===\n');
  
  // Test 1: Initialize new profile
  console.log('Test 1: Initialize Profile');
  const newProfile = initializeProfile('Gaurav');
  console.log('Name:', newProfile.name);
  console.log('Starting Level:', newProfile.level);
  console.log('Starting Will Power:', newProfile.stats.willPower);
  console.log('Has habits:', newProfile.habits.length === 0 ? 'No (correct)' : 'Yes');
  console.log('');
  
  // Test 2: Save profile
  console.log('Test 2: Save Profile');
  saveProfile(newProfile);
  console.log('Profile saved. Checking if exists:', hasProfile());
  console.log('');
  
  // Test 3: Load profile
  console.log('Test 3: Load Profile');
  const loaded = loadProfile();
  if (loaded) {
    console.log('✅ Profile loaded successfully');
    console.log('Name matches:', loaded.name === newProfile.name);
    console.log('Level matches:', loaded.level === newProfile.level);
    console.log('Stats match:', JSON.stringify(loaded.stats) === JSON.stringify(newProfile.stats));
    console.log('createdDate is Date:', loaded.createdDate instanceof Date);
  } else {
    console.log('❌ Failed to load profile');
  }
  console.log('');
  
  // Test 4: Modify and save
  console.log('Test 4: Modify and Re-save');
  if (loaded) {
    loaded.level = 550;
    loaded.stats.willPower = 1250;
    loaded.habits.push({
      id: 'h1',
      name: 'Test Habit',
      type: 'boolean',
      contributesTo: { willPower: true },
      totalCompletions: 5,
      currentStreak: 2,
      createdDate: new Date(),
    });
    
    saveProfile(loaded);
    
    const reloaded = loadProfile();
    console.log('Level updated:', reloaded?.level === 550);
    console.log('Will Power updated:', reloaded?.stats.willPower === 1250);
    console.log('Habit added:', reloaded?.habits.length === 1);
  }
  console.log('');
  
  // Test 5: Delete profile
  console.log('Test 5: Delete Profile');
  deleteProfile();
  console.log('Profile deleted. Still exists:', hasProfile());
  const afterDelete = loadProfile();
  console.log('Load after delete:', afterDelete === null ? 'null (correct)' : 'still exists (error)');
  console.log('');
  
  console.log('✅ All localStorage tests complete!');
  console.log('\n⚠️ Note: These tests modify browser localStorage.');
  console.log('Run in browser console or add to package.json as test script.');