#!/usr/bin/env python3
"""Token usage from one Claude Code session log, optionally split into phases.

Adapted for public use from the original analysis script used in the experiment.
The counting logic is unchanged:
  - assistant entries that carry `message.usage` are counted once per message id
  - input, cache-write, cache-read and output tokens are summed
  - phases are split at the ISO timestamps you pass in
What changed: arguments instead of fixed paths, and user prompt text is hidden by
default. Prompt timestamps are always shown, so you can choose phase boundaries.

Usage:
  python3 -I session-usage.py SESSION.jsonl [--phases T1,T2,...] [--show-prompts]

Claude Code keeps session logs under ~/.claude/projects/<project-folder>/<session-id>.jsonl.
They contain your full conversation. Never commit them or paste them publicly.
"""
import argparse
import json
from collections import Counter

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('log', help='path to one Claude Code session .jsonl file')
ap.add_argument('--phases', help='comma-separated ISO timestamps that start each new phase')
ap.add_argument('--show-prompts', action='store_true',
                help='opt-in: also print the first 90 characters of each user prompt (private content)')
args = ap.parse_args()

seen, calls, prompts, models, types, extra = {}, [], [], Counter(), Counter(), Counter()
for line in open(args.log):
    try: e = json.loads(line)
    except Exception: continue
    types[e.get('type')] += 1
    if 'costUSD' in e: extra['costUSD_field'] += 1
    if e.get('isSidechain'): extra['sidechain'] += 1
    m = e.get('message') or {}
    if e.get('type') == 'assistant' and isinstance(m, dict) and m.get('usage'):
        key = m.get('id') or e.get('requestId') or e.get('uuid')
        if key in seen: continue
        u = m['usage']; seen[key] = 1; models[m.get('model')] += 1
        calls.append((e.get('timestamp'), u.get('input_tokens',0), u.get('cache_creation_input_tokens',0), u.get('cache_read_input_tokens',0), u.get('output_tokens',0)))
    if e.get('type') == 'user' and not e.get('isMeta') and isinstance(m, dict):
        c = m.get('content')
        txt = c if isinstance(c, str) else ' '.join(b.get('text','') for b in c if isinstance(b, dict) and b.get('type')=='text') if isinstance(c, list) else ''
        if txt.strip() and not any(isinstance(b, dict) and b.get('type')=='tool_result' for b in (c if isinstance(c, list) else [])):
            prompts.append((e.get('timestamp'), ' '.join(txt.split())[:90]))
print('entry types:', dict(types)); print('extra:', dict(extra)); print('models:', dict(models))
print('api calls (deduped):', len(calls))
tot = [sum(c[i] for c in calls) for i in range(1,5)]
print('totals  input=%d cache_write=%d cache_read=%d output=%d' % tuple(tot))
print('first/last call:', calls[0][0] if calls else None, calls[-1][0] if calls else None)
print('--- user turns (timestamp%s)' % (', start of text' if args.show_prompts else '; text hidden, use --show-prompts to see it'))
for i,(t,p) in enumerate(prompts): print(f'{i:2d} {t}' + (f' {p}' if args.show_prompts else ''))
if args.phases:  # phase boundaries as ISO timestamps
    bounds = args.phases.split(',')
    edges = [''] + bounds + ['9999']
    print('--- phases')
    for i in range(len(edges)-1):
        ph = [c for c in calls if edges[i] <= c[0] < edges[i+1]]
        s = [sum(c[j] for c in ph) for j in range(1,5)]
        span = f"{ph[0][0][11:19]}..{ph[-1][0][11:19]}" if ph else "-"
        print(f'phase{i} span={span} calls={len(ph)} input={s[0]} cache_write={s[1]} cache_read={s[2]} output={s[3]}')
