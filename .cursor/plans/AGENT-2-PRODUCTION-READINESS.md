# Prompt dla Agenta 2 (Frontend) - Gotowość do Produkcji

## 🎯 CEL GŁÓWNY

Przygotuj frontend aplikacji do wdrożenia produkcyjnego: final code review, UI/UX polish, error handling, loading states, accessibility verification.

---

## 📋 ZADANIA DO WYKONANIA

### 1. FINAL CODE REVIEW - FRONTEND

#### 1.1. Przegląd UI Components
**Pliki do sprawdzenia:**
- `src/app/app/**/*.tsx` - wszystkie strony i komponenty UI
- `src/components/**/*.tsx` - shared components

**Sprawdź:**
- ✅ Wszystkie komponenty mają odpowiednie error states
- ✅ Wszystkie komponenty mają loading states
- ✅ Wszystkie komponenty są accessible (ARIA labels, keyboard navigation)
- ✅ Wszystkie formularze mają walidację po stronie klienta
- ✅ Wszystkie komponenty obsługują edge cases (empty states, errors)
- ✅ Wszystkie komponenty są responsive (mobile-friendly)
- ✅ Wszystkie komponenty nie mają console.log w produkcji

**Napraw:**
- Jeśli znajdziesz brakujące error/loading states - dodaj
- Jeśli znajdziesz problemy z accessibility - napraw
- Jeśli znajdziesz console.log - usuń lub zamień na proper logging
- Jeśli znajdziesz problemy z responsywnością - napraw

#### 1.2. Przegląd User Experience
**Zadanie:**
- Przejrzyj wszystkie główne flow użytkownika:
  - Login → Dashboard
  - Tworzenie zgłoszenia
  - Przeglądanie zgłoszeń
  - Szczegóły zgłoszenia
  - Komentarze
  - Bulk actions
  - Saved views
  - Admin panel

**Sprawdź:**
- ✅ Wszystkie flow są intuicyjne
- ✅ Wszystkie akcje mają feedback (toast, loading indicator)
- ✅ Wszystkie błędy są wyświetlane w sposób zrozumiały dla użytkownika
- ✅ Wszystkie formularze mają clear validation messages
- ✅ Navigation jest logiczna i spójna

**Napraw:**
- Jeśli znajdziesz problemy UX - napraw
- Jeśli znajdziesz brakujący feedback - dodaj
- Jeśli znajdziesz niejasne komunikaty błędów - popraw

#### 1.3. Przegląd Performance
**Zadanie:**
- Sprawdź czy nie ma niepotrzebnych re-renderów
- Sprawdź czy nie ma niepotrzebnych API calls
- Sprawdź czy komponenty używają memoization gdzie potrzeba

**Sprawdź:**
- ✅ Komponenty używają `useMemo` i `useCallback` gdzie potrzeba
- ✅ Nie ma niepotrzebnych re-fetchów danych
- ✅ Obrazy i assets są zoptymalizowane
- ✅ Lazy loading jest używany gdzie możliwe

**Napraw:**
- Jeśli znajdziesz problemy z performance - napraw
- Jeśli znajdziesz niepotrzebne re-rendery - zoptymalizuj

---

### 2. ERROR HANDLING & USER FEEDBACK

#### 2.1. Global Error Handling
**Zadanie:**
- Sprawdź czy istnieje global error boundary
- Jeśli nie, rozważ dodanie (opcjonalne, nie krytyczne)

#### 2.2. API Error Handling
**Zadanie:**
- Sprawdź czy wszystkie API calls mają error handling
- Sprawdź czy wszystkie błędy są wyświetlane użytkownikowi w sposób zrozumiały

**Sprawdź:**
- ✅ Wszystkie `fetch` calls mają `.catch()` lub `try/catch`
- ✅ Wszystkie błędy są wyświetlane przez toast lub error message
- ✅ Błędy są user-friendly (nie pokazują stack traces)

