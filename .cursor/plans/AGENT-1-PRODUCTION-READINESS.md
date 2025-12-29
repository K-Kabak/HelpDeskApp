# Prompt dla Agenta 1 (Backend) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj backend aplikacji do wdrożenia produkcyjnego: final code review, environment configuration, deployment scripts, monitoring setup.

---

## 📋 ZADANIA DO WYKONANIA

### 1. FINAL CODE REVIEW - BACKEND

#### 1.1. Przegląd API Routes
**Pliki do sprawdzenia:**
- `src/app/api/**/*.ts` - wszystkie endpointy API

**Sprawdź:**
- ✅ Wszystkie endpointy używają `requireAuth` lub odpowiedniej autoryzacji
- ✅ Wszystkie endpointy sprawdzają `organizationId` (org scoping)
- ✅ Wszystkie endpointy mają walidację inputu (Zod schemas)
- ✅ Wszystkie endpointy zwracają poprawne kody HTTP
- ✅ Wszystkie endpointy logują audit events (gdy modyfikują dane)
- ✅ Error handling jest spójny i bezpieczny
- ✅ Rate limiting jest zastosowany gdzie potrzeba

**Napraw:**
- Jeśli znajdziesz brakujące sprawdzenia org scoping - dodaj
- Jeśli znajdziesz brakującą walidację - dodaj Zod schema
- Jeśli znajdziesz niekonsystentne error handling - ustandaryzuj

#### 1.2. Przegląd Business Logic
**Pliki do sprawdzenia:**
- `src/lib/**/*.ts` - wszystkie utility i business logic

**Sprawdź:**
- ✅ Wszystkie funkcje mają właściwe typy (brak `any`)
- ✅ Wszystkie funkcje obsługują błędy gracefully
- ✅ Logging jest odpowiedni (nie loguje PII)
- ✅ Funkcje są testowalne (nie mają side effects tam gdzie nie trzeba)

**Napraw:**
- Jeśli znajdziesz `any` types - zastąp właściwymi typami
- Jeśli znajdziesz brakujące error handling - dodaj
- Jeśli znajdziesz problemy z loggingiem - napraw

#### 1.3. Przegląd Worker
**Pliki do sprawdzenia:**
- `src/worker/**/*.ts` - worker job processing

**Sprawdź:**
- ✅ Worker obsługuje wszystkie typy jobów poprawnie
- ✅ Worker ma odpowiednie retry logic
- ✅ Worker loguje błędy poprawnie
- ✅ Worker health check działa

**Napraw:**
- Jeśli znajdziesz problemy - napraw

---

### 2. ENVIRONMENT CONFIGURATION

#### 2.1. Sprawdź `.env.example`
**Zadanie:**
- Sprawdź czy `.env.example` zawiera wszystkie wymagane zmienne
- Upewnij się, że wszystkie zmienne są udokumentowane

