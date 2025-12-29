# 🛠️ Prompty 16-18 - Stabilizacja i Polisz

## ✅ Status: Prompty 1-15 Zakończone

**Wykonane:**
- ✅ Prompty 1-15: Wszystkie główne funkcje zaimplementowane
- ✅ Agent FIX ALL: Naprawa duplikacji i dokumentacji
- ✅ Repozytorium gotowe do stabilizacji

---

## PROMPT 16: Agent 1 (Backend) - Naprawa Błędów TypeScript

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Naprawa Błędów TypeScript w NextAuth Session

**Status:** Są błędy TypeScript w `src/app/api/tickets/[id]/route.ts` związane z typami NextAuth session.

**YOUR MISSION:**
1. **Przeczytaj plik z błędami:**
   - `src/app/api/tickets/[id]/route.ts`
   - Sprawdź wszystkie błędy TypeScript (10 błędów)

2. **Zidentyfikuj problem:**
   - Błędy dotyczą typów `session.user`
   - Problemy z dostępem do: `organizationId`, `id`, `role`
   - NextAuth session type nie zawiera rozszerzonych pól

3. **Napraw błędy:**
   - Sprawdź jak typy są zdefiniowane w `src/lib/auth.ts`
   - Sprawdź typy w `src/types/next-auth.d.ts`
   - Użyj poprawnego typu dla session (np. `SessionWithUser`)
   - Upewnij się, że wszystkie pola są dostępne

4. **Weryfikacja:**
   - Uruchom: `pnpm exec tsc --noEmit`
   - Sprawdź czy wszystkie błędy zniknęły
   - Uruchom: `pnpm lint`
   - Upewnij się, że kod działa poprawnie

**SIMPLIFIED WORKFLOW:**
- Przeczytaj plik z błędami
- Sprawdź definicje typów
- Napraw typy session
- Zweryfikuj że działa
- Commit when done

**ACCEPTANCE CRITERIA:**
- Wszystkie błędy TypeScript naprawione
- `pnpm exec tsc --noEmit` przechodzi bez błędów
- `pnpm lint` przechodzi bez błędów
- Kod działa poprawnie

**WHEN READY TO COMMIT:**
- After fixes work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "fix: resolve TypeScript errors in ticket route"`
- Push and create PR with auto-merge
```

---

## PROMPT 17: Agent 2 (Frontend) - Optymalizacja Bulk Actions UI

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Optymalizacja Bulk Actions UI - Użycie Bulk Endpointu

**Status:** Bulk Actions UI wysyła indywidualne requesty zamiast używać endpointu `/api/tickets/bulk`.

**YOUR MISSION:**
1. **Przeczytaj aktualną implementację:**
   - `src/app/app/bulk-actions-toolbar.tsx`
   - Sprawdź jak obecnie wysyła requesty (indywidualne do `/api/tickets/${ticketId}`)

2. **Sprawdź bulk endpoint:**
   - `src/app/api/tickets/bulk/route.ts`
   - Zrozum format requestu: `{ ticketIds: string[], action: 'assign' | 'status', value: string }`
   - Zrozum format odpowiedzi: `{ success: number, failed: number, errors: Array<{ticketId, error}> }`

3. **Zoptymalizuj UI:**
   - Zmień `handleBulkStatusUpdate` - użyj `/api/tickets/bulk` z `action: 'status'`
   - Zmień `handleBulkAssignmentUpdate` - użyj `/api/tickets/bulk` z `action: 'assign'`
   - Obsłuż odpowiedź z `success`, `failed`, `errors`
   - Pokaż szczegóły błędów jeśli jakieś ticketi się nie powiodły

4. **UI/UX:**
   - Pokaż loading state podczas bulk operation
   - Pokaż success/failure counts
   - Pokaż szczegóły błędów dla nieudanych ticketów
   - Refresh listy po sukcesie

**SIMPLIFIED WORKFLOW:**
- Przeczytaj aktualny kod
- Sprawdź bulk endpoint
- Zmień implementację
- Test w browser
- Commit when done

**ACCEPTANCE CRITERIA:**
- UI używa endpointu `/api/tickets/bulk`
- Jeden request zamiast wielu indywidualnych
- Obsługa success/failure counts
- Obsługa błędów per ticket
- UI działa poprawnie

**WHEN READY TO COMMIT:**
- After optimization works
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "perf: optimize bulk actions to use bulk endpoint"`
- Push and create PR with auto-merge
```

---

## PROMPT 18: Agent 3 (QA) - Testy E2E dla Bulk Actions i Saved Views

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Testy E2E dla Bulk Actions i Saved Views

