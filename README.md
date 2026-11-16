# Ponytail-Exp

A small learning experiment: the same todo app built twice with Claude Code, once with the [Ponytail](https://github.com/DietrichGebert/ponytail) plugin active and once in normal mode, then compared.

> Unofficial, independent learning project. Not affiliated with or endorsed by Ponytail or its author.

## Layout

| Path | What |
|---|---|
| `REQUIREMENTS.md` | Frozen requirements R1–R5, shared verbatim by both builds |
| `ponytail/` | Built with Ponytail v5.3.3 (ultra for planning, full for implementation) |
| `baseline/` | Normal Claude Code build. **Pending, not added yet** |
| `LEARNINGS.md` | Observations, metrics and the comparison |

## Requirements (summary)

R1 add (trimmed, empty rejected) · R2 toggle done · R3 delete · R4 accessible · R5 unit tests, `npm test` and `npm run build` pass. Full text and out-of-scope list: [REQUIREMENTS.md](REQUIREMENTS.md).

## Run

Requires Node.js (tested with Node 24).

```bash
cd ponytail
npm ci
npm run dev      # open the printed localhost URL
npm test         # Vitest, runs once
npm run build    # type-check + production build
npm run lint     # oxlint
```

The baseline will run the same way from `baseline/` once added.

## Comparison method

- Both builds get the same `REQUIREMENTS.md` (SHA-256 `4631f379…97bc3653`, checked before import).
- Both start from `create-vite@9.3.4`, template `react-ts`.
- The baseline is built in a separate directory and session, with Ponytail disabled and that verified first.
- Same gates for both: `npm test`, `npm run build`, `npm run lint`, and the same manual R1–R4 browser checklist.
- Same reviewer for both: `/ponytail-audit`, run after each build is finished.
- Measured: lines of code, test count, dependencies, audit findings, `shortcut:` debt markers, cost, turns and time.
- Only measured numbers are reported. No estimated savings.

## License

MIT, see [LICENSE](LICENSE). Scaffolded from Vite's `create-vite` template (MIT).
