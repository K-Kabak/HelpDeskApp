# Prompt dla Agenta 3 (QA/Docs) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj testy, dokumentację i QA do wdrożenia produkcyjnego: finalizacja dokumentacji, test coverage, user guide, QA checklist.

---

## 📋 ZADANIA DO WYKONANIA

### 1. FINALIZACJA DOKUMENTACJI

#### 1.1. Aktualizacja README
**Zadanie:**
- Sprawdź czy `README.md` jest kompletny i aktualny
- Zaktualizuj listę funkcji
- Zaktualizuj instrukcje instalacji
- Dodaj sekcję "Production Deployment" jeśli brakuje

**Sprawdź:**
- ✅ README zawiera pełną listę zaimplementowanych funkcji
- ✅ README zawiera aktualne instrukcje instalacji
- ✅ README zawiera informacje o deployment
- ✅ README zawiera demo credentials
- ✅ README zawiera linki do ważnej dokumentacji

**Napraw:**
- Jeśli README jest nieaktualne - zaktualizuj
- Jeśli brakuje sekcji - dodaj

#### 1.2. User Guide
**Zadanie:**
- Utwórz podstawowy user guide dla użytkowników końcowych
- Plik: `docs/user-guide.md`

**Zawartość:**
- Jak się zalogować
- Jak utworzyć zgłoszenie
- Jak przeglądać zgłoszenia
- Jak dodać komentarz
- Jak zmienić status zgłoszenia
- Jak używać bulk actions
- Jak używać saved views
- Jak używać powiadomień
- Jak wypełnić CSAT survey

**Format:**
- Screenshoty (opcjonalne, ale pomocne)
- Step-by-step instrukcje
- FAQ sekcja

#### 1.3. Developer Documentation
**Zadanie:**
- Sprawdź czy istnieje dokumentacja dla developerów
- Jeśli nie, utwórz podstawową dokumentację

**Plik:**
- `docs/developer-guide.md`

**Zawartość:**
- Architektura aplikacji
- Jak dodać nowy endpoint
- Jak dodać nową stronę
- Jak dodać nowy komponent
- Wzorce kodu
- Best practices
- Testing guidelines

#### 1.4. API Documentation
**Zadanie:**
- Sprawdź czy `docs/openapi.yaml` jest kompletny
- Współpracuj z Agentem 6 - upewnij się że wszystkie endpointy są udokumentowane

**Sprawdź:**
- ✅ Wszystkie endpointy są w OpenAPI spec
- ✅ Wszystkie schematy są poprawne
- ✅ Wszystkie przykłady są aktualne

**Napraw:**
- Jeśli brakuje endpointów - dodaj (lub zgłoś Agentowi 6)
- Jeśli schematy są niepoprawne - popraw

---

### 2. TEST COVERAGE

#### 2.1. Review Test Coverage
**Zadanie:**
- Sprawdź pokrycie testami krytycznych ścieżek
- Uruchom testy i sprawdź wyniki

**Sprawdź:**
- ✅ Testy przechodzą: `pnpm test`
- ✅ E2E testy przechodzą: `pnpm test:e2e`
- ✅ Contract testy przechodzą: `pnpm test:contract`

**Napraw:**
- Jeśli testy nie przechodzą - napraw
- Jeśli brakuje testów dla krytycznych ścieżek - dodaj

#### 2.2. Critical Path Tests
**Zadanie:**
- Upewnij się że następujące flow są przetestowane:
  - Login flow
  - Ticket creation flow
  - Ticket update flow
  - Comment creation flow
  - Bulk actions flow
  - Saved views flow

**Sprawdź:**
- ✅ Każdy flow ma przynajmniej jeden test (unit lub E2E)

**Napraw:**
- Jeśli brakuje testów - dodaj podstawowe testy

#### 2.3. Test Documentation
**Zadanie:**
- Utwórz dokumentację testów
- Plik: `docs/testing.md`

**Zawartość:**
- Jak uruchomić testy
- Jak napisać nowy test
- Struktura testów
- Test utilities
- Mocking guidelines

---

### 3. QA CHECKLIST

#### 3.1. Production Readiness Checklist
**Zadanie:**
- Utwórz checklist gotowości do produkcji
- Plik: `docs/production-readiness-checklist.md`

**Zawartość:**
- [ ] Wszystkie testy przechodzą
- [ ] Dokumentacja jest kompletna
- [ ] Environment variables są udokumentowane
- [ ] Deployment scripts są gotowe
- [ ] Backup/restore procedures są udokumentowane
- [ ] Security review wykonany
- [ ] Performance testing wykonany
- [ ] Error handling jest kompletny
- [ ] Logging jest odpowiedni
- [ ] Monitoring jest skonfigurowany