**Status:** Bulk Actions i Saved Views są zaimplementowane, ale brakuje testów E2E.

**YOUR MISSION:**
1. **Przygotuj testy dla Bulk Actions:**
   - Test: Agent wybiera wiele ticketów i zmienia status
   - Test: Agent wybiera wiele ticketów i przypisuje do agenta
   - Test: Sprawdź że bulk operation działa poprawnie
   - Test: Sprawdź że audit events są tworzone
   - Test: Sprawdź że błędy są obsługiwane (np. ticket z innej org)

2. **Przygotuj testy dla Saved Views:**
   - Test: Użytkownik zapisuje widok z filtrami
   - Test: Użytkownik ładuje zapisany widok
   - Test: Użytkownik edytuje nazwę widoku
   - Test: Użytkownik usuwa widok
   - Test: Użytkownik ustawia widok jako domyślny
   - Test: Sprawdź że widoki są org-scoped

3. **Użyj Playwright:**
   - Utwórz pliki w `e2e/` directory
   - Użyj istniejących test utilities
   - Użyj demo credentials z master-agent-prompt.md

4. **Struktura testów:**
   - `e2e/bulk-actions.spec.ts` - testy bulk actions
   - `e2e/saved-views.spec.ts` - testy saved views
   - Użyj `test.describe` i `test` blocks

**SIMPLIFIED WORKFLOW:**
- Przeczytaj istniejące testy E2E jako przykład
- Utwórz testy dla bulk actions
- Utwórz testy dla saved views
- Uruchom testy: `pnpm test:e2e`
- Commit when done

**ACCEPTANCE CRITERIA:**
- Testy E2E dla bulk actions działają
- Testy E2E dla saved views działają
- Wszystkie testy przechodzą
- Testy pokrywają główne scenariusze

**WHEN READY TO COMMIT:**
- After tests work
- Run: `pnpm test:e2e`
- Commit: `git commit -m "test: add E2E tests for bulk actions and saved views"`
- Push and create PR with auto-merge
```

---

## 📝 FINAL COMMIT PROMPT (używaj po każdym zadaniu)

```
Jeśli po zakończeniu wszystkich zmian i wszystko działa, wykonaj:

### 1. Check & Commit
git status
pnpm lint && pnpm exec tsc --noEmit
git checkout -b feature/[nazwa-funkcji]
git add .
git commit -m "feat: [opis zmian]"
git push origin feature/[nazwa-funkcji]

### 2. Create PR with AUTO-MERGE (RECOMMENDED)

**GitHub CLI (fastest):**
gh pr create --title "feat: [opis]" --body "Implements changes. Auto-merge enabled." --fill

**GitHub UI:**
1. Click "Compare & pull request"
2. Enable "Auto-merge" → "Squash and merge"
3. Create PR

**PR will auto-merge after CI passes! ✅**

### Alternative: Direct commit (only for very small changes - 1-2 files)
git checkout main && git pull origin main
git add . && git commit -m "fix: [opis]"
git push origin main  # Only if branch protection allows

---

**RECOMMENDATION: Always use PR with auto-merge** - safer, CI checks, clean history.

**Commit format:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `perf:`
```

---

## 🎯 Kolejność Uruchamiania

**Prompty 16-18 (stabilizacja i polisz):**

1. **Agent 1** - PROMPT 16 (TypeScript Fixes) - najpierw napraw błędy
2. **Agent 2** - PROMPT 17 (Bulk Actions Optimization) - może równolegle z Prompt 16 jeśli różne pliki
3. **Agent 3** - PROMPT 18 (E2E Tests) - po Prompt 16 i 17 (testy wymagają działającego kodu)

**Zależności:**
- Prompt 17 może być równolegle z Prompt 16 (różne pliki)
- Prompt 18 wymaga Prompt 16 i 17 (testy wymagają działającego kodu)

**Wszystkie są średnie - stabilizacja i poprawa jakości!**

---

## 📊 Oczekiwane Rezultaty

Po zakończeniu wszystkich promptów 16-18:

- ✅ **Brak błędów TypeScript** - kod kompiluje się bez błędów
- ✅ **Zoptymalizowane Bulk Actions** - jeden request zamiast wielu
- ✅ **Testy E2E** - pokrycie testami bulk actions i saved views
- ✅ **Gotowość do produkcji** - aplikacja stabilna i przetestowana

---

**Gotowe do użycia! Wklej każdy prompt do odpowiedniego agenta.**








