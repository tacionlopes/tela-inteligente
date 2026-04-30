const defaultQuestions = [
  {
    grade: "1º",
    age: 6,
    subject: "Matemática",
    level: "Fácil",
    text: "Quanto é 2 + 1?",
    options: ["2", "3", "4", "5"],
    correct: "B",
  },
  {
    grade: "1º",
    age: 6,
    subject: "Português",
    level: "Fácil",
    text: "Qual palavra é um animal?",
    options: ["Casa", "Cachorro", "Bola", "Mesa"],
    correct: "B",
  },
  {
    grade: "1º",
    age: 6,
    subject: "Lógica",
    level: "Fácil",
    text: "Qual é maior?",
    options: ["1", "5", "2", "0"],
    correct: "B",
  },
  {
    grade: "1º",
    age: 6,
    subject: "Ciências",
    level: "Fácil",
    text: "O sol aparece de dia ou de noite?",
    options: ["Dia", "Noite", "Nunca", "Chuva"],
    correct: "A",
  },
  {
    grade: "1º",
    age: 6,
    subject: "Matemática",
    level: "Fácil",
    text: "Quanto é 3 x 10?",
    options: ["20", "15", "40", "30"],
    correct: "D",
  },
  {
    grade: "2º",
    age: 7,
    subject: "Português",
    level: "Fácil",
    text: "Qual palavra começa com B?",
    options: ["Bola", "Casa", "Dedo", "Lua"],
    correct: "A",
  },
  {
    grade: "3º",
    age: 8,
    subject: "Lógica",
    level: "Fácil",
    text: "Qual número vem depois do 9?",
    options: ["8", "10", "7", "6"],
    correct: "B",
  },
  {
    grade: "4º",
    age: 9,
    subject: "Ciências",
    level: "Fácil",
    text: "As plantas precisam de luz?",
    options: ["Sim", "Não", "Nunca", "Só água"],
    correct: "A",
  },
  {
    grade: "5º",
    age: 10,
    subject: "Matemática",
    level: "Médio",
    text: "Quanto é 20 dividido por 4?",
    options: ["4", "5", "6", "8"],
    correct: "B",
  },
  {
    grade: "3º",
    age: 8,
    subject: "Português",
    level: "Médio",
    text: "Qual palavra está no plural?",
    options: ["Casa", "Livros", "Flor", "Papel"],
    correct: "B",
  },
  {
    grade: "4º",
    age: 9,
    subject: "Lógica",
    level: "Fácil",
    text: "Qual figura tem três lados?",
    options: ["Quadrado", "Triângulo", "Círculo", "Retângulo"],
    correct: "B",
  },
];

const roundSize = 5;
let questions = loadQuestions();
let roundQuestions = [];
let currentIndex = 0;
let selectedAnswer = "";
let correctCount = 0;
let answered = false;
let retryPending = false;
let parentAreaUnlocked = false;
let pendingProtectedView = "";
let unlockTimerId = null;
let unlockCountdownId = null;
let unlockMessageTimerId = null;

