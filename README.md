# Ponytail-Exp

A small learning experiment: the same todo app built twice with Claude Code (Opus 5.5), once with the [Ponytail](https://github.com/DietrichGebert/ponytail) plugin active and once in normal mode, then compared.

> Unofficial, independent learning project. Not affiliated with or endorsed by Ponytail or its author.

## Layout

| Path | What | Status |
|---|---|---|
| `REQUIREMENTS.md` | Frozen requirements R1–R5, the single source for both builds | frozen |
| `ponytail/` | Built with Ponytail v5.3.3 (ultra for planning, full for implementation). Logic-only unit tests. | complete · 9 tests pass |
| `baseline/` | Built in normal Claude Code with Ponytail disabled. Unit tests plus UI and accessibility tests. Imported with its git history. | complete · 35 tests pass |
| `LEARNINGS.md` | Method, measurements, limitations and conclusions | complete |

## Requirements (summary)

R1 add (trimmed, empty rejected) · R2 toggle done · R3 delete · R4 accessible · R5 unit tests, `npm test` and `npm run build` pass. Full text and out-of-scope list: [REQUIREMENTS.md](REQUIREMENTS.md).

## Run

Requires Node.js (tested with Node 24). Each build is a separate npm project:

```bash
cd ponytail      # or: cd baseline
npm ci
npm run dev      # open the printed localhost URL
npm test         # Vitest, runs once
npm run build    # type-check + production build
npm run lint     # oxlint
```

## Comparison method

- Both builds used the same `REQUIREMENTS.md` (SHA-256 `4631f379…97bc3653`, verified before the baseline was imported).
- Both started from `create-vite@9.3.4`, template `react-ts`.
- The baseline was built in a separate directory and session, with Ponytail disabled for that directory. Its session log shows no Ponytail hooks, rules or skills.
- The same checks ran on both: `npm test`, `npm run build`, `npm run lint`, `npm audit`, planted-bug tests, and one review rubric.
- Token usage for both came from Claude Code session logs, measured the same way.
- Only measured numbers are reported, with no estimated savings. One run per build, so these are observations, not a benchmark.

## Headline results

Both builds meet R1–R5 and have no Must-fix issue.

| | `ponytail/` | `baseline/` |
|---|---|---|
| App code lines | 56 | 72 |
| Test code lines / tests | 42 / 9 | 196 / 35 |
| Planted bugs caught | 4 / 10 (logic only) | 10 / 10 (logic + UI) |

Ponytail produced less code and fewer dependencies. The baseline's UI tests catch accessibility regressions that Ponytail's tests miss. No token or cost saving was shown. Details and caveats: [LEARNINGS.md](LEARNINGS.md).

## License

MIT, see [LICENSE](LICENSE). Both builds were scaffolded from Vite's `create-vite` template (MIT).
