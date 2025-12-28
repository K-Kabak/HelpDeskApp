# 🔧 Agent "Od Wszystkiego" - Naprawa Błędów i Uporządkowanie

**UWAGA:** Ten prompt jest dla specjalnego agenta, który naprawia błędy, uzupełnia braki i uporządkowuje repozytorium przed kolejnym etapem.

---

## 📋 KONTEKST

[Wklej najpierw zawartość całego pliku `.cursor/plans/master-agent-prompt.md`]

---

## 🎯 TWOJA MISJA

Jesteś **Agentem "Od Wszystkiego"** - Twoim zadaniem jest naprawa błędów, uzupełnienie braków i uporządkowanie repozytorium przed przejściem do kolejnego etapu rozwoju.

**Status projektu:**
- ✅ Prompty 1-11: Wykonane
- ✅ Prompty 12-15: Wykonane (Bulk Actions + Saved Views)
- ⚠️ **PROBLEM:** Wykryto błędy w kodzie wymagające naprawy

---

## 🐛 ZNALEZIONE PROBLEMY

### PROBLEM 1: Duplikacja kodu w `src/app/api/tickets/bulk/route.ts`

**Opis:**
Plik zawiera **dwie różne implementacje** funkcji `PATCH` w jednym pliku:
- Pierwsza implementacja (linie 1-296): używa schematu `bulkActionSchema` z `action` i `value`
- Druga implementacja (linie 297-525): używa schematu `bulkUpdateSchema` z `status`, `assigneeUserId`, `assigneeTeamId`

**Co naprawić:**
1. **Usuń duplikację** - zostaw tylko jedną, poprawną implementację
2. **Sprawdź która wersja jest używana w UI** (`src/app/app/bulk-actions-toolbar.tsx`)
3. **Zostaw tylko tę wersję, która jest używana**
4. **Usuń nieużywany kod** (drugą implementację i nieużywany schemat)

**Kroki:**
1. Sprawdź `src/app/app/bulk-actions-toolbar.tsx` - jaki format requestu wysyła?
2. Zostaw tylko implementację zgodną z UI
3. Usuń duplikację
4. Upewnij się, że kod kompiluje się bez błędów

---

### PROBLEM 2: Duplikacja w `src/app/app/saved-views.tsx`

**Opis:**
Plik zawiera zduplikowane importy i pola w typach:
- Zduplikowane importy: `useState`, `useRouter`, `useSearchParams` (linie 3-4 i 7-8)
- Zduplikowane pola w typie `SavedView`: `status`, `priority`, `isDefault`, `isShared` (linie 14-18 i 19-26)

**Co naprawić:**
1. **Usuń zduplikowane importy** - zostaw tylko jeden zestaw
2. **Usuń zduplikowane pola w typie** - zostaw tylko jeden zestaw
3. **Upewnij się, że typ jest poprawny** - sprawdź czy wszystkie pola są potrzebne

**Kroki:**
1. Usuń zduplikowane importy (linie 7-8)
2. Usuń zduplikowane pola w typie `SavedView` (zostaw tylko jeden zestaw)
3. Sprawdź czy kod kompiluje się bez błędów

---

### PROBLEM 3: Aktualizacja dokumentacji

**Opis:**
Dokumentacja może być nieaktualna - niektóre pliki mówią że bulk actions i saved views są "Proposed", ale są zaimplementowane.

**Co naprawić:**
1. **Sprawdź `docs/ui-ux-spec.md`** - czy mówi że bulk ops i saved views są "Proposed"?
2. **Zaktualizuj dokumentację** - zmień "Proposed" na "Implemented" jeśli funkcje są zaimplementowane
3. **Sprawdź inne pliki docs** - czy są inne miejsca gdzie trzeba zaktualizować status?

**Kroki:**
1. Przeszukaj `docs/` dla słów "Proposed" w kontekście bulk actions i saved views
2. Zaktualizuj status na "Implemented" gdzie potrzeba
3. Upewnij się, że dokumentacja odzwierciedla rzeczywistość

