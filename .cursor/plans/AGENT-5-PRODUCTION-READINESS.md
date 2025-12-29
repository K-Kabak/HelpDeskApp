# Prompt dla Agenta 5 (Database/Infrastructure) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj bazę danych i infrastrukturę do wdrożenia produkcyjnego: database migrations, backup/restore, infrastructure setup, performance optimization.

---

## 📋 ZADANIA DO WYKONANIA

### 1. DATABASE MIGRATIONS

#### 1.1. Review All Migrations
**Zadanie:**
- Sprawdź czy wszystkie migracje są gotowe do produkcji
- Sprawdź czy nie ma problemów z migracjami

**Sprawdź:**
- ✅ Wszystkie migracje są idempotentne (można uruchomić wielokrotnie)
- ✅ Wszystkie migracje mają rollback (jeśli możliwe)
- ✅ Wszystkie migracje są testowane
- ✅ Nie ma konfliktów między migracjami

**Napraw:**
- Jeśli znajdziesz problemy z migracjami - napraw
- Jeśli brakuje rollback - dodaj (jeśli możliwe)

#### 1.2. Migration Scripts
**Zadanie:**
- Utwórz scripts do zarządzania migracjami w produkcji

**Pliki:**
- `scripts/migrate-production.sh` lub `scripts/migrate-production.ps1`
- `scripts/rollback-migration.sh` lub `scripts/rollback-migration.ps1`

**Funkcjonalność:**
- Backup przed migracją
- Weryfikacja przed migracją
- Rollback w przypadku błędu
- Logging wszystkich operacji

#### 1.3. Migration Documentation
**Zadanie:**
- Utwórz dokumentację migracji
- Plik: `docs/database-migrations.md`

**Zawartość:**
- Jak uruchomić migracje w produkcji
- Jak zrobić rollback
- Jak sprawdzić status migracji
- Best practices

---

### 2. BACKUP & RESTORE

#### 2.1. Backup Scripts
**Zadanie:**
- Utwórz scripts do backup bazy danych

**Pliki:**
- `scripts/backup-database.sh` lub `scripts/backup-database.ps1`

**Funkcjonalność:**
- Backup PostgreSQL database
- Backup MinIO (jeśli używane)
- Compression
- Timestamp w nazwie pliku
- Retention policy (usuwanie starych backupów)

#### 2.2. Restore Scripts
**Zadanie:**
- Utwórz scripts do restore bazy danych

**Pliki:**
- `scripts/restore-database.sh` lub `scripts/restore-database.ps1`

**Funkcjonalność:**
- Restore z backup file
- Weryfikacja przed restore
- Safety checks (potwierdzenie przed restore w produkcji)

#### 2.3. Backup/Restore Documentation
**Zadanie:**
- Utwórz dokumentację backup/restore
- Plik: `docs/backup-restore.md`

**Zawartość:**
- Jak wykonać backup
- Jak wykonać restore
- Frequency recommendations
- Retention policy
- Disaster recovery procedures

#### 2.4. Automated Backups (Opcjonalne)
**Zadanie:**
- Rozważ skonfigurowanie automatycznych backupów
- Lub przynajmniej dokumentację jak to zrobić

---

### 3. DATABASE PERFORMANCE

#### 3.1. Index Review
**Zadanie:**
- Sprawdź czy wszystkie potrzebne indexy istnieją
- Sprawdź czy indexy są zoptymalizowane

**Sprawdź:**
- ✅ Indexy na `organizationId` (wszystkie tabele)
- ✅ Indexy na `userId` gdzie potrzeba
- ✅ Indexy na `ticketId` gdzie potrzeba
- ✅ Indexy na `status`, `priority` gdzie potrzeba
- ✅ Composite indexy gdzie potrzeba

**Napraw:**
- Jeśli brakuje indexów - dodaj migrację
- Jeśli indexy są nieoptymalne - zoptymalizuj

#### 3.2. Query Performance Review
**Zadanie:**
- Sprawdź performance najważniejszych query

**Sprawdź:**
- ✅ Ticket list query jest szybka (<200ms)
- ✅ Ticket detail query jest szybka
- ✅ Comment queries są szybkie
- ✅ Search queries są szybkie

**Napraw:**
- Jeśli query są wolne - zoptymalizuj
- Jeśli potrzeba dodatkowych indexów - dodaj

#### 3.3. Connection Pooling
**Zadanie:**
- Sprawdź czy connection pooling jest skonfigurowany
- Sprawdź czy pool size jest odpowiedni

**Sprawdź:**
- ✅ Prisma connection pool jest skonfigurowany
- ✅ Pool size jest odpowiedni dla produkcji

