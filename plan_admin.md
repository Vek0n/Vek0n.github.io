# Plan Wdrożenia Panelu Administratora (CMS przez GitHub API)

Rozbudowujemy naszą aplikację o pełnoprawny Panel Admina, który działa w samej przeglądarce i wykorzystuje GitHub API do zapisywania nowych testów bezpośrednio na serwer.

## 1. Jak to technicznie zadziała?
1. Użytkownik wejdzie na stronę ze specjalnym dopiskiem, np. `Vek0n.github.io/?admin=true`.
2. Zobaczy panel z miejscem na podanie **GitHub Personal Access Token (PAT)**. Token ten zastępuje hasło. Zostanie zapisany w pamięci przeglądarki (`localStorage`), więc podasz go tylko raz na swoim urządzeniu.
3. Po autoryzacji, panel pobierze aktualną listę folderów (Przedmiotów). Będziesz mógł wybrać istniejący przedmiot lub stworzyć nowy (wpisując po prostu jego nazwę).
4. Wkleisz kod JSON wygenerowany przez NotebookLM do dużego pola tekstowego i podasz nazwę testu.
5. Po kliknięciu "Wyślij", JavaScript zakoduje Twój tekst w formacie Base64 i wyśle żądanie `PUT` bezpośrednio do API GitHuba autoryzując się Twoim Tokenem.
6. GitHub odbierze to, sam stworzy nową wersję repozytorium (commit) i w kilka sekund zbuduje nową stronę.

## 2. Instrukcja krok po kroku: Jak zdobyć Token (Klucz) GitHuba
Aby to zadziałało, musisz wygenerować bezpieczny klucz. Kod zrób to raz:

1. Zaloguj się na swoje konto na stronie GitHub.com.
2. Kliknij w swoje zdjęcie profilowe w prawym górnym rogu i wybierz **Settings** (Ustawienia).
3. Zjedź na sam dół w lewym menu i kliknij **Developer settings**.
4. W lewym menu wybierz **Personal access tokens**, a następnie **Tokens (classic)**.
5. Kliknij przycisk **Generate new token** (i wybierz "Generate new token (classic)").
6. Wypełnij formularz:
   - **Note**: Nazwij to np. "Quiz Admin Panel".
   - **Expiration**: Wybierz "No expiration" (żeby klucz nie wygasł) lub 90 dni (bezpieczniej, będziesz musiał odnowić).
   - **Select scopes**: Zaznacz **`repo`** (to daje pełny dostęp do Twoich prywatnych i publicznych repozytoriów – dzięki temu skrypt będzie mógł wrzucać tam pliki).
7. Zjedź na dół i kliknij zielony przycisk **Generate token**.
8. **BARDZO WAŻNE**: Skopiuj wygenerowany ciąg znaków (np. `ghp_xxxxxxxxx`). To jest Twój Token. Pokaże się tylko raz! Jeśli go zgubisz, będziesz musiał wygenerować nowy.

## 3. Planowane Zmiany w Kodzie

### W pliku `index.html`:
- Nie dodajemy nic skomplikowanego. Reszta renderowania zostanie wygenerowana z JS. Będziemy nasłuchiwać, czy w pasku adresu jest `?admin=true`.

### W pliku `style.css`:
- Dodanie ładnych styli dla formularza Panelu Admina:
  - Inputy do wpisywania hasła/tokenu.
  - Duże, przyjazne pole `textarea` do wklejania kodu JSON.
  - Dropdown (`select`) do wyboru istniejącego przedmiotu.

### W pliku `app.js`:
- Złapanie parametru URL `?admin=true` w funkcji `init()`. Jeśli jest obecny – ukrywamy listę testów i pokazujemy `renderAdminPanel()`.
- **`renderAdminPanel()`**: 
  - Jeśli nie ma tokenu w `localStorage`, poprosi o jego wpisanie.
  - Jeśli token jest, wyświetli formularz dodawania testu (Wybór przedmiotu/Nowy przedmiot, Nazwa testu, Treść JSON).
- **`uploadToGitHub()`**: 
  - Walidacja wpisanego JSONa (żeby upewnić się, że to co wkleiłeś z NotebookLM nie ma brakujących nawiasów).
  - Kodowanie zawartości do Base64 (`btoa(unescape(encodeURIComponent(jsonString)))` by poradziło sobie z polskimi znakami).
  - Wykonanie zapytania `fetch` z metodą `PUT` pod adres API z nagłówkiem `Authorization: Bearer <TWÓJ_TOKEN>`.
  - Obsługa sukcesu i przeładowanie strony.

## 4. Dodatkowe zabezpieczenie
Przed wrzuceniem pliku zrobimy tzw. walidację lokalną. Zanim przeglądarka wyśle dane, spróbuje przetworzyć je przez `JSON.parse()`. Jeśli NotebookLM pomyli się o jeden przecinek, panel Cię ostrzeże, chroniąc przed wrzuceniem na stronę niedziałającego pliku!
