# Prompty dla Agentów 1-6 - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj aplikację HelpDeskApp do wdrożenia produkcyjnego. Zadania zostały rozdzielone między 6 agentów specjalizujących się w różnych obszarach.

---

## 📋 PRZYDZIAŁ ZADAŃ

### Agent 1 (Backend Developer)
**Plik promptu:** `.cursor/plans/AGENT-1-PRODUCTION-READINESS.md`

**Zadania:**
- Final code review - API routes i business logic
- Environment configuration
- Deployment scripts (migrations, verification)
- Monitoring setup (health checks, metrics)
- Deployment runbooks
- Backup/restore procedures

**Główne pliki:**
- `src/app/api/**/*.ts`
- `src/lib/**/*.ts`
- `src/worker/**/*.ts`
- `scripts/` (nowe scripts)
- `docs/deployment.md`
- `docs/backup-restore.md`

---

### Agent 2 (Frontend Developer)
**Plik promptu:** `.cursor/plans/AGENT-2-PRODUCTION-READINESS.md`

**Zadania:**
- Final code review - UI components
- Error handling & user feedback
- Accessibility verification
- Mobile responsiveness
- UI/UX polish (loading states, empty states)
- Code quality (remove debug code)

**Główne pliki:**
- `src/app/app/**/*.tsx`
- `src/components/**/*.tsx`

---

### Agent 3 (QA/Docs)
**Plik promptu:** `.cursor/plans/AGENT-3-PRODUCTION-READINESS.md`

**Zadania:**
- Finalizacja dokumentacji (README, User Guide, Developer Guide)
- Test coverage review
- QA checklist
- Documentation review i spójność
- Testing infrastructure

**Główne pliki:**
- `README.md`
- `docs/user-guide.md` (nowy)
- `docs/developer-guide.md` (nowy)
- `docs/testing.md` (nowy)
- `docs/production-readiness-checklist.md` (nowy)
- `tests/`

---

### Agent 4 (Security)
**Plik promptu:** `.cursor/plans/AGENT-4-PRODUCTION-READINESS.md`

**Zadania:**
- Security audit (auth, input validation, data protection, XSS/injection)
- Security hardening (rate limiting, CORS, headers, secrets)
- Security testing
- Security documentation
- Security monitoring

**Główne pliki:**
- Wszystkie pliki API i lib (security review)
- `docs/security-policy.md` (nowy)
- `docs/security-checklist.md` (nowy)
- `tests/` (security tests)

---

### Agent 5 (Database/Infrastructure)
**Plik promptu:** `.cursor/plans/AGENT-5-PRODUCTION-READINESS.md`

**Zadania:**
- Database migrations review i scripts
- Backup & restore scripts i procedures
- Database performance optimization
- Infrastructure setup (Docker, Dockerfile)
- Database monitoring

**Główne pliki:**
- `prisma/migrations/`
- `scripts/backup-database.*` (nowy)
- `scripts/restore-database.*` (nowy)
- `scripts/migrate-production.*` (nowy)
- `docker-compose.yml`
- `Dockerfile`
- `docs/database-migrations.md` (nowy)
- `docs/backup-restore.md` (nowy)
- `docs/infrastructure.md` (nowy)

---

### Agent 6 (API/Contracts)
**Plik promptu:** `.cursor/plans/AGENT-6-PRODUCTION-READINESS.md`

**Zadania:**
- OpenAPI specification update (wszystkie endpointy)
- Contract tests review i uzupełnienie
- API consistency verification
- API documentation (usage examples)

**Główne pliki:**
- `docs/openapi.yaml`
- `tests/contract/api-contract.test.ts`
- `docs/api-usage-examples.md` (nowy)

---

## 🚀 JAK URUCHOMIĆ

### Opcja A: Wszyscy równolegle (REKOMENDOWANE)
**Możesz wkleić prompty wszystkim agentom jednocześnie** - pracują na różnych plikach, bezpieczne równolegle.

1. **Agent 1** → Wklej `.cursor/plans/AGENT-1-PRODUCTION-READINESS.md`
2. **Agent 2** → Wklej `.cursor/plans/AGENT-2-PRODUCTION-READINESS.md`
3. **Agent 3** → Wklej `.cursor/plans/AGENT-3-PRODUCTION-READINESS.md`
4. **Agent 4** → Wklej `.cursor/plans/AGENT-4-PRODUCTION-READINESS.md`
5. **Agent 5** → Wklej `.cursor/plans/AGENT-5-PRODUCTION-READINESS.md`
6. **Agent 6** → Wklej `.cursor/plans/AGENT-6-PRODUCTION-READINESS.md`

