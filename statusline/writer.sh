#!/bin/bash
# Claude Code statusline hook for claude-widgets.
# Reads the statusline JSON on stdin, merges with the JSONL aggregator output,
# and writes the composite cache served to iPhone widgets via Tailscale.

set -u
CACHE="${HOME}/.cache/claude-usage.json"
AGG="${HOME}/.cache/claude-usage-agg.json"
AGGREGATOR="${HOME}/bin/claude-widgets-aggregator.py"
TMP="${CACHE}.tmp.$$"

INPUT="$(cat)"
if [ -z "$INPUT" ]; then
  echo "no input"
  exit 0
fi

# Refresh aggregate in the background if older than 90 seconds. Fire-and-forget
# so the statusline itself stays instant.
if [ -x "$AGGREGATOR" ]; then
  needs_refresh=1
  if [ -f "$AGG" ]; then
    if [ "$(( $(date +%s) - $(stat -f %m "$AGG") ))" -lt 90 ]; then
      needs_refresh=0
    fi
  fi
  [ "$needs_refresh" -eq 1 ] && ( "$AGGREGATOR" >/dev/null 2>&1 & )
fi

# Load the aggregate file as a jq variable (or {} if missing / malformed).
if [ -f "$AGG" ]; then
  AGG_JSON="$(cat "$AGG")"
else
  AGG_JSON="{}"
fi

PAYLOAD=$(printf '%s' "$INPUT" | jq -c \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson agg "$AGG_JSON" '
  if .rate_limits then
    {
      updated_at: $ts,
      rate_limits: .rate_limits,
      session: {
        model: (.model.display_name // .model.id // null),
        cost_usd: (.cost.total_cost_usd // null),
        duration_min: (if .cost.total_duration_ms then (.cost.total_duration_ms / 60000 | floor) else null end),
        lines_added: (.cost.total_lines_added // null),
        lines_removed: (.cost.total_lines_removed // null),
        ctx_pct: (.context_window.used_percentage // null),
        workspace: (.workspace.current_dir // .workspace.project_dir // null) | if . then (. | split("/") | last) else null end,
        session_id: (.session_id // null)
      }
    }
    + ($agg | del(.updated_at))
  else empty end
' 2>/dev/null)

if [ -n "$PAYLOAD" ]; then
  printf '%s\n' "$PAYLOAD" > "$TMP" && mv "$TMP" "$CACHE"
fi

# Render a compact line for the TUI.
printf '%s' "$INPUT" | jq -r '
  (.rate_limits // {}) as $r
  | [
      ($r.five_hour.used_percentage | if . then "5h:\(. | floor)%" else empty end),
      ($r.seven_day.used_percentage | if . then "7d:\(. | floor)%" else empty end)
    ]
  | if length == 0 then "claude" else join(" ") end
'
