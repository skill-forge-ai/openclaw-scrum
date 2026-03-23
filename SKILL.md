---
name: scrum
description: >
  AI-adapted Scrum/Agile project management for autonomous development workflows.
  Manages epics, stories, tasks, sprints, and kanban boards through markdown + JSON
  tracking. Use when planning work, managing backlogs, running sprints, tracking
  progress via kanban, or doing sprint reviews/retrospectives. Triggers on: sprint
  planning, backlog grooming, kanban, epic/story/task management, velocity tracking,
  agile workflow, scrum ceremonies. Also applies to duty/responsibility decomposition
  into actionable stories/tasks.
---

# Scrum — AI-Adapted Agile Workflow

Lightweight Scrum framework adapted for AI agents. No meetings, no overhead — just
the mechanics that drive autonomous delivery.

## Quick Start

1. Initialize: `node scripts/init.mjs` (creates `data/scrum/` structure)
2. Add work: `/scrum backlog add "Build user authentication" --points 5`
3. Plan sprint: `/scrum sprint plan`
4. View board: `/scrum board`
5. Agent heartbeat auto-progresses sprint items

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
| **Epic** | `E-xxx` | Multi-sprint deliverable | "Lobster World v1.0" |
| **Story** | `S-xxx` | Sprint-sized, delivers user value | "Real-time chat" |
| **Task** | `T-xxx` | Atomic unit, ≤4h work | "Write migration script" |

### Item Schema (JSON)

```json
{
  "id": "S-001",
  "type": "story",
  "title": "Real-time chat between lobsters",
  "description": "As a user, I want lobsters to chat in real-time",
  "epic": "E-001",
  "status": "todo",
  "priority": "P1",
  "points": 3,
  "tasks": ["T-001", "T-002"],
  "sprint": "SPR-002",
  "created": "2026-03-23",
  "updated": "2026-03-23",
  "labels": ["backend", "websocket"],
  "acceptance": ["Messages delivered <500ms", "100 concurrent users"],
  "assignee": "forge"
}
```

### Kanban Statuses

```
backlog → todo → in_progress → review → done → archived
```

- **backlog** — In product backlog, not committed to sprint
- **todo** — Committed to current sprint, not started
- **in_progress** — Actively being worked on
- **review** — PR/MR created, awaiting review
- **done** — Merged and verified
- **archived** — Sprint closed, moved to history

### Story Points (Fibonacci)

| Points | Scope |
|--------|-------|
| 1 | Config change, trivial fix |
| 2 | Simple feature, single file |
| 3 | Standard feature, 2-3 files |
| 5 | Complex feature, new module |
| 8 | Large feature, needs design |
| 13 | Should be broken into stories |

## Commands

All commands use `/scrum` prefix. See `references/commands.md` for full details.

| Command | Purpose |
|---------|---------|
| `/scrum` or `/scrum board` | Kanban board (default) |
| `/scrum sprint [plan\|status\|review\|close]` | Sprint management |
| `/scrum backlog [add\|groom]` | Product backlog |
| `/scrum item <id\|create\|move\|edit>` | Work item CRUD |
| `/scrum velocity` | Velocity metrics |
| `/scrum epic <id>` | Epic overview |

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
2. Empty columns: skip entirely (don't show)
3. Labels: `🏷️ label1, label2` (only if present)
4. Separator: `━` × 35 characters

## Workflows

### Sprint Planning

1. Read `backlog.json` — sort by priority
2. Calculate capacity (default: 20 pts per 5-day sprint)
3. Pull highest-priority stories up to capacity
4. Create `current-sprint.json` with status `todo`
5. Break stories into tasks if needed

### Sprint Execution (Heartbeat-driven)

Each heartbeat cycle:
1. Pick highest-priority `todo` → set `in_progress` → execute
2. Check `in_progress` → update status from task runner
3. Check `review` → poll PR status → `done` if merged
4. Sprint end date reached → trigger Sprint Review

### Sprint Review & Retro

On sprint completion:
1. Calculate velocity (completed story points)
2. Move incomplete stories back to backlog
3. Generate summary (shipped, missed, blockers)
4. Analyze patterns (estimate accuracy, bottlenecks)
5. Archive to `sprints/archive/SPR-xxx.json`
6. Update `metrics/velocity.json`

### Duty Decomposition

Recurring duties generate stories automatically:

```
Duty: "blog-study" (weekly)
  → Epic: E-100 "Blog Knowledge Pipeline"
    → Story: S-150 "Process new blog post" (auto on detection)
      → Task: T-300 "Fetch and parse"
      → Task: T-301 "Write bilingual summary"
```

## Integration Points

- **Heartbeat** — Sprint execution runs during heartbeat cycles
- **Goals** — Goals auto-create backlog items; scrum tracks execution detail
- **Task dispatch** — `in_progress` items map to background task dispatches
- **Duties** — Duties generate recurring stories/tasks
