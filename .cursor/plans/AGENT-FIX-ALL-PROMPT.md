# Prompt dla Agenta "Od Wszystkiego" - Naprawa i Uporządkowanie

## 🎯 CEL GŁÓWNY

Napraw wszystkie błędy w kodzie, uzupełnij braki, uporządkuj repozytorium i przygotuj projekt do kolejnego etapu rozwoju.

---

## 📋 ZADANIA DO WYKONANIA

### 1. NAPRAWA BŁĘDÓW PARSOWANIA I SYNTAX (PRIORYTET: P0)

#### 1.1. `src/app/api/admin/users/route.ts`
**Problem:** Duplikacja kodu w liniach 36-37 (dwa razy `logger.warn` i `return`)
**Naprawa:**
- Usuń duplikat linii 36-37
- Zostaw tylko jedną wersję sprawdzenia roli ADMIN

#### 1.2. `src/app/api/reports/analytics/route.ts`
**Problem:** Duplikacja importów i kodu (linie 1-20 i 21-37)
**Naprawa:**
- Usuń duplikację - zostaw tylko jedną wersję funkcji GET
- Użyj `requireAuth` z `@/lib/authorization` (nowsza wersja)
- Usuń stary kod z `getServerSession`

#### 1.3. `src/app/app/page.tsx`
**Problem:** Duplikacja tagu `<form>` w liniach 456-457
**Naprawa:**
- Usuń pierwszą linię 456 (duplikat)
- Zostaw tylko linię 457 z `action="/app"`

#### 1.4. `src/app/app/save-view-dialog.tsx`
**Problem:** React Hook warning - `setState` w `useEffect`
**Naprawa:**
- Zamiast `useEffect` z `setState`, użyj `key` prop na komponencie dialogu
- Albo przenieś resetowanie stanu do funkcji `onClose` i wywołuj przed zamknięciem
- Albo użyj `useEffect` z cleanup function

#### 1.5. `src/app/api/tickets/[id]/route.ts`
**Problem:** Użycie `any` w linii 66
**Naprawa:**
- Zastąp `authOptions as any` właściwym typem
- Użyj `SessionWithUser` type z `@/lib/session-types` lub zdefiniuj lokalnie

#### 1.6. `src/app/app/reports/page.tsx`
**Problem:** Użycie `any` w linii 98
**Naprawa:**
- Zastąp `authOptions as any` właściwym typem
- Użyj `SessionWithUser` type

