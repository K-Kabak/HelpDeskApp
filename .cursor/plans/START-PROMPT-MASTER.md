# 🚀 Startowy Master Prompt - HelpDeskApp Development

**UWAGA: To jest STARTOWY PROMPT dla nowej konwersacji z AI agentem.**
**Wklej całą zawartość tego pliku na początku nowej konwersacji, aby agent miał pełny kontekst projektu.**

---

Cześć! Jestem AI coding assistant pracujący nad projektem **HelpDeskApp**. Przed rozpoczęciem pracy, muszę przeczytać wszystkie ważne dokumenty i plany, aby zrozumieć aktualny stan projektu i to, co pozostało do zrobienia.

**Moja misja:**
1. Przeanalizować cały kod w repozytorium
2. Sprawdzić aktualny stan wykonania zadań
3. Zaktualizować plany zgodnie z rzeczywistością
4. Przygotować kolejne prompty dla pozostałych zadań (jeśli są potrzebne)

---

## 📚 NAJPIERW PRZECZYTAJ WSZYSTKIE WAŻNE DOKUMENTY

**Muszę przeczytać i zrozumieć:**

1. **`.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md`** - Główny plan wykonawczy
   - Zawiera wszystkie zadania, ich status, definicje agentów
   - Opisuje co zostało zrobione i co pozostało

2. **`.cursor/plans/master-agent-prompt.md`** - Master prompt dla agentów
   - Kontekst projektu, workflow, zasady kodowania
   - Instrukcje jak pracować z kodem

3. **`BLUEPRINT.md`** - Architektura wysokiego poziomu
   - Ogólny zarys aplikacji i funkcjonalności

4. **`docs/github-backlog.md`** - Backlog zadań
   - Lista wszystkich zadań P0, P1, P2
   - Sprawdź co jest jeszcze do zrobienia

5. **`docs/current-state.md`** - Aktualny stan implementacji
   - Co jest zaimplementowane w kodzie

6. **`.cursor/plans/NEXT-PROMPTS-8-11.md`** - Prompty 8-11 (jeśli istnieją)
7. **`.cursor/plans/NEXT-PROMPTS-12-15.md`** - Prompty 12-15 (jeśli istnieją)

**Przeczytaj te pliki w pierwszej kolejności, zanim zaczniesz cokolwiek robić.**

---

## 🎯 KONTEKST PROJEKTU

### Aplikacja HelpDeskApp

**HelpDeskApp** to pełnofunkcjonalna platforma Help Desk / Service Desk zbudowana z:

**Stack technologiczny:**
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Authentication:** NextAuth z JWT sessions, Prisma adapter
- **Database:** PostgreSQL z Prisma ORM
- **Background Jobs:** BullMQ z Redis (przetwarzanie SLA)
- **Storage:** MinIO (załączniki plików)
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **CI/CD:** GitHub Actions workflows

**Kluczowe funkcjonalności:**
- Role-Based Access Control (RBAC): `REQUESTER`, `AGENT`, `ADMIN`
- Organization Scoping: Wszystkie dane są scoped przez `organizationId`
- Audit Logging: Wszystkie zmiany logowane do `AuditEvent` i `AdminAudit`
- SLA Tracking: Daty odpowiedzi/rozwiązania z detekcją naruszeń
- Cursor-based Pagination: Dla dużych list
- Markdown Sanitization: Ochrona XSS

**Struktura repozytorium:**
```
src/
├── app/
│   ├── api/              # API routes (REST endpoints)
│   │   ├── admin/        # Admin endpoints (users, teams, audit, SLA policies)
│   │   ├── tickets/      # Ticket CRUD, comments, attachments
│   │   └── notifications/ # In-app notifications
│   └── app/              # Authenticated UI pages
│       ├── admin/        # Admin UI
│       ├── tickets/      # Ticket list, detail, create
│       └── notifications/ # Notification center
├── lib/                  # Shared utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── authorization.ts  # RBAC helpers
│   ├── prisma.ts         # Prisma client singleton
│   └── ...
└── components/           # Shared React components
```

---

## ✅ CO ZOSTAŁO ZROBIONE (Status na podstawie planu)

### Zakończone zadania (Phase 1):

