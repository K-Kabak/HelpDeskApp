# Prompt dla Agenta - Naprawa Błędów TypeScript

## 🎯 CEL GŁÓWNY

Napraw wszystkie 7 błędów TypeScript w głównym kodzie aplikacji, aby projekt mógł przejść do kolejnego etapu.

**Status przed naprawą:**
- ✅ `pnpm lint`: 0 błędów, 0 warnings
- ❌ `pnpm exec tsc --noEmit`: 7 błędów w głównym kodzie

**Status po naprawie (wymagany):**
- ✅ `pnpm lint`: 0 błędów, 0 warnings
- ✅ `pnpm exec tsc --noEmit`: 0 błędów w głównym kodzie
- ✅ `pnpm build`: sukces

---

## 📋 ZADANIA DO WYKONANIA

### 1. `src/lib/auth.ts` - Napraw import `NextAuthOptions`

**Błąd:** `Module '"next-auth"' has no exported member 'NextAuthOptions'`

**Problem:** W nowszych wersjach NextAuth typ może mieć inną nazwę lub być w innym miejscu.

**Naprawa:**
1. Sprawdź wersję NextAuth w `package.json`
2. Sprawdź dokumentację NextAuth dla tej wersji
3. Możliwe rozwiązania:
   - Zmień `NextAuthOptions` na `AuthOptions` (jeśli to v5)
   - Użyj `import type { NextAuthOptions } from "next-auth/core/types"` (jeśli to v4)
   - Zdefiniuj typ lokalnie jeśli import nie działa:
     ```typescript
     import type { NextAuthOptions as NextAuthOptionsType } from "next-auth";
     // lub
     type NextAuthOptions = Parameters<typeof NextAuth>[0];
     ```

**Weryfikacja:** Po naprawie `pnpm exec tsc --noEmit` nie powinien pokazywać błędu dla tego pliku.

---

### 2. `src/app/api/admin/users/route.ts` - Napraw typ `organizationId`

**Błąd:** `Type 'string | undefined' is not assignable to type 'undefined'` (linia 132)

**Problem:** `auth.user.organizationId` może być `undefined`, ale Prisma wymaga `string`.

**Naprawa:**
1. Sprawdź linię 132 w pliku
2. Dodaj walidację przed użyciem:
   ```typescript
   if (!auth.user.organizationId) {
     return NextResponse.json({ error: "Organization required" }, { status: 400 });
   }
   
   const user = await prisma.user.create({
     data: {
       email,
       name,
       role: role as Role,
       passwordHash,
       organizationId: auth.user.organizationId, // Teraz na pewno string
       emailVerified: new Date(),
     },
   });
   ```

**Weryfikacja:** Po naprawie TypeScript powinien rozpoznać, że `organizationId` jest `string`.

---

### 3. `src/app/app/admin/automation-rules/page.tsx` - Napraw typ `triggerConfig`

**Błąd:** `Type 'Record<string, unknown>' is not assignable to type 'TriggerConfig'` (linia 64)

**Problem:** Typ `triggerConfig` z Prisma (`Record<string, unknown>`) nie pasuje do typu `TriggerConfig` używanego przez komponent.

**Naprawa:**
1. Sprawdź jak `AutomationRulesManager` definiuje typ `TriggerConfig`
2. Sprawdź plik `src/lib/automation-rules.ts` - tam powinien być zdefiniowany typ `TriggerConfig`
3. Możliwe rozwiązania:
   - Dodaj type assertion z walidacją:
     ```typescript
     const mappedRules = rules.map((rule) => ({
       id: rule.id,
       name: rule.name,
       enabled: rule.enabled,
       triggerConfig: rule.triggerConfig as TriggerConfig, // Jeśli typ jest poprawny
       actionConfig: rule.actionConfig as ActionConfig,
       createdAt: rule.createdAt,
       updatedAt: rule.updatedAt,
     }));
     ```
   - Albo zmień typ w `AutomationRulesManager` aby akceptował `Record<string, unknown>`
   - Albo dodaj funkcję transformującą `Record<string, unknown>` do `TriggerConfig`

**Weryfikacja:** Po naprawie TypeScript powinien zaakceptować typ.

---

### 4. `src/app/app/notifications/page.tsx` - Napraw typ `data`

**Błąd:** `Type 'JsonValue' is not assignable to type 'Record<string, unknown> | null'` (linia 31)

**Problem:** Typ `data` z Prisma (`JsonValue`) nie pasuje do typu oczekiwanego przez komponent `NotificationsList`.

**Naprawa:**
1. Sprawdź jak `NotificationsList` definiuje typ dla `data`
2. Dodaj transformację typu:
   ```typescript
   const notifications = rawNotifications.map((n) => ({
     ...n,
     data: (n.data && typeof n.data === "object" && !Array.isArray(n.data))
       ? (n.data as Record<string, unknown>)
       : null,
   }));
   ```
3. Albo zmień typ w `NotificationsList` aby akceptował `JsonValue`

**Weryfikacja:** Po naprawie TypeScript powinien zaakceptować typ.

---

### 5. `src/app/app/reports/page.tsx` - Napraw typ `KpiMetrics`

**Błąd:** `Type 'null' is not assignable to type 'undefined'` (linia 124)

**Problem:** Typ `KpiMetrics` używa `null`, ale komponent `ReportsClient` oczekuje `undefined`.