#### 1.7. `src/app/api/views/route.ts`
**Problem:** Nieużywana zmienna `updateViewSchema` w linii 24
**Naprawa:**
- Jeśli nie jest używana, usuń definicję
- Jeśli jest potrzebna w przyszłości, dodaj komentarz `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
- Lub użyj w kodzie (sprawdź czy powinna być używana w PATCH)

#### 1.8. `src/app/app/tickets/[id]/csat/page.tsx`
**Problem:** Nieużywana zmienna `tokenValid` w linii 17
**Naprawa:**
- Jeśli nie jest używana, usuń
- Jeśli jest potrzebna do walidacji, użyj jej w kodzie

---

### 2. NAPRAWA ZNANYCH PROBLEMÓW (PRIORYTET: P0)

#### 2.1. Sprawdzenie search field w dashboard
**Problem:** Dokumentacja wskazuje, że search używa nieistniejącego pola `description`
**Weryfikacja:**
- Sprawdź `src/app/app/page.tsx` - czy search używa `descriptionMd` czy `description`
- Sprawdź `src/lib/ticket-list.ts` - czy search query używa właściwego pola
- Jeśli używa `description`, zmień na `descriptionMd`

#### 2.2. Organization scoping w Comments API
**Problem:** `src/app/api/tickets/[id]/comments/route.ts` może nie sprawdzać organizacji
**Weryfikacja i naprawa:**
- Sprawdź czy endpoint sprawdza `ticket.organizationId === session.user.organizationId`
- Jeśli nie, dodaj sprawdzenie przed autoryzacją
- Dodaj test integracyjny dla tego przypadku

---

### 3. WERYFIKACJA KOMPLETNOŚCI FUNKCJI

#### 3.1. Bulk Actions
- ✅ Backend: `/api/tickets/bulk` - sprawdź czy działa
- ✅ UI: Checkboxy, toolbar, dialogi - sprawdź czy działają
- ✅ Audit logging - sprawdź czy jest implementowany

#### 3.2. Saved Views
- ✅ Backend: `/api/views` - sprawdź wszystkie metody (GET, POST, PATCH, DELETE)
- ✅ UI: Komponenty, zapisywanie, edycja, usuwanie
- ✅ Team views - sprawdź czy działa

#### 3.3. Paginacja
- ✅ Sprawdź czy `getTicketPage` jest używany wszędzie tam gdzie powinien
- ✅ Sprawdź czy UI pokazuje kontrolki paginacji
- ✅ Sprawdź czy API endpoint `/api/tickets` używa paginacji

#### 3.4. Testy
- ✅ Sprawdź czy wszystkie testy przechodzą: `pnpm test`
- ✅ Sprawdź E2E: `pnpm test:e2e`
- ✅ Napraw testy, które nie przechodzą

---

### 4. UPORZĄDKOWANIE KODU

#### 4.1. Usuń nieużywane pliki
- Sprawdź pliki `.backup` (np. `src/app/api/admin/users/route.ts.backup`)
- Usuń jeśli nie są potrzebne

#### 4.2. Standaryzacja importów
- Upewnij się, że wszystkie pliki używają spójnych importów
- Użyj `requireAuth` zamiast `getServerSession` gdzie to możliwe (nowszy pattern)

#### 4.3. TypeScript strict mode
- Usuń wszystkie `any` types
- Użyj właściwych typów z Prisma i NextAuth
- Sprawdź czy `SessionWithUser` jest zdefiniowany i używany konsekwentnie

---

### 5. WERYFIKACJA DOKUMENTACJI

#### 5.1. OpenAPI spec
- Sprawdź czy `docs/openapi.yaml` jest zaktualizowany
- Dodaj brakujące endpointy (bulk actions, saved views)
- Upewnij się, że schematy są poprawne

#### 5.2. README
- Sprawdź czy instrukcje są aktualne
- Zaktualizuj listę funkcji jeśli potrzeba

#### 5.3. Dokumentacja znanych problemów
- Zaktualizuj `docs/known-issues.md` - usuń naprawione problemy
- Dodaj nowe jeśli znajdziesz

---

### 6. FINALNA WERYFIKACJA

#### 6.1. Lint i TypeScript
```bash
pnpm lint
pnpm exec tsc --noEmit
```
**Wymaganie:** Wszystkie błędy muszą być naprawione

#### 6.2. Testy
```bash
pnpm test
pnpm test:e2e
```
**Wymaganie:** Wszystkie testy muszą przechodzić

#### 6.3. Build
```bash
pnpm build
```
**Wymaganie:** Build musi się powieść bez błędów

---

## 📝 WZORCE DO NAŚLADOWANIA

### Authorization Pattern
```typescript
import { requireAuth } from '@/lib/authorization';

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return auth.response;
  }
  
  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // ... reszta kodu
}
```

### Session Type
```typescript
import { SessionWithUser } from '@/lib/session-types';
// lub zdefiniuj lokalnie jeśli nie istnieje
type SessionWithUser = Session & {
  user: {
    id: string;
    role: string;
    organizationId: string;
  };
};
```

### React Hook Pattern (reset state)
```typescript
// Zamiast useEffect z setState, użyj:
const handleClose = () => {
  setName("");
  setSetAsDefault(false);
  onClose();
};
```

---

## ✅ DEFINICJA GOTOWOŚCI

Projekt jest gotowy do kolejnego etapu gdy:

1. ✅ Wszystkie błędy parsowania naprawione
2. ✅ Wszystkie błędy TypeScript naprawione (brak `any`)
3. ✅ Wszystkie znane problemy naprawione lub udokumentowane
4. ✅ `pnpm lint` przechodzi bez błędów
5. ✅ `pnpm exec tsc --noEmit` przechodzi bez błędów
6. ✅ `pnpm test` przechodzi
7. ✅ `pnpm build` się powodzi
8. ✅ Kod jest uporządkowany (brak duplikacji, spójne wzorce)
9. ✅ Dokumentacja jest zaktualizowana

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj wszystkie pliki z błędami** - zrozum kontekst
2. **Napraw błędy parsowania** - zacznij od najprostszych (duplikacje)
3. **Napraw TypeScript errors** - usuń `any`, użyj właściwych typów
4. **Napraw React warnings** - popraw hook patterns
5. **Zweryfikuj znane problemy** - sprawdź czy nadal istnieją
6. **Uruchom testy** - upewnij się, że wszystko działa
7. **Uporządkuj kod** - usuń nieużywane pliki, standaryzuj importy
8. **Zaktualizuj dokumentację** - odzwierciedl aktualny stan

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj plik przed edycją** - używaj `read_file`
2. **Zachowaj istniejące wzorce** - nie zmieniaj architektury
3. **Testuj zmiany** - uruchamiaj lint i TypeScript po każdej większej zmianie
4. **Commit po zakończeniu** - nie commituj w trakcie, tylko na końcu
5. **Nie dodawaj nowych funkcji** - tylko naprawiaj i porządkuj

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj krótki raport:
- Lista naprawionych błędów
- Lista zweryfikowanych funkcji
- Lista znalezionych problemów (jeśli jakieś pozostały)
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**

