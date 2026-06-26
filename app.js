const GITHUB_API_URL = 'https://api.github.com/repos/Vek0n/Vek0n.github.io/contents/data';

// Stan aplikacji
let appState = {
    subjects: [], // Lista folderów
    currentSubject: null,
    tests: [], // Lista plików JSON w folderze
    currentTestData: null, // Pobrane dane z JSON
    currentQuestionIndex: 0,
    userAnswers: [], // zapisywane odpowiedzi użytkownika: { index: 0, isCorrect: true }
    currentTestUrl: null // adres URL aktualnego testu
};

// Funkcja tasująca elementy tablicy (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const appContainer = document.getElementById('app-container');

// Inicjalizacja
async function init() {
    renderLoader();
    try {
        const response = await fetch(`${GITHUB_API_URL}?t=${Date.now()}`);
        if (!response.ok) {
            if (response.status === 404) {
                renderError("Folder 'data' jeszcze nie istnieje na GitHubie. Wrzuć pierwsze testy!");
                return;
            }
            throw new Error("Błąd pobierania danych API");
        }
        const data = await response.json();
        // Wyłapujemy tylko foldery (typ 'dir')
        appState.subjects = data.filter(item => item.type === 'dir');
        renderHome();
    } catch (error) {
        console.error(error);
        renderError("Wystąpił błąd podczas łączenia z GitHub API.");
    }
}

// === WIDOKI (RENDEROWANIE) ===

function renderLoader() {
    appContainer.innerHTML = `<div class="loader">Ładowanie...</div>`;
}

function renderError(message) {
    appContainer.innerHTML = `
        <div style="text-align:center;">
            <h2>Ups!</h2>
            <p>${message}</p>
            <button class="primary-btn" style="margin-top:20px" onclick="init()">Spróbuj ponownie</button>
        </div>
    `;
}

// 1. Ekran Główny - Lista Przedmiotów
function renderHome() {
    let html = `
        <div class="header">
            <h1>Wybierz Przedmiot</h1>
        </div>
        <div class="grid-menu">
    `;

    if (appState.subjects.length === 0) {
        html += `<p style="text-align:center; width:100%;">Brak przedmiotów w folderze /data/</p>`;
    } else {
        appState.subjects.forEach(subject => {
            // Zamiana podkreślników na spacje dla ładnego wyglądu
            const displayName = subject.name.replace(/_/g, ' ');
            html += `
                <div class="card" onclick="loadSubject('${subject.name}', '${subject.url}')">
                    <h3>${displayName}</h3>
                </div>
            `;
        });
    }

    html += `</div>`;
    appContainer.innerHTML = html;
}

// 2. Ładowanie i Ekran Przedmiotu (Lista Testów)
async function loadSubject(folderName, apiUrl) {
    renderLoader();
    try {
        const response = await fetch(`${apiUrl}?t=${Date.now()}`);
        const data = await response.json();
        appState.currentSubject = folderName;
        // Wyłapujemy pliki JSON
        appState.tests = data.filter(item => item.name.endsWith('.json'));
        renderSubject();
    } catch(err) {
        renderError("Błąd pobierania listy testów.");
    }
}

function renderSubject() {
    const displayName = appState.currentSubject.replace(/_/g, ' ');
    let html = `
        <div class="header">
            <h2>${displayName}</h2>
            <button class="back-btn" onclick="renderHome()">Wróć</button>
        </div>
        <div class="grid-menu">
    `;

    if (appState.tests.length === 0) {
        html += `<p style="text-align:center; width:100%;">Brak plików .json w tym folderze.</p>`;
    } else {
        appState.tests.forEach(test => {
            const displayName = test.name.replace('.json', '').replace(/_/g, ' ');
            html += `
                <div class="card" onclick="loadTest('${test.download_url}')">
                    <h3>${displayName}</h3>
                    <span class="badge">Rozpocznij test</span>
                </div>
            `;
        });
    }

    html += `</div>`;
    appContainer.innerHTML = html;
}

// 3. Ładowanie i Ekran Testu
async function loadTest(jsonUrl) {
    renderLoader();
    try {
        const response = await fetch(`${jsonUrl}?t=${Date.now()}`);
        const data = await response.json();
        
        appState.currentTestUrl = jsonUrl;
        
        // Klonujemy pytania i losowo mieszamy ich kolejność
        const shuffledQuestions = shuffleArray([...data.questions]);
        
        // Dla każdego pytania losowo mieszamy również odpowiedzi
        shuffledQuestions.forEach(q => {
            const mappedOptions = q.options.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === q.correctAnswerIndex
            }));
            q.shuffledOptions = shuffleArray(mappedOptions);
        });

        appState.currentTestData = { ...data, questions: shuffledQuestions };
        appState.currentQuestionIndex = 0;
        appState.userAnswers = new Array(shuffledQuestions.length).fill(null);
        
        renderQuestion();
    } catch(err) {
        renderError("Błąd pobierania pliku testu (JSON jest niepoprawny?).");
    }
}

