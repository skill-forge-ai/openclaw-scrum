# Feature List — openclaw-scrum (Sprint SPR-004)

## Status Legend
- 🔴 Not started
- 🟡 In progress
- 🟢 Complete
- ⚫ Blocked

## Features

### S-012: Velocity Calculation & Trend Analysis Script
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | `scripts/velocity.mjs` — read velocity.json | 🟢 | Parse sprint history |
| 2 | Rolling average calculation (configurable window) | 🟢 | Default: last 5 sprints |
| 3 | Trend analysis (improving/declining/stable) | 🟢 | Compare recent vs older |
| 4 | CLI output (human-readable + --json flag) | 🟢 | |
| 5 | Per-project filtering (--project flag) | 🟢 | |
| 6 | Tests for velocity.mjs | 🟢 | 11 tests passing |

### S-015: Sprint Review/Retro Automation Script
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | `scripts/sprint-review.mjs` — read current-sprint.json | 🟢 | |
| 2 | Velocity calculation (completed story points) | 🟢 | Sum done items' points |
| 3 | Sprint summary generation | 🟢 | Completed, incomplete, carryover |
| 4 | Auto-retro analysis | 🟢 | Accuracy calculation included |
| 5 | Archive sprint to `sprints/archive/SPR-xxx.json` | 🟢 | |
| 6 | Update `metrics/velocity.json` with new data point | 🟢 | |
| 7 | Move incomplete items back to backlog | 🟢 | Reset status to backlog |
| 8 | CLI output (summary + --json flag) | 🟢 | + --dry-run support |
| 9 | Tests for sprint-review.mjs | 🟢 | 10 tests passing |
