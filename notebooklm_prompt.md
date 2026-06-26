# Instrukcja dla NotebookLM (Prompt)

Skopiuj poniższy tekst i wklej go do NotebookLM za każdym razem, gdy chcesz wygenerować nowy test ze swoich notatek.

---

**PROMPT DO SKOPIOWANIA:**

Jesteś ekspertem i asystentem akademickim. Przeanalizuj moje notatki i wygeneruj na ich podstawie zestaw testowy sprawdzający wiedzę. 

Wygeneruj wynik **WYŁĄCZNIE w formacie JSON** opisanym poniżej. Nie dodawaj żadnego wstępu, powitań ani formatowania markdown poza samym blokiem JSON.

Zasady:
1. Pytania mogą mieć 4 opcje do wyboru (A, B, C, D) lub 2 opcje (Prawda/Fałsz).
2. Pole `correctAnswerIndex` to numer poprawnej odpowiedzi w tablicy `options`, licząc od zera (czyli pierwsza opcja to 0, druga to 1 itd.).
3. Pole `explanation` musi zawierać zwięzłe, psychologiczne uzasadnienie poprawnej odpowiedzi.
4. Nadaj testowi trafny `title` i adekwatny `difficulty` (np. Podstawowy, Średni, Zaawansowany).

**Wymagany format JSON:**

```json
{
  "title": "Tytuł Testu z Psychologii",
  "difficulty": "Średni",
  "questions": [
    {
      "id": 1,
      "type": "single-choice",
      "question": "Kto jest twórcą psychoanalizy?",
      "options": [
        "Carl Jung",
        "Sigmund Freud",
        "Alfred Adler",
        "B.F. Skinner"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Sigmund Freud był austriackim neurologiem, który jako pierwszy stworzył teorię i praktykę psychoanalizy."
    },
    {
      "id": 2,
      "type": "single-choice",
      "question": "Pamięć robocza to to samo co pamięć długotrwała.",
      "options": [
        "Prawda",
        "Fałsz"
      ],
      "correctAnswerIndex": 1,
      "explanation": "Fałsz. Pamięć robocza (operacyjna) odpowiada za tymczasowe przechowywanie i przetwarzanie informacji, podczas gdy długotrwała to trwały magazyn."
    }
  ]
}
```
