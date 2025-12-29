# Prompt dla Agenta - Przygotowanie PR do GitHub

## 🎯 CEL GŁÓWNY

Przygotuj wszystkie naprawione zmiany do GitHub: utwórz commit(y) i Pull Request z naprawionymi błędami z promptu `AGENT-FIX-ALL-PROMPT.md`.

---

## 📋 ZADANIA DO WYKONANIA

### 1. WERYFIKACJA PRZED COMMITEM

#### 1.1. Sprawdź status zmian
```bash
git status
```
**Wymaganie:** Upewnij się, że wszystkie zmiany są w staging area lub gotowe do commitowania

#### 1.2. Sprawdź diff
```bash
git diff
```
**Wymaganie:** Przejrzyj wszystkie zmiany, upewnij się że są poprawne

#### 1.3. Finalna weryfikacja
```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```
**Wymaganie:** Wszystkie komendy muszą przechodzić bez błędów

---

### 2. PRZYGOTOWANIE COMMITÓW

#### 2.1. Struktura commitów

**Opcja A: Jeden commit (jeśli wszystkie zmiany są powiązane)**
```bash
git add .
git commit -m "fix: naprawa wszystkich błędów parsowania, TypeScript i ESLint

- Naprawiono duplikacje kodu w route.ts
- Naprawiono błędy TypeScript (7 błędów w głównym kodzie)
- Naprawiono React Hook warnings
- Usunięto nieużywane zmienne
- Wszystkie błędy ESLint naprawione
- Build przechodzi bez błędów

Fixes: wszystkie błędy z AGENT-FIX-ALL-PROMPT.md"
```

**Opcja B: Wiele commitów (jeśli zmiany są logicznie oddzielone)**
```bash
# Commit 1: Naprawa błędów parsowania
git add src/app/api/admin/users/route.ts src/app/api/reports/analytics/route.ts src/app/app/page.tsx
git commit -m "fix: naprawa duplikacji kodu i błędów parsowania

- Usunięto duplikację w src/app/api/admin/users/route.ts
- Usunięto duplikację w src/app/api/reports/analytics/route.ts
- Usunięto duplikację tagu form w src/app/app/page.tsx"

# Commit 2: Naprawa błędów TypeScript
git add src/lib/auth.ts src/app/api/admin/users/route.ts src/app/app/admin/automation-rules/page.tsx src/app/app/notifications/page.tsx src/app/app/reports/page.tsx src/app/app/ticket-list.tsx src/app/app/tickets/[id]/audit-timeline.tsx
git commit -m "fix: naprawa wszystkich błędów TypeScript w głównym kodzie

- Naprawiono import NextAuthOptions w src/lib/auth.ts
- Naprawiono typ organizationId w src/app/api/admin/users/route.ts
- Naprawiono typ triggerConfig w automation-rules/page.tsx
- Naprawiono typ data w notifications/page.tsx
- Naprawiono typ KpiMetrics w reports/page.tsx
- Dodano pola SLA do typu Ticket w ticket-list.tsx
- Naprawiono typ ReactNode w audit-timeline.tsx"

# Commit 3: Naprawa React warnings i nieużywanych zmiennych
git add src/app/app/save-view-dialog.tsx src/app/api/views/route.ts src/app/app/tickets/[id]/csat/page.tsx
git commit -m "fix: naprawa React Hook warnings i nieużywanych zmiennych

- Naprawiono useEffect w save-view-dialog.tsx
- Usunięto nieużywaną zmienną updateViewSchema
- Usunięto nieużywaną zmienną tokenValid"
```

**Rekomendacja:** Użyj Opcji A (jeden commit) jeśli wszystkie zmiany są powiązane i dotyczą naprawy błędów.

---

### 3. TWORZENIE PULL REQUEST

#### 3.1. Utwórz branch (jeśli jeszcze nie istnieje)
```bash
git checkout -b fix/all-errors-fix
```
**Lub jeśli branch już istnieje:**
```bash
git checkout fix/all-errors-fix
```

#### 3.2. Push do GitHub
```bash
git push origin fix/all-errors-fix
```

#### 3.3. Utwórz Pull Request

**Tytuł PR:**
```
fix: Naprawa wszystkich błędów parsowania, TypeScript i ESLint
```

