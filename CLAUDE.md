# CLAUDE.md — openclaw-scrum

## Tech Stack
- Language: JavaScript (ESM, Node.js 18+)
- No framework — pure Node.js scripts
- Data format: JSON files
- No external dependencies — zero `node_modules`

## Project Structure
```
openclaw-scrum/
├── SKILL.md              # Core skill definition (loaded by OpenClaw agents)
├── README.md             # User-facing docs
├── LICENSE               # MIT
├── scripts/              # Executable scripts
│   ├── init.mjs          # Initialize data directory
│   ├── board.mjs         # Kanban board renderer
│   ├── velocity.mjs      # Velocity calculation & trend analysis
│   └── sprint-review.mjs # Sprint review/retro automation
├── references/
│   └── commands.md       # Full command reference
├── examples/             # Sample data for quick-start
│   ├── README.md
│   ├── backlog.json
│   ├── current-sprint.json
│   └── velocity.json
└── data/                 # Data layout manifest (not actual data)
    └── .manifest.json
```

## Coding Standards
- ESM modules only (`import`/`export`, `.mjs` extension)
- No dependencies — stdlib only (`fs`, `path`, `process`)
- All scripts must be executable standalone: `node scripts/<name>.mjs [args]`
- Use descriptive variable names, no abbreviations
- Constants in UPPER_SNAKE_CASE at top of file
- Functions in camelCase
- Error handling: graceful fallbacks with helpful messages, never crash silently

## Testing
- Framework: Node.js built-in test runner (`node --test`)
- Test files: `scripts/__tests__/<name>.test.mjs`
- Run: `node --test scripts/__tests__/*.test.mjs`
- TDD mandatory: RED → GREEN → REFACTOR
- Use temp directories for test data (no mocking JSON reads — use real files)
- Each script must have tests covering: normal case, edge cases, missing files

## Git
- Commit format: `feat|fix|test|docs(scope): description`
- One commit per plan task
- Branch from develop

## Forbidden Patterns
- No CommonJS (`require`, `module.exports`)
- No external npm packages
- No magic values — extract to named constants
- No `.dev-progress/` in commits (progress tracked externally)
- No `console.error` for normal flow — only for actual errors
