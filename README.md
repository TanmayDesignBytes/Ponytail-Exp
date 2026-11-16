# Ponytail-Exp

The same small todo app, built twice with Claude Code: once with the **Ponytail** plugin and once without it. Then compared honestly.

> Unofficial, independent learning project. Not affiliated with or endorsed by Ponytail or its author.

> **If you read nothing else**
> - **Ponytail** is a Claude Code plugin that tells Claude to make *the smallest change that fully solves the task*.
> - **Size:** with it, we got less code and fewer dependencies (56 vs 72 app lines, 8 vs 12 dev dependencies).
> - **Tests:** without it, we got much stronger tests. They caught **10 of 10** planted bugs; Ponytail's caught **4 of 10**, and missed every UI and accessibility bug.
> - **Cost:** no token or cost saving showed up in our single run.
> - **Verdict:** neither approach "won". See the [decision guide](DECISION_GUIDE.md).

## 1. What is Ponytail?

[Ponytail](https://github.com/DietrichGebert/ponytail) is a free, MIT-licensed **plugin** (add-on) for Claude Code, Anthropic's coding assistant.

- It turns Claude into "a lazy senior developer": write only what the task needs, reuse what exists, and add nothing nobody asked for.
- It also says what must **never** be cut: validation, error handling that prevents data loss, security and accessibility.

We used version **5.3.3**. Full explanation: [PONYTAIL_GUIDE.md](PONYTAIL_GUIDE.md).

## 2. Why would someone use it?

AI coding assistants often over-build: extra libraries, abstractions, options and long explanations. Ponytail is designed to push back on that.

Its author reports, from their own benchmark (39 tasks × 5 runs), the following figures compared with no plugin:
- −53% code
- −26% cost
- −41% time
- tests left behind more often (98% vs 68%)

**These are the author's claims**, not our results. Their method and limits are in their [benchmark report](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/benchmarks/results/2026-10-07-agentic.md).

## 3. How does it work with Claude Code?

1. **Install** the plugin (two `/plugin` commands; see the [guide](PONYTAIL_GUIDE.md#2-installing)).
2. When a session starts, a **hook** (a script Claude Code runs automatically) adds Ponytail's rules to the conversation.
3. Another hook watches for level commands such as `/ponytail ultra` and `stop ponytail`.
4. A third hook adds the same rules to any **subagent** (helper agent) Claude starts.
5. **Skills** (on-demand commands) add reviews: `/ponytail-review`, `/ponytail-audit` and `/ponytail-debt`.
6. A local **ledger** records cost and tokens per session.

## 4. Levels

| Level | What it adds | Used in this experiment? |
|---|---|---|
| `lite` | Build what was asked; mention a smaller option in one line | No |
| `full` (default) | The full rule set | Yes, for implementation |
| `ultra` | Also challenge the request before building | Yes, for planning |
| `off` | No rules | No (we disabled the plugin instead) |

**All active levels share the same rules.** They differ only in one line of level-specific guidance. There is no "Basic" level. Details: [guide §4](PONYTAIL_GUIDE.md#4-levels).

## 5. What did we build?

- A React + TypeScript todo app: add, toggle and delete todos, with accessibility and unit tests.
- The scope is fixed in [REQUIREMENTS.md](REQUIREMENTS.md) (R1–R5). Saving to storage, editing, filters and styling are deliberately out of scope.

| Folder | Built with |
|---|---|
| [`ponytail/`](ponytail/) | Ponytail: `ultra` for planning, `full` for implementation |
| [`baseline/`](baseline/) | Normal Claude Code, Ponytail disabled for that folder |

## 6. How did we compare?

- **Same requirements** (an identical file, checked by hash) and the same starting template.
- **Separate folders and sessions.** Ponytail was disabled for the baseline, and we checked its session log to confirm it was off.
- **The same checks on both:** tests, build, lint, `npm audit`, and one review rubric.
- **Planted bugs:** 10 small bugs inserted one at a time, to see which test suite notices.
- **Model usage** taken from Claude Code's session logs, measured the same way for both.

Full method and its weaknesses: [METHODOLOGY.md](METHODOLOGY.md).

## 7. Side-by-side results

| | `ponytail/` | `baseline/` |
|---|---|---|
| Requirements R1–R5 met | yes | yes |
| Must-fix review findings | 0 | 0 |
| App code lines (no blanks or comments) | 56 | 72 |
| Test code lines / tests | 42 / 9 | 196 / 35 |
| Planted bugs caught: logic | 4 / 4 | 4 / 4 |
| Planted bugs caught: UI and accessibility | **0 / 6** | **6 / 6** |
| Dev dependencies | 8 | 12 |
| Installed packages / size | 50 / 93 MB | 94 / 124 MB |
| Production JS bundle | 220.39 kB | 220.47 kB |
| Test run time (one run) | 61 ms | 638 ms |
| Build-phase output tokens | 20,935 | 18,912 |

All figures, by phase and with caveats, are in [LEARNINGS.md](LEARNINGS.md).

## 8. Ponytail: pros and cons (in this experiment)

**Pros**
- Cut scope before any code was written (removed 4 items from the first plan).
- Less code, fewer dependencies and faster tests.
- Every reply said what was skipped and what was risky.
- Known limits were marked in the code (`shortcut:` comments) and collected by `/ponytail-debt`.
- The review and audit commands gave clear, ranked findings.

**Cons**
- Tests covered logic only and caught 0 of 6 UI and accessibility bugs.
- Its own review didn't flag the missing UI tests, because skipping them was agreed during planning.
- It didn't use fewer output tokens in the build phase, and it carried more context per call.
- It leaves some state outside the repo: level files and a cost ledger.

## 9. Normal Claude Code: pros and cons (in this experiment)

**Pros**
- Thorough tests, including UI and accessibility, which caught all 10 planted bugs.
- No plugin to install, and no extra rules added to every session.
- A design that was easy to test: ids passed into the logic functions.

**Cons**
- More code, 4 more dev dependencies, and tests that ran about 10× slower.
- Left the unused Vite template README behind; it was removed before publishing.
- No marking of deliberate shortcuts or record of what was skipped.
- It inherited the scope Ponytail had already trimmed, so we don't know how much it would have built on its own.

## 10. What the results actually mean

- **Fewer lines isn't automatically better.** Most of the baseline's extra lines were tests, and those tests caught real bugs.
- **Ponytail did what it says on size.** Its minimal-testing rule left a real gap where accessibility mattered, even though its own rules say accessibility must never be cut.
- **One run proves nothing general.** A single run can't separate a real difference from chance, and the baseline benefited from Ponytail's planning.
- **Our run doesn't confirm or refute Ponytail's benchmark.** The conditions were very different.

## 11. Should you use Ponytail?

- **Claude over-builds for you?** Ponytail is worth trying.
- **UI, accessibility or other silent-failure areas matter?** Write "needs automated tests" into your requirements, whichever approach you use.
- **You already have strong tests and CI?** Ponytail's lean changes are lower risk.
- **Cost is your main reason?** Measure it on your own tasks first. We didn't see a saving.

Full framework: [DECISION_GUIDE.md](DECISION_GUIDE.md).

## 12. Reproduce it

Requires Node.js (tested with Node 24). Each build is a separate npm project:

```bash
cd ponytail      # or: cd baseline
npm ci
npm run dev      # open the printed localhost URL
npm test         # Vitest, runs once
npm run build    # type-check + production build
npm run lint     # oxlint
```

To re-check the planted-bug result (4/10 vs 10/10) yourself, run `experiment/plant-bugs.sh` (see [experiment/README.md](experiment/README.md)). To repeat the whole experiment, see [METHODOLOGY.md §10](METHODOLOGY.md#10-reproducibility-and-its-limits).

## 13. Further reading

| Document | For |
|---|---|
| [PONYTAIL_GUIDE.md](PONYTAIL_GUIDE.md) | Installing and using Ponytail: levels, skills, hooks, configuration, ledger, tips |
| [METHODOLOGY.md](METHODOLOGY.md) | Exactly how the experiment ran, and its confounding factors |
| [LEARNINGS.md](LEARNINGS.md) | Every measured result |
| [DECISION_GUIDE.md](DECISION_GUIDE.md) | Choosing for your own project |
| [experiment/](experiment/README.md) | The planted-bug and token-measurement scripts |
| [Ponytail v5.3.3 source](https://github.com/DietrichGebert/ponytail/tree/v5.3.3) | The plugin itself |

## 14. Limitations and transparency

- **One run per build**, interactive and approved step by step by one person.
- **The baseline started from requirements scoped during Ponytail's planning.**
- **Claude built the Ponytail version, wrote the review rubric and reviewed both builds.** There was no independent reviewer.
- **Manual browser checks were reported by the user** and only partly cover the requirements.
- **No dollar figures:** pricing was not verified. Session logs are private.
- **Our Ponytail copy came through account sync**, not the documented marketplace install.
- **Features we didn't test** (`lite`, `off`, subagents, codebase map, on-screen band) are labelled as untested in the guide.

## License

MIT, see [LICENSE](LICENSE). Both builds were scaffolded from Vite's `create-vite` template (MIT).
