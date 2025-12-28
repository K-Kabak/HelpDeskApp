# Mini Final Commit/PR Prompt

**Wklej na końcu pracy agenta.**

---

## 🎯 FINAL STEP: Commit & Push

Po zakończeniu zmian:

### 1. Sprawdź i commit
```bash
# Check changes
git status

# Run checks
pnpm lint && pnpm exec tsc --noEmit

# Create branch and commit
git checkout -b feature/[nazwa-funkcji]
git add .
git commit -m "feat: [opis zmian]"
git push origin feature/[nazwa-funkcji]
```

### 2. Utwórz PR z AUTO-MERGE (REKOMENDOWANE - zawsze bezpieczniejsze)

**Przez GitHub CLI:**
```bash
gh pr create --title "feat: [opis]" --body "Implements changes. Auto-merge enabled." --fill
```

**Lub przez GitHub UI:**
1. Kliknij "Compare & pull request" (pojawi się po push)
2. Włącz "Enable auto-merge" → "Squash and merge"
3. Utwórz PR

**PR zostanie automatycznie zmergowany po przejściu CI!**

### Alternatywa: Direct commit (tylko dla bardzo małych zmian - 1-2 pliki)
```bash
git checkout main
git pull origin main
git add .
git commit -m "fix: [opis]"
git push origin main  # Jeśli branch protection pozwala
```

---

**REKOMENDACJA: Zawsze używaj PR z auto-merge** - bezpieczniejsze, CI checks, czysta historia.

**Format commit:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `perf:`

---







