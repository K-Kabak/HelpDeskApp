# Prompt dla Agenta 4 (Security) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przeprowadź security review i przygotuj aplikację do bezpiecznego wdrożenia produkcyjnego: security audit, security hardening, security documentation.

---

## 📋 ZADANIA DO WYKONANIA

### 1. SECURITY AUDIT

#### 1.1. Authentication & Authorization Review
**Zadanie:**
- Przeprowadź pełny przegląd autentykacji i autoryzacji

**Sprawdź:**
- ✅ Wszystkie endpointy wymagają autentykacji
- ✅ Wszystkie endpointy sprawdzają role (gdzie potrzeba)
- ✅ Wszystkie endpointy sprawdzają organization scoping
- ✅ Session management jest bezpieczny
- ✅ Password hashing używa bcrypt z odpowiednim salt rounds
- ✅ JWT tokens są bezpieczne (expiry, signing)
- ✅ Nie ma możliwości privilege escalation

**Napraw:**
- Jeśli znajdziesz luki w autoryzacji - napraw
- Jeśli znajdziesz problemy z org scoping - napraw
- Jeśli znajdziesz problemy z session management - napraw

#### 1.2. Input Validation Review
**Zadanie:**
- Przeprowadź przegląd walidacji inputu

**Sprawdź:**
- ✅ Wszystkie API endpointy walidują input (Zod schemas)
- ✅ Wszystkie formularze walidują input po stronie klienta
- ✅ Wszystkie inputy są sanitizowane (XSS protection)
- ✅ SQL injection nie jest możliwe (Prisma używa parameterized queries)
- ✅ File uploads są walidowane (size, type)
- ✅ Rate limiting jest zastosowany na krytycznych endpointach

**Napraw:**
- Jeśli znajdziesz brakującą walidację - dodaj
- Jeśli znajdziesz problemy z sanitization - napraw
- Jeśli znajdziesz brakujące rate limiting - dodaj

#### 1.3. Data Protection Review
**Zadanie:**
- Przeprowadź przegląd ochrony danych

**Sprawdź:**
- ✅ Wszystkie dane są scoped do organizationId
- ✅ Requesters nie mogą zobaczyć danych innych organizacji
- ✅ Requesters nie mogą zobaczyć internal comments
- ✅ Requesters nie mogą zobaczyć internal attachments
- ✅ Audit logs nie zawierają PII w logach
- ✅ Secrets nie są logowane
- ✅ Error messages nie ujawniają wewnętrznych szczegółów

**Napraw:**
- Jeśli znajdziesz luki w data protection - napraw
- Jeśli znajdziesz problemy z loggingiem - napraw

#### 1.4. XSS & Injection Review
**Zadanie:**
- Przeprowadź przegląd podatności na XSS i injection

**Sprawdź:**
- ✅ Wszystkie user-generated content jest sanitizowane
- ✅ Markdown jest sanitizowane przed renderowaniem
- ✅ React używa bezpiecznego renderowania (nie `dangerouslySetInnerHTML` bez sanitization)
- ✅ SQL injection nie jest możliwe (Prisma)
- ✅ Command injection nie jest możliwe

**Napraw:**
- Jeśli znajdziesz podatności - napraw
- Jeśli znajdziesz niebezpieczne renderowanie - napraw

---

### 2. SECURITY HARDENING

#### 2.1. Rate Limiting
**Zadanie:**
- Sprawdź czy rate limiting jest zastosowany wszędzie gdzie potrzeba
- Sprawdź czy rate limiting jest odpowiednio skonfigurowany

**Sprawdź:**
- ✅ Rate limiting jest na login endpoint
- ✅ Rate limiting jest na ticket creation
- ✅ Rate limiting jest na comment creation
- ✅ Rate limiting jest na bulk actions
- ✅ Rate limiting ma odpowiednie limity

**Napraw:**
- Jeśli brakuje rate limiting - dodaj
- Jeśli limity są zbyt wysokie/niskie - dostosuj

#### 2.2. CORS & Headers
**Zadanie:**
- Sprawdź czy CORS jest odpowiednio skonfigurowany
- Sprawdź czy security headers są ustawione

**Sprawdź:**
- ✅ CORS jest skonfigurowany (jeśli potrzeba)
- ✅ Security headers są ustawione (CSP, X-Frame-Options, etc.)
- ✅ HTTPS jest wymagany w produkcji

**Napraw:**
- Jeśli CORS jest niepoprawny - napraw
- Jeśli brakuje security headers - dodaj

#### 2.3. Secrets Management
**Zadanie:**
- Sprawdź czy secrets są bezpiecznie zarządzane

