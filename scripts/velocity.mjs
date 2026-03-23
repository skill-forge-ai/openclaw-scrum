#!/usr/bin/env node
/**
 * Velocity calculation and trend analysis.
 * Usage: node scripts/velocity.mjs [--project name] [--json] [--window N] [--data-dir path]
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_WINDOW = 5;
const TREND_THRESHOLD = 0.10;

function parseArgs(argv) {
  const args = { json: false, window: DEFAULT_WINDOW, project: null, dataDir: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--window' && argv[i + 1]) args.window = parseInt(argv[++i], 10);
    else if (argv[i] === '--project' && argv[i + 1]) args.project = argv[++i];
    else if (argv[i] === '--data-dir' && argv[i + 1]) args.dataDir = argv[++i];
  }
  return args;
}

function resolveDataDir(args) {
  if (args.dataDir) return args.dataDir;
  return join(process.env.WORKSPACE || process.cwd(), 'data', 'scrum');
}

function loadVelocity(dataDir) {
  const path = join(dataDir, 'metrics', 'velocity.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function calculateTrend(actuals) {
  if (actuals.length < 2) return 'stable';
  const mid = Math.floor(actuals.length / 2);
  const firstHalf = actuals.slice(0, mid);
  const secondHalf = actuals.slice(mid);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (avgFirst === 0) return avgSecond > 0 ? 'improving' : 'stable';
  const change = (avgSecond - avgFirst) / avgFirst;
  if (change > TREND_THRESHOLD) return 'improving';
  if (change < -TREND_THRESHOLD) return 'declining';
  return 'stable';
}

function analyze(sprints, window) {
  const windowed = sprints.slice(-window);
  const actuals = windowed.map(s => s.actual);
  const rollingAverage = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const trend = calculateTrend(actuals);
  const accuracies = windowed.map(s => s.planned > 0 ? s.actual / s.planned : 0);
  const accuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  return {
    sprint_count: sprints.length,
    window: Math.min(window, sprints.length),
    rolling_average: Math.round(rollingAverage * 100) / 100,
    trend,
    accuracy: Math.round(accuracy * 100) / 100,
    sprints: windowed,
  };
}

function renderText(result) {
  console.log(`Velocity Report (${result.sprint_count} sprints, window: ${result.window})`);
  console.log(`  Rolling Average: ${result.rolling_average} pts/sprint`);
  console.log(`  Trend: ${result.trend}`);
  console.log(`  Accuracy: ${Math.round(result.accuracy * 100)}%`);
  if (result.sprints.length > 0) {
    console.log('\nRecent Sprints:');
    for (const s of result.sprints) {
      console.log(`  ${s.id}: ${s.actual}/${s.planned} pts`);
    }
  }
}

const args = parseArgs(process.argv);
const dataDir = resolveDataDir(args);
const velocity = loadVelocity(dataDir);

if (!velocity) {
  console.log('No velocity data found. Run a sprint first.');
  process.exit(0);
}

if (!velocity.sprints || velocity.sprints.length === 0) {
  console.log('No sprint data yet. Complete a sprint to see velocity metrics.');
  process.exit(0);
}

let sprints = velocity.sprints;
if (args.project) {
  sprints = sprints.filter(s => s.project === args.project);
  if (sprints.length === 0) {
    console.log(`No sprint data for project "${args.project}".`);
    process.exit(0);
  }
}

const result = analyze(sprints, args.window);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  renderText(result);
}