#### 3.2. Smoke Tests
**Zadanie:**
- Utwórz listę smoke tests do wykonania przed deploymentem
- Plik: `docs/smoke-tests.md`

**Zawartość:**
- Lista podstawowych testów do wykonania po deployment
- Instrukcje jak wykonać każdy test
- Oczekiwane wyniki

---

### 4. DOCUMENTATION REVIEW

#### 4.1. Sprawdź Spójność Dokumentacji
**Zadanie:**
- Sprawdź czy dokumentacja jest spójna z kodem
- Sprawdź czy nie ma sprzeczności

**Sprawdź:**
- ✅ `docs/current-state.md` jest aktualne
- ✅ `BLUEPRINT.md` jest aktualne
- ✅ `docs/contradictions.md` jest aktualne (lub puste jeśli nie ma sprzeczności)

**Napraw:**
- Jeśli znajdziesz sprzeczności - napraw
- Jeśli dokumentacja jest nieaktualna - zaktualizuj

#### 4.2. Update Gap Analysis
**Zadanie:**
- Sprawdź `docs/gaps-core.md`
- Zaktualizuj - usuń naprawione gapy, dodaj nowe jeśli znajdziesz

---

### 5. TESTING INFRASTRUCTURE

#### 5.1. CI/CD Test Integration
**Zadanie:**
- Sprawdź czy CI/CD uruchamia wszystkie testy
- Sprawdź czy testy są uruchamiane na PR

**Sprawdź:**
- ✅ `.github/workflows/ci.yml` uruchamia testy
- ✅ Testy są uruchamiane na każdym PR

**Napraw:**
- Jeśli testy nie są uruchamiane w CI - dodaj

#### 5.2. Test Utilities
**Zadanie:**
- Sprawdź czy test utilities są kompletne
- Sprawdź czy są łatwe w użyciu

**Sprawdź:**
- ✅ `tests/test-utils/` zawiera potrzebne utilities
- ✅ Mocking utilities są dostępne
- ✅ Test helpers są udokumentowane

**Napraw:**
- Jeśli brakuje utilities - dodaj
- Jeśli utilities są nieudokumentowane - dodaj dokumentację

---

## ✅ DEFINICJA GOTOWOŚCI

QA i Dokumentacja są gotowe do produkcji gdy:

1. ✅ README jest kompletny i aktualny
2. ✅ User guide jest utworzony
3. ✅ Developer documentation jest dostępna
4. ✅ API documentation jest kompletna
5. ✅ Wszystkie testy przechodzą
6. ✅ Production readiness checklist jest gotowy
7. ✅ Dokumentacja jest spójna z kodem

---

## 📝 WZORCE DO NAŚLADOWANIA

### User Guide Format
```markdown
## Jak utworzyć zgłoszenie

1. Zaloguj się do aplikacji
2. Kliknij "Nowe zgłoszenie" na dashboardzie
3. Wypełnij formularz:
   - Tytuł (wymagane)
   - Opis (wymagane)
   - Priorytet (opcjonalne)
4. Kliknij "Utwórz zgłoszenie"
5. Zgłoszenie zostanie utworzone i pojawi się na liście
```

### Production Readiness Checklist Format
```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] Wszystkie testy przechodzą
- [ ] Lint przechodzi bez błędów
- [ ] TypeScript kompiluje się bez błędów
- [ ] Build się powodzi

### Documentation
- [ ] README jest aktualny
- [ ] User guide jest kompletny
- [ ] API documentation jest aktualna
- [ ] Deployment runbook jest gotowy

### Security
- [ ] Security review wykonany
- [ ] Wszystkie secrets są w environment variables
- [ ] Rate limiting jest włączony
- [ ] Input validation jest wszędzie
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj istniejącą dokumentację** - sprawdź co jest, czego brakuje
3. **Zaktualizuj README** - upewnij się że jest kompletny
4. **Utwórz user guide** - podstawowy przewodnik dla użytkowników
5. **Sprawdź testy** - upewnij się że wszystkie przechodzą
6. **Utwórz checklists** - production readiness i smoke tests

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Zachowaj spójność** - używaj tego samego stylu w całej dokumentacji
3. **Bądź precyzyjny** - dokumentacja powinna być jasna i zrozumiała
4. **Współpracuj z innymi agentami** - Agent 6 (API docs), Agent 1 (deployment docs)

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista zaktualizowanych dokumentów
- Lista utworzonych dokumentów
- Status testów
- Status dokumentacji: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**







