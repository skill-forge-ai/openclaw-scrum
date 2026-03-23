#!/usr/bin/env node
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';

const SCRIPT = join(import.meta.dirname, '..', 'velocity.mjs');

function run(dataDir, extraArgs = []) {
  const result = execFileSync('node', [SCRIPT, '--data-dir', dataDir, ...extraArgs], {
    encoding: 'utf8',
    env: { ...process.env },
  });
  return result;
}

function runJSON(dataDir, extraArgs = []) {
  return JSON.parse(run(dataDir, ['--json', ...extraArgs]));
}

function setupDataDir(velocityData) {
  const tmp = mkdtempSync(join(tmpdir(), 'vel-test-'));
  mkdirSync(join(tmp, 'metrics'), { recursive: true });
  writeFileSync(join(tmp, 'metrics', 'velocity.json'), JSON.stringify(velocityData, null, 2));
  return tmp;
}

describe('velocity.mjs', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('handles missing velocity.json gracefully', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'vel-test-'));
    const output = run(tmpDir);
    assert.match(output, /no velocity data/i);
  });

  it('handles empty sprints array', () => {
    tmpDir = setupDataDir({ sprints: [], rolling_average: null, trend: null });
    const output = run(tmpDir);
    assert.match(output, /no sprint data/i);
  });

  it('calculates rolling average for single sprint', () => {
    tmpDir = setupDataDir({
      sprints: [{ id: 'SPR-001', planned: 10, actual: 8 }],
      rolling_average: null,
      trend: null,
    });
    const result = runJSON(tmpDir);
    assert.equal(result.rolling_average, 8);
    assert.equal(result.trend, 'stable');
    assert.equal(result.accuracy, 0.8);
  });

  it('calculates rolling average over default window of 5', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 6 },
      { id: 'SPR-002', planned: 10, actual: 8 },
      { id: 'SPR-003', planned: 10, actual: 10 },
      { id: 'SPR-004', planned: 10, actual: 12 },
      { id: 'SPR-005', planned: 10, actual: 14 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir);
    assert.equal(result.rolling_average, 10);
    assert.equal(result.sprint_count, 5);
  });

  it('uses only last N sprints with --window', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 2 },
      { id: 'SPR-002', planned: 10, actual: 4 },
      { id: 'SPR-003', planned: 10, actual: 6 },
      { id: 'SPR-004', planned: 10, actual: 8 },
      { id: 'SPR-005', planned: 10, actual: 10 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir, ['--window', '3']);
    assert.equal(result.rolling_average, 8);
    assert.equal(result.window, 3);
  });

  it('detects improving trend', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 4 },
      { id: 'SPR-002', planned: 10, actual: 5 },
      { id: 'SPR-003', planned: 10, actual: 8 },
      { id: 'SPR-004', planned: 10, actual: 9 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir);
    assert.equal(result.trend, 'improving');
  });

  it('detects declining trend', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 12 },
      { id: 'SPR-002', planned: 10, actual: 10 },
      { id: 'SPR-003', planned: 10, actual: 5 },
      { id: 'SPR-004', planned: 10, actual: 4 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir);
    assert.equal(result.trend, 'declining');
  });

  it('detects stable trend', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 10 },
      { id: 'SPR-002', planned: 10, actual: 10 },
      { id: 'SPR-003', planned: 10, actual: 10 },
      { id: 'SPR-004', planned: 10, actual: 10 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir);
    assert.equal(result.trend, 'stable');
  });

  it('calculates accuracy as mean of actual/planned', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 10 },
      { id: 'SPR-002', planned: 10, actual: 5 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir);
    assert.equal(result.accuracy, 0.75);
  });

  it('filters by --project', () => {
    const sprints = [
      { id: 'SPR-001', project: 'alpha', planned: 10, actual: 10 },
      { id: 'SPR-002', project: 'beta', planned: 10, actual: 2 },
      { id: 'SPR-003', project: 'alpha', planned: 10, actual: 8 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const result = runJSON(tmpDir, ['--project', 'alpha']);
    assert.equal(result.sprint_count, 2);
    assert.equal(result.rolling_average, 9);
  });

  it('outputs human-readable text by default', () => {
    const sprints = [
      { id: 'SPR-001', planned: 10, actual: 8 },
      { id: 'SPR-002', planned: 10, actual: 10 },
    ];
    tmpDir = setupDataDir({ sprints, rolling_average: null, trend: null });
    const output = run(tmpDir);
    assert.match(output, /rolling average/i);
    assert.match(output, /trend/i);
  });
});
