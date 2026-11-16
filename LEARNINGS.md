# Learnings

## 1. Experiment overview

The same small React + TypeScript todo app was built twice with Claude Code (Opus 5.5) from one frozen `REQUIREMENTS.md`: once with the Ponytail v5.3.3 plugin active (`ponytail/`), and once in normal mode as a baseline (`baseline/`). Then the two builds were compared.

What Ponytail is (**Observed**, from the installed plugin files):
- No agents, workflows or planner. It has three parts: session hooks that inject "smallest complete change" rules (also into subagents), 6 skills (`/ponytail`, `-review`, `-audit`, `-debt`, `-gain`, `-help`), and a per-session cost ledger ("band").
- Planning used ordinary Claude Code. Ponytail changed the stance, not the tools.

How to read this document. Each claim is tagged:
- **Observed:** measured or seen in this experiment.
- **User-reported:** checked by hand by the experimenter, not re-verified.
- **Assumption:** reasoning that was not tested.

This is one run per build: observations, not a benchmark.

## 2. Setup and methodology

**Observed:**
- **Same requirements:** both builds use `REQUIREMENTS.md` with SHA-256 `4631f379…97bc3653`.
- **Same starting point:** both were scaffolded with `create-vite@9.3.4`, template `react-ts`.
- **Ponytail build:** planned at **ultra**, built at **full** in checkpoints (scaffold → logic + tests → UI → audit), with `/ponytail-review` after the logic and UI checkpoints, and `/ponytail-audit` plus `/ponytail-debt` at the end.
- **Baseline:** a separate directory and a fresh session, with the plugin disabled for that directory only (`claude plugin disable ponytail@synced --scope local`). Similar checkpoints: plan → scaffold → logic + tests → UI + tests → verify.
- **Ponytail was off for the baseline.** The baseline session log has 0 matches for every Ponytail marker (hook messages, injected rules, skill names, `shortcut:`). Its skill list had no Ponytail skills, and there were no hook entries. Remaining exposure: the word "Ponytail" in the header of `REQUIREMENTS.md` and in the directory name.
- **Same measurement for both:** the same commands on both builds (`npm test`, `npm run build`, `npm run lint`, `npm audit`), the same planted-bug procedure, the same review rubric, and token usage from Claude Code session logs (API calls de-duplicated by message id).

## 3. Planning and implementation

### Ponytail build

**Observed:**
- **Ultra planning** cut items from Claude's own first plan: localStorage, a remaining-items counter, React Testing Library + jsdom (3 dependencies), and a second reviewer. The result was 5 frozen requirements plus an explicit out-of-scope list.
- **Trade-off accepted at planning:** no automated UI test. The UI would be checked by hand. Its cost is measured in section 5.
- **Implementation at full:**
  - The scaffold was trimmed (demo CSS, image assets and the template README removed).
  - One dependency was added (`vitest`), with no new config files.
  - The logic lives in pure functions in `todos.ts`.
- **Known limit recorded in code:** `crypto.randomUUID` only works on https or localhost. It is marked with a `shortcut:` comment, which came from the checkpoint-2 review.
- **Every reply ended with "what was skipped / risk"**, which made each checkpoint easy to approve.
- **Differences from the plan:** the Vite template now ships oxlint rather than ESLint. npm blocked the optional `fsevents` install script; tests and build were unaffected.
- **Commits:** checkpoints 1–3 were not committed individually, so they appear as one commit.

### Baseline build

**Observed:**
- Started from the already-frozen requirements, so it did not repeat the scope decisions.
- Added React Testing Library (3 packages) and jsdom, and wrote UI tests next to the logic tests.
- The unused Vite template `README.md` was removed before publication. Application code, tests and dependencies are as the baseline session produced them.
- The local `.claude/` settings are excluded from git through `.git/info/exclude`.

## 4. Results

**Observed** (both builds measured with the same commands):

| | Ponytail | Baseline |
|---|---|---|
| R1–R5 met | yes | yes |
| App code lines, `todos.ts` + `App.tsx` (no blanks or comments) | 56 | 72 |
| Test code lines / tests | 42 / 9 (logic only) | 196 / 35 (logic + UI) |
| App + test code lines | 98 | 268 |
| Dependencies, prod / dev | 2 / 8 | 2 / 12 (+ Testing Library ×3, jsdom) |
| Installed packages / `node_modules` | 50 / 93 MB | 94 / 124 MB |
| Production JS bundle | 220.39 kB | 220.47 kB |
| Test run time (one run) | 61 ms | 638 ms |
| `npm test` · `build` · `lint` | pass · pass · pass | pass · pass · pass |
| `npm audit` | 0 vulnerabilities | 0 vulnerabilities |
| Known limits recorded in code | 1 `shortcut:` comment | none |

**Design differences (Observed):**
- The baseline passes the id into `addTodo`, so the function is deterministic. It also uses `readonly` types and doc comments.
- Ponytail calls `crypto.randomUUID()` inside `addTodo`.
- After rejected whitespace, the baseline leaves the text in the input and Ponytail clears it. Both satisfy R1.

**Manual browser checks:**

| Check | Ponytail | Baseline |
|---|---|---|
| Delete the right todo, reject whitespace, keyboard-only use | **User-reported** pass | **User-reported** pass |
| Add-button click, visible trimming, label-click toggle | Not reported (unit tests only) | Covered by UI tests |
| Screen reader / accessibility inspector, other browsers | Not checked | Not checked |

