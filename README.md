# openclaw-scrum

AI-adapted Scrum/Agile workflow skill for [OpenClaw](https://github.com/openclaw/openclaw) agents.

> Lightweight Scrum for AI agents. No meetings, no overhead — just the mechanics that drive autonomous delivery.

## What is this?

A skill that brings Scrum project management to AI agents running on OpenClaw. It manages **epics, stories, tasks, sprints, and kanban boards** through simple markdown + JSON tracking — no external tools needed.

### Key Features

- **Work Item Hierarchy** — Epics → Stories → Tasks, with Fibonacci story points
- **Sprint Management** — Plan, execute, review, and track velocity
- **Kanban Board** — Visual board output with standardized format
- **Heartbeat-driven Execution** — Agent auto-progresses sprint items during heartbeat cycles
- **Duty Decomposition** — Break recurring responsibilities into actionable stories
- **Velocity Tracking** — Historical metrics with trend analysis

### Designed for AI

Unlike traditional Scrum tools, this is built for how AI agents actually work:

- **No meetings** — Sprint ceremonies are automated
- **Shorter sprints** — 3-5 days (AI doesn't need weekends)
- **Heartbeat execution** — Agent picks up `todo` items automatically
- **Self-managing** — Agent is both dev team and scrum master

## Quick Start

### Install

```bash
# Via ClawHub (coming soon)
npx clawhub install openclaw-scrum

# Manual
git clone https://github.com/PeterHiroshi/openclaw-scrum.git
cp -r openclaw-scrum /path/to/your/openclaw/workspace/skills/scrum
```

### Initialize

```bash
node skills/scrum/scripts/init.mjs
```

### Usage

```
/scrum              → Show kanban board
/scrum sprint plan  → Start a new sprint
/scrum backlog add "Build auth system" --points 5
/scrum item S-001   → View item details
/scrum velocity     → View sprint metrics
```

## Commands

| Command | Purpose |
|---------|---------|
| `/scrum` or `/scrum board` | Kanban board (default) |
| `/scrum sprint [plan\|status\|review\|close]` | Sprint management |
| `/scrum backlog [add\|groom]` | Product backlog |
| `/scrum item <id\|create\|move\|edit>` | Work item CRUD |
| `/scrum velocity` | Velocity metrics |
| `/scrum epic <id>` | Epic overview |

## Board Preview

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 SPR-002 "Auth & Payments"
📅 Day 3/5 | ⏰ Deadline: 2026-04-01
📊 8/13 pts | 62% complete
▓▓▓▓▓▓░░░░ 62%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TODO (1)
  ○ S-005 Payment webhook handler [5pt] 🏷️ payments

🔨 IN PROGRESS (1)
  ◉ S-004 OAuth2 integration [5pt] → CC task running

✅ DONE (2)
  ✓ S-001 User registration [2pt]
  ✓ S-002 Login flow [1pt]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ Epic E-001 — 62% | 📦 Backlog: 5 items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Architecture

```
scrum/
├── SKILL.md              # Core skill (loaded by OpenClaw)
├── references/
│   └── commands.md       # Full command reference
├── scripts/
│   ├── init.mjs          # Initialize data directory
│   └── board.mjs         # Programmatic board renderer
└── data/                 # Example data structure
    └── .manifest.json
```

Data lives in your workspace's `data/scrum/` directory:

```
data/scrum/
├── backlog.json          # Product backlog
├── current-sprint.json   # Active sprint
├── sprints/archive/      # Sprint history
└── metrics/velocity.json # Velocity tracking
```

## Integration

- **OpenClaw Heartbeat** — Sprint execution hooks into agent heartbeat
- **Goals/Duties** — Goals create backlog items; duties generate recurring stories
- **Task Dispatch** — `in_progress` items trigger background task execution
- **Neogenome** — Extractable as `agile-workflow` gene for other agents

## License

MIT

## Credits

Built by [Forge](https://github.com/PeterHiroshi) 🔨 — an AI dev lead running on OpenClaw.
