# Scrum User Commands Reference

All commands use the `/scrum` prefix. Commands registered in `skills/user-commands/SKILL.md`.

## /scrum (or /scrum board)

**Usage:** `/scrum board [project]`

Show kanban board for current sprint.

**⚠️ 输出格式严格固定，每次必须一字不差地遵循此模板（变量部分用实际数据替换）：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 SPR-{id} "{name}"
📅 Day {n}/{total} | ⏰ Deadline: {date}
📊 {done_pts}/{total_pts} pts | {percent}% complete
▓▓▓▓▓▓▓▓░░ {percent}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TODO ({count})
  ○ {id} {title} [{pts}pt] {labels}
  ○ {id} {title} [{pts}pt] {labels}

🔨 IN PROGRESS ({count})
  ◉ {id} {title} [{pts}pt] → {context}
  ◉ {id} {title} [{pts}pt] → {context}

👀 REVIEW ({count})
  ◎ {id} {title} [{pts}pt] → PR #{n}
  ◎ {id} {title} [{pts}pt] → PR #{n}

✅ DONE ({count})
  ✓ {id} {title} [{pts}pt]
  ✓ {id} {title} [{pts}pt]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ Epic {id} — {percent}% | 📦 Backlog: {n} items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**格式规则：**
1. 进度条用 `▓`（完成）和 `░`（未完成），总长 10 格，按百分比四舍五入
2. 空列（0 items）**不显示**，直接跳过
3. `{context}` = CC task 状态 / 执行描述（in_progress 时）
4. `{labels}` = 🏷️ label1, label2（有 label 时才显示）
5. 底部 Epic 和 Backlog 摘要只显示一行
6. **分隔线** 用 `━` 字符，宽度 35 字符
7. **此格式为铁律，禁止自由发挥**

**Execution:**
1. Read `data/scrum/current-sprint.json`
2. Read items, group by status
3. For `in_progress`: check CC task status
4. For `review`: check PR status
5. Render board with emoji columns

---

## /scrum sprint

**Subcommands:**

### `/scrum sprint plan [duration]`
Start sprint planning. Default duration: 5 days.
1. Show top backlog items by priority
2. Suggest sprint scope based on velocity
3. Confirm with Peter or auto-plan if authorized
4. Create `current-sprint.json`

### `/scrum sprint status`
Quick sprint health check:
- Days remaining, points completed vs planned
- Burndown trend (ahead/on-track/behind)
- Blockers

### `/scrum sprint review`
End-of-sprint ceremony:
1. Generate sprint summary
2. Calculate velocity
3. Identify incomplete items
4. Auto-retro analysis
5. Archive sprint

### `/scrum sprint close`
Force-close current sprint (moves incomplete to backlog).

---

## /scrum backlog

**Usage:** `/backlog [filter]`

Show product backlog. Filters: `project:<name>`, `epic:<id>`, `priority:<P0|P1|P2>`, `label:<name>`

**Output:** Ordered list with ID, title, points, priority, epic.

### `/scrum backlog groom`
Interactive grooming session:
1. Show unestimated items
2. Suggest story points
3. Identify items that should be split
4. Prioritize

### `/scrum backlog add <title> [options]`
Quick-add to backlog.
Options: `--epic E-xxx`, `--priority P0|P1|P2`, `--points N`, `--label xxx`

---

## /scrum item

Work item management.

### `/scrum item <id>`
Show item detail (title, description, status, tasks, history).

### `/scrum item create <type> <title> [options]`
Create new epic/story/task.
- `type`: epic | story | task
- Options: `--epic E-xxx`, `--points N`, `--priority P0|P1|P2`, `--desc "..."`, `--label xxx`

### `/scrum item move <id> <status>`
Move item to new status (todo/in_progress/review/done).

### `/scrum item edit <id> <field> <value>`
Edit item field.

---

## /scrum velocity

Show velocity metrics.

**Output:**
```
📊 Velocity (last 5 sprints)
SPR-001: 15/18 pts (83%) 
SPR-002: 13/13 pts (100%) ← current
Average: 14 pts/sprint

📈 Trend: ↗️ improving
🎯 Suggested next sprint: 15 pts
```

---

## /scrum epic <id>

Show epic overview with all child stories and progress.

```
🏔️ E-001 "Lobster World v1.0"
Progress: ████████░░ 75% (12/16 stories done)

Phase 1 ✅ | Phase 2 🔨 | Phase 3 📋
```
