const defaultQuestions = [
  { grade: "1º", age: 6, subject: "Matemática", level: "Fácil", text: "Quanto é 2 + 1?", options: ["2", "3", "4", "5"], correct: "B" },
  { grade: "1º", age: 6, subject: "Português", level: "Fácil", text: "Qual palavra é um animal?", options: ["Casa", "Cachorro", "Bola", "Mesa"], correct: "B" },
  { grade: "1º", age: 6, subject: "Lógica", level: "Fácil", text: "Qual é maior?", options: ["1", "5", "2", "0"], correct: "B" },
  { grade: "1º", age: 6, subject: "Ciências", level: "Fácil", text: "O sol aparece de dia ou de noite?", options: ["Dia", "Noite", "Nunca", "Chuva"], correct: "A" },
  { grade: "1º", age: 6, subject: "Matemática", level: "Fácil", text: "Quanto é 4 + 1?", options: ["4", "5", "6", "7"], correct: "B" },

  { grade: "2º", age: 7, subject: "Matemática", level: "Fácil", text: "Quanto é 5 - 2?", options: ["2", "3", "4", "5"], correct: "B" },
  { grade: "2º", age: 7, subject: "Português", level: "Fácil", text: "Qual palavra começa com B?", options: ["Bola", "Casa", "Dedo", "Lua"], correct: "A" },
  { grade: "2º", age: 7, subject: "Lógica", level: "Fácil", text: "Qual objeto usamos para escrever?", options: ["Lápis", "Prato", "Sapato", "Janela"], correct: "A" },
  { grade: "2º", age: 7, subject: "Ciências", level: "Fácil", text: "Qual animal mia?", options: ["Cachorro", "Pato", "Gato", "Peixe"], correct: "C" },
  { grade: "2º", age: 7, subject: "Matemática", level: "Fácil", text: "Quanto é 3 + 4?", options: ["5", "6", "7", "8"], correct: "C" },

  { grade: "3º", age: 8, subject: "Matemática", level: "Fácil", text: "Quanto é 4 + 4?", options: ["6", "7", "8", "9"], correct: "C" },
  { grade: "3º", age: 8, subject: "Português", level: "Médio", text: "Qual palavra está no plural?", options: ["Casa", "Livros", "Flor", "Papel"], correct: "B" },
  { grade: "3º", age: 8, subject: "Lógica", level: "Fácil", text: "Qual número vem depois do 9?", options: ["8", "10", "7", "6"], correct: "B" },
  { grade: "3º", age: 8, subject: "Ciências", level: "Fácil", text: "O Sol aparece mais de dia?", options: ["Sim", "Não", "Às vezes", "Nunca"], correct: "A" },
  { grade: "3º", age: 8, subject: "Matemática", level: "Fácil", text: "Quanto é 9 - 3?", options: ["5", "6", "7", "8"], correct: "B" },

  { grade: "4º", age: 9, subject: "Matemática", level: "Médio", text: "Quanto é 3 x 2?", options: ["5", "6", "7", "8"], correct: "B" },
  { grade: "4º", age: 9, subject: "Português", level: "Médio", text: "Qual frase termina com ponto?", options: ["Eu fui.", "Eu fui?", "Eu fui!", "Eu fui,"], correct: "A" },
  { grade: "4º", age: 9, subject: "Lógica", level: "Fácil", text: "Qual figura tem três lados?", options: ["Quadrado", "Triângulo", "Círculo", "Retângulo"], correct: "B" },
  { grade: "4º", age: 9, subject: "Ciências", level: "Fácil", text: "As plantas precisam de luz?", options: ["Sim", "Não", "Nunca", "Só água"], correct: "A" },
  { grade: "4º", age: 9, subject: "Matemática", level: "Fácil", text: "Quanto é 12 - 5?", options: ["6", "7", "8", "9"], correct: "B" },

  { grade: "5º", age: 10, subject: "Matemática", level: "Médio", text: "Quanto é 20 dividido por 4?", options: ["4", "5", "6", "8"], correct: "B" },
  { grade: "5º", age: 10, subject: "Português", level: "Médio", text: "Qual palavra é um verbo?", options: ["Correr", "Mesa", "Azul", "Casa"], correct: "A" },
  { grade: "5º", age: 10, subject: "Lógica", level: "Fácil", text: "Qual número é par?", options: ["7", "9", "12", "11"], correct: "C" },
  { grade: "5º", age: 10, subject: "Ciências", level: "Médio", text: "Qual órgão usamos para respirar?", options: ["Osso", "Estômago", "Pulmão", "Joelho"], correct: "C" },
  { grade: "5º", age: 10, subject: "Matemática", level: "Médio", text: "Quanto é 15 - 6?", options: ["7", "8", "9", "10"], correct: "C" },
];

