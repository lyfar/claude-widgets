# Large widget — design brief

Canvas: **364 × 382 pt** (iPhone large home widget)
Read [`00-overview.md`](./00-overview.md) first for brand, palette, data vocabulary.

## Purpose

A tiny dashboard. Rate limits, live session, today's totals, 7-day trend,
top projects. For users who actually want to see where their budget is going,
not just whether they're about to hit a wall.

## What it shows

1. **Branded header** — same as medium
2. **Rate-limit block** — same two rows as medium (5H + 7D)
3. **Current session block** — model, project, context %, cost, duration, lines touched
4. **Today block** — today's total cost, sessions count, tokens
5. **7-day spark chart** — one mini bar chart of daily cost
6. **Top projects** — top 3 projects by cost today (or this week), with mini bars
7. **Efficiency footer** — cache hit ratio + subagent ratio
8. **Freshness + plan**

## Layout

```
┌────────────────────────────────────────────────────────┐
│ ✻ Claude                                          ●    │
│                                                        │
│ SESSION · 5H                                      37%  │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                       resets in 3h 04m │
│                                                        │
│ WEEKLY · 7D                                       87%  │
│ ██████████████████████████████░░░░░░░                  │
│                                       resets in 4d 12h │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│                                                        │
│ NOW                                                    │
│ claude-widgets · Opus 4.7 · ctx 42%                    │
│                                    $3.12 · 48m · +127  │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│                                                        │
│ TODAY                    7 DAYS                        │
│ $14.22                    ▁▂▅▇▃▅█                     │
│ 6 sessions · 2.1M tok    last: $14.22 · avg $9.40      │
│                                                        │
│ TOP PROJECTS                                           │
│ claude-widgets ██████████░░░░░  $5.10                  │
│ strc-models    ███████░░░░░░░░  $3.80                  │
│ brain-curator  ████░░░░░░░░░░░  $2.00                  │
│                                                        │
│ ● updated 2m ago    cache 73% · subagents 12%    max   │
└────────────────────────────────────────────────────────┘
```

### Elements

1. **Header** — identical to medium. Asterisk + "Claude" + live dot.

2. **Rate-limit block** — same spec as medium (two rows with label, %, bar,
   reset hint). Fonts unchanged.

3. **Divider** — 0.5pt `track` color, full width, 10pt vertical margin.

4. **Current session block** — labeled `NOW` (mono 9pt UPPERCASE muted).
   Two lines of mono 10pt:
   - **Line 1 (left-aligned)**: `{workspace} · {model} · ctx {pct}%` in `ink`
   - **Line 2 (right-aligned)**: `${cost} · {duration} · +{lines_added}` in `ink`
     The `+127` represents net lines added in this session (from transcript
     edit events). Omit if unavailable.

5. **Today + 7-day spark** — two-column row:
   - **Left column (label `TODAY`)**:
     - Big number: `$14.22` serif 22pt Semibold ink
     - Subline: `6 sessions · 2.1M tok` mono 9pt muted
   - **Right column (label `7 DAYS`)**:
     - Spark chart: 7 bars representing daily cost. Height normalized to
       column max. Color: `accent` for normal days, `hot` for ≥ 90% of 7d
       budget days. Use block characters OR a custom drawing — designer's
       choice. Dimensions: ~140pt wide, 20pt tall.
     - Subline: `last: $14.22 · avg $9.40` mono 9pt muted

6. **Top projects** — labeled `TOP PROJECTS`. Three rows, each with:
   - Project name (mono 10pt ink, left, truncated to ~18 chars)
   - Mini bar (rounded 4pt height, 120pt wide, fill % of column max,
     coral color)
   - Cost amount (mono 10pt ink, right)
   Projects sorted by today's cost descending. Only top 3. If fewer than 3
   projects active, show what exists; don't pad with empty rows.

7. **Efficiency footer** — single mono 9pt line, three segments:
   - Left: freshness indicator (same logic as other sizes)
   - Center: `cache {pct}% · subagents {pct}%`
     - `cache` = cache_hit_ratio * 100
     - `subagents` = subagent_call_count / total_call_count
   - Right: plan tier (`max`)

## States

Same four states as medium (Normal / Warning / Stale / Mac asleep / Offline).
At ≥ 90%:
- That bar in `hot`
- Hero percentage in `hot`
- Everything else stays normal color — don't flood the widget in red

## Scannability rules

- **Vertical rhythm**: top third = rate limits, middle third = now, bottom
  third = today + trend + projects. User eye travels top-to-bottom once.
- **Right-alignment discipline**: all $ amounts right-align so they form a
  readable column. Cost is the KPI; make it easy to compare.
- **One accent color at a time**: don't color-code more than two things. The
  asterisk, the bars, and the warning state are the only chromatic events.

## What NOT to add

- No line graphs (spark bars only — 7 points isn't enough for a curve)
- No pie charts ever
- No raw token counts outside the `TODAY` subline — users think in dollars,
  not tokens
- No forecasting or "you'll hit the cap at 4pm" prediction. That's ML-flavored
  noise. Show the real number.

## Edge cases

- Fewer than 7 days of history: pad spark with zero-height bars for missing
  days, don't skip
- No projects today yet: show placeholder `— no activity today —` instead
  of empty TOP PROJECTS block
- Session and today cost equal (only session was today): still show both
  blocks; they're answering different questions
- `lines_added` negative (net deletion): show as `-42` in `muted` instead
  of `hot` — deletions aren't a warning