**Naprawa:**
1. Sprawdź linię 124 w pliku
2. Zmień `null` na `undefined`:
   ```typescript
   return <ReportsClient 
     initialAnalytics={analytics} 
     initialKpi={kpi ?? undefined} 
     initialDays={validDays} 
   />;
   ```
3. Albo zmień typ w `ReportsClient` aby akceptował `null`

**Weryfikacja:** Po naprawie TypeScript powinien zaakceptować typ.

---

### 6. `src/app/app/ticket-list.tsx` - Napraw typ Ticket dla `getSlaStatus`

**Błąd:** `Type 'Ticket' is missing properties: resolvedAt, closedAt, firstResponseAt, firstResponseDue, resolveDue` (linia 169)

**Problem:** Lokalny typ `Ticket` w `ticket-list.tsx` nie ma pól SLA wymaganych przez `getSlaStatus`.

**Naprawa:**
1. Sprawdź definicję typu `Ticket` w `ticket-list.tsx` (linie 10-20)
2. Dodaj brakujące pola SLA do typu:
   ```typescript
   type Ticket = {
     id: string;
     number: number;
     title: string;
     status: TicketStatus;
     priority: TicketPriority;
     requester?: { name: string } | null;
     assigneeUser?: { name: string } | null;
     assigneeTeam?: { name: string } | null;
     createdAt: Date;
     // Dodaj pola SLA:
     resolvedAt: Date | null;
     closedAt: Date | null;
     firstResponseAt: Date | null;
     firstResponseDue: Date | null;
     resolveDue: Date | null;
   };
   ```
3. Upewnij się, że `getTicketPage` w `src/lib/ticket-list.ts` zwraca te pola w `select` lub `include`

**Weryfikacja:** Po naprawie `getSlaStatus(ticket)` powinno działać bez błędów TypeScript.

---

### 7. `src/app/app/tickets/[id]/audit-timeline.tsx` - Napraw typ ReactNode

**Błąd:** `Type 'unknown' is not assignable to type 'ReactNode'` (linia 178)

**Problem:** `event.data.reopenReason` jest typu `unknown`, nie może być użyty jako ReactNode.

**Naprawa:**
1. Sprawdź linię 178-181 w pliku
2. Widzę, że już jest type assertion `String((event.data as { reopenReason: unknown }).reopenReason)`, ale TypeScript nadal narzeka
3. Popraw type guard:
   ```typescript
   {event.action === "TICKET_UPDATED" && 
    event.data && 
    typeof event.data === "object" && 
    "reopenReason" in event.data && 
    event.data.reopenReason && 
    typeof event.data.reopenReason === "string" && (
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold text-amber-800 mb-1">Powód ponownego otwarcia:</p>
        <p className="text-sm text-amber-900">{event.data.reopenReason}</p>
      </div>
    )}
   ```
4. Albo użyj bardziej precyzyjnego type assertion:
   ```typescript
   const reopenReason = (event.data as { reopenReason?: string })?.reopenReason;
   {reopenReason && (
     <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
       <p className="text-xs font-semibold text-amber-800 mb-1">Powód ponownego otwarcia:</p>
       <p className="text-sm text-amber-900">{reopenReason}</p>
     </div>
   )}
   ```

**Weryfikacja:** Po naprawie TypeScript powinien zaakceptować typ.

---

## ✅ WERYFIKACJA PO NAPRAWIE

Po naprawie wszystkich błędów uruchom:

```bash
# 1. Sprawdź lint
pnpm lint

# 2. Sprawdź TypeScript (tylko główny kod, pomiń testy jeśli potrzeba)
pnpm exec tsc --noEmit

# 3. Sprawdź build
pnpm build
```

**Wymagane wyniki:**
- ✅ `pnpm lint`: 0 błędów, 0 warnings
- ✅ `pnpm exec tsc --noEmit`: 0 błędów w głównym kodzie (błędy w testach są OK na tym etapie)
- ✅ `pnpm build`: sukces

---

## 📝 WZORCE DO NAŚLADOWANIA

### Type Assertion Pattern
```typescript
// Gdy jesteś pewien, że typ jest poprawny
const value = data as ExpectedType;

// Gdy potrzebujesz type guard
if (value && typeof value === "object" && "property" in value) {
  const typed = value as { property: string };
  // użyj typed.property
}
```

### Null/Undefined Handling
```typescript
// Zmień null na undefined
const value = data ?? undefined;

// Albo użyj type assertion
const value = (data as Type | undefined) ?? undefined;
```

### Prisma JsonValue Handling
```typescript
// Transformuj JsonValue do Record
const record = (data && typeof data === "object" && !Array.isArray(data))
  ? (data as Record<string, unknown>)
  : null;
```

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj plik przed edycją** - używaj `read_file`
2. **Zachowaj istniejące wzorce** - nie zmieniaj architektury
3. **Testuj zmiany** - uruchamiaj `pnpm exec tsc --noEmit` po każdej naprawie
4. **Nie dodawaj nowych funkcji** - tylko naprawiaj typy
5. **Używaj type guards** - zamiast `any`, używaj type guards i assertions

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj krótki raport:
- Lista naprawionych błędów (7)
- Potwierdzenie, że `pnpm lint` przechodzi
- Potwierdzenie, że `pnpm exec tsc --noEmit` przechodzi dla głównego kodu
- Potwierdzenie, że `pnpm build` się powodzi
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**


