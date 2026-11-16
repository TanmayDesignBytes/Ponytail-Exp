# Ponytail guide

A guide to [Ponytail](https://github.com/DietrichGebert/ponytail) **v5.3.3** for Claude Code, written for someone who has never used it. It starts with the basics and ends with configuration details.

Every statement carries one of four labels:

| Label | Meaning |
|---|---|
| **[Docs]** | Behaviour described in Ponytail's own files at tag `v5.3.3` (linked). |
| **[Claim]** | A result Ponytail's author reports from their own benchmark. Not checked by us. |
| **[Tested]** | Something we used and saw work in this experiment. |
| **[Untested]** | Documented by Ponytail, but not tried in this experiment. |

Later versions of Ponytail may behave differently. All upstream links are pinned to `v5.3.3`.

---

## 1. Concepts in plain English

- **Claude Code:** Anthropic's coding assistant that runs in your terminal or desktop app.
- **Plugin:** an add-on that changes how Claude Code behaves. Ponytail is a plugin.
- **Hook:** a small script Claude Code runs automatically at certain moments, for example when a session starts or when you send a message. Ponytail uses hooks to slip its rules into the conversation.
- **Skill:** a named set of instructions Claude can load on demand, usually through a slash command like `/ponytail-review`.
- **Subagent:** a helper agent Claude can start for a side task.
- **YAGNI** ("you aren't gonna need it"): the idea that you shouldn't build features or flexibility before anyone needs them. Ponytail is YAGNI turned into instructions.

**What Ponytail is, in one sentence:** a set of instructions that tells Claude to act like "a lazy senior developer" and make *the smallest change that fully solves the task*, without cutting validation, error handling, security or accessibility. **[Docs]** ([SKILL.md](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/skills/ponytail/SKILL.md))

Ponytail adds no new abilities to Claude. It changes Claude's *behaviour*. **[Tested]**

---

## 2. Installing

The official install for Claude Code is two separate prompts. **[Docs]** ([README](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/README.md#install), [INSTALL.md](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/INSTALL.md))

```
/plugin marketplace add DietrichGebert/ponytail
```
```
/plugin install ponytail@ponytail
```

- **[Untested]** We did not run these commands. In our experiment the plugin arrived through account sync and was listed as `ponytail@synced`.
- **Check that it loaded** **[Tested]:** run this in a terminal:
  ```
  claude plugin list
  ```
  Ponytail should show `Status: ✔ loaded`. The id it shows (for example `ponytail@ponytail` or `ponytail@synced`) is the one to use in the commands below.
- **Install only from the official source.** The author says to install only from `DietrichGebert/ponytail` on GitHub or `@dietrichgebert/ponytail` on npm. **[Docs]**

---

## 3. Turning it on and off

Ponytail is **on by default** at the `full` level in every new session. **[Docs]** ([ponytail-config.js](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/hooks/ponytail-config.js))

| You want to… | Do this | Label |
|---|---|---|
| Switch level for this session | `/ponytail lite`, `/ponytail full`, `/ponytail ultra` | **[Tested]** (`full` and `ultra`) |
| Turn it off for this session | `/ponytail off`, or send **exactly** `stop ponytail` or `normal mode` as the whole message | **[Untested]** |
| Turn it back on | `/ponytail` (with no level) | **[Untested]** |
| See the current level | `/ponytail` while it is on | **[Docs]** |
| Change the default for new sessions | `/ponytail default lite` (or `full`, `ultra`, `off`) | **[Untested]** |
| Set the default without a command | `PONYTAIL_DEFAULT_MODE=ultra`, or `{"defaultMode": "lite"}` in `~/.config/ponytail/config.json` | **[Untested]** |

How the default is chosen: the environment variable wins, then the config file, then `full`. **[Docs]**

Some details worth knowing **[Docs]**:
- "stop ponytail" and "normal mode" only work as the **whole** message. A request like "add a normal mode toggle" does not turn Ponytail off.
- A level change lasts for **the current session only**, unless you use `/ponytail default`.
- The level is stored **per project folder**, so two sessions in the same folder share one level.
- When Claude Code compacts (summarises) a long conversation, Ponytail keeps the level you were on.

---

## 4. Levels

There are three active levels plus `off`. **There is no "Basic" level.** **[Docs]**

The important detail: **all active levels get the same rules.** The only difference is one row of a table that is chosen for the current level. The code that builds the injected text keeps only that row and drops the other two. **[Docs]** ([ponytail-instructions.js](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/hooks/ponytail-instructions.js))

| Level | The level-specific guidance (exact wording) | Tested here? |
|---|---|---|
| `lite` | "Build what was asked. Name the smaller option in one line and let the user pick." | **[Untested]** |
| `full` (default) | "The rules above. Default." | **[Tested]**: whole implementation |
| `ultra` | "Also question the request: before building, push back on any part the need does not justify." | **[Tested]**: planning only |
| `off` | No rules injected. The level files are deleted. | **[Untested]** (we disabled the plugin instead, see §10) |

**When each level might fit.** This is guidance, not a test result.
- **`lite`:** you know exactly what you want and only want to hear about a simpler option, not have it imposed.
- **`full`:** everyday coding where you want lean changes by default.
- **`ultra`:** before you commit to a plan, when you suspect the request itself is too big. In our experiment, `ultra` cut four items from Claude's own first plan: saving to localStorage, a remaining-items counter, a UI-testing toolset (3 packages), and a second reviewer. **[Tested]** That last cut later turned out to have a cost (see [LEARNINGS.md §5](LEARNINGS.md#5-test-quality-and-planted-bugs)).

---

## 5. The rules Ponytail injects

These are the core rules, summarised from [SKILL.md](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/skills/ponytail/SKILL.md). **[Docs]**

1. **Read first.** Before writing, list every place a change must reach: callers, tests, fixtures, config, exports.
2. **The ladder:** take the first option that fully works.
   1. Does it need to exist at all?
   2. Is it already in this codebase?
   3. Does the standard library or platform already do it?
   4. Does an installed dependency already do it?
   5. Can it be one clear line?
   6. Otherwise, write the minimum code that works.
3. **No unrequested extras:** no abstractions, wrappers, options or "for later" code nobody asked for.
4. **Never cut:** validation at trust boundaries, error handling that prevents data loss, security, accessibility, hardware calibration, or anything the user asked for.
5. **Test rule:** new non-trivial logic (a branch, a loop, a parser, money, security, or a whole new app) leaves **one small test** or an assert-based self-check. Trivial changes need none.
6. **Shortcut comments:** a known limit is marked in the code as `shortcut: <the limit>, <when to upgrade>`.
7. **Reply ending:** every reply ends with one or two lines saying what was skipped or not checked, and any risk.

What we saw **[Tested]**:
- The `full` build had 2 production and 8 dev dependencies, adding only `vitest` to the template.
- One `shortcut:` comment was written: `crypto.randomUUID` only works on https or localhost.
- Every reply ended with "what I skipped / risk".

The test rule is worth a careful read. It asks for *one small* test where there is *logic*. In our build that produced tests for the logic functions only, and none for the UI. See [LEARNINGS.md §5](LEARNINGS.md#5-test-quality-and-planted-bugs).

---

## 6. Skills and commands

| Command | What it does | Changes code? | Tested here? |
|---|---|---|---|
| `/ponytail [lite\|full\|ultra\|off]` | Set or report the level | No | **[Tested]** |
| `/ponytail-review` | Reviews a change like "the senior dev who gets paged when it breaks": bugs, security, load, missing tests, speed, what to cut. Target: uncommitted, staged, a branch, or a PR link. | No | **[Tested]** ×2 |
| `/ponytail-audit` | The same checks for a whole repo or folder, ranked | No | **[Tested]** ×2 |
| `/ponytail-debt` | Collects every `shortcut:` comment into a list | No | **[Tested]** |
| `/ponytail-gain` | Shows the author's benchmark scoreboard | No | **[Untested]** (file read only) |
| `/ponytail-help` | Quick reference card | No | **[Untested]** (file read only) |
| `/ponytail band [on\|off]`, `/ponytail band import` | Hide or show the cost band; import past sessions | No | **[Untested]** |

Sources: [README commands table](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/README.md#commands) and the [skills folder](https://github.com/DietrichGebert/ponytail/tree/v5.3.3/skills). **[Docs]**

**Review and audit output format [Docs, Tested]:**
- Findings are grouped into **Must fix**, **Should fix** and **Nice to have**, and numbered so you can say "fix 2 and 5".
- Every finding explains what the code is, the problem, the smallest fix, and what happens if you skip it.
- Every finding needs a concrete failure case.
- A marked `shortcut:` counts as a decision, not a finding.

---

## 7. Hooks: what runs automatically

Three hooks run in Claude Code. **[Docs]** ([hooks folder](https://github.com/DietrichGebert/ponytail/tree/v5.3.3/hooks))

| Hook | When | What it does | Tested here? |
|---|---|---|---|
| SessionStart | start, resume, `/clear`, compaction | Adds the rules for the current level to the session, plus a **codebase map**. Writes the level to a small file. | **[Tested]**: we saw "PONYTAIL MODE ACTIVE — level: full" |
| UserPromptSubmit | every message you send | Watches for `/ponytail …`, `stop ponytail` and `normal mode` | **[Tested]**: level changes confirmed |
| SubagentStart | when Claude starts a subagent | Adds the same rules to the subagent | **[Untested]**: we started no subagents |

**Codebase map [Docs, Untested]:** a list of the top-level functions, classes and exports in your project, so Claude can reuse what exists instead of searching for it. It is built with simple pattern matching, not a full parser, and is dropped if it takes longer than 3 seconds. Our project was empty when the session started, so the map had nothing to show.

**Where state is kept [Docs, Tested]:**
- **The level:** one small file per project folder under `~/.claude/ponytail-modes/`, plus a shared file `~/.claude/.ponytail-active`.
- **The cost ledger:** under `~/.config/ponytail/band/`.

Nothing is written inside your repository.

---

## 8. Configuration

Everything is optional. **[Docs, Untested]**

| Setting | Effect |
|---|---|
| `PONYTAIL_DEFAULT_MODE` | Default level for new sessions (`off`, `lite`, `full`, `ultra`) |
| `~/.config/ponytail/config.json` | Same, as `{"defaultMode": "..."}`. Also `hideStatus` and `quietStartup` |
| `PONYTAIL_MAP=0` | Turn off the codebase map |
| `PONYTAIL_MAP_CHARS` | Size budget for the codebase map |
| `PONYTAIL_SUBAGENT_MATCHER` | Regex: only inject the rules into subagents whose type matches |
| `PONYTAIL_HIDE_STATUS` | Hide the status-bar indicator, keep Ponytail active |
| `PONYTAIL_QUIET_STARTUP` | Silence the startup notice on the pi host |
| Plugin options: `ledger`, `webhookUrl`, `webhookToken`, `sendNames` | Control the cost ledger (see §9) |

---

## 9. The cost ledger ("band")

**[Docs]** ([plugin.json](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/.claude-plugin/plugin.json), [README](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/README.md#new-in-53-the-band))
- After every turn, Ponytail writes one row per task to `~/.config/ponytail/band/<project>.csv`. The row holds cost, turns, agent time, tokens, reuse, tests, level and model.
- An optional **webhook** can send that row to a URL. It is **off by default**, so nothing leaves your machine unless you set one.
- If you set a webhook, the task name is sent too unless you turn `sendNames` off.
- In the terminal and desktop app (Claude Code 2.1.290 or later), a band above the prompt shows this live. A local "board" page shows all tasks. **[Untested]** We only read the CSV file.

What we found when we used the ledger as evidence **[Tested]**:
- There is **one row per session**, not per step, so you can't split planning from building.
- The `level` column keeps **only the latest level**.
- The task name recorded raw prompt markup instead of a readable name.
- The row lags **one turn** behind.

Separately, from reading the plugin code **[Docs]**: the ledger runs **even when the level is `off`**, as long as the plugin is enabled.

For these reasons our comparison measured both builds from Claude Code's own session logs instead. See [METHODOLOGY.md](METHODOLOGY.md#8-model-usage-measurement).

---

## 10. Disabling Ponytail for one project

Setting the level to `off` stops the rules, but the plugin is still loaded. Its six skills stay listed to Claude and the ledger keeps running **[Docs]**: the hooks control the rules, not the skills or the ledger. To run a project with **no Ponytail at all**, disable the plugin for that folder only. **[Tested]**

```bash
cd your-project
claude plugin disable <id-from-claude-plugin-list> --scope local   # we used: ponytail@synced
claude plugin list    # here: ✘ disabled; other folders: still ✔ loaded
```

This writes `.claude/settings.local.json` in that folder. Keep it out of git, for example by adding `.claude/` to `.git/info/exclude`.

---

## 11. Benchmark claims vs our observations

**Ponytail's published benchmark [Claim]** ([results, v5.3.3](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/benchmarks/results/2026-10-07-agentic.md)):
- **Setup:** Opus 5.5, headless Claude Code, 39 tasks × 5 runs, shell access disabled, `CLAUDE.md` and auto-memory off.
- **Versus no plugin:** −53% lines of code, −45% output tokens, −26% cost, −41% time.
- A test exists where the logic needs one: 98% vs 68%.
- **Also in that benchmark:** where a test exists, the no-plugin agent's tests caught *more* injected bugs (77% vs 69%). The author notes: "No skill writes the most thorough single tests, but often writes none."

**Our single experiment [Tested]** (details in [LEARNINGS.md](LEARNINGS.md)):
- Ponytail produced less code and fewer dependencies.
- The baseline's tests caught 10 of 10 planted bugs; Ponytail's caught 4 of 10.
- Build-phase output tokens were not lower with Ponytail.

Our setup was very different from the benchmark: interactive, one small app, one run each, with shell access. So our run **can neither confirm nor refute** the benchmark.

---

## 12. Common mistakes and practical tips

- **Expecting levels to change a lot.** They share all rules but one sentence. `ultra`'s pushback is the most visible difference.
- **Assuming "one test where there is logic" covers your UI.** It may not. If accessibility or UI behaviour matters, ask for UI tests explicitly. Ponytail's rules say accessibility must never be cut, but our build had no automated accessibility checks.
- **Treating fewer lines as automatically better.** In our run, most of the baseline's extra lines were tests that caught real bugs.
- **Relying on the ledger for comparisons.** It is per session and keeps only the latest level. Use Claude Code's session logs instead.
- **Typing "stop ponytail" inside a longer message.** It only works as the whole message.
- **Running two sessions in one folder at different levels.** They share one level setting.
- **Using `/ponytail-review` as the only safety net.** In our run it did not flag the missing UI tests, because skipping them had been agreed during planning. Review checks the code against the plan, not the plan itself.
- **A middle path to try [Untested]:** keep the plugin enabled, set `/ponytail off`, and call `/ponytail-review` or `/ponytail-audit` only when you want a review. We have not tested whether Claude still loads the main Ponytail skill on its own in that state. Its description says to use it "on any coding task".
