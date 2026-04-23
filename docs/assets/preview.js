// Gallery previews: HTML facsimiles of what the Scriptable widget actually
// renders on iPhone. Kept close to the real output so the homepage shows
// exactly what you install.

const DEMO = {
  fivePct: 37,
  sevenPct: 62,
  resetsFive: "3h 04m",
  resetsSeven: "4d 12h",
  age: 2,
  todayTokens: "593M",
  sessions: [
    { proj: "claude-widgets",     model: "Opus 4.7",   age: 1,  tok: "24M", current: true },
    { proj: "site-strc-egor-lol", model: "Opus 4.7",   age: 3,  tok: "18M" },
    { proj: "Brain",              model: "Sonnet 4.6", age: 7,  tok: "12M" },
    { proj: "touchgrass",         model: "Opus 4.7",   age: 11, tok: "6M"  },
  ],
  spark: [0.42, 0.68, 0.35, 0.91, 0.58, 0.73, 1.0],
  cachePct: 93,
};

const mascotImg = (w) => {
  const h = Math.round(w * (447 / 671));
  return `<img class="pv-mark" src="/assets/mascot.svg" width="${w}" height="${h}" alt="">`;
};
const staleDot = () => `<span class="pv-live">●</span>`;

const bar = (pct) => {
  const tone = pct >= 90 ? "hot" : "accent";
  return `<div class="pv-bar"><div class="pv-bar-fill pv-bg-${tone}" style="width:${pct}%"></div></div>`;
};

const sparkBars = (vs) => {
  const max = Math.max(...vs);
  return `<div class="pv-spark">${vs.map(v => {
    const h = Math.max(10, (v / max) * 100);
    const tone = v >= 0.9 * max ? "hot" : "accent";
    return `<div class="pv-spark-bar pv-bg-${tone}" style="height:${h}%"></div>`;
  }).join("")}</div>`;
};

function limitRow(label, pct, resets) {
  return `
    <div class="pv-limit-row">
      <div class="pv-row">
        <span class="pv-up pv-muted">${label}</span>
        <span class="pv-spacer"></span>
        <span class="pv-serif pv-num">${pct}%</span>
      </div>
      ${bar(pct)}
      <div class="pv-up pv-muted pv-right pv-tiny">resets in ${resets}</div>
    </div>`;
}

function header(withBrand) {
  return `
    <div class="pv-row pv-head">
      ${mascotImg(withBrand ? 24 : 22)}
      ${withBrand ? `<span class="pv-serif pv-brand">Claude Code</span>` : ""}
      <span class="pv-spacer"></span>
      ${staleDot()}
    </div>`;
}

function renderSmall() {
  const hero = Math.max(DEMO.fivePct, DEMO.sevenPct);
  const tag  = DEMO.fivePct >= DEMO.sevenPct ? "5H" : "7D";
  const rst  = DEMO.fivePct >= DEMO.sevenPct ? DEMO.resetsFive : DEMO.resetsSeven;
  const hot  = hero >= 90;
  return `
    <div class="pv-small">
      <div class="pv-row">
        ${mascotImg(22)}
        <span class="pv-spacer"></span>
        <span class="pv-up pv-muted">${tag}</span>
      </div>
      <div class="pv-hero ${hot ? "pv-hot" : ""}">${hero}<span class="pv-hero-suffix">%</span></div>
      ${bar(hero)}
      <div class="pv-up pv-muted pv-center pv-tiny">resets ${rst}</div>
      <div class="pv-spacer-flex"></div>
      <div class="pv-row pv-foot pv-muted">${staleDot()}&nbsp;${DEMO.age}m ago</div>
    </div>`;
}

function renderMedium() {
  return `
    <div class="pv-medium">
      ${header(true)}
      ${limitRow("SESSION · 5H", DEMO.fivePct, DEMO.resetsFive)}
      ${limitRow("WEEKLY · 7D",  DEMO.sevenPct, DEMO.resetsSeven)}
      <div class="pv-spacer-flex"></div>
      <div class="pv-row pv-foot pv-muted">
        ${staleDot()}&nbsp;${DEMO.age}m ago
        <span class="pv-spacer"></span>
        ${DEMO.sessions.length} open
      </div>
    </div>`;
}

