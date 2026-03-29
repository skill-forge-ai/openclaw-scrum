# Contributing to openclaw-scrum

Thanks for your interest in improving AI-adapted Scrum! Here's how to contribute.

## Quick Start

```bash
git clone https://github.com/skill-forge-ai/openclaw-scrum.git
cd openclaw-scrum
node scripts/init.mjs           # Set up data directory
node --test scripts/__tests__/  # Run tests
```

## Development Guidelines

### Tech Stack
- **Language:** JavaScript (ESM, Node.js 18+)
- **Dependencies:** Zero — stdlib only (`fs`, `path`, `process`)
- **Data format:** JSON files
- **Tests:** Node.js built-in test runner (`node --test`)

### Code Standards
- ESM modules only (`.mjs` extension, `import`/`export`)
- No external npm packages — keep it zero-dependency
- Scripts must be standalone: `node scripts/<name>.mjs [args]`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- Meaningful variable names, no abbreviations

### Commit Format

```
feat|fix|test|docs(scope): description
```

Examples:
- `feat(velocity): add per-project filtering`
- `fix(board): handle empty sprint gracefully`
- `test(sprint-review): add archive edge cases`
- `docs(readme): update install instructions`

### Testing

**TDD is mandatory.** RED → GREEN → REFACTOR.

```bash
# Run all tests
node --test scripts/__tests__/*.test.mjs

# Run a specific test file
node --test scripts/__tests__/velocity.test.mjs
```

- Use real temp directories for test data (no mocking)
- Cover: normal case, edge cases, missing files
- Place test files in `scripts/__tests__/<name>.test.mjs`

## What to Contribute

### Good First Issues
- Additional board output formats (JSON, CSV)
- Better error messages for malformed data files
- New example data sets for different project types

### Feature Ideas
- Multi-agent support (multiple assignees)
- Sprint burndown chart (ASCII/text-based)
- Import/export from other Scrum tools
- Slack/Discord notification templates

### Bug Reports
Please include:
1. Node.js version (`node --version`)
2. Steps to reproduce
3. Expected vs actual behavior
4. Sample data files (if relevant)

## Pull Request Process

1. Fork and branch from `develop`
2. Write tests first
3. Implement the feature/fix
4. Ensure all tests pass
5. Update README/SKILL.md if behavior changes
6. Submit PR against `develop`

## Project Structure

```
openclaw-scrum/
├── SKILL.md              # Core skill definition
├── README.md             # User-facing documentation
├── CONTRIBUTING.md       # This file
├── LICENSE               # MIT
├── cc-skill/             # Self-contained CC skill package
│   ├── SKILL.md          # Unified skill for Claude Code
│   ├── scripts/          # All scripts
│   ├── templates/        # Example data
│   └── references/       # Command reference
├── scripts/              # Executable scripts
│   ├── __tests__/        # Test files
│   ├── init.mjs
│   ├── board.mjs
│   ├── velocity.mjs
│   └── sprint-review.mjs
├── references/           # Documentation
│   └── commands.md
├── examples/             # Quick-start data
└── data/                 # Data layout manifest
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