**Napraw:**
- Jeśli znajdziesz brakujące error handling - dodaj
- Jeśli znajdziesz niejasne komunikaty błędów - popraw

#### 2.3. Form Validation
**Zadanie:**
- Sprawdź czy wszystkie formularze mają walidację
- Sprawdź czy wszystkie formularze pokazują validation errors

**Sprawdź:**
- ✅ Wszystkie formularze mają client-side validation
- ✅ Wszystkie formularze pokazują validation errors
- ✅ Wszystkie formularze mają disabled states podczas submit

**Napraw:**
- Jeśli znajdziesz brakującą walidację - dodaj
- Jeśli znajdziesz problemy z wyświetlaniem błędów - napraw

---

### 3. ACCESSIBILITY VERIFICATION

#### 3.1. ARIA Labels
**Zadanie:**
- Sprawdź czy wszystkie interaktywne elementy mają ARIA labels
- Sprawdź czy wszystkie formularze mają proper labels

**Sprawdź:**
- ✅ Wszystkie buttons mają `aria-label` lub tekst
- ✅ Wszystkie inputs mają `aria-label` lub `htmlFor` labels
- ✅ Wszystkie navigation elements mają proper ARIA
- ✅ Wszystkie error messages mają `aria-live` regions

**Napraw:**
- Jeśli znajdziesz brakujące ARIA labels - dodaj
- Jeśli znajdziesz niepoprawne ARIA - napraw

#### 3.2. Keyboard Navigation
**Zadanie:**
- Sprawdź czy wszystkie interaktywne elementy są dostępne z klawiatury
- Sprawdź czy focus management jest poprawny

**Sprawdź:**
- ✅ Wszystkie buttons są focusable
- ✅ Wszystkie links są focusable
- ✅ Focus order jest logiczny
- ✅ Focus nie jest tracony podczas dynamic updates

**Napraw:**
- Jeśli znajdziesz problemy z keyboard navigation - napraw
- Jeśli znajdziesz problemy z focus management - napraw

#### 3.3. Screen Reader Support
**Zadanie:**
- Sprawdź czy aplikacja jest użyteczna z screen readerem
- Sprawdź czy wszystkie dynamic updates są ogłaszane

**Sprawdź:**
- ✅ Wszystkie ważne zmiany są ogłaszane przez `aria-live`
- ✅ Wszystkie status messages są dostępne dla screen readera
- ✅ Wszystkie ikony mają text alternatives

**Napraw:**
- Jeśli znajdziesz problemy - napraw

---

### 4. MOBILE RESPONSIVENESS

#### 4.1. Responsive Design Verification
**Zadanie:**
- Sprawdź czy wszystkie strony są responsive
- Sprawdź czy wszystkie komponenty działają na mobile

**Sprawdź:**
- ✅ Wszystkie strony są użyteczne na mobile (< 768px)
- ✅ Wszystkie formularze są użyteczne na mobile
- ✅ Wszystkie tabele/listy są scrollable na mobile
- ✅ Navigation działa na mobile

**Napraw:**
- Jeśli znajdziesz problemy z mobile - napraw

---

### 5. UI/UX POLISH

#### 5.1. Loading States
**Zadanie:**
- Sprawdź czy wszystkie async operations mają loading indicators
- Sprawdź czy loading states są spójne w całej aplikacji

**Sprawdź:**
- ✅ Wszystkie API calls pokazują loading state
- ✅ Wszystkie formularze pokazują loading podczas submit
- ✅ Wszystkie listy pokazują skeleton loaders podczas fetch

**Napraw:**
- Jeśli znajdziesz brakujące loading states - dodaj
- Jeśli znajdziesz niespójne loading states - ustandaryzuj

#### 5.2. Empty States
**Zadanie:**
- Sprawdź czy wszystkie puste listy mają empty states
- Sprawdź czy empty states są pomocne dla użytkownika

**Sprawdź:**
- ✅ Lista zgłoszeń ma empty state z CTA
- ✅ Lista powiadomień ma empty state
- ✅ Wszystkie puste listy mają helpful messages

