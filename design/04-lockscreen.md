# Lock-screen widgets — design brief (optional, v2)

iOS 16+ lock-screen widgets. Three shapes, extreme constraints. These are a
nice-to-have for v2 — they dramatically improve the README screenshot story
but they're not required for launch.

Read [`00-overview.md`](./00-overview.md) first.

## Shapes

iOS gives us three slots with very different dimensions:

| Shape | Size | Typical location |
|---|---|---|
| Circular | 76 × 76 pt | Ring around the clock |
| Rectangular | 172 × 76 pt | Below the clock |
| Inline | ~200 × 16 pt | Above the clock, text-only |

Lock-screen widgets are **monochrome**. iOS tints everything a single color
on the user's wallpaper. You cannot use the full Anthropic palette here —
design in grayscale + one accent only.

## Circular

Single metric, ring-shaped. Use a donut/ring chart to show the hero
percentage (same logic as small widget: max of 5H/7D).

```
   ┌─────┐
   │ ╭─╮ │
   │ │82│ │    82% inside, ring fills as %
   │ ╰─╯ │
   │  5H │    window label below
   └─────┘
```

- Ring: 3pt stroke, full circle track, filled arc for %
- Number: system rounded 16pt bold, center
- Label: mono 8pt below, `5H` or `7D`

## Rectangular

Two thin bars stacked, each with label + %. Closest to the medium widget's
rate-limit block, stripped to monochrome.

```
┌─────────────────────────┐
│ ✻  Claude               │
│ 5H ███████░░░░░░░   37% │
│ 7D ██████████████░  87% │
└─────────────────────────┘
```

- Asterisk 12pt + "Claude" serif 12pt header (1 line)
- Two rate-limit bars, 3pt tall
- Labels mono 9pt, percentages mono 9pt right-aligned
- When ≥ 90%: use solid fill vs stripe pattern to differentiate without color

## Inline

One line of text above the clock. No graphics. Widest possible context for
one-glance status.

```
✻ 5H 37% · 7D 87% · $14 today
```

- Everything on one line
- Use `·` as separator
- Truncate "today" block if user has no today data

## What NOT to do

- No gradients — will render as flat gray on lock screen
- No serif — lock-screen widgets should use SF Rounded / SF Mono only,
  serif gets ugly when tinted
- No freshness indicator — no room, and lock-screen refreshes are so rare
  that "live" is meaningless here anyway
- No progress animation — lock-screen never animates
