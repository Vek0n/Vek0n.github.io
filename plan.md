# Plan Aplikacji: Quiz / Platforma Edukacyjna z Psychologii

## 1. Założenia i Architektura
- **Technologie**: Vanilla HTML5, CSS3, Vanilla JavaScript (ES6+). Zero backendu, frameworków czy skomplikowanego bundlowania.
- **Hosting**: GitHub Pages (serwowanie wyłącznie plików statycznych).
- **Architektura SPA (Single Page Application)**: Cała aplikacja będzie operować na jednym pliku `index.html`. Treść strony (ekran wyboru, ekran testu) będzie dynamicznie podmieniana za pomocą JavaScriptu. Dzięki temu aplikacja będzie bardzo szybka, przejścia między ekranami będą płynne i da to wrażenie nowoczesnej "appki", a nie zwykłej strony internetowej.

## 2. Struktura Danych i Ładowanie (Zarządzanie bez backendu)
Ponieważ na GitHub Pages nie mamy backendu, a JS w przeglądarce nie potrafi sam z siebie "czytać" zawartości folderów, wykorzystamy darmowe **API GitHuba** (bez konieczności logowania), aby dynamicznie odczytywać strukturę katalogu `/data`. 

Dzięki temu **nie musisz** aktualizować żadnych list ani indeksów. Wrzucasz po prostu plik JSON do folderu w repozytorium, a strona automatycznie go wykryje i wyświetli!

### Proponowana struktura folderów w repozytorium:
```text
/
├── index.html        (Główny i jedyny plik HTML)
├── style.css         (Stylowanie UI/UX)
├── app.js            (Logika działania aplikacji)
└── /data             (Tutaj wrzucasz swoje JSONy)
    ├── /Psychologia_poznawcza
    │   ├── kolokwium1.json
    │   └── procesy_pamieci.json
    └── /Diagnoza_psychologiczna
        └── test_z_inteligencji.json
```
*Nazwy folderów (z podłogami zamiast spacji) staną się nazwami **Przedmiotów**, a pliki JSON wewnątrz będą zestawami testowymi.*

## 3. Struktura plików JSON (Dla NotebookLM)
Pliki JSON muszą mieć bardzo prostą i zrozumiałą formę. Skopiujesz ten format jako prompt (instrukcję) dla NotebookLM, aby tak samo generował Ci zestawy na podstawie Twoich notatek.

**Przykład (`procesy_pamieci.json`):**
```json
{
  "title": "Procesy Pamięci - Test 1",
  "difficulty": "Średni",
  "questions": [
    {
      "id": 1,
      "type": "single-choice",
      "question": "Kto jest twórcą krzywej zapominania?",
      "options": [
        "Sigmund Freud",
        "Hermann Ebbinghaus",
        "B.F. Skinner",
        "Jean Piaget"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Ebbinghaus badał pamięć na sobie, ucząc się bezsensownych sylab, co doprowadziło go do sformułowania krzywej zapominania."
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Pamięć robocza (operacyjna) ma nieograniczoną pojemność.",
      "options": [
        "Prawda",
        "Fałsz"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Fałsz. Zgodnie z koncepcją Millera, pojemność pamięci krótkotrwałej/roboczej to magiczne 7 ± 2 elementy."
    }
  ]
}
```

## 4. Przepływ Użytkownika (User Flow)
1. **Ekran Główny (Home)**
   - Minimalistyczny nagłówek "Platforma Edukacyjna - Psychologia".
   - Pobranie i wyświetlenie ładnych kafli (kart) z nazwami przedmiotów (odczytanych z nazw folderów w `/data`).
2. **Ekran Przedmiotu**
   - Po kliknięciu w przedmiot, wyświetla się lista dostępnych testów z tego przedmiotu.
   - Karty zawierają tytuł testu i poziom trudności (dane pobierane na żywo z plików JSON).
3. **Ekran Testu (Główne okno nauki)**
   - Pasek postępu na górze ekranu (np. "Pytanie 2/15").
   - Karta z treścią jednego pytania.
   - Poniżej ułożone kafelki z odpowiedziami do wyboru.
   - Po kliknięciu w odpowiedź:
     - Kafelek zmienia kolor (zielony dla poprawnej, czerwony dla błędnej).
     - (Opcjonalnie) wyświetla się dymek/tekst "Wyjaśnienie" (`explanation`), co jest genialne do nauki.
     - Pojawia się duży przycisk "Następne pytanie".
   - **Nawigacja pytań (Skakanie)**: Na dole ekranu będzie pasek (grid) z małymi kwadracikami oznaczającymi numery pytań (np. 1-15). Klikając w numerek zmieniasz pytanie. Kwadraciki będą na bieżąco zmieniać kolory w zależności od tego, czy już na to pytanie odpowiedziałeś i czy było dobrze/źle.
4. **Ekran Podsumowania**
   - Po przejściu przez cały test pojawia się wynik (np. 80%) i przyciski: "Powtórz test" lub "Wróć do menu głównego".

## 5. Wygląd i Design (UI/UX)
Zaprojektujemy to w nowoczesnym, ale sprzyjającym skupieniu stylu. 
- **Paleta barw**: Tryb ciemny (Dark Mode), z głębokimi odcieniami granatu (`#0F172A`), szarości oraz akcentami "neonowego" fioletu/niebieskiego (`#6366F1`), aby nawiązać do psychologii/neuronauki. Ciemny motyw nie męczy oczu przy długiej nauce.
- **Glassmorphism**: Kontenery na pytania będą delikatnie półprzezroczyste (efekt oszronionego szkła z delikatnym rozmyciem tła).
- **Animacje**: Delikatne i płynne pojawianie się (fade-in) nowych pytań i widoków. Płynne podświetlanie poprawnych odpowiedzi. Zero "skakania" elementów na stronie.
- **Responsywność**: Idealny układ na telefon (aby uczyć się w pociągu) oraz na laptop.

## 6. Kolejne kroki (Roadmapa Implementacji)
1. Utworzenie podstawowych plików: `index.html`, `style.css`, `app.js`.
2. Stworzenie kilku przykładowych katalogów i JSON-ów (dla testów i weryfikacji).
3. Implementacja logiki pobierania danych (JavaScript + GitHub API) i stworzenie "routera", który zmienia ekrany.
4. Budowa silnika rozwiązującego testy (obsługa pytań, odpowiedzi, skakania, wyniku).
5. Oskryptowanie i ostylowanie UI (dodanie animacji CSS, kolorów, dopracowanie UX).
