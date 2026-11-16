# Learnings

Ponytail v5.3.3 on Claude Code (Opus 5.5). Each claim is tagged **Observed** (seen or measured in this repo), **Assumption** (expected but not tested), or **Pending** (waits for the baseline).

## What Ponytail is

**Observed** (from the installed plugin files):
- No agents, workflows or planner. It is three things: session hooks that inject "smallest complete change" rules (also into subagents), 6 skills (`/ponytail`, `-review`, `-audit`, `-debt`, `-gain`, `-help`), and a per-session cost ledger ("band").
- Planning used ordinary Claude Code. Ponytail changed the stance, not the tools.

## Planning (ultra)

**Observed:**
- Ultra cut items from Claude's own first plan: localStorage, a remaining-items counter, React Testing Library + jsdom (3 dependencies), and a second reviewer.
- Result: 5 frozen requirements plus an explicit out-of-scope list.
- Trade-off accepted: no automated UI test. The UI is checked by hand.

## Implementation (full)

**Observed:**
- Scaffold trimmed: demo CSS, image assets and the template README were removed before the first build.
- One dependency added (`vitest`). No config files added.
- 3 source files. App code is 63 lines including blank lines (`todos.ts` 16, `App.tsx` 47). Tests are 50 lines, 9 tests, all on pure functions.
- A known limit is recorded in code as a `shortcut:` comment (`crypto.randomUUID` needs https or localhost).
- Every reply ended with "what was skipped / risk", which made each checkpoint easy to review.
- Differences from the plan: the Vite template now ships oxlint instead of ESLint. npm blocked the optional `fsevents` install script; tests and build are unaffected.

## Review and audit

**Observed:**
- `/ponytail-review`, checkpoint 2: 1 Should-fix (the `randomUUID` secure-context limit). It became the `shortcut:` comment.
- `/ponytail-review`, checkpoint 3: 2 Nice-to-haves: a redundant `type="button"` on Delete, and focus lost after Delete. Not applied.
- `/ponytail-audit`, whole repo: healthy, 0 Must-fix, 0 Should-fix. It repeated the same 2 Nice-to-haves.
- `/ponytail-debt`: 1 marker, 0 without an upgrade trigger.
- The review skills work on untracked files, but with no commits there is no real diff to show.

## Verification

| Item | Status |
|---|---|
| `npm test`: 9/9 pass · `npm run build` · `npm run lint` · `npm audit` 0 vulnerabilities | **Observed** |
| Manual: delete the right todo, reject whitespace, keyboard-only use | **Observed** (by the user) |
| Manual: Add-button click, visible trimming, label-click toggle | Not reported. Covered only by unit tests |
| Accessible names in an inspector or screen reader | Not checked |
| Other browsers, plain-http serving | Not checked |

## Numbers (Ponytail build)

| Metric | Value |
|---|---|
| App LOC (incl. blanks), hand-written | 63 |
| Test LOC / tests | 50 / 9 |
| Dependencies prod / dev | 2 / 8 |
| Ledger: cost / turns / agent minutes | $2.58 / 18 / 8.2 |
| Ledger: output tokens | 43,597 |

The ledger figures come from Ponytail's own band ledger. They cover the **whole session**: planning, build, audit, git and docs, up to the docs stage. They are not independently verified.

## Ledger limitations

**Observed:**
- One row per session, so there is no per-phase breakdown.
- The `level` column keeps only the latest level, so the cost of planning at ultra can't be separated.
- The task-name column captured raw prompt markup instead of a useful name.
- Rows update after each turn, so the latest turn is always missing.

## Process notes

**Observed:**
- Checkpoints 1–3 weren't committed individually, so they appear as one commit.
- A typo during metric collection wrote one temp file outside the repo. It was deleted right away.

## Assumptions

- Ponytail produced less code and fewer dependencies than normal mode would have. **Unproven until the baseline exists.**
- The benchmark figures in `/ponytail-gain` (from the Ponytail project) do not transfer to this repo. Per Ponytail's own guidance, no per-repo savings are claimed.

## Baseline comparison

**Pending.** Filled only from measured results of the `baseline/` build.
