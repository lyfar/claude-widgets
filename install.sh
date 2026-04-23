#!/usr/bin/env bash
# claude-widgets — one-shot installer for the Mac side.
#
# Usage:
#   curl -fsSL https://claude.egor.lol/install.sh | bash
#
# What it does:
#   1. Checks Tailscale is installed and logged in
#   2. Detects your Tailnet IPv4 address
#   3. Writes ~/bin/claude-widgets-writer.sh (statusline hook)
#   4. Patches ~/.claude/settings.json to wire the hook (with backup)
#   5. Installs a launchd plist that serves ~/.cache on your Tailnet IP
#   6. Prints a QR code that links to the iPhone installer site

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────
PORT="${CLAUDE_WIDGETS_PORT:-8787}"
SITE_URL="${CLAUDE_WIDGETS_SITE:-https://claude.egor.lol}"
CACHE_DIR="${HOME}/.cache"
BIN_DIR="${HOME}/bin"
WRITER="${BIN_DIR}/claude-widgets-writer.sh"
HELPER="${BIN_DIR}/claude-widgets"
SETTINGS="${HOME}/.claude/settings.json"
PLIST="${HOME}/Library/LaunchAgents/com.claude-widgets.server.plist"
LABEL="com.claude-widgets.server"

# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
dim()   { printf '\033[2m%s\033[0m\n' "$*"; }
ok()    { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '\033[33m!\033[0m %s\n' "$*"; }
die()   { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

bold "claude-widgets installer"
echo

# ─────────────────────────────────────────────────────────────────────
# 1. Preflight
# ─────────────────────────────────────────────────────────────────────
[[ "$(uname -s)" == "Darwin" ]] || die "macOS only (detected $(uname -s))"

TS_BIN="/usr/local/bin/tailscale"
[[ -x "$TS_BIN" ]] || TS_BIN="$(command -v tailscale || true)"
[[ -n "$TS_BIN" ]] || die "Tailscale not found. Install from https://tailscale.com/download"

TS_IP="$("$TS_BIN" ip -4 2>/dev/null | head -1 || true)"
[[ -n "$TS_IP" ]] || die "Tailscale not logged in. Run: sudo tailscale up"

command -v jq >/dev/null || die "jq not found. Install: brew install jq"
command -v python3 >/dev/null || die "python3 not found."

ok "Tailscale IP: ${TS_IP}"
ok "Port: ${PORT}"
mkdir -p "$BIN_DIR" "$CACHE_DIR" "$(dirname "$PLIST")"

# ─────────────────────────────────────────────────────────────────────
# 2. Writer script (statusline hook)
# ─────────────────────────────────────────────────────────────────────
cat > "$WRITER" <<'SCRIPT'
#!/bin/bash
# claude-widgets statusline hook.
# Captures the rate_limits block Claude Code sends us and writes it to
# ~/.cache/claude-usage.json atomically. Echoes a short string back for
# the TUI.
set -u
CACHE="${HOME}/.cache/claude-usage.json"
TMP="${CACHE}.tmp.$$"

INPUT="$(cat)"
[[ -z "$INPUT" ]] && { echo "no input"; exit 0; }

PAYLOAD=$(printf '%s' "$INPUT" | jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
  if .rate_limits then {updated_at: $ts, rate_limits: .rate_limits}
  else empty end' 2>/dev/null)

if [[ -n "$PAYLOAD" ]]; then
  printf '%s\n' "$PAYLOAD" > "$TMP" && mv "$TMP" "$CACHE"
fi

printf '%s' "$INPUT" | jq -r '
  (.rate_limits // {}) as $r
  | [($r.five_hour.used_percentage | if . then "5h:\(. | floor)%" else empty end),
     ($r.seven_day.used_percentage | if . then "7d:\(. | floor)%" else empty end)]
  | if length == 0 then "claude" else join(" ") end'
SCRIPT
chmod +x "$WRITER"
ok "Installed writer: ${WRITER}"

# ─────────────────────────────────────────────────────────────────────
# 3. Patch ~/.claude/settings.json
# ─────────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "$SETTINGS")"
if [[ -f "$SETTINGS" ]]; then
  cp "$SETTINGS" "${SETTINGS}.bak.claude-widgets.$(date +%s)"
  dim "  backup: ${SETTINGS}.bak.claude-widgets.*"
else
  echo '{}' > "$SETTINGS"
fi

tmp="$(mktemp)"
jq --arg cmd "$WRITER" '. + {
  statusLine: {
    type: "command",
    command: $cmd,
    padding: 0
  }
}' "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"
ok "Wired statusLine into ${SETTINGS}"

# ─────────────────────────────────────────────────────────────────────
# 4. Launchd plist
# ─────────────────────────────────────────────────────────────────────
if launchctl list | grep -q "$LABEL"; then
  launchctl unload "$PLIST" 2>/dev/null || true
fi

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>-m</string>
        <string>http.server</string>
        <string>${PORT}</string>
        <string>--bind</string>
        <string>${TS_IP}</string>
        <string>--directory</string>
        <string>${CACHE_DIR}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/claude-widgets-server.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/claude-widgets-server.err</string>
</dict>
</plist>
PLIST_EOF

launchctl load "$PLIST"
ok "Serving on http://${TS_IP}:${PORT}/"

# ─────────────────────────────────────────────────────────────────────
# 5. Install helper CLI (~/bin/claude-widgets)
# ─────────────────────────────────────────────────────────────────────
cat > "$HELPER" <<HELPER_EOF
#!/usr/bin/env bash
# claude-widgets — helper CLI. Reprint install URL/QR, show status, uninstall.
set -u
SITE_URL="${SITE_URL}"
PORT="${PORT}"
LABEL="${LABEL}"
PLIST="${PLIST}"
WRITER="${WRITER}"
SETTINGS="${SETTINGS}"
CACHE="\${HOME}/.cache/claude-usage.json"
TS_BIN="/usr/local/bin/tailscale"
[[ -x "\$TS_BIN" ]] || TS_BIN="\$(command -v tailscale || true)"

cmd="\${1:-qr}"
case "\$cmd" in
  url)
    IP="\$(\$TS_BIN ip -4 2>/dev/null | head -1)"
    echo "\${SITE_URL}/install/?ip=\${IP}&port=\${PORT}"
    ;;
  qr)
    IP="\$(\$TS_BIN ip -4 2>/dev/null | head -1)"
    URL="\${SITE_URL}/install/?ip=\${IP}&port=\${PORT}"
    echo
    echo "  \$URL"
    echo
    if command -v qrencode >/dev/null; then
      qrencode -t ANSIUTF8 "\$URL"
    else
      echo "  (install 'qrencode' via 'brew install qrencode' for a scannable QR)"
    fi
    ;;
  status)
    IP="\$(\$TS_BIN ip -4 2>/dev/null | head -1)"
    echo "Tailscale IP: \${IP:-(offline)}"
    if launchctl list | grep -q "\$LABEL"; then
      echo "Server:       running (launchd \$LABEL)"
    else
      echo "Server:       NOT running"
    fi
    if [[ -f "\$CACHE" ]]; then
      echo "Cache:        \$CACHE"
      cat "\$CACHE" | head -c 200; echo
    else
      echo "Cache:        not yet written (run a Claude Code session)"
    fi
    ;;
  uninstall)
    echo "Uninstalling claude-widgets..."
    launchctl unload "\$PLIST" 2>/dev/null || true
    rm -f "\$PLIST" "\$WRITER"
    echo "(Settings backup was saved next to \$SETTINGS — restore manually if needed.)"
    echo "Done. Also remove \$HOME/bin/claude-widgets if you want the CLI gone."
    ;;
  *)
    echo "Usage: claude-widgets [qr|url|status|uninstall]"
    exit 1
    ;;
