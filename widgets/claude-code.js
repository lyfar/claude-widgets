// Claude Code Widget — universal. One script for all sizes (small/medium/large)
// and all lock-screen families. Size auto-detected via config.widgetFamily.
// Theme: 'auto' (default, follows system), or override per-widget by setting
// the widget's Parameter to "light" or "dark" in iOS widget edit.

const USAGE_URL = "http://100.68.216.93:8787/claude-usage.json";
const STALE_MINUTES = 30;

const MASCOT_PNG_B64 = "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";
const MASCOT_RATIO = 447 / 671;
let _mascotImage = null;
function mascotImage() {
  if (!_mascotImage) {
    _mascotImage = Image.fromData(Data.fromBase64String(MASCOT_PNG_B64));
  }
  return _mascotImage;
}
function mascotSize(w) { return new Size(w, Math.round(w * MASCOT_RATIO)); }

const THEME = {
  light: {
    bg: new Color("#F5F4EE"),
    ink: new Color("#141413"),
    muted: new Color("#8C857A"),
    accent: new Color("#CC785C"),
    track: new Color("#E6E4DA"),
    hot: new Color("#B64A2E"),
  },
  dark: {
    bg: new Color("#1F1E1C"),
    ink: new Color("#F5F4EE"),
    muted: new Color("#8C857A"),
    accent: new Color("#D97757"),
    track: new Color("#2B2A27"),
    hot: new Color("#E84A2E"),
  },
};

function pickPalette() {
  const p = (args.widgetParameter || "").trim().toLowerCase();
  if (p === "light") return THEME.light;
  if (p === "dark") return THEME.dark;
  return Device.isUsingDarkAppearance() ? THEME.dark : THEME.light;
}

function serif(size, weight) {
  weight = weight || "medium";
  const name =
    weight === "bold" ? "NewYorkLarge-Bold"
    : weight === "semibold" ? "NewYorkLarge-Semibold"
    : weight === "medium" ? "NewYorkLarge-Medium"
    : "NewYorkLarge-Regular";
  return new Font(name, size);
}
function mono(size, weight) {
  return weight === "bold" ? Font.boldMonospacedSystemFont(size)
    : weight === "medium" ? Font.mediumMonospacedSystemFont(size)
    : Font.regularMonospacedSystemFont(size);
}

function fmtReset(raw) {
  if (raw == null) return "";
  const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
  const min = Math.max(0, Math.round((d - new Date()) / 60000));
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const days = Math.floor(h / 24), hh = h % 24;
  return hh ? `${days}d ${hh}h` : `${days}d`;
}
function ageMin(iso) {
  if (!iso) return null;
  const d = typeof iso === "number" ? new Date(iso * 1000) : new Date(iso);
  return Math.round((new Date() - d) / 60000);
}

function drawBar(width, height, pct, p) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const r = height / 2;
  ctx.setFillColor(p.track);
  const track = new Path();
  track.addRoundedRect(new Rect(0, 0, width, height), r, r);
  ctx.addPath(track);
  ctx.fillPath();
  const c = Math.max(0, Math.min(100, pct));
  if (c > 0) {
    const fillW = Math.max(height, (width * c) / 100);
    ctx.setFillColor(c >= 90 ? p.hot : p.accent);
    const f = new Path();
    f.addRoundedRect(new Rect(0, 0, fillW, height), r, r);
    ctx.addPath(f);
    ctx.fillPath();
  }
  return ctx.getImage();
}

function freshnessText(age, stale) {
  if (age == null) return "—";
  if (age < 2) return "live";
  if (age > 120) return `Mac asleep · ${Math.floor(age / 60)}h ago`;
  if (stale) return `stale · ${age}m`;
  return `updated ${age}m ago`;
}

// ─── Layouts ────────────────────────────────────────────────────────