function renderLarge() {
  const rows = DEMO.sessions.map(s => `
    <div class="pv-row pv-sess">
      <span class="pv-sess-proj ${s.current ? "pv-b pv-accent" : ""}">${s.proj}</span>
      <span class="pv-sess-model pv-muted">${s.model}</span>
      <span class="pv-sess-age pv-muted">${s.age}m</span>
      <span class="pv-spacer"></span>
      <span class="pv-sess-tok">${s.tok}</span>
    </div>`).join("");

  return `
    <div class="pv-large">
      ${header(true)}
      ${limitRow("SESSION · 5H", DEMO.fivePct, DEMO.resetsFive)}
      ${limitRow("WEEKLY · 7D",  DEMO.sevenPct, DEMO.resetsSeven)}
      <div class="pv-divider"></div>
      <div class="pv-row pv-between">
        <span class="pv-up pv-muted">OPEN SESSIONS</span>
        <span class="pv-up pv-muted">${DEMO.sessions.length}</span>
      </div>
      <div class="pv-sess-list">${rows}</div>
      <div class="pv-spacer-flex"></div>
      <div class="pv-divider"></div>
      <div class="pv-row pv-between">
        <span class="pv-up pv-muted">7-DAY USAGE</span>
        <span class="pv-mono pv-ink">${DEMO.todayTokens}</span>
      </div>
      ${sparkBars(DEMO.spark)}
      <div class="pv-row pv-foot pv-muted">
        ${staleDot()}&nbsp;${DEMO.age}m ago
        <span class="pv-spacer"></span>
        cache ${DEMO.cachePct}%
      </div>
    </div>`;
}

document.querySelectorAll(".widget-inner").forEach((el) => {
  if (el.dataset.size === "small") el.innerHTML = renderSmall();
  else if (el.dataset.size === "large") el.innerHTML = renderLarge();
  else el.innerHTML = renderMedium();
});

const css = `
.pv-small, .pv-medium, .pv-large {
  display: flex; flex-direction: column; height: 100%; gap: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  color: var(--ink);
}
.pv-row { display: flex; align-items: center; gap: 6px; }
.pv-head { gap: 8px; }
.pv-between { justify-content: space-between; gap: 6px; }
.pv-spacer { flex: 1; }
.pv-spacer-flex { flex: 1 1 auto; }
.pv-center { text-align: center; }
.pv-right  { text-align: right; justify-content: flex-end; }
.pv-foot   { font-size: 8px; letter-spacing: 0.03em; }

.pv-up    { letter-spacing: 0.08em; font-size: 8px; text-transform: uppercase; }
.pv-tiny  { font-size: 7px; }
.pv-mono  { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 9px; }
.pv-muted { color: var(--muted); }
.pv-accent{ color: var(--accent); }
.pv-hot   { color: var(--hot); }
.pv-ink   { color: var(--ink); }
.pv-b     { font-weight: 600; }
.pv-live  { color: var(--accent); font-size: 7px; line-height: 1; }

.pv-serif { font-family: ui-serif, "New York", Georgia, serif; font-weight: 600; }
.pv-brand { font-size: 15px; }
.pv-num   { font-size: 14px; }

.pv-hero {
  font-family: ui-serif, "New York", Georgia, serif; font-weight: 600;
  font-size: 44px; line-height: 1; text-align: center; margin-top: 4px;
}
.pv-hero-suffix { font-size: 20px; color: var(--muted); margin-left: 2px; }

.pv-bar { background: var(--track); height: 4px; border-radius: 2px; overflow: hidden; }
.pv-bar-fill { height: 100%; border-radius: 2px; }
.pv-bg-accent { background: var(--accent); }
.pv-bg-hot    { background: var(--hot); }

.pv-limit-row { display: flex; flex-direction: column; gap: 3px; }
.pv-divider { height: 1px; background: var(--track); margin: 2px 0; }

.pv-sess-list { display: flex; flex-direction: column; gap: 4px; margin-top: 3px; }
.pv-sess { font-size: 9px; gap: 6px; }
.pv-sess-proj  { flex: 0 0 92px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pv-sess-model { flex: 0 0 64px; font-size: 8.5px; }
.pv-sess-age   { flex: 0 0 26px; font-size: 8.5px; }
.pv-sess-tok   { font-variant-numeric: tabular-nums; font-size: 9px; color: var(--ink); }

.pv-spark { display: flex; align-items: flex-end; gap: 3px; height: 26px; }
.pv-spark-bar { flex: 1; border-radius: 1px; min-height: 3px; }

.pv-mark { flex-shrink: 0; display: block; }
`;
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
