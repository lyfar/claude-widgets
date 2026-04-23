# Design briefs

Start here:

1. [`00-overview.md`](./00-overview.md) — shared constraints, palette, typography, data
2. [`01-small.md`](./01-small.md) — 170 × 170, one hero metric
3. [`02-medium.md`](./02-medium.md) — 364 × 170, rate limits + session
4. [`03-large.md`](./03-large.md) — 364 × 382, full analytics
5. [`04-lockscreen.md`](./04-lockscreen.md) — optional, v2

## Deliverables per size

- `NN-size-light.png` (3× retina)
- `NN-size-dark.png` (3× retina)
- `NN-size-states.png` — grid showing fresh / stale / Mac asleep / ≥ 90% warning
- Optional: Figma link

Drop them in `../assets/mocks/`.

## Working example

The medium widget is already live in production. Source:
[`../widgets/medium.js`](../widgets/medium.js). Screenshot in
[`../assets/screenshots/medium-live.png`](../assets/screenshots/medium-live.png)
(pending). Use it as the baseline — small and large should feel like siblings.
