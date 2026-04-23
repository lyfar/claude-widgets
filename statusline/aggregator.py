#!/usr/bin/env python3
"""
claude-widgets aggregator.

Scans ~/.claude/projects/*/*.jsonl to compute the rollups the statusline hook
cannot see on its own:

  - today.sessions / today.tokens      — total activity today (local tz)
  - seven_days[7]                       — daily token totals, oldest → newest
  - open_sessions[]                     — Claude Code sessions that fired a
                                          message within ACTIVE_CUTOFF_MIN,
                                          excluding background daemons
                                          (.claude/, .claude-mem/, etc.)
  - cache_ratio                         — today's cache_read / cache_in ratio

No dollars: Egor is on a flat subscription — list-price USD is misleading.
Tokens + rate-limit percentages are the real numbers.

Output: ~/.cache/claude-usage-agg.json, atomic write. Fast (<1 s).
"""

import glob
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ACTIVE_CUTOFF_MIN = 15
MAX_OPEN_SESSIONS = 6
# Paths containing any of these segments are treated as background daemons
# (claude-mem observer, orphan folders) and excluded from "open sessions".
BACKGROUND_MARKERS = ("/.claude-mem/", "/.claude/")


def parse_ts(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def is_background(cwd):
    if not cwd:
        return True
    for m in BACKGROUND_MARKERS:
        if m in cwd:
            return True
    return False


def proj_name(cwd):
    if not cwd:
        return "?"
    # "/Users/egorlyfar" → "~"
    if cwd.rstrip("/").endswith("/egorlyfar"):
        return "~"
    return Path(cwd).name


def short_model(m):
    if not m:
        return None
    mm = m.lower()
    if "opus" in mm:
        return "Opus 4.7"
    if "sonnet" in mm:
        return "Sonnet 4.6"
    if "haiku" in mm:
        return "Haiku 4.5"
    return m


def main():
    now_utc = datetime.now(timezone.utc)
    today_local = datetime.now().astimezone().date()
    seven_start = today_local - timedelta(days=6)
    cutoff = now_utc - timedelta(minutes=ACTIVE_CUTOFF_MIN)

    day_tokens = defaultdict(int)
    day_sessions = defaultdict(set)
    cache_read_today = 0
    cache_in_today = 0

    # Per-JSONL aggregates for "open sessions" ranking.
    per_file = {}

    for path in glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")):
        try:
            mtime = datetime.fromtimestamp(os.path.getmtime(path), tz=timezone.utc)
            if mtime.date() < seven_start:
                continue

            tokens_today = 0
            last_ts = None
            last_model = None
            last_cwd = None
            last_sid = None

            with open(path, "r", errors="ignore") as f:
                for line in f:
                    if '"assistant"' not in line:
                        continue
                    try:
                        r = json.loads(line)
                    except Exception:
                        continue
                    if r.get("type") != "assistant":
                        continue
                    msg = r.get("message") or {}
                    u = msg.get("usage")
                    if not u:
                        continue
                    ts = parse_ts(r.get("timestamp"))
                    if not ts:
                        continue
                    d = ts.astimezone().date()
                    if d < seven_start:
                        continue
                    tot = (
                        u.get("input_tokens", 0)
                        + u.get("output_tokens", 0)
                        + u.get("cache_creation_input_tokens", 0)
                        + u.get("cache_read_input_tokens", 0)
                    )
                    day_tokens[d] += tot
                    sid = r.get("sessionId") or ""
                    if sid:
                        day_sessions[d].add(sid)
                    if d == today_local:
                        cache_read_today += u.get("cache_read_input_tokens", 0)
                        cache_in_today += (
                            u.get("input_tokens", 0)
                            + u.get("cache_creation_input_tokens", 0)
                        )
                        tokens_today += tot
                    if last_ts is None or ts > last_ts:
                        last_ts = ts
                    if msg.get("model"):
                        last_model = msg["model"]
                    if r.get("cwd"):
                        last_cwd = r["cwd"]
                    if sid:
                        last_sid = sid

            if last_ts is not None:
                per_file[path] = {
                    "cwd": last_cwd,
                    "model": last_model,
                    "last_ts": last_ts,
                    "sid": last_sid,
                    "tokens_today": tokens_today,
                }
        except (OSError, IOError):
            continue

    # Build open_sessions: one row per currently-active user session, sorted
    # by recency. Dedupe by cwd so multiple restarts in the same folder don't
    # spam the list (keep the most recent).
    candidates = [
        v for v in per_file.values()
        if v["last_ts"] >= cutoff and not is_background(v["cwd"])
    ]
    candidates.sort(key=lambda x: x["last_ts"], reverse=True)
    seen_cwd = set()
    open_sessions = []
    for c in candidates:
        key = c["cwd"] or ""
        if key in seen_cwd:
            continue
        seen_cwd.add(key)
        age_min = int((now_utc - c["last_ts"]).total_seconds() / 60)
        open_sessions.append({
            "proj": proj_name(c["cwd"]),
            "model": short_model(c["model"]),
            "session_id": c["sid"],
            "age_min": age_min,
            "tokens_today": c["tokens_today"],
        })
        if len(open_sessions) >= MAX_OPEN_SESSIONS:
            break

    seven = []
    for i in range(6, -1, -1):
        d = today_local - timedelta(days=i)
        seven.append({"date": d.isoformat(), "tokens": day_tokens[d]})

    total_cache_in = cache_read_today + cache_in_today
    cache_ratio = round(cache_read_today / total_cache_in, 4) if total_cache_in else 0.0

    out = {
        "updated_at": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "today": {
            "sessions": len(day_sessions[today_local]),
            "tokens": day_tokens[today_local],
        },
        "seven_days": seven,
        "open_sessions": open_sessions,
        "cache_ratio": cache_ratio,
    }

    cache = os.path.expanduser("~/.cache/claude-usage-agg.json")
    os.makedirs(os.path.dirname(cache), exist_ok=True)
    tmp = f"{cache}.tmp.{os.getpid()}"
    with open(tmp, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    os.replace(tmp, cache)

    json.dump(out, sys.stdout, separators=(",", ":"))
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
