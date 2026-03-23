# Examples

Sample data files to help you get started with openclaw-scrum.

## Files

| File | Description |
|------|-------------|
| `backlog.json` | Product backlog with an epic, completed stories, and backlog items |
| `current-sprint.json` | Active sprint with items in various statuses |
| `velocity.json` | Historical velocity data across 3 sprints |

## Usage

Copy these files to your `data/scrum/` directory and modify them for your project:

```bash
# Initialize scrum data structure
node scripts/init.mjs

# Copy example data (optional — for testing)
cp examples/backlog.json data/scrum/backlog.json
cp examples/current-sprint.json data/scrum/current-sprint.json
mkdir -p data/scrum/metrics
cp examples/velocity.json data/scrum/metrics/velocity.json

# View your board
# /scrum board
```

## Board Preview (from example data)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 SPR-001 "Auth MVP"
📅 Day 3/5 | ⏰ Deadline: 2026-03-24
📊 5/8 pts | 63% complete
▓▓▓▓▓▓░░░░ 63%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔨 IN PROGRESS (1)
  ◉ S-004 Password reset via email [3pt] 🏷️ auth, backend

✅ DONE (2)
  ✓ S-001 User registration with email verification [3pt]
  ✓ S-002 Login flow with JWT tokens [2pt]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ Epic E-001 "User Authentication System" | 📦 Backlog: 3 items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
