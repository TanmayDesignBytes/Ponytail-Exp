# Methodology

How the Ponytail vs normal Claude Code comparison was run, and how far its results can be trusted. The results themselves are in [LEARNINGS.md](LEARNINGS.md).

## 1. Research question

*When the same small app is built from the same frozen requirements, what changes between Claude Code with Ponytail and Claude Code without it?*

We looked at:
- whether the requirements are met
- code size and dependencies
- how good the tests are
- review findings
- model usage

This is **one run per build**. It is a case study, not a benchmark.

## 2. Environment

| Item | Version or value |
|---|---|
| Date | 2026-11-16 |
| Claude Code | 2.1.325, checked during the experiment |
| Model | Claude Opus 5.5 (`claude-opus-5-5`) in both sessions, according to the session logs |
| Ponytail | v5.3.3, installed through account sync as `ponytail@synced` |
| Node.js | 24.18.0 |
| Scaffold | `create-vite@9.3.4`, template `react-ts` |
| Installed toolchain | Vite 8.3.8, Vitest 5.1.0, React 19.3.1, TypeScript 7.0.2, oxlint 1.93.0 |
| OS | macOS |

## 3. Frozen requirements

- [REQUIREMENTS.md](REQUIREMENTS.md) lists R1–R5 and an out-of-scope list. Its SHA-256 is `4631f379…97bc3653`.
- It was committed first, before any code, and **both builds used the identical file**. The hash was checked before the baseline started and again before the baseline was imported.
- The requirements came out of Ponytail's `ultra` planning stage. This matters; see §9.

## 4. Isolation

| | Ponytail build | Baseline build |
|---|---|---|
| Folder | its own project folder (now `ponytail/`) | a separate folder outside the Ponytail repo (now `baseline/`) |
| Session | one Claude Code session | a fresh Claude Code session (no resume) |
| Ponytail | enabled: `ultra` for planning, `full` for implementation | plugin **disabled for that folder only**: `claude plugin disable ponytail@synced --scope local` |
| Claude memory | per folder, so not shared | per folder, so not shared |
| User-level Claude settings and instructions | the same in both | the same |

**How we checked that Ponytail was really off in the baseline:**
1. `claude plugin list` showed `✘ disabled` in the baseline folder and `✔ loaded` in the Ponytail folder.
2. A snapshot of global settings and plugin files, taken before and after the disable, showed no change outside the baseline folder.
3. The baseline session log has **0 matches** for every Ponytail marker: the startup hook messages, the injected rules ("lazy senior developer"), the skill names, and `shortcut:`.
4. The skill list given to the baseline session (about 16k characters) contains no Ponytail skill, and the log has no hook entries.
5. No Ponytail level file was created for the baseline folder.
6. Neither the baseline prompts nor the replies mention Ponytail, apart from the folder name.

**Remaining exposure:** the word "Ponytail" appears in the header of `REQUIREMENTS.md` and in the folder name.

## 5. Planning and implementation checkpoints

Both builds were done in checkpoints. The user approved each one before the next began.

| Step | Ponytail build | Baseline build |
|---|---|---|
| Plan | Investigate the plugin; plan at `ultra`, which cut 4 items from Claude's own first plan | Plan from the frozen requirements |
| CP0 | Write and freeze `REQUIREMENTS.md`, `git init` | n/a (it was given the requirements) |
| CP1 | Scaffold, trim the template | Scaffold |
| CP2 | Logic + unit tests, then `/ponytail-review` | Logic + unit tests |
| CP3 | UI, then `/ponytail-review`, then a manual browser check by the user | UI + component tests |
| CP4 | `/ponytail-audit`, `/ponytail-debt`, metrics | Final verification |

The **prompts were not identical.** The Ponytail checkpoints asked for Ponytail reviews and audits, and that session also did a long plugin investigation before planning. The baseline prompts contained no Ponytail wording. See §9.

## 6. Verification

The same commands ran on both builds, from each project's folder:

```bash
npm test         # vitest run
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm audit
```

**Code-size counts** use only `src/`, and skip blank lines and lines that start with `//`, `/**` or `*`.

**Manual browser checks** were done by the user:
- For the Ponytail build, the user reported that deleting the right todo, rejecting whitespace and keyboard-only use all passed. The Add-button click, visible trimming and label-click toggle were not reported.
- For the baseline, the user reported that manual verification passed.
- These are **user-reported** and were not re-checked by Claude.

