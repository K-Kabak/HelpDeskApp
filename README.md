# SerwisDesk (MVP)

Webowy helpdesk/ticketing (Next.js + Prisma + NextAuth + Tailwind).

## Wymagania
- Node 22+ (w repo: `node-portable/node-v22.12.0-win-x64`)
- pnpm (`npm-global/pnpm.cmd`)
- Postgres (lokalny lub przez Docker Desktop + docker-compose)

## Konfiguracja
1. Skopiuj `.env.example` do `.env.local` i ustaw:
   - `DATABASE_URL` (np. `postgresql://postgres:postgres@localhost:5432/serwisdesk`)
   - `NEXTAUTH_SECRET` (silny losowy)
2. Zainstaluj zależności (PowerShell):
   ```powershell
   $env:PATH="$PWD\node-portable\node-v22.12.0-win-x64;$PWD\npm-global;$env:PATH"
   cd serwisdesk
   pnpm.cmd install
   ```
3. Migracje + seed (wymaga bazy):
   ```powershell
   pnpm.cmd prisma:migrate
   pnpm.cmd prisma:seed
   ```

## Uruchomienie
```powershell
pnpm.cmd dev
```
Domyślnie: http://localhost:3000  
Logowanie demo: `admin@serwisdesk.local` / `Admin123!` (zmień po starcie).

## Skrypty
- `pnpm dev` – dev server
- `pnpm build` / `pnpm start` – produkcja
- `pnpm prisma:migrate`, `pnpm prisma:seed`
- `pnpm test` – Vitest (do uzupełnienia)
- `pnpm test:e2e` – Playwright (do uzupełnienia)

## Modele (Prisma)
- Organization, User (role: REQUESTER/AGENT/ADMIN), Team, TeamMembership
- Ticket (statusy: NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE; priorytety: NISKI, SREDNI, WYSOKI, KRYTYCZNY)
- Comment (public/internal), Attachment, Tag, TicketTag, AuditEvent, SlaPolicy

## Stan MVP
- Logowanie (NextAuth credentials, Prisma adapter)
- Lista ticketów (requester widzi tylko swoje)
- Tworzenie ticketu + SLA due (first/resolve) wg SlaPolicy
- Szczegóły ticketu, komentarze public/internal (internal tylko agent/admin)
- Seed: org Demo, admin/requester/agent, zespół IT Support, przykładowy ticket

## Do zrobienia (kolejne iteracje)
- Panel admin (użytkownicy/zespoły/słowniki/SLA)
- Załączniki (upload + metadane)
- Raporty, Kanban, dashboard KPI
- E2E/Unit testy, Dockerfile + docker-compose