**Opis PR:**
```markdown
## 🎯 Cel
Naprawa wszystkich błędów zidentyfikowanych w `AGENT-FIX-ALL-PROMPT.md` aby projekt mógł przejść do kolejnego etapu.

## ✅ Naprawione błędy

### Błędy Parsowania i Syntax
- ✅ Duplikacja kodu w `src/app/api/admin/users/route.ts`
- ✅ Duplikacja importów w `src/app/api/reports/analytics/route.ts`
- ✅ Duplikacja tagu `<form>` w `src/app/app/page.tsx`

### Błędy TypeScript (7 błędów w głównym kodzie)
- ✅ `src/lib/auth.ts` - naprawiono import `NextAuthOptions`
- ✅ `src/app/api/admin/users/route.ts` - naprawiono typ `organizationId`
- ✅ `src/app/app/admin/automation-rules/page.tsx` - naprawiono typ `triggerConfig`
- ✅ `src/app/app/notifications/page.tsx` - naprawiono typ `data`
- ✅ `src/app/app/reports/page.tsx` - naprawiono typ `KpiMetrics`
- ✅ `src/app/app/ticket-list.tsx` - dodano pola SLA do typu Ticket
- ✅ `src/app/app/tickets/[id]/audit-timeline.tsx` - naprawiono typ ReactNode

### React Warnings
- ✅ `src/app/app/save-view-dialog.tsx` - naprawiono useEffect

### Nieużywane zmienne
- ✅ `src/app/api/views/route.ts` - usunięto nieużywaną zmienną
- ✅ `src/app/app/tickets/[id]/csat/page.tsx` - usunięto nieużywaną zmienną

## ✅ Weryfikacja

- ✅ `pnpm lint`: 0 błędów, 0 warnings
- ✅ `pnpm exec tsc --noEmit`: 0 błędów w głównym kodzie
- ✅ `pnpm build`: SUKCES

## 📝 Powiązane pliki

- `.cursor/plans/AGENT-FIX-ALL-PROMPT.md` - prompt z listą błędów
- `.cursor/plans/AGENT-FIX-TYPESCRIPT-PROMPT.md` - szczegóły naprawy TypeScript
- `.cursor/plans/STATUS-FINAL-VERIFICATION.md` - raport weryfikacji

## 🎯 Status

Projekt jest teraz gotowy do kolejnego etapu rozwoju.

Closes: #XXX (jeśli jest issue)
```

---

### 4. WERYFIKACJA PR

#### 4.1. Sprawdź czy CI przechodzi
- Po utworzeniu PR, GitHub Actions powinien automatycznie uruchomić CI
- Sprawdź czy wszystkie testy przechodzą
- Jeśli są błędy, napraw je przed merge

#### 4.2. Code Review (jeśli wymagane)
- Poproś o review jeśli jest wymagane
- Odpowiedz na komentarze review

---

### 5. MERGE PR

#### 5.1. Po zatwierdzeniu review
```bash
# Jeśli używasz GitHub CLI
gh pr merge --squash --delete-branch

# Lub przez GitHub UI:
# 1. Kliknij "Merge pull request"
# 2. Wybierz "Squash and merge" (rekomendowane dla fix PR)
# 3. Usuń branch po merge
```

#### 5.2. Weryfikacja po merge
```bash
git checkout main  # lub master
git pull
pnpm install
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```
**Wymaganie:** Wszystko musi działać po merge

---

## 📝 WZORCE COMMIT MESSAGES

### Format commit message
```
<type>: <subject>

<body>

<footer>
```

### Typy commitów
- `fix:` - naprawa błędów
- `feat:` - nowe funkcje
- `docs:` - dokumentacja
- `refactor:` - refaktoryzacja
- `test:` - testy
- `chore:` - zadania pomocnicze

### Przykłady
```bash
# Fix commit
git commit -m "fix: naprawa błędów TypeScript w głównym kodzie

Naprawiono wszystkie 7 błędów TypeScript zidentyfikowanych w
AGENT-FIX-TYPESCRIPT-PROMPT.md. Wszystkie błędy w głównym kodzie
zostały naprawione, build przechodzi bez błędów."

# Refactor commit
git commit -m "refactor: standaryzacja importów w API routes

Zastąpiono getServerSession przez requireAuth we wszystkich
API routes dla spójności i lepszej obsługi błędów."
```

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze weryfikuj przed commitem** - `pnpm lint && pnpm exec tsc --noEmit && pnpm build`
2. **Nie commituj plików tymczasowych** - `.env.local`, `node_modules`, `.next`, etc.
3. **Używaj opisowych commit messages** - wyjaśnij co i dlaczego zostało zmienione
4. **Nie commituj zmian w dokumentacji planów** - chyba że to część zadania
5. **Sprawdź .gitignore** - upewnij się że nie commitujesz niepotrzebnych plików

---

## 📊 CHECKLIST PRZED PR

- [ ] Wszystkie zmiany są commitowane
- [ ] `pnpm lint` przechodzi bez błędów
- [ ] `pnpm exec tsc --noEmit` przechodzi bez błędów w głównym kodzie
- [ ] `pnpm build` się powodzi
- [ ] Commit message jest opisowy
- [ ] Branch jest pushowany do GitHub
- [ ] PR ma opisowy tytuł i opis
- [ ] PR linkuje do odpowiednich promptów/raportów

---

## 🚀 JAK ZACZĄĆ

1. **Sprawdź status** - `git status`
2. **Przejrzyj zmiany** - `git diff`
3. **Zweryfikuj** - uruchom lint, TypeScript, build
4. **Przygotuj commit** - dodaj pliki i commit
5. **Push i PR** - push do GitHub i utwórz PR
6. **Zweryfikuj CI** - sprawdź czy CI przechodzi

---

## 📝 RAPORT KOŃCOWY

Po zakończeniu przygotuj krótki raport:
- Link do PR
- Status CI
- Lista commitowanych zmian
- Status: PR UTWORZONY / WYMAGA POPRAWEK

---

**Powodzenia! 🎯**

