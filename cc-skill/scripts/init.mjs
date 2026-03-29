#!/usr/bin/env node
/**
 * Initialize scrum data directory structure.
 * Usage: node scripts/init.mjs [--data-dir <path>]
 * Default data dir: ./data/scrum/
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = process.argv.includes('--data-dir')
  ? process.argv[process.argv.indexOf('--data-dir') + 1]
  : join(process.cwd(), 'data', 'scrum');

const dirs = [
  dataDir,
  join(dataDir, 'sprints'),
  join(dataDir, 'sprints', 'archive'),
  join(dataDir, 'metrics'),
];

for (const dir of dirs) {
  mkdirSync(dir, { recursive: true });
}

const files = {
  'backlog.json': {
    next_id: { epic: 1, story: 1, task: 1, sprint: 1 },
    items: [],
  },
  'metrics/velocity.json': {
    sprints: [],
    rolling_average: null,
    trend: null,
  },
};

for (const [file, content] of Object.entries(files)) {
  const path = join(dataDir, file);
  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
    console.log(`✓ Created ${path}`);
  } else {
    console.log(`• Skipped ${path} (exists)`);
  }
}

console.log('\n✅ Scrum data initialized. Run `/scrum sprint plan` to start your first sprint.');
