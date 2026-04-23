# claude-widgets

Home-screen iOS widgets for [Claude Code](https://claude.com/claude-code) usage.
Zero tokens consumed. No third-party servers. Your Mac, your Tailnet, your data.

<img width="1197" height="597" alt="image" src="https://github.com/user-attachments/assets/be2d52d9-6330-4bc8-9178-02d3adca184f" />

## What it does

Three widgets for your iPhone home screen that show how close you are to your
Claude Code rate limits — so you can pace work, hit caps deliberately, and stop
getting surprised by the 5-hour session window.

- **Small** — one hero metric at a glance

<img width="498" height="1080" alt="compressed_IMG_0349" src="https://github.com/user-attachments/assets/7854b511-c805-497c-8894-b463fb8dd2ec" />


- **Medium** — both rate-limit bars + current session
- **Large** — everything: limits, session, today's cost, 7-day trend, top projects

<img width="498" height="1080" alt="compressed_IMG_0348" src="https://github.com/user-attachments/assets/d9290271-6c42-4bc3-9179-d6b440aaccc1" />

<img width="1290" height="996" alt="IMG_0350" src="https://github.com/user-attachments/assets/ba25ec42-49c9-4040-973d-260cef065e4d" />


Powered by the Claude Code [statusline hook][statusline] — the same channel the
CLI itself uses. No OAuth replay, no scraping, no ToS risk.

[statusline]: https://docs.claude.com/en/docs/claude-code/statusline

## How it works

```
Claude Code  ──stdin JSON──►  statusline hook  ──►  ~/.cache/claude-usage.json
                                                              │
                                                              ▼
                                              launchd HTTP server on Tailnet IP
                                                              │
                                                              ▼
                                                  Scriptable widget on iPhone
```

Every time Claude Code refreshes the TUI, it pipes a JSON blob with the full
`rate_limits` object into our statusline script. The script persists it
atomically to `~/.cache/claude-usage.json` and echoes a short string back for
the terminal. A tiny Python `http.server` bound to the Mac's Tailscale IP
serves that JSON inside your private tailnet only. The iPhone widget
([Scriptable][scriptable]) fetches it every few minutes.

[scriptable]: https://scriptable.app

## Requirements

- macOS with [Claude Code][cc] signed in (any plan that returns `rate_limits`)
- [Tailscale][ts] on Mac and iPhone, both on the same tailnet
- [Scriptable][scriptable] on iPhone (free)
- Your Mac stays online while you want fresh data (it's fine if it sleeps —
  widget will gray out and say "Mac asleep")

[cc]: https://claude.com/claude-code
[ts]: https://tailscale.com

## Install

```bash
git clone https://github.com/lyfar/claude-widgets.git
cd claude-widgets
./install.sh
```

`install.sh` will:

1. Drop `statusline/writer.sh` into `~/bin/` and wire it into `~/.claude/settings.json`
2. Install `launchd/com.claude-widgets.server.plist` bound to your Tailscale IP
3. Print the URL you'll paste into the Scriptable widget

Then on iPhone:

1. Install Scriptable from the App Store
2. Open one of `widgets/{small,medium,large}.js`, copy contents into a new Scriptable script
3. Add a Scriptable widget to your home screen, pick the script
4. Done.

## Privacy

- **No network calls to Anthropic from this project.** We read data Claude Code
  hands us; we never replay your OAuth token or hit `/api/oauth/usage`.
- **No cloud.** The JSON lives on your Mac and is served only on your Tailnet.
- **No telemetry.** This repo has no analytics, no phone-home.
- Fully inspectable — every line is shell, Python, or JavaScript. Read it.

## Status

Early alpha. Medium widget works; small and large are in design. Lock-screen
widgets planned.

## License

MIT