**Napraw:**
- Jeśli znajdziesz brakujące empty states - dodaj

#### 5.3. Success/Error Messages
**Zadanie:**
- Sprawdź czy wszystkie akcje pokazują success/error feedback
- Sprawdź czy komunikaty są spójne i zrozumiałe

**Sprawdź:**
- ✅ Wszystkie create/update/delete operacje pokazują toast
- ✅ Wszystkie komunikaty są w języku polskim (lub zgodne z aplikacją)
- ✅ Wszystkie komunikaty są zrozumiałe dla użytkownika

**Napraw:**
- Jeśli znajdziesz brakujące feedback - dodaj
- Jeśli znajdziesz niejasne komunikaty - popraw

---

### 6. CODE QUALITY

#### 6.1. Remove Debug Code
**Zadanie:**
- Sprawdź czy nie ma `console.log`, `console.debug`, `console.error` w produkcji
- Sprawdź czy nie ma commented-out code
- Sprawdź czy nie ma TODO comments bez kontekstu

**Napraw:**
- Usuń wszystkie `console.log` (lub zamień na proper logging)
- Usuń commented-out code
- Rozwiąż lub udokumentuj TODO comments

#### 6.2. Component Organization
**Zadanie:**
- Sprawdź czy komponenty są dobrze zorganizowane
- Sprawdź czy nie ma duplikacji kodu

**Napraw:**
- Jeśli znajdziesz duplikację - wyekstraktuj do shared components
- Jeśli znajdziesz źle zorganizowane komponenty - zreorganizuj

---

## ✅ DEFINICJA GOTOWOŚCI

Frontend jest gotowy do produkcji gdy:

1. ✅ Wszystkie komponenty przeszły code review
2. ✅ Wszystkie komponenty mają error/loading states
3. ✅ Wszystkie komponenty są accessible
4. ✅ Wszystkie komponenty są responsive
5. ✅ Wszystkie formularze mają walidację
6. ✅ Wszystkie błędy są user-friendly
7. ✅ Debug code został usunięty

---

## 📝 WZORCE DO NAŚLADOWANIA

### Error Handling Pattern
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error ?? 'Wystąpił błąd');
    }
    return res.json();
  },
  onSuccess: () => {
    toast.success('Operacja zakończona sukcesem');
  },
  onError: (error: Error) => {
    toast.error(error.message ?? 'Wystąpił błąd');
  },
});
```

### Loading State Pattern
```typescript
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
  </div>
) : (
  <Content />
)}
```

---

## 🚀 JAK ZACZĄĆ

1. **Przeczytaj master-agent-prompt.md** - zrozum kontekst projektu
2. **Przejrzyj główne komponenty** - zacznij od najważniejszych (dashboard, ticket detail)
3. **Sprawdź error handling** - upewnij się że wszystkie błędy są obsługiwane
4. **Sprawdź accessibility** - użyj narzędzi do testowania (opcjonalnie)
5. **Sprawdź mobile** - przetestuj na różnych rozdzielczościach
6. **Usuń debug code** - wyczyść kod przed produkcją

---

## ⚠️ WAŻNE ZASADY

1. **Zawsze czytaj pliki przed edycją** - używaj `read_file`
2. **Zachowaj istniejące wzorce** - nie zmieniaj architektury
3. **Testuj zmiany** - uruchamiaj `pnpm lint && pnpm exec tsc --noEmit`
4. **Używaj istniejących komponentów** - nie duplikuj kodu
5. **Współpracuj z Agentem 1** - upewnij się że API errors są obsługiwane

---

## 📊 RAPORT KOŃCOWY

Po zakończeniu przygotuj raport:
- Lista przeglądniętych komponentów
- Lista znalezionych i naprawionych problemów
- Lista ulepszeń UX
- Status: GOTOWE / WYMAGA DALSZEJ PRACY

---

**Powodzenia! 🎯**







