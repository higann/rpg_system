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
      ],
      statsHistory: [], createdDate: { __type: 'Date', value: new Date().toISOString() }, lastActiveDate: { __type: 'Date', value: new Date().toISOString() }, version: 1
    };
    localStorage.setItem('life-rpg-profile', JSON.stringify(p));
  });
  await pg.reload();
  await pg.waitForLoadState('networkidle');
  await pg.waitForTimeout(1000);

  // Dashboard (with stat tooltip hover)
  await pg.screenshot({ path: `${SHOTS}/modal-dashboard.png` });

  // How it works modal
  await pg.click('text=How it works');
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SHOTS}/modal-formula.png` });
  // Close via the "Got it" button
  await pg.click('button:has-text("Got it")');
  await pg.waitForTimeout(300);

  // Edit profile modal
  await pg.click('text=Edit profile');
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SHOTS}/modal-profile.png` });
  await pg.click('button:has-text("Cancel")');
  await pg.waitForTimeout(300);

  // Habits → Edit habit modal
  await pg.click('button:has-text("Habits")');
  await pg.waitForTimeout(200);
  await pg.click('text=Manage Habits');
  await pg.waitForTimeout(300);
  await pg.click('button:has-text("Edit")');
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SHOTS}/modal-edit-habit.png` });
  await pg.click('button:has-text("Cancel")');
  await pg.waitForTimeout(300);

  // Skills → Add skill modal
  await pg.click('button:has-text("Skills")');
  await pg.waitForTimeout(200);
  await pg.click('button:has-text("Add Skill")');
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${SHOTS}/modal-add-skill.png` });

  await br.close();
  console.log('Modal shots saved');
})();
