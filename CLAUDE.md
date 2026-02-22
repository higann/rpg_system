# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint

# Run individual test suites (no test runner - uses tsx directly)
npm run test:willpower
npm run test:stats
npm run test:level
npm run test:integration
npm run test:storage
npm run test:formulas   # Runs all formula tests
```

Tests are plain TypeScript files run via `tsx` with no framework (no Jest/Vitest). To run a single test file: `npx tsx src/lib/formulas/__tests__/willPower.test.ts`.

## Architecture

**Life RPG** is a single-page Next.js app (App Router) that gamifies habit tracking. All data lives in `localStorage` — no backend, no database.

### Data flow

```
localStorage ──► ProfileContext (global state) ──► hooks ──► components
                        ▲
                        │ auto-saves on every profile state change
```

`ProfileContext` (`src/contexts/ProfileContext.tsx`) is the single source of truth. It loads from localStorage on mount, recalculates all stats via `calculateAllStats()` after every profile update, and auto-saves. All mutations (add/update/delete habits and skills) must go through context methods.

### Core data model (`src/lib/models/types.ts`)

- **`CharacterProfile`** — top-level object stored in localStorage. Contains `stats`, `habits[]`, `skills[]`, `statsHistory[]`, `level`, and `version`.
- **`Habit`** — `boolean` or `number` type. Always contributes to Will Power; optionally contributes to Knowledge or Luck via `contributesTo`. Can be linked to a Skill for XP.
- **`Skill`** — has `xp`, `tier` (D/C/B/A/S), and a cached `intelligenceContribution`.
- **`Stats`** — `{ willPower, knowledge, luck, intelligence }`.

### Stat formulas (`src/lib/formulas/`)

| Stat | Formula |
|---|---|
| **Will Power** | ELO-based with habit aging. Freshness = `1 / (1 + completions/50)`. New habits yield big gains; established habits yield small gains but heavy miss penalties. |
| **Knowledge** | Linear sum: `totalCompletions × volumeMultiplier` for habits with `contributesTo.knowledge`. |
| **Luck** | Linear sum: same pattern as Knowledge. |
| **Intelligence** | Sum of `intelligenceContribution` from all skills (D=5, C=10, B=25, A=50, S=100 points). |
| **Character Level** | ELO on daily completion rate vs. expected rate (`level/1000`). Starting level = 100. |

`src/lib/formulas/index.ts` is the master calculation engine; `calculateAllStats()` is the entry point.

### Habit completion logic (`src/lib/actions/habitActions.ts`)

`performHabitCompletion()` is the core action. It:
1. Guards against double-completion (same day)
2. Checks if the goal is met (boolean: value===1; number: value >= dailyGoal)
3. Only awards Will Power, XP, and streak increments when goal is met
4. Updates linked skill XP and promotes tier if threshold crossed
5. Returns an updated immutable profile snapshot — **does not mutate in place**

### Hooks

- `useProfile` / `useProfileContext` — raw profile and context access
- `useStats` — derives stats from context
- `useHabits` — wraps habit CRUD + `completeHabit` / `missHabit` / `runDailyCheck`
- `useSkills` — wraps skill CRUD

### UI structure

Tab-based single page (`src/app/page.tsx`): **Dashboard** | **Habits** | **Skills**.

- Dashboard: profile card, stats grid, skills list, radar chart
- Habits tab has sub-tabs: Monthly Tracker and Manage Habits
- Skills tab: SkillsGrid with add/edit

Components are organized by domain under `src/components/`: `Charts/`, `Habits/`, `Navigation/`, `Profile/`, `Skills/`, `UI/`.

### Styling

Tailwind CSS v4 (`@tailwindcss/postcss`). Global CSS variables and custom classes (`.btn-primary`, `.profile-card`, `.avatar-circle`, `.tier-badge`, `.space-background`) are defined in `src/app/globals.css`. Tier badge colors follow `.tier-S`, `.tier-A`, etc.

### Storage versioning

`STORAGE_VERSION = 1` in `localStorage.ts`. Dates are serialized as `{ __type: 'Date', value: ISO string }` to survive JSON round-trips. A version mismatch logs a warning; migration logic is a future placeholder.
