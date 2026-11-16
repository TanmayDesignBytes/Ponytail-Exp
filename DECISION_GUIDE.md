# Decision guide: Ponytail or normal Claude Code?

There is no universal winner. This guide helps you decide for **your** project. It draws on:
- what Ponytail documents ([PONYTAIL_GUIDE.md](PONYTAIL_GUIDE.md))
- what our single experiment observed ([LEARNINGS.md](LEARNINGS.md))
- how far that experiment can be trusted ([METHODOLOGY.md](METHODOLOGY.md))

## 1. Five questions to ask first

| Question | If yes… |
|---|---|
| Does Claude often over-build for you: extra features, libraries, abstractions? | Ponytail targets exactly this. |
| Is UI behaviour or accessibility critical in your project? | Don't rely on Ponytail's "one small test where there's logic" rule. Ask for UI tests explicitly, with either approach. |
| Do you already have strong tests and CI (automated checks on every change)? | Ponytail's lean changes are safer, because your existing tests catch what its thinner tests miss. |
| Is your codebase mature, with helpers and components worth reusing? | Ponytail's "reuse first" ladder and codebase map are designed for this. The map was untested in our empty project. |
| Is cutting token cost your main reason? | Our run did not show a saving. Ponytail's benchmark claims one under different conditions. Measure it on your own work before deciding. |

## 2. When Ponytail might be useful

- **Scoping a vague request.** `ultra` pushed back on four items in our plan before any code existed. [Observed]
- **Avoiding dependency creep.** It added one package to the template (Vitest) where the baseline added five (Vitest, 3 Testing Library packages, jsdom). The baseline's extra packages were what made its UI tests possible. [Observed]
- **Keeping deliberate shortcuts visible.** `shortcut:` comments plus `/ponytail-debt` turn "fix later" into a list. [Observed]
- **Getting a clear account from Claude.** Every reply ended with what was skipped and what's risky. [Observed]
- **Structured reviews.** `/ponytail-review` and `/ponytail-audit` give ranked, plain-English findings. [Observed]

## 3. When normal Claude Code might be preferable

- **You want thorough tests by default.** The baseline's tests caught 10 of 10 planted bugs; Ponytail's caught 4 of 10. [Observed] Ponytail's own benchmark also found that the no-plugin agent writes more thorough tests when it writes one. [Claim]
- **UI and accessibility regressions are costly.** The baseline tested labels, button names and clicks automatically. Ponytail's build had no automated UI checks. [Observed]
- **You want no extra injected context or local state.** No plugin rules in every session, no ledger files, no level files. [Docs]
- **You care more about a self-explaining design than a minimal one.** The baseline passed ids into its logic functions, which made them easy to test, and used `readonly` types. [Observed, this run only]

## 4. When stronger testing should come before less code

Choose tests over minimalism when a silent regression would hurt users:
- accessibility
- payments
- data loss
- security
- any behaviour you can't easily check by hand

In our run, removing the Delete button's accessible name or the input's label passed **every** automated check in the Ponytail build. Only a manual check would have caught it. The baseline's extra test lines caught both. [Observed]

A practical combination:
- Use Ponytail for scope control.
- State explicitly in the requirements which behaviours need automated tests, for example "R4 must be covered by UI tests".
- Ponytail's test rule asks for the minimum; your requirements can ask for more.

## 5. Why fewer lines don't automatically mean better engineering

- App + test code was 98 lines with Ponytail and 268 lines in the baseline. **Most of the difference was tests** (42 vs 196 test lines). Those tests are what caught the 6 UI bugs. [Observed]
- App code alone differed far less: 56 vs 72 lines. [Observed]
- Lines are a cost to read and maintain. Lines that prevent bugs are also an asset. Count *what the lines do*, not just how many there are.

## 6. Why one experiment can't settle it

- **One run per build.** Language models vary between runs, so a single run can't separate a real difference from chance. [Methodology]
- **The baseline inherited Ponytail's scope decisions**, so the size comparison isn't a fair cold-start test. [Methodology]
- **One small todo app** says little about large codebases, where reuse and the codebase map might matter more.
- **Ponytail's benchmark** (39 tasks × 5 runs, headless, no shell) is broader than our run, but it is published by the plugin's author and was run under different conditions. Our run neither confirms nor refutes it. [Claim]
- **Our review was done by Claude**, the same assistant that built one of the versions. [Methodology]

## 7. A simple way to decide for yourself

1. Pick a real, small task from your own backlog.
2. Freeze its requirements, including **which behaviours must have automated tests**.
3. Build it twice: once with Ponytail, once with the plugin disabled for that folder (see [PONYTAIL_GUIDE.md §10](PONYTAIL_GUIDE.md#10-disabling-ponytail-for-one-project)).
4. Compare: did both meet the requirements? Which tests catch planted bugs? How many dependencies? How much did each cost in your own usage?
5. Repeat on 2–3 tasks before forming a view.