esac
HELPER_EOF
chmod +x "$HELPER"
ok "Installed CLI: ${HELPER}"

# ─────────────────────────────────────────────────────────────────────
# 6. Prime the cache (so widget shows data immediately)
# ─────────────────────────────────────────────────────────────────────
[[ -f "${CACHE_DIR}/claude-usage.json" ]] || \
  echo '{"updated_at":"1970-01-01T00:00:00Z","rate_limits":{}}' > "${CACHE_DIR}/claude-usage.json"

# ─────────────────────────────────────────────────────────────────────
# 7. Print iPhone install URL + QR
# ─────────────────────────────────────────────────────────────────────
INSTALL_URL="${SITE_URL}/install/?ip=${TS_IP}&port=${PORT}"

echo
bold "Next step — install the widget on iPhone"
echo
echo "  Open this URL on your iPhone (on the same Tailnet):"
echo
bold "    ${INSTALL_URL}"
echo

if command -v qrencode >/dev/null; then
  qrencode -t ANSIUTF8 "$INSTALL_URL"
else
  dim "  (Install 'qrencode' via 'brew install qrencode' to get a scannable QR here.)"
fi

echo
ok "All set. Run a Claude Code session to populate live data — the statusline hook will write the cache on first render."
echo
dim "To reprint this QR later:  claude-widgets qr"
dim "To check status:           claude-widgets status"
