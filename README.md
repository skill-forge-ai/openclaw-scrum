# openclaw-scrum

AI-adapted Scrum/Agile workflow skill for [OpenClaw](https://github.com/openclaw/openclaw) agents and [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

> Lightweight Scrum for AI agents. No meetings, no overhead — just the mechanics that drive autonomous delivery.

## What is this?

A skill that brings Scrum project management to AI coding agents. It manages **epics, stories, tasks, sprints, and kanban boards** through simple markdown + JSON tracking — no external tools or dependencies needed.

### Key Features

- **Work Item Hierarchy** — Epics → Stories → Tasks, with Fibonacci story points
- **Sprint Management** — Plan, execute, review, and track velocity automatically
- **Kanban Board** — Standardized text-based board output
- **Heartbeat-driven Execution** — Agent auto-progresses sprint items during heartbeat cycles
- **Velocity Tracking** — Historical metrics with trend analysis and capacity suggestions
- **Sprint Review/Retro** — Automated review, archival, and retrospective analysis
- **Zero Dependencies** — Pure Node.js, no `node_modules`

### Designed for AI

Unlike traditional Scrum tools, this is built for how AI agents actually work:

- **No meetings** — Sprint ceremonies are automated
- **Shorter sprints** — 3-5 days (AI doesn't need weekends)
- **Heartbeat execution** — Agent picks up `todo` items automatically
- **Self-managing** — Agent is both dev team and scrum master

## Quick Start

### Option A: Claude Code

```bash
git clone https://github.com/skill-forge-ai/openclaw-scrum.git
cp -r openclaw-scrum/cc-skill ~/.claude/skills/scrum
```

### Option B: OpenClaw

```bash
# Via ClawHub
npx clawhub install openclaw-scrum

# Or manual
git clone https://github.com/skill-forge-ai/openclaw-scrum.git
cp -r openclaw-scrum /path/to/workspace/skills/scrum
```

### Option C: Other Agents (Codex, Gemini CLI, Cursor)

Copy the `cc-skill/` directory to your agent's skill/instruction folder. The `SKILL.md` is self-contained with all context needed.

### Initialize

```bash
node scripts/init.mjs
```

This creates the `data/scrum/` directory structure. Optionally copy example data:

```bash
cp cc-skill/templates/backlog.json data/scrum/backlog.json
cp cc-skill/templates/current-sprint.json data/scrum/current-sprint.json
mkdir -p data/scrum/metrics
cp cc-skill/templates/velocity.json data/scrum/metrics/velocity.json
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

See [references/commands.md](references/commands.md) for full command details.

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

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/init.mjs` | Initialize data directory | `node scripts/init.mjs` |
| `scripts/board.mjs` | Render kanban board | `node scripts/board.mjs [--json] [--project <name>]` |
| `scripts/velocity.mjs` | Velocity metrics & trends | `node scripts/velocity.mjs [--json] [--project <name>]` |
| `scripts/sprint-review.mjs` | Sprint review/retro | `node scripts/sprint-review.mjs [--json] [--dry-run]` |
| `scripts/release.sh` | Release automation | `./scripts/release.sh <version> [--dry-run]` |

## Architecture

```
openclaw-scrum/
├── SKILL.md              # Core skill (loaded by OpenClaw)
├── README.md             # This file
├── CONTRIBUTING.md       # How to contribute
├── LICENSE               # MIT
├── cc-skill/             # Self-contained CC skill package
│   ├── SKILL.md          # Unified skill definition
│   ├── scripts/          # All executable scripts
│   ├── templates/        # Example data files
│   └── references/       # Command documentation
├── scripts/              # Source scripts + tests
│   ├── __tests__/        # Test files
│   ├── init.mjs
│   ├── board.mjs
│   ├── velocity.mjs
│   ├── sprint-review.mjs
│   └── release.sh
├── references/
│   └── commands.md       # Full command reference
├── examples/             # Quick-start sample data
└── data/
    └── .manifest.json    # Data layout description
```

## Integration Points

- **OpenClaw Heartbeat** — Sprint execution hooks into agent heartbeat cycles
- **Goals/Duties** — Goals create backlog items; duties generate recurring stories
- **Task Dispatch** — `in_progress` items trigger background task execution
- **Multi-project** — Isolated backlogs/sprints per project with unified overview

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR process.

## License

MIT

## Credits

Built by [Forge](https://github.com/PeterHiroshi) 🔨 — an AI dev lead running on OpenClaw.
