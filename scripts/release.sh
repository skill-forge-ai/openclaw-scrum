#!/usr/bin/env bash
# release.sh — Automated release script for openclaw-scrum
# Usage: ./scripts/release.sh <version> [--dry-run]
#
# Steps:
#   1. Validate version format (semver)
#   2. Run tests
#   3. Sync cc-skill/ package
#   4. Update version in SKILL.md files
#   5. Commit, tag, push
#   6. Create GitHub Release
#   7. Publish to ClawHub (if available)
#
# Prerequisites:
#   - GH_SKILL_FORGE_AI_TOKEN or GITHUB_TOKEN env var
#   - On main or develop branch
#   - Clean working tree

set -euo pipefail

VERSION="${1:-}"
DRY_RUN=false
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN=true

# ─── Validation ───────────────────────────────────────────────────────────────

if [[ -z "$VERSION" ]]; then
  echo "Usage: ./scripts/release.sh <version> [--dry-run]"
  echo "Example: ./scripts/release.sh 1.0.0"
  exit 1
fi

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Invalid version format: $VERSION (expected X.Y.Z)"
  exit 1
fi

TAG="v${VERSION}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 openclaw-scrum release ${TAG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "⚠️  Working tree is dirty. Commit or stash changes first."
  git status --short
  if [[ "$DRY_RUN" == false ]]; then
    exit 1
  fi
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "❌ Tag $TAG already exists"
  exit 1
fi

# ─── Tests ────────────────────────────────────────────────────────────────────

echo ""
echo "🧪 Running tests..."
if node --test scripts/__tests__/*.test.mjs 2>&1; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed — aborting release"
  exit 1
fi

# ─── Sync cc-skill ────────────────────────────────────────────────────────────

echo ""
echo "📋 Syncing cc-skill/ package..."

# Copy scripts
cp scripts/init.mjs scripts/board.mjs scripts/velocity.mjs scripts/sprint-review.mjs cc-skill/scripts/

# Copy references
cp references/commands.md cc-skill/references/

# Copy templates (from examples)
cp examples/backlog.json cc-skill/templates/
cp examples/current-sprint.json cc-skill/templates/
cp examples/velocity.json cc-skill/templates/

echo "✅ cc-skill/ synced"

# ─── Update version ──────────────────────────────────────────────────────────

echo ""
echo "📝 Updating version to ${VERSION}..."

# Update cc-skill/SKILL.md version field
if grep -q "^version:" cc-skill/SKILL.md; then
  sed -i "s/^version:.*/version: ${VERSION}/" cc-skill/SKILL.md
  echo "  ✅ cc-skill/SKILL.md"
fi

# ─── Commit & Tag ────────────────────────────────────────────────────────────

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "🏜️  DRY RUN — skipping git operations"
  echo "  Would commit: 'release: v${VERSION}'"
  echo "  Would tag: ${TAG}"
  echo "  Would push to origin"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Dry run complete — ${TAG} ready"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
fi

echo ""
echo "📌 Committing and tagging..."

git add -A
git commit -m "release: v${VERSION}" --allow-empty
git tag -a "$TAG" -m "openclaw-scrum ${TAG}"

echo "  ✅ Tagged ${TAG}"

# ─── Push ─────────────────────────────────────────────────────────────────────

echo ""
echo "🚀 Pushing to origin..."

CURRENT_BRANCH=$(git branch --show-current)
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

echo "  ✅ Pushed ${CURRENT_BRANCH} + ${TAG}"

# ─── GitHub Release ──────────────────────────────────────────────────────────

GITHUB_TOKEN="${GH_SKILL_FORGE_AI_TOKEN:-${GITHUB_TOKEN:-}}"

if [[ -n "$GITHUB_TOKEN" ]]; then
  echo ""
  echo "📢 Creating GitHub Release..."

  # Determine repo from remote
  REMOTE_URL=$(git remote get-url origin)
  # Extract owner/repo from HTTPS or SSH URL
  REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]||;s|\.git$||')

  RELEASE_BODY=$(cat <<EOF
## openclaw-scrum ${TAG}

AI-adapted Scrum/Agile workflow skill for AI agents.

### Install

\`\`\`bash
# ClawHub
npx clawhub install openclaw-scrum

# Manual (Claude Code)
git clone https://github.com/${REPO}.git
cp -r openclaw-scrum/cc-skill ~/.claude/skills/scrum

# Manual (OpenClaw)
git clone https://github.com/${REPO}.git
cp -r openclaw-scrum /path/to/workspace/skills/scrum
\`\`\`

### What's Included
- Kanban board renderer
- Sprint planning & review automation
- Velocity tracking with trend analysis
- Zero dependencies (Node.js stdlib only)

**Full Changelog:** https://github.com/${REPO}/commits/${TAG}
EOF
)

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "https://api.github.com/repos/${REPO}/releases" \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg tag "$TAG" \
      --arg name "openclaw-scrum ${TAG}" \
      --arg body "$RELEASE_BODY" \
      '{tag_name: $tag, name: $name, body: $body, draft: false, prerelease: false}')")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" == "201" ]]; then
    RELEASE_URL=$(echo "$BODY" | jq -r '.html_url')
    echo "  ✅ Release created: ${RELEASE_URL}"
  else
    echo "  ⚠️  Release creation failed (HTTP ${HTTP_CODE})"
    echo "  Create manually at: https://github.com/${REPO}/releases/new?tag=${TAG}"
  fi
else
  echo ""
  echo "⚠️  No GITHUB_TOKEN — skipping GitHub Release creation"
  echo "  Create manually at: https://github.com/${REPO}/releases/new?tag=${TAG}"
fi

# ─── ClawHub ──────────────────────────────────────────────────────────────────

echo ""
if command -v npx &>/dev/null; then
  echo "📦 Publishing to ClawHub..."
  if npx clawhub@latest publish ./cc-skill \
    --slug openclaw-scrum \
    --name "OpenClaw Scrum" \
    --version "$VERSION" \
    --changelog "Release ${TAG}" \
    --tags "latest,scrum,agile,project-management" 2>&1; then
    echo "  ✅ Published to ClawHub"
  else
    echo "  ⚠️  ClawHub publish failed (may need: npx clawhub login --token <token>)"
  fi
else
  echo "⚠️  npx not found — skipping ClawHub publish"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Release ${TAG} complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Post-release checklist:"
echo "  [ ] Awesome-list PR (if first release)"
echo "  [ ] DEV.to article (if major release)"
echo "  [ ] Sync to local CC skills"
echo "  [ ] Update MEMORY.md"
echo "  [ ] Notify Slack channel"
