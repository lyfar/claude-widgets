// claude-widgets — iPhone installer page.
// Tap-to-install uses a small bootstrap (the full widget is ~20 KB and
// Safari truncates URL schemes past ~30 KB, landing empty in Scriptable).
// Manual-copy keeps delivering the full pre-built widget for paste-in.

const SITE = location.origin;
const TEMPLATE_URL = "/assets/widget-template.js.txt";
const MASCOT_URL = "/assets/mascot.png";

const $ = (sel) => document.querySelector(sel);
const params = new URLSearchParams(location.search);

const ipEl = $("#ip");
const portEl = $("#port");
const btn = $("#install-btn");
const manual = $("#manual-source");
const copyBtn = $("#copy-btn");
const form = $("#config");

ipEl.value = params.get("ip") || "";
portEl.value = params.get("port") || "8787";

let template = "";
let mascotB64 = "";

Promise.all([
  fetch(TEMPLATE_URL).then((r) => r.text()),
  fetch(MASCOT_URL).then((r) => r.blob()).then(blobToBase64),
]).then(([t, b64]) => {
  template = t;
  mascotB64 = b64;
  refresh();
});

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result;
      resolve(s.slice(s.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function readConfig() {
  return { ip: ipEl.value.trim(), port: portEl.value.trim() || "8787" };
}

function buildFullWidget() {
  const c = readConfig();
  if (!c.ip || !template || !mascotB64) return "";
  const url = `http://${c.ip}:${c.port}/claude-usage.json`;
  return template
    .replace("__USAGE_URL__", url)
    .replace("__MASCOT_PNG_B64__", mascotB64);
}

function buildBootstrap() {
  const c = readConfig();
  if (!c.ip) return "";
  return `// claude-widgets bootstrap
// Fetches the full widget from ${SITE} and saves it as "Claude Code"
// in your Scriptable iCloud folder. Runs once, then you can delete this.

const SITE = ${JSON.stringify(SITE)};
const IP = ${JSON.stringify(c.ip)};
const PORT = ${JSON.stringify(c.port)};
const NAME = "Claude Code";

const tpl = await new Request(SITE + "/assets/widget-template.js.txt").loadString();
const png = await new Request(SITE + "/assets/mascot.png").load();
const b64 = png.toBase64String();
const code = tpl
  .replace("__USAGE_URL__", "http://" + IP + ":" + PORT + "/claude-usage.json")
  .replace("__MASCOT_PNG_B64__", b64);

const fm = FileManager.iCloud();
fm.writeString(fm.joinPath(fm.documentsDirectory(), NAME + ".js"), code);

const a = new Alert();
a.title = NAME + " installed";
a.message = "Long-press home screen → + → Scriptable → pick Small / Medium / Large → select " + NAME + ".";
a.addAction("Done");
await a.presentAlert();
Script.complete();
`;
}

function refresh() {
  manual.value = buildFullWidget();
  btn.disabled = !buildBootstrap();
}

form.addEventListener("input", refresh);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const src = buildBootstrap();
  if (!src) return;
  const url = `scriptable:///add?scriptName=${encodeURIComponent("Install Claude Code")}&scriptCode=${encodeURIComponent(src)}`;
  location.href = url;
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(manual.value);
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => (copyBtn.textContent = "Copy source"), 1600);
  } catch {
    manual.select();
    document.execCommand("copy");
  }
});

refresh();