- ✅ **Task 1:** Worker job routing (SLA breach/reminder handlers)
- ✅ **Task 2:** CI/CD pipeline (GitHub Actions)
- ✅ **Task 3:** Worker health checks
- ✅ **Task 4:** Admin Users/Teams Management UI
- ✅ **Task 5:** In-App Notification Center UI
- ✅ **Task 6:** Ticket detail enhancements (reopen reason, assignment suggestions)
- ✅ **Task 7:** Documentation updates
- ✅ **Task 8:** Integration tests
- ✅ **Task 9:** Performance optimization (indexes, budget)
- ✅ **Task 10:** Production deployment documentation

### Zakończone funkcjonalności:

- ✅ Reporting/Analytics endpoints and UI
- ✅ CSAT improvements (Customer Satisfaction surveys)
- ✅ Automation rules UI enhancements
- ✅ Dashboard widgets (SLA status, ticket stats, KPI cards)
- ✅ Export functionality (CSV exports)
- ✅ Real Email Notification Delivery (nodemailer)
- ✅ Notification Center Filters
- ✅ Dashboard Polish (refresh button, tooltips, loading states)
- ✅ Mobile Responsiveness Improvements (Prompt 8)
- ✅ Error Messages & UX Polish (Prompt 9)
- ✅ Accessibility Improvements (Prompt 10)
- ✅ Code Comments & Documentation (Prompt 11)

### Prompty 8-11: ✅ WYKONANE
- PROMPT 8: Mobile responsiveness - ✅ Completed
- PROMPT 9: Error messages & UX polish - ✅ Completed
- PROMPT 10: Accessibility improvements - ✅ Completed
- PROMPT 11: Code comments & documentation - ✅ Completed

---

## ❌ CO POZOSTAŁO DO ZROBIENIA

### Prompty 12-15: ⚠️ SPRAWDŹ STATUS W KODZIE

**Zgodnie z planem, prompty 12-15 powinny obejmować:**

**PROMPT 12: Bulk Actions on Ticket List**
- Backend: API endpoint `PATCH /api/tickets/bulk` - ⚠️ SPRAWDŹ CZY ISTNIEJE
- Frontend: UI z checkboxami i toolbar do masowych akcji - ⚠️ SPRAWDŹ CZY ISTNIEJE

**PROMPT 13: Saved Views for Ticket Filters**
- Backend: SavedView model + API endpoints `/api/views` - ⚠️ SPRAWDŹ CZY ISTNIEJE
- Frontend: UI do zapisywania i przełączania widoków filtrów - ⚠️ SPRAWDŹ CZY ISTNIEJE

**PROMPT 14: Test Coverage for New Features**
- Testy dla bulk actions i saved views - ⚠️ SPRAWDŹ CZY ISTNIEJĄ

**PROMPT 15: Advanced Search Enhancements**
- Date range filtering, assignee filtering, sorting options - ⚠️ SPRAWDŹ CZY ISTNIEJE

### Opcjonalne zadania (P2 z backlogu):

