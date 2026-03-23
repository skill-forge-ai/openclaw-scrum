#!/usr/bin/env node
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';

const SCRIPT = join(import.meta.dirname, '..', 'sprint-review.mjs');

function run(dataDir, extraArgs = []) {
  return execFileSync('node', [SCRIPT, '--data-dir', dataDir, ...extraArgs], {
    encoding: 'utf8',
    env: { ...process.env },
  });
}

function runJSON(dataDir, extraArgs = []) {
  return JSON.parse(run(dataDir, ['--json', ...extraArgs]));
}

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function setupFullDataDir() {
  const tmp = mkdtempSync(join(tmpdir(), 'review-test-'));
  mkdirSync(join(tmp, 'sprints', 'archive'), { recursive: true });
  mkdirSync(join(tmp, 'metrics'), { recursive: true });

  const sprint = {
    id: 'SPR-001',
    name: 'Auth MVP',
    project: 'my-project',
    goal: 'Deliver core auth',
    start: '2026-03-10',
    end: '2026-03-14',
    duration_days: 5,
    status: 'active',
    velocity_planned: 8,
    velocity_actual: null,
    items: [
      { id: 'S-001', type: 'story', title: 'Registration', sprint: 'SPR-001', status: 'done', points: 3 },
      { id: 'S-002', type: 'story', title: 'Login', sprint: 'SPR-001', status: 'done', points: 2 },
      { id: 'S-004', type: 'story', title: 'Password reset', sprint: 'SPR-001', status: 'in_progress', points: 3 },
    ],
    retro: null,
  };

  const backlog = {
    next_id: { epic: 2, story: 6, task: 4, sprint: 2 },
    items: [
      { id: 'S-003', type: 'story', title: 'OAuth', status: 'backlog', points: 5 },
    ],
  };

  const velocity = { sprints: [], rolling_average: null, trend: null };

  writeFileSync(join(tmp, 'current-sprint.json'), JSON.stringify(sprint, null, 2));
  writeFileSync(join(tmp, 'backlog.json'), JSON.stringify(backlog, null, 2));
  writeFileSync(join(tmp, 'metrics', 'velocity.json'), JSON.stringify(velocity, null, 2));

  return tmp;
}

describe('sprint-review.mjs', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('handles missing current-sprint.json gracefully', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'review-test-'));
    const output = run(tmpDir);
    assert.match(output, /no active sprint/i);
  });

  it('calculates done points and builds summary in JSON mode', () => {
    tmpDir = setupFullDataDir();
    const result = runJSON(tmpDir, ['--dry-run']);
    assert.equal(result.done_points, 5);
    assert.equal(result.planned_points, 8);
    assert.equal(result.total_items, 3);
    assert.equal(result.completed_items, 2);
    assert.equal(result.incomplete_items, 1);
  });

  it('determines goal met when actual >= planned * 0.8', () => {
    tmpDir = setupFullDataDir();
    const result = runJSON(tmpDir, ['--dry-run']);
    // 5 >= 8 * 0.8 = 6.4 → false
    assert.equal(result.goal_met, false);
  });

  it('determines goal met as true when threshold passed', () => {
    tmpDir = setupFullDataDir();
    // Modify sprint to have more done points
    const sprintPath = join(tmpDir, 'current-sprint.json');
    const sprint = readJSON(sprintPath);
    sprint.items[2].status = 'done'; // now 8 pts done, planned 8, 8 >= 6.4
    writeFileSync(sprintPath, JSON.stringify(sprint, null, 2));

    const result = runJSON(tmpDir, ['--dry-run']);
    assert.equal(result.goal_met, true);
    assert.equal(result.done_points, 8);
  });

  it('dry-run does not modify files', () => {
    tmpDir = setupFullDataDir();
    run(tmpDir, ['--dry-run']);

    // Files should be unchanged
    assert.ok(existsSync(join(tmpDir, 'current-sprint.json')));
    assert.ok(!existsSync(join(tmpDir, 'sprints', 'archive', 'SPR-001.json')));
    const velocity = readJSON(join(tmpDir, 'metrics', 'velocity.json'));
    assert.equal(velocity.sprints.length, 0);
  });

  it('archives sprint, updates velocity, moves incomplete to backlog, clears sprint', () => {
    tmpDir = setupFullDataDir();
    run(tmpDir);

    // Sprint archived
    assert.ok(existsSync(join(tmpDir, 'sprints', 'archive', 'SPR-001.json')));
    const archived = readJSON(join(tmpDir, 'sprints', 'archive', 'SPR-001.json'));
    assert.equal(archived.id, 'SPR-001');
    assert.equal(archived.status, 'completed');

    // Velocity updated
    const velocity = readJSON(join(tmpDir, 'metrics', 'velocity.json'));
    assert.equal(velocity.sprints.length, 1);
    assert.equal(velocity.sprints[0].id, 'SPR-001');
    assert.equal(velocity.sprints[0].actual, 5);
    assert.equal(velocity.sprints[0].planned, 8);

    // Incomplete items moved to backlog
    const backlog = readJSON(join(tmpDir, 'backlog.json'));
    const movedItem = backlog.items.find(i => i.id === 'S-004');
    assert.ok(movedItem, 'S-004 should be in backlog');
    assert.equal(movedItem.status, 'backlog');

    // Current sprint cleared
    const currentSprint = readJSON(join(tmpDir, 'current-sprint.json'));
    assert.equal(currentSprint.items.length, 0);
    assert.equal(currentSprint.status, 'completed');
  });

  it('outputs human-readable text by default', () => {
    tmpDir = setupFullDataDir();
    const output = run(tmpDir, ['--dry-run']);
    assert.match(output, /sprint review/i);
    assert.match(output, /SPR-001/);
  });

  it('handles sprint with all items done', () => {
    tmpDir = setupFullDataDir();
    const sprintPath = join(tmpDir, 'current-sprint.json');
    const sprint = readJSON(sprintPath);
    sprint.items[2].status = 'done';
    writeFileSync(sprintPath, JSON.stringify(sprint, null, 2));

    const result = runJSON(tmpDir, ['--dry-run']);
    assert.equal(result.incomplete_items, 0);
    assert.equal(result.done_points, 8);
    assert.equal(result.goal_met, true);
  });

  it('handles sprint with no items done', () => {
    tmpDir = setupFullDataDir();
    const sprintPath = join(tmpDir, 'current-sprint.json');
    const sprint = readJSON(sprintPath);
    sprint.items.forEach(i => i.status = 'todo');
    writeFileSync(sprintPath, JSON.stringify(sprint, null, 2));

    const result = runJSON(tmpDir, ['--dry-run']);
    assert.equal(result.done_points, 0);
    assert.equal(result.incomplete_items, 3);
    assert.equal(result.goal_met, false);
  });

  it('preserves existing velocity sprints when appending', () => {
    tmpDir = setupFullDataDir();
    const velPath = join(tmpDir, 'metrics', 'velocity.json');
    writeFileSync(velPath, JSON.stringify({
      sprints: [{ id: 'SPR-000', planned: 5, actual: 5 }],
      rolling_average: 5,
      trend: 'stable',
    }, null, 2));

    run(tmpDir);

    const velocity = readJSON(velPath);
    assert.equal(velocity.sprints.length, 2);
    assert.equal(velocity.sprints[0].id, 'SPR-000');
    assert.equal(velocity.sprints[1].id, 'SPR-001');
  });
});