**Sprawdź:**
- ✅ Wszystkie secrets są w environment variables
- ✅ Secrets nie są w kodzie
- ✅ Secrets nie są w logach
- ✅ `.env.local` jest w `.gitignore`
- ✅ `.env.example` nie zawiera prawdziwych secrets

**Napraw:**
- Jeśli znajdziesz secrets w kodzie - usuń i przenieś do env vars
- Jeśli znajdziesz secrets w logach - napraw logging

---

### 3. SECURITY TESTING

#### 3.1. Security Tests
**Zadanie:**
- Sprawdź czy istnieją security tests
- Jeśli nie, dodaj podstawowe security tests

**Sprawdź:**
- ✅ Testy sprawdzają authorization (role checks)
- ✅ Testy sprawdzają organization scoping
- ✅ Testy sprawdzają input validation
- ✅ Testy sprawdzają rate limiting

**Napraw:**
- Jeśli brakuje security tests - dodaj podstawowe testy

#### 3.2. Penetration Testing (Opcjonalne)
**Zadanie:**
- Rozważ podstawowe penetration testing
- Sprawdź czy można:
  - Bypass authentication
  - Access data z innej organizacji
  - Perform privilege escalation
  - Inject malicious code

**Napraw:**
- Jeśli znajdziesz podatności - napraw

---

### 4. SECURITY DOCUMENTATION

#### 4.1. Security Policy
**Zadanie:**
- Utwórz dokumentację security policy
- Plik: `docs/security-policy.md`

**Zawartość:**
- Authentication requirements
- Authorization model
- Data protection measures
- Security best practices
- Incident response procedures

#### 4.2. Security Checklist
**Zadanie:**
- Utwórz security checklist dla deploymentu
- Plik: `docs/security-checklist.md`

**Zawartość:**
- Pre-deployment security checks
- Security configuration checklist
- Security monitoring checklist

#### 4.3. Threat Model Update
**Zadanie:**
- Sprawdź czy istnieje `docs/threat-model.md`
- Jeśli istnieje, zaktualizuj z najnowszymi informacjami
- Jeśli nie istnieje, rozważ utworzenie podstawowego

---

### 5. SECURITY MONITORING

#### 5.1. Security Logging
**Zadanie:**
- Sprawdź czy security events są logowane

**Sprawdź:**
- ✅ Failed login attempts są logowane
- ✅ Authorization failures są logowane
- ✅ Rate limit violations są logowane
- ✅ Suspicious activities są logowane

**Napraw:**
- Jeśli brakuje security logging - dodaj

#### 5.2. Security Alerts (Opcjonalne)
**Zadanie:**
- Rozważ dodanie alertów dla security events
- Lub przynajmniej dokumentację jak monitorować

---

## ✅ DEFINICJA GOTOWOŚCI

Security jest gotowe do produkcji gdy:

1. ✅ Security audit został wykonany
2. ✅ Wszystkie znalezione podatności zostały naprawione
3. ✅ Rate limiting jest zastosowany
4. ✅ Security headers są ustawione
5. ✅ Secrets management jest bezpieczny
6. ✅ Security tests przechodzą
7. ✅ Security documentation jest kompletna

---

## 📝 WZORCE DO NAŚLADOWANIA

### Security Test Pattern
```typescript
describe('Authorization Security', () => {
  it('should reject requester accessing other org tickets', async () => {
    const requester = await createTestUser({ role: 'REQUESTER', orgId: 'org1' });
    const ticket = await createTestTicket({ orgId: 'org2' });
    
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      headers: { cookie: await getAuthCookie(requester) },
    });
    
    expect(response.status).toBe(404); // Not found, not 403 (security by obscurity)
  });
});
```

### Rate Limiting Pattern
```typescript
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const rate = checkRateLimit(req, 'ticket:create', {
    limit: 10,
    window: 60, // 10 requests per minute
  });
  
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... rest of handler
}
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj authentication/authorization** - sprawdź wszystkie endpointy
3. **Przejrzyj input validation** - sprawdź wszystkie endpointy
4. **Przejrzyj data protection** - sprawdź org scoping
5. **Sprawdź rate limiting** - upewnij się że jest wszędzie gdzie potrzeba
6. **Utwórz security documentation** - dokumentuj security measures

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Bądź dokładny** - security wymaga precyzji
3. **Testuj zmiany** - upewnij się że security fixes nie zepsuły funkcjonalności
4. **Współpracuj z Agentem 1** - upewnij się że backend security jest kompletny
5. **Dokumentuj wszystko** - security measures muszą być udokumentowane

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista przeglądniętych obszarów security
- Lista znalezionych podatności
- Lista naprawionych problemów
- Lista utworzonej dokumentacji
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**




