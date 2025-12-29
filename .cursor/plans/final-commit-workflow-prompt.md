# Final Commit/PR Workflow Prompt

**Wklej ten prompt na końcu pracy agenta, gdy skończy implementację.**

---

## 🎯 FINAL STEP: Commit & Push Workflow

Po ukończeniu wszystkich zmian, wykonaj następujące kroki:

### 1. Sprawdź zmiany
```bash
git status
git diff --stat  # Podsumowanie zmian
```

### 2. Uruchom podstawowe checki
```bash
pnpm lint && pnpm exec tsc --noEmit
```
**Jeśli są błędy:** Napraw tylko krytyczne (typy, składnia). Pozostałe można poprawić później.

### 3. Przygotuj branch i commit

**Dla WSZYSTKICH zmian (preferowany workflow):**

```bash
# Upewnij się, że jesteś na świeżej gałęzi (lub stwórz nową)
git checkout -b feature/[krótka-nazwa-funkcji]
# Przykłady:
# git checkout -b feature/ticket-detail-enhancements
# git checkout -b feature/admin-users-management
# git checkout -b feature/reporting-endpoints

# Dodaj wszystkie zmiany
git add .

# Commit z opisową wiadomością
git commit -m "feat: [krótki opis zmian]"
# Przykłady:
# git commit -m "feat: complete ticket detail enhancements (reopen reason, assignment suggestions)"
# git commit -m "feat: implement admin users and teams management UI"
# git commit -m "feat: add reporting analytics endpoints"

# Push do remote
git push origin feature/[krótka-nazwa-funkcji]
```

### 4. Utwórz PR z AUTO-MERGE (REKOMENDOWANE)

**PR jest zawsze bezpieczniejszy i szybszy w długim okresie** (CI checks, review, czysta historia).

Po push, utwórz PR przez GitHub UI lub CLI:

**Przez GitHub CLI (szybsze):**
```bash
gh pr create --title "feat: [krótki opis]" --body "Implements [opis zmian]

- [ ] Lint passed
- [ ] Type check passed
- [ ] Changes tested locally

Auto-merge enabled." --fill
```

**Lub przez GitHub UI:**
1. Otwórz repozytorium na GitHub
2. Kliknij "Compare & pull request" (pojawi się po push)
3. **Title:** `feat: [krótki opis zmian]`
4. **Body:** Opcjonalny opis zmian
5. **Włącz "Enable auto-merge"** (ikona zegarka) → wybierz "Squash and merge"
6. Utwórz PR

**PR zostanie automatycznie zmergowany po przejściu CI!**

### 5. Alternatywa: Direct commit do main (tylko dla bardzo małych zmian)

**⚠️ Używaj tylko dla:**
- Drobnych poprawek typu (typo, formatowanie)
- Aktualizacji dokumentacji
- Nieistotnych zmian (1-2 pliki)

**Jeśli na pewno chcesz direct commit:**
```bash
git checkout main
git pull origin main  # Upewnij się, że jesteś aktualny
git checkout -b fix/[nazwa]  # Lub commit bezpośrednio jeśli branch protection pozwala
git add .
git commit -m "fix: [opis]"
git push origin main  # Lub push branch i merge przez UI
```

**⚠️ Uwaga:** Jeśli branch protection wymaga PR - zawsze używaj PR workflow (krok 4).

---

## 📋 Format Commit Messages

- `feat: [description]` - Nowe funkcje
- `fix: [description]` - Naprawy błędów  
- `docs: [description]` - Dokumentacja
- `refactor: [description]` - Refaktoryzacja
- `test: [description]` - Testy
- `perf: [description]` - Optymalizacje wydajności

---

## ✅ Checklist przed push/PR

- [ ] Uruchomiłem `pnpm lint && pnpm exec tsc --noEmit`
- [ ] Naprawiłem krytyczne błędy
- [ ] Commit message jest opisowy i zgodny z formatem
- [ ] Zmiany są logicznie zgrupowane
- [ ] Branch name jest opisowy (`feature/...` lub `fix/...`)
- [ ] PR utworzony z auto-merge (lub direct commit jeśli małe zmiany)

---

## 🚀 REKOMENDACJA: Zawsze używaj PR z auto-merge

**Dlaczego PR jest lepszy:**
- ✅ CI automatycznie sprawdzi kod
- ✅ Auto-merge = automatyczny merge po CI
- ✅ Squash merge = czysta historia (jedna wiadomość commit)
- ✅ Możliwość review (opcjonalnie)
- ✅ Bezpieczniejsze niż direct commit

**Czas wykonania:** ~2 minuty więcej, ale bezpieczniejsze i profesjonalne.

---

**Po wykonaniu tych kroków - zmiany są gotowe! 🎉**

















