import { chromium } from '@playwright/test';
import path from 'path';
const SHOTS = path.join(__dirname, 'screenshots');
const B = 'http://localhost:3000';

(async () => {
  const br = await chromium.launch();
  const pg = await br.newPage();
  await pg.setViewportSize({ width: 1400, height: 900 });
  await pg.goto(B);
  await pg.waitForLoadState('networkidle');
  await pg.evaluate(() => {
    const p = {
      name: 'Adventurer', level: 100,
      stats: { willPower: 1200, knowledge: 340, luck: 80, intelligence: 55 },
      skills: [{ id: 's1', name: 'Python', xp: 620, tier: 'B', intelligenceContribution: 25, createdDate: { __type: 'Date', value: new Date().toISOString() } }],
      habits: [
        { id: 'h1', name: 'Morning Meditation', type: 'boolean', contributesTo: { willPower: true }, totalCompletions: 14, currentStreak: 4, createdDate: { __type: 'Date', value: new Date().toISOString() } },
        { id: 'h2', name: 'Reading', type: 'number', unit: 'pages', dailyGoal: 10, contributesTo: { willPower: true, knowledge: { category: 'reading', volumeMultiplier: 1 } }, totalCompletions: 9, currentStreak: 2, createdDate: { __type: 'Date', value: new Date().toISOString() } }
      ],
      statsHistory: [], createdDate: { __type: 'Date', value: new Date().toISOString() }, lastActiveDate: { __type: 'Date', value: new Date().toISOString() }, version: 1
    };
    localStorage.setItem('life-rpg-profile', JSON.stringify(p));
  });
  await pg.reload();
  await pg.waitForLoadState('networkidle');
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${SHOTS}/AFTER-dashboard.png`, fullPage: true });

  // Habits tab
  await pg.click('button:has-text("Add Habit")');
  await pg.waitForTimeout(600);
  await pg.click('text=Manage Habits');
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${SHOTS}/AFTER-habits.png`, fullPage: true });

  // Skills tab
  await pg.click('button:has-text("Add Skill")');
  await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${SHOTS}/AFTER-skills.png`, fullPage: true });

  // Monthly tracker
  await pg.click('button:has-text("Add Habit")');
  await pg.waitForTimeout(300);
  await pg.click('text=Monthly Tracker');
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SHOTS}/AFTER-tracker.png`, fullPage: true });

  await br.close();
  console.log('After shots saved');
})();
