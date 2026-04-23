// claude-widgets — iPhone installer page.
// Scriptable has no URL-scheme "install" hook — only `run` and `open` for
// scripts that already exist. So the flow is: bake the widget source with
// the user's IP + mascot inlined, copy it, paste into Scriptable by hand.

const TEMPLATE_URL = "/assets/widget-template.js.txt";
const MASCOT_URL = "/assets/mascot.png";

const $ = (sel) => document.querySelector(sel);
const params = new URLSearchParams(location.search);

const ipEl = $("#ip");
const portEl = $("#port");
const copyBtn = $("#copy-btn");
const openBtn = $("#open-btn");
const source = $("#source");
const form = $("#config");
const status = $("#status");

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

function buildSource() {
  const ip = ipEl.value.trim();
  const port = portEl.value.trim() || "8787";
  if (!ip || !template || !mascotB64) return "";
  return template
    .replace("__USAGE_URL__", `http://${ip}:${port}/claude-usage.json`)
    .replace("__MASCOT_PNG_B64__", mascotB64);
}

function refresh() {
  const code = buildSource();
  source.value = code;
  const ready = !!code;
  copyBtn.disabled = !ready;
  openBtn.disabled = !ready;
  status.textContent = ready
    ? `Ready · ${Math.round(code.length / 1024)} KB`
    : "Enter your Mac's Tailscale IP above.";
}

form.addEventListener("input", refresh);

async function copySource() {
  const code = source.value;
  if (!code) return false;
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    source.focus();
    source.select();
    try { return document.execCommand("copy"); } catch { return false; }
  }
}

copyBtn.addEventListener("click", async () => {
  const ok = await copySource();
  copyBtn.textContent = ok ? "Copied ✓" : "Copy failed — select text manually";
  setTimeout(() => (copyBtn.textContent = "Copy widget code"), 1800);
});

openBtn.addEventListener("click", async () => {
  const ok = await copySource();
  if (ok) {
    openBtn.textContent = "Copied · opening Scriptable…";
    setTimeout(() => {
      location.href = "scriptable://";
    }, 250);
    setTimeout(() => (openBtn.textContent = "Copy + open Scriptable"), 2200);
  } else {
    openBtn.textContent = "Copy failed — select text below";
    setTimeout(() => (openBtn.textContent = "Copy + open Scriptable"), 2200);
  }
});

refresh();