**Napraw:**
- Jeśli pooling nie jest skonfigurowany - skonfiguruj
- Jeśli pool size jest nieodpowiedni - dostosuj

---

### 4. INFRASTRUCTURE SETUP

#### 4.1. Docker Compose Review
**Zadanie:**
- Sprawdź czy `docker-compose.yml` jest gotowy do produkcji
- Sprawdź czy istnieje `docker-compose.prod.yml`

**Sprawdź:**
- ✅ Docker Compose zawiera wszystkie potrzebne serwisy
- ✅ Health checks są skonfigurowane
- ✅ Volumes są skonfigurowane dla persistence
- ✅ Networks są skonfigurowane bezpiecznie
- ✅ Environment variables są używane

**Napraw:**
- Jeśli Docker Compose nie jest gotowy - przygotuj
- Jeśli brakuje health checks - dodaj

#### 4.2. Production Dockerfile
**Zadanie:**
- Sprawdź czy Dockerfile jest zoptymalizowany dla produkcji
- Sprawdź czy używa multi-stage build

**Sprawdź:**
- ✅ Dockerfile używa multi-stage build
- ✅ Dockerfile jest zoptymalizowany (mały image size)
- ✅ Dockerfile nie zawiera secrets
- ✅ Dockerfile ma odpowiednie health checks

**Napraw:**
- Jeśli Dockerfile nie jest zoptymalizowany - zoptymalizuj

#### 4.3. Infrastructure Documentation
**Zadanie:**
- Utwórz dokumentację infrastruktury
- Plik: `docs/infrastructure.md`

**Zawartość:**
- Architecture diagram
- Service dependencies
- Network configuration
- Storage requirements
- Scaling considerations

---

### 5. DATABASE MONITORING

#### 5.1. Database Health Checks
**Zadanie:**
- Sprawdź czy health check endpoint sprawdza database
- Sprawdź czy worker health check sprawdza database

**Sprawdź:**
- ✅ `/api/health` sprawdza database connection
- ✅ Worker health check sprawdza database connection

**Napraw:**
- Jeśli brakuje database health checks - dodaj

#### 5.2. Database Metrics (Opcjonalne)
**Zadanie:**
- Rozważ dodanie database metrics
- Lub przynajmniej dokumentację jak monitorować

---

### 6. SEED DATA FOR PRODUCTION

#### 6.1. Production Seed Review
**Zadanie:**
- Sprawdź czy seed script jest odpowiedni dla produkcji
- Sprawdź czy nie tworzy niepotrzebnych danych

**Sprawdź:**
- ✅ Seed script nie tworzy demo data w produkcji (lub ma flagę)
- ✅ Seed script tworzy tylko niezbędne dane (admin user, etc.)

**Napraw:**
- Jeśli seed tworzy demo data - dodaj flagę `--demo` lub podobną

---

## ✅ DEFINICJA GOTOWOŚCI

Database i Infrastructure są gotowe do produkcji gdy:

1. ✅ Wszystkie migracje są gotowe i przetestowane
2. ✅ Backup/restore scripts są gotowe
3. ✅ Backup/restore procedures są udokumentowane
4. ✅ Database performance jest zoptymalizowana
5. ✅ Infrastructure setup jest gotowy
6. ✅ Database monitoring jest skonfigurowany

---

## 📝 WZORCE DO NAŚLADOWANIA

### Backup Script Pattern
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Migration Script Pattern
```bash
#!/bin/bash
# migrate-production.sh

# Backup before migration
./scripts/backup-database.sh

# Run migrations
pnpm prisma migrate deploy

# Verify migration
if [ $? -eq 0 ]; then
  echo "Migration successful"
else
  echo "Migration failed - restore backup"
  ./scripts/restore-database.sh latest
  exit 1
fi
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj migracje** - sprawdź czy są gotowe do produkcji
3. **Utwórz backup scripts** - zacznij od podstawowego backup
4. **Utwórz restore scripts** - dodaj restore functionality
5. **Sprawdź performance** - zoptymalizuj query jeśli potrzeba
6. **Przygotuj infrastructure** - Docker Compose, Dockerfile

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Testuj scripts** - upewnij się że działają przed użyciem w produkcji
3. **Backup przed zmianami** - zawsze rób backup przed migracjami
4. **Dokumentuj wszystko** - wszystkie scripts i procedures muszą być udokumentowane
5. **Współpracuj z Agentem 1** - upewnij się że deployment scripts są spójne

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista przeglądniętych migracji
- Lista utworzonych scripts
- Status database performance
- Status infrastructure setup
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**






