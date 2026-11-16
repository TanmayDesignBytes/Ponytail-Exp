# Experiment scripts

The two analysis scripts behind the evidence in [LEARNINGS.md](../LEARNINGS.md). They are the original scripts from the experiment, **adapted for public use**:
- paths are now arguments
- private output is hidden by default
- `plant-bugs.sh` no longer writes into the app folders

The measurement logic is unchanged. Both adapted scripts were re-run and reproduced the published results exactly. The method is described in [METHODOLOGY.md](../METHODOLOGY.md) §7–§8.

## `plant-bugs.sh`: planted-bug (mutation) check

**What it does:**
1. Copies each build's `src/`, `package.json` and `vite.config.ts` into a temporary folder.
2. Plants **one** single-line bug, then runs the build's own tests. If the tests fail, the bug was *caught*; if they pass, it was *missed*.
3. Repeats this for 10 bugs: 4 in the logic, 6 in the UI and accessibility.
4. Removes the temporary folder when it finishes, even after an error.

The original `ponytail/` and `baseline/` folders are never modified. The script links each app's installed packages read-only and turns off Vitest's caches.

**Prerequisites:** bash, sed, Node.js 24, and dependencies installed in both apps:

```bash
(cd ponytail && npm ci) && (cd baseline && npm ci)
```

**Run** from the repository root:

```bash
experiment/plant-bugs.sh                         # uses ./ponytail and ./baseline
experiment/plant-bugs.sh path/to/ponytail path/to/baseline
```

**Expected result:** `ponytail` catches **4/10** (logic only) and `baseline` catches **10/10**. It takes about a minute.

**Limitations:**
- The bug edits are matched to these two builds' exact source lines. On other code, a line reports `MUTANT NOT APPLIED`.
- A planted bug that breaks compilation also counts as "caught".
- Tested on macOS only. The `sed` handling supports Linux, but that hasn't been run.

## `session-usage.py`: token usage from a session log

**What it does:** reads one Claude Code session log and prints:
- API calls, counted once per message id
- input, cache-write, cache-read and output token totals
- the timestamp of each user turn
- optionally, totals per phase between timestamps you choose

**Run:**

```bash
python3 -I experiment/session-usage.py SESSION.jsonl
python3 -I experiment/session-usage.py SESSION.jsonl --phases 2026-11-16T06:26:55.058Z,2026-11-16T06:28:35.704Z
python3 -I experiment/session-usage.py SESSION.jsonl --show-prompts   # opt-in, see privacy below
```

**Input:** Claude Code stores each session as a `.jsonl` file under `~/.claude/projects/<project-folder>/`. Pick the session you want to measure. To choose phase boundaries, run it once and read the user-turn timestamps.

**Privacy:**
- Session logs contain your **entire conversation**. Never commit or share them.
- By default the script prints prompt **timestamps only**. `--show-prompts` also prints the first 90 characters of each prompt. Use it only on your own screen.

**Limitations:**
- Output tokens include reasoning and written explanations, not just code.
- Dollar cost is not calculated.
- The log format belongs to Claude Code and may change between versions.

## What you can reproduce yourself

| Result | Reproducible from this repo? |
|---|---|
| Tests, build, lint, `npm audit` for both builds | Yes: run the commands in the [README](../README.md#12-reproduce-it) |
| Code-size and dependency figures | Yes: count the files in `ponytail/` and `baseline/` |
| Planted bugs: 4/10 vs 10/10 | **Yes**: `plant-bugs.sh` |
| Per-phase token figures | **No.** The original session logs are private, because they contain the full conversations, so they aren't included. You can measure *your own* sessions with `session-usage.py`. |
| Manual browser checks | Partly: repeat them by hand; the original results were user-reported |
