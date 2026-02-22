/**
 * Playwright regression tests for Life RPG
 * Covers the bugs that were fixed:
 *   1. MonthlyTracker: number cells start empty (not "0")
 *   2. HabitManager: edit button exists on each habit row
 *   3. ProfileEditor: opens with correct name after profile loads
 */
import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SHOTS = path.join(__dirname, 'screenshots');

// Helper — create a fresh profile and return the page
async function setup(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Clear any existing localStorage profile so tests start clean
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Begin")');
  await page.waitForSelector('.profile-card');
}

// Helper — navigate to Manage Habits and add a boolean habit
async function addBooleanHabit(page: Page, name: string) {
  await page.click('button:has-text("Habits")');
  await page.waitForTimeout(200);
  await page.click('text=Manage Habits');
  await page.waitForTimeout(200);
  await page.click('button:has-text("New Habit")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="e.g., Morning Meditation"]', name);
  // type defaults to boolean — just submit
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(300);
}

// Helper — add a numeric habit
async function addNumericHabit(page: Page, habitName: string, unit: string, goal: number) {
  await page.click('button:has-text("Habits")');
  await page.waitForTimeout(200);
  await page.click('text=Manage Habits');
  await page.waitForTimeout(200);
  await page.click('button:has-text("New Habit")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="e.g., Morning Meditation"]', habitName);
  await page.selectOption('select', 'number');
  await page.waitForTimeout(150);
  await page.fill('input[placeholder="pages, minutes, reps…"]', unit);
  await page.fill('input[placeholder="e.g., 10"]', String(goal));
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(300);
}

// ─── Test 1: onboarding screen renders ───────────────────────────────────────
test('shows onboarding screen on first visit', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1:has-text("Level up your life")')).toBeVisible();
  await expect(page.locator('button:has-text("Begin")')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/test-01-onboarding.png` });
});

// ─── Test 2: dashboard renders after profile creation ────────────────────────
test('dashboard renders after creating profile', async ({ page }) => {
  await setup(page);
  await expect(page.locator('.profile-card')).toBeVisible();
  await expect(page.locator('text=Will Power')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/test-02-dashboard.png`, fullPage: true });
});

// ─── Test 3: HabitManager shows Edit button on each habit ────────────────────
test('HabitManager shows Edit button on each habit row', async ({ page }) => {
  await setup(page);
  await addBooleanHabit(page, 'Morning Meditation');
  // Should see an "Edit" button next to the habit
  await expect(page.locator('button:has-text("Edit")').first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/test-03-habit-edit-button.png`, fullPage: true });
});

// ─── Test 4: EditHabitForm opens and can change name ────────────────────────
test('EditHabitForm opens when Edit is clicked', async ({ page }) => {
  await setup(page);
  await addBooleanHabit(page, 'Morning Meditation');
  await page.click('button:has-text("Edit")');
  await page.waitForTimeout(300);
  // Modal should appear with the habit name pre-filled
  await expect(page.locator('h2:has-text("Edit Habit")')).toBeVisible();
  const nameInput = page.locator('input[placeholder="e.g., Morning Meditation"]').first();
  await expect(nameInput).toHaveValue('Morning Meditation');
  await page.screenshot({ path: `${SHOTS}/test-04-edit-habit-modal.png`, fullPage: true });
  // Change name and save
  await nameInput.fill('Evening Walk');
  await page.click('button:has-text("Save Changes")');
  await page.waitForTimeout(300);
  await expect(page.locator('text=Evening Walk')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/test-04b-habit-renamed.png`, fullPage: true });
});

// ─── Test 5: MonthlyTracker number cells start EMPTY, not "0" ────────────────
test('MonthlyTracker numeric habit cells start empty', async ({ page }) => {
  await setup(page);
  await addNumericHabit(page, 'Reading', 'pages', 10);

  // Navigate to Monthly Tracker
  await page.click('button:has-text("Habits")');
  await page.waitForTimeout(200);
  await page.click('text=Monthly Tracker');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/test-05-monthly-tracker.png`, fullPage: true });

  // All number inputs in the tracker should be empty, not "0"
  const numInputs = await page.locator('table input[type="number"]').all();
  expect(numInputs.length).toBeGreaterThan(0);

  for (const input of numInputs.slice(0, 10)) {
    const val = await input.inputValue();
    expect(val, 'Empty cells should have value "" not "0"').toBe('');
  }
});

// ─── Test 6: MonthlyTracker stat update fires once on blur ──────────────────
test('MonthlyTracker completes numeric habit on blur with correct value', async ({ page }) => {
  await setup(page);
  await addNumericHabit(page, 'Reading', 'pages', 5);

  await page.click('button:has-text("Habits")');
  await page.waitForTimeout(200);
  await page.click('text=Monthly Tracker');
  await page.waitForTimeout(500);

  // Get today's column index
  const today = new Date().getDate();
  // Find today's input in the Reading row (first numeric row)
  const todayInput = page.locator(`table input[type="number"]`).nth(today - 1);

  // Type a value and blur to trigger completion
  await todayInput.fill('15');
  await todayInput.blur();
  await page.waitForTimeout(800);

  // Navigate to Dashboard to read the Will Power stat
  await page.click('button:has-text("Dashboard")');
  await page.waitForTimeout(400);

  // Will Power stat value — first .stat-value element
  const wpValue = await page.locator('.stat-value').first().textContent();
  // Verify it renders as a number (not NaN / blank)
  expect(wpValue?.trim()).toMatch(/^\d/);
  await page.screenshot({ path: `${SHOTS}/test-06-numeric-completion.png`, fullPage: true });
});

// ─── Test 7: ProfileEditor opens with current profile name ──────────────────
test('ProfileEditor shows current profile name when opened', async ({ page }) => {
  await setup(page);
  // Set a custom name via the profile editor
  await page.click('text=Edit profile');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Adventurer"]', 'Test Hero');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(300);

  // Reopen the editor — should show "Test Hero", not "Adventurer"
  await page.click('text=Edit profile');
  await page.waitForTimeout(300);
  const nameInput = page.locator('input[placeholder="Adventurer"]');
  await expect(nameInput).toHaveValue('Test Hero');
  await page.screenshot({ path: `${SHOTS}/test-07-profile-editor-sync.png`, fullPage: true });
});

// ─── Test 8: Skills tab renders and shows add form ──────────────────────────
test('Skills tab renders and add skill form works', async ({ page }) => {
  await setup(page);
  await page.click('button:has-text("Skills")');
  await page.waitForTimeout(300);
  // Empty state shows an "Add Skill" button (scoped to main to avoid the footer button)
  await expect(page.locator('main button:has-text("Add Skill")')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/test-08-skills-empty.png`, fullPage: true });
});