function layoutSmall(w, p, data) {
  const rl = data.rate_limits || {};
  const five = rl.five_hour?.used_percentage ?? 0;
  const seven = rl.seven_day?.used_percentage ?? 0;
  const hero = Math.max(five, seven);
  const heroLabel = five >= seven ? "5H" : "7D";
  const resets = five >= seven ? rl.five_hour?.resets_at : rl.seven_day?.resets_at;

  const head = w.addStack();
  head.layoutHorizontally();
  head.centerAlignContent();
  const mark = head.addImage(mascotImage());
  mark.imageSize = mascotSize(28);
  head.addSpacer();
  const lbl = head.addText(heroLabel);
  lbl.font = mono(10, "semibold");
  lbl.textColor = p.muted;

  w.addSpacer(2);
  const pctTxt = w.addText(`${Math.round(hero)}%`);
  pctTxt.font = serif(42, "semibold");
  pctTxt.textColor = hero >= 90 ? p.hot : p.ink;
  pctTxt.centerAlignText();
  pctTxt.minimumScaleFactor = 0.7;
  pctTxt.lineLimit = 1;

  const reset = w.addText(fmtReset(resets));
  reset.font = mono(9);
  reset.textColor = p.muted;
  reset.centerAlignText();
  reset.minimumScaleFactor = 0.7;
  reset.lineLimit = 1;

  w.addSpacer(5);
  const bar = w.addImage(drawBar(130, 5, hero, p));
  bar.imageSize = new Size(130, 5);
  bar.centerAlignImage();
  w.addSpacer();

  const age = ageMin(data.updated_at);
  const stale = age != null && age > STALE_MINUTES;
  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const dot = foot.addText("●");
  dot.font = Font.systemFont(7);
  dot.textColor = stale ? p.hot : p.accent;
  foot.addSpacer(4);
  const ft = foot.addText(
    age == null ? "—"
    : age < 2 ? "live"
    : age > 120 ? `${Math.floor(age / 60)}h ago`
    : stale ? `${age}m stale`
    : `${age}m ago`
  );
  ft.font = mono(9);
  ft.textColor = p.muted;
  ft.minimumScaleFactor = 0.7;
  ft.lineLimit = 1;
}

function addLimitRow(w, p, label, pct, resetsAt) {
  pct = Math.round(pct || 0);
  const top = w.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  const lbl = top.addText(label.toUpperCase());
  lbl.font = mono(9, "medium");
  lbl.textColor = p.muted;
  top.addSpacer();
  const pctTxt = top.addText(`${pct}%`);
  pctTxt.font = serif(18, "semibold");
  pctTxt.textColor = pct >= 90 ? p.hot : p.ink;

  w.addSpacer(4);
  const bar = w.addImage(drawBar(300, 6, pct, p));
  bar.imageSize = new Size(300, 6);
  w.addSpacer(3);

  const hint = w.addStack();
  hint.layoutHorizontally();
  hint.addSpacer();
  const reset = hint.addText(`resets in ${fmtReset(resetsAt)}`);
  reset.font = mono(9);
  reset.textColor = p.muted;
}

function layoutMedium(w, p, data) {
  const head = w.addStack();
  head.layoutHorizontally();
  head.centerAlignContent();
  const mark = head.addImage(mascotImage());
  mark.imageSize = mascotSize(36);
  head.addSpacer(10);
  const brand = head.addText("Claude Code");
  brand.font = serif(18, "medium");
  brand.textColor = p.ink;
  head.addSpacer();
  const age = ageMin(data.updated_at);
  const stale = age != null && age > STALE_MINUTES;
  const dot = head.addText("●");
  dot.font = Font.systemFont(8);
  dot.textColor = stale ? p.hot : p.accent;

  w.addSpacer(10);
  const rl = data.rate_limits || {};
  addLimitRow(w, p, "session · 5h", rl.five_hour?.used_percentage ?? 0, rl.five_hour?.resets_at);
  w.addSpacer(10);
  addLimitRow(w, p, "weekly · 7d", rl.seven_day?.used_percentage ?? 0, rl.seven_day?.resets_at);
  w.addSpacer();

  const foot = w.addStack();
  foot.layoutHorizontally();
  const ft = foot.addText(freshnessText(age, stale));
  ft.font = mono(9);
  ft.textColor = p.muted;
  foot.addSpacer();
  const plan = foot.addText("max");
  plan.font = mono(9, "medium");
  plan.textColor = p.muted;
}

