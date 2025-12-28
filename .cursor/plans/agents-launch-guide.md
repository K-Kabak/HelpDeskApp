# 🚀 Przewodnik Uruchamiania Agentów

## ✅ TAK - Możesz uruchomić wszystkich agentów jednocześnie!

Wszyscy agenci mogą pracować równolegle, ponieważ pracują na **różnych plikach i funkcjach**.

---

## 📋 Kolejność Uruchamiania (Opcjonalna - dla lepszej organizacji)

### Opcja A: Wszystko jednocześnie (NAJSZYBSZA - REKOMENDOWANA)

**Możesz wkleić prompty wszystkim agentom w tym samym momencie:**

1. **Agent 2** → Task 6 Verification (Frontend - ticket detail)
2. **Agent 1** → New Features - Backend (reporting, email)
3. **Agent 3** → New Features - QA/Tests
4. **Agent 4** → New Features - Security
5. **Agent 5** → New Features - Database
6. **Agent 6** → New Features - API/OpenAPI

**Wszyscy pracują równolegle - bezpieczne, bo różne pliki! ✅**

### Opcja B: Stopniowo (jeśli wolisz kontrolę)

1. **Najpierw:** Agent 2 (Task 6 - szybka weryfikacja, ~15-30 min)
2. **Potem równolegle:** Pozostali agenci (Agent 1, 3, 4, 5, 6)

---

## 📝 Co Wkleić Każdemu Agentowi

### Dla Agent 2:
```
[Zawartość .cursor/plans/master-agent-prompt.md]

---

[PROMPT 1 z .cursor/plans/next-prompts.md - sekcja "Task 6 Verification"]
```

### Dla Agentów 1, 3, 4, 5, 6:
```
[Zawartość .cursor/plans/master-agent-prompt.md]

---

[PROMPT 2 z .cursor/plans/next-prompts.md - sekcja "New Features Development"]

Focus: [Specyficzny focus dla agenta]
- Agent 1: Reporting/analytics endpoints, email notification delivery
- Agent 3: Test improvements, QA processes
- Agent 4: Security reviews, security improvements
- Agent 5: Database optimizations, query improvements
- Agent 6: API improvements, OpenAPI updates
```

### Na końcu pracy każdego agenta (dodaj ten prompt):
```
[Zawartość .cursor/plans/mini-final-commit-prompt.md lub COPY-THIS-MINI-PROMPT.md]
```

---

## ✅ Bezpieczne Obszary Pracy (Brak Konfliktów)

| Agent | Obszary Pracy | Pliki | Konflikty? |
|-------|---------------|-------|------------|
| Agent 2 | Frontend - Ticket Detail | `src/app/app/tickets/[id]/*` | ❌ Brak |
| Agent 1 | Backend - Endpoints | `src/app/api/reporting/*`, `src/app/api/email/*` | ❌ Brak |
| Agent 3 | Tests/QA | `tests/*`, `docs/*` | ⚠️ Możliwe z Agent 6 (OpenAPI) |
| Agent 4 | Security | Review `src/lib/authorization.ts`, `src/app/api/*` | ⚠️ Review tylko |
| Agent 5 | Database | `prisma/schema.prisma`, queries | ⚠️ Migration conflicts możliwe |
| Agent 6 | API/OpenAPI | `docs/openapi.yaml`, API contracts | ⚠️ Możliwe z Agent 1, 3 |

**Rozwiązanie konfliktów:**
- Jeśli dwa agenty modyfikują ten sam plik → jeden kończy, potem drugi
- Plan file (`.cursor/plans/*`) - agenci mogą aktualizować różne sekcje
- Database migrations - Agent 5 powinien koordynować, jeśli inne agenty potrzebują zmian DB

---

## 🎯 Instrukcje dla Każdego Agenta

### Przed rozpoczęciem pracy:

1. **Sprawdź zależności** - czy poprzednie taski są ukończone
2. **Sprawdź konflikty plików** - czy inne agenty pracują na tych samych plikach
3. **Przeczytaj Master Prompt** - zrozum kontekst projektu
4. **Zrozum zadanie** - przeczytaj swój specyficzny prompt

### Podczas pracy:

- ✅ Pracuj na swoich plikach/obszarach
- ✅ Nie zatrzymuj się po małych zmianach
- ✅ Commit po większych funkcjach
- ✅ Testy na końcu
- ✅ Aktualizuj plan file (jeśli potrzebne)

### Po zakończeniu:

- ✅ Uruchom checki: `pnpm lint && pnpm exec tsc --noEmit`
- ✅ Utwórz branch i commit
- ✅ Utwórz PR z auto-merge (lub direct commit jeśli małe zmiany)
- ✅ Użyj mini final commit prompt

---

## ⚠️ Ostrzeżenia

**Nie uruchamiaj równolegle jeśli:**
- ❌ Taski mają zależności (np. Task 3 wymaga Task 1)
- ❌ Dwóch agentów musi modyfikować ten sam plik
- ❌ Jeden agent potrzebuje outputu drugiego

**W takich przypadkach:**
- Poczekaj na ukończenie zależności
- Skieruj agentów do różnych plików
- Uruchom sekwencyjnie

---

## 🚀 Gotowy do Startu!

**Rekomendacja: Uruchom wszystkich jednocześnie (Opcja A)**

1. Przygotuj prompty dla każdego agenta
2. Wklej je wszystkim w tym samym momencie
3. Monitoruj postęp (sprawdzaj zmiany w plikach)
4. Nie zatrzymuj agentów - pracują do końca
5. Po zakończeniu - użyj final commit prompt

**Powodzenia! 🎉**







