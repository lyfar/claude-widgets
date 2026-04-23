// claude-widgets — iPhone installer page.
// Reads ?ip=&port= from URL, lets user tweak, builds widget source with
// mascot PNG baked in as base64, opens Scriptable via URL scheme.

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

function buildSource() {
  const c = readConfig();
  if (!c.ip || !template || !mascotB64) return "";
  const url = `http://${c.ip}:${c.port}/claude-usage.json`;
  return template
    .replace("__USAGE_URL__", url)
    .replace("__MASCOT_PNG_B64__", mascotB64);
}

function refresh() {
  const src = buildSource();
  manual.value = src;
  btn.disabled = !src;
}

form.addEventListener("input", refresh);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const src = buildSource();
  if (!src) return;
  const url = `scriptable:///add?scriptName=${encodeURIComponent("Claude Code")}&scriptCode=${encodeURIComponent(src)}`;
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