const childView = document.querySelector("#childView");
const parentView = document.querySelector("#parentView");
const historyView = document.querySelector("#historyView");
const switchButtons = document.querySelectorAll(".switch-button");
const viewTargetButtons = document.querySelectorAll("[data-view-target]");
const passwordGate = document.querySelector("#passwordGate");
const passwordForm = document.querySelector("#passwordForm");
const parentPasswordInput = document.querySelector("#parentPasswordInput");
const passwordError = document.querySelector("#passwordError");
const cancelPasswordButton = document.querySelector("#cancelPasswordButton");
const phoneFrame = document.querySelector(".phone-frame");
const educationGate = document.querySelector("#educationGate");
const unlockedState = document.querySelector("#unlockedState");
const unlockMessage = document.querySelector("#unlockMessage");
const unlockCountdown = document.querySelector("#unlockCountdown");
const openCountdownAppButton = document.querySelector("#openCountdownAppButton");
const closeCountdownButton = document.querySelector("#closeCountdownButton");
const gradeLabel = document.querySelector("#gradeLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const progressBar = document.querySelector("#progressBar");
const questionCounter = document.querySelector("#questionCounter");
const questionText = document.querySelector("#questionText");
const answerList = document.querySelector("#answerList");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#nextButton");
const clearResultsButton = document.querySelector("#clearResultsButton");
const manualUnlockButton = document.querySelector("#manualUnlockButton");
const lastScore = document.querySelector("#lastScore");
const roundCount = document.querySelector("#roundCount");
const bestSubject = document.querySelector("#bestSubject");
const resultsList = document.querySelector("#resultsList");
const questionBankStatus = document.querySelector("#questionBankStatus");
const questionCsvInput = document.querySelector("#questionCsvInput");
const studentGradeSelect = document.querySelector("#studentGradeSelect");
const unlockTimeSelect = document.querySelector("#unlockTimeSelect");

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startRound() {
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.remove("screen-free");
  const eligibleQuestions = getQuestionsForSelectedGrade();
  roundQuestions = buildDiversifiedRound(eligibleQuestions);
  currentIndex = 0;
  selectedAnswer = "";
  correctCount = 0;
  answered = false;
  retryPending = false;
  educationGate.hidden = false;
  unlockedState.hidden = true;
  renderQuestion();
}

function startOverlayRound() {
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.remove("screen-free");
  const eligibleQuestions = getQuestionsForSelectedGrade();
  roundQuestions = buildDiversifiedRound(eligibleQuestions);
  currentIndex = 0;
  selectedAnswer = "";
  correctCount = 0;
  answered = false;
  retryPending = false;
  educationGate.hidden = false;
  unlockedState.hidden = true;
  renderQuestion();
}

function buildDiversifiedRound(questionPool) {
  const targetSize = Math.min(roundSize, questionPool.length);
  const recentQuestions = JSON.parse(localStorage.getItem("smartUnlockRecentQuestions") || "[]");
  const recentSet = new Set(recentQuestions);
  const selected = [];
  const selectedTexts = new Set();
  const questionsBySubject = groupQuestionsBySubject(shuffle(questionPool));
  const subjectQueues = shuffle(Object.values(questionsBySubject));

  while (selected.length < targetSize && subjectQueues.some((queue) => queue.length)) {
    subjectQueues.forEach((queue) => {
      if (selected.length >= targetSize) return;
      const question = takeNextQuestion(queue, recentSet, selectedTexts) || takeNextQuestion(queue, new Set(), selectedTexts);
      if (question) {
        selected.push(question);
        selectedTexts.add(question.text);
      }
    });
  }

  const remaining = shuffle(questionPool).filter((question) => !selectedTexts.has(question.text));
  while (selected.length < targetSize && remaining.length) {
    const question = remaining.shift();
    selected.push(question);
    selectedTexts.add(question.text);
  }

  localStorage.setItem("smartUnlockRecentQuestions", JSON.stringify(selected.map((question) => question.text)));
  return shuffle(selected);
}

function groupQuestionsBySubject(questionPool) {
  return questionPool.reduce((groups, question) => {
    groups[question.subject] ||= [];
    groups[question.subject].push(question);
    return groups;
  }, {});
}

function takeNextQuestion(queue, recentSet, selectedTexts) {
  const index = queue.findIndex((question) => !recentSet.has(question.text) && !selectedTexts.has(question.text));
  if (index < 0) return null;
  return queue.splice(index, 1)[0];
}

function getSelectedGrade() {
  return localStorage.getItem("smartUnlockStudentGrade") || "1º";
}

function getUnlockMinutes() {
  return Number(localStorage.getItem("smartUnlockMinutes") || "15");
}

function getQuestionsForSelectedGrade() {
  const selectedGrade = getSelectedGrade();
  const filteredQuestions = questions.filter((question) => question.grade === selectedGrade);
  return filteredQuestions.length ? filteredQuestions : questions;
}

function renderQuestion() {
  const question = roundQuestions[currentIndex];
  const totalRoundQuestions = roundQuestions.length;
  selectedAnswer = "";
  answered = false;
  gradeLabel.textContent = `${question.grade} ano • ${question.age} anos • ${question.subject}`;
  questionCounter.textContent = `Etapa ${currentIndex + 1} de ${totalRoundQuestions}`;
  questionText.textContent = question.text;
  scoreLabel.textContent = calculateScore();
  progressBar.style.width = `${((currentIndex + 1) / totalRoundQuestions) * 100}%`;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.textContent = "Responder";
  nextButton.disabled = true;

  answerList.innerHTML = "";
  question.options.forEach((option, index) => {
    const letter = String.fromCharCode(65 + index);
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.innerHTML = `<span class="answer-letter">${letter}</span><span>${option}</span>`;
    button.addEventListener("click", () => selectAnswer(letter, button));
    answerList.appendChild(button);
  });
}

function selectAnswer(letter, button) {
  if (answered) return;
  selectedAnswer = letter;
  document.querySelectorAll(".answer-button").forEach((item) => {
    item.classList.remove("selected");
  });
  button.classList.add("selected");
  nextButton.disabled = false;
}

function calculateScore() {
  return Math.round((correctCount / roundQuestions.length) * 10);
}

function submitAnswer() {
  if (retryPending) {
    startRound();
    return;
  }

  const question = roundQuestions[currentIndex];

  if (!answered) {
    answered = true;
    const isCorrect = selectedAnswer === question.correct;
    if (isCorrect) correctCount += 1;

    scoreLabel.textContent = calculateScore();
    feedback.textContent = isCorrect ? "Resposta certa." : "Resposta incorreta.";
    feedback.className = `feedback ${isCorrect ? "success" : "warning"}`;
    nextButton.textContent = currentIndex === roundQuestions.length - 1 ? "Ver resultado" : "Próxima";
    return;
  }

  if (currentIndex < roundQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  finishRound();
}

function finishRound() {
  const score = calculateScore();
  const passed = correctCount === roundQuestions.length;
  saveResult(score, passed);
  renderParentDashboard();

  if (passed) {
    beginUnlockPeriod();
    return;
  }

  feedback.textContent = "É preciso acertar todas para liberar.";
  feedback.className = "feedback warning";
  nextButton.textContent = "Tentar nova rodada";
  retryPending = true;
}

function beginUnlockPeriod() {
  const unlockedUntil = Date.now() + getUnlockMinutes() * 60 * 1000;
  localStorage.setItem("smartUnlockUnlockedUntil", String(unlockedUntil));
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  unlockMessage.textContent = `Parabéns! Você acertou todas as questões e ganhou mais ${getUnlockMinutes()} minutos de uso.`;
  unlockedState.hidden = false;
  scheduleOverlayReturn();
  startUnlockCountdown();
  autoCloseUnlockMessage();
}

function scheduleOverlayReturn() {
  clearUnlockTimer();
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  const remainingMs = unlockedUntil - Date.now();

  if (remainingMs <= 0) {
    localStorage.removeItem("smartUnlockUnlockedUntil");
    startOverlayRound();
    return;
  }

  unlockTimerId = window.setTimeout(() => {
    localStorage.removeItem("smartUnlockUnlockedUntil");
    startOverlayRound();
  }, Math.min(remainingMs, 2147483647));
}

function restoreUnlockState() {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  if (unlockedUntil > Date.now()) {
    phoneFrame.classList.add("screen-free");
    educationGate.hidden = true;
    unlockMessage.textContent = `Parabéns! Você acertou todas as questões e ganhou mais ${getUnlockMinutes()} minutos de uso.`;
    unlockedState.hidden = true;
    scheduleOverlayReturn();
    startUnlockCountdown();
    return true;
  }
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.remove("screen-free");
  return false;
}

function clearUnlockTimer() {
  if (unlockTimerId) {
    window.clearTimeout(unlockTimerId);
    unlockTimerId = null;
  }
  if (unlockCountdownId) {
    window.clearInterval(unlockCountdownId);
    unlockCountdownId = null;
  }
  if (unlockMessageTimerId) {
    window.clearTimeout(unlockMessageTimerId);
    unlockMessageTimerId = null;
  }
}

function startUnlockCountdown() {
  if (unlockCountdownId) {
    window.clearInterval(unlockCountdownId);
  }

  updateUnlockCountdown();
  unlockCountdownId = window.setInterval(updateUnlockCountdown, 1000);
}

function updateUnlockCountdown() {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  const remainingMs = Math.max(0, unlockedUntil - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  unlockCountdown.textContent = `Tempo restante: ${minutes}:${seconds}`;
}

function autoCloseUnlockMessage() {
  if (unlockMessageTimerId) {
    window.clearTimeout(unlockMessageTimerId);
  }

  unlockMessageTimerId = window.setTimeout(() => {
    unlockedState.hidden = true;
    unlockMessageTimerId = null;
  }, 3500);
}

function saveResult(score, passed) {
  const results = getResults();
  const subjectHits = {};

  roundQuestions.forEach((question) => {
    subjectHits[question.subject] = (subjectHits[question.subject] || 0) + 1;
  });

  results.unshift({
    date: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    score,
    correct: correctCount,
    total: roundQuestions.length,
    passed,
    unlockMinutes: getUnlockMinutes(),
    subjects: Object.keys(subjectHits).join(", "),
  });

  localStorage.setItem("smartUnlockResults", JSON.stringify(results.slice(0, 20)));
}

function loadQuestions() {
  const imported = JSON.parse(localStorage.getItem("smartUnlockQuestions") || "null");
  if (Array.isArray(imported) && imported.length >= 1) {
    return ensureFourOptions(imported);
  }
  return defaultQuestions.slice(0, 5);
}

function ensureFourOptions(questionList) {
  const fallbackByQuestion = new Map(defaultQuestions.map((question) => [question.text, question.options]));

  return questionList.map((question) => {
    const fallbackOptions = fallbackByQuestion.get(question.text);
    if (!fallbackOptions?.[3] && question.options.length >= 4) {
      return question;
    }

    if (question.options.length >= 4) {
      return {
        ...question,
        options: question.options.map((option, index) => option || fallbackOptions?.[index]).filter(Boolean),
      };
    }

    return {
      ...question,
      options: [...question.options, fallbackOptions?.[3] || "Nenhuma"],
    };
  });
}

function renderQuestionBankStatus() {
  const imported = JSON.parse(localStorage.getItem("smartUnlockQuestions") || "null");
  questionBankStatus.textContent =
    Array.isArray(imported) && imported.length
      ? `${imported.length} questões importadas da planilha.`
      : "Usando questões padrão do protótipo.";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function importQuestionsFromCsv(text) {
  const rows = parseCsv(text);
  const headers = rows[0]?.map(normalizeHeader) || [];
  const findColumn = (...names) => names.map(normalizeHeader).map((name) => headers.indexOf(name)).find((index) => index >= 0);

  const columns = {
    grade: findColumn("Ano", "Série", "Serie"),
    age: findColumn("Idade"),
    subject: findColumn("Matéria", "Materia", "Disciplina"),
    text: findColumn("Pergunta", "Questão", "Questao"),
    optionA: findColumn("Alternativa A", "Opção A", "Opcao A", "A"),
    optionB: findColumn("Alternativa B", "Opção B", "Opcao B", "B"),
    optionC: findColumn("Alternativa C", "Opção C", "Opcao C", "C"),
    optionD: findColumn("Alternativa D", "Opção D", "Opcao D", "D"),
    correct: findColumn("Resposta Correta", "Correta", "Gabarito"),
    level: findColumn("Nível", "Nivel", "Dificuldade"),
  };

  const requiredColumns = [
    columns.grade,
    columns.age,
    columns.subject,
    columns.text,
    columns.optionA,
    columns.optionB,
    columns.optionC,
    columns.correct,
  ];

  if (requiredColumns.some((column) => column === undefined)) {
    throw new Error("CSV sem colunas obrigatórias.");
  }

  return rows
    .slice(1)
    .map((row) => {
      const options = [row[columns.optionA], row[columns.optionB], row[columns.optionC]];
      if (columns.optionD !== undefined && row[columns.optionD]) {
        options.push(row[columns.optionD]);
      }

      return {
        grade: row[columns.grade],
        age: Number(row[columns.age]),
        subject: row[columns.subject],
        level: row[columns.level] || "Fácil",
        text: row[columns.text],
        options,
        correct: (row[columns.correct] || "").trim().toUpperCase(),
      };
    })
    .filter((question) => {
      const validAnswers = question.options.map((_, index) => String.fromCharCode(65 + index));
      const hasValidAnswer = validAnswers.includes(question.correct);
      return question.grade && question.age && question.subject && question.text && question.options.every(Boolean) && hasValidAnswer;
    });
}

function getResults() {
  return JSON.parse(localStorage.getItem("smartUnlockResults") || "[]");
}

function renderParentDashboard() {
  const results = getResults();
  lastScore.textContent = results[0] ? `${results[0].score}/10` : "--";
  roundCount.textContent = results.length;
  bestSubject.textContent = getBestSubject(results);

  if (!results.length) {
    resultsList.innerHTML = `<p class="empty-state">Nenhuma rodada respondida ainda.</p>`;
    return;
  }

  resultsList.innerHTML = results
    .map(
      (result) => `
        <article class="result-card">
          <strong>${result.score}/10</strong>
          <div>
            <p>${result.passed ? "Tela liberada" : "Nova tentativa necessária"}</p>
            <span>${result.correct}/${result.total} corretas • ${formatUnlockTime(result)} • ${result.subjects}</span>
          </div>
          <span>${result.date}</span>
        </article>
      `,
    )
    .join("");
}

function renderStudentGradeSelect() {
  studentGradeSelect.value = getSelectedGrade();
}

function renderUnlockTimeSelect() {
  unlockTimeSelect.value = String(getUnlockMinutes());
}

function formatUnlockTime(result) {
  if (!result.passed) return "Sem liberação";
  return `${result.unlockMinutes || getUnlockMinutes()} min liberados`;
}

function getBestSubject(results) {
  if (!results.length) return "--";
  const counts = {};
  results.forEach((result) => {
    result.subjects.split(", ").forEach((subject) => {
      counts[subject] = (counts[subject] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

switchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.view);
  });
});

viewTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.viewTarget);
  });
});

