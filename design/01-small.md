# Small widget — design brief

Canvas: **170 × 170 pt** (iPhone small home widget)
Read [`00-overview.md`](./00-overview.md) first for brand, palette, data vocabulary.

## Purpose

One-glance answer to "am I about to hit a limit?". The user looks, gets a
number, looks away. No scanning, no columns, no decisions.

## What it shows

Only **one** rate-limit metric — whichever is closer to its cap right now:

```
hero_pct = max(five_hour.used_percentage, seven_day.used_percentage)
hero_label = "5H" if five_hour is higher else "7D"
```

That's the entire content decision. If the 5-hour window is at 80% and the
7-day is at 40%, we show `80%` with a `5H` label. When the 7-day catches up
and crosses, we switch labels.

## Layout

```
┌────────────────────────┐
│ ✻                   5H │   ← asterisk top-left, window label top-right
│                        │
│                        │
│       82%              │   ← hero percentage, oversized serif
│                        │
│       resets 2h 14m    │   ← reset countdown, mono
│                        │
│  ████████████░░░░      │   ← thin progress bar
│                        │
│ ●  updated 4m ago      │   ← freshness footer
└────────────────────────┘
```

### Elements, in Z-order from top

1. **Asterisk ✻** — 32pt, coral (`accent`), top-leading. Anchor of the widget.
2. **Window label** — `5H` or `7D`, mono 10pt Medium UPPERCASE, muted color,
   top-trailing. Tells user which cap is being displayed.
3. **Hero percentage** — `82%` centered, serif 48pt Semibold. Color: `ink`
   normally, switch to `hot` at ≥ 90%.
4. **Reset countdown** — `resets 2h 14m` centered under the hero, mono 10pt
   Regular, muted.
5. **Progress bar** — full-width (minus 16pt padding), 5pt height, rounded
   capsule. Fill: `accent` or `hot` (≥ 90%). Track: `track`.
6. **Freshness footer** — bottom row, mono 9pt. `●` dot coral when live,
   rust when stale. Text: `live` / `updated Nm ago` / `stale · Nm` /
   `Mac asleep · last seen Nh ago`.

## States

- **Normal** — coral accent, clean
- **Warning (≥ 90%)** — hero percentage in `hot`, bar in `hot`, no other changes
- **Mac asleep** — swap all chroma for grayscale; footer in `muted`

## What NOT to show on small

Resist the urge to add:
- Second bar
- Model name
- Session cost
- Claude wordmark (just the asterisk is enough at this size)

Small is a glance. One number. If the user wants more, they look at medium.

## Edge cases

- `hero_pct = 0` — show `0%`, bar empty, copy reads `resets 4h 59m` still
- Both windows at identical % — tie-break to `5H` (more actionable)
- Data missing / offline — show `—` in hero position, footer in `hot`
  reads `offline · can't reach Mac`
