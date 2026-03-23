#!/usr/bin/env node
/**
 * Scrum board renderer — reads sprint + backlog data, outputs kanban board.
 * Usage: node board.mjs [--json] [--project <name>]
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.env.WORKSPACE || process.cwd(), 'data/scrum');

function loadJSON(file) {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function renderBoard(sprint, backlog) {
  if (!sprint) {
    console.log('No active sprint. Run `/sprint plan` to start one.');
    return;
  }

  const items = [...(sprint.items || []), ...(backlog?.items || [])];
  const sprintItems = items.filter(i => i.sprint === sprint.id);

  const groups = {
    todo: sprintItems.filter(i => i.status === 'todo'),
    in_progress: sprintItems.filter(i => i.status === 'in_progress'),
    review: sprintItems.filter(i => i.status === 'review'),
    done: sprintItems.filter(i => i.status === 'done'),
  };

  const donePoints = groups.done.reduce((s, i) => s + (i.points || 0), 0);
  const totalPoints = sprintItems.reduce((s, i) => s + (i.points || 0), 0);

  const startDate = new Date(sprint.start);
  const now = new Date();
  const dayNum = Math.ceil((now - startDate) / 86400000);

  console.log(`🏃 Sprint ${sprint.id} "${sprint.name}" (Day ${dayNum}/${sprint.duration_days}) — ${donePoints}/${totalPoints} pts done\n`);

  const emoji = { todo: '📋', in_progress: '🔨', review: '👀', done: '✅' };
  const labels = { todo: 'TODO', in_progress: 'IN PROGRESS', review: 'REVIEW', done: 'DONE' };

  for (const [status, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    console.log(`${emoji[status]} ${labels[status]} (${list.length})`);
    for (const item of list) {
      const pts = item.points ? ` [${item.points}pt]` : '';
      const lbl = item.labels?.length ? ` 🏷️ ${item.labels.join(', ')}` : '';
      const extra = item.cc_task ? ` → CC ${item.cc_task}` : item.pr ? ` → PR #${item.pr}` : '';
      const check = status === 'done' ? ' ✓' : '';
      console.log(`• ${item.id} ${item.title}${pts}${lbl}${extra}${check}`);
    }
    console.log('');
  }
}

// JSON mode for programmatic use
const jsonMode = process.argv.includes('--json');
const sprint = loadJSON('current-sprint.json');
const backlog = loadJSON('backlog.json');

if (jsonMode) {
  console.log(JSON.stringify({ sprint, backlog }, null, 2));
} else {
  renderBoard(sprint, backlog);
}
