#!/usr/bin/env node
/**
 * Sprint review/retro automation — close sprint, archive, update metrics.
 * Usage: node scripts/sprint-review.mjs [--project name] [--json] [--data-dir path] [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const GOAL_THRESHOLD = 0.8;

function parseArgs(argv) {
  const args = { json: false, project: null, dataDir: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--project' && argv[i + 1]) args.project = argv[++i];
    else if (argv[i] === '--data-dir' && argv[i + 1]) args.dataDir = argv[++i];
  }
  return args;
}

function resolveDataDir(args) {
  if (args.dataDir) return args.dataDir;
  return join(process.env.WORKSPACE || process.cwd(), 'data', 'scrum');
}

function loadJSON(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function saveJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function buildReview(sprint) {
  const items = sprint.items || [];
  const doneItems = items.filter(i => i.status === 'done');
  const incompleteItems = items.filter(i => i.status !== 'done');
  const donePoints = doneItems.reduce((sum, i) => sum + (i.points || 0), 0);
  const plannedPoints = sprint.velocity_planned || 0;
  const goalMet = donePoints >= plannedPoints * GOAL_THRESHOLD;

  const accuracy = plannedPoints > 0 ? Math.round((donePoints / plannedPoints) * 100) / 100 : 0;

  return {
    sprint_id: sprint.id,
    sprint_name: sprint.name,
    project: sprint.project || null,
    start: sprint.start,
    end: sprint.end,
    planned_points: plannedPoints,
    done_points: donePoints,
    total_items: items.length,
    completed_items: doneItems.length,
    incomplete_items: incompleteItems.length,
    goal_met: goalMet,
    accuracy,
    completed: doneItems.map(i => ({ id: i.id, title: i.title, points: i.points })),
    carryover: incompleteItems.map(i => ({ id: i.id, title: i.title, points: i.points, status: i.status })),
  };
}

function archiveSprint(dataDir, sprint, review) {
  const archiveDir = join(dataDir, 'sprints', 'archive');
  mkdirSync(archiveDir, { recursive: true });

  const archived = { ...sprint, status: 'completed', velocity_actual: review.done_points, retro: review };
  saveJSON(join(archiveDir, `${sprint.id}.json`), archived);
}

function updateVelocity(dataDir, sprint, review) {
  const velPath = join(dataDir, 'metrics', 'velocity.json');
  const velocity = loadJSON(velPath) || { sprints: [], rolling_average: null, trend: null };

  velocity.sprints.push({
    id: sprint.id,
    name: sprint.name,
    project: sprint.project || null,
    start: sprint.start,
    end: sprint.end,
    planned: review.planned_points,
    actual: review.done_points,
    stories_planned: review.total_items,
    stories_completed: review.completed_items,
    carryover: review.carryover.map(i => i.id),
  });

  saveJSON(velPath, velocity);
}

function moveIncompleteToBacklog(dataDir, incompleteItems) {
  const backlogPath = join(dataDir, 'backlog.json');
  const backlog = loadJSON(backlogPath) || { next_id: {}, items: [] };

  for (const item of incompleteItems) {
    const existing = backlog.items.find(i => i.id === item.id);
    if (existing) {
      existing.status = 'backlog';
      delete existing.sprint;
    } else {
      backlog.items.push({ ...item, status: 'backlog', sprint: undefined });
    }
  }

  saveJSON(backlogPath, backlog);
}

function clearCurrentSprint(dataDir, sprint) {
  const sprintPath = join(dataDir, 'current-sprint.json');
  const cleared = { ...sprint, status: 'completed', items: [], velocity_actual: null };
  saveJSON(sprintPath, cleared);
}

function renderText(review) {
  console.log(`Sprint Review: ${review.sprint_id} "${review.sprint_name}"`);
  console.log(`  Period: ${review.start} to ${review.end}`);
  console.log(`  Points: ${review.done_points}/${review.planned_points} (${Math.round(review.accuracy * 100)}%)`);
  console.log(`  Items: ${review.completed_items}/${review.total_items} completed`);
  console.log(`  Goal Met: ${review.goal_met ? 'Yes' : 'No'}`);

  if (review.completed.length > 0) {
    console.log('\nCompleted:');
    for (const item of review.completed) {
      console.log(`  [${item.points || 0}pt] ${item.id}: ${item.title}`);
    }
  }

  if (review.carryover.length > 0) {
    console.log('\nCarryover (moved to backlog):');
    for (const item of review.carryover) {
      console.log(`  [${item.points || 0}pt] ${item.id}: ${item.title} (was: ${item.status})`);
    }
  }
}

const args = parseArgs(process.argv);
const dataDir = resolveDataDir(args);
const sprintPath = join(dataDir, 'current-sprint.json');
const sprint = loadJSON(sprintPath);

if (!sprint) {
  console.log('No active sprint found. Nothing to review.');
  process.exit(0);
}

const review = buildReview(sprint);

if (args.dryRun) {
  if (args.json) {
    console.log(JSON.stringify(review, null, 2));
  } else {
    console.log('[DRY RUN] No files will be modified.\n');
    renderText(review);
  }
  process.exit(0);
}

// Execute review actions
const incompleteItems = (sprint.items || []).filter(i => i.status !== 'done');
archiveSprint(dataDir, sprint, review);
updateVelocity(dataDir, sprint, review);
if (incompleteItems.length > 0) {
  moveIncompleteToBacklog(dataDir, incompleteItems);
}
clearCurrentSprint(dataDir, sprint);

if (args.json) {
  console.log(JSON.stringify(review, null, 2));
} else {
  renderText(review);
  console.log('\nSprint closed. Archive, velocity, and backlog updated.');
}