## 5. Test quality and planted bugs

**Observed.** Test counts say little about quality, so 10 single-line bugs were planted, one at a time, in throwaway copies of each build, and the test suite was run each time:

| Planted bug | Ponytail | Baseline |
|---|---|---|
| Logic: no trim · whitespace accepted · toggle ignores id · delete removes the wrong todo | 4/4 caught | 4/4 caught |
| UI: Delete loses its accessible name · input loses its label · Add stops submitting · checkbox loses its text label · input not cleared · checkbox wired to delete | 0/6 caught | 6/6 caught |
| **Total** | **4/10** | **10/10** |

- The logic tests are equally strong.
- **The baseline's clear advantage is automated UI and accessibility testing.** In the Ponytail build, an R4 accessibility regression would pass every automated check, and only manual testing would catch it. Ponytail's own rules list accessibility as something never to cut.

## 6. Review findings

**Ponytail's own tools during the build (Observed):**
- `/ponytail-review` after the logic checkpoint: 1 Should-fix (the `randomUUID` secure-context limit). It was resolved with the `shortcut:` comment.
- `/ponytail-review` after the UI checkpoint: 2 Nice-to-haves (focus lost after Delete, redundant `type="button"`). Not applied.
- `/ponytail-audit`: healthy, 0 Must-fix, 0 Should-fix. It repeated the 2 Nice-to-haves.
- `/ponytail-debt`: 1 marker, with an upgrade trigger.
- None of these flagged the missing UI test, because it was an agreed planning decision.

**Comparison review, same rubric for both builds (Observed).** Neither build has a Must-fix.

| Severity | Ponytail | Baseline |
|---|---|---|
| Should fix | UI and accessibility have no automated test | Unused Vite template README (**resolved**: removed) |
| Nice to have | Focus lost after Delete · redundant `type="button"` | The same two · `randomUUID` limit undocumented · ~12 lines of low-value tests |

**`/ponytail-audit` on `baseline/` after import (Observed):** healthy, 0 Must-fix, 0 Should-fix. Its 4 Nice-to-haves match the table above: the `randomUUID` limit undocumented, focus lost after Delete, redundant `type="button"`, and two tests that can't fail on their own (~12 lines).

## 7. Model usage

**Observed:**

| Phase | Ponytail: calls / output tokens | Baseline: calls / output tokens |
|---|---|---|
| Planning | 10 / 8,413 (includes inspecting the plugin) | 3 / 4,337 |
| Requirements + git init | 5 / 1,561 | n/a |
| **Build: scaffold, logic, UI, verify** | **21 / 20,935** | **22 / 18,912** |
| Build cache writes / cache reads | 26.1k / 1.81M | 27.0k / 1.36M |
| Git, docs, baseline setup | 32 / 34,258 | n/a |

- In the build phases, the Ponytail session used about 11% more output tokens than the baseline, while producing about a third of the app + test code (98 vs 268 lines). Much of its output went into plans, review reports and explanations rather than code.
- The Ponytail session carried more context per build call (about 86k vs 62k cached tokens), from its longer history and the injected rules.

## 8. Limitations

**Observed:**
- **One run per build.** With a single run, a small difference like the 11% token gap can't be told apart from run-to-run noise.
- **Inherited scope:** the baseline started from requirements already trimmed by Ponytail's ultra planning, so the size comparison does not show what a cold-start baseline would build.
- **Different prompts:** the Ponytail checkpoints included review and audit steps, and that session had a longer history.
- **Output tokens include reasoning and prose**, not just code.
- **Timing:** wall-clock times include human waiting and are not compared. Test run times are from one run each.
- **No dollar figures:** pricing was not verified. Ponytail's band ledger covers only its own session.
- **Ledger limits:**
  - One row per session, so there is no per-phase breakdown.
  - The level column keeps only the latest level.
  - The task name captured raw prompt markup.
  - Rows lag one turn behind.
  - This is why session logs were used for both builds.
- **Partial manual verification** and no screen-reader or cross-browser testing (section 4).
- **Rubric applied by Claude, not an independent reviewer:** the comparison review of both builds was done by Claude in the Ponytail session.

## 9. Conclusions

**Observed:**
- **Same functional outcome:** both builds meet R1–R5, have the same accessibility markup and bundle, and have no Must-fix issue.
- **Ponytail delivered on size:**
  - 56 vs 72 app code lines
  - 42 vs 196 test code lines
  - 8 vs 12 dev dependencies
  - 61 vs 638 ms test runs
  - its one known limit written into the code
- **That leanness had a measurable cost:** the "one test where there is logic" rule, combined with the ultra cut of UI testing, left R4 accessibility without automated protection (0/6 UI bugs caught vs 6/6). The baseline's UI tests are arguably the most valuable extra lines in either build.
- **No token or cost saving was shown:** build-phase usage was about the same, and the Ponytail session spent its largest share on planning, reviews and documentation.

**Assumption:**
- Ponytail's main contribution here was scope control during planning. Because the baseline inherited that scope, this run probably *understates* the size difference against a cold-start baseline.
- Ponytail's published benchmark figures (`/ponytail-gain`) do not transfer to this repo, and no per-repo savings are claimed.
- Testing either point needs repeated runs with independent planning.