### Opcja B: Stopniowo (jeśli wolisz kontrolę)
1. **Najpierw:** Agent 4 (Security) - security review jest krytyczny
2. **Potem równolegle:** Pozostali agenci (1, 2, 3, 5, 6)

---

## ✅ BEZPIECZNE OBSZARY PRACY (Brak Konfliktów)

| Agent | Obszary Pracy | Pliki | Konflikty? |
|-------|---------------|-------|------------|
| **Agent 1** | Backend API, scripts, runbooks | `src/app/api/`, `src/lib/`, `scripts/`, `docs/deployment.md` | ❌ Brak |
| **Agent 2** | Frontend UI, components | `src/app/app/`, `src/components/` | ❌ Brak |
| **Agent 3** | Dokumentacja, testy | `docs/*.md`, `README.md`, `tests/` | ⚠️ Może współpracować z Agentem 6 (API docs) |
| **Agent 4** | Security review | Wszystkie pliki (tylko review) | ⚠️ Może współpracować z Agentem 1 (security fixes) |
| **Agent 5** | Database, infrastructure | `prisma/`, `scripts/`, `docker-compose.yml` | ⚠️ Może współpracować z Agentem 1 (deployment scripts) |
| **Agent 6** | OpenAPI, contracts | `docs/openapi.yaml`, `tests/contract/` | ⚠️ Może współpracować z Agentem 3 (API docs) |

**Uwaga:** Agenci mogą współpracować, ale pracują na różnych plikach - bezpieczne równolegle.

---

## 📝 CO WKLEIĆ KAŻDEMU AGENTOWI

### Dla każdego agenta:
```
[Zawartość .cursor/plans/master-agent-prompt.md]

---

[Zawartość odpowiedniego promptu dla agenta:
- Agent 1: .cursor/plans/AGENT-1-PRODUCTION-READINESS.md
- Agent 2: .cursor/plans/AGENT-2-PRODUCTION-READINESS.md
- Agent 3: .cursor/plans/AGENT-3-PRODUCTION-READINESS.md
- Agent 4: .cursor/plans/AGENT-4-PRODUCTION-READINESS.md
- Agent 5: .cursor/plans/AGENT-5-PRODUCTION-READINESS.md
- Agent 6: .cursor/plans/AGENT-6-PRODUCTION-READINESS.md
]
```

---

## ✅ DEFINICJA GOTOWOŚCI (Wszyscy Agenci)

Projekt jest gotowy do produkcji gdy:

1. ✅ Agent 1: Backend code review, deployment scripts, runbooks - GOTOWE
2. ✅ Agent 2: Frontend code review, UX polish, accessibility - GOTOWE
3. ✅ Agent 3: Dokumentacja kompletna, testy przechodzą - GOTOWE
4. ✅ Agent 4: Security audit wykonany, wszystkie podatności naprawione - GOTOWE
5. ✅ Agent 5: Database migrations, backup/restore, infrastructure - GOTOWE
6. ✅ Agent 6: OpenAPI kompletny, contract tests przechodzą - GOTOWE

---

## 🎯 KOORDYNACJA

**Współpraca między agentami:**
- **Agent 1 + Agent 4:** Security fixes w backend
- **Agent 1 + Agent 5:** Deployment scripts consistency
- **Agent 3 + Agent 6:** API documentation consistency
- **Agent 4 + Agent 1/2:** Security fixes w kodzie

**Komunikacja:**
- Jeśli agent znajdzie problem w obszarze innego agenta - zgłoś w raporcie końcowym
- Jeśli agent potrzebuje zmian w plikach innego agenta - skoordynuj

---

## 📊 RAPORTY KOŃCOWE

Każdy agent przygotowuje raport końcowy. Po zakończeniu wszystkich agentów:

1. **Zbierz wszystkie raporty**
2. **Zweryfikuj czy wszystkie zadania zostały wykonane**
3. **Sprawdź czy nie ma konfliktów**
4. **Utwórz finalny raport gotowości do produkcji**

---

**Wszyscy agenci mogą pracować równolegle! Powodzenia! 🎯**







