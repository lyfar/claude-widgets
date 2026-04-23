# claude-widgets — design brief (overview)

This brief is for the designer producing mockups for three iOS home-screen
widgets for Claude Code usage. It covers shared constraints, brand system, and
data vocabulary. Per-widget specs are in:

- [`01-small.md`](./01-small.md) — glance metric
- [`02-medium.md`](./02-medium.md) — rate limits + session
- [`03-large.md`](./03-large.md) — full analytics surface

## The product in one sentence

Three iPhone home-screen widgets showing a Claude Code user how close they
are to their 5-hour and 7-day usage caps — so they can pace work and hit
limits on purpose instead of being surprised.

## Audience

Claude Code power users on Claude Max. They already use the CLI, they already
have Tailscale. They want to glance at the phone and know: _can I still burn
cycles right now, or am I about to hit the wall?_

## The mascot — Claude Code asterisk ✻

The Claude Code CLI uses an eight-spoke asterisk (✻) as its brand mark. The
widget MUST render this mark prominently — it's the single visual token that
says "this is Claude Code, not some random SaaS dashboard".

Reference: the asterisk that shows up in the `claude` CLI banner. It has:

- Eight spokes radiating from a center point
- Cardinal spokes (0°, 90°, 180°, 270°) are slightly **longer**
- Diagonal spokes (45°, 135°, 225°, 315°) are slightly **shorter**
- A small filled dot at the center
- Color: Anthropic coral (`#CC785C` light / `#D97757` dark)

Size reference per widget:
- Small: ~32pt, top-leading
- Medium: ~22pt, top-leading next to wordmark
- Large: ~26pt, top-leading next to wordmark

Designer is free to refine proportions. Keep it recognizable as the CLI mark.

## Brand palette — Anthropic / Claude Code

From anthropic.com and claude.ai marketing pages. All widgets must ship both
light and dark variants — iOS picks automatically.

### Light mode
| Token | Hex | Role |
|---|---|---|
| `bg` | `#F5F4EE` | Cream "Book" background |
| `ink` | `#141413` | Primary text, high-contrast numerics |
| `muted` | `#8C857A` | Labels, hints, secondary text |
| `accent` | `#CC785C` | Coral — asterisk, progress bar fill, live dot |
| `track` | `#E6E4DA` | Bar track (empty) |
| `hot` | `#B64A2E` | Rust — fill color when usage ≥ 90% |

### Dark mode
| Token | Hex | Role |
|---|---|---|
| `bg` | `#1F1E1C` | Warm near-black (not pure #000) |
| `ink` | `#F5F4EE` | Cream text |
| `muted` | `#8C857A` | Same muted as light |
| `accent` | `#D97757` | Slightly brighter coral |
| `track` | `#2B2A27` | Dark warm track |
| `hot` | `#E84A2E` | Brighter rust for ≥ 90% |

## Typography

Two type families, both system (no custom font files — keeps install trivial):

### Serif — "New York" (iOS 13+)
Used for brand wordmark, big numerics (percentages). New York is iOS's
Tiempos-adjacent display serif. Falls back gracefully if unavailable.

- Widget brand (`Claude`): 18–22pt, Medium weight
- Hero percentage: 28–48pt, Semibold/Bold (size depends on widget)
- Secondary numerics: 14–18pt, Medium

### Mono — SF Mono (system)
Used for labels, hints, timestamps, and small data. Gives the widget a CLI
feel without screaming "I'm a terminal".

- Row labels (`SESSION · 5H`): 9pt, Medium, UPPERCASE, tracked wide
- Hints, countdowns, footers: 9–10pt, Regular
- Numerics inside rows (when not hero): 10–11pt, Medium

## Canvas sizes (iOS 17, points)

| Size | Dimensions (pt) | Use |
|---|---|---|
| Small | 170 × 170 | One hero metric |
| Medium | 364 × 170 | Two bars + session row |
| Large | 364 × 382 | Full analytics block |
| Lock (circular) | 76 × 76 | Single-ring glance |
| Lock (rectangular) | 172 × 76 | Two bars, stripped |
| Lock (inline) | ~200 × 16 | One line of text |

Account for iOS safe-area padding — usable area is roughly 16pt inset from
each edge. Design on the full canvas; internal padding is 14–16pt.

## Data vocabulary

These are the fields every design can assume are available. They come from
Claude Code's statusline hook plus a local JSONL aggregator; nothing else.

### Rate limits (from statusline — always present for subscription users)
- `five_hour.used_percentage` — 0–100 integer
- `five_hour.resets_at` — Unix timestamp (int)
- `seven_day.used_percentage` — 0–100 integer
- `seven_day.resets_at` — Unix timestamp (int)

### Current session (from statusline)
- `model` — e.g. `Opus 4.7 (1M)`
- `context_window_used_percentage` — 0–100 integer
- `session_cost_usd` — float
- `session_duration_minutes` — int
- `workspace_name` — project folder basename
- `session_id` — for debugging, usually not shown

### Today & trend (from local JSONL aggregator, ~/.claude/projects/**/*.jsonl)
- `today_cost_usd` — float
- `today_session_count` — int
- `today_tokens_total` — int
- `week_spark` — array of 7 daily cost values (oldest → newest)
- `top_projects` — array of {name, cost, pct} (top 3)
- `cache_hit_ratio` — 0–1 float
- `subagent_call_count` — int

### Freshness
- `updated_at` — ISO 8601 string, time of last statusline write
- Widget must render a visual "live / stale / Mac asleep" indicator based on
  how long ago this was.

## Common interaction states

Every widget must handle these four states:

1. **Fresh (< 2 min old)** — full color, "live" dot (coral)
2. **Normal (2–30 min old)** — full color, "updated Nm ago" footer
3. **Stale (30 min – 2 h old)** — slight desaturation, "stale · Nm" footer in rust
4. **Mac asleep (> 2 h old)** — grayscale palette, "Mac asleep · last seen Nh ago"

Rate-limit bars use a **two-color scheme**:
- `accent` (coral) when `used_percentage < 90`
- `hot` (rust) when `used_percentage ≥ 90`

Don't animate anything — widgets can't animate on iOS.

## File deliverables from designer

For each of small / medium / large, we need:

1. `NN-size-light.png` — light mode mock, 3× retina
2. `NN-size-dark.png` — dark mode mock, 3× retina
3. `NN-size-states.png` — a grid showing: fresh, stale, Mac asleep, ≥ 90% warning
4. Optionally: Figma file link

Drop them in `./assets/mocks/`. I'll wire them up in Scriptable and
screenshot the real widgets for the README.

## Out of scope for v1

- Interaction / deep links (widgets can only launch apps, not run code)
- Multi-account / team usage
- Historical graphs beyond 7 days
- Cost forecasting
- Android
- iPad-specific layouts (iPhone sizes render fine on iPad)
