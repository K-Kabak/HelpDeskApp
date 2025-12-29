# Prompt dla Agenta 6 (API/Contracts) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj API documentation i contract tests do wdrożenia produkcyjnego: kompletna dokumentacja OpenAPI, contract tests, API consistency verification.

---

## 📋 ZADANIA DO WYKONANIA

### 1. OPENAPI SPECIFICATION UPDATE

#### 1.1. Complete API Documentation
**Zadanie:**
- Sprawdź czy `docs/openapi.yaml` zawiera wszystkie endpointy
- Dodaj brakujące endpointy

**Sprawdź wszystkie endpointy:**
- ✅ `/api/auth/**` - NextAuth endpoints
- ✅ `/api/tickets` - GET, POST
- ✅ `/api/tickets/[id]` - GET, PATCH, DELETE
- ✅ `/api/tickets/[id]/comments` - GET, POST
- ✅ `/api/tickets/[id]/attachments` - GET, POST
- ✅ `/api/tickets/bulk` - PATCH
- ✅ `/api/admin/users` - GET, POST
- ✅ `/api/admin/users/[id]` - GET, PATCH, DELETE
- ✅ `/api/admin/teams` - GET, POST
- ✅ `/api/admin/teams/[id]` - GET, PATCH, DELETE
- ✅ `/api/admin/audit-events` - GET
- ✅ `/api/admin/automation-rules` - GET, POST
- ✅ `/api/admin/automation-rules/[id]` - GET, PATCH, DELETE
- ✅ `/api/admin/sla-policies` - GET, POST
- ✅ `/api/admin/sla-policies/[id]` - GET, PATCH, DELETE
- ✅ `/api/notifications` - GET
- ✅ `/api/notifications/[id]/read` - PATCH
- ✅ `/api/views` - GET, POST
- ✅ `/api/views/[id]` - GET, PATCH, DELETE
- ✅ `/api/views/[id]/set-default` - PATCH
- ✅ `/api/reports/**` - wszystkie reporting endpoints
- ✅ `/api/categories` - GET
- ✅ `/api/tags` - GET
- ✅ `/api/sla/preview` - POST
- ✅ `/api/health` - GET (jeśli istnieje)

**Napraw:**
- Jeśli brakuje endpointów - dodaj do OpenAPI spec
- Jeśli schematy są niepoprawne - popraw
- Jeśli przykłady są nieaktualne - zaktualizuj

#### 1.2. Schema Consistency
**Zadanie:**
- Sprawdź czy wszystkie schematy są spójne z rzeczywistymi response

**Sprawdź:**
- ✅ Wszystkie response schematy pasują do rzeczywistych response
- ✅ Wszystkie request schematy pasują do rzeczywistych request
- ✅ Wszystkie error schematy są spójne
- ✅ Wszystkie enum values są poprawne

**Napraw:**
- Jeśli schematy nie pasują - popraw
- Jeśli brakuje schematów - dodaj

#### 1.3. OpenAPI Validation
**Zadanie:**
- Sprawdź czy OpenAPI spec przechodzi walidację

**Sprawdź:**
- ✅ `pnpm openapi:lint` przechodzi bez błędów
- ✅ OpenAPI spec jest poprawny składniowo
- ✅ Wszystkie referencje są poprawne

**Napraw:**
- Jeśli są błędy walidacji - napraw
- Jeśli są broken references - napraw

---

### 2. CONTRACT TESTS

#### 2.1. Review Contract Tests
**Zadanie:**
- Sprawdź czy `tests/contract/api-contract.test.ts` jest kompletny
- Sprawdź czy wszystkie endpointy są przetestowane

**Sprawdź:**
- ✅ Wszystkie endpointy mają contract tests
- ✅ Contract tests sprawdzają request/response schematy
- ✅ Contract tests sprawdzają error responses
- ✅ Contract tests sprawdzają status codes

**Napraw:**
- Jeśli brakuje contract tests - dodaj
- Jeśli testy nie przechodzą - napraw

#### 2.2. Contract Test Coverage
**Zadanie:**
- Upewnij się że contract tests pokrywają wszystkie endpointy

**Sprawdź:**
- ✅ GET endpoints są przetestowane
- ✅ POST endpoints są przetestowane
- ✅ PATCH endpoints są przetestowane
- ✅ DELETE endpoints są przetestowane
- ✅ Error cases są przetestowane

**Napraw:**
- Jeśli brakuje coverage - dodaj testy

---

### 3. API CONSISTENCY VERIFICATION

#### 3.1. Response Format Consistency
**Zadanie:**
- Sprawdź czy wszystkie endpointy używają spójnego formatu response

**Sprawdź:**
- ✅ Wszystkie success responses mają spójny format
- ✅ Wszystkie error responses mają spójny format
- ✅ Wszystkie paginated responses mają spójny format
- ✅ Wszystkie response mają odpowiednie status codes

**Napraw:**
- Jeśli format jest niespójny - ustandaryzuj
- Jeśli status codes są niepoprawne - popraw

#### 3.2. Error Response Consistency
**Zadanie:**
- Sprawdź czy wszystkie błędy są zwracane w spójnym formacie

