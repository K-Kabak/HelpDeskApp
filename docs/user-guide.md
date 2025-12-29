# Przewodnik Użytkownika - SerwisDesk

Ten przewodnik zawiera instrukcje korzystania z systemu SerwisDesk dla wszystkich typów użytkowników.

## Spis treści

1. [Logowanie](#logowanie)
2. [Tworzenie zgłoszeń](#tworzenie-zgłoszeń)
3. [Przeglądanie i filtrowanie zgłoszeń](#przeglądanie-i-filtrowanie-zgłoszeń)
4. [Szczegóły zgłoszenia](#szczegóły-zgłoszenia)
5. [Komentarze](#komentarze)
6. [Zmiana statusu zgłoszeń](#zmiana-statusu-zgłoszeń)
7. [Akcje masowe](#akcje-masowe)
8. [Zapisane widoki](#zapisane-widoki)
9. [Centrum powiadomień](#centrum-powiadomień)
10. [Załączniki](#załączniki)
11. [Raporty i analityka](#raporty-i-analityka)
12. [Ankiety CSAT](#ankiety-csat)
13. [Najczęściej zadawane pytania (FAQ)](#najczęściej-zadawane-pytania-faq)

---

## Logowanie

### Jak się zalogować

1. Otwórz aplikację w przeglądarce
2. Na stronie logowania wprowadź:
   - **Email:** Twój adres email
   - **Hasło:** Twoje hasło
3. Kliknij przycisk "Zaloguj się"

### Konto demo

Po pierwszym uruchomieniu aplikacji dostępne są następujące konta demo:

- **Administrator:** `admin@serwisdesk.local` / `Admin123!`
- **Agent:** `agent@serwisdesk.local` / `Agent123!`
- **Użytkownik (Requester):** `requester@serwisdesk.local` / `Requester123!`

⚠️ **Uwaga:** Te konta są przeznaczone wyłącznie do testowania. W środowisku produkcyjnym zmień wszystkie hasła.

### Wylogowanie

Aby się wylogować, kliknij przycisk "Wyloguj" w prawym górnym rogu interfejsu.

---

## Tworzenie zgłoszeń

### Tworzenie nowego zgłoszenia

1. Na stronie głównej (`/app`) kliknij przycisk **"Nowe zgłoszenie"** lub przejdź do `/app/tickets/new`
2. Wypełnij formularz:
   - **Tytuł** (wymagane, min. 5 znaków, max. 120 znaków)
   - **Opis** (wymagane, min. 20 znaków, max. 5000 znaków) - obsługuje Markdown
   - **Priorytet** (wymagane): Niski, Średni, Wysoki, Krytyczny
   - **Kategoria** (opcjonalne): Wybierz z listy lub wprowadź własną
3. Możesz przełączyć się na **podgląd** (`Preview`) aby zobaczyć jak będzie wyglądał opis po formatowaniu Markdown
4. System automatycznie wyświetli przewidywane terminy SLA (jeśli są skonfigurowane)
5. Kliknij **"Utwórz zgłoszenie"**

### Walidacja formularza

- Tytuł musi mieć minimum 5 znaków i maksimum 120 znaków
- Opis musi mieć minimum 20 znaków i maksimum 5000 znaków
- Priorytet jest wymagany
- Błędy walidacji są wyświetlane pod odpowiednimi polami

### Formatowanie Markdown

W opisie zgłoszenia możesz używać Markdown:
- **Pogrubienie:** `**tekst**`
- *Kursywa:* `*tekst*`
- Listy numerowane i punktowane
- Linki: `[tekst](url)`
- Kod: `` `kod` ``

---

## Przeglądanie i filtrowanie zgłoszeń

### Lista zgłoszeń

Po zalogowaniu zobaczysz listę zgłoszeń na stronie głównej (`/app`):

- **Użytkownicy (Requester):** Widzą tylko swoje zgłoszenia
- **Agenci i Administratorzy:** Widzą wszystkie zgłoszenia w swojej organizacji

### Filtrowanie zgłoszeń

Możesz filtrować zgłoszenia używając następujących opcji:

1. **Status:** Wybierz status z listy rozwijanej (Nowe, W toku, Oczekuje na użytkownika, Wstrzymane, Rozwiązane, Zamknięte, Ponownie otwarte)
2. **Priorytet:** Wybierz priorytet (Niski, Średni, Wysoki, Krytyczny)
3. **Kategoria:** Wybierz kategorię z listy
4. **Tagi:** Wybierz jeden lub więcej tagów
5. **Wyszukiwanie tekstowe:** Wprowadź tekst do wyszukania w tytule i opisie zgłoszeń
6. **Status SLA:** Filtruj po statusie SLA (Naruszone, Zdrowe)

### Sortowanie

Zgłoszenia są domyślnie sortowane według daty utworzenia (najnowsze pierwsze). Możesz zmienić sortowanie używając parametrów URL lub zapisanych widoków.

### Paginacja

Lista zgłoszeń używa paginacji kursora. Użyj przycisków "Następna" i "Poprzednia" aby nawigować między stronami.

---

## Szczegóły zgłoszenia

### Otwieranie zgłoszenia

Kliknij na karcie zgłoszenia na liście, aby otworzyć jego szczegóły.

### Informacje wyświetlane

Na stronie szczegółów zgłoszenia zobaczysz:

- **Numer zgłoszenia** i tytuł
- **Status** (kolorowa etykieta)
- **Priorytet** (kolorowa etykieta)
- **Data utworzenia**
- **Zgłaszający** (requester)
- **Przypisany agent** (jeśli przypisany)
- **Przypisany zespół** (jeśli przypisany)
- **Kategoria**
- **Opis** (sformatowany Markdown)
- **Załączniki** (jeśli istnieją)
- **Komentarze** (chronologicznie)
- **Historia zmian** (audit timeline)
- **Terminy SLA** (jeśli skonfigurowane)

### Uprawnienia do przeglądania

- **Użytkownicy (Requester):** Mogą przeglądać tylko swoje zgłoszenia
- **Agenci i Administratorzy:** Mogą przeglądać wszystkie zgłoszenia w swojej organizacji
- Próba otwarcia zgłoszenia, do którego nie masz dostępu, spowoduje wyświetlenie błędu 404

---

## Komentarze

### Dodawanie komentarzy

1. Otwórz szczegóły zgłoszenia
2. Przewiń do sekcji komentarzy
3. Wprowadź tekst komentarza (obsługuje Markdown)
4. **Dla agentów i administratorów:** Możesz zaznaczyć opcję **"Wewnętrzny"** aby komentarz był widoczny tylko dla agentów i administratorów
5. Kliknij **"Dodaj komentarz"**

### Typy komentarzy

- **Publiczny:** Widoczny dla wszystkich, w tym dla zgłaszającego
- **Wewnętrzny:** Widoczny tylko dla agentów i administratorów (oznaczony żółtą ramką i etykietą "Wewnętrzny")

### Formatowanie komentarzy

Komentarze obsługują Markdown, tak samo jak opisy zgłoszeń.

### Wyświetlanie komentarzy

Komentarze są wyświetlane chronologicznie (najstarsze pierwsze) i zawierają:
- Awatar inicjałów autora
- Imię i nazwisko autora
- Etykietę roli (Requester, Agent, Admin)
- Datę i godzinę utworzenia
- Sformatowaną treść komentarza
- Oznaczenie "Wewnętrzny" dla komentarzy wewnętrznych

---

## Zmiana statusu zgłoszeń

### Dla użytkowników (Requester)

Użytkownicy mogą zmieniać status tylko swoich zgłoszeń i tylko w następujący sposób:

- **Zamknięcie:** Zmiana statusu na "Zamknięte" (tylko jeśli zgłoszenie jest w statusie "Rozwiązane")
- **Ponowne otwarcie:** Zmiana statusu z "Zamknięte" na "Ponownie otwarte"

### Dla agentów i administratorów

Agenci i administratorzy mogą zmieniać status na dowolny:

- **Nowe** - Nowo utworzone zgłoszenie
- **W toku** - Zgłoszenie jest w trakcie obsługi
- **Oczekuje na użytkownika** - Czekamy na odpowiedź od zgłaszającego
- **Wstrzymane** - Zgłoszenie zostało tymczasowo wstrzymane
- **Rozwiązane** - Problem został rozwiązany
- **Zamknięte** - Zgłoszenie zostało zamknięte
- **Ponownie otwarte** - Zgłoszenie zostało ponownie otwarte

### Zmiana priorytetu

Tylko agenci i administratorzy mogą zmieniać priorytet zgłoszenia:
- Niski
- Średni
- Wysoki
- Krytyczny

### Przypisywanie zgłoszeń

Agenci i administratorzy mogą przypisywać zgłoszenia:

1. **Przypisanie do agenta:** Wybierz agenta z listy rozwijanej
2. **Przypisanie do zespołu:** Wybierz zespół z listy rozwijanej
3. Możesz przypisać zarówno agenta jak i zespół jednocześnie
4. System może sugerować agenta na podstawie aktualnego obciążenia

### Zapis zmian

Po wprowadzeniu zmian kliknij **"Zapisz"**. System wyświetli powiadomienie o sukcesie lub błędzie.

---

## Akcje masowe

### Dostępność

Akcje masowe są dostępne tylko dla **agentów i administratorów**.

### Wybór zgłoszeń

1. Na liście zgłoszeń zaznacz checkboxy przy zgłoszeniach, które chcesz zmodyfikować
2. Możesz zaznaczyć wszystkie zgłoszenia na stronie używając checkboxa w nagłówku
3. Liczba zaznaczonych zgłoszeń jest wyświetlana w pasku narzędzi

### Dostępne akcje masowe

1. **Zmiana statusu:** Zmień status wielu zgłoszeń jednocześnie
2. **Przypisanie:** Przypisz wiele zgłoszeń do agenta lub zespołu

### Wykonanie akcji masowej

1. Zaznacz zgłoszenia
2. Wybierz akcję z paska narzędzi (status lub przypisanie)
3. Wybierz nowy status/przypisanie
4. Kliknij **"Zastosuj"**
5. Potwierdź akcję w oknie dialogowym
6. System wyświetli wyniki - sukcesy i błędy dla każdego zgłoszenia

### Obsługa błędów

Jeśli niektóre zgłoszenia nie mogą być zaktualizowane (np. z powodu uprawnień), system wyświetli szczegółowe komunikaty błędów dla każdego zgłoszenia.

---

## Zapisane widoki

### Co to są zapisane widoki?

Zapisane widoki pozwalają zapisać kombinację filtrów i szybko do nich wrócić.

### Tworzenie zapisanego widoku

1. Ustaw filtry na liście zgłoszeń (status, priorytet, wyszukiwanie, kategoria, tagi)
2. Kliknij przycisk **"Zapisz widok"** (lub podobny)
3. Wprowadź nazwę widoku
4. Opcjonalnie: Zaznacz **"Ustaw jako domyślny"** aby ten widok był automatycznie ładowany przy wejściu na stronę
5. Kliknij **"Zapisz"**

### Używanie zapisanych widoków

Zapisane widoki są wyświetlane jako zakładki nad listą zgłoszeń. Kliknij na zakładkę, aby zastosować zapisane filtry.

### Zarządzanie widokami

- **Edycja:** Kliknij prawym przyciskiem myszy na widok (lub użyj menu) aby edytować
- **Usuwanie:** Usuń widok, którego już nie potrzebujesz
- **Ustawienie domyślnego:** Możesz zmienić, który widok jest domyślny

### Widoki domyślne

Jeśli ustawisz widok jako domyślny, będzie on automatycznie ładowany przy wejściu na stronę główną (jeśli nie ma innych parametrów w URL).

---

## Centrum powiadomień

### Dostęp do powiadomień

Kliknij ikonę dzwonka w prawym górnym rogu interfejsu, aby otworzyć centrum powiadomień.

### Typy powiadomień

System wysyła powiadomienia dla następujących zdarzeń:

- **Aktualizacje zgłoszeń:** Zmiany statusu, priorytetu, przypisania
- **Komentarze:** Nowe komentarze w zgłoszeniach, które Cię dotyczą
- **Przypisania:** Zostałeś przypisany do zgłoszenia
- **Naruszenia SLA:** Zgłoszenie przekroczyło termin SLA

### Filtrowanie powiadomień

W centrum powiadomień możesz filtrować powiadomienia według typu:
- Wszystkie
- Aktualizacje zgłoszeń
- Komentarze
- Przypisania
- Naruszenia SLA

### Status powiadomień

- **Nieprzeczytane:** Nowe powiadomienia (zaznaczone)
- **Przeczytane:** Powiadomienia, które zostały otwarte

### Oznaczanie jako przeczytane

- Kliknij na powiadomienie, aby je otworzyć i oznaczyć jako przeczytane
- Możesz oznaczyć wszystkie powiadomienia jako przeczytane używając odpowiedniego przycisku

### Powiadomienia email

Jeśli administrator włączył powiadomienia email, będziesz otrzymywać powiadomienia również na adres email. Możesz skonfigurować preferencje powiadomień w ustawieniach (jeśli dostępne).

---

## Załączniki

### Dodawanie załączników

1. Otwórz szczegóły zgłoszenia
2. W sekcji załączników kliknij przycisk **"Dodaj załącznik"** (jeśli dostępne)
3. Wybierz plik z dysku
4. System automatycznie sprawdzi:
   - Typ pliku (dozwolone typy: obrazy PNG/JPEG, dokumenty PDF, pliki tekstowe)
   - Rozmiar pliku (maksymalnie 25 MB)
5. Po pomyślnym przesłaniu załącznik zostanie wyświetlony na liście

### Typy dozwolonych plików

System akceptuje następujące typy plików:
- **Obrazy:** PNG, JPEG
- **Dokumenty:** PDF
- **Pliki tekstowe:** TXT

### Ograniczenia

- Maksymalny rozmiar pliku: 25 MB
- Niektóre typy plików mogą być zablokowane ze względów bezpieczeństwa
- Załączniki są skanowane pod kątem bezpieczeństwa przed udostępnieniem

### Pobieranie załączników

1. Kliknij na nazwę załącznika na liście
2. System wygeneruje bezpieczny link do pobrania
3. Link jest ważny przez ograniczony czas

### Uprawnienia

- **Użytkownicy (Requester):** Mogą dodawać załączniki tylko do swoich zgłoszeń
- **Agenci i Administratorzy:** Mogą dodawać załączniki do wszystkich zgłoszeń w organizacji
- Wszyscy użytkownicy mogą przeglądać i pobierać załączniki zgodnie z uprawnieniami do zgłoszenia

---

## Raporty i analityka

### Dostęp do raportów

Raporty i analityka są dostępne tylko dla **administratorów**.

### Strona raportów

Aby otworzyć stronę raportów:
1. Zaloguj się jako administrator
2. Przejdź do `/app/reports` lub użyj linku w menu nawigacyjnym (jeśli dostępny)

### Dostępne metryki

Na stronie raportów zobaczysz:

#### KPI (Key Performance Indicators)
- **MTTR (Mean Time to Resolve):** Średni czas rozwiązania zgłoszeń
- **MTTA (Mean Time to Acknowledge):** Średni czas pierwszej odpowiedzi
- **Wskaźnik ponownych otwarć:** Procent zgłoszeń, które zostały ponownie otwarte
- **Zgodność SLA:** Procent zgłoszeń rozwiązanych w terminie

#### Analityka zgłoszeń
- **Trendy tworzenia:** Liczba zgłoszeń utworzonych w czasie
- **Trendy rozwiązań:** Liczba zgłoszeń rozwiązanych w czasie
- **Rozkład priorytetów:** Rozkład zgłoszeń według priorytetów
- **Statystyki dzienne:** Szczegółowe statystyki dla każdego dnia

#### Analityka CSAT
- **Średnia ocena:** Średnia ocena satysfakcji klientów
- **Wskaźnik odpowiedzi:** Procent wypełnionych ankiet
- **Rozkład ocen:** Rozkład ocen od 1 do 5

### Filtrowanie danych

Możesz filtrować dane według:
- **Zakres dat:** Wybierz okres (domyślnie ostatnie 30 dni)
- **Zakres:** Od 7 do 365 dni

### Eksport danych

Możesz eksportować dane do plików CSV:
1. **Eksport zgłoszeń:** Kliknij przycisk "Eksportuj zgłoszenia"
2. **Eksport komentarzy:** Kliknij przycisk "Eksportuj komentarze"

Eksportowane pliki zawierają wszystkie dane zgodnie z aktualnymi filtrami.

### Odświeżanie danych

Kliknij przycisk **"Odśwież"** aby zaktualizować wszystkie metryki i wykresy.

---

## Ankiety CSAT

### Co to jest CSAT?

CSAT (Customer Satisfaction) to ankieta satysfakcji klienta wysyłana po rozwiązaniu zgłoszenia.

### Otrzymywanie ankiety

Po rozwiązaniu i zamknięciu zgłoszenia, jako zgłaszający otrzymasz prośbę o wypełnienie ankiety satysfakcji.

### Wypełnianie ankiety

1. Otwórz link do ankiety (w emailu lub w aplikacji)
2. Ocenij satysfakcję używając skali (np. 1-5 gwiazdek lub podobnej)
3. Opcjonalnie: Dodaj komentarz z dodatkowymi uwagami
4. Kliknij **"Wyślij"**

### Dostęp do ankiety

Ankietę możesz wypełnić:
- Przez link w emailu (jeśli powiadomienia email są włączone)
- Przez stronę szczegółów zgłoszenia (jeśli zgłoszenie zostało rozwiązane)

### Anonimowość

Twoje odpowiedzi są powiązane ze zgłoszeniem, ale mogą być agregowane anonimowo w raportach.

---

## Najczęściej zadawane pytania (FAQ)

### Logowanie i dostęp

**P: Zapomniałem hasła. Jak je zresetować?**  
A: Skontaktuj się z administratorem systemu, który może zresetować Twoje hasło.

**P: Nie mogę się zalogować. Co robić?**  
A: Sprawdź, czy używasz poprawnego adresu email i hasła. Jeśli problem nadal występuje, skontaktuj się z administratorem.

**P: Widzę mniej zgłoszeń niż oczekuję. Dlaczego?**  
A: Jako użytkownik (Requester) widzisz tylko swoje zgłoszenia. Agenci i administratorzy widzą wszystkie zgłoszenia w swojej organizacji.

### Tworzenie zgłoszeń

**P: Jak długi może być opis zgłoszenia?**  
A: Opis może mieć od 20 do 5000 znaków.

**P: Czy mogę edytować zgłoszenie po utworzeniu?**  
A: Obecnie nie ma możliwości edycji tytułu i opisu po utworzeniu. Możesz dodać komentarz z dodatkowymi informacjami.

**P: Co oznaczają różne priorytety?**  
A: Priorytety określają ważność zgłoszenia i wpływają na terminy SLA:
- **Niski:** Problemy o niskiej ważności
- **Średni:** Standardowe problemy
- **Wysoki:** Ważne problemy wymagające szybkiej reakcji
- **Krytyczny:** Krytyczne problemy wymagające natychmiastowej reakcji

### Komentarze

**P: Jaka jest różnica między komentarzem publicznym a wewnętrznym?**  
A: Komentarze publiczne są widoczne dla wszystkich, w tym dla zgłaszającego. Komentarze wewnętrzne są widoczne tylko dla agentów i administratorów.

**P: Czy mogę edytować lub usunąć komentarz?**  
A: Obecnie nie ma możliwości edycji lub usuwania komentarzy po ich dodaniu.

### Statusy zgłoszeń

**P: Co oznacza status "Oczekuje na użytkownika"?**  
A: Ten status oznacza, że agent potrzebuje dodatkowych informacji od Ciebie lub czeka na Twoją odpowiedź.

**P: Kiedy mogę zamknąć zgłoszenie?**  
A: Jako użytkownik możesz zamknąć zgłoszenie tylko jeśli jest w statusie "Rozwiązane".

**P: Co się dzieje, gdy ponownie otwieram zgłoszenie?**  
A: Zgłoszenie wraca do statusu "Ponownie otwarte" i jest ponownie przypisane do agenta lub zespołu.

### SLA

**P: Co to jest SLA?**  
A: SLA (Service Level Agreement) to umowa dotycząca poziomu usługi, która określa terminy odpowiedzi i rozwiązania zgłoszeń w zależności od priorytetu.

**P: Jak sprawdzić terminy SLA dla mojego zgłoszenia?**  
A: Terminy SLA są wyświetlane na stronie szczegółów zgłoszenia. Czerwone oznaczenia oznaczają naruszenie terminu, zielone - zbliżający się termin.

### Powiadomienia

**P: Dlaczego nie otrzymuję powiadomień email?**  
A: Powiadomienia email muszą być włączone przez administratora. Skontaktuj się z administratorem, aby sprawdzić konfigurację.

**P: Jak zmienić preferencje powiadomień?**  
A: Obecnie preferencje powiadomień są zarządzane przez administratora. Skontaktuj się z administratorem, aby zmienić ustawienia.

### Akcje masowe

**P: Kto może używać akcji masowych?**  
A: Tylko agenci i administratorzy mogą używać akcji masowych.

**P: Czy mogę cofnąć akcję masową?**  
A: Nie ma automatycznego cofania. Musisz ręcznie zmienić status lub przypisanie dla każdego zgłoszenia.

### Zapisane widoki

**P: Ile widoków mogę zapisać?**  
A: Obecnie nie ma limitu liczby zapisanych widoków.

**P: Czy mogę udostępnić widok innym użytkownikom?**  
A: Obecnie widoki są osobiste dla każdego użytkownika.

### Ankiety CSAT

**P: Czy muszę wypełnić ankietę CSAT?**  
A: Ankieta jest opcjonalna, ale Twoja opinia pomaga poprawić jakość usług.

**P: Jak długo mam czas na wypełnienie ankiety?**  
A: Obecnie nie ma limitu czasu, ale zalecamy wypełnienie ankiety wkrótce po zamknięciu zgłoszenia.

### Problemy techniczne

**P: Strona się nie ładuje. Co robić?**  
A: Spróbuj odświeżyć stronę (F5). Jeśli problem nadal występuje, skontaktuj się z administratorem.

**P: Nie mogę dodać komentarza. Co robić?**  
A: Sprawdź, czy komentarz ma minimum 1 znak. Jeśli problem nadal występuje, skontaktuj się z administratorem.

**P: Załączniki nie działają. Co robić?**  
A: Sprawdź, czy plik ma dozwolony typ (PNG, JPEG, PDF, TXT) i czy nie przekracza 25 MB. Jeśli problem nadal występuje, skontaktuj się z administratorem.

**P: Jakie typy plików mogę załączyć?**  
A: Możesz załączać obrazy (PNG, JPEG), dokumenty PDF i pliki tekstowe (TXT). Maksymalny rozmiar to 25 MB.

**P: Czy mogę usunąć załącznik po dodaniu?**  
A: Obecnie nie ma możliwości usuwania załączników po dodaniu. Skontaktuj się z administratorem, jeśli potrzebujesz usunąć załącznik.

**P: Kto może zobaczyć moje załączniki?**  
A: Załączniki są widoczne dla wszystkich użytkowników, którzy mają dostęp do zgłoszenia (zgodnie z uprawnieniami roli).

### Raporty

**P: Dlaczego nie widzę strony raportów?**  
A: Raporty są dostępne tylko dla administratorów. Jeśli jesteś administratorem i nadal nie widzisz strony, skontaktuj się z administratorem systemu.

**P: Jak często aktualizują się dane w raportach?**  
A: Dane są pobierane na żądanie. Użyj przycisku "Odśwież", aby zaktualizować wszystkie metryki.

**P: Czy mogę eksportować raporty?**  
A: Tak, możesz eksportować zgłoszenia i komentarze do plików CSV. Eksportowane dane są zgodne z aktualnymi filtrami.

---

## Wsparcie

Jeśli potrzebujesz dodatkowej pomocy:

1. Skontaktuj się z administratorem systemu
2. Sprawdź dokumentację techniczną dla administratorów
3. Zgłoś problem przez system zgłoszeń (jeśli masz dostęp)

---

*Ostatnia aktualizacja: 2025*



