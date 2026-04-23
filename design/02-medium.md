# Medium widget — design brief

Canvas: **364 × 170 pt** (iPhone medium home widget)
Read [`00-overview.md`](./00-overview.md) first for brand, palette, data vocabulary.

## Purpose

The "daily driver" widget. Both rate-limit bars, plus the current session row
so you know what your live burn looks like. This is what most users will
actually pin to their home screen.

## What it shows

1. **Branded header** — asterisk + "Claude" wordmark + live dot
2. **Two rate-limit rows** — 5H and 7D, each with label, %, reset countdown, bar
3. **Current session row** — model, context %, session cost, session duration
4. **Freshness footer** — updated timestamp + plan tier

## Layout

```
┌────────────────────────────────────────────────────────┐
│ ✻ Claude                                  ●           │  14pt padding
│                                                        │
│ SESSION · 5H                                      37%  │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
│                                       resets in 3h 04m │
│                                                        │
│ WEEKLY · 7D                                       87%  │
│ ███████████████████████████████████░░░░░░░░░░░░░       │
│                                       resets in 4d 12h │
│                                                        │
│ ─────────────────────────────────────────────────────  │  thin divider
│                                                        │
│ Opus 4.7 · ctx 42%             $3.12  ·  48m           │  session row
│                                                        │
│ ● updated 2m ago                                  max  │  footer
└────────────────────────────────────────────────────────┘
```

### Elements

1. **Header** — asterisk 22pt coral, "Claude" wordmark 20pt serif Medium in
   `ink`, right-side live dot (8pt, coral when fresh, rust when stale).

2. **Rate-limit row ×2** — each row has three parts stacked:
   - **Top line**: label (mono 9pt Medium UPPERCASE muted, left) +
     percentage (serif 18pt Semibold ink, right)
   - **Progress bar**: full width (minus 32pt padding), 6pt height, capsule.
     Fill: `accent` or `hot` (≥ 90%). Track: `track`.
   - **Hint line**: `resets in Xh Ym` right-aligned, mono 9pt Regular muted

   Spacing: 4pt between label line and bar, 3pt between bar and hint, 10pt
   between the two rows.

3. **Divider** — 0.5pt line in `track` color, full width. 10pt vertical
   margin above and below.

4. **Session row** — single line of mono 10pt, split left/right:
   - **Left**: `{model} · ctx {pct}%` — in `ink` color. Model string
     shortened: `Opus 4.7`, `Sonnet 4.6`, `Haiku 4.5`. Never show the
     full model ID.
   - **Right**: `${cost} · {duration}` — cost formatted as `$3.12`,
     duration as `48m` or `2h 14m`. Muted color.

   If no active session (idle > 10min): show `— idle —` centered, muted.

5. **Footer** — mono 9pt, left: freshness indicator (same logic as small),
   right: plan tier tag (`max`, `pro`, `free`) in `muted`.

## States

- **Normal** — as drawn above
- **Any bar ≥ 90%** — that bar's fill and its percentage number in `hot`.
  Other bar stays normal.
- **Stale (> 30min)** — header dot in `hot`, footer reads `stale · Nm`
- **Mac asleep (> 2h)** — desaturate entire palette, footer reads
  `Mac asleep · last seen Nh ago`, plan tag dimmed
- **Offline** — two empty bar tracks, header shows `offline` in `hot`
  replacing "Claude" wordmark, footer reads `can't reach Mac`

## Scannability rules

- User should be able to read 5H% and 7D% without head movement — keep
  numbers in the same horizontal position for both rows
- Reset hints align right so they stack visually below each other
- Session row should feel different from rate-limit rows — the divider and
  the mono font on the whole row creates that break

## What NOT to add

- Today's cost total (that's Large)
- Project name (that's Large)
- Historical sparks (that's Large)
- Cache hit ratio (that's Large)
- Multiple model rows (that's Large)

Medium is **now**. Large is **today and history**.

## Edge cases

- Session just started (< 1 min): show duration as `—` not `0m`
- Cost is $0 (cache-only work): show `$0.00`
- Context % unavailable: show `ctx —` (dash, not zero)
- Model string unknown: show `Claude` generic