**Sprawdź:**
- ✅ Wszystkie 400 errors mają spójny format
- ✅ Wszystkie 401 errors mają spójny format
- ✅ Wszystkie 403 errors mają spójny format
- ✅ Wszystkie 404 errors mają spójny format
- ✅ Wszystkie 500 errors mają spójny format

**Napraw:**
- Jeśli error format jest niespójny - ustandaryzuj

#### 3.3. Pagination Consistency
**Zadanie:**
- Sprawdź czy wszystkie paginated endpoints używają spójnego formatu

**Sprawdź:**
- ✅ Wszystkie paginated endpoints używają cursor-based pagination
- ✅ Wszystkie paginated responses mają spójny format
- ✅ Wszystkie paginated responses mają `nextCursor` i `prevCursor`

**Napraw:**
- Jeśli pagination jest niespójna - ustandaryzuj

---

### 4. API VERSIONING (Opcjonalne)

#### 4.1. API Version Strategy
**Zadanie:**
- Rozważ strategię versioning API
- Lub przynajmniej dokumentację jak będzie versioning w przyszłości

**Opcje:**
- URL versioning: `/api/v1/tickets`
- Header versioning: `Accept: application/vnd.helpdesk.v1+json`
- Query parameter: `/api/tickets?version=1`

**Dokumentuj:**
- Którą strategię wybrać (lub że na razie nie ma versioning)
- Jak będzie versioning w przyszłości

---

### 5. API DOCUMENTATION

#### 5.1. API Usage Examples
**Zadanie:**
- Utwórz dokumentację z przykładami użycia API
- Plik: `docs/api-usage-examples.md`

**Zawartość:**
- Przykłady requestów dla każdego endpointu
- Przykłady odpowiedzi
- Przykłady błędów
- Authentication examples
- Pagination examples

#### 5.2. API Changelog (Opcjonalne)
**Zadanie:**
- Rozważ utworzenie API changelog
- Plik: `docs/api-changelog.md`

**Zawartość:**
- Historia zmian w API
- Breaking changes
- Deprecated endpoints

---

### 6. CONTRACT TEST INTEGRATION

#### 6.1. CI/CD Integration
**Zadanie:**
- Sprawdź czy contract tests są uruchamiane w CI

**Sprawdź:**
- ✅ `.github/workflows/ci.yml` uruchamia contract tests
- ✅ Contract tests są uruchamiane na każdym PR
- ✅ Contract tests blokują merge jeśli nie przechodzą

**Napraw:**
- Jeśli contract tests nie są w CI - dodaj
- Jeśli nie blokują merge - skonfiguruj

---

## ✅ DEFINICJA GOTOWOŚCI

API Documentation i Contracts są gotowe do produkcji gdy:

1. ✅ OpenAPI spec jest kompletny i aktualny
2. ✅ Wszystkie endpointy są udokumentowane
3. ✅ Wszystkie schematy są poprawne
4. ✅ Contract tests przechodzą
5. ✅ API consistency jest zweryfikowana
6. ✅ API documentation jest kompletna

---

## 📝 WZORCE DO NAŚLADOWANIA

### OpenAPI Endpoint Example
```yaml
/api/tickets:
  get:
    summary: List tickets
    description: Returns a paginated list of tickets
    security:
      - cookieAuth: []
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: [NOWE, W_TOKU, ROZWIAZANE, ZAMKNIETE]
      - name: cursor
        in: query
        schema:
          type: string
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              type: object
              properties:
                tickets:
                  type: array
                  items:
                    $ref: '#/components/schemas/Ticket'
                nextCursor:
                  type: string
                prevCursor:
                  type: string
      '401':
        $ref: '#/components/responses/Unauthorized'
```

### Contract Test Example
```typescript
describe('GET /api/tickets', () => {
  it('should return tickets matching OpenAPI schema', async () => {
    const response = await fetch('/api/tickets', {
      headers: { cookie: await getAuthCookie() },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Verify schema
    expect(data).toHaveProperty('tickets');
    expect(data).toHaveProperty('nextCursor');
    expect(Array.isArray(data.tickets)).toBe(true);
  });
});
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj wszystkie API endpointy** - sprawdź które są w OpenAPI
3. **Dodaj brakujące endpointy** - do OpenAPI spec
4. **Zweryfikuj schematy** - upewnij się że pasują do rzeczywistości
5. **Sprawdź contract tests** - upewnij się że wszystkie przechodzą
6. **Zweryfikuj consistency** - sprawdź spójność formatów

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Bądź precyzyjny** - OpenAPI spec musi być dokładny
3. **Testuj zmiany** - uruchamiaj `pnpm openapi:lint` i `pnpm test:contract`
4. **Współpracuj z Agentem 1** - upewnij się że API implementation pasuje do spec
5. **Współpracuj z Agentem 3** - upewnij się że dokumentacja jest spójna

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista zaktualizowanych endpointów w OpenAPI
- Lista dodanych contract tests
- Lista znalezionych niespójności
- Status OpenAPI validation
- Status contract tests
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**