function fmtTok(n) {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B tok`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M tok`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K tok`;
  return `${n} tok`;
}
// "Opus 4.7 (1M context)" → "Opus 4.7" — drop parenthetical for display.
function shortModel(m) {
  if (!m) return null;
  const i = m.indexOf(" (");
  return i > 0 ? m.slice(0, i) : m;
}
// Home workspace renders as "~"; long names truncate.
function shortProject(name) {
  if (!name) return "?";
  if (name === "egorlyfar") return "~";
  if (name.length > 16) return name.slice(0, 15) + "…";
  return name;
}

function addDivider(w, p) {
  const line = w.addText("─".repeat(60));
  line.font = mono(6);
  line.textColor = p.track;
  line.lineLimit = 1;
}

// 7-day spark bars. Accent color; hot for ≥ 90% of window max.
function drawSpark(width, height, values, p) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const n = values.length;
  if (!n) return ctx.getImage();
  const max = Math.max(1e-6, ...values);
  const gap = 3;
  const barW = Math.max(4, Math.floor((width - gap * (n - 1)) / n));
  for (let i = 0; i < n; i++) {
    const v = values[i] || 0;
    const frac = v / max;
    const bh = Math.max(2, Math.round(frac * height));
    const x = i * (barW + gap);
    const y = height - bh;
    ctx.setFillColor(frac >= 0.9 ? p.hot : p.accent);
    const path = new Path();
    path.addRoundedRect(new Rect(x, y, barW, bh), 1.5, 1.5);
    ctx.addPath(path);
    ctx.fillPath();
  }
  return ctx.getImage();
}

// Horizontal project bar (rounded, track + accent fill).
function fmtAge(min) {
  if (min == null || min < 0) return "—";
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}

const LARGE_MAX_SESSIONS = 4;
const LARGE_COL_PROJ = 96;
const LARGE_COL_MODEL = 78;
const LARGE_COL_AGE = 40;

function layoutLarge(w, p, data) {
  const rl = data.rate_limits || {};
  const s = data.session || {};
  const today = data.today || {};
  const week = data.seven_days || [];
  const openSessions = (data.open_sessions || []).slice(0, LARGE_MAX_SESSIONS);
  const cacheRatio = data.cache_ratio;
  const age = ageMin(data.updated_at);
  const stale = age != null && age > STALE_MINUTES;

  // ─── TOP: header + rate-limit rows (pinned to top edge) ─────────────
  const head = w.addStack();
  head.layoutHorizontally();
  head.bottomAlignContent();
  const mark = head.addImage(mascotImage());
  mark.imageSize = mascotSize(26);
  head.addSpacer(8);
  const brand = head.addText("Claude Code");
  brand.font = serif(20, "medium");
  brand.textColor = p.ink;
  head.addSpacer();
  const dot = head.addText("●");
  dot.font = Font.systemFont(9);
  dot.textColor = stale ? p.hot : p.accent;

  w.addSpacer(12);
  addLimitRow(w, p, "session · 5h", rl.five_hour?.used_percentage ?? 0, rl.five_hour?.resets_at);
  w.addSpacer(8);
  addLimitRow(w, p, "weekly · 7d", rl.seven_day?.used_percentage ?? 0, rl.seven_day?.resets_at);

  w.addSpacer(10);
  addDivider(w, p);
  w.addSpacer(8);

  // ─── MIDDLE: OPEN SESSIONS table (up to 4 rows, strict columns) ─────
  const osHead = w.addStack();
  osHead.layoutHorizontally();
  osHead.centerAlignContent();
  const osLbl = osHead.addText("OPEN SESSIONS");
  osLbl.font = mono(9, "medium");
  osLbl.textColor = p.muted;
  osHead.addSpacer();
  const osCount = osHead.addText(`${(data.open_sessions || []).length}`);
  osCount.font = mono(9, "medium");
  osCount.textColor = p.muted;
  w.addSpacer(6);

  if (!openSessions.length) {
    const empty = w.addText("— no active sessions —");
    empty.font = mono(10);
    empty.textColor = p.muted;
  } else {
    const currentSid = s.session_id;
    for (let i = 0; i < openSessions.length; i++) {
      const os = openSessions[i];
      const isCurrent = currentSid && os.session_id === currentSid;

      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      // Project column ── current session highlighted in accent + medium.
      const projCol = row.addStack();
      projCol.size = new Size(LARGE_COL_PROJ, 14);
      const nm = projCol.addText(shortProject(os.proj));
      nm.font = mono(11, isCurrent ? "medium" : "regular");
      nm.textColor = isCurrent ? p.accent : p.ink;
      nm.lineLimit = 1;

      const modelCol = row.addStack();
      modelCol.size = new Size(LARGE_COL_MODEL, 14);
      const md = modelCol.addText(os.model || "—");
      md.font = mono(10);
      md.textColor = p.muted;
      md.lineLimit = 1;

      const ageCol = row.addStack();
      ageCol.size = new Size(LARGE_COL_AGE, 14);
      const ag = ageCol.addText(fmtAge(os.age_min));
      ag.font = mono(10);
      ag.textColor = p.muted;
      ag.lineLimit = 1;

      row.addSpacer();
      const tk = row.addText(os.tokens_today ? fmtTok(os.tokens_today) : "—");
      tk.font = mono(10, "medium");
      tk.textColor = p.ink;
      tk.lineLimit = 1;

      if (i < openSessions.length - 1) w.addSpacer(5);
    }
  }

  // Flex spacer ── fills middle so the 7-DAY block pins to the bottom edge.
  w.addSpacer();

  // ─── BOTTOM: 7-DAY USAGE + footer (pinned to bottom edge) ───────────
  addDivider(w, p);
  w.addSpacer(8);

  const sHead = w.addStack();
  sHead.layoutHorizontally();
  sHead.centerAlignContent();
  const sL = sHead.addText("7-DAY USAGE");
  sL.font = mono(9, "medium");
  sL.textColor = p.muted;
  sHead.addSpacer();
  const sSub = sHead.addText(`today ${fmtTok(today.tokens)}`);
  sSub.font = mono(9);
  sSub.textColor = p.muted;
  w.addSpacer(6);

  const toks = week.map((d) => d.tokens || 0);
  if (toks.length) {
    const sparkImg = w.addImage(drawSpark(332, 26, toks, p));
    sparkImg.imageSize = new Size(332, 26);
  }
  w.addSpacer(6);

  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const fdot = foot.addText("●");
  fdot.font = Font.systemFont(7);
  fdot.textColor = stale ? p.hot : p.accent;
  foot.addSpacer(5);
  const ft = foot.addText(freshnessText(age, stale));
  ft.font = mono(9);
  ft.textColor = p.muted;
  foot.addSpacer();
  if (cacheRatio != null) {
    const ch = foot.addText(`cache ${Math.round(cacheRatio * 100)}%`);
    ch.font = mono(9);
    ch.textColor = p.muted;
    foot.addSpacer(10);
  }
  const plan = foot.addText("max");
  plan.font = mono(9, "medium");
  plan.textColor = p.muted;
}

// ─── Lock-screen layouts ────────────────────────────────────────────

function layoutLockInline(w, p, data) {
  const rl = data.rate_limits || {};
  const five = Math.round(rl.five_hour?.used_percentage ?? 0);
  const seven = Math.round(rl.seven_day?.used_percentage ?? 0);
  const t = w.addText(`✻ 5H ${five}% · 7D ${seven}%`);
  t.font = Font.mediumSystemFont(12);
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.6;
}

function layoutLockRectangular(w, p, data) {
  const rl = data.rate_limits || {};
  const head = w.addStack();
  head.layoutHorizontally();
  head.centerAlignContent();
  const mark = head.addImage(mascotImage());
  mark.imageSize = mascotSize(12);
  head.addSpacer(5);
  const brand = head.addText("Claude Code");
  brand.font = serif(11, "medium");
  brand.lineLimit = 1;
  brand.minimumScaleFactor = 0.7;

  w.addSpacer(3);
  for (const [label, pct] of [
    ["5H", Math.round(rl.five_hour?.used_percentage ?? 0)],
    ["7D", Math.round(rl.seven_day?.used_percentage ?? 0)],
  ]) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    const l = row.addText(label);
    l.font = mono(8, "semibold");
    l.lineLimit = 1;
    row.addSpacer(4);
    const bar = row.addImage(drawBar(70, 3, pct, p));
    bar.imageSize = new Size(70, 3);
    row.addSpacer(4);
    const pctTxt = row.addText(`${pct}%`);
    pctTxt.font = mono(8);
    pctTxt.lineLimit = 1;
    pctTxt.minimumScaleFactor = 0.7;
    w.addSpacer(1);
  }
}

function layoutLockCircular(w, p, data) {
  const rl = data.rate_limits || {};
  const five = Math.round(rl.five_hour?.used_percentage ?? 0);
  const seven = Math.round(rl.seven_day?.used_percentage ?? 0);
  const hero = Math.max(five, seven);
  const label = five >= seven ? "5H" : "7D";
  const pct = w.addText(`${hero}`);
  pct.font = Font.boldRoundedSystemFont(18);
  pct.centerAlignText();
  pct.lineLimit = 1;
  const l = w.addText(label);
  l.font = mono(8);
  l.textOpacity = 0.7;
  l.centerAlignText();
}

// ─── Dispatch ──────────────────────────────────────────────────────

async function build() {
  const family = (config.widgetFamily || "medium").toLowerCase();
  const p = pickPalette();
  const w = new ListWidget();
  w.backgroundColor = p.bg;

  let data;
  try {
    const req = new Request(USAGE_URL);
    req.timeoutInterval = 5;
    data = await req.loadJSON();
  } catch (e) {
    w.setPadding(14, 16, 12, 16);
    const err = w.addText("offline");
    err.font = serif(14, "medium");
    err.textColor = p.hot;
    const hint = w.addText("can't reach Mac");
    hint.font = mono(9);
    hint.textColor = p.muted;
    return w;
  }

  if (family === "small") { w.setPadding(14, 14, 10, 14); layoutSmall(w, p, data); }
  else if (family === "large") { w.setPadding(14, 16, 12, 16); layoutLarge(w, p, data); }
  else if (family === "accessoryinline") { layoutLockInline(w, p, data); }
  else if (family === "accessoryrectangular") { w.setPadding(6, 8, 6, 8); layoutLockRectangular(w, p, data); }
  else if (family === "accessorycircular") { w.setPadding(4, 4, 4, 4); layoutLockCircular(w, p, data); }
  else { w.setPadding(14, 16, 12, 16); layoutMedium(w, p, data); }
  return w;
}

const widget = await build();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  const family = (config.widgetFamily || args.widgetParameter || "medium").toLowerCase();
  if (family === "small") widget.presentSmall();
  else if (family === "large") widget.presentLarge();
  else widget.presentMedium();
}
Script.complete();
