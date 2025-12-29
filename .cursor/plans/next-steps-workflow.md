# Next Steps & Workflow - Pomocnik

## 🎯 Aktualny Stan

**✅ Ukończone:**
- Tasks 1-5, 7-10: Wszystkie ukończone
- PR #204: CI fixes resolved
- Master Agent Prompt: Gotowy do użycia

**🔄 Do zrobienia:**
- Task 6: Weryfikacja ticket detail enhancements (Agent 2)

## 📝 Kiedy Commitować/Pushować Zmiany

### Workflow (SIMPLIFIED - Skup się na kodzie)

**Kiedy agenci kończą pracę:**

1. **Po ukończeniu większej funkcji** (np. całe zarządzanie użytkownikami)
2. **Po ukończeniu logicznej jednostki pracy** (np. wszystkie ulepszenia ticket detail)
3. **Przed przełączeniem na zupełnie inną część kodu**
4. **Gdy Ty (użytkownik) wyraźnie o to poprosisz**

### Proces Commita:

```bash
# 1. Sprawdź zmiany
git status

# 2. Przed commitem - uruchom podstawowe checki
pnpm lint && pnpm exec tsc --noEmit

# 3. Jeśli są błędy - napraw tylko krytyczne
# 4. Dodaj zmiany
git add .

# 5. Commit z logiczną wiadomością
git commit -m "feat: complete ticket detail enhancements"
# lub
git commit -m "feat: implement admin users/teams management UI"

# 6. Push (jeśli to większa zmiana - utwórz PR)
git push origin feature/nazwa-feature
```

### Kiedy tworzyć PR:

- ✅ Po większych funkcjach (nie każdy mały task)
- ✅ Gdy użytkownik o to poprosi
- ✅ Przed mergem do main

### Format Commit Messages:

- `feat: [description]` - Nowe funkcje
- `fix: [description]` - Naprawy błędów
- `docs: [description]` - Aktualizacje dokumentacji
- `test: [description]` - Testy
- `refactor: [description]` - Refaktoryzacja

## 🚀 Następne Kroki

### Krok 1: Uruchom Agentów z Promptami

**Opcja A: Wszystko jednocześnie (REKOMENDOWANE)**

1. **Agent 2** - Wklej Master Agent Prompt + PROMPT 1 (Task 6 Verification)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 1 z .cursor/plans/next-prompts.md]
   ```

2. **Agent 1** - Wklej Master Agent Prompt + PROMPT 2 (New Features - Backend)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 2 z .cursor/plans/next-prompts.md]
   
   Focus: Reporting/analytics endpoints, email notification delivery
   ```

3. **Agent 3** - Wklej Master Agent Prompt + PROMPT 2 (New Features - QA)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 2 z .cursor/plans/next-prompts.md]
   
   Focus: Test improvements, QA processes
   ```

4. **Agent 4** - Wklej Master Agent Prompt + PROMPT 2 (Security)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 2 z .cursor/plans/next-prompts.md]
   
   Focus: Security reviews, security improvements
   ```

5. **Agent 5** - Wklej Master Agent Prompt + PROMPT 2 (Database)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 2 z .cursor/plans/next-prompts.md]
   
   Focus: Database optimizations, query improvements
   ```

6. **Agent 6** - Wklej Master Agent Prompt + PROMPT 2 (API)
   ```
   [Wklej .cursor/plans/master-agent-prompt.md]
   
   [Wklej PROMPT 2 z .cursor/plans/next-prompts.md]
   
   Focus: API improvements, OpenAPI updates
   ```

**Opcja B: Stopniowo**

1. Najpierw Agent 2 (Task 6 - szybka weryfikacja)
2. Potem pozostałe agenty (gdy Agent 2 skończy lub równolegle)

### Krok 2: Monitoruj Pracę Agentów

- **Nie zatrzymuj ich** - agenci będą pracować do momentu ukończenia funkcji
- **Sprawdzaj postęp** - patrz na zmiany w plikach
- **Komunikuj się** - jeśli coś idzie nie tak, zatrzymaj i popraw

### Krok 3: Po Zakończeniu Pracy Agentów

1. **Sprawdź zmiany:**
   ```bash
   git status
   git diff
   ```

2. **Uruchom checki:**
   ```bash
   pnpm lint && pnpm exec tsc --noEmit
   ```

3. **Commit i push:**
   ```bash
   git add .
   git commit -m "feat: [description of changes]"
   git push origin feature/nazwa-feature
   ```

4. **Utwórz PR** (jeśli to większa zmiana)

## 📋 Priorytetowe Funkcje (P1)

Z backlogu (`docs/github-backlog.md`):

1. **Reporting/analytics endpoints or UI**
2. **CSAT improvements** (Customer Satisfaction surveys)
3. **Advanced search/filtering** enhancements
4. **Email notification delivery** (real email sending)
5. **Automation rules UI** enhancements
6. **Dashboard widgets** (SLA status, ticket stats)
7. **Export functionality** (CSV/PDF exports)

## 🎓 Pamiętaj

**SIMPLIFIED WORKFLOW - Focus on Development Velocity:**

- ✅ **Batch changes** - commit po większych funkcjach
- ✅ **Code first** - kod najpierw, testy później
- ✅ **Tests at the end** - testy na końcu funkcji
- ✅ **Continue working** - agenci pracują bez zatrzymywania
- ❌ Nie commitować po każdym małym zadaniu
- ❌ Nie pisać testów do każdego małego zadania
- ❌ Nie tworzyć PR do każdego zadania

## 📝 Przygotowanie Promptów dla Agentów

**Dla każdego agenta wklej:**

1. **Master Agent Prompt** (`.cursor/plans/master-agent-prompt.md`)
2. **Specyficzny Prompt** z `.cursor/plans/next-prompts.md`:
   - Agent 2 → PROMPT 1
   - Pozostali → PROMPT 2

**Przykład dla Agent 2:**

```
[Zawartość .cursor/plans/master-agent-prompt.md]

---

[PROMPT 1 z .cursor/plans/next-prompts.md - sekcja "1. Task 6 Verification Prompt"]
```

## ✅ Checklist Przed Commitem

- [ ] Sprawdziłem zmiany (`git status`, `git diff`)
- [ ] Uruchomiłem `pnpm lint && pnpm exec tsc --noEmit`
- [ ] Naprawiłem krytyczne błędy
- [ ] Commit message jest opisowy (`feat:`, `fix:`, etc.)
- [ ] Zmiany są logicznie zgrupowane
- [ ] Gotowy do push/pr (jeśli większa zmiana)

---

**Gotowy do rozpoczęcia pracy z agentami! 🚀**

















