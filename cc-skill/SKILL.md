---
name: openclaw-scrum
description: >
  AI-adapted Scrum/Agile project management for autonomous development workflows.
  Manages epics, stories, tasks, sprints, and kanban boards through markdown + JSON
  tracking. Lightweight, zero-dependency, designed for AI agents that ship code
  autonomously.
version: 1.0.0
---

# Scrum — AI-Adapted Agile Workflow

Lightweight Scrum framework adapted for AI agents. No meetings, no overhead — just
the mechanics that drive autonomous delivery.

## Quick Start

1. Initialize: `node scripts/init.mjs` (creates `data/scrum/` structure)
2. Add work: Create items in `data/scrum/backlog.json`
3. Plan sprint: Move items to `data/scrum/current-sprint.json`
4. View board: Use `scripts/board.mjs` or render from JSON

## Data Layout

```
data/scrum/
├── backlog.json          # Product backlog (all items not in a sprint)
├── current-sprint.json   # Active sprint metadata + items
├── sprints/              # Sprint history
│   └── archive/          # Completed sprints (SPR-001.json, ...)
└── metrics/
    └── velocity.json     # Rolling velocity data
```

## Core Concepts

### Work Item Hierarchy

| Level | ID Format | Scope | Example |
|-------|-----------|-------|---------|
| **Epic** | `E-xxx` | Multi-sprint deliverable | "Auth System v1.0" |
| **Story** | `S-xxx` | Sprint-sized, delivers user value | "User registration" |
| **Task** | `T-xxx` | Atomic unit, ≤4h work | "Write migration" |

### Item Schema (JSON)

```json
{
  "id": "S-001",
  "type": "story",
  "title": "User registration with email verification",
  "description": "As a user, I want to register with my email",
  "epic": "E-001",
  "status": "todo",
  "priority": "P1",
  "points": 3,
  "tasks": ["T-001", "T-002"],
  "sprint": "SPR-001",
  "created": "2026-03-23",
  "updated": "2026-03-23",
  "labels": ["auth", "backend"],
  "acceptance": ["Email verified before login", "Password strength validation"],
  "assignee": "agent"
}
```

### Kanban Statuses

```
backlog → todo → in_progress → review → done → archived
```

### Story Points (Fibonacci)

| Points | Scope |
|--------|-------|
| 1 | Config change, trivial fix |
| 2 | Simple feature, single file |
| 3 | Standard feature, 2-3 files |
| 5 | Complex feature, new module |
| 8 | Large feature, needs design |
| 13 | Should be broken into stories |

## Board Output Format

**Strict template — agents must follow exactly:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 SPR-{id} "{name}"
📅 Day {n}/{total} | ⏰ Deadline: {date}
📊 {done_pts}/{total_pts} pts | {percent}% complete
▓▓▓▓▓▓▓▓░░ {percent}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TODO ({count})
  ○ {id} {title} [{pts}pt] {labels}

🔨 IN PROGRESS ({count})
  ◉ {id} {title} [{pts}pt] → {context}

👀 REVIEW ({count})
  ◎ {id} {title} [{pts}pt] → PR #{n}

✅ DONE ({count})
  ✓ {id} {title} [{pts}pt]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ Epic {id} — {percent}% | 📦 Backlog: {n} items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Rules:**
1. Progress bar: `▓` (done) + `░` (remaining), 10 chars total
2. Empty columns: skip entirely
3. Labels: `🏷️ label1, label2` (only if present)
4. Separator: `━` × 35 characters

## Workflows

### Sprint Planning

1. Read `backlog.json` — sort by priority
2. Calculate capacity (default: 20 pts per 5-day sprint)
3. Pull highest-priority stories up to capacity
4. Create `current-sprint.json` with items set to `todo`
5. Break stories into tasks if needed

### Sprint Execution (Heartbeat-driven)

Each heartbeat cycle:
1. Pick highest-priority `todo` → set `in_progress` → execute
2. Check `in_progress` → update from task runner
3. Check `review` → poll PR status → `done` if merged
4. Sprint end date reached → trigger Sprint Review

### Sprint Review & Retro

Use `scripts/sprint-review.mjs`:
1. Calculate velocity (completed story points)
2. Move incomplete stories back to backlog
3. Generate summary (shipped, missed, blockers)
4. Archive to `sprints/archive/SPR-xxx.json`
5. Update `metrics/velocity.json`

### Velocity Tracking

Use `scripts/velocity.mjs`:
1. Rolling average over configurable window (default: 5 sprints)
2. Trend analysis (improving / declining / stable)
3. Next sprint capacity suggestion

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/init.mjs` | Initialize data directory | `node scripts/init.mjs` |
| `scripts/board.mjs` | Render kanban board | `node scripts/board.mjs [--json] [--project name]` |
| `scripts/velocity.mjs` | Velocity metrics | `node scripts/velocity.mjs [--json] [--project name]` |
| `scripts/sprint-review.mjs` | Sprint review/retro | `node scripts/sprint-review.mjs [--json] [--dry-run]` |

## Templates

See `templates/` for example data files:
- `backlog.json` — Sample product backlog
- `current-sprint.json` — Sample active sprint
- `velocity.json` — Sample velocity history

## Integration Points

- **Agent Heartbeat** — Sprint execution runs during heartbeat cycles
- **Goals** — Goals auto-create backlog items
- **Task dispatch** — `in_progress` items trigger background execution
- **Duties** — Recurring responsibilities generate stories/tasks