function renderQuestion() {
    const data = appState.currentTestData;
    const qIndex = appState.currentQuestionIndex;
    const question = data.questions[qIndex];
    const total = data.questions.length;
    
    const progressPercent = ((qIndex + 1) / total) * 100;

    // Sprawdzenie czy użytkownik już odpowiedział na to pytanie
    const savedAnswer = appState.userAnswers[qIndex];
    const isAnswered = savedAnswer !== null;

    let html = `
        <div class="header">
            <div>
                <h2>${data.title}</h2>
                <span class="badge" style="background:var(--text-muted)">${data.difficulty || 'Brak'}</span>
            </div>
            <button class="back-btn" onclick="renderSubject()">Wyjdź</button>
        </div>

        <div class="progress-container">
            <div class="progress-text">
                <span>Pytanie ${qIndex + 1} z ${total}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        </div>

        <div class="question-text">
            ${question.question}
        </div>

        <div class="options-grid">
    `;

    question.shuffledOptions.forEach((opt, index) => {
        let btnClass = 'option-btn';
        if (isAnswered) {
            if (opt.isCorrect) {
                btnClass += ' correct';
            } else if (index === savedAnswer.index) {
                btnClass += ' wrong';
            }
        }

        html += `
            <button class="${btnClass}" 
                onclick="handleAnswer(${index})" 
                ${isAnswered ? 'disabled' : ''}>
                ${opt.text}
            </button>
        `;
    });

    html += `</div>`; // zamkniecie options-grid

    if (isAnswered && question.explanation) {
        html += `
            <div class="explanation">
                <strong>Wyjaśnienie:</strong><br>
                ${question.explanation}
            </div>
        `;
    }

    html += `<div class="actions">`;
    if (isAnswered) {
        if (qIndex < total - 1) {
            html += `<button class="primary-btn" onclick="nextQuestion()">Następne pytanie</button>`;
        } else {
            html += `<button class="primary-btn" onclick="renderSummary()">Zakończ Test</button>`;
        }
    }
    html += `</div>`;

    // Paginacja (kropeczki na dole)
    html += `<div class="pagination">`;
    for(let i=0; i<total; i++) {
        let dotClass = 'dot';
        if (i === qIndex) dotClass += ' active';
        
        if (appState.userAnswers[i] !== null) {
            dotClass += appState.userAnswers[i].isCorrect ? ' correct' : ' wrong';
        }
        
        html += `<div class="${dotClass}" onclick="jumpToQuestion(${i})">${i+1}</div>`;
    }
    html += `</div>`;

    appContainer.innerHTML = html;
}

// === LOGIKA TESTU ===

window.handleAnswer = function(selectedIndex) {
    const qIndex = appState.currentQuestionIndex;
    const question = appState.currentTestData.questions[qIndex];
    
    const isCorrect = question.shuffledOptions[selectedIndex].isCorrect;
    
    appState.userAnswers[qIndex] = {
        index: selectedIndex,
        isCorrect: isCorrect
    };

    renderQuestion(); // Re-render żeby pokazać kolory i wyjaśnienie
}

window.nextQuestion = function() {
    if (appState.currentQuestionIndex < appState.currentTestData.questions.length - 1) {
        appState.currentQuestionIndex++;
        renderQuestion();
    }
}

window.jumpToQuestion = function(index) {
    appState.currentQuestionIndex = index;
    renderQuestion();
}

// 4. Ekran Podsumowania
window.renderSummary = function() {
    const total = appState.currentTestData.questions.length;
    const correctCount = appState.userAnswers.filter(a => a && a.isCorrect).length;
    const percentage = Math.round((correctCount / total) * 100);

    let html = `
        <div style="text-align:center; padding: 40px 0;">
            <h1 style="font-size: 3rem; margin-bottom: 10px;">${percentage}%</h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px;">
                Poprawne odpowiedzi: <strong>${correctCount} / ${total}</strong>
            </p>
            
            <div style="display:flex; justify-content:center; gap:20px;">
                <button class="back-btn" onclick="loadTest('${appState.currentTestUrl}')">Powtórz test</button>
                <button class="primary-btn" onclick="renderSubject()">Wróć do testów</button>
            </div>
        </div>
    `;

    appContainer.innerHTML = html;
}

// Wyeksportowanie funkcji do globalnego scope (dla inline onclick w HTML)
window.renderHome = renderHome;
window.renderSubject = renderSubject;
window.init = init;

// Start aplikacji po załadowaniu
document.addEventListener('DOMContentLoaded', init);