**Review rubric:**
- One rubric (Must fix / Should fix / Nice to have) was applied by Claude to both builds.
- `/ponytail-audit` was run on each build. For the baseline, it ran after the import, from the Ponytail-enabled repo, so the plugin was never enabled in the baseline's own folder.

## 7. Planted-bug testing

**Why:** counting tests says little about whether they catch bugs. Mutation testing, here called "planted bugs", checks that directly.

**Procedure:**
1. Copy each build's `src/`, `package.json` and `vite.config.ts` to a temporary folder, and link its installed packages.
2. Apply **one** single-line change (the planted bug).
3. Run `npx vitest run`. A failing run means the bug was **caught**. A passing run means it was **missed**.
4. Repeat for each of the 10 bugs. An unmodified copy was run first to confirm it passes.

**The 10 bugs:**
- **Logic:**
  - text not trimmed
  - whitespace-only text accepted
  - toggle ignores the id
  - delete keeps the wrong todo
- **UI:**
  - the Delete button loses its accessible name
  - the input loses its label
  - the Add button stops submitting
  - the checkbox loses its text label
  - the input is not cleared after adding
  - the checkbox is wired to delete

The bugs were applied to equivalent lines in both builds. The two builds name their functions slightly differently (`removeTodo` vs `deleteTodo`).

**Re-checked:** the same script was run again later, against the unchanged code, and gave identical results. A version adapted for public use is [`experiment/plant-bugs.sh`](experiment/plant-bugs.sh).

## 8. Model usage measurement

- **Source:** each session's Claude Code log, a local JSON-lines file.
- **What was counted:** every assistant message that carries usage data. Messages were de-duplicated by message id, because one response can appear on several log lines.
- **Fields summed:**
  - **input tokens:** new, uncached input
  - **cache writes:** input stored for reuse
  - **cache reads:** input reused from earlier turns, mostly the conversation history
  - **output tokens:** everything the model wrote, including reasoning and prose
- **Phases** were split at the timestamps of the user's checkpoint prompts.
- The Ponytail session's later turns (git work, docs and this comparison) were kept separate or left out.
- **Re-checked:** the same script was run again later and gave identical phase totals. A version adapted for public use is [`experiment/session-usage.py`](experiment/session-usage.py). It hides prompt text by default.
- **Not used:** dollar cost, because pricing was not verified. Ponytail's own ledger was also not used, since it only covers its own session and has no per-phase breakdown. Wall-clock time was not compared, because it includes time spent waiting for the user.

## 9. Confounding factors

A **confound** is something other than "Ponytail vs no Ponytail" that could explain a difference.

1. **Inherited scope (the largest).** The baseline started from requirements that Ponytail's `ultra` planning had already trimmed: no persistence, counter or filters. It never had to make those scope decisions itself. The size comparison therefore does not show what normal Claude Code would build when starting cold.
2. **Different prompts.** The Ponytail checkpoints included review and audit requests. The baseline's did not.
3. **Different session history.** The Ponytail session carried a long investigation and planning history into every call. That probably increased its context per call, but this was not measured separately.
4. **Claude reviewed its own work.** The same assistant built the Ponytail version, wrote the rubric and reviewed both builds. There was no independent reviewer.
5. **Interactive, human-gated sessions.** The user's approvals and wording shaped each step.

## 10. Reproducibility and its limits

- **Language models are not deterministic.** A repeat run with the same prompts can produce different code, tests and token counts.
- **With one run per build, small differences can't be told apart from chance.** That includes the 11% gap in build-phase output tokens.
- **Session logs are private** and are not published. The token figures can't be re-derived from this repo, but `experiment/session-usage.py` measures your own sessions the same way.
- **The planted-bug results can be repeated** by anyone with [`experiment/plant-bugs.sh`](experiment/plant-bugs.sh), since both builds and their tests are in this repo. See [experiment/README.md](experiment/README.md).
- **To repeat the whole experiment:**
  1. Freeze a requirements file.
  2. Build once with Ponytail enabled.
  3. Build once in a separate folder with the plugin disabled locally ([PONYTAIL_GUIDE.md §10](PONYTAIL_GUIDE.md#10-disabling-ponytail-for-one-project)).
  4. Run the same checks.
  5. For a fairer test, let **both** sides plan independently from the same initial request, and repeat several times.