---

## ✅ KRYTERIA AKCEPTACJI

Po naprawie wszystkich problemów:

- ✅ `src/app/api/tickets/bulk/route.ts` - **jedna implementacja**, bez duplikacji
- ✅ `src/app/app/saved-views.tsx` - **bez zduplikowanych importów i pól**
- ✅ Kod kompiluje się bez błędów (`pnpm exec tsc --noEmit`)
- ✅ Linter nie zgłasza błędów (`pnpm lint`)
- ✅ Dokumentacja zaktualizowana (bulk actions i saved views oznaczone jako "Implemented")
- ✅ Wszystkie funkcje działają poprawnie

---

## 🔍 PROCES NAPRAWY

### Krok 1: Analiza

1. **Przeczytaj problematyczne pliki:**
   - `src/app/api/tickets/bulk/route.ts` (cały plik)
   - `src/app/app/bulk-actions-toolbar.tsx` (sprawdź jaki format requestu)
   - `src/app/app/saved-views.tsx` (cały plik)

2. **Zidentyfikuj które implementacje są używane:**
   - Sprawdź UI - jaki format requestu wysyła?
   - Sprawdź czy obie implementacje są potrzebne

### Krok 2: Naprawa

1. **Napraw `src/app/api/tickets/bulk/route.ts`:**
   - Zostaw tylko jedną implementację (tę która jest używana w UI)
   - Usuń nieużywany kod
   - Upewnij się, że funkcja jest kompletna

2. **Napraw `src/app/app/saved-views.tsx`:**
   - Usuń zduplikowane importy
   - Usuń zduplikowane pola w typach
   - Upewnij się, że kod jest poprawny

3. **Zaktualizuj dokumentację:**
   - Zmień "Proposed" na "Implemented" dla bulk actions i saved views
   - Sprawdź inne pliki docs

### Krok 3: Weryfikacja

1. **Sprawdź kompilację:**
   ```bash
   pnpm exec tsc --noEmit
   ```

2. **Sprawdź linter:**
   ```bash
   pnpm lint
   ```

3. **Sprawdź czy wszystko działa:**
   - Bulk actions powinny działać
   - Saved views powinny działać
   - Nie powinno być błędów w konsoli

---

## 📝 FORMAT COMMITU

Po naprawie wszystkich problemów:

```bash
git checkout -b fix/cleanup-duplications-and-docs
git add .
git commit -m "fix: remove code duplications and update documentation

- Remove duplicate PATCH implementation in bulk actions API
- Remove duplicate imports and type fields in saved views component
- Update documentation: mark bulk actions and saved views as implemented"
git push origin fix/cleanup-duplications-and-docs
```

**Utwórz PR z auto-merge** po weryfikacji, że wszystko działa.

---

## ⚠️ WAŻNE ZASADY

1. **Nie usuwaj funkcjonalności** - tylko napraw błędy
2. **Zachowaj działający kod** - zostaw tylko wersję która jest używana
3. **Testuj zmiany** - upewnij się, że wszystko działa
4. **Minimalne zmiany** - napraw tylko to co jest złe, nie refaktoryzuj całego kodu
5. **Dokumentacja** - zaktualizuj tylko status, nie zmieniaj całej dokumentacji

---

## 🎯 REZULTAT

Po zakończeniu pracy:

1. **Kod jest czysty** - bez duplikacji
2. **Wszystko kompiluje się** - bez błędów TypeScript
3. **Linter jest zadowolony** - bez błędów ESLint
4. **Dokumentacja jest aktualna** - odzwierciedla rzeczywistość
5. **Funkcje działają** - bulk actions i saved views działają poprawnie

**Po zakończeniu:** Zgłoś użytkownikowi że wszystkie problemy zostały naprawione i repozytorium jest gotowe do kolejnego etapu.

---

**Zacznij od przeczytania problematycznych plików i analizy sytuacji.**