**Wymagane zmienne:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret dla NextAuth
- `NEXTAUTH_URL` - URL aplikacji
- `REDIS_URL` - Redis connection (dla BullMQ)
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` - MinIO config
- `EMAIL_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` - Email config (opcjonalne)

**Napraw:**
- Jeśli brakuje zmiennych - dodaj do `.env.example`
- Dodaj komentarze wyjaśniające każdą zmienną

#### 2.2. Utwórz Production Environment Template
**Zadanie:**
- Utwórz `docs/environment-variables.md` z pełną dokumentacją zmiennych
- Dla każdej zmiennej: opis, wymagana/opcjonalna, przykład, security notes

---

### 3. DEPLOYMENT SCRIPTS

#### 3.1. Database Migration Scripts
**Zadanie:**
- Sprawdź czy wszystkie migracje są gotowe do produkcji
- Utwórz script do backup przed migracją
- Utwórz script do rollback migracji

**Pliki:**
- `scripts/backup-db.sh` lub `scripts/backup-db.ps1` (dla Windows)
- `scripts/rollback-migration.sh` lub `scripts/rollback-migration.ps1`

#### 3.2. Deployment Verification Script
**Zadanie:**
- Utwórz script do weryfikacji deploymentu
- Script powinien sprawdzać:
  - Połączenie z bazą danych
  - Połączenie z Redis
  - Połączenie z MinIO
  - Health check worker
  - Health check API

**Plik:**
- `scripts/verify-deployment.sh` lub `scripts/verify-deployment.ps1`

---

### 4. MONITORING SETUP

#### 4.1. Health Check Endpoints
**Zadanie:**
- Sprawdź czy istnieje endpoint `/api/health`
- Jeśli nie, utwórz go
- Endpoint powinien sprawdzać:
  - Database connection
  - Redis connection
  - MinIO connection (opcjonalne)

**Plik:**
- `src/app/api/health/route.ts`

#### 4.2. Metrics Endpoints (Opcjonalne)
**Zadanie:**
- Rozważ dodanie endpointu `/api/metrics` (Prometheus format)
- Lub przynajmniej logowanie kluczowych metryk

---

### 5. DEPLOYMENT RUNBOOKS

#### 5.1. Deployment Runbook
**Zadanie:**
- Sprawdź czy istnieje `docs/deployment.md`
- Jeśli istnieje, zaktualizuj z najnowszymi informacjami
- Jeśli nie istnieje, utwórz podstawowy runbook

**Zawartość:**
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Rollback procedures
- Troubleshooting

#### 5.2. Backup/Restore Procedures
**Zadanie:**
- Utwórz dokumentację backup/restore
- Plik: `docs/backup-restore.md`

**Zawartość:**
- Jak wykonać backup bazy danych
- Jak wykonać restore
- Jak wykonać backup MinIO (jeśli używane)
- Frequency recommendations
- Retention policy

---

### 6. SECURITY HARDENING (Współpraca z Agentem 4)

#### 6.1. Review Security Best Practices
**Zadanie:**
- Sprawdź czy wszystkie API endpointy mają rate limiting
- Sprawdź czy wszystkie inputy są walidowane
- Sprawdź czy wszystkie outputy są sanitizowane
- Sprawdź czy secrets nie są logowane

**Napraw:**
- Jeśli znajdziesz problemy - napraw lub zgłoś Agentowi 4

---

## ✅ DEFINICJA GOTOWOŚCI

Backend jest gotowy do produkcji gdy:

1. ✅ Wszystkie API endpointy przeszły code review
2. ✅ Wszystkie zmienne środowiskowe są udokumentowane
3. ✅ Deployment scripts są gotowe
4. ✅ Health check endpoints działają
5. ✅ Deployment runbooks są kompletne
6. ✅ Backup/restore procedures są udokumentowane

---

## 📝 WZORCE DO NAŚLADOWANIA

### Health Check Endpoint
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const healthy = checks.database;
  return NextResponse.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Environment Variables Documentation
```markdown
## DATABASE_URL
- **Type:** Required
- **Description:** PostgreSQL connection string
- **Example:** `postgresql://user:password@localhost:5432/helpdesk`
- **Security:** Contains credentials - never log or commit
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj API routes** - zacznij od najważniejszych
3. **Sprawdź environment variables** - upewnij się że wszystko jest udokumentowane
4. **Utwórz deployment scripts** - zacznij od backup/restore
5. **Utwórz health checks** - podstawowe endpointy
6. **Napisz runbooks** - dokumentacja deploymentu

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Zachowaj istniejące wzorce** - nie zmieniaj architektury
3. **Testuj zmiany** - uruchamiaj `pnpm lint && pnpm exec tsc --noEmit`
4. **Dokumentuj wszystko** - dodawaj komentarze i dokumentację
5. **Współpracuj z innymi agentami** - Agent 4 (Security), Agent 5 (Database)

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista przeglądniętych plików
- Lista znalezionych i naprawionych problemów
- Lista utworzonych scripts i dokumentacji
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**