function setActiveView(view) {
  if (isProtectedView(view) && !parentAreaUnlocked) {
    pendingProtectedView = view;
    showPasswordGate();
    return;
  }

  if (view !== "parent") {
    parentAreaUnlocked = false;
  }

  switchButtons.forEach((item) => {
    const isActive = item.dataset.view === view;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  childView.classList.toggle("active", view === "child");
  parentView.classList.toggle("active", view === "parent");
  historyView.classList.toggle("active", view === "history");
  renderParentDashboard();
}

function isProtectedView(view) {
  return view === "parent";
}

function showPasswordGate() {
  passwordGate.hidden = false;
  passwordError.textContent = "";
  parentPasswordInput.value = "";
  parentPasswordInput.focus();
}

function hidePasswordGate() {
  passwordGate.hidden = true;
  passwordError.textContent = "";
  pendingProtectedView = "";
}

function getParentPassword() {
  return localStorage.getItem("smartUnlockParentPassword") || "1234";
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (parentPasswordInput.value === getParentPassword()) {
    parentAreaUnlocked = true;
    const viewToOpen = pendingProtectedView || "parent";
    hidePasswordGate();
    setActiveView(viewToOpen);
    return;
  }

  passwordError.textContent = "Senha incorreta.";
  parentPasswordInput.select();
});

cancelPasswordButton.addEventListener("click", () => {
  hidePasswordGate();
});

openCountdownAppButton.addEventListener("click", () => {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  if (unlockedUntil <= Date.now()) return;

  unlockMessage.textContent = `Parabéns! Você acertou todas as questões e ganhou mais ${getUnlockMinutes()} minutos de uso.`;
  updateUnlockCountdown();
  unlockedState.hidden = false;
  if (unlockMessageTimerId) {
    window.clearTimeout(unlockMessageTimerId);
    unlockMessageTimerId = null;
  }
});

closeCountdownButton.addEventListener("click", () => {
  if (unlockMessageTimerId) {
    window.clearTimeout(unlockMessageTimerId);
    unlockMessageTimerId = null;
  }
  unlockedState.hidden = true;
});

nextButton.addEventListener("click", submitAnswer);
clearResultsButton.addEventListener("click", () => {
  localStorage.removeItem("smartUnlockResults");
  renderParentDashboard();
});

manualUnlockButton.addEventListener("click", () => {
  beginUnlockPeriod();
  setActiveView("child");
});

studentGradeSelect.addEventListener("change", () => {
  localStorage.setItem("smartUnlockStudentGrade", studentGradeSelect.value);
  startRound();
});

unlockTimeSelect.addEventListener("change", () => {
  localStorage.setItem("smartUnlockMinutes", unlockTimeSelect.value);
});

questionCsvInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedQuestions = importQuestionsFromCsv(text);

    if (!importedQuestions.length) {
      throw new Error("Nenhuma questão válida encontrada.");
    }

    const normalizedQuestions = ensureFourOptions(importedQuestions);
    localStorage.setItem("smartUnlockQuestions", JSON.stringify(normalizedQuestions));
    localStorage.setItem("smartUnlockQuestionsUpdatedAt", formatSyncDate());
    questions = normalizedQuestions;
    renderQuestionBankStatus();
    startRound();
  } catch (error) {
    questionBankStatus.textContent = "Não consegui importar. Confira as colunas da planilha.";
  } finally {
    event.target.value = "";
  }
});

window.addEventListener("smartUnlockQuestionsUpdated", () => {
  questions = loadQuestions();
  renderQuestionBankStatus();
  startRound();
});

function formatSyncDate() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

if (!restoreUnlockState()) {
  startRound();
}
renderParentDashboard();
renderQuestionBankStatus();
renderStudentGradeSelect();
renderUnlockTimeSelect();
