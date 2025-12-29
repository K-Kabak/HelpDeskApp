# 🚀 COPY THIS: Mini Final Commit/PR Prompt

**Gotowy prompt do wklejenia agentowi po zakończeniu pracy.**

---

## FINAL STEP: Commit & Push Workflow

Po zakończeniu wszystkich zmian, wykonaj:

### 1. Check & Commit
```bash
git status
pnpm lint && pnpm exec tsc --noEmit
git checkout -b feature/[nazwa-funkcji]
git add .
git commit -m "feat: [opis zmian]"
git push origin feature/[nazwa-funkcji]
```

### 2. Create PR with AUTO-MERGE (RECOMMENDED)

**GitHub CLI (fastest):**
```bash
gh pr create --title "feat: [opis]" --body "Implements changes. Auto-merge enabled." --fill
```

**GitHub UI:**
1. Click "Compare & pull request"
2. Enable "Auto-merge" → "Squash and merge"
3. Create PR

**PR will auto-merge after CI passes! ✅**

### Alternative: Direct commit (only for very small changes - 1-2 files)
```bash
git checkout main && git pull origin main
git add . && git commit -m "fix: [opis]"
git push origin main  # Only if branch protection allows
```

---

**RECOMMENDATION: Always use PR with auto-merge** - safer, CI checks, clean history.

**Commit format:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `perf:`

---