- Advanced search/filtering enhancements
- Bulk actions on ticket list (backlog #88)
- Saved views for ticket filters (backlog #89)
- Inne zadania z backlogu (sprawdź `docs/github-backlog.md`)

---

## 🔍 CO MUSZĘ ZROBIĆ TERAZ

### Krok 1: Analiza kodu i weryfikacja statusu

**Muszę sprawdzić w kodzie:**

1. **Czy prompty 12-15 zostały wykonane?**
   - Sprawdź czy istnieje `/api/tickets/bulk/route.ts`
   - Sprawdź czy istnieje SavedView model w `prisma/schema.prisma`
   - Sprawdź czy istnieje `/api/views/` directory
   - Sprawdź czy w `src/lib/ticket-list.ts` są date range, assignee filtering, sorting
   - Sprawdź czy w `src/app/app/page.tsx` są checkboxes dla bulk actions
   - Sprawdź czy istnieją komponenty saved views

2. **Zaktualizuj plan wykonawczy**
   - Jeśli coś zostało zrobione, ale nie jest oznaczone w planie → zaktualizuj plan
   - Jeśli coś jest oznaczone jako zrobione, ale nie istnieje w kodzie → zaktualizuj plan

3. **Sprawdź inne zadania z backlogu**
   - Przejrzyj `docs/github-backlog.md` dla zadań P1/P2
   - Sprawdź co jeszcze może być do zrobienia

### Krok 2: Przygotowanie raportu

Po analizie, przedstaw:
1. **Co zostało rzeczywiście zrobione** (zweryfikowane w kodzie)
2. **Co pozostało do zrobienia** (brak w kodzie)
3. **Rekomendacje** co robić dalej

---

## 📋 WORKFLOW PRINCIPLES

### ⚠️ SIMPLIFIED WORKFLOW - Focus on Development Velocity

**Filozofia:** Kod najpierw, optymalizacja procesu później. Grupuj powiązane zmiany. Testy na końcu.

**Zasady:**
1. **Work on Multiple Related Tasks Together** - Nie zatrzymuj się po każdym małym zadaniu
2. **Code First, Tests Later** - Implementacja najpierw, testy na końcu
3. **Batch Commits** - Commituj po większych funkcjach, nie po każdym zadaniu
4. **Basic Checks Before Commit** - `pnpm lint && pnpm exec tsc --noEmit`
5. **Continue Working** - Nie zatrzymuj się chyba, że użytkownik wyraźnie poprosi

---

## 🛠️ WAŻNE PLIKI I DOKUMENTY

### Planning & Status
- `.cursor/plans/helpdeskapp_next_phase_plan_44a3d95a.plan.md` - Główny plan wykonawczy
- `.cursor/plans/master-agent-prompt.md` - Master prompt dla agentów
- `BLUEPRINT.md` - Architektura wysokiego poziomu
- `docs/github-backlog.md` - Backlog zadań (1421 linii)
- `docs/current-state.md` - Aktualny stan implementacji

### API & Contracts
- `docs/openapi.yaml` - OpenAPI specification
- `tests/contract/api-contract.test.ts` - Contract tests

### Database
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Migration files

### Configuration
- `package.json` - Dependencies and scripts
- `.github/workflows/ci.yml` - CI/CD pipeline

---

## 📝 COMMIT & PR WORKFLOW

### Format commit messages:
- `feat: [description]` - Nowe funkcjonalności
- `fix: [description]` - Bug fixes
- `docs: [description]` - Dokumentacja
- `test: [description]` - Testy
- `refactor: [description]` - Refaktoryzacja

### Przed commit:
1. Uruchom: `pnpm lint && pnpm exec tsc --noEmit`
2. Napraw tylko krytyczne błędy
3. Pełny test suite może być później w CI

---

## 🚀 SKRYPTY

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test             # Run tests (Vitest)
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm lint             # Run ESLint
pnpm exec tsc --noEmit # Type check
pnpm prisma:migrate   # Run migrations
pnpm prisma:seed      # Seed database
```

---

## 🔐 DEMO CREDENTIALS

- Admin: `admin@serwisdesk.local` / `Admin123!`
- Agent: `agent@serwisdesk.local` / `Agent123!`
- Requester: `requester@serwisdesk.local` / `Requester123!`

---

## 📖 KLUCZOWE IMPORTOWANIE

```typescript
import { requireAuth, ticketScope } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
```

---

## ⚡ CO TERAZ?

**Po przeczytaniu wszystkich dokumentów, wykonaj:**

1. **Przeanalizuj kod repozytorium** - Sprawdź co faktycznie istnieje w kodzie
2. **Zweryfikuj status zadań** - Porównaj plan z rzeczywistością w kodzie
3. **Zaktualizuj plan** - Oznacz co zostało zrobione, usuń co nie istnieje
4. **Przygotuj raport** - Co zostało zrobione, co pozostało, co dalej

**Pamiętaj:**
- Zawsze czytaj pliki przed edycją
- Zachowaj dokładne wcięcia
- Zawsze enforce organization scoping
- Waliduj input (Zod schemas)
- Bezpieczeństwo przede wszystkim

---

## ❓ PYTANIE NA KONIEC

Po zakończeniu analizy i aktualizacji planów:

**Czy chcesz, żebym przygotował kolejne prompty dla pozostałych zadań?**

Jeśli tak, mogę przygotować gotowe do skopiowania prompty dla:
- Kolejnych zadań z backlogu (P1/P2)
- Pozostałych funkcjonalności
- Dowolnych innych zadań, które użytkownik wskaże

---

**Jestem gotowy do pracy. Zacznę od przeczytania wszystkich ważnych dokumentów i analizy kodu.**




