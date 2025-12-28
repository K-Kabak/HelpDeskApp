# Instrukcja Uruchomienia i Wyłączenia HelpDeskApp

Kompletna instrukcja uruchomienia aplikacji HelpDeskApp na Windows z PowerShell.

---

## Wymagania Wstępne

- **Node.js 22+** (sprawdź: `node --version`)
- **pnpm** (zainstaluj: `npm install -g pnpm`)
- **Docker Desktop** (uruchomiony)

---

## Instalacja pnpm (jeśli nie jest zainstalowane)

### Opcja 1: Przez npm
```powershell
npm install -g pnpm
```

### Opcja 2: Przez oficjalny skrypt
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

Po instalacji **zamknij i otwórz ponownie PowerShell**.

---

## Konfiguracja PATH dla pnpm (jeśli nie działa)

Jeśli pnpm nie jest rozpoznawane po instalacji, dodaj do PATH:

### Tymczasowo (dla bieżącej sesji):
```powershell
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"
```

### Na stałe (dla wszystkich sesji):
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global", [EnvironmentVariableTarget]::User)
```

Po wykonaniu na stałe, **zamknij i otwórz ponownie PowerShell**.

---

## Pełna Sekwencja Uruchomienia

### Wszystkie kroki razem (gotowe do wklejenia):

```powershell
# 1. Dodaj pnpm do PATH (wymagane w każdej nowej sesji PowerShell)
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"

# 2. Zatrzymaj poprzednie instancje Next.js (jeśli istnieją)
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 3. Usuń lock file Next.js (jeśli istnieje)
Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue

# 4. Uruchom serwisy Docker (PostgreSQL, Redis, MinIO)
docker compose up -d

# 5. Poczekaj 3 sekundy na uruchomienie serwisów
Start-Sleep -Seconds 3

# 6. Sprawdź czy .env.local istnieje (jeśli nie, zostanie utworzony)
if (-not (Test-Path .env.local)) {
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/helpdesk
NEXTAUTH_SECRET=$secret
NEXTAUTH_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
    Write-Host "Plik .env.local został utworzony"
} else {
    Write-Host "Plik .env.local już istnieje"
}

# 7. Uruchom aplikację
pnpm dev
```

---

### Szybka wersja (jeśli wszystko już skonfigurowane):

```powershell
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"; Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue; docker compose up -d; Start-Sleep -Seconds 3; pnpm dev
```

---

## Wyłączenie Aplikacji

### Krok 1: Zatrzymaj serwer deweloperski
W terminalu, gdzie działa `pnpm dev`, naciśnij: **`Ctrl+C`**

### Krok 2: Zatrzymaj wszystkie procesy Node.js (jeśli trzeba)
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Krok 3: Zatrzymaj serwisy Docker
```powershell
docker compose down
```

### Pełna sekwencja wyłączenia:
```powershell
# 1. Zatrzymaj wszystkie procesy Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Zatrzymaj serwisy Docker
docker compose down
```

---

## Rozwiązywanie Problemów

### Problem: Port 3000 jest zajęty

**Objawy:**
```
⚠ Port 3000 is in use by process 23044, using available port 3001 instead.
```

**Rozwiązanie:**
```powershell
# Znajdź proces zajmujący port 3000
netstat -ano | findstr :3000

# Zatrzymaj proces (zastąp PID numerem procesu z powyższej komendy)
Stop-Process -Id [PID] -Force
```

**Uwaga:** Jeśli port 3000 jest zajęty, Next.js automatycznie użyje portu 3001. Sprawdź w terminalu, na którym porcie działa aplikacja:
- `http://localhost:3000` (domyślny)
- `http://localhost:3001` (jeśli 3000 jest zajęty)

---

### Problem: Lock file blokuje uruchomienie

**Objawy:**
```
⨯ Unable to acquire lock at C:\Users\kacpe\Documents\GitHub\HelpDeskApp\.next\dev\lock, is another instance of next dev running?
```

**Rozwiązanie:**
```powershell
# Usuń lock file
Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue
```

---

### Problem: Inna instancja Next.js działa

**Rozwiązanie:**
```powershell
# Zatrzymaj wszystkie procesy Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

### Problem: pnpm nie jest rozpoznawane

**Rozwiązanie:**
```powershell
# Dodaj pnpm do PATH (tymczasowo)
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"

# Sprawdź lokalizację pnpm
npm config get prefix

# Dodaj na stałe (zastąp ścieżką z powyższej komendy)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global", [EnvironmentVariableTarget]::User)
```

---

### Problem: Błąd migracji Prisma

**Objawy:**
```
Error: P3018
A migration failed to apply. New migrations cannot be applied before the error is recovered from.
```

**Rozwiązanie:**
Zobacz dokumentację w `docs/migration-review.md` lub skontaktuj się z zespołem deweloperskim.

---

## Sprawdzanie Statusu

### Sprawdź działające kontenery Docker:
```powershell
docker compose ps
```

### Sprawdź logi kontenerów:
```powershell
# Wszystkie serwisy
docker compose logs -f

# Konkretny serwis
docker compose logs -f db
docker compose logs -f redis
docker compose logs -f minio
```

### Sprawdź status aplikacji:
Otwórz w przeglądarce: `http://localhost:3000` (lub `http://localhost:3001` jeśli port 3000 jest zajęty)

---

## Dane Logowania (Demo)

Po pierwszym uruchomieniu i wykonaniu seed, dostępne są następujące konta:

- **Admin:** `admin@serwisdesk.local` / `Admin123!`
- **Agent:** `agent@serwisdesk.local` / `Agent123!`
- **Requester:** `requester@serwisdesk.local` / `Requester123!`

**⚠️ Uwaga:** Zmień hasła po pierwszym uruchomieniu, jeśli aplikacja jest dostępna publicznie.

---

## Opcjonalne: Uruchomienie Worker'a

Worker obsługuje zadania w tle (SLA breach detection, przypomnienia). Aby uruchomić worker:

```powershell
# W osobnym terminalu PowerShell
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"
pnpm worker:start
```

Aby zatrzymać worker, naciśnij **`Ctrl+C`** w terminalu z worker'em.

---

## Pierwsza Instalacja (Jednorazowo)

Jeśli uruchamiasz aplikację po raz pierwszy:

1. **Zainstaluj zależności:**
   ```powershell
   $env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"
   pnpm install
   ```

2. **Uruchom migracje bazy danych:**
   ```powershell
   npx dotenv-cli -e .env.local -- prisma migrate deploy
   ```

3. **Uruchom seed (dane demo):**
   ```powershell
   npx dotenv-cli -e .env.local -- prisma db seed
   ```

4. **Uruchom aplikację** (użyj pełnej sekwencji uruchomienia powyżej)

---

## Szybkie Referencje

### Uruchomienie:
```powershell
$env:Path += ";C:\Users\kacpe\Documents\GitHub\HelpDesk\npm-global"; docker compose up -d; Start-Sleep -Seconds 3; pnpm dev
```

### Wyłączenie:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force; docker compose down
```

### Sprawdzenie statusu:
```powershell
docker compose ps
```

---

## Wsparcie

W razie problemów:
1. Sprawdź logi: `docker compose logs -f`
2. Sprawdź dokumentację w katalogu `docs/`
3. Skontaktuj się z zespołem deweloperskim

---

**Ostatnia aktualizacja:** 2025-12-28