const roundSize = 5;
let questions = loadQuestions();
let roundQuestions = [];
let currentIndex = 0;
let selectedAnswer = "";
let correctCount = 0;
let answered = false;
let retryPending = false;
let introMode = true;
let retryQuestionMode = false;
let firstAttemptResults = [];
let parentAreaUnlocked = false;
let pendingProtectedView = "";
let unlockTimerId = null;
let unlockCountdownId = null;
let unlockMessageTimerId = null;
let retryRestartTimerId = null;
let firestoreDb = null;
let pendingImportGrade = "";
const splashDurationMs = 3000;
const parentPasswordEnabled = false;
const firestoreGradeCache = new Map();

const splashScreen = document.querySelector("#splashScreen");
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
const gateTitle = document.querySelector("#gateTitle");
const gateSubtitle = document.querySelector("#gateSubtitle");
const scoreSuffix = document.querySelector("#scoreSuffix");
const openCountdownAppButton = document.querySelector("#openCountdownAppButton");
const closeCountdownButton = document.querySelector("#closeCountdownButton");
const gradeLabel = document.querySelector("#gradeLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const progressBar = document.querySelector("#progressBar");
const questionCounter = document.querySelector("#questionCounter");
const supportText = document.querySelector("#supportText");
const questionText = document.querySelector("#questionText");
const answerList = document.querySelector("#answerList");
const feedback = document.querySelector("#feedback");
const explanationBox = document.querySelector("#explanationBox");
const nextButton = document.querySelector("#nextButton");
const clearResultsButton = document.querySelector("#clearResultsButton");
const manualUnlockButton = document.querySelector("#manualUnlockButton");
const stopTestButton = document.querySelector("#stopTestButton");
const lastScore = document.querySelector("#lastScore");
const roundCount = document.querySelector("#roundCount");
const bestSubject = document.querySelector("#bestSubject");
const resultsList = document.querySelector("#resultsList");
const questionBankStatus = document.querySelector("#questionBankStatus");
const questionCsvInput = document.querySelector("#questionCsvInput");
const importGradeButtons = document.querySelectorAll(".import-grade-button");
const studentGradeSelect = document.querySelector("#studentGradeSelect");
const unlockTimeSelect = document.querySelector("#unlockTimeSelect");

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getFirestoreInstance() {
  if (firestoreDb !== null) return firestoreDb;

  const firebaseConfig = window.TELA_INTELIGENTE_FIREBASE_CONFIG;
  if (!window.firebase || !firebaseConfig || !firebaseConfig.projectId) {
    firestoreDb = undefined;
    return firestoreDb;
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  firestoreDb = window.firebase.firestore();
  return firestoreDb;
}

function mapFirestoreQuestion(docData) {
  const grade = normalizeGradeLabel(docData.grade || docData.year || docData.ano);
  const options = [
    docData.optionA || docData.a || docData.alternativaA,
    docData.optionB || docData.b || docData.alternativaB,
    docData.optionC || docData.c || docData.alternativaC,
    docData.optionD || docData.d || docData.alternativaD,
  ].filter(Boolean);

  return {
    grade,
    age: Number(docData.age || docData.idade || inferAgeFromGrade(grade)),
    subject: normalizeSubjectName(docData.subject || docData.materia || inferSubjectFromQuestion(docData.text || docData.question || docData.pergunta)),
    level: docData.level || docData.nivel || "Fácil",
    text: docData.text || docData.question || docData.pergunta || "",
    options,
    correct: String(docData.correct || docData.correta || docData.gabarito || "").trim().toUpperCase(),
  };
}

async function fetchQuestionsFromFirestore(selectedGrade) {
  const db = getFirestoreInstance();
  if (!db) return [];
  if (firestoreGradeCache.has(selectedGrade)) {
    return firestoreGradeCache.get(selectedGrade);
  }

  const snapshots = await Promise.all([
    db.collection("questions").where("grade", "==", selectedGrade).get(),
    db.collection("questions").where("year", "==", selectedGrade).get(),
  ]);

  const firestoreQuestions = snapshots
    .flatMap((snapshot) => snapshot.docs)
    .filter((doc, index, docs) => docs.findIndex((item) => item.id === doc.id) === index)
    .map((doc) => mapFirestoreQuestion(doc.data()))
    .filter((question) => {
      const validAnswers = question.options.map((_, index) => String.fromCharCode(65 + index));
      return question.grade && question.text && question.options.length >= 3 && validAnswers.includes(question.correct);
    });

  const normalizedQuestions = ensureFourOptions(firestoreQuestions);
  firestoreGradeCache.set(selectedGrade, normalizedQuestions);
  return normalizedQuestions;
}

function isTestModeEnabled() {
  return localStorage.getItem("smartUnlockTestActive") === "true";
}

function setTestModeEnabled(enabled) {
  localStorage.setItem("smartUnlockTestActive", enabled ? "true" : "false");
}

function renderIdleStudentState() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  unlockedState.hidden = true;
}

function getIntroSubtitle() {
  return `Responda 5 perguntas para liberar<br />o celular por ${formatMinutesLabel(getUnlockMinutes())}`;
}

function formatMinutesLabel(minutes) {
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

function getExplanationForQuestion(question) {
  const correctIndex = question.correct.charCodeAt(0) - 65;
  const correctOption = question.options[correctIndex] || "";
  const text = question.text.toLowerCase();
  const mathMatch = question.text.match(/(\d+)\s*([+\-x*/])\s*(\d+)/);

  if (mathMatch) {
    const left = Number(mathMatch[1]);
    const operator = mathMatch[2];
    const right = Number(mathMatch[3]);
    const result =
      operator === "+"
        ? left + right
        : operator === "-"
          ? left - right
          : operator === "x" || operator === "*"
            ? left * right
            : right !== 0
              ? left / right
              : correctOption;

    return {
      explanation: `${left} ${operator} ${right} = ${result}`,
      hint: operator === "-" ? "Tire aos poucos para descobrir." : "Conte nos dedos!",
    };
  }

  if (text.includes("animal")) {
    return {
      explanation: `${correctOption} é um animal.`,
      hint: "Pense nos bichinhos do dia a dia.",
    };
  }

  if (text.includes("plural")) {
    return {
      explanation: `${correctOption} mostra mais de um.`,
      hint: "Quando tem muitos, a palavra costuma mudar.",
    };
  }

  if (text.includes("rima")) {
    return {
      explanation: `${correctOption} tem som parecido no final.`,
      hint: "Leia as palavras bem devagar.",
    };
  }

  return {
    explanation: `A resposta certa é ${correctOption}.`,
    hint: "Leia com calma e tente outra vez.",
  };
}

function showIntroScreen(title, subtitle, buttonText) {
  clearRetryRestartTimer();
  introMode = true;
  retryPending = false;
  retryQuestionMode = false;
  answered = false;
  selectedAnswer = "";
  gradeLabel.textContent = getGradeDisplayLabel();
  gateTitle.textContent = title;
  gateSubtitle.innerHTML = subtitle;
  questionCounter.textContent = `Progresso: 0/${roundSize}`;
  scoreLabel.textContent = "0";
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = "0%";
  supportText.textContent = "";
  questionText.textContent = "Você está aprendendo muito!";
  questionText.classList.add("is-message");
  answerList.innerHTML = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  nextButton.textContent = buttonText;
  nextButton.disabled = false;
}

function refreshStudentGradePreview() {
  gradeLabel.textContent = getGradeDisplayLabel();
}

function showInsufficientQuestionsState() {
  showIntroScreen(
    "Tempo de uso pausado",
    "Não há questões suficientes para este ano. Importe mais questões.",
    "Começar agora",
  );
  questionText.textContent = "Não há questões suficientes para este ano. Importe mais questões.";
  questionText.classList.add("is-message");
  supportText.textContent = "";
  nextButton.disabled = true;
  educationGate.hidden = false;
  unlockedState.hidden = true;
}

async function startRound() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.remove("screen-free");
  const eligibleQuestions = await getQuestionsForSelectedGrade();
  if (eligibleQuestions.length < roundSize) {
    showInsufficientQuestionsState();
    return;
  }
  roundQuestions = buildDiversifiedRound(eligibleQuestions);
  currentIndex = 0;
  selectedAnswer = "";
  correctCount = 0;
  firstAttemptResults = [];
  answered = false;
  retryPending = false;
  retryQuestionMode = false;
  educationGate.hidden = false;
  unlockedState.hidden = true;
  showIntroScreen(
    "Tempo de uso pausado",
    getIntroSubtitle(),
    "Começar agora",
  );
}

async function startOverlayRound() {
  if (!isTestModeEnabled()) {
    renderIdleStudentState();
    return;
  }

  clearRetryRestartTimer();
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.remove("screen-free");
  const eligibleQuestions = await getQuestionsForSelectedGrade();
  if (eligibleQuestions.length < roundSize) {
    showInsufficientQuestionsState();
    return;
  }
  roundQuestions = buildDiversifiedRound(eligibleQuestions);
  currentIndex = 0;
  selectedAnswer = "";
  correctCount = 0;
  firstAttemptResults = [];
  answered = false;
  retryPending = false;
  retryQuestionMode = false;
  educationGate.hidden = false;
  unlockedState.hidden = true;
  showIntroScreen(
    "Tempo acabou",
    "Vamos jogar mais uma vez?<br />Você está aprendendo muito!",
    "Novo desafio",
  );
}

function buildDiversifiedRound(questionPool) {
  return getRandomQuestionsByYear(getSelectedGrade(), roundSize, questionPool);
}

function getLastRoundStorageKey(year) {
  return `smartUnlockLastRoundQuestions:${normalizeGradeLabel(year)}`;
}

function getLastRoundQuestionsByYear(year) {
  return JSON.parse(localStorage.getItem(getLastRoundStorageKey(year)) || "[]");
}

function saveLastRoundQuestionsByYear(year, questionsForRound) {
  localStorage.setItem(
    getLastRoundStorageKey(year),
    JSON.stringify(questionsForRound.map((question) => question.text)),
  );
}

function getRandomQuestionsByYear(year, count = 5, questionPool = []) {
  const normalizedYear = normalizeGradeLabel(year);
  const eligibleQuestions = questionPool.filter((question) => question.grade === normalizedYear);
  const targetSize = Math.min(count, eligibleQuestions.length);

  if (eligibleQuestions.length <= targetSize) {
    const fullRound = shuffle(eligibleQuestions).slice(0, targetSize);
    saveLastRoundQuestionsByYear(normalizedYear, fullRound);
    return fullRound;
  }

  const lastRoundSet = new Set(getLastRoundQuestionsByYear(normalizedYear));
  const freshQuestions = shuffle(eligibleQuestions.filter((question) => !lastRoundSet.has(question.text)));
  const repeatedQuestions = shuffle(eligibleQuestions.filter((question) => lastRoundSet.has(question.text)));
  const selected = [];
  const selectedTexts = new Set();

  while (selected.length < targetSize && freshQuestions.length) {
    const question = freshQuestions.shift();
    if (!selectedTexts.has(question.text)) {
      selected.push(question);
      selectedTexts.add(question.text);
    }
  }

  while (selected.length < targetSize && repeatedQuestions.length) {
    const question = repeatedQuestions.shift();
    if (!selectedTexts.has(question.text)) {
      selected.push(question);
      selectedTexts.add(question.text);
    }
  }

  const round = shuffle(selected).slice(0, targetSize);
  saveLastRoundQuestionsByYear(normalizedYear, round);
  return round;
}

function getSelectedGrade() {
  return localStorage.getItem("smartUnlockStudentGrade") || "1º";
}

function getUnlockMinutes() {
  return Number(localStorage.getItem("smartUnlockMinutes") || "15");
}

function getGradeDisplayLabel(grade = getSelectedGrade()) {
  return `${grade.toUpperCase()} ANO • ${inferAgeFromGrade(grade)} ANOS`;
}

function getFallbackQuestionsForGrade(selectedGrade) {
  return defaultQuestions.filter((question) => question.grade === selectedGrade);
}

function createEmptyQuestionBank() {
  return {
    "1º": [],
    "2º": [],
    "3º": [],
    "4º": [],
    "5º": [],
  };
}

function normalizeQuestionBank(rawBank) {
  const bank = createEmptyQuestionBank();
  if (!rawBank || typeof rawBank !== "object") return bank;

  Object.entries(rawBank).forEach(([grade, list]) => {
    const normalizedGrade = normalizeGradeLabel(grade);
    if (!bank[normalizedGrade] || !Array.isArray(list)) return;
    bank[normalizedGrade] = ensureFourOptions(list).map((question) => ({
      ...question,
      grade: normalizedGrade,
      age: Number(question.age || inferAgeFromGrade(normalizedGrade)),
    }));
  });

  return bank;
}

function getStoredQuestionBank() {
  return normalizeQuestionBank(JSON.parse(localStorage.getItem("smartUnlockQuestionBank") || "null"));
}

function saveQuestionBank(bank) {
  localStorage.setItem("smartUnlockQuestionBank", JSON.stringify(normalizeQuestionBank(bank)));
}

function getImportedQuestionsForGrade(grade) {
  return getStoredQuestionBank()[normalizeGradeLabel(grade)] || [];
}

async function getQuestionsForSelectedGrade() {
  const selectedGrade = getSelectedGrade();
  const importedQuestions = getImportedQuestionsForGrade(selectedGrade);
  if (importedQuestions.length) {
    return importedQuestions.filter((question) => question.grade === selectedGrade);
  }

  const remoteQuestions = await fetchQuestionsFromFirestore(selectedGrade);
  if (remoteQuestions.length) {
    return remoteQuestions.filter((question) => question.grade === selectedGrade);
  }

  return getFallbackQuestionsForGrade(selectedGrade);
}

function renderQuestion() {
  const question = roundQuestions[currentIndex];
  const totalRoundQuestions = roundQuestions.length;
  introMode = false;
  selectedAnswer = "";
  answered = false;
  retryQuestionMode = false;
  gradeLabel.textContent = `${getSelectedGrade().toUpperCase()} ANO • ${inferAgeFromGrade(getSelectedGrade())} ANOS • ${question.subject}`;
  gateTitle.textContent = "Desafio rápido";
  gateSubtitle.textContent = "Leia com calma e escolha uma resposta.";
  questionCounter.textContent = `Progresso: ${currentIndex + 1}/${totalRoundQuestions}`;
  questionText.textContent = question.text;
  questionText.classList.remove("is-message");
  scoreLabel.textContent = String(correctCount);
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = `${((currentIndex + 1) / totalRoundQuestions) * 100}%`;
  supportText.textContent = correctCount ? `⭐ ${correctCount} estrelinha${correctCount > 1 ? "s" : ""} • Você está indo muito bem!` : "Você consegue! Vamos juntos.";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
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
  if (introMode) {
    renderQuestion();
    return;
  }

  if (retryPending) {
    if (isTestModeEnabled()) {
      startOverlayRound();
    } else {
      startRound();
    }
    return;
  }

  const question = roundQuestions[currentIndex];

  if (!answered) {
    answered = true;
    const isCorrect = selectedAnswer === question.correct;
    if (!firstAttemptResults[currentIndex]) {
      firstAttemptResults[currentIndex] = {
        subject: question.subject,
        correct: isCorrect,
      };
    }
    updatePerformanceForAnswer(question.subject, isCorrect);
    if (isCorrect) {
      correctCount += 1;
    }

    scoreLabel.textContent = String(correctCount);
    feedback.innerHTML = isCorrect
      ? "✅ Muito bem! Você acertou 👏 ⭐ +1 estrelinha"
      : "❌ Quase!<br />Vamos aprender juntos 😊";
    feedback.className = `feedback ${isCorrect ? "success" : "warning"}`;
    supportText.textContent = correctCount ? `⭐ ${correctCount} estrelinha${correctCount > 1 ? "s" : ""} • Você está indo muito bem!` : "Você consegue! Vamos juntos.";

    if (!isCorrect) {
      const explanation = getExplanationForQuestion(question);
      explanationBox.innerHTML = `🧠 Explicação:<br />${explanation.explanation}<br /><br />📌 Dica:<br />${explanation.hint}`;
      explanationBox.hidden = false;
      saveResult(calculateScore(), false);
      renderParentDashboard();
      retryPending = true;
      nextButton.textContent = "Novo desafio";
      nextButton.disabled = false;
      queueRetryRound();
      return;
    }

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

  feedback.innerHTML = "❌ Quase!<br />Vamos aprender juntos 😊";
  feedback.className = "feedback warning";
  nextButton.textContent = "Tentar nova rodada";
  retryPending = true;
}

function beginUnlockPeriod() {
  const unlockedUntil = Date.now() + getUnlockMinutes() * 60 * 1000;
  localStorage.setItem("smartUnlockUnlockedUntil", String(unlockedUntil));
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  unlockMessage.textContent = `Você conseguiu! Agora você pode usar o celular por ${formatMinutesLabel(getUnlockMinutes())}. Use com cuidado 😉`;
  unlockedState.hidden = false;
  scheduleOverlayReturn();
  startUnlockCountdown();
}

function clearRetryRestartTimer() {
  if (retryRestartTimerId) {
    window.clearTimeout(retryRestartTimerId);
    retryRestartTimerId = null;
  }
}

function restartRoundAfterFailure() {
  clearRetryRestartTimer();
  if (!retryPending) return;
  if (isTestModeEnabled()) {
    startOverlayRound();
  } else {
    startRound();
  }
}

function queueRetryRound() {
  clearRetryRestartTimer();
  retryRestartTimerId = window.setTimeout(() => {
    restartRoundAfterFailure();
  }, 2500);
}

function scheduleOverlayReturn() {
  if (!isTestModeEnabled()) {
    renderIdleStudentState();
    return;
  }

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
  if (!isTestModeEnabled()) {
    renderIdleStudentState();
    return false;
  }

  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  if (unlockedUntil > Date.now()) {
    phoneFrame.classList.add("screen-free");
    educationGate.hidden = true;
    unlockMessage.textContent = `Você conseguiu! Agora você pode usar o celular por ${formatMinutesLabel(getUnlockMinutes())}. Use com cuidado 😉`;
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

function saveResult(score, passed) {
  const results = getResults();
  const subjectHits = {};
  const subjectPerformance = {};

  roundQuestions.forEach((question) => {
    subjectHits[question.subject] = (subjectHits[question.subject] || 0) + 1;
  });

  firstAttemptResults.forEach((entry) => {
    if (!entry) return;
    subjectPerformance[entry.subject] ||= { total: 0, correct: 0 };
    subjectPerformance[entry.subject].total += 1;
    if (entry.correct) {
      subjectPerformance[entry.subject].correct += 1;
    }
  });

  Object.keys(subjectHits).forEach((subject) => {
    subjectPerformance[subject] ||= { total: 0, correct: 0 };
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
    subjectPerformance,
  });

  localStorage.setItem("smartUnlockResults", JSON.stringify(results.slice(0, 20)));
}

function loadQuestions() {
  const imported = Object.values(getStoredQuestionBank()).flat();
  if (imported.length >= 1) {
    return ensureFourOptions(imported);
  }
  return defaultQuestions;
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
  const imported = Object.entries(getStoredQuestionBank())
    .map(([grade, list]) => ({ grade, total: list.length }))
    .filter((entry) => entry.total > 0);
  const hasFirestore = Boolean(window.TELA_INTELIGENTE_FIREBASE_CONFIG?.projectId);
  questionBankStatus.textContent =
    imported.length
      ? imported.map((entry) => `${entry.grade} ano: ${entry.total}`).join(" • ")
      : hasFirestore
        ? "Buscando questões do Firebase por ano escolar."
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

function normalizeSheetName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeGradeLabel(value) {
  const text = String(value || "").trim();
  const match = text.match(/([1-5])\s*(?:o|º)?/i);
  return match ? `${match[1]}º` : text;
}

function inferAgeFromGrade(grade) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const ageByGrade = {
    "1º": 6,
    "2º": 7,
    "3º": 8,
    "4º": 9,
    "5º": 10,
  };
  return ageByGrade[normalizedGrade] || 8;
}

function inferSubjectFromQuestion(text) {
  const questionText = String(text || "").toLowerCase();
  if (/[+\-x÷*/=]|\bquanto\b|\bresultado\b|\bmultiplo\b|\bmetade\b|\bn[uú]mero\b/.test(questionText)) {
    return "Matemática";
  }
  if (/\bpalavra\b|\bverbo\b|\bplural\b|\brima\b|\bletra\b/.test(questionText)) {
    return "Português";
  }
  if (/\blado\b|\bmaior\b|\boposto\b|\bdepois\b|\bsequencia\b|\blogica\b/.test(questionText)) {
    return "Lógica";
  }
  return "Ciências";
}

function normalizeSubjectName(subject) {
  const normalized = String(subject || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (normalized.includes("mat")) return "Matemática";
  if (normalized.includes("port")) return "Português";
  if (normalized.includes("log")) return "Lógica";
  if (normalized.includes("cien")) return "Ciências";
  return inferSubjectFromQuestion(subject);
}

function createPerformanceEntry() {
  return {
    "Matemática": { acertos: 0, erros: 0 },
    "Português": { acertos: 0, erros: 0 },
    "Ciências": { acertos: 0, erros: 0 },
    "Lógica": { acertos: 0, erros: 0 },
  };
}

function getPerformanceStore() {
  const rawStore = JSON.parse(localStorage.getItem("smartUnlockPerformanceByYear") || "null");
  const store = {};

  ["1º", "2º", "3º", "4º", "5º"].forEach((grade) => {
    const source = rawStore?.[grade] || {};
    const base = createPerformanceEntry();
    Object.keys(base).forEach((subject) => {
      base[subject] = {
        acertos: Number(source?.[subject]?.acertos || 0),
        erros: Number(source?.[subject]?.erros || 0),
      };
    });
    store[grade] = base;
  });

  return store;
}

function savePerformanceStore(store) {
  localStorage.setItem("smartUnlockPerformanceByYear", JSON.stringify(store));
}

function updatePerformanceForAnswer(subject, isCorrect, grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const normalizedSubject = normalizeSubjectName(subject);
  const store = getPerformanceStore();
  const yearPerformance = store[normalizedGrade] || createPerformanceEntry();

  if (!yearPerformance[normalizedSubject]) {
    yearPerformance[normalizedSubject] = { acertos: 0, erros: 0 };
  }

  if (isCorrect) {
    yearPerformance[normalizedSubject].acertos += 1;
  } else {
    yearPerformance[normalizedSubject].erros += 1;
  }

  store[normalizedGrade] = yearPerformance;
  savePerformanceStore(store);
}

function importQuestionsFromCsv(text, forcedGrade = "") {
  const rows = parseCsv(text);
  return importQuestionsFromRows(rows, forcedGrade);
}

function importQuestionsFromRows(rows, forcedGrade = "") {
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
    time: findColumn("Tempo", "Tempo (seg)", "Segundos"),
  };

  const requiredColumns = [
    columns.grade,
    columns.text,
    columns.optionA,
    columns.optionB,
    columns.optionC,
    columns.optionD,
    columns.correct,
    columns.level,
    columns.time,
  ];

  if (requiredColumns.some((column) => column === undefined)) {
    throw new Error("Arquivo inválido. Verifique o modelo CSV.");
  }

  return rows
    .slice(1)
    .map((row) => {
      const options = [row[columns.optionA], row[columns.optionB], row[columns.optionC]];
      if (columns.optionD !== undefined && row[columns.optionD]) {
        options.push(row[columns.optionD]);
      }

      const normalizedGrade = normalizeGradeLabel(forcedGrade || row[columns.grade]);

      return {
        grade: normalizedGrade,
        age: columns.age === undefined ? inferAgeFromGrade(normalizedGrade) : Number(row[columns.age] || inferAgeFromGrade(normalizedGrade)),
        subject: normalizeSubjectName(columns.subject === undefined ? inferSubjectFromQuestion(row[columns.text]) : row[columns.subject] || inferSubjectFromQuestion(row[columns.text])),
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

function inferGradeFromSheetName(sheetName) {
  const normalized = normalizeSheetName(sheetName);
  const match = normalized.match(/([1-5])\s*(?:o|º)?/i);
  return match ? `${match[1]}º` : "";
}

function importQuestionsFromWorkbook(buffer) {
  if (!window.XLSX) {
    throw new Error("Leitor de planilha indisponível.");
  }

  const workbook = window.XLSX.read(buffer, { type: "array" });
  const allQuestions = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = window.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    if (!rows.length) return;
    const gradeFromSheet = inferGradeFromSheetName(sheetName);
    const imported = importQuestionsFromRows(rows, gradeFromSheet);
    allQuestions.push(...imported);
  });

  return allQuestions;
}

function getResults() {
  return JSON.parse(localStorage.getItem("smartUnlockResults") || "[]");
}

function renderParentDashboard() {
  const results = getResults();
  lastScore.textContent = results[0] ? `${results[0].score}/10` : "--";
  roundCount.textContent = results.length;
  renderSubjectRanking();

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
  return `${formatMinutesLabel(result.unlockMinutes || getUnlockMinutes())} liberados`;
}

function getSubjectRanking() {
  const selectedGrade = getSelectedGrade();
  const yearPerformance = getPerformanceStore()[selectedGrade] || createPerformanceEntry();

  return Object.entries(yearPerformance)
    .map(([name, data]) => {
      const total = Number(data.acertos || 0) + Number(data.erros || 0);
      const score = total ? Math.round((Number(data.acertos || 0) / total) * 100) : 0;

      return {
        name,
        score,
        total,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.total - left.total;
    })
    .slice(0, 4);
}

function renderSubjectRanking() {
  const ranking = getSubjectRanking();

  if (!ranking.length) {
    bestSubject.innerHTML = `<span class="subject-ranking-item">--</span>`;
    return;
  }

  const focusName = ranking[ranking.length - 1]?.name;

  bestSubject.innerHTML = ranking
    .map((item, index) => {
      const prefix = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`;
      const isFocus = item.name === focusName;
      return `<span class="subject-ranking-item${isFocus ? " subject-ranking-focus" : ""}">${prefix} ${item.name} — ${item.score}%${isFocus ? " ⚠️" : ""}</span>`;
    })
    .join("");
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
  if (parentPasswordEnabled && isProtectedView(view) && !parentAreaUnlocked) {
    pendingProtectedView = view;
    showPasswordGate();
    return;
  }

  if (parentPasswordEnabled && view !== "parent") {
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
  return parentPasswordEnabled && view === "parent";
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

if (openCountdownAppButton) {
  openCountdownAppButton.addEventListener("click", () => {
    const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
    if (unlockedUntil <= Date.now()) return;

    unlockMessage.textContent = `Você conseguiu! Agora você pode usar o celular por ${formatMinutesLabel(getUnlockMinutes())}. Use com cuidado 😉`;
    updateUnlockCountdown();
    unlockedState.hidden = false;
    if (unlockMessageTimerId) {
      window.clearTimeout(unlockMessageTimerId);
      unlockMessageTimerId = null;
    }
  });
}

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
  localStorage.removeItem("smartUnlockPerformanceByYear");
  renderParentDashboard();
});

manualUnlockButton.addEventListener("click", () => {
  setTestModeEnabled(true);
  startRound();
  setActiveView("child");
});

stopTestButton.addEventListener("click", () => {
  clearRetryRestartTimer();
  setTestModeEnabled(false);
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  unlockedState.hidden = true;
  setActiveView("child");
});

studentGradeSelect.addEventListener("change", () => {
  localStorage.setItem("smartUnlockStudentGrade", studentGradeSelect.value);
  firestoreGradeCache.delete(studentGradeSelect.value);
  roundQuestions = [];
  currentIndex = 0;
  correctCount = 0;
  selectedAnswer = "";
  answered = false;
  retryPending = false;
  retryQuestionMode = false;
  refreshStudentGradePreview();
  renderParentDashboard();
  if (isTestModeEnabled()) {
    startRound();
  } else {
    showIntroScreen(
      "Tempo de uso pausado",
      getIntroSubtitle(),
      "Começar agora",
    );
  }
});

unlockTimeSelect.addEventListener("change", () => {
  localStorage.setItem("smartUnlockMinutes", unlockTimeSelect.value);
});

importGradeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pendingImportGrade = button.dataset.importGrade || "";
    questionCsvInput.click();
  });
});

questionCsvInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file || !pendingImportGrade) return;

  try {
    const text = await file.text();
    const importedQuestions = importQuestionsFromCsv(text, pendingImportGrade);

    if (!importedQuestions.length) {
      throw new Error("Nenhuma questão válida encontrada.");
    }

    const normalizedQuestions = ensureFourOptions(importedQuestions);
    const questionBank = getStoredQuestionBank();
    questionBank[pendingImportGrade] = normalizedQuestions.map((question) => ({
      ...question,
      grade: pendingImportGrade,
      age: inferAgeFromGrade(pendingImportGrade),
    }));
    saveQuestionBank(questionBank);
    localStorage.setItem("smartUnlockQuestionsUpdatedAt", formatSyncDate());
    firestoreGradeCache.clear();
    questions = loadQuestions();
    questionBankStatus.textContent = `Questões do ${pendingImportGrade} Ano importadas com sucesso.`;
    if (isTestModeEnabled()) {
      startRound();
    }
  } catch (error) {
    questionBankStatus.textContent =
      error.message === "Arquivo inválido. Verifique o modelo CSV."
        ? error.message
        : "Arquivo inválido. Verifique o modelo CSV.";
  } finally {
    pendingImportGrade = "";
    event.target.value = "";
  }
});

window.addEventListener("smartUnlockQuestionsUpdated", () => {
  firestoreGradeCache.clear();
  questions = loadQuestions();
  renderQuestionBankStatus();
  if (isTestModeEnabled()) {
    startRound();
  }
});

function formatSyncDate() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function runSplashScreen() {
  window.setTimeout(() => {
    splashScreen.classList.add("is-hidden");
    setActiveView("child");
    const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
    const hasActiveUnlock = unlockedUntil > Date.now();

    if (!hasActiveUnlock && !isTestModeEnabled()) {
      startRound();
    }
  }, splashDurationMs);
}

if (!restoreUnlockState()) {
  if (isTestModeEnabled()) {
    startRound();
  } else {
    renderIdleStudentState();
  }
}
renderParentDashboard();
renderQuestionBankStatus();
renderStudentGradeSelect();
renderUnlockTimeSelect();
refreshStudentGradePreview();
runSplashScreen();
