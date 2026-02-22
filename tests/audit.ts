/**
 * Playwright audit script — screenshots current state to identify visual bugs
 * Run: npx playwright test tests/audit.ts --headed
 */
import { chromium } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SHOTS = path.join(__dirname, 'screenshots');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // ── 1. Onboarding screen ──────────────────────────────────────────────────
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/01-onboarding.png`, fullPage: true });
  console.log('✓ 01-onboarding.png');

  // ── 2. Create a profile ───────────────────────────────────────────────────
  await page.click('button:has-text("Begin Your Journey")');
  await page.waitForSelector('.profile-card');
  await page.screenshot({ path: `${SHOTS}/02-dashboard-empty.png`, fullPage: true });
  console.log('✓ 02-dashboard-empty.png');

  // ── 3. Add a skill ────────────────────────────────────────────────────────
  await page.click('button:has-text("+ Add Skill")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/03-skills-empty.png`, fullPage: true });
  console.log('✓ 03-skills-empty.png');

  // ── 4. Add Habit flow (navigate to Habits tab) ─────────────────────────────
  await page.click('button:has-text("+ Add Habit")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/04-habits-tab.png`, fullPage: true });
  console.log('✓ 04-habits-tab.png');

  // Click "Manage Habits" sub-tab → shows HabitManager
  await page.click('text=Manage Habits');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${SHOTS}/05-habit-manager.png`, fullPage: true });
  console.log('✓ 05-habit-manager.png');

  // ── 5. Create a boolean habit ─────────────────────────────────────────────
  await page.click('button:has-text("Add New Habit")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="e.g., Morning Meditation"]', 'Morning Meditation');
  await page.screenshot({ path: `${SHOTS}/06-add-habit-form.png`, fullPage: true });
  console.log('✓ 06-add-habit-form.png');
  await page.click('button:has-text("Create Habit")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/07-habit-created.png`, fullPage: true });
  console.log('✓ 07-habit-created.png');

  // ── 6. Create a numeric habit ─────────────────────────────────────────────
  await page.click('button:has-text("Add New Habit")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="e.g., Morning Meditation"]', 'Reading');
  await page.selectOption('select', 'number');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="e.g., pages, hours, minutes"]', 'pages');
  await page.fill('input[placeholder="e.g., 5 (for 5 minutes)"]', '10');
  await page.screenshot({ path: `${SHOTS}/08-add-numeric-habit.png`, fullPage: true });
  console.log('✓ 08-add-numeric-habit.png');
  await page.click('button:has-text("Create Habit")');
  await page.waitForTimeout(300);

  // ── 7. Monthly Tracker — check for 0s in empty cells ─────────────────────
  await page.click('text=Monthly Tracker');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/09-monthly-tracker-bug.png`, fullPage: true });
  console.log('✓ 09-monthly-tracker-bug.png — check for 0s in empty cells');

  // ── 8. Check numeric input values in cells ────────────────────────────────
  const numInputs = await page.locator('input[type="number"]').all();
  const values = await Promise.all(numInputs.map(i => i.inputValue()));
  console.log(`   Number cell values (first 5): ${values.slice(0, 5).join(', ')} — should be empty, not "0"`);

  await browser.close();
  console.log('\nAudit screenshots saved to tests/screenshots/');
}

main().catch(console.error);
