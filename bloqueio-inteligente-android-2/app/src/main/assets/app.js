const defaultQuestions = [];

const roundSize = 5;
let questions = loadQuestions();
let roundQuestions = [];
let currentIndex = 0;
let selectedAnswer = "";
let selectedTextAnswer = "";
let correctCount = 0;
let answered = false;
let retryPending = false;
let dissertativeRecoveryMode = false;
let introMode = true;
let retryQuestionMode = false;
let firstAttemptResults = [];
let unlockTimerId = null;
let unlockCountdownId = null;
let unlockMessageTimerId = null;
let retryRestartTimerId = null;
let profileMenuAnimationTimerId = null;
const unlockAwardPendingStorageKey = "smartUnlockUnlockAwardPending";
let firestoreDb = null;
const splashDurationMs = 0;
const parentPasswordEnabled = false;
const firestoreGradeCache = new Map();
const firestoreProfilesCollection = "responsibleProfiles";
const remoteProfilesEnabled = true;
const parentPasswordStorageKey = "smartUnlockParentPassword";
const legacyDefaultParentPasswords = ["talau", "dilau01"];
const defaultParentPassword = "dinlau";
const aiVersionModeStorageKey = "smartUnlockAiVersionMode";
const parentDashboardModeStorageKey = "smartUnlockParentDashboardMode";
const aiGenerationDraftStorageKey = "smartUnlockAiGenerationDraft";
const aiGeneratedQuestionBankStorageKey = "smartUnlockAiGeneratedQuestionBank";
const aiGenerationMetaStorageKey = "smartUnlockAiGenerationMeta";
const studyGuidedKnowledgeStorageKey = "smartUnlockStudyGuidedKnowledge";
const parentalControlSettingsStorageKey = "smartUnlockParentalControlSettings";
const parentalBlockedAppCatalog = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "facebook", label: "Facebook" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "chrome", label: "Navegador" },
];
const parentalExceptionCatalog = [
  { key: "calculator", label: "Calculadora" },
  { key: "camera", label: "Câmera" },
  { key: "classroom", label: "Google Classroom" },
  { key: "meet", label: "Google Meet" },
];
const parentalWeekdayCatalog = [
  { key: "mon", label: "Seg" },
  { key: "tue", label: "Ter" },
  { key: "wed", label: "Qua" },
  { key: "thu", label: "Qui" },
  { key: "fri", label: "Sex" },
  { key: "sat", label: "Sáb" },
  { key: "sun", label: "Dom" },
];
const aiGenerationSystemPrompt = `Você é um gerador pedagógico de questões escolares.

Sua tarefa é gerar questões educacionais em JSON, seguindo EXATAMENTE o formato solicitado.

Regras obrigatórias:
- Responder apenas com JSON válido.
- Não escrever explicações fora do JSON.
- Respeitar exatamente:
  - ano escolar
  - matérias
  - quantidade total
  - tipos de questão
  - conhecimento-base
- Linguagem adequada ao ano informado.
- Cada questão deve pertencer claramente à matéria correspondente.
- Nunca misturar disciplinas não selecionadas.
- Se apenas uma matéria for selecionada, todas as questões devem pertencer exclusivamente a essa matéria, inclusive no conteúdo e no vocabulário usados.
- Se houver mais de uma matéria, cada questão deve ficar claramente presa à matéria indicada em "subject", sem pegar conteúdo principal de outra disciplina.
- Se houver mais de uma matéria, distribua as questões da forma mais equilibrada possível.
- Se houver múltipla escolha e dissertativa ao mesmo tempo, distribua os tipos da forma mais equilibrada possível.
- Questões de múltipla escolha:
  - usar "answerMode": "choice"
  - ter exatamente 4 alternativas em "options"
  - usar "correct" com uma letra: "A", "B", "C" ou "D"
  - "expectedAnswer" deve ser string vazia
- Questões dissertativas:
  - usar "answerMode": "text"
  - "options" deve ser array vazio
  - "correct" deve ser string vazia
  - "expectedAnswer" deve trazer uma resposta esperada clara
- Toda questão deve ter:
  - "grade"
  - "subject"
  - "text"
  - "answerMode"
  - "options"
  - "correct"
  - "expectedAnswer"
  - "explanation"
- A "explanation" deve ser curta, objetiva e útil para revisão.
- Não repetir enunciados.
- Não gerar conteúdo fora do tema pedido.
- Não inventar campos além dos definidos.`;
const initialSetupStorageKey = "smartUnlockInitialSetup";
const importedManifestStorageKey = "smartUnlockImportedManifest";
const questionImportOnlyResetStorageKey = "smartUnlockQuestionImportOnlyReset";
const questionImportOnlyResetVersion = "import-only-v2";
const subjectChecksStorageKey = "smartUnlockSubjectChecks";
const activeSubjectsStorageKey = "smartUnlockActiveSubjectsByGrade";
const localDeviceIdStorageKey = "smartUnlockLocalDeviceId";
const adminOwnerDeviceStorageKey = "smartUnlockAdminOwnerDeviceId";
const activeSessionEmailStorageKey = "smartUnlockActiveSessionEmail";
const cycleActiveStorageKey = "smartUnlockCycleActive";
const forceResumeTestStorageKey = "smartUnlockForceResumeTest";
const bypassLoginReturnStorageKey = "smartUnlockBypassLoginReturnOnce";
const defaultResponsibleEmail = "tacionlopes@gmail.com";
const defaultResponsibleName = "Rose";
const defaultStudentName = "Lau";
const defaultStudentGrade = "5º";
const testerResponsibleEmail = "testador@desbloqueio.app";
const testerResponsibleName = "Testador";
const testerStudentName = "Aluno Teste";
const testerStudentGrade = "5º";
const testerParentPassword = "teste1234";
const helenaTesterEmail = "helena@desbloqueio.app";
const helenaTesterName = "Helena";
const helenaTesterStudentName = "Aluno Teste";
const helenaTesterGrade = "5º";
const helenaTesterPassword = "teste123";
const pedroTesterEmail = "pedro@desbloqueio.app";
const pedroTesterName = "Pedro";
const pedroTesterStudentName = "Aluno Teste";
const pedroTesterGrade = "5º";
const pedroTesterPassword = "teste123";
const rodneyTesterEmail = "rodney@desbloqueio.app";
const rodneyTesterName = "Rodney";
const rodneyTesterStudentName = "Aluno Teste";
const rodneyTesterGrade = "5º";
const rodneyTesterPassword = "teste123";
const maofTesterEmail = "maof@desbloqueio.app";
const maofTesterName = "Maof";
const maofTesterStudentName = "Aluno Teste";
const maofTesterGrade = "5º";
const maofTesterPassword = "teste123";
const amelidanTesterEmail = "amelidan@desbloqueio.app";
const amelidanTesterName = "Amelidan";
const amelidanTesterStudentName = "Aluno Teste";
const amelidanTesterGrade = "5º";
const amelidanTesterPassword = "teste123";
const disabledGeneratedTesterEmails = new Set([
  testerResponsibleEmail,
]);
const trackedSubjects = ["Matemática", "Português", "Ciências", "Geografia", "História", "Inglês", "Arte", "Lógica"];
const parentSubjectDisplayList = [
  { subject: "Português", label: "Português" },
  { subject: "História", label: "História" },
  { subject: "Geografia", label: "Geografia" },
  { subject: "Ciências", label: "Biologia" },
  { subject: "Matemática", label: "Química" },
  { subject: "Lógica", label: "Física" },
  { subject: "Inglês", label: "Inglês" },
  { subject: "Arte", label: "Artes" },
];
const supportedStudentGrades = ["3º", "4º", "5º", "6º", "7º", "8º", "9º"];
const postLoginOnlyMode = true;
const staticParentPrototypeMode = true;
let parentalControlStandaloneOpen = false;
let managedAccessProfile = null;
let activeProfileUnsubscribe = null;
let activeProfileEmail = "";
let managedAccessProfileUnsubscribe = null;

const splashScreen = document.querySelector("#splashScreen");
const childView = document.querySelector("#childView");
const parentView = document.querySelector("#parentView");
const historyView = document.querySelector("#historyView");
const responsibleEntryView = document.querySelector("#responsibleEntryView");
const dashboardSelectorView = document.querySelector("#dashboardSelectorView");
const testStatusView = document.querySelector("#testStatusView");
const switchButtons = document.querySelectorAll(".switch-button");
const viewTargetButtons = document.querySelectorAll("[data-view-target]");
const initialSetupGate = document.querySelector("#initialSetupGate");
const initialSetupForm = document.querySelector("#initialSetupForm");
const responsibleNameInput = document.querySelector("#responsibleNameInput");
const responsibleEmailInput = document.querySelector("#responsibleEmailInput");
const studentNameInput = document.querySelector("#studentNameInput");
const setupGradeSelect = document.querySelector("#setupGradeSelect");
const setupPasswordInput = document.querySelector("#setupPasswordInput");
const setupPasswordConfirmInput = document.querySelector("#setupPasswordConfirmInput");
const initialSetupError = document.querySelector("#initialSetupError");
const backToLoginFromSetupButton = document.querySelector("#backToLoginFromSetupButton");
const loginGate = document.querySelector("#loginGate");
const loginForm = document.querySelector("#loginForm");
const loginEmailInput = document.querySelector("#loginEmailInput");
const loginPasswordInput = document.querySelector("#loginPasswordInput");
const loginError = document.querySelector("#loginError");
const loginRecognizedHint = document.querySelector("#loginRecognizedHint");
const loginWithGoogleButton = document.querySelector("#loginWithGoogleButton");
const openSetupFromLoginButton = document.querySelector("#openSetupFromLoginButton");
const profileMenuButton = document.querySelector("#profileMenuButton");
const profileMenuOverlay = document.querySelector("#profileMenuOverlay");
const profileMenuPanel = document.querySelector("#profileMenuPanel");
const profileDetailsPanel = document.querySelector("#profileDetailsPanel");
const openSummaryButton = document.querySelector("#openSummaryButton");
const openPlansButton = document.querySelector("#openPlansButton");
const openStandardVersionButton = document.querySelector("#openStandardVersionButton");
const openAiVersionButton = document.querySelector("#openAiVersionButton");
const openStudyGuidedDashboardButton = document.querySelector("#openStudyGuidedDashboardButton");
const openTestsDashboardButton = document.querySelector("#openTestsDashboardButton");
const openParentalControlButton = document.querySelector("#openParentalControlButton");
const openSupportButton = document.querySelector("#openSupportButton");
const profileMenuExitButton = document.querySelector("#profileMenuExitButton");
const closeCadastroPanelButton = document.querySelector("#closeCadastroPanelButton");
const menuSummaryDate = document.querySelector("#menuSummaryDate");
const menuSummaryTime = document.querySelector("#menuSummaryTime");
const menuSummaryRounds = document.querySelector("#menuSummaryRounds");
const menuSummaryBest = document.querySelector("#menuSummaryBest");
const menuSummaryNeeds = document.querySelector("#menuSummaryNeeds");
const menuSummaryFocus = document.querySelector("#menuSummaryFocus");
const accessStatusHint = document.querySelector("#accessStatusHint");
const accessProfileValue = document.querySelector("#accessProfileValue");
const accessStatusValue = document.querySelector("#accessStatusValue");
const accessToggleButton = document.querySelector("#accessToggleButton");
const accessPanel = document.querySelector(".access-panel");
const phoneFrame = document.querySelector(".phone-frame");
const parentGreeting = document.querySelector("#parentGreeting");
const educationGate = document.querySelector("#educationGate");
const unlockedState = document.querySelector("#unlockAwardState");
const unlockAwardOverlay = document.querySelector("#unlockAwardOverlay");
const unlockMessage = document.querySelector("#unlockAwardMessage");
const unlockCountdown = document.querySelector("#unlockAwardCountdown");
const stepLine = document.querySelector("#stepLine");
const gateTitle = document.querySelector("#gateTitle");
const gateSubtitle = document.querySelector("#gateSubtitle");
const scoreSuffix = document.querySelector("#scoreSuffix");
const openCountdownAppButton = document.querySelector("#openCountdownAppButton");
const closeCountdownButton = document.querySelector("#unlockAwardActionButton");
const gradeLabel = document.querySelector("#gradeLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const progressTrack = document.querySelector("#progressTrack");
const progressBar = document.querySelector("#progressBar");
const questionCounter = document.querySelector("#questionCounter");
const supportText = document.querySelector("#supportText");
const questionText = document.querySelector("#questionText");
const welcomeInfoButton = document.querySelector("#welcomeInfoButton");
const welcomeInfoTooltip = document.querySelector("#welcomeInfoTooltip");
const welcomeStartLink = document.querySelector("#welcomeStartLink");
const welcomeActionPanel = document.querySelector("#welcomeActionPanel");
const welcomeUnlockTimeSelect = document.querySelector("#welcomeUnlockTimeSelect");
const welcomeGradeSelect = document.querySelector("#welcomeGradeSelect");
const welcomeApplyTestButton = document.querySelector("#welcomeApplyTestButton");
const answerList = document.querySelector("#answerList");
const feedback = document.querySelector("#feedback");
const explanationBox = document.querySelector("#explanationBox");
const nextButton = document.querySelector("#nextButton");
const actionRow = document.querySelector("#actionRow");
const clearResultsButton = document.querySelector("#clearResultsButton");
const manualUnlockButton = document.querySelector("#manualUnlockButton");
const stopTestButton = document.querySelector("#stopTestButton");
const lastScore = document.querySelector("#lastScore");
const roundCount = document.querySelector("#roundCount");
const bestSubject = document.querySelector("#bestSubject");
const resultsList = document.querySelector("#resultsList");
const historyCloseButton = document.querySelector("#historyCloseButton");
const questionBankStatus = document.querySelector("#questionBankStatus");
const importCurrentGradeButton = document.querySelector("#importCurrentGradeButton");
const questionBankPreviewShell = document.querySelector("#questionBankPreviewShell");
const questionBankPreviewButton = document.querySelector("#questionBankPreviewButton");
const questionBankPreviewPanel = document.querySelector("#questionBankPreviewPanel");
const questionBankPreviewTitleText = document.querySelector("#questionBankPreviewTitleText");
const questionBankPreviewContent = document.querySelector("#questionBankPreviewContent");
const questionFileInput = document.querySelector("#questionFileInput");
const studyGuidedUploadPreview = document.querySelector("#studyGuidedUploadPreview");
const studyGuidedUploadSlots = Array.from(document.querySelectorAll(".study-guided-upload-slot"));
const studyGuidedUploadPreviewImages = [
  document.querySelector("#studyGuidedUploadPreviewImage1"),
  document.querySelector("#studyGuidedUploadPreviewImage2"),
  document.querySelector("#studyGuidedUploadPreviewImage3"),
].filter(Boolean);
const studyGuidedUploadRemoveButtons = Array.from(document.querySelectorAll(".study-guided-upload-remove"));
const studyGuidedExplanationPanel = document.querySelector("#studyGuidedExplanationPanel");
const studyGuidedExplanationBody = document.querySelector("#studyGuidedExplanationBody");
const parentDashboardBackButton = document.querySelector("#parentDashboardBackButton");
const dashboardParentalControlToggle = document.querySelector("#dashboardParentalControlToggle");
const dashboardParentalControlStatus = document.querySelector("#dashboardParentalControlStatus");
const parentalControlView = document.querySelector("#parentalControlView");
const parentalControlCloseButton = document.querySelector("#parentalControlCloseButton");
const parentalControlMainToggle = document.querySelector("#parentalControlMainToggle");
const parentalControlMainStatus = document.querySelector("#parentalControlMainStatus");
const parentalControlBlockAllToggle = document.querySelector("#parentalControlBlockAllToggle");
const parentalControlReturnToggle = document.querySelector("#parentalControlReturnToggle");
const parentalControlSummaryText = document.querySelector("#parentalControlSummaryText");
const parentalBlockedAppsList = document.querySelector("#parentalBlockedAppsList");
const parentalScheduleModeSelect = document.querySelector("#parentalScheduleModeSelect");
const parentalScheduleStartInput = document.querySelector("#parentalScheduleStartInput");
const parentalScheduleEndInput = document.querySelector("#parentalScheduleEndInput");
const parentalWeekdayList = document.querySelector("#parentalWeekdayList");
const parentalExceptionsList = document.querySelector("#parentalExceptionsList");
const parentalProtectionLevelGroup = document.querySelector("#parentalProtectionLevelGroup");
const parentalAttemptsToday = document.querySelector("#parentalAttemptsToday");
const parentalBlockedAppsCount = document.querySelector("#parentalBlockedAppsCount");
const parentalLastAttempt = document.querySelector("#parentalLastAttempt");
const setupWarningOverlay = document.querySelector("#setupWarningOverlay");
const setupWarningModal = document.querySelector("#setupWarningModal");
const setupWarningMessage = document.querySelector("#setupWarningMessage");
const setupWarningConfirmButton = document.querySelector("#setupWarningConfirmButton");
const aiGenerationOverlay = document.querySelector("#aiGenerationOverlay");
const aiGenerationModal = document.querySelector("#aiGenerationModal");
const aiGenerationGrade = document.querySelector("#aiGenerationGrade");
const aiGenerationSubjects = document.querySelector("#aiGenerationSubjects");
const aiGenerationUnlockTime = document.querySelector("#aiGenerationUnlockTime");
const aiGenerationCountTrigger = document.querySelector("#aiGenerationCountTrigger");
const aiGenerationCountMenu = document.querySelector("#aiGenerationCountMenu");
const aiGenerationCount = document.querySelector("#aiGenerationCount");
const aiGenerationTypeChoice = document.querySelector("#aiGenerationTypeChoice");
const aiGenerationTypeText = document.querySelector("#aiGenerationTypeText");
const aiGenerationKnowledge = document.querySelector("#aiGenerationKnowledge");
const aiGenerationCancelButton = document.querySelector("#aiGenerationCancelButton");
const aiGenerationContinueButton = document.querySelector("#aiGenerationContinueButton");
const testLogoutButton = document.querySelector("#testLogoutButton");
const testLogoutOverlay = document.querySelector("#testLogoutOverlay");
const testLogoutModal = document.querySelector("#testLogoutModal");
const testLogoutPasswordInput = document.querySelector("#testLogoutPasswordInput");
const testLogoutError = document.querySelector("#testLogoutError");
const testLogoutCancelButton = document.querySelector("#testLogoutCancelButton");
const testLogoutConfirmButton = document.querySelector("#testLogoutConfirmButton");
const studentGradeDisplay = document.querySelector("#studentGradeDisplay");
const studentGradeDisplayUpper = document.querySelector("#studentGradeDisplayUpper");
const unlockTimeSelect = document.querySelector("#unlockTimeSelect");
const studentGradePrototypeTrigger = document.querySelector("#studentGradePrototypeTrigger");
const studentGradePrototypeMenu = document.querySelector("#studentGradePrototypeMenu");
const studentGradeUpperPrototypeTrigger = document.querySelector("#studentGradeUpperPrototypeTrigger");
const studentGradeUpperPrototypeMenu = document.querySelector("#studentGradeUpperPrototypeMenu");
const unlockTimePrototypeTrigger = document.querySelector("#unlockTimePrototypeTrigger");
const unlockTimePrototypeMenu = document.querySelector("#unlockTimePrototypeMenu");
const aiDashboardConfig = document.querySelector("#aiDashboardConfig");
const aiDashboardCountTrigger = document.querySelector("#aiDashboardCountTrigger");
const aiDashboardCountMenu = document.querySelector("#aiDashboardCountMenu");
const aiDashboardCount = document.querySelector("#aiDashboardCount");
const aiDashboardTypeChoice = document.querySelector("#aiDashboardTypeChoice");
const aiDashboardTypeText = document.querySelector("#aiDashboardTypeText");
const aiDashboardKnowledge = document.querySelector("#aiDashboardKnowledge");
const responsibleEntryPasswordInput = document.querySelector("#responsibleEntryPasswordInput");
const responsibleEntryUnlockButton = document.querySelector("#responsibleEntryUnlockButton");
const responsibleEntryError = document.querySelector("#responsibleEntryError");
const responsibleEntryExitButton = document.querySelector("#responsibleEntryExitButton");
const responsibleEntryDashboardButton = document.querySelector("#responsibleEntryDashboardButton");
const openStudyGuidedLandingButton = document.querySelector("#openStudyGuidedLandingButton");
const openTestsLandingButton = document.querySelector("#openTestsLandingButton");
const responsibleAssessmentDate = document.querySelector("#responsibleAssessmentDate");
const responsibleAssessmentUnlockTime = document.querySelector("#responsibleAssessmentUnlockTime");
const responsibleAssessmentSubjects = document.querySelector("#responsibleAssessmentSubjects");
const responsibleAssessmentCorrect = document.querySelector("#responsibleAssessmentCorrect");
const responsibleAssessmentWrong = document.querySelector("#responsibleAssessmentWrong");
const responsibleAssessmentTotal = document.querySelector("#responsibleAssessmentTotal");
const responsibleAssessmentPassed = document.querySelector("#responsibleAssessmentPassed");
const responsibleAssessmentScore = document.querySelector("#responsibleAssessmentScore");
const responsibleSubjectBreakdownTrigger = document.querySelector("#responsibleSubjectBreakdownTrigger");
const responsibleSubjectBreakdownPanel = document.querySelector("#responsibleSubjectBreakdownPanel");
const responsibleAssessmentAverage = document.querySelector("#responsibleAssessmentAverage");
const testStatusCountdown = document.querySelector("#testStatusCountdown");
const testStatusStopButton = document.querySelector("#testStatusStopButton");
let prototypeImportStatusMessage = "";
let prototypeCycleStatusMessage = "";
let prototypeSelectedGradeGroup = "";
let prototypeDemoModeActive = false;
let prototypeSelectionsInitialized = false;
let prototypeTimeExplicitlySelected = false;
let responsibleEntryAuthorized = false;
let fileImportPickerActive = false;
const studyGuidedUploadPreviewStorageKey = "smartUnlockStudyGuidedUploadPreview";
const studyGuidedExplanationStorageKey = "smartUnlockStudyGuidedExplanation";
let studyGuidedUploadPreviewDataUrls = parseStudyGuidedUploadPreviewStorage(
  localStorage.getItem(studyGuidedUploadPreviewStorageKey),
);
let studyGuidedExplanationState = parseStudyGuidedExplanationStorage(
  localStorage.getItem(studyGuidedExplanationStorageKey),
);
const optionalLibsState = {
  xlsxLoading: false,
  firebaseLoading: false,
};

function isClipboardUnlocked(target) {
  return target?.dataset?.clipboardUnlocked === "true";
}

function blockSelectionAndClipboard(event) {
  if (isClipboardUnlocked(event.currentTarget)) {
    return;
  }
  event.preventDefault();
}

function blockClipboardShortcuts(event) {
  if (isClipboardUnlocked(event.currentTarget)) {
    return;
  }
  const key = String(event.key || "").toLowerCase();
  const hasModifier = event.ctrlKey || event.metaKey;
  if (hasModifier && ["v", "c", "x", "a", "insert"].includes(key)) {
    event.preventDefault();
  }
  if (event.shiftKey && key === "insert") {
    event.preventDefault();
  }
}

function hardenExplanationBox() {
  if (!explanationBox || explanationBox.dataset.hardened === "true") return;
  explanationBox.dataset.hardened = "true";
  explanationBox.dataset.clipboardUnlocked = "false";
  explanationBox.setAttribute("draggable", "false");
  ["paste", "copy", "cut", "contextmenu", "selectstart"].forEach((eventName) => {
    explanationBox.addEventListener(eventName, blockSelectionAndClipboard);
  });
  explanationBox.addEventListener("keydown", blockClipboardShortcuts);
}

hardenExplanationBox();

function setExplanationCopyUnlocked(enabled) {
  if (!explanationBox) return;
  explanationBox.dataset.clipboardUnlocked = enabled ? "true" : "false";
  explanationBox.classList.toggle("copy-enabled", enabled);
}

function setDissertativeInputClipboardUnlocked(enabled) {
  const input = answerList.querySelector(".answer-text-input");
  if (!input) return;
  input.dataset.clipboardUnlocked = enabled ? "true" : "false";
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Script sem origem."));
      return;
    }

    const existing = document.querySelector(`script[data-optional-src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.optionalSrc = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensureXlsxLibrary() {
  if (window.XLSX) return true;
  if (optionalLibsState.xlsxLoading) return false;

  const src = window.__SMART_UNLOCK_OPTIONAL_LIBS__?.xlsx;
  if (!src) return false;

  optionalLibsState.xlsxLoading = true;
  try {
    await loadScriptOnce(src);
    return Boolean(window.XLSX);
  } catch (_) {
    return false;
  } finally {
    optionalLibsState.xlsxLoading = false;
  }
}

async function ensureFirebaseLibraries() {
  if (!remoteProfilesEnabled) return false;
  if (window.firebase?.firestore && window.firebase?.auth) return true;
  if (optionalLibsState.firebaseLoading) return false;

  const firebaseAppSrc = window.__SMART_UNLOCK_OPTIONAL_LIBS__?.firebaseApp;
  const firebaseFirestoreSrc = window.__SMART_UNLOCK_OPTIONAL_LIBS__?.firebaseFirestore;
  const firebaseAuthSrc = window.__SMART_UNLOCK_OPTIONAL_LIBS__?.firebaseAuth;
  if (!firebaseAppSrc || !firebaseFirestoreSrc || !firebaseAuthSrc) return false;

  optionalLibsState.firebaseLoading = true;
  try {
    await loadScriptOnce(firebaseAppSrc);
    await loadScriptOnce(firebaseFirestoreSrc);
    await loadScriptOnce(firebaseAuthSrc);
    return Boolean(window.firebase?.firestore && window.firebase?.auth);
  } catch (_) {
    return false;
  } finally {
    optionalLibsState.firebaseLoading = false;
  }
}

function getFirestoreInstance() {
  if (!remoteProfilesEnabled) return null;
  if (firestoreDb !== null) return firestoreDb;

  const firebaseConfig = window.TELA_INTELIGENTE_FIREBASE_CONFIG;
  if (!window.firebase || !firebaseConfig || !firebaseConfig.projectId) {
    return null;
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  firestoreDb = window.firebase.firestore();
  return firestoreDb;
}

function getFirebaseAuthInstance() {
  if (!remoteProfilesEnabled) return null;
  const firebaseConfig = window.TELA_INTELIGENTE_FIREBASE_CONFIG;
  if (!window.firebase || !window.firebase.auth || !firebaseConfig || !firebaseConfig.projectId) {
    return null;
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  return window.firebase.auth();
}

void ensureFirebaseLibraries();

function getProfileDocId(email) {
  return String(email || "").trim().toLowerCase();
}

function isDisabledGeneratedTesterEmail(email) {
  return disabledGeneratedTesterEmails.has(getProfileDocId(email));
}

function getProfilesCollection() {
  if (!remoteProfilesEnabled) return null;
  const db = getFirestoreInstance();
  if (!db) return null;
  return db.collection(firestoreProfilesCollection);
}

function getCurrentProfileEmail() {
  return getProfileDocId(getInitialSetup()?.responsibleEmail);
}

function getParentDashboardMode() {
  return localStorage.getItem(parentDashboardModeStorageKey) === "study-guided"
    ? "study-guided"
    : "tests";
}

function setParentDashboardMode(mode) {
  const normalizedMode = mode === "study-guided" ? "study-guided" : "tests";
  localStorage.setItem(parentDashboardModeStorageKey, normalizedMode);
}

function getStudyGuidedKnowledge() {
  return String(localStorage.getItem(studyGuidedKnowledgeStorageKey) || "").trim();
}

function setStudyGuidedKnowledge(value) {
  const normalizedValue = String(value || "");
  if (!normalizedValue.trim()) {
    localStorage.removeItem(studyGuidedKnowledgeStorageKey);
    return;
  }
  localStorage.setItem(studyGuidedKnowledgeStorageKey, normalizedValue);
}

function getStoredActiveSessionEmail() {
  return getProfileDocId(localStorage.getItem(activeSessionEmailStorageKey) || "");
}

function storeActiveSessionEmail(email) {
  const normalizedEmail = getProfileDocId(email);
  if (!normalizedEmail) {
    localStorage.removeItem(activeSessionEmailStorageKey);
    return;
  }
  localStorage.setItem(activeSessionEmailStorageKey, normalizedEmail);
}

function clearActiveSessionEmail() {
  localStorage.removeItem(activeSessionEmailStorageKey);
}

function setBypassLoginReturnOnce() {
  localStorage.setItem(bypassLoginReturnStorageKey, "1");
}

function consumeBypassLoginReturnOnce() {
  const shouldBypass = localStorage.getItem(bypassLoginReturnStorageKey) === "1";
  if (shouldBypass) {
    localStorage.removeItem(bypassLoginReturnStorageKey);
  }
  return shouldBypass;
}

function clearActiveProfileSubscription() {
  if (typeof activeProfileUnsubscribe === "function") {
    activeProfileUnsubscribe();
  }
  activeProfileUnsubscribe = null;
  activeProfileEmail = "";
}

function clearManagedAccessProfileSubscription() {
  if (typeof managedAccessProfileUnsubscribe === "function") {
    managedAccessProfileUnsubscribe();
  }
  managedAccessProfileUnsubscribe = null;
}

function setWelcomeInfoOpen(isOpen) {
  if (!welcomeInfoButton) return;
  welcomeInfoButton.classList.toggle("is-open", Boolean(isOpen));
  welcomeInfoButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function buildRemoteProfileSnapshot(overrides = {}) {
  const setup = getInitialSetup();
  const responsibleEmail = getProfileDocId(overrides.responsibleEmail || setup?.responsibleEmail);
  if (!responsibleEmail) return null;

  const normalizedGrade = normalizeSupportedStudentGrade(overrides.grade || setup?.grade || getSelectedGrade());

  return {
    responsibleName: overrides.responsibleName ?? setup?.responsibleName ?? "",
    responsibleEmail,
    studentName: overrides.studentName ?? setup?.studentName ?? "",
    grade: normalizedGrade,
    accessEnabled: overrides.accessEnabled ?? (setup?.accessEnabled !== false),
    adminDeviceId: overrides.adminDeviceId ?? getAdminOwnerDeviceId(),
    parentPassword: overrides.parentPassword ?? getParentPassword(),
    unlockMinutes: Number(overrides.unlockMinutes ?? getUnlockMinutes()),
    questionBank: normalizeQuestionBank(overrides.questionBank ?? getStoredQuestionBank()),
    results: Array.isArray(overrides.results) ? overrides.results.slice(0, 20) : getResults().slice(0, 20),
    performanceByYear: overrides.performanceByYear ?? getPerformanceStore(),
    activeSubjectsByGrade: overrides.activeSubjectsByGrade ?? getActiveSubjectsStore(),
    questionsUpdatedAt: String(overrides.questionsUpdatedAt ?? (localStorage.getItem("smartUnlockQuestionsUpdatedAt") || "")),
    createdAt: overrides.createdAt ?? setup?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function applyRemoteProfileSnapshot(snapshot) {
  if (!snapshot || !snapshot.responsibleEmail) return;

  const normalizedGrade = normalizeSupportedStudentGrade(snapshot.grade);

  localStorage.setItem(
    initialSetupStorageKey,
    JSON.stringify({
      responsibleName: snapshot.responsibleName || "",
      responsibleEmail: getProfileDocId(snapshot.responsibleEmail),
      studentName: snapshot.studentName || "",
      grade: normalizedGrade,
      accessEnabled: snapshot.accessEnabled !== false,
      createdAt: snapshot.createdAt || new Date().toISOString(),
    }),
  );

  if (snapshot.parentPassword) {
    localStorage.setItem(parentPasswordStorageKey, snapshot.parentPassword);
  }

  localStorage.setItem("smartUnlockStudentGrade", normalizedGrade);
  localStorage.setItem("smartUnlockMinutes", String(Number(snapshot.unlockMinutes || 15)));

  if (snapshot.questionBank) {
    saveQuestionBank(snapshot.questionBank, { skipRemoteSync: true });
  }

  localStorage.setItem("smartUnlockResults", JSON.stringify(Array.isArray(snapshot.results) ? snapshot.results.slice(0, 20) : []));
  localStorage.setItem(
    "smartUnlockPerformanceByYear",
    JSON.stringify(snapshot.performanceByYear || getPerformanceStore()),
  );
  localStorage.setItem(
    activeSubjectsStorageKey,
    JSON.stringify(snapshot.activeSubjectsByGrade || getActiveSubjectsStore()),
  );

  if (snapshot.adminDeviceId) {
    localStorage.setItem(adminOwnerDeviceStorageKey, String(snapshot.adminDeviceId));
  } else {
    localStorage.removeItem(adminOwnerDeviceStorageKey);
  }

  if (snapshot.questionsUpdatedAt) {
    localStorage.setItem("smartUnlockQuestionsUpdatedAt", String(snapshot.questionsUpdatedAt));
  }

  questions = loadQuestions();
  renderParentDashboard();
  renderQuestionBankStatus();
  renderStudentGradeDisplay();
  renderImportButtonLabel();
  renderUnlockTimeSelect();
  refreshStudentGradePreview();
  renderProfileMenu();
}

async function loadRemoteProfileSnapshot(email) {
  if (!remoteProfilesEnabled) return null;
  const profiles = getProfilesCollection();
  const docId = getProfileDocId(email);
  if (!profiles || !docId) return null;

  try {
    const snapshot = await Promise.race([
      profiles.doc(docId).get(),
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("Tempo esgotado ao carregar perfil remoto.")), 3500);
      }),
    ]);
    return snapshot.exists ? snapshot.data() : null;
  } catch (_) {
    return null;
  }
}

async function saveRemoteProfileSnapshot(overrides = {}) {
  if (!remoteProfilesEnabled) return false;
  const profiles = getProfilesCollection();
  const payload = buildRemoteProfileSnapshot(overrides);
  if (!profiles || !payload) return false;

  await profiles.doc(getProfileDocId(payload.responsibleEmail)).set(payload, { merge: true });
  return true;
}

async function saveRemoteProfileSnapshotForProfile(profile) {
  if (!remoteProfilesEnabled) return false;
  const profiles = getProfilesCollection();
  const responsibleEmail = getProfileDocId(profile?.responsibleEmail);
  if (!profiles || !responsibleEmail) return false;

  await profiles.doc(responsibleEmail).set(
    {
      responsibleName: profile.responsibleName || "",
      responsibleEmail,
      studentName: profile.studentName || "",
      grade: normalizeGradeLabel(profile.grade || "5º"),
      accessEnabled: profile.accessEnabled !== false,
      adminDeviceId: profile.adminDeviceId || "",
      parentPassword: profile.parentPassword || defaultParentPassword,
      unlockMinutes: Number(profile.unlockMinutes || getUnlockMinutes()),
      questionBank: normalizeQuestionBank(profile.questionBank || getStoredQuestionBank()),
      results: Array.isArray(profile.results) ? profile.results.slice(0, 20) : [],
      performanceByYear: profile.performanceByYear || getPerformanceStore(),
      activeSubjectsByGrade: profile.activeSubjectsByGrade || getActiveSubjectsStore(),
      questionsUpdatedAt: String(profile.questionsUpdatedAt || ""),
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}

function forceReturnToLogin(message = "") {
  clearRetryRestartTimer();
  clearUnlockTimer();
  setCycleActive(false);
  setTestModeEnabled(false);
  clearActiveSessionEmail();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  unlockedState.hidden = true;
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  closeProfileMenu(false);
  setActiveView("child");
  showLoginGate();
  if (message) {
    loginError.textContent = message;
  }
  if (window.AndroidBridge?.stopTestLock) {
    window.AndroidBridge.stopTestLock();
  }
}

function subscribeToActiveProfile(email) {
  if (!remoteProfilesEnabled) return;
  const normalizedEmail = getProfileDocId(email);
  const profiles = getProfilesCollection();
  if (!profiles || !normalizedEmail) return;
  if (activeProfileEmail === normalizedEmail && typeof activeProfileUnsubscribe === "function") return;

  clearActiveProfileSubscription();
  activeProfileEmail = normalizedEmail;
  activeProfileUnsubscribe = profiles.doc(normalizedEmail).onSnapshot((snapshot) => {
    if (!snapshot.exists) return;
    const remoteProfile = snapshot.data();
    if (!remoteProfile) return;

    const isAdminProfile = normalizedEmail === defaultResponsibleEmail;
    if (!isAdminProfile && remoteProfile.accessEnabled === false) {
      forceReturnToLogin("Acesso desativado para este cadastro.");
      return;
    }

    applyRemoteProfileSnapshot(remoteProfile);
    if (normalizedEmail === testerResponsibleEmail) {
      managedAccessProfile = remoteProfile;
      renderAccessControl();
    }
  });
}

function subscribeToManagedAccessProfile() {
  if (!remoteProfilesEnabled) return;
  const profiles = getProfilesCollection();
  if (!profiles || managedAccessProfileUnsubscribe) return;

  managedAccessProfileUnsubscribe = profiles.doc(testerResponsibleEmail).onSnapshot((snapshot) => {
    if (!snapshot.exists) return;
    const remoteProfile = snapshot.data();
    if (!remoteProfile) return;
    managedAccessProfile = remoteProfile;
    renderAccessControl();
  });
}

function mapFirestoreQuestion(docData) {
  const grade = normalizeGradeLabel(docData.grade || docData.year || docData.ano);
  const rawCorrect = String(docData.correct || docData.correta || docData.gabarito || "").trim();
  const explicitType = String(docData.type || docData.tipo || docData.answerMode || "").trim().toLowerCase();
  const isDissertative = /dissert|texto|aberta/i.test(explicitType) || (!!rawCorrect && !/^[A-D]$/i.test(rawCorrect));
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
    options: isDissertative ? [] : options,
    correct: isDissertative ? "" : rawCorrect.toUpperCase(),
    answerMode: isDissertative ? "text" : "choice",
    expectedAnswer: isDissertative ? rawCorrect : "",
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
      if (isDissertativeQuestion(question)) {
        return question.grade && question.text && getQuestionExpectedAnswers(question).length > 0;
      }
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

function isDissertativeQuestion(question) {
  return question?.answerMode === "text";
}

function normalizeAnswerComparisonText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const semanticFamilies = {
  eliminar: ["fim", "final", "eliminacao", "eliminar", "extincao", "extinguir", "acabar", "acabado", "termino", "encerrar", "encerramento"],
  estado: ["governo", "estatal", "estado"],
  autoritario: ["autoridade", "autoritarismo", "autoritario", "autoritarios", "autoritaria", "autoritarias", "radicais", "ditatorial", "ditadura"],
  militar: ["militar", "militares", "forca", "forcas", "exercito", "armada"],
  crise: ["crise", "piora", "piorou", "quebra", "colapso"],
  economia: ["economia", "economica", "economico", "mercado", "financeira", "financeiro"],
  desemprego: ["desemprego", "desempregados", "desempregado"],
  pobreza: ["pobreza", "pobre", "miseria", "fome", "carencia"],
  instabilidade: ["medo", "inseguranca", "instabilidade", "insatisfacao", "revolta", "caos", "tensao"],
  pessoas: ["populacao", "pessoa", "pessoas", "sociedade", "cidadaos", "massa"],
  apoiar: ["apoio", "apoiar", "apoiaram", "apoiando", "aceitar", "aderir", "seguir"],
  solucao: ["solucao", "solucoes", "resposta", "alternativa"],
  democracia: ["democracia", "democratico", "democratica"],
  liberdade: ["liberdade", "livre", "livres"],
  trabalho: ["trabalho", "trabalhador", "trabalhadores", "emprego"],
  industria: ["industria", "industrial", "fabricas", "fabrica", "empresas", "empresa"],
  consumo: ["consumo", "consumir", "comprar", "compras", "comprador", "compradores"],
  agricultura: ["agricultura", "agricola", "agricultor", "agricultores", "campo"],
};

function getSemanticRepresentative(token) {
  const normalized = String(token || "").trim().toLowerCase();
  if (!normalized) return "";

  for (const [representative, variants] of Object.entries(semanticFamilies)) {
    if (representative === normalized || variants.includes(normalized)) {
      return representative;
    }
  }

  return normalized;
}

function canonicalizeAnswerToken(token) {
  const normalized = String(token || "").trim().toLowerCase();
  if (!normalized) return "";

  const singularized = normalized
    .replace(/oes$/i, "ao")
    .replace(/aes$/i, "ao")
    .replace(/res$/i, "r")
    .replace(/zes$/i, "z")
    .replace(/is$/i, "il")
    .replace(/ns$/i, "m")
    .replace(/s$/i, "");

  return getSemanticRepresentative(singularized);
}

function extractMeaningfulTokens(text) {
  const stopwords = new Set([
    "a", "ao", "aos", "as", "ate", "com", "como", "da", "das", "de", "do", "dos", "e", "ela", "ele", "em",
    "entre", "era", "esse", "essa", "esse", "esta", "este", "foi", "isso", "isto", "la", "mais", "mas",
    "na", "nas", "no", "nos", "o", "os", "ou", "para", "pela", "pelas", "pelo", "pelos", "por", "que",
    "se", "sem", "ser", "sua", "suas", "seu", "seus", "um", "uma", "muito", "muitos", "muita", "muitas",
  ]);

  return [...new Set(
    normalizeAnswerComparisonText(text)
      .split(" ")
      .map((token) => canonicalizeAnswerToken(token.trim()))
      .filter((token) => token && token.length > 2 && !stopwords.has(token)),
  )];
}

function getQuestionExpectedAnswers(question) {
  if (!question) return [];

  const explicitAnswers = Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : [];
  const expected = [question.expectedAnswer, ...explicitAnswers]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);

  return [...new Set(expected)];
}

function computeSimilarityScore(input, expected, questionText = "") {
  const normalizedInput = normalizeAnswerComparisonText(input);
  const normalizedExpected = normalizeAnswerComparisonText(expected);
  if (!normalizedInput || !normalizedExpected) return 0;
  if (normalizedInput === normalizedExpected) return 1;
  if (normalizedInput.includes(normalizedExpected) || normalizedExpected.includes(normalizedInput)) {
    return 0.92;
  }

  const inputTokens = extractMeaningfulTokens(normalizedInput);
  const expectedTokens = extractMeaningfulTokens(normalizedExpected);
  const questionTokens = extractMeaningfulTokens(questionText);
  if (!inputTokens.length || !expectedTokens.length) return 0;

  const sharedTokens = expectedTokens.filter((token) => inputTokens.includes(token));
  const expectedCoverage = sharedTokens.length / Math.max(expectedTokens.length, 1);
  const inputCoverage = sharedTokens.length / Math.max(inputTokens.length, 1);
  const f1Like = (2 * expectedCoverage * inputCoverage) / Math.max(expectedCoverage + inputCoverage, 0.0001);
  const questionOverlapCount = questionTokens.filter((token) => inputTokens.includes(token)).length;
  const questionOverlap = questionOverlapCount / Math.max(Math.min(questionTokens.length, 6), 1);
  const minimumConceptMatches = Math.max(1, Math.min(3, Math.ceil(expectedTokens.length * 0.34)));

  if (sharedTokens.length >= 4 && expectedCoverage >= 0.4) {
    return Math.max(f1Like, 0.8);
  }

  if (sharedTokens.length >= 3 && expectedCoverage >= 0.34) {
    return Math.max(f1Like, 0.74);
  }

  if (sharedTokens.length >= 2 && expectedCoverage >= 0.45 && inputCoverage >= 0.45) {
    return Math.max(f1Like, 0.73);
  }

  if (sharedTokens.length >= minimumConceptMatches && expectedCoverage >= 0.3 && questionOverlap >= 0.12) {
    return Math.max(f1Like, 0.72);
  }

  if (sharedTokens.length >= Math.max(1, minimumConceptMatches - 1) && expectedCoverage >= 0.28 && questionOverlap >= 0.22) {
    return Math.max(f1Like, 0.68);
  }

  return Math.max(expectedCoverage, inputCoverage * 0.7, f1Like, questionOverlap * 0.45);
}

function validateDissertativeAnswer(question, answer) {
  const candidates = getQuestionExpectedAnswers(question);
  if (!candidates.length) return false;

  return candidates.some((candidate) => computeSimilarityScore(answer, candidate, question?.text || "") >= 0.64);
}

function syncNativeTestState() {
  if (!window.SmartUnlockNative) {
    return;
  }

  const unlockedUntil = String(Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0"));
  const active = isTestModeEnabled();
  const settings = getParentalControlSettings();
  const nativeParentalEnabled = active ? true : Boolean(settings.enabledDuringTest);
  const nativeReturnToTestEnabled = active ? true : Boolean(settings.returnToTest);
  if (typeof window.SmartUnlockNative.syncProtectionState === "function") {
    window.SmartUnlockNative.syncProtectionState(
      active,
      unlockedUntil,
      nativeParentalEnabled,
      nativeReturnToTestEnabled
    );
    return;
  }
  if (typeof window.SmartUnlockNative.syncTestState === "function") {
    window.SmartUnlockNative.syncTestState(active, unlockedUntil);
  }
}

window.__smartUnlockSendNativeConfig = syncNativeTestState;

function setTestModeEnabled(enabled) {
  localStorage.setItem("smartUnlockTestActive", enabled ? "true" : "false");
  syncNativeTestState();
}

function setCycleActive(enabled) {
  localStorage.setItem(cycleActiveStorageKey, enabled ? "true" : "false");
}

function isCycleActive() {
  return localStorage.getItem(cycleActiveStorageKey) === "true";
}

function shouldForceResumeTest() {
  return localStorage.getItem(forceResumeTestStorageKey) === "true";
}

function resetViewportPosition() {
  const resetNow = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (educationGate) {
      educationGate.scrollTop = 0;
    }
  };

  resetNow();
  window.requestAnimationFrame(() => {
    resetNow();
    window.setTimeout(resetNow, 60);
  });
}

function clearAppClosingTransition() {
  document.body.classList.remove("app-closing-transition");
}

function renderIdleStudentState() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  clearAppClosingTransition();
  setCycleActive(false);
  localStorage.removeItem(forceResumeTestStorageKey);
  localStorage.removeItem("smartUnlockUnlockedUntil");
  localStorage.removeItem(unlockAwardPendingStorageKey);
  prototypeCycleStatusMessage = "";
  renderQuestionBankStatus();
  document.body.classList.remove("test-modal-active");
  document.body.classList.remove("unlock-award-active");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  resetViewportPosition();
  syncNativeTestState();
}

function prepareInitialUiShell() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  clearResponsibleEntryForm();
  clearAppClosingTransition();
  document.body.classList.remove("test-modal-active");
  document.body.classList.remove("unlock-award-active");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
}

function hasOngoingProtectedCycle() {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  return shouldForceResumeTest() || isTestModeEnabled() || hasPendingUnlockAward() || unlockedUntil > Date.now();
}

function resumeProtectedCycleAfterBoot() {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  if (shouldForceResumeTest()) {
    setCycleActive(true);
    setTestModeEnabled(true);
    startOverlayRound();
    return;
  }

  if (unlockedUntil > Date.now() || hasPendingUnlockAward() || isTestModeEnabled()) {
    if (unlockedUntil > Date.now() || hasPendingUnlockAward()) {
      setCycleActive(true);
      setTestModeEnabled(true);
      scheduleOverlayReturn();
      startUnlockCountdown();
    }
    hideLoginGate();
    setActiveView(postLoginOnlyMode ? "parent" : "child");
    restoreUnlockState();
    return;
  }
}

function showLockedStudentGate() {
  if (postLoginOnlyMode) {
    document.body.classList.add("test-modal-active");
  }
  phoneFrame.classList.remove("screen-free");
  educationGate.hidden = false;
  unlockedState.hidden = true;
  resetViewportPosition();
}

function closePrototypeTestModal() {
  document.body.classList.remove("test-modal-active");
  document.body.classList.remove("unlock-award-active");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  syncNativeTestState();
}

function getUnlockAwardMessage() {
  return `Parabéns! Você ganhou ${formatMinutesLabel(getUnlockMinutes())} para usar o celular.`;
}

function hasPendingUnlockAward() {
  return localStorage.getItem(unlockAwardPendingStorageKey) === "true";
}

function showUnlockAwardScreen() {
  document.body.classList.add("unlock-award-active");
  phoneFrame.classList.add("screen-free");
  educationGate.hidden = true;
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = false;
  }
  unlockMessage.textContent = getUnlockAwardMessage();
  if (hasActiveUnlockWindow()) {
    updateUnlockCountdown();
  } else {
    unlockCountdown.textContent = "";
  }
  unlockedState.hidden = false;
}

function activateUnlockedUsage() {
  const unlockedUntil = Date.now() + getUnlockMinutes() * 60 * 1000;
  setCycleActive(true);
  localStorage.setItem("smartUnlockUnlockedUntil", String(unlockedUntil));
  localStorage.removeItem(unlockAwardPendingStorageKey);
  prototypeCycleStatusMessage = "";
  renderQuestionBankStatus();
  unlockMessage.textContent = getUnlockAwardMessage();
  updateUnlockCountdown();
  scheduleOverlayReturn();
  startUnlockCountdown();
  syncNativeTestState();
}

function closeSetupWarningModal() {
  if (setupWarningOverlay) {
    setupWarningOverlay.hidden = true;
  }
  if (setupWarningModal) {
    setupWarningModal.hidden = true;
  }
}

function openSetupWarningModal(message) {
  if (!setupWarningOverlay || !setupWarningModal || !setupWarningMessage) {
    window.alert(message);
    return;
  }

  setupWarningMessage.textContent = message;
  setupWarningOverlay.hidden = false;
  setupWarningModal.hidden = false;
}

function getAiGenerationDraft() {
  try {
    const rawDraft = JSON.parse(localStorage.getItem(aiGenerationDraftStorageKey) || "null");
    if (!rawDraft || typeof rawDraft !== "object") return null;
    return {
      grade: normalizeGradeLabel(rawDraft.grade || ""),
      subjects: Array.isArray(rawDraft.subjects) ? rawDraft.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean) : [],
      unlockMinutes: Math.max(1, Number(rawDraft.unlockMinutes || 0)),
      count: Math.max(1, Number(rawDraft.count || 5)),
      questionTypes: {
        choice: Boolean(rawDraft.questionTypes?.choice),
        text: Boolean(rawDraft.questionTypes?.text),
      },
      knowledge: String(rawDraft.knowledge || "").trim(),
    };
  } catch {
    return null;
  }
}

function saveAiGenerationDraft(draft) {
  localStorage.setItem(
    aiGenerationDraftStorageKey,
    JSON.stringify({
      grade: normalizeGradeLabel(draft.grade || ""),
      subjects: Array.isArray(draft.subjects) ? draft.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean) : [],
      unlockMinutes: Math.max(1, Number(draft.unlockMinutes || 0)),
      count: Math.max(1, Number(draft.count || 5)),
      questionTypes: {
        choice: Boolean(draft.questionTypes?.choice),
        text: Boolean(draft.questionTypes?.text),
      },
      knowledge: String(draft.knowledge || "").trim(),
    }),
  );
}

function getAiQuestionTypesSummary(questionTypes = {}) {
  const labels = [];
  if (questionTypes.choice) labels.push("Múltipla escolha");
  if (questionTypes.text) labels.push("Dissertativas");
  return labels.join(", ");
}

function syncAiDashboardCountTriggerLabel() {
  if (!aiDashboardCountTrigger || !aiDashboardCount) return;
  const hasExplicitSelection = aiDashboardCountTrigger.dataset.explicitSelection === "true";
  const selectedOption = aiDashboardCount.selectedOptions?.[0];
  aiDashboardCountTrigger.textContent = hasExplicitSelection
    ? (selectedOption?.textContent || "5 questões")
    : "Quantidade de Questões";
}

function closeAiDashboardCountMenu() {
  if (!aiDashboardCountMenu || !aiDashboardCountTrigger) return;
  aiDashboardCountMenu.hidden = true;
  aiDashboardCountTrigger.setAttribute("aria-expanded", "false");
  aiDashboardCountTrigger.closest(".ai-dashboard-count-shell")?.classList.remove("is-open");
}

function populateAiDashboardCountMenu() {
  if (!aiDashboardCountMenu || !aiDashboardCount) return;
  aiDashboardCountMenu.innerHTML = "";
  Array.from(aiDashboardCount.options).forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "ai-generation-count-option";
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => {
      aiDashboardCount.value = option.value;
      aiDashboardCountTrigger.dataset.explicitSelection = "true";
      syncAiDashboardCountTriggerLabel();
      persistAiDashboardDraft();
      closeAiDashboardCountMenu();
    });
    aiDashboardCountMenu.appendChild(optionButton);
  });
}

function getAiDashboardQuestionTypes() {
  return {
    choice: Boolean(aiDashboardTypeChoice?.checked),
    text: Boolean(aiDashboardTypeText?.checked),
  };
}

function renderAiDashboardConfig() {
  if (!aiDashboardConfig) return;
  const aiVersionEnabled = isAiVersionModeEnabled();
  aiDashboardConfig.hidden = !aiVersionEnabled;
  if (!aiVersionEnabled) return;

  const selectedGrade = normalizeGradeLabel(getSelectedGrade());
  const selectedSubjects = getActiveSubjectsForGrade(selectedGrade);
  const draft = getAiGenerationDraft();
  const shouldReuseDraft = draft?.grade === selectedGrade
    && JSON.stringify(draft.subjects || []) === JSON.stringify(selectedSubjects);
  const dashboardQuestionCount = shouldReuseDraft && [5, 10].includes(Number(draft?.count))
    ? Number(draft.count)
    : 5;

  if (aiDashboardCount) {
    aiDashboardCount.value = String(dashboardQuestionCount);
  }
  if (aiDashboardCountTrigger) {
    aiDashboardCountTrigger.dataset.explicitSelection = "false";
  }
  populateAiDashboardCountMenu();
  syncAiDashboardCountTriggerLabel();
  if (aiDashboardTypeChoice) {
    aiDashboardTypeChoice.checked = shouldReuseDraft ? Boolean(draft.questionTypes?.choice) : false;
  }
  if (aiDashboardTypeText) {
    aiDashboardTypeText.checked = shouldReuseDraft ? Boolean(draft.questionTypes?.text) : false;
  }
  if (aiDashboardKnowledge) {
    aiDashboardKnowledge.value = shouldReuseDraft ? draft.knowledge : "";
  }
}

function persistAiDashboardDraft() {
  if (!isAiVersionModeEnabled() || !aiDashboardConfig || aiDashboardConfig.hidden) return;
  const selectionState = getAiGenerationSelectionState();
  if (!selectionState.ok) return;

  saveAiGenerationDraft({
    grade: selectionState.grade,
    subjects: selectionState.subjects,
    unlockMinutes: selectionState.unlockMinutes,
    count: Number(aiDashboardCount?.value || 5),
    questionTypes: getAiDashboardQuestionTypes(),
    knowledge: aiDashboardKnowledge?.value || "",
  });
  renderQuestionBankStatus();
}

function buildAiGenerationRequest(draft = getAiGenerationDraft()) {
  if (!draft?.grade) return null;

  return {
    grade: normalizeGradeLabel(draft.grade),
    gradeGroup: getGradeGroupDisplayLabel(draft.grade),
    subjects: Array.isArray(draft.subjects)
      ? draft.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
      : [],
    unlockMinutes: Math.max(1, Number(draft.unlockMinutes || 0)),
    count: Math.max(1, Number(draft.count || 5)),
    questionTypes: {
      choice: Boolean(draft.questionTypes?.choice),
      text: Boolean(draft.questionTypes?.text),
    },
    knowledgeBase: String(draft.knowledge || "").trim(),
  };
}

function buildAiGenerationUserPrompt(request) {
  if (!request) return "";

  const subjectLines = request.subjects
    .map((subject) => {
      const topic = getAiKnowledgeTopicForSubject(subject, request);
      return `  - ${subject}: ${topic || "seguir apenas a matéria selecionada"}`;
    })
    .join("\n");

  return `Gere questões escolares no formato JSON abaixo.

Entrada:
- grade: "${request.grade}"
- gradeGroup: "${request.gradeGroup}"
- subjects: ${JSON.stringify(request.subjects)}
- subjectGuidance:
${subjectLines || "  - (nenhuma matéria informada)"}
- unlockMinutes: ${request.unlockMinutes}
- count: ${request.count}
- questionTypes:
  - choice: ${request.questionTypes.choice}
  - text: ${request.questionTypes.text}
- knowledgeBase:
${request.knowledgeBase || "(não informado)"}

Formato obrigatório de saída:
{
  "metadata": {
    "grade": "string",
    "subjects": ["string"],
    "count": number,
    "generatedAt": "ISO-8601 string"
  },
  "questions": [
    {
      "grade": "string",
      "subject": "string",
      "text": "string",
      "answerMode": "choice ou text",
      "options": ["string"],
      "correct": "A, B, C, D ou string vazia",
      "expectedAnswer": "string",
      "explanation": "string"
    }
  ]
}

Regras adicionais:
- O campo "grade" de cada questão deve repetir o ano recebido.
- O campo "subject" deve ser uma das matérias recebidas.
- O campo "metadata.subjects" deve repetir apenas as matérias recebidas em "subjects", sem acrescentar outras.
- O total em "questions" deve ser exatamente ${request.count}.
- Se choice=true e text=false, gerar apenas múltipla escolha.
- Se choice=false e text=true, gerar apenas dissertativas.
- Se ambos forem true, misturar os dois tipos de forma equilibrada.
- Se houver múltiplas matérias, distribuir de forma equilibrada entre elas.
- Se knowledgeBase trouxer uma linha por matéria, associar corretamente cada tema à matéria correspondente.
- Se knowledgeBase trouxer um único tema geral, adaptá-lo às matérias selecionadas.
- Nunca use uma matéria não listada em "subjects", nem como tema principal escondido dentro da questão.
- Retorne apenas JSON válido.`;
}

function buildAiGenerationPayload(draft = getAiGenerationDraft()) {
  const request = buildAiGenerationRequest(draft);
  if (!request) return null;

  return {
    request,
    prompt: {
      system: aiGenerationSystemPrompt,
      user: buildAiGenerationUserPrompt(request),
    },
  };
}

function getAiApiConfig() {
  const rawConfig = window.DESBLOQUEIO_INTELIGENTE_AI_CONFIG || {};
  return {
    providerMode: rawConfig.providerMode === "api" ? "api" : "simulated",
    baseUrl: String(rawConfig.baseUrl || "").trim(),
    generateQuestionsPath: String(rawConfig.generateQuestionsPath || "/api/ai/generate-questions").trim() || "/api/ai/generate-questions",
    generateStudyPath: String(rawConfig.generateStudyPath || "/api/ai/generate-study-explanation").trim() || "/api/ai/generate-study-explanation",
    timeoutMs: Math.max(1000, Number(rawConfig.timeoutMs || 30000)),
  };
}

function getAiGenerateQuestionsUrl(config = getAiApiConfig()) {
  if (!config.baseUrl) {
    return config.generateQuestionsPath;
  }

  return new URL(config.generateQuestionsPath, config.baseUrl).toString();
}

function getAiGenerateStudyUrl(config = getAiApiConfig()) {
  if (!config.baseUrl) {
    return config.generateStudyPath;
  }

  return new URL(config.generateStudyPath, config.baseUrl).toString();
}

async function requestAiGeneratedQuestions(payload) {
  if (!payload?.request) {
    throw new Error("O pedido da Versão IA não está pronto para gerar questões.");
  }

  const config = getAiApiConfig();
  const buildSimulatedResult = () =>
    ({
      ...parseAiGenerationResponse(buildSimulatedAiGenerationResponse(payload), payload),
      source: "simulated",
      errorMessage: "",
    });

  if (config.providerMode !== "api") {
    return buildSimulatedResult();
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), config.timeoutMs)
    : null;

  try {
    const response = await fetch(getAiGenerateQuestionsUrl(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: payload.request,
        prompt: payload.prompt,
      }),
      signal: controller?.signal,
    });

    if (!response.ok) {
      let apiMessage = "";
      try {
        const errorPayload = await response.json();
        apiMessage = String(errorPayload?.message || errorPayload?.error || "").trim();
      } catch (_) {
        apiMessage = "";
      }
      throw new Error(apiMessage || `A API respondeu com status ${response.status}.`);
    }

    const rawResponse = await response.json();
    return {
      ...parseAiGenerationResponse(rawResponse, payload),
      source: "api",
      errorMessage: "",
    };
  } catch (error) {
    console.warn("Versão IA: usando fallback simulado após falha na API.", error);
    return {
      ...buildSimulatedResult(),
      errorMessage: error instanceof Error ? error.message : "Falha desconhecida na API.",
    };
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function getStudyGuidedSelectionState() {
  const selectedGrade = staticParentPrototypeMode
    ? getExplicitPrototypeSelectedGrade()
    : getSelectedGrade();

  if (!selectedGrade) {
    return {
      ok: false,
      message: "No Estudo Guiado, escolha primeiro o ano em Fundamental I ou Fundamental II.",
      grade: "",
      subjects: [],
    };
  }

  applyCheckedSubjectsToGrade(selectedGrade);
  const activeSubjects = getActiveSubjectsForGrade(selectedGrade);

  if (!activeSubjects.length) {
    return {
      ok: false,
      message: "No Estudo Guiado, escolha primeiro a matéria antes de clicar em Gerar Estudo.",
      grade: selectedGrade,
      subjects: [],
    };
  }

  return {
    ok: true,
    message: "",
    grade: selectedGrade,
    subjects: activeSubjects,
  };
}

function buildStudyGuidedRequest(selectionState = getStudyGuidedSelectionState()) {
  if (!selectionState?.ok || !selectionState.grade) return null;

  return {
    grade: normalizeGradeLabel(selectionState.grade),
    gradeGroup: getGradeGroupDisplayLabel(selectionState.grade),
    subjects: Array.isArray(selectionState.subjects)
      ? selectionState.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
      : [],
    knowledgeBase: getStudyGuidedKnowledge(),
    uploadedImages: studyGuidedUploadPreviewDataUrls.slice(0, 3),
  };
}

function buildStudyGuidedUserPrompt(request) {
  if (!request) return "";

  const subjectLabels = request.subjects.map((subject) => getSubjectDisplayLabel(subject)).join(", ");
  const hasKnowledgeBase = Boolean(request.knowledgeBase);
  const hasUploadedImages = request.uploadedImages.length > 0;

  return `Você vai explicar um conteúdo escolar para uma aluna que está vendo esse assunto pela primeira vez.

Contexto:
- Ano: ${request.grade} ano
- Etapa: ${request.gradeGroup}
- Matéria(s): ${subjectLabels}
- Texto digitado em "Conteúdo da Matéria":
${hasKnowledgeBase ? request.knowledgeBase : "(não informado)"}
- Quantidade de imagens enviadas: ${request.uploadedImages.length}

Instruções obrigatórias:
- Mantenha o texto original do conteúdo como base.
- Faça a explicação abordando os principais pontos do conteúdo.
- Use linguagem fácil.
- Faça a explicação detalhada, sem resumo final.
- Evite termos técnicos; quando aparecerem, explique em linguagem simples.
- Organize a resposta em etapas claras.
- Use as informações do conteúdo digitado, das imagens enviadas e conhecimento web estritamente alinhado ao tema e ao ano escolar.
- Se alguma informação não estiver no material enviado e também não puder ser sustentada com segurança pelo conteúdo alinhado ao tema, diga exatamente: "Essa informação não está no material enviado".
- Não fuja das matérias selecionadas.
- Retorne apenas JSON válido.

Formato obrigatório:
{
  "metadata": {
    "grade": "string",
    "subjects": ["string"],
    "generatedAt": "ISO-8601 string",
    "usedKnowledgeBase": true,
    "usedImages": 0
  },
  "explanation": {
    "intro": "string",
    "steps": ["string"],
    "visualExample": "string"
  }
}`;
}

function buildStudyGuidedPayload(selectionState = getStudyGuidedSelectionState()) {
  const request = buildStudyGuidedRequest(selectionState);
  if (!request) return null;

  return {
    request,
    prompt: {
      system: "Você é uma IA educacional que explica conteúdos escolares com clareza, fidelidade ao material enviado e linguagem simples.",
      user: buildStudyGuidedUserPrompt(request),
    },
  };
}

function buildSimulatedStudyGuidedExplanation(payload) {
  const request = payload?.request || {};
  const subjectLabel = (request.subjects || []).map((subject) => getSubjectDisplayLabel(subject)).join(", ");
  const knowledgeText = String(request.knowledgeBase || "").trim();
  const normalizedKnowledge = knowledgeText || "Essa informação não está no material enviado";
  const firstTopic = normalizedKnowledge.split(/\n+/).find(Boolean) || normalizedKnowledge;

  return {
    metadata: {
      grade: request.grade || "",
      subjects: Array.isArray(request.subjects) ? request.subjects : [],
      generatedAt: new Date().toISOString(),
      usedKnowledgeBase: Boolean(knowledgeText),
      usedImages: Array.isArray(request.uploadedImages) ? request.uploadedImages.length : 0,
    },
    explanation: {
      intro: `Vamos estudar ${subjectLabel || "o conteúdo selecionado"} a partir do material enviado. O tema central identificado foi: ${firstTopic}.`,
      steps: [
        "1. Primeiro, observe o assunto principal que aparece no conteúdo enviado.",
        "2. Depois, identifique os pontos mais importantes e o que cada um quer dizer em linguagem simples.",
        "3. Em seguida, conecte esses pontos com a matéria escolhida e com o ano escolar selecionado.",
        "4. Por fim, revise a ideia principal para entender como esse conteúdo se organiza.",
      ],
      visualExample: knowledgeText
        ? `Exemplo visual simples: imagine um quadro com o título "${firstTopic}" e, abaixo, os principais pontos separados em etapas curtas.`
        : "Essa informação não está no material enviado",
    },
  };
}

function parseStudyGuidedExplanationStorage(rawValue) {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      source: parsed.source === "api" ? "api" : "simulated",
      errorMessage: String(parsed.errorMessage || "").trim(),
      metadata: {
        grade: String(parsed.metadata?.grade || "").trim(),
        subjects: Array.isArray(parsed.metadata?.subjects) ? parsed.metadata.subjects.map((subject) => String(subject || "").trim()).filter(Boolean) : [],
        generatedAt: String(parsed.metadata?.generatedAt || "").trim(),
        usedKnowledgeBase: Boolean(parsed.metadata?.usedKnowledgeBase),
        usedImages: Math.max(0, Number(parsed.metadata?.usedImages || 0)),
      },
      explanation: {
        intro: String(parsed.explanation?.intro || "").trim(),
        steps: Array.isArray(parsed.explanation?.steps) ? parsed.explanation.steps.map((step) => String(step || "").trim()).filter(Boolean) : [],
        visualExample: String(parsed.explanation?.visualExample || "").trim(),
      },
    };
  } catch {
    return null;
  }
}

function parseStudyGuidedExplanationResponse(rawResponse, payload) {
  const fallback = buildSimulatedStudyGuidedExplanation(payload);
  const parsed = {
    metadata: {
      grade: String(rawResponse?.metadata?.grade || fallback.metadata.grade || "").trim(),
      subjects: Array.isArray(rawResponse?.metadata?.subjects)
        ? rawResponse.metadata.subjects.map((subject) => String(subject || "").trim()).filter(Boolean)
        : fallback.metadata.subjects,
      generatedAt: String(rawResponse?.metadata?.generatedAt || fallback.metadata.generatedAt || new Date().toISOString()).trim(),
      usedKnowledgeBase: Boolean(
        rawResponse?.metadata?.usedKnowledgeBase
        ?? fallback.metadata.usedKnowledgeBase
      ),
      usedImages: Math.max(0, Number(
        rawResponse?.metadata?.usedImages
        ?? fallback.metadata.usedImages
        ?? 0
      )),
    },
    explanation: {
      intro: String(rawResponse?.explanation?.intro || fallback.explanation.intro || "").trim(),
      steps: Array.isArray(rawResponse?.explanation?.steps) && rawResponse.explanation.steps.length
        ? rawResponse.explanation.steps.map((step) => String(step || "").trim()).filter(Boolean)
        : fallback.explanation.steps,
      visualExample: String(
        rawResponse?.explanation?.visualExample
        || fallback.explanation.visualExample
        || "Essa informação não está no material enviado"
      ).trim(),
    },
  };

  return parsed;
}

async function requestAiStudyGuidedExplanation(payload) {
  if (!payload?.request) {
    throw new Error("O pedido do Estudo Guiado ainda não está pronto.");
  }

  const config = getAiApiConfig();
  const buildSimulatedResult = () =>
    ({
      ...parseStudyGuidedExplanationResponse(buildSimulatedStudyGuidedExplanation(payload), payload),
      source: "simulated",
      errorMessage: "",
    });

  if (config.providerMode !== "api") {
    return buildSimulatedResult();
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), config.timeoutMs)
    : null;

  try {
    const response = await fetch(getAiGenerateStudyUrl(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: payload.request,
        prompt: payload.prompt,
      }),
      signal: controller?.signal,
    });

    if (!response.ok) {
      let apiMessage = "";
      try {
        const errorPayload = await response.json();
        apiMessage = String(errorPayload?.message || errorPayload?.error || "").trim();
      } catch (_) {
        apiMessage = "";
      }
      throw new Error(apiMessage || `A API respondeu com status ${response.status}.`);
    }

    const rawResponse = await response.json();
    return {
      ...parseStudyGuidedExplanationResponse(rawResponse, payload),
      source: "api",
      errorMessage: "",
    };
  } catch (error) {
    console.warn("Estudo Guiado: usando fallback simulado após falha na API.", error);
    return {
      ...buildSimulatedResult(),
      errorMessage: error instanceof Error ? error.message : "Falha desconhecida na API.",
    };
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function formatAiDraftSummary(draft = getAiGenerationDraft()) {
  if (!draft?.grade || !draft.subjects?.length) return "";
  const subjectLabels = draft.subjects.map((subject) => getSubjectDisplayLabel(subject)).join(", ");
  const questionCountLabel = `${draft.count} quest${draft.count === 1 ? "ão" : "ões"}`;
  const unlockLabel = draft.unlockMinutes ? formatMinutesLabel(draft.unlockMinutes) : "tempo não definido";
  const questionTypesLabel = getAiQuestionTypesSummary(draft.questionTypes);
  const knowledgeLabel = draft.knowledge ? `Base: ${draft.knowledge}` : "Base: conhecimento ainda não detalhado";
  const typeSummary = questionTypesLabel ? `Tipos: ${questionTypesLabel}` : "Tipos: ainda não definidos";
  return `${draft.grade} ano • ${questionCountLabel} • ${unlockLabel}\n${subjectLabels}\n${typeSummary}\n${knowledgeLabel}`;
}

function getParentalControlSettings() {
  const rawSettings = JSON.parse(localStorage.getItem(parentalControlSettingsStorageKey) || "null");
  const defaultBlockedApps = Object.fromEntries(parentalBlockedAppCatalog.map((item) => [item.key, true]));
  const defaultExceptions = Object.fromEntries(parentalExceptionCatalog.map((item) => [item.key, false]));
  const defaultWeekdays = Object.fromEntries(parentalWeekdayCatalog.map((item) => [item.key, ["mon", "tue", "wed", "thu", "fri"].includes(item.key)]));

  return {
    enabledDuringTest: Boolean(rawSettings?.enabledDuringTest),
    blockAllApps: rawSettings?.blockAllApps !== false,
    returnToTest: rawSettings?.returnToTest !== false,
    blockedApps: {
      ...defaultBlockedApps,
      ...(rawSettings?.blockedApps || {}),
    },
    exceptions: {
      ...defaultExceptions,
      ...(rawSettings?.exceptions || {}),
    },
    scheduleMode: ["test-only", "test-and-review", "study-hours"].includes(rawSettings?.scheduleMode)
      ? rawSettings.scheduleMode
      : "test-only",
    scheduleStart: String(rawSettings?.scheduleStart || "18:00"),
    scheduleEnd: String(rawSettings?.scheduleEnd || "20:00"),
    weekdays: {
      ...defaultWeekdays,
      ...(rawSettings?.weekdays || {}),
    },
    protectionLevel: ["simple", "reinforced", "advanced"].includes(rawSettings?.protectionLevel)
      ? rawSettings.protectionLevel
      : "simple",
    reports: {
      attemptsToday: Math.max(0, Number(rawSettings?.reports?.attemptsToday || 0)),
      lastAttempt: String(rawSettings?.reports?.lastAttempt || "Nenhuma"),
    },
  };
}

function saveParentalControlSettings(settings) {
  const normalizedSettings = getParentalControlSettings();
  localStorage.setItem(parentalControlSettingsStorageKey, JSON.stringify({
    ...normalizedSettings,
    ...settings,
  }));
}

function updateParentalControlSettings(partialSettings = {}) {
  const nextSettings = {
    ...getParentalControlSettings(),
    ...partialSettings,
  };
  saveParentalControlSettings(nextSettings);
  renderParentalControlSettings();
  renderQuestionBankStatus();
  syncNativeResponsibleConfig();
  return nextSettings;
}

function setTogglePressedState(button, pressed, disabled = false) {
  if (!button) return;
  button.setAttribute("aria-pressed", pressed ? "true" : "false");
  button.setAttribute("aria-disabled", disabled ? "true" : "false");
  button.disabled = Boolean(disabled);
}

function renderParentalControlSettings() {
  const settings = getParentalControlSettings();
  const summaryParts = [];
  const blockedAppsCount = Object.values(settings.blockedApps).filter(Boolean).length;
  const exceptionsCount = Object.values(settings.exceptions).filter(Boolean).length;

  setTogglePressedState(dashboardParentalControlToggle, settings.enabledDuringTest);
  setTogglePressedState(parentalControlMainToggle, settings.enabledDuringTest);
  setTogglePressedState(parentalControlBlockAllToggle, settings.blockAllApps, !settings.enabledDuringTest);
  setTogglePressedState(parentalControlReturnToggle, settings.returnToTest, !settings.enabledDuringTest);

  if (dashboardParentalControlStatus) {
    dashboardParentalControlStatus.textContent = settings.enabledDuringTest ? "Ativado" : "Desativado";
    dashboardParentalControlStatus.classList.toggle("apply-test-status--on", settings.enabledDuringTest);
    dashboardParentalControlStatus.classList.toggle("apply-test-status--off", !settings.enabledDuringTest);
  }

  if (parentalScheduleModeSelect) {
    parentalScheduleModeSelect.value = settings.scheduleMode;
  }

  if (parentalScheduleStartInput) {
    parentalScheduleStartInput.value = settings.scheduleStart;
    parentalScheduleStartInput.disabled = settings.scheduleMode !== "study-hours";
  }

  if (parentalScheduleEndInput) {
    parentalScheduleEndInput.value = settings.scheduleEnd;
    parentalScheduleEndInput.disabled = settings.scheduleMode !== "study-hours";
  }

  if (parentalBlockedAppsList) {
    parentalBlockedAppsList.innerHTML = parentalBlockedAppCatalog
      .map((item) => `
        <label
          class="parental-checkbox-item ${settings.blockedApps[item.key] ? "is-active" : ""}"
          data-parental-blocked-app="${item.key}"
        >
          <span class="parental-checkbox-box" aria-hidden="true">
            ${settings.blockedApps[item.key] ? `
              <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                <path d="M4.5 10.5l3.3 3.3l7.7-7.7"></path>
              </svg>
            ` : ""}
          </span>
          <span class="parental-checkbox-label">${item.label}</span>
        </label>
      `)
      .join("");
  }

  if (parentalWeekdayList) {
    parentalWeekdayList.innerHTML = parentalWeekdayCatalog
      .map((item) => `
        <button
          type="button"
          class="parental-chip ${settings.weekdays[item.key] ? "is-active" : ""}"
          data-parental-weekday="${item.key}"
          aria-pressed="${settings.weekdays[item.key] ? "true" : "false"}"
        >
          ${item.label}
        </button>
      `)
      .join("");
  }

  if (parentalExceptionsList) {
    parentalExceptionsList.innerHTML = parentalExceptionCatalog
      .map((item) => `
        <button
          type="button"
          class="parental-chip parental-chip--soft ${settings.exceptions[item.key] ? "is-active" : ""}"
          data-parental-exception="${item.key}"
          aria-pressed="${settings.exceptions[item.key] ? "true" : "false"}"
        >
          ${item.label}
        </button>
      `)
      .join("");
  }

  parentalProtectionLevelGroup?.querySelectorAll("[data-protection-level]").forEach((button) => {
    const isActive = button.dataset.protectionLevel === settings.protectionLevel;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (parentalControlMainStatus) {
    parentalControlMainStatus.textContent = settings.enabledDuringTest ? "Ativado" : "Desativado";
    parentalControlMainStatus.classList.toggle("parental-control-main-status--on", settings.enabledDuringTest);
    parentalControlMainStatus.classList.toggle("parental-control-main-status--off", !settings.enabledDuringTest);
  }

  if (settings.enabledDuringTest) {
    if (settings.blockAllApps) {
      summaryParts.push("todos os aplicativos externos ficam bloqueados");
    }
    if (settings.returnToTest) {
      summaryParts.push("o app tenta trazer o aluno de volta ao teste se ele sair");
    }
  }

  if (parentalControlSummaryText) {
    parentalControlSummaryText.textContent = settings.enabledDuringTest
      ? `Controle ligado: ${summaryParts.join(" e ")}. ${blockedAppsCount} app(s) bloqueado(s), ${exceptionsCount} exceção(ões) e nível ${settings.protectionLevel === "advanced" ? "avançado" : settings.protectionLevel === "reinforced" ? "reforçado" : "simples"}.`
      : "O controle está desligado no momento.";
  }

  if (parentalAttemptsToday) {
    parentalAttemptsToday.textContent = String(settings.reports.attemptsToday);
  }

  if (parentalBlockedAppsCount) {
    parentalBlockedAppsCount.textContent = String(blockedAppsCount);
  }

  if (parentalLastAttempt) {
    parentalLastAttempt.textContent = settings.reports.lastAttempt || "Nenhuma";
  }

  bindParentalControlInteractiveElements();
}

function bindParentalControlInteractiveElements() {
  parentalBlockedAppsList?.querySelectorAll("[data-parental-blocked-app]").forEach((item) => {
    item.addEventListener("click", () => {
      const settings = getParentalControlSettings();
      const key = item.dataset.parentalBlockedApp;
      if (!key) return;
      updateParentalControlSettings({
        blockedApps: {
          ...settings.blockedApps,
          [key]: !settings.blockedApps[key],
        },
      });
    });
  });

  parentalWeekdayList?.querySelectorAll("[data-parental-weekday]").forEach((button) => {
    button.addEventListener("click", () => {
      const settings = getParentalControlSettings();
      const key = button.dataset.parentalWeekday;
      if (!key) return;
      updateParentalControlSettings({
        weekdays: {
          ...settings.weekdays,
          [key]: !settings.weekdays[key],
        },
      });
    });
  });

  parentalExceptionsList?.querySelectorAll("[data-parental-exception]").forEach((button) => {
    button.addEventListener("click", () => {
      const settings = getParentalControlSettings();
      const key = button.dataset.parentalException;
      if (!key) return;
      updateParentalControlSettings({
        exceptions: {
          ...settings.exceptions,
          [key]: !settings.exceptions[key],
        },
      });
    });
  });
}

function getAiGeneratedQuestionBank() {
  return normalizeQuestionBank(JSON.parse(localStorage.getItem(aiGeneratedQuestionBankStorageKey) || "null"));
}

function saveAiGeneratedQuestionBank(bank) {
  localStorage.setItem(aiGeneratedQuestionBankStorageKey, JSON.stringify(normalizeQuestionBank(bank)));
}

function clearAiGeneratedQuestionBank() {
  saveAiGeneratedQuestionBank(createEmptyQuestionBank());
}

function getAiGeneratedQuestionsForGrade(grade) {
  return getAiGeneratedQuestionBank()[normalizeGradeLabel(grade)] || [];
}

function getAiGenerationMeta() {
  try {
    const rawMeta = JSON.parse(localStorage.getItem(aiGenerationMetaStorageKey) || "null");
    if (!rawMeta || typeof rawMeta !== "object") return null;
    return {
      source: rawMeta.source === "api" ? "api" : "simulated",
      generatedAt: String(rawMeta.generatedAt || ""),
      count: Math.max(0, Number(rawMeta.count || 0)),
      grade: normalizeGradeLabel(rawMeta.grade || ""),
      errorMessage: String(rawMeta.errorMessage || "").trim(),
    };
  } catch {
    return null;
  }
}

function saveAiGenerationMeta(meta) {
  localStorage.setItem(
    aiGenerationMetaStorageKey,
    JSON.stringify({
      source: meta?.source === "api" ? "api" : "simulated",
      generatedAt: String(meta?.generatedAt || new Date().toISOString()),
      count: Math.max(0, Number(meta?.count || 0)),
      grade: normalizeGradeLabel(meta?.grade || ""),
      errorMessage: String(meta?.errorMessage || "").trim(),
    }),
  );
}

function clearAiGenerationState() {
  clearAiGeneratedQuestionBank();
  localStorage.removeItem(aiGenerationMetaStorageKey);
}

function getAiGenerationSourceLabel(source) {
  return source === "api" ? "API" : "Simulação";
}

function truncateAiPreviewText(text, maxLength = 118) {
  const normalizedText = String(text || "").replace(/\s+/g, " ").trim();
  if (normalizedText.length <= maxLength) return normalizedText;
  return `${normalizedText.slice(0, maxLength - 1).trimEnd()}…`;
}

function getAiGeneratedQuestionsSummary() {
  const bank = getAiGeneratedQuestionBank();
  const lines = [];

  Object.entries(bank).forEach(([grade, list]) => {
    if (!Array.isArray(list) || !list.length) return;
    list.forEach((question, index) => {
      const subjectLabel = getSubjectDisplayLabel(question.subject);
      const typeLabel = isDissertativeQuestion(question) ? "Dissertativa" : "Múltipla escolha";
      lines.push(
        `${index + 1}. ${grade} ano • ${subjectLabel} • ${typeLabel}\n${truncateAiPreviewText(question.text)}`,
      );
    });
  });

  return lines;
}

function closeAiGenerationModal() {
  closeAiGenerationCountMenu();
  if (aiGenerationOverlay) {
    aiGenerationOverlay.hidden = true;
  }
  if (aiGenerationModal) {
    aiGenerationModal.hidden = true;
  }
}

function syncAiGenerationCountTriggerLabel() {
  if (!aiGenerationCountTrigger || !aiGenerationCount) return;
  const hasExplicitSelection = aiGenerationCountTrigger.dataset.explicitSelection === "true";
  const selectedOption = aiGenerationCount.options[aiGenerationCount.selectedIndex];
  aiGenerationCountTrigger.textContent = hasExplicitSelection
    ? (selectedOption?.textContent || "5 questões")
    : "Quantidade de Questões";
}

function closeAiGenerationCountMenu() {
  if (aiGenerationCountTrigger) {
    aiGenerationCountTrigger.setAttribute("aria-expanded", "false");
  }
  aiGenerationCountTrigger?.closest(".ai-generation-count-shell")?.classList.remove("is-open");
  if (aiGenerationCountMenu) {
    aiGenerationCountMenu.hidden = true;
  }
}

function populateAiGenerationCountMenu() {
  if (!aiGenerationCount || !aiGenerationCountMenu) return;
  const options = Array.from(aiGenerationCount.options);
  aiGenerationCountMenu.innerHTML = "";

  options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "ai-generation-count-option";
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => {
      aiGenerationCount.value = option.value;
      aiGenerationCountTrigger.dataset.explicitSelection = "true";
      syncAiGenerationCountTriggerLabel();
      closeAiGenerationCountMenu();
    });
    aiGenerationCountMenu.appendChild(optionButton);
  });
}

function getExplicitPrototypeSelectedGrade() {
  if (!staticParentPrototypeMode || !prototypeSelectedGradeGroup) return "";
  if (prototypeSelectedGradeGroup === "lower") {
    return normalizeSupportedStudentGrade(studentGradeDisplay?.value || "");
  }
  if (prototypeSelectedGradeGroup === "upper") {
    return normalizeSupportedStudentGrade(studentGradeDisplayUpper?.value || "");
  }
  return "";
}

function getGradeGroupDisplayLabel(grade) {
  const normalizedGrade = normalizeSupportedStudentGrade(grade || "");
  if (!normalizedGrade) return "";
  return ["3º", "4º", "5º"].includes(normalizedGrade) ? "Fundamental I" : "Fundamental II";
}

function getAiGenerationSelectionState() {
  const selectedGrade = staticParentPrototypeMode
    ? getExplicitPrototypeSelectedGrade()
    : getSelectedGrade();

  if (!selectedGrade) {
    return {
      ok: false,
      message: "Na Versão IA, escolha primeiro o ano em Fundamental I ou Fundamental II.",
      grade: "",
      subjects: [],
      unlockMinutes: 0,
    };
  }

  applyCheckedSubjectsToGrade(selectedGrade);
  const activeSubjects = getActiveSubjectsForGrade(selectedGrade);

  if (!activeSubjects.length) {
    return {
      ok: false,
      message: "Na Versão IA, escolha primeiro a matéria ou as matérias antes de clicar em Gerar Questões.",
      grade: selectedGrade,
      subjects: [],
      unlockMinutes: 0,
    };
  }

  if (staticParentPrototypeMode && !prototypeTimeExplicitlySelected) {
    return {
      ok: false,
      message: "Na Versão IA, escolha primeiro o tempo de uso do celular antes de clicar em Gerar Questões.",
      grade: selectedGrade,
      subjects: activeSubjects,
      unlockMinutes: 0,
    };
  }

  return {
    ok: true,
    message: "",
    grade: selectedGrade,
    subjects: activeSubjects,
    unlockMinutes: Number(getUnlockMinutes()),
  };
}

function openAiGenerationModal(grade, activeSubjects, unlockMinutes) {
  if (
    !aiGenerationOverlay
    || !aiGenerationModal
    || !aiGenerationGrade
    || !aiGenerationSubjects
    || !aiGenerationUnlockTime
    || !aiGenerationCount
    || !aiGenerationKnowledge
  ) {
    openSetupWarningModal("A tela da Versão IA ainda não está disponível neste aparelho.");
    return;
  }

  const normalizedGrade = normalizeGradeLabel(grade || "");
  const normalizedSubjects = activeSubjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean);
  const savedDraft = getAiGenerationDraft();
  const shouldReuseDraft = savedDraft?.grade === normalizedGrade
    && JSON.stringify(savedDraft.subjects || []) === JSON.stringify(normalizedSubjects);

  const gradeGroupLabel = getGradeGroupDisplayLabel(normalizedGrade);
  aiGenerationGrade.textContent = normalizedGrade
    ? `${gradeGroupLabel} • ${normalizedGrade} ano`
    : "--";
  aiGenerationSubjects.textContent = normalizedSubjects.map((subject) => getSubjectDisplayLabel(subject)).join(", ") || "--";
  aiGenerationUnlockTime.textContent = unlockMinutes ? formatMinutesLabel(unlockMinutes) : "--";
  aiGenerationCount.value = String(shouldReuseDraft ? savedDraft.count : 5);
  if (aiGenerationCountTrigger) {
    aiGenerationCountTrigger.dataset.explicitSelection = shouldReuseDraft ? "true" : "false";
  }
  populateAiGenerationCountMenu();
  syncAiGenerationCountTriggerLabel();
  if (aiGenerationTypeChoice) {
    aiGenerationTypeChoice.checked = shouldReuseDraft ? Boolean(savedDraft.questionTypes?.choice) : false;
  }
  if (aiGenerationTypeText) {
    aiGenerationTypeText.checked = shouldReuseDraft ? Boolean(savedDraft.questionTypes?.text) : false;
  }
  aiGenerationKnowledge.value = shouldReuseDraft ? savedDraft.knowledge : "";
  aiGenerationOverlay.hidden = false;
  aiGenerationModal.hidden = false;
}

function closeTestLogoutModal() {
  if (testLogoutOverlay) {
    testLogoutOverlay.hidden = true;
  }
  if (testLogoutModal) {
    testLogoutModal.hidden = true;
  }
  if (testLogoutPasswordInput) {
    testLogoutPasswordInput.value = "";
  }
  if (testLogoutError) {
    testLogoutError.textContent = "";
  }
}

function openTestLogoutModal() {
  if (!testLogoutOverlay || !testLogoutModal) {
    return;
  }
  if (testLogoutError) {
    testLogoutError.textContent = "";
  }
  if (testLogoutPasswordInput) {
    testLogoutPasswordInput.value = "";
  }
  testLogoutOverlay.hidden = false;
  testLogoutModal.hidden = false;
  window.setTimeout(() => testLogoutPasswordInput?.focus(), 30);
}

function showPasswordGate() {}

function hidePasswordGate() {}

function forceResponsibleLogoutFromTest() {
  closeTestLogoutModal();
  closeProfileMenu(false);
  clearRetryRestartTimer();
  clearUnlockTimer();
  setCycleActive(false);
  setTestModeEnabled(false);
  localStorage.removeItem("smartUnlockUnlockedUntil");
  localStorage.removeItem(unlockAwardPendingStorageKey);
  localStorage.removeItem(forceResumeTestStorageKey);
  document.body.classList.remove("test-modal-active");
  document.body.classList.remove("unlock-award-active");
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  educationGate.hidden = true;
  phoneFrame.classList.add("screen-free");
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  if (manualUnlockButton) {
    manualUnlockButton.setAttribute("aria-pressed", "false");
  }
  responsibleEntryAuthorized = false;
  clearResponsibleEntryForm();
  setActiveView(responsibleEntryView ? "responsible-entry" : "parent");
}

function setStudentGateMode(mode) {
  const isWelcome = mode === "welcome";
  educationGate.classList.toggle("is-welcome", isWelcome);
  stepLine.hidden = isWelcome;
  progressTrack.hidden = isWelcome;
  supportText.hidden = isWelcome;
  actionRow.hidden = isWelcome;
  gradeLabel.hidden = isWelcome;
}

function getIntroSubtitle() {
  return `Responda 5 perguntas para liberar<br />o celular por ${formatMinutesLabel(getUnlockMinutes())}`;
}

function formatMinutesLabel(minutes) {
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

function getExplanationForQuestion(question) {
  if (isDissertativeQuestion(question)) {
    const expectedAnswers = getQuestionExpectedAnswers(question);
    const primaryAnswer = expectedAnswers[0] || "Revise a resposta esperada.";
    return {
      explanation: `A resposta esperada é: ${primaryAnswer}`,
      hint: "Use palavras parecidas com a ideia principal da resposta.",
    };
  }

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

function getMultipleChoiceFeedbackDetails(question, selectedLetter, isCorrect) {
  const correctIndex = question.correct.charCodeAt(0) - 65;
  const selectedIndex = Math.max(0, selectedLetter.charCodeAt(0) - 65);
  const correctOption = String(question.options[correctIndex] || "").trim();
  const selectedOption = String(question.options[selectedIndex] || "").trim();
  const baseExplanation = getExplanationForQuestion(question);
  const curatedExplanation = String(question.explanation || "").trim();

  if (isCorrect) {
    return {
      explanation: curatedExplanation
        || `Você marcou ${selectedLetter}. ${selectedOption} está certa porque responde corretamente ao que o enunciado pede.`,
      reason: `A alternativa ${selectedLetter} está correta porque corresponde à resposta esperada da questão.`,
      hint: baseExplanation.hint || "Continue com essa leitura atenta nas próximas questões.",
    };
  }

  return {
    explanation: `Você marcou ${selectedLetter}. ${selectedOption || "Essa alternativa"} não é a melhor resposta para o enunciado.`,
    reason: `A correta é ${question.correct}. ${correctOption}. ${curatedExplanation || baseExplanation.explanation}`,
    hint: baseExplanation.hint || "Compare o enunciado com cada alternativa antes de responder.",
  };
}

function renderAnswerExplanation(question, selectedLetter, isCorrect) {
  if (!explanationBox) return;

  if (isDissertativeQuestion(question)) {
    const explanation = getExplanationForQuestion(question);
    explanationBox.innerHTML = `🧠 Explicação:<br />${escapeHtml(explanation.explanation)}<br /><br />📌 Dica:<br />${escapeHtml(explanation.hint)}`;
    explanationBox.hidden = false;
    return;
  }

  const details = getMultipleChoiceFeedbackDetails(question, selectedLetter, isCorrect);
  explanationBox.innerHTML = isCorrect
    ? `🧠 Explicação:<br />${escapeHtml(details.explanation)}<br /><br />📌 Dica:<br />${escapeHtml(details.hint)}`
    : `🧠 Explicação:<br />${escapeHtml(details.explanation)}<br /><br />📌 Por quê:<br />${escapeHtml(details.reason)}<br /><br />📌 Dica:<br />${escapeHtml(details.hint)}`;
  explanationBox.hidden = false;
}

function showIntroScreen(title, subtitle, buttonText) {
  if ((postLoginOnlyMode || isTestModeEnabled()) && roundQuestions.length) {
    renderQuestion();
    return;
  }
  clearRetryRestartTimer();
  introMode = true;
  retryPending = false;
  retryQuestionMode = false;
  answered = false;
  selectedAnswer = "";
  gradeLabel.textContent = "";
  gateTitle.textContent = title;
  gateSubtitle.innerHTML = subtitle;
  questionCounter.textContent = `Progresso: 0/${roundSize}`;
  scoreLabel.textContent = "0";
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = "0%";
  supportText.textContent = "";
  questionText.textContent = "Você está aprendendo muito!";
  questionText.classList.add("is-message");
  questionText.hidden = false;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  answerList.innerHTML = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  nextButton.textContent = buttonText;
  nextButton.disabled = false;
  setStudentGateMode("round");
  resetViewportPosition();
}

function renderWelcomeStudentState() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  introMode = false;
  retryPending = false;
  retryQuestionMode = false;
  answered = false;
  selectedAnswer = "";
  correctCount = 0;
  currentIndex = 0;
  roundQuestions = [];

  const studentName = getInitialSetup()?.studentName?.trim() || "Aluno";

  showLockedStudentGate();
  setStudentGateMode("welcome");
  gradeLabel.textContent = getGradeDisplayLabel();
  gateTitle.textContent = `Olá ${studentName},`;
  gateSubtitle.innerHTML = "Bem-vindo a Mais um Dia de Aprendizado.";
  questionCounter.textContent = "";
  scoreLabel.textContent = "0";
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = "0%";
  supportText.textContent = "";
  questionText.textContent = "";
  questionText.classList.add("is-message");
  questionText.hidden = true;
  welcomeStartLink.hidden = false;
  welcomeActionPanel.hidden = false;
  if (welcomeUnlockTimeSelect) {
    welcomeUnlockTimeSelect.value = String(getUnlockMinutes());
  }
  answerList.innerHTML = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  resetViewportPosition();
}

function hasActiveUnlockWindow() {
  return Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0") > Date.now();
}

function shouldShowTestStatusView() {
  return postLoginOnlyMode && hasActiveUnlockWindow() && !hasPendingUnlockAward() && isCycleActive();
}

function refreshStudentGradePreview() {
  gradeLabel.textContent = getGradeDisplayLabel();
}

function renderImportButtonLabel() {
  if (!importCurrentGradeButton) return;
  const aiVersionModeEnabled = isAiVersionModeEnabled();
  const parentDashboardMode = getParentDashboardMode();
  const label = aiVersionModeEnabled
    ? (parentDashboardMode === "study-guided" ? "Gerar Estudo" : "Gerar Teste")
    : "Importar Questões";
  importCurrentGradeButton.innerHTML = `<span class="import-button__label">${label}</span>`;
  renderAiDashboardConfig();

  const previewLabel = aiVersionModeEnabled ? "Questões Geradas" : "Questões Importadas";
  if (questionBankPreviewTitleText) {
    questionBankPreviewTitleText.textContent = previewLabel;
  }
  if (questionBankPreviewPanel) {
    questionBankPreviewPanel.setAttribute("aria-label", previewLabel);
  }
  if (questionBankPreviewButton) {
    const isStudyGuidedMode = parentDashboardMode === "study-guided";
    questionBankPreviewButton.classList.toggle("import-preview-button--upload", isStudyGuidedMode);
    questionBankPreviewButton.innerHTML = isStudyGuidedMode
      ? `
        <span class="import-preview-button__upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M12 16V4"></path>
            <path d="M7.5 8.5 12 4l4.5 4.5"></path>
            <path d="M5 11.5V19h14v-7.5"></path>
          </svg>
        </span>
        <span class="import-preview-button__upload-label">Fazer upload</span>
      `
      : `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path fill="currentColor" d="M6 3.5h8.8L20 8.7V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z"></path>
          <path fill="currentColor" d="M14.8 3.5V9H20"></path>
          <rect x="8" y="10.1" width="7.6" height="1.8" rx="0.5" fill="#ffffff"></rect>
          <rect x="8" y="13.5" width="7.6" height="1.8" rx="0.5" fill="#ffffff"></rect>
          <rect x="8" y="16.9" width="7.6" height="1.8" rx="0.5" fill="#ffffff"></rect>
        </svg>
      `;
    questionBankPreviewButton.setAttribute(
      "aria-label",
      isStudyGuidedMode
        ? "Fazer upload de conteúdo"
        : aiVersionModeEnabled
          ? "Ver questões geradas"
          : "Ver questões importadas",
    );
  }
  if (questionBankPreviewContent) {
    const generatedEmptyState = "Nenhuma questão gerada ainda.";
    const importedEmptyState = "Nenhuma questão importada ainda.";
    if (
      questionBankPreviewContent.textContent === generatedEmptyState
      || questionBankPreviewContent.textContent === importedEmptyState
    ) {
      questionBankPreviewContent.textContent = aiVersionModeEnabled ? generatedEmptyState : importedEmptyState;
    }
  }
}

function isAiVersionModeEnabled() {
  const storedValue = localStorage.getItem(aiVersionModeStorageKey);
  if (storedValue === null) {
    return true;
  }
  return storedValue === "true";
}

function setAiVersionModeEnabled(enabled) {
  localStorage.setItem(aiVersionModeStorageKey, enabled ? "true" : "false");
  renderImportButtonLabel();
}

function renderStudentGradeDisplay() {
  if (!studentGradeDisplay) return
  if (staticParentPrototypeMode) {
    syncStudentGradePrototypeLabel();
    if (studentGradeDisplayUpper) {
      syncStudentGradeUpperPrototypeLabel();
    }
    return;
  }
  const selectedGrade = getSelectedGrade();
  studentGradeDisplay.value = ["3º", "4º", "5º"].includes(selectedGrade) ? selectedGrade : "";
  if (studentGradeDisplayUpper) {
    studentGradeDisplayUpper.value = ["6º", "7º", "8º", "9º"].includes(selectedGrade) ? selectedGrade : "";
  }
  if (welcomeGradeSelect) {
    welcomeGradeSelect.value = selectedGrade
  }
}

function showInsufficientQuestionsState() {
  showLockedStudentGate();
  showIntroScreen(
    "Tempo de uso pausado",
    "Não há questões suficientes para este ano. Importe mais questões.",
    "Começar agora",
  );
  questionText.textContent = "Não há questões suficientes para este ano. Importe mais questões.";
  questionText.classList.add("is-message");
  supportText.textContent = "";
  nextButton.disabled = true;
}

function showPrototypeBlockedState(title, subtitle, detail) {
  showLockedStudentGate();
  setStudentGateMode("round");
  introMode = false;
  retryPending = false;
  retryQuestionMode = false;
  answered = false;
  selectedAnswer = "";
  gradeLabel.textContent = getSelectedGradeDisplay();
  gateTitle.textContent = title;
  gateSubtitle.textContent = subtitle;
  questionCounter.textContent = `Progresso: 0/${roundSize}`;
  scoreLabel.textContent = "0";
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = "0%";
  supportText.textContent = "";
  questionText.textContent = detail;
  questionText.classList.add("is-message");
  questionText.hidden = false;
  answerList.innerHTML = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  nextButton.textContent = "Aguardando seleção";
  nextButton.disabled = true;
  educationGate.scrollTop = 0;
}

function getPrototypeEligibleImportedQuestions() {
  if (!prototypeSelectedGradeGroup) {
    return {
      ok: false,
      reason: "Nenhum ano selecionado.",
      detail: "Escolha um ano em Fundamental I ou Fundamental II para aplicar o teste.",
      questions: [],
    };
  }

  const grade = getSelectedGrade();
  applyCheckedSubjectsToGrade(grade);
  const activeSubjects = getActiveSubjectsForGrade(grade);
  const availableQuestions = isAiVersionModeEnabled()
    ? getAiGeneratedQuestionsForGrade(grade)
    : getImportedQuestionsForGrade(grade);

  if (!activeSubjects.length) {
    return {
      ok: false,
      reason: "Nenhuma matéria selecionada.",
      detail: "Selecione ao menos uma matéria para aplicar o teste.",
      questions: [],
    };
  }

  if (!availableQuestions.length) {
    return {
      ok: false,
      reason: isAiVersionModeEnabled() ? "Questões não geradas." : "Questões não importadas.",
      detail: isAiVersionModeEnabled()
        ? "Gere questões na Versão IA para o ano selecionado antes de aplicar o teste."
        : "Importe questões para o ano selecionado antes de aplicar o teste.",
      questions: [],
    };
  }

  const eligibleQuestions = availableQuestions.filter((question) =>
    activeSubjects.includes(normalizeSubjectName(question.subject)),
  );

  if (!eligibleQuestions.length) {
    return {
      ok: false,
      reason: "Questões não encontradas.",
      detail: isAiVersionModeEnabled()
        ? "Não há questões geradas para as matérias selecionadas nesse ano."
        : "Não há questões importadas para as matérias selecionadas nesse ano.",
      questions: [],
    };
  }

  if (eligibleQuestions.length < roundSize) {
    return {
      ok: false,
      reason: "Questões insuficientes.",
      detail: isAiVersionModeEnabled()
        ? `As matérias selecionadas têm apenas ${eligibleQuestions.length} questão(ões) gerada(s).`
        : `As matérias selecionadas têm apenas ${eligibleQuestions.length} questão(ões) importada(s).`,
      questions: [],
    };
  }

  return {
    ok: true,
    questions: eligibleQuestions,
  };
}

async function startRound() {
  clearRetryRestartTimer();
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  resetLatestTestEvaluationData();
  if (postLoginOnlyMode) {
    const prototypeSelection = getPrototypeEligibleImportedQuestions();
    if (!prototypeSelection.ok) {
      prototypeDemoModeActive = false;
      if (manualUnlockButton) {
        manualUnlockButton.setAttribute("aria-pressed", "false");
      }
      showPrototypeBlockedState(
        prototypeSelection.reason,
        "Configure o teste para continuar.",
        prototypeSelection.detail,
      );
      return;
    }
    showLockedStudentGate();
    prototypeDemoModeActive = false;
    initializeRoundFromQuestions(buildDiversifiedRound(prototypeSelection.questions));
    renderQuestion();
    return;
  }
  applyCheckedSubjectsToGrade(getSelectedGrade());
  showLockedStudentGate();
  const eligibleQuestions = await getQuestionsForSelectedGrade();
  if (eligibleQuestions.length < roundSize) {
    showInsufficientQuestionsState();
    return;
  }
  prototypeDemoModeActive = false;
  initializeRoundFromQuestions(buildDiversifiedRound(eligibleQuestions));
  renderQuestion();
}

async function startOverlayRound() {
  localStorage.removeItem(forceResumeTestStorageKey);
  clearAppClosingTransition();
  if (!isTestModeEnabled()) {
    if (isCycleActive()) {
      setTestModeEnabled(true);
    } else {
      renderIdleStudentState();
      return;
    }
  }

  if (!isTestModeEnabled()) {
    renderIdleStudentState();
    return;
  }

  hideLoginGate();
  setActiveView(postLoginOnlyMode ? "parent" : "child");

  clearRetryRestartTimer();
  clearUnlockTimer();
  localStorage.removeItem("smartUnlockUnlockedUntil");
  resetLatestTestEvaluationData();
  if (postLoginOnlyMode) {
    const prototypeSelection = getPrototypeEligibleImportedQuestions();
    if (!prototypeSelection.ok) {
      prototypeDemoModeActive = false;
      if (manualUnlockButton) {
        manualUnlockButton.setAttribute("aria-pressed", "false");
      }
      showPrototypeBlockedState(
        prototypeSelection.reason,
        "Configure o teste para continuar.",
        prototypeSelection.detail,
      );
      return;
    }
    showLockedStudentGate();
    prototypeDemoModeActive = false;
    initializeRoundFromQuestions(buildDiversifiedRound(prototypeSelection.questions));
    renderQuestion();
    return;
  }
  applyCheckedSubjectsToGrade(getSelectedGrade());
  showLockedStudentGate();
  const eligibleQuestions = await getQuestionsForSelectedGrade();
  if (eligibleQuestions.length < roundSize) {
    showInsufficientQuestionsState();
    return;
  }
  prototypeDemoModeActive = false;
  initializeRoundFromQuestions(buildDiversifiedRound(eligibleQuestions));
  renderQuestion();
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

function getSubjectQueueStorageKey(year, subject) {
  return `smartUnlockQuestionQueue:${normalizeGradeLabel(year)}:${normalizeSubjectName(subject)}`;
}

function buildSubjectQuestionQueue(questionList, excludedTexts = new Set()) {
  const uniqueTexts = [...new Set(questionList.map((question) => question.text).filter(Boolean))];
  const filteredTexts = uniqueTexts.filter((text) => !excludedTexts.has(text));
  return shuffle(filteredTexts);
}

function getStoredSubjectQuestionQueue(year, subject, questionList) {
  const storageKey = getSubjectQueueStorageKey(year, subject);
  const validTexts = new Set(questionList.map((question) => question.text));
  const storedQueue = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const sanitizedQueue = Array.isArray(storedQueue)
    ? storedQueue.filter((text) => validTexts.has(text))
    : [];

  if (sanitizedQueue.length) {
    return sanitizedQueue;
  }

  return buildSubjectQuestionQueue(questionList);
}

function saveStoredSubjectQuestionQueue(year, subject, queue) {
  localStorage.setItem(getSubjectQueueStorageKey(year, subject), JSON.stringify(queue));
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

  const questionsBySubject = eligibleQuestions.reduce((accumulator, question) => {
    const subject = normalizeSubjectName(question.subject);
    if (!accumulator[subject]) {
      accumulator[subject] = [];
    }
    accumulator[subject].push(question);
    return accumulator;
  }, {});

  const subjectOrder = shuffle(Object.keys(questionsBySubject));
  const subjectQueues = Object.fromEntries(
    subjectOrder.map((subject) => [
      subject,
      getStoredSubjectQuestionQueue(normalizedYear, subject, questionsBySubject[subject]),
    ]),
  );

  const selected = [];
  const selectedKeys = new Set();

  while (selected.length < targetSize) {
    let pickedInPass = false;

    for (const subject of subjectOrder) {
      if (selected.length >= targetSize) break;

      const subjectQuestions = questionsBySubject[subject];
      if (!subjectQuestions?.length) continue;

      let queue = subjectQueues[subject] || [];
      if (!queue.length) {
        const alreadySelectedForSubject = new Set(
          selected
            .filter((question) => normalizeSubjectName(question.subject) === subject)
            .map((question) => question.text),
        );
        queue = buildSubjectQuestionQueue(subjectQuestions, alreadySelectedForSubject);
        subjectQueues[subject] = queue;
      }

      while (queue.length) {
        const nextText = queue.shift();
        const questionKey = `${subject}::${nextText}`;
        if (selectedKeys.has(questionKey)) {
          continue;
        }

        const nextQuestion = subjectQuestions.find((question) => question.text === nextText);
        if (!nextQuestion) {
          continue;
        }

        selected.push(nextQuestion);
        selectedKeys.add(questionKey);
        pickedInPass = true;
        break;
      }
    }

    if (!pickedInPass) {
      break;
    }
  }

  subjectOrder.forEach((subject) => {
    saveStoredSubjectQuestionQueue(normalizedYear, subject, subjectQueues[subject] || []);
  });

  const round = shuffle(selected).slice(0, targetSize);
  saveLastRoundQuestionsByYear(normalizedYear, round);
  return round;
}

function getSelectedGrade() {
  const setup = getInitialSetup();
  const configuredGrade = normalizeSupportedStudentGrade(localStorage.getItem("smartUnlockStudentGrade") || setup?.grade || "3º");

  if (localStorage.getItem("smartUnlockStudentGrade") !== configuredGrade) {
    localStorage.setItem("smartUnlockStudentGrade", configuredGrade);
  }

  return configuredGrade;
}

function getPrototypePrimarySubject(grade = getSelectedGrade()) {
  const activeSubjects = getActiveSubjectsForGrade(grade);
  if (activeSubjects.length) return normalizeSubjectName(activeSubjects[0]);

  const checkedSubjects = getCheckedSubjectsForGrade(grade);
  if (checkedSubjects.length) return normalizeSubjectName(checkedSubjects[0]);

  return "Português";
}

function buildPrototypeDemoRound(grade = getSelectedGrade()) {
  const normalizedGrade = normalizeSupportedStudentGrade(grade);
  const subject = getPrototypePrimarySubject(normalizedGrade);
  const age = inferAgeFromGrade(normalizedGrade);

  const sampleBySubject = {
    "Português": [
      { text: "No título de uma notícia, qual palavra costuma indicar a ação principal?", options: ["O verbo", "O artigo", "A vírgula", "O ponto"], correct: "A" },
      { text: "Em um texto informativo, a ideia principal normalmente aparece onde?", options: ["No título ou no início", "Só no final", "No nome do autor", "Apenas na legenda"], correct: "A" },
      { text: "Qual alternativa apresenta linguagem mais adequada para uma notícia?", options: ["Clara e objetiva", "Cheia de gírias", "Muito confusa", "Sem pontuação"], correct: "A" },
      { text: "Ao ler uma pergunta, o melhor jeito de encontrar a resposta é:", options: ["Voltar ao trecho relacionado", "Escolher a maior frase", "Ignorar o enunciado", "Marcar a letra C"], correct: "A" },
      { text: "Quando uma palavra desconhecida aparece no texto, o ideal é:", options: ["Usar o contexto para inferir", "Parar de ler", "Pular toda a questão", "Trocar de matéria"], correct: "A" },
    ],
    "Matemática": [
      { text: "Se uma turma tem 24 alunos e 6 estão ausentes, quantos compareceram?", options: ["18", "16", "20", "30"], correct: "A" },
      { text: "Qual operação você usa para descobrir metade de 40?", options: ["Divisão", "Adição", "Subtração", "Multiplicação por 4"], correct: "A" },
      { text: "Se cada caixa tem 8 lápis, quantos lápis há em 3 caixas?", options: ["24", "11", "16", "28"], correct: "A" },
      { text: "Um número par entre 30 e 34 é:", options: ["32", "31", "35", "29"], correct: "A" },
      { text: "Para resolver um problema com parcelas iguais, normalmente usamos:", options: ["Multiplicação", "Acentuação", "Pontuação", "Legenda"], correct: "A" },
    ],
    "Ciências": [
      { text: "Qual atitude ajuda a preservar a água?", options: ["Evitar desperdício", "Lavar calçada todo dia", "Deixar torneira aberta", "Jogar óleo no ralo"], correct: "A" },
      { text: "As plantas precisam principalmente de:", options: ["Luz, água e solo", "Som e tinta", "Plástico e cola", "Areia e metal"], correct: "A" },
      { text: "O órgão principal da respiração é:", options: ["Pulmão", "Joelho", "Fígado", "Osso"], correct: "A" },
      { text: "Uma alimentação equilibrada costuma incluir:", options: ["Frutas, legumes e água", "Só doces", "Só refrigerante", "Só fritura"], correct: "A" },
      { text: "Reciclar significa:", options: ["Reaproveitar materiais", "Jogar tudo fora", "Queimar resíduos", "Misturar lixo limpo e sujo"], correct: "A" },
    ],
    "Geografia": [
      { text: "O mapa serve principalmente para:", options: ["Representar lugares", "Escrever poemas", "Fazer receitas", "Guardar fotos"], correct: "A" },
      { text: "Quando falamos do clima de uma região, pensamos em:", options: ["Temperatura e chuvas", "Nota da prova", "Nome do aluno", "Cor do caderno"], correct: "A" },
      { text: "Uma cidade faz parte de:", options: ["Um território", "Uma equação", "Uma rima", "Um verbo"], correct: "A" },
      { text: "A legenda do mapa ajuda a:", options: ["Entender os símbolos", "Apagar rios", "Mudar o relevo", "Trocar o idioma"], correct: "A" },
      { text: "Transporte público ajuda porque:", options: ["Move muitas pessoas", "Aumenta desertos", "Troca estações", "Cria montanhas"], correct: "A" },
    ],
    "História": [
      { text: "Documentos e objetos antigos ajudam a:", options: ["Conhecer o passado", "Mudar o futuro sozinhos", "Apagar memórias", "Trocar continentes"], correct: "A" },
      { text: "Uma linha do tempo organiza:", options: ["Fatos em sequência", "Apenas desenhos", "Só números pares", "Somente mapas"], correct: "A" },
      { text: "Quando estudamos a história do Brasil, observamos:", options: ["Mudanças ao longo do tempo", "Só contas", "Só plantas", "Só músicas"], correct: "A" },
      { text: "Museus são importantes porque:", options: ["Preservam memória e objetos", "Servem só para lazer", "Substituem escolas", "Guardam apenas livros novos"], correct: "A" },
      { text: "Uma fonte histórica pode ser:", options: ["Carta, foto ou objeto", "Apenas aplicativo", "Só jogo digital", "Somente filme atual"], correct: "A" },
    ],
    "Inglês": [
      { text: "A palavra 'book' significa:", options: ["Livro", "Mesa", "Janela", "Rua"], correct: "A" },
      { text: "A saudação 'good morning' é usada em:", options: ["Bom dia", "Boa noite", "Boa tarde", "Até logo"], correct: "A" },
      { text: "A palavra 'blue' é uma:", options: ["Cor", "Comida", "Profissão", "Cidade"], correct: "A" },
      { text: "Em inglês, 'school' quer dizer:", options: ["Escola", "Sapato", "Caneta", "Mochila"], correct: "A" },
      { text: "A expressão 'thank you' é usada para:", options: ["Agradecer", "Dormir", "Pular", "Estudar"], correct: "A" },
    ],
    "Arte": [
      { text: "Uma obra de arte pode expressar:", options: ["Ideias e sentimentos", "Só números", "Só receitas", "Só regras"], correct: "A" },
      { text: "Misturar cores é uma forma de:", options: ["Experimentação artística", "Apagar a folha", "Copiar prova", "Medir temperatura"], correct: "A" },
      { text: "No desenho, o contorno ajuda a:", options: ["Definir formas", "Parar a leitura", "Somar valores", "Trocar letras"], correct: "A" },
      { text: "A música é uma linguagem artística porque:", options: ["Comunica sensações", "Serve só para silêncio", "Não tem ritmo", "Não usa sons"], correct: "A" },
      { text: "Ao observar uma pintura, podemos notar:", options: ["Cores, formas e composição", "Só o nome do pincel", "Apenas a moldura", "Somente o preço"], correct: "A" },
    ],
    "Lógica": [
      { text: "Se hoje é terça, o dia seguinte é:", options: ["Quarta", "Segunda", "Sexta", "Domingo"], correct: "A" },
      { text: "Qual padrão continua a sequência 2, 4, 6, ...?", options: ["8", "7", "5", "3"], correct: "A" },
      { text: "Em um problema lógico, o melhor primeiro passo é:", options: ["Ler com atenção", "Chutar rápido", "Ignorar dados", "Trocar a pergunta"], correct: "A" },
      { text: "Se todos os quadrados têm 4 lados, então um quadrado é:", options: ["Uma figura de 4 lados", "Um círculo", "Um triângulo", "Uma linha"], correct: "A" },
      { text: "Quando eliminamos alternativas impossíveis, estamos:", options: ["Usando estratégia lógica", "Apagando a prova", "Desenhando mapas", "Mudando o idioma"], correct: "A" },
    ],
  };

  const sampleSet = sampleBySubject[subject] || sampleBySubject["Português"];
  return sampleSet.slice(0, roundSize).map((item) => ({
    grade: normalizedGrade,
    age,
    subject,
    level: "Exemplo",
    text: item.text,
    options: item.options,
    correct: item.correct,
  }));
}

function initializeRoundFromQuestions(questionSet) {
  roundQuestions = questionSet;
  currentIndex = 0;
  selectedAnswer = "";
  correctCount = 0;
  firstAttemptResults = [];
  answered = false;
  retryPending = false;
  retryQuestionMode = false;
}

function getUnlockMinutes() {
  const rawMinutes = Number(localStorage.getItem("smartUnlockMinutes") || "15");
  const allowedMinutes = [1, 5, 10, 15, 20, 30, 45];
  return allowedMinutes.includes(rawMinutes) ? rawMinutes : 30;
}

function getInitialSetup() {
  try {
    return JSON.parse(localStorage.getItem(initialSetupStorageKey) || "null");
  } catch {
    return null;
  }
}

function hasInitialSetup() {
  const setup = getInitialSetup();
  return Boolean(
    setup?.responsibleName &&
      setup?.responsibleEmail &&
      setup?.studentName &&
      setup?.grade &&
      localStorage.getItem(parentPasswordStorageKey),
  );
}

function buildDefaultSetupProfile() {
  return {
    responsibleName: defaultResponsibleName,
    responsibleEmail: defaultResponsibleEmail,
    studentName: defaultStudentName,
    grade: defaultStudentGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildTesterSetupProfile() {
  return {
    responsibleName: testerResponsibleName,
    responsibleEmail: testerResponsibleEmail,
    studentName: testerStudentName,
    grade: testerStudentGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildHelenaTesterProfile() {
  return {
    responsibleName: helenaTesterName,
    responsibleEmail: helenaTesterEmail,
    studentName: helenaTesterStudentName,
    grade: helenaTesterGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildPedroTesterProfile() {
  return {
    responsibleName: pedroTesterName,
    responsibleEmail: pedroTesterEmail,
    studentName: pedroTesterStudentName,
    grade: pedroTesterGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildRodneyTesterProfile() {
  return {
    responsibleName: rodneyTesterName,
    responsibleEmail: rodneyTesterEmail,
    studentName: rodneyTesterStudentName,
    grade: rodneyTesterGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildMaofTesterProfile() {
  return {
    responsibleName: maofTesterName,
    responsibleEmail: maofTesterEmail,
    studentName: maofTesterStudentName,
    grade: maofTesterGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildAmelidanTesterProfile() {
  return {
    responsibleName: amelidanTesterName,
    responsibleEmail: amelidanTesterEmail,
    studentName: amelidanTesterStudentName,
    grade: amelidanTesterGrade,
    accessEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

function buildBootstrapProfileSnapshot(profile, parentPassword) {
  return {
    ...profile,
    parentPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  };
}

function createLocalDeviceId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getLocalDeviceId() {
  const existing = localStorage.getItem(localDeviceIdStorageKey);
  if (existing) return existing;
  const next = createLocalDeviceId();
  localStorage.setItem(localDeviceIdStorageKey, next);
  return next;
}

function getAdminOwnerDeviceId() {
  return localStorage.getItem(adminOwnerDeviceStorageKey) || "";
}

function isLocalAdminConsole() {
  const { protocol, hostname } = window.location;
  return protocol === "file:" || hostname === "127.0.0.1" || hostname === "localhost";
}

async function ensureAdminDeviceOwnership() {
  const setup = getInitialSetup();
  if (getProfileDocId(setup?.responsibleEmail) !== defaultResponsibleEmail) return;

  const existingOwner = getAdminOwnerDeviceId();
  if (existingOwner) return;

  const localDeviceId = getLocalDeviceId();
  localStorage.setItem(adminOwnerDeviceStorageKey, localDeviceId);
  await saveRemoteProfileSnapshot({ adminDeviceId: localDeviceId });
  renderAccessControl();
}

async function ensureDefaultSetupProfile() {
  const profile = buildDefaultSetupProfile();
  localStorage.setItem(initialSetupStorageKey, JSON.stringify(profile));
  localStorage.setItem(parentPasswordStorageKey, defaultParentPassword);
  localStorage.setItem("smartUnlockStudentGrade", profile.grade);
  await saveRemoteProfileSnapshot({
    responsibleName: profile.responsibleName,
    responsibleEmail: profile.responsibleEmail,
    studentName: profile.studentName,
    grade: profile.grade,
    accessEnabled: true,
    parentPassword: defaultParentPassword,
  });
  renderStudentGradeDisplay();
  renderImportButtonLabel();
  refreshStudentGradePreview();
  renderProfileMenu();
  await refreshManagedAccessProfile();
  return profile;
}

async function ensureTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(testerResponsibleEmail);
  if (existingRemoteProfile) return existingRemoteProfile;

  const testerProfile = buildTesterSetupProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: testerParentPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(testerResponsibleEmail);
}

async function ensureHelenaTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(helenaTesterEmail);
  if (existingRemoteProfile) {
    if (existingRemoteProfile.accessEnabled === false || existingRemoteProfile.parentPassword !== helenaTesterPassword) {
      await saveRemoteProfileSnapshotForProfile({
        ...existingRemoteProfile,
        responsibleName: helenaTesterName,
        responsibleEmail: helenaTesterEmail,
        studentName: helenaTesterStudentName,
        grade: helenaTesterGrade,
        parentPassword: helenaTesterPassword,
        accessEnabled: true,
      });
      return loadRemoteProfileSnapshot(helenaTesterEmail);
    }
    return existingRemoteProfile;
  }

  const testerProfile = buildHelenaTesterProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: helenaTesterPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(helenaTesterEmail);
}

async function ensurePedroTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(pedroTesterEmail);
  if (existingRemoteProfile) {
    if (existingRemoteProfile.accessEnabled === false || existingRemoteProfile.parentPassword !== pedroTesterPassword) {
      await saveRemoteProfileSnapshotForProfile({
        ...existingRemoteProfile,
        responsibleName: pedroTesterName,
        responsibleEmail: pedroTesterEmail,
        studentName: pedroTesterStudentName,
        grade: pedroTesterGrade,
        parentPassword: pedroTesterPassword,
        accessEnabled: true,
      });
      return loadRemoteProfileSnapshot(pedroTesterEmail);
    }
    return existingRemoteProfile;
  }

  const testerProfile = buildPedroTesterProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: pedroTesterPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(pedroTesterEmail);
}

async function ensureRodneyTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(rodneyTesterEmail);
  if (existingRemoteProfile) {
    if (existingRemoteProfile.accessEnabled === false || existingRemoteProfile.parentPassword !== rodneyTesterPassword) {
      await saveRemoteProfileSnapshotForProfile({
        ...existingRemoteProfile,
        responsibleName: rodneyTesterName,
        responsibleEmail: rodneyTesterEmail,
        studentName: rodneyTesterStudentName,
        grade: rodneyTesterGrade,
        parentPassword: rodneyTesterPassword,
        accessEnabled: true,
      });
      return loadRemoteProfileSnapshot(rodneyTesterEmail);
    }
    return existingRemoteProfile;
  }

  const testerProfile = buildRodneyTesterProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: rodneyTesterPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(rodneyTesterEmail);
}

async function ensureMaofTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(maofTesterEmail);
  if (existingRemoteProfile) {
    if (existingRemoteProfile.accessEnabled === false || existingRemoteProfile.parentPassword !== maofTesterPassword) {
      await saveRemoteProfileSnapshotForProfile({
        ...existingRemoteProfile,
        responsibleName: maofTesterName,
        responsibleEmail: maofTesterEmail,
        studentName: maofTesterStudentName,
        grade: maofTesterGrade,
        parentPassword: maofTesterPassword,
        accessEnabled: true,
      });
      return loadRemoteProfileSnapshot(maofTesterEmail);
    }
    return existingRemoteProfile;
  }

  const testerProfile = buildMaofTesterProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: maofTesterPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(maofTesterEmail);
}

async function ensureAmelidanTesterRemoteProfile() {
  const existingRemoteProfile = await loadRemoteProfileSnapshot(amelidanTesterEmail);
  if (existingRemoteProfile) {
    if (existingRemoteProfile.accessEnabled === false || existingRemoteProfile.parentPassword !== amelidanTesterPassword) {
      await saveRemoteProfileSnapshotForProfile({
        ...existingRemoteProfile,
        responsibleName: amelidanTesterName,
        responsibleEmail: amelidanTesterEmail,
        studentName: amelidanTesterStudentName,
        grade: amelidanTesterGrade,
        parentPassword: amelidanTesterPassword,
        accessEnabled: true,
      });
      return loadRemoteProfileSnapshot(amelidanTesterEmail);
    }
    return existingRemoteProfile;
  }

  const testerProfile = buildAmelidanTesterProfile();
  await saveRemoteProfileSnapshotForProfile({
    ...testerProfile,
    parentPassword: amelidanTesterPassword,
    unlockMinutes: 15,
    adminDeviceId: "",
    questionBank: createEmptyQuestionBank(),
    results: [],
    performanceByYear: {},
    activeSubjectsByGrade: {},
    questionsUpdatedAt: "",
  });

  return loadRemoteProfileSnapshot(amelidanTesterEmail);
}

function showInitialSetupGate(prefill = {}) {
  hideLoginGate();
  document.body.classList.add("login-visual-light");
  initialSetupGate.hidden = false;
  initialSetupGate.removeAttribute("hidden");
  initialSetupGate.setAttribute("aria-hidden", "false");
  initialSetupError.textContent = "";
  responsibleNameInput.value = String(prefill.responsibleName || "");
  responsibleEmailInput.value = String(prefill.responsibleEmail || "");
  studentNameInput.value = String(prefill.studentName || "");
  setupGradeSelect.value = String(prefill.grade || "");
  setupPasswordInput.value = "";
  setupPasswordConfirmInput.value = "";
}

function isLocalAssetPreview() {
  return window.location.protocol === "file:";
}

async function handleGoogleAccess() {
  if (!remoteProfilesEnabled) {
    openSetupWarningModal("Entrar com Google está desativado nesta versão do aplicativo.");
    return;
  }

  if (isLocalAssetPreview()) {
    openSetupWarningModal("Entrar com Google vai funcionar no app publicado em servidor HTTPS. Nesta visualização local do APK ele ainda não conclui o login.");
    return;
  }

  if (loginError) {
    loginError.textContent = "";
  }

  if (loginWithGoogleButton) {
    loginWithGoogleButton.disabled = true;
  }

  try {
    const firebaseReady = await ensureFirebaseLibraries();
    if (!firebaseReady) {
      throw new Error("Firebase Auth ainda não está disponível neste ambiente.");
    }

    const auth = getFirebaseAuthInstance();
    if (!auth) {
      throw new Error("Não foi possível inicializar o login com Google.");
    }

    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await auth.signInWithPopup(provider);
    const user = result?.user;
    const responsibleEmail = getProfileDocId(user?.email || "");
    const responsibleName = String(user?.displayName || "").trim() || "Responsável";

    if (!responsibleEmail) {
      throw new Error("Sua conta Google não retornou um e-mail válido.");
    }

    const remoteProfile = await loadRemoteProfileSnapshot(responsibleEmail);

    if (remoteProfile) {
      if (remoteProfile.accessEnabled === false) {
        throw new Error("Acesso desativado para este cadastro.");
      }

      applyRemoteProfileSnapshot(remoteProfile);
      storeActiveSessionEmail(responsibleEmail);
      syncNativeResponsibleConfig();
      await ensureAdminDeviceOwnership();
      await refreshManagedAccessProfile();
      subscribeToActiveProfile(responsibleEmail);
      hideLoginGate();
      continueAfterAccess();
    } else {
      clearActiveSessionEmail();
      showInitialSetupGate({
        responsibleName,
        responsibleEmail,
      });
      initialSetupError.textContent = "Complete o cadastro para finalizar sua entrada com Google.";
      studentNameInput?.focus();
    }

    try {
      await auth.signOut();
    } catch (_) {
      // Mantemos o fluxo local mesmo se o sign-out do provedor falhar.
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível entrar com o Google.";
    if (loginError) {
      loginError.textContent = message;
    } else {
      openSetupWarningModal(message);
    }
  } finally {
    if (loginWithGoogleButton) {
      loginWithGoogleButton.disabled = false;
    }
  }
}

function hideInitialSetupGate() {
  initialSetupGate.hidden = true;
  initialSetupGate.setAttribute("hidden", "");
  initialSetupGate.setAttribute("aria-hidden", "true");
  document.body.classList.remove("login-visual-light");
}

function populateLoginGateUi() {
  document.body.classList.add("login-visual-light");
  loginGate.hidden = false;
  loginGate.removeAttribute("hidden");
  loginGate.setAttribute("aria-hidden", "false");
  loginError.textContent = "";
  const localSetup = getInitialSetup();
  const storedSessionEmail = getStoredActiveSessionEmail();
  const recognizedEmail = getProfileDocId(
    localSetup?.responsibleEmail || storedSessionEmail || getCurrentProfileEmail() || "",
  );
  const hasRecognizedProfile = Boolean(recognizedEmail);
  loginEmailInput.value = hasRecognizedProfile ? recognizedEmail : "";
  loginPasswordInput.value = "";
  loginEmailInput.hidden = hasRecognizedProfile;
  loginEmailInput.disabled = hasRecognizedProfile;
  if (loginRecognizedHint) {
    const recognizedName = localSetup?.responsibleName?.trim() || "Cadastro reconhecido";
    loginRecognizedHint.textContent = hasRecognizedProfile
      ? `${recognizedName}, digite apenas a senha para entrar.`
      : "";
    loginRecognizedHint.hidden = !hasRecognizedProfile;
  }
  if (loginWithGoogleButton) {
    loginWithGoogleButton.hidden = !remoteProfilesEnabled;
    loginWithGoogleButton.disabled = !remoteProfilesEnabled;
  }
  const loginDescription = loginGate.querySelector(".login-screen__description");
  if (loginDescription) {
    loginDescription.textContent = "Controle Educativo";
  }
}

function showProtectedCycleLoginGate() {
  hideLoginGate();
  closeProfileMenu(false);
  setActiveView(postLoginOnlyMode ? "parent" : "child");
  restoreUnlockState();
}

function populateProtectedCycleLoginGateUi() {
  hideLoginGate();
}

function showLoginGate() {
  clearActiveProfileSubscription();
  clearManagedAccessProfileSubscription();
  closeTestLogoutModal();
  responsibleEntryAuthorized = false;
  clearResponsibleEntryForm();
  if (staticParentPrototypeMode) {
    prototypeSelectionsInitialized = false;
    prototypeTimeExplicitlySelected = false;
    resetPrototypeSubjectSelections();
  }
  hideInitialSetupGate();
  hidePasswordGate();
  clearAppClosingTransition();
  clearRetryRestartTimer();
  clearUnlockTimer();
  setTestModeEnabled(false);
  localStorage.removeItem("smartUnlockUnlockedUntil");
  renderIdleStudentState();
  populateLoginGateUi();
  document.body.classList.remove("parent-home-only");
}

function shouldBlockDashboardDuringCycle() {
  return false;
}

function forceLoginGateState() {
  if (consumeBypassLoginReturnOnce()) {
    return;
  }
  clearActiveSessionEmail();
  clearActiveProfileSubscription();
  clearManagedAccessProfileSubscription();
  closeProfileMenu(false);
  setActiveView("child");
  showLoginGate();
}

function hideLoginGate() {
  loginGate.hidden = true;
  loginGate.setAttribute("hidden", "");
  loginGate.setAttribute("aria-hidden", "true");
  loginError.textContent = "";
  document.body.classList.remove("login-visual-light");
}

function clearResponsibleEntryForm() {
  if (responsibleEntryError) {
    responsibleEntryError.textContent = "";
  }
  if (responsibleEntryPasswordInput) {
    responsibleEntryPasswordInput.value = "";
  }
}

function focusResponsibleEntryInput() {
  window.setTimeout(() => responsibleEntryPasswordInput?.focus(), 30);
}

function shouldRequireResponsibleEntryGate(view) {
  return (
    view === "parent" &&
    Boolean(responsibleEntryView) &&
    !responsibleEntryAuthorized &&
    !isTestModeEnabled() &&
    !hasActiveUnlockWindow()
  );
}

function unlockResponsibleEntryView() {
  responsibleEntryAuthorized = true;
  clearResponsibleEntryForm();
  setActiveView("parent");
}

function tryUnlockResponsibleEntryView() {
  if (!responsibleEntryPasswordInput || !responsibleEntryError) {
    setActiveView("parent");
    return;
  }
  const password = String(responsibleEntryPasswordInput?.value || "").trim();
  if (!password) {
    responsibleEntryError.textContent = "Digite a senha do responsável.";
    responsibleEntryPasswordInput?.focus();
    return;
  }
  if (!matchesLocalParentPassword(password)) {
    responsibleEntryError.textContent = "Senha incorreta.";
    responsibleEntryPasswordInput?.select();
    return;
  }
  unlockResponsibleEntryView();
}

async function tryRestoreActiveSession() {
  const sessionEmail = getStoredActiveSessionEmail();
  if (!sessionEmail) return false;

  if (isDisabledGeneratedTesterEmail(sessionEmail)) {
    clearActiveSessionEmail();
    forceReturnToLogin("Acesso desativado para este cadastro.");
    return true;
  }

  if (!remoteProfilesEnabled) {
    const setup = getInitialSetup();
    const localEmail = getProfileDocId(setup?.responsibleEmail || "");
    if (!localEmail || sessionEmail !== localEmail) {
      clearActiveSessionEmail();
      return false;
    }

    hideLoginGate();
    continueAfterAccess();
    return true;
  }

  const remoteProfile = await loadRemoteProfileSnapshot(sessionEmail);
  if (!remoteProfile) {
    clearActiveSessionEmail();
    return false;
  }

  if (remoteProfile.accessEnabled === false && sessionEmail !== defaultResponsibleEmail) {
    clearActiveSessionEmail();
    forceReturnToLogin("Acesso desativado para este cadastro.");
    return true;
  }

  applyRemoteProfileSnapshot(remoteProfile);
  syncNativeResponsibleConfig();
  await refreshManagedAccessProfile();
  subscribeToActiveProfile(sessionEmail);
  if (sessionEmail === defaultResponsibleEmail) {
    subscribeToManagedAccessProfile();
  }

  hideLoginGate();
  continueAfterAccess();
  return true;
}

function renderProfileMenu() {
  const formattedDate = new Intl.DateTimeFormat("pt-BR").format(new Date());
  const latestResult = getLatestResult();
  const aiVersionModeEnabled = isAiVersionModeEnabled();
  const parentDashboardMode = getParentDashboardMode();

  if (menuSummaryDate) {
    menuSummaryDate.textContent = formattedDate;
  }

  if (menuSummaryTime) {
    menuSummaryTime.textContent =
      latestResult?.passed && Number(latestResult.unlockMinutes || 0) > 0
        ? formatMinutesLabel(Number(latestResult.unlockMinutes || 0))
        : "";
  }

  if (menuSummaryRounds) {
    menuSummaryRounds.textContent = latestResult ? "1" : "";
  }

  if (menuSummaryBest) {
    menuSummaryBest.textContent = getBestSubjectsSummary(latestResult);
  }

  if (menuSummaryNeeds) {
    menuSummaryNeeds.textContent = getNeedsImprovementSummary(latestResult);
  }

  if (menuSummaryFocus) {
    menuSummaryFocus.textContent = getFocusSummary(latestResult);
  }

  if (openStandardVersionButton) {
    openStandardVersionButton.classList.toggle("is-active", !aiVersionModeEnabled);
    openStandardVersionButton.setAttribute("aria-pressed", !aiVersionModeEnabled ? "true" : "false");
  }

  if (openAiVersionButton) {
    openAiVersionButton.classList.toggle("is-active", aiVersionModeEnabled);
    openAiVersionButton.setAttribute("aria-pressed", aiVersionModeEnabled ? "true" : "false");
  }

  if (openStudyGuidedDashboardButton) {
    const isStudyGuidedMode = parentDashboardMode === "study-guided";
    openStudyGuidedDashboardButton.classList.toggle("is-active", isStudyGuidedMode);
    openStudyGuidedDashboardButton.setAttribute("aria-pressed", isStudyGuidedMode ? "true" : "false");
  }

  if (openTestsDashboardButton) {
    const isTestsMode = parentDashboardMode === "tests";
    openTestsDashboardButton.classList.toggle("is-active", isTestsMode);
    openTestsDashboardButton.setAttribute("aria-pressed", isTestsMode ? "true" : "false");
  }
}

function closeStudentGradePrototypeMenu() {
  if (studentGradePrototypeTrigger) {
    studentGradePrototypeTrigger.setAttribute("aria-expanded", "false");
  }
  studentGradePrototypeTrigger?.closest(".prototype-grade-shell")?.classList.remove("is-open");
  if (studentGradePrototypeMenu) {
    studentGradePrototypeMenu.hidden = true;
  }
}

function closeStudentGradeUpperPrototypeMenu() {
  if (studentGradeUpperPrototypeTrigger) {
    studentGradeUpperPrototypeTrigger.setAttribute("aria-expanded", "false");
  }
  studentGradeUpperPrototypeTrigger?.closest(".prototype-grade-upper-shell")?.classList.remove("is-open");
  if (studentGradeUpperPrototypeMenu) {
    studentGradeUpperPrototypeMenu.hidden = true;
  }
}

function closeUnlockTimePrototypeMenu() {
  if (unlockTimePrototypeTrigger) {
    unlockTimePrototypeTrigger.setAttribute("aria-expanded", "false");
  }
  unlockTimePrototypeTrigger?.closest(".prototype-time-shell")?.classList.remove("is-open");
  if (unlockTimePrototypeMenu) {
    unlockTimePrototypeMenu.hidden = true;
  }
}

function syncStudentGradePrototypeLabel() {
  if (!studentGradePrototypeTrigger || !studentGradeDisplay) return;
  if (prototypeSelectedGradeGroup === "lower") {
    const selectedOption = studentGradeDisplay.options[studentGradeDisplay.selectedIndex];
    studentGradePrototypeTrigger.textContent = selectedOption?.textContent || "Fundamental I";
    return;
  }
  studentGradePrototypeTrigger.textContent = "Fundamental I";
}

function syncStudentGradeUpperPrototypeLabel() {
  if (!studentGradeUpperPrototypeTrigger || !studentGradeDisplayUpper) return;
  if (prototypeSelectedGradeGroup === "upper") {
    const selectedOption = studentGradeDisplayUpper.options[studentGradeDisplayUpper.selectedIndex];
    studentGradeUpperPrototypeTrigger.textContent = selectedOption?.textContent || "Fundamental II";
    return;
  }
  studentGradeUpperPrototypeTrigger.textContent = "Fundamental II";
}

function syncUnlockTimePrototypeLabel() {
  if (!unlockTimePrototypeTrigger || !unlockTimeSelect) return;
  if (!prototypeTimeExplicitlySelected) {
    unlockTimePrototypeTrigger.textContent = "Tempo de uso do celular";
    return;
  }
  const selectedOption = unlockTimeSelect.options[unlockTimeSelect.selectedIndex];
  unlockTimePrototypeTrigger.textContent = selectedOption?.textContent || "Tempo de uso do celular";
}

function applyPrototypeGradeSelection(rawGrade) {
  const grade = normalizeSupportedStudentGrade(rawGrade);
  if (!grade) return;

  const previousGrade = getSelectedGrade();
  prototypeSelectedGradeGroup = ["3º", "4º", "5º"].includes(grade) ? "lower" : "upper";
  localStorage.setItem("smartUnlockStudentGrade", grade);
  updateInitialSetup({ grade });
  if (isAiVersionModeEnabled() && previousGrade && previousGrade !== grade) {
    clearAiGenerationState();
  }
  syncStudentGradePrototypeLabel();
  syncStudentGradeUpperPrototypeLabel();
  renderSubjectRanking();
  refreshStudentGradePreview();
  renderAiDashboardConfig();
  renderQuestionBankStatus();
}

function populateStudentGradePrototypeMenu() {
  if (!studentGradeDisplay || !studentGradePrototypeMenu) return;
  const options = Array.from(studentGradeDisplay.options);
  studentGradePrototypeMenu.innerHTML = "";

  options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "prototype-grade-option";
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => {
      studentGradeDisplay.value = option.value;
      syncStudentGradePrototypeLabel();
      closeStudentGradePrototypeMenu();
      studentGradeDisplay.dispatchEvent(new Event("change", { bubbles: true }));
    });
    studentGradePrototypeMenu.appendChild(optionButton);
  });
}

function populateStudentGradeUpperPrototypeMenu() {
  if (!studentGradeDisplayUpper || !studentGradeUpperPrototypeMenu) return;
  const options = Array.from(studentGradeDisplayUpper.options);
  studentGradeUpperPrototypeMenu.innerHTML = "";

  options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "prototype-grade-option";
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => {
      studentGradeDisplayUpper.value = option.value;
      syncStudentGradeUpperPrototypeLabel();
      closeStudentGradeUpperPrototypeMenu();
      studentGradeDisplayUpper.dispatchEvent(new Event("change", { bubbles: true }));
    });
    studentGradeUpperPrototypeMenu.appendChild(optionButton);
  });
}

function populateUnlockTimePrototypeMenu() {
  if (!unlockTimeSelect || !unlockTimePrototypeMenu) return;
  const options = Array.from(unlockTimeSelect.options);
  unlockTimePrototypeMenu.innerHTML = "";

  options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "prototype-grade-option";
    optionButton.textContent = option.textContent;
    optionButton.addEventListener("click", () => {
      prototypeTimeExplicitlySelected = true;
      unlockTimeSelect.value = option.value;
      syncUnlockTimePrototypeLabel();
      closeUnlockTimePrototypeMenu();
      unlockTimeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    unlockTimePrototypeMenu.appendChild(optionButton);
  });
}

function applyStaticParentPrototypeMode(options = {}) {
  const { resetSelections = false } = options;
  if (!staticParentPrototypeMode) return;
  const needsInitialReset = !prototypeSelectionsInitialized;
  if (!prototypeSelectionsInitialized) {
    resetPrototypeSubjectSelections();
    prototypeSelectionsInitialized = true;
  }

  const shouldResetSelections = resetSelections || needsInitialReset;

  if (shouldResetSelections) {
    prototypeSelectedGradeGroup = "";
    prototypeTimeExplicitlySelected = false;

    if (studentGradeDisplay) {
      studentGradeDisplay.selectedIndex = 0;
    }

    if (studentGradeDisplayUpper) {
      studentGradeDisplayUpper.selectedIndex = 0;
    }

    if (unlockTimeSelect) {
      unlockTimeSelect.selectedIndex = 0;
    }
  }

  if (studentGradeDisplay) {
    populateStudentGradePrototypeMenu();
    syncStudentGradePrototypeLabel();
  }

  if (studentGradeDisplayUpper) {
    populateStudentGradeUpperPrototypeMenu();
    syncStudentGradeUpperPrototypeLabel();
  }

  if (unlockTimeSelect) {
    populateUnlockTimePrototypeMenu();
    syncUnlockTimePrototypeLabel();
  }

  if (manualUnlockButton) {
    manualUnlockButton.setAttribute("aria-pressed", "false");
  }

  [
    closeCadastroPanelButton,
    stopTestButton,
    accessToggleButton,
    clearResultsButton,
  ].forEach((element) => {
    if (!element) return;
    element.disabled = true;
    element.setAttribute("aria-disabled", "true");
  });

  [studentGradeDisplay, studentGradeDisplayUpper, unlockTimeSelect].forEach((element) => {
    if (!element) return;
    element.disabled = false;
    element.removeAttribute("aria-disabled");
  });

  if (importCurrentGradeButton) {
    importCurrentGradeButton.disabled = false;
    importCurrentGradeButton.removeAttribute("aria-disabled");
  }

  if (stopTestButton) {
    stopTestButton.hidden = true;
  }

  if (questionBankStatus) {
    questionBankStatus.hidden = true;
    questionBankStatus.textContent = "";
  }

  if (profileMenuPanel) {
    profileMenuPanel.hidden = true;
  }

  if (profileDetailsPanel) {
    profileDetailsPanel.hidden = true;
  }
}

function getPrototypeSetupValidation() {
  if (!prototypeSelectedGradeGroup) {
    return "Escolha o ano em Fundamental I ou Fundamental II antes de aplicar o teste.";
  }

  const selectedGrade = getSelectedGrade();
  const selectedSubjects = getCheckedSubjectsForGrade(selectedGrade);
  if (!selectedSubjects.length) {
    return "Selecione ao menos uma matéria antes de aplicar o teste.";
  }

  if (!prototypeTimeExplicitlySelected) {
    return "Escolha o tempo de uso do celular antes de aplicar o teste.";
  }

  const availableQuestions = (isAiVersionModeEnabled()
    ? getAiGeneratedQuestionsForGrade(selectedGrade)
    : getImportedQuestionsForGrade(selectedGrade)
  ).filter((question) =>
    selectedSubjects.includes(normalizeSubjectName(question.subject)),
  );

  if (!availableQuestions.length) {
    return isAiVersionModeEnabled()
      ? "Gere questões para o ano e as matérias selecionadas antes de aplicar o teste."
      : "Importe questões para o ano e as matérias selecionadas antes de aplicar o teste.";
  }

  return "";
}

function isAccessEnabled() {
  const setup = getInitialSetup();
  return setup?.accessEnabled !== false;
}

function getManagedAccessProfile() {
  return managedAccessProfile;
}

function isManagedAccessEnabled() {
  return managedAccessProfile?.accessEnabled !== false;
}

async function refreshManagedAccessProfile() {
  if (!remoteProfilesEnabled) {
    managedAccessProfile = {
      ...buildTesterSetupProfile(),
      accessEnabled: true,
    };
    renderAccessControl();
    return managedAccessProfile;
  }

  const remoteTesterProfile = await ensureTesterRemoteProfile();
  managedAccessProfile = remoteTesterProfile || {
    ...buildTesterSetupProfile(),
    accessEnabled: true,
  };
  renderAccessControl();
  return managedAccessProfile;
}

function updateInitialSetup(partial) {
  const setup = getInitialSetup();
  if (!setup) return null;
  const nextSetup = { ...setup, ...partial };
  localStorage.setItem(initialSetupStorageKey, JSON.stringify(nextSetup));
  return nextSetup;
}

function renderAccessControl() {
  if (!accessPanel || !accessStatusValue || !accessToggleButton || !accessStatusHint || !accessProfileValue) return;

  const setup = getInitialSetup();
  const isAdminProfile = getProfileDocId(setup?.responsibleEmail) === defaultResponsibleEmail;
  const shouldShowAdminControls = isAdminProfile || isLocalAdminConsole();
  accessPanel.hidden = !shouldShowAdminControls;
  if (!shouldShowAdminControls) return;

  const managedProfile = getManagedAccessProfile() || {
    ...buildTesterSetupProfile(),
    accessEnabled: true,
  };
  const enabled = isManagedAccessEnabled();
  const responsibleName = managedProfile.responsibleName?.trim() || testerResponsibleName;
  accessProfileValue.textContent = `Cadastro de teste controlado: ${responsibleName}`;
  accessStatusValue.textContent = enabled ? "Acesso liberado" : "Acesso desativado";
  accessStatusValue.classList.toggle("is-disabled", !enabled);
  accessStatusHint.textContent = enabled
    ? "Quem usar este cadastro de teste ainda pode entrar no aplicativo."
    : "Este cadastro de teste está bloqueado. Novos logins não entram até você reativar.";
  accessToggleButton.textContent = enabled ? "Desativar acesso" : "Ativar acesso";
}

function setProfileMenuOpen(isOpen) {
  profileMenuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (profileMenuAnimationTimerId) {
    window.clearTimeout(profileMenuAnimationTimerId);
    profileMenuAnimationTimerId = null;
  }
  if (isOpen) {
    if (profileMenuOverlay) {
      profileMenuOverlay.hidden = false;
    }
    profileMenuPanel.hidden = false;
    requestAnimationFrame(() => {
      profileMenuPanel.classList.add("is-open");
    });
  } else {
    profileMenuPanel.classList.remove("is-open");
    profileMenuAnimationTimerId = window.setTimeout(() => {
      if (profileMenuOverlay) {
        profileMenuOverlay.hidden = true;
      }
      profileMenuPanel.hidden = true;
      profileMenuAnimationTimerId = null;
    }, 280);
  }
  profileDetailsPanel.hidden = true;
}

function setProfileDetailsOpen(isOpen) {
  profileMenuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  profileMenuPanel.classList.remove("is-open");
  profileMenuPanel.hidden = true;
  profileDetailsPanel.hidden = !isOpen;
}

function closeProfileMenu(returnToWelcome = false) {
  setProfileMenuOpen(false);
  if (returnToWelcome) {
    if (postLoginOnlyMode) {
      setActiveView("parent");
      return;
    }
    setActiveView("child");
    renderWelcomeStudentState();
  }
}

function openHistoryFromSubmenu() {
  profileMenuButton.setAttribute("aria-expanded", "true");
  profileMenuPanel.hidden = true;
  profileDetailsPanel.hidden = true;
  requestProtectedView("history");
}

function continueAfterAccess() {
  hidePasswordGate();
  clearRetryRestartTimer();
  clearUnlockTimer();
  closeProfileMenu(false);
  setTestModeEnabled(false);
  localStorage.removeItem("smartUnlockUnlockedUntil");
  unlockedState.hidden = true;
  educationGate.hidden = true;
  phoneFrame.classList.add("screen-free");
  responsibleEntryAuthorized = false;
  clearResponsibleEntryForm();
  setActiveView(dashboardSelectorView ? "dashboard-selector" : (responsibleEntryView ? "responsible-entry" : "parent"));
  if (!postLoginOnlyMode) {
    renderIdleStudentState();
  }
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
    "6º": [],
    "7º": [],
    "8º": [],
    "9º": [],
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
      subject: normalizeSubjectName(question.subject),
    }));
  });

  return bank;
}

function getStoredQuestionBank() {
  return normalizeQuestionBank(JSON.parse(localStorage.getItem("smartUnlockQuestionBank") || "null"));
}

function clearStoredQuestionData() {
  localStorage.setItem("smartUnlockQuestionBank", JSON.stringify(createEmptyQuestionBank()));
  localStorage.removeItem(importedManifestStorageKey);
  localStorage.removeItem("smartUnlockQuestionsUpdatedAt");

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("smartUnlockQuestionQueue:") || key.startsWith("smartUnlockLastRoundQuestions:")) {
      localStorage.removeItem(key);
    }
  });
}

function ensureImportOnlyQuestionMode() {
  if (localStorage.getItem(questionImportOnlyResetStorageKey) === questionImportOnlyResetVersion) {
    return;
  }

  clearStoredQuestionData();
  localStorage.setItem(questionImportOnlyResetStorageKey, questionImportOnlyResetVersion);
  prototypeImportStatusMessage = "";
  prototypeCycleStatusMessage = "";
  void saveRemoteProfileSnapshot({
    questionBank: createEmptyQuestionBank(),
    questionsUpdatedAt: "",
  });
}

function getImportedManifest() {
  const rawManifest = JSON.parse(localStorage.getItem(importedManifestStorageKey) || "null");
  const manifest = createEmptyQuestionBank();

  supportedStudentGrades.forEach((grade) => {
    const source = Array.isArray(rawManifest?.[grade]) ? rawManifest[grade] : [];
    manifest[grade] = [...new Set(source.map((subject) => normalizeSubjectName(subject)).filter(Boolean))];
  });

  return manifest;
}

function saveImportedManifest(manifest) {
  localStorage.setItem(importedManifestStorageKey, JSON.stringify(manifest));
}

function registerImportedQuestions(questionList) {
  if (!Array.isArray(questionList) || !questionList.length) return;

  const manifest = getImportedManifest();
  questionList.forEach((question) => {
    const grade = normalizeGradeLabel(question.grade);
    const subject = normalizeSubjectName(question.subject);
    if (!manifest[grade]) {
      manifest[grade] = [];
    }
    if (subject && !manifest[grade].includes(subject)) {
      manifest[grade].push(subject);
    }
  });

  saveImportedManifest(manifest);
}

function saveQuestionBank(bank, options = {}) {
  localStorage.setItem("smartUnlockQuestionBank", JSON.stringify(normalizeQuestionBank(bank)));
  if (!options.skipRemoteSync) {
    void saveRemoteProfileSnapshot({ questionBank: normalizeQuestionBank(bank) });
  }
}

function getImportedQuestionsForGrade(grade) {
  return getStoredQuestionBank()[normalizeGradeLabel(grade)] || [];
}

function getBundledQuestionsForGrade(grade = getSelectedGrade()) {
  return [];
}

function formatAnswerOptionLabel(option) {
  const text = String(option || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildDissertativeAnswerInput(question) {
  const wrapper = document.createElement("div");
  wrapper.className = "answer-text-shell";

  const input = document.createElement("textarea");
  input.className = "answer-text-input";
  input.dataset.clipboardUnlocked = dissertativeRecoveryMode ? "true" : "false";
  input.rows = 4;
  input.placeholder = "Escreva sua resposta aqui";
  input.value = selectedTextAnswer;
  input.autocapitalize = "sentences";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.addEventListener("input", () => {
    if (answered) return;
    selectedTextAnswer = input.value;
    nextButton.disabled = !selectedTextAnswer.trim();
  });
  ["paste", "copy", "cut", "contextmenu"].forEach((eventName) => {
    input.addEventListener(eventName, blockSelectionAndClipboard);
  });
  input.addEventListener("keydown", blockClipboardShortcuts);

  wrapper.appendChild(input);
  return wrapper;
}

function replaceQuestionsForGrade(grade, questionList) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const questionBank = getStoredQuestionBank();
  questionBank[normalizedGrade] = ensureFourOptions(
    questionList.map((question) => ({
      ...question,
      grade: normalizedGrade,
      age: Number(question.age || inferAgeFromGrade(normalizedGrade)),
      subject: normalizeSubjectName(question.subject),
    })),
  );
  saveQuestionBank(questionBank);
  return questionBank;
}

function replaceAiGeneratedQuestionsForGrade(grade, questionList) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const questionBank = getAiGeneratedQuestionBank();
  questionBank[normalizedGrade] = ensureFourOptions(
    questionList.map((question) => ({
      ...question,
      grade: normalizedGrade,
      age: Number(question.age || inferAgeFromGrade(normalizedGrade)),
      subject: normalizeSubjectName(question.subject),
    })),
  );
  saveAiGeneratedQuestionBank(questionBank);
  return questionBank;
}

function getAiKnowledgeTopicForSubject(subject, draftOrRequest) {
  const normalizedSubject = normalizeSubjectName(subject);
  const knowledgeBase = draftOrRequest?.knowledgeBase ?? draftOrRequest?.knowledge ?? "";
  const lines = String(knowledgeBase || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const matchedLine = lines.find((line) => normalizeSubjectName(line.split(":")[0]) === normalizedSubject);
  if (matchedLine) {
    return matchedLine.split(":").slice(1).join(":").trim() || getSubjectDisplayLabel(subject);
  }

  return lines[0] || getSubjectDisplayLabel(subject);
}

function buildSimulatedAiMultipleChoiceQuestion({ request, subject, topic, grade, index }) {
  const subjectLabel = getSubjectDisplayLabel(subject);
  return {
    grade,
    age: inferAgeFromGrade(grade),
    subject,
    text: `${index + 1}. Em ${subjectLabel}, qual alternativa melhor representa o tema "${topic}" para o ${grade} ano?`,
    options: [
      `A ideia principal de ${topic}`,
      `Um assunto sem relação com ${subjectLabel}`,
      `Uma resposta fora do ${grade} ano`,
      `Uma alternativa genérica sem contexto`,
    ],
    correct: "A",
    answerMode: "choice",
    expectedAnswer: "",
    explanation: `${topic} aparece aqui como a ideia principal de ${subjectLabel}, respeitando o nível do ${grade} ano.`,
    generatedBy: "ai-simulated",
  };
}

function buildSimulatedAiDissertativeQuestion({ request, subject, topic, grade, index }) {
  const subjectLabel = getSubjectDisplayLabel(subject);
  return {
    grade,
    age: inferAgeFromGrade(grade),
    subject,
    text: `${index + 1}. Explique com suas palavras, em ${subjectLabel}, o que você aprendeu sobre "${topic}" no ${grade} ano.`,
    options: [],
    correct: "",
    answerMode: "text",
    expectedAnswer: `Uma boa resposta deve explicar o tema ${topic} com linguagem adequada para ${subjectLabel}, mostrando compreensão do conteúdo estudado no ${grade} ano.`,
    explanation: `Revise os pontos principais de ${topic} em ${subjectLabel} e escreva com suas palavras.`,
    generatedBy: "ai-simulated",
  };
}

function buildSimulatedAiGenerationResponse(payload) {
  const request = payload?.request;
  if (!request) {
    return {
      metadata: {
        grade: "",
        subjects: [],
        count: 0,
        generatedAt: new Date().toISOString(),
      },
      questions: [],
    };
  }

  const grade = normalizeGradeLabel(request.grade);
  const subjects = Array.isArray(request.subjects) ? request.subjects : [];
  const questionTypes = request.questionTypes || {};
  const count = Math.max(1, Number(request.count || 5));
  const typeSequence = [
    ...(questionTypes.choice ? ["choice"] : []),
    ...(questionTypes.text ? ["text"] : []),
  ];

  if (!grade || !subjects.length || !typeSequence.length) {
    return {
      metadata: {
        grade,
        subjects,
        count,
        generatedAt: new Date().toISOString(),
      },
      questions: [],
    };
  }

  const questions = Array.from({ length: count }, (_, index) => {
    const subject = subjects[index % subjects.length];
    const topic = getAiKnowledgeTopicForSubject(subject, request);
    const type = typeSequence[index % typeSequence.length];

    if (type === "text") {
      return buildSimulatedAiDissertativeQuestion({ request, subject, topic, grade, index });
    }

    return buildSimulatedAiMultipleChoiceQuestion({ request, subject, topic, grade, index });
  });

  return {
    metadata: {
      grade,
      subjects,
      count,
      generatedAt: new Date().toISOString(),
    },
    questions,
  };
}

function parseAiGenerationResponse(rawResponse, payload) {
  const request = payload?.request;
  if (!request) {
    throw new Error("A configuração da Versão IA ainda não está pronta para gerar questões.");
  }

  let response = rawResponse;
  if (typeof rawResponse === "string") {
    try {
      response = JSON.parse(rawResponse);
    } catch {
      throw new Error("A IA devolveu um texto inválido. Precisamos de um JSON válido para continuar.");
    }
  }

  if (!response || typeof response !== "object") {
    throw new Error("A resposta da IA veio vazia ou em um formato inesperado.");
  }

  const metadata = response.metadata && typeof response.metadata === "object" ? response.metadata : {};
  const rawQuestions = Array.isArray(response.questions) ? response.questions : null;

  if (!rawQuestions) {
    throw new Error("A resposta da IA não trouxe a lista de questões.");
  }

  if (rawQuestions.length !== request.count) {
    throw new Error(`A IA devolveu ${rawQuestions.length} questão(ões), mas o pedido era de ${request.count}.`);
  }

  const allowedSubjects = request.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean);
  const metadataSubjects = Array.isArray(metadata.subjects)
    ? metadata.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
    : [];

  if (metadataSubjects.length) {
    const metadataSubjectSet = [...new Set(metadataSubjects)].sort();
    const allowedSubjectSet = [...new Set(allowedSubjects)].sort();

    if (JSON.stringify(metadataSubjectSet) !== JSON.stringify(allowedSubjectSet)) {
      throw new Error("A IA devolveu uma lista de matérias diferente da que foi escolhida para a geração.");
    }
  }

  const parsedQuestions = rawQuestions.map((rawQuestion, index) => {
    if (!rawQuestion || typeof rawQuestion !== "object") {
      throw new Error(`A questão ${index + 1} veio em formato inválido.`);
    }

    const subject = normalizeSubjectName(rawQuestion.subject || "");
    if (!allowedSubjects.includes(subject)) {
      throw new Error(`A questão ${index + 1} veio com uma matéria fora das selecionadas.`);
    }

    const answerMode = rawQuestion.answerMode === "text" ? "text" : rawQuestion.answerMode === "choice" ? "choice" : "";
    if (!answerMode) {
      throw new Error(`A questão ${index + 1} não informou um tipo válido.`);
    }

    if (answerMode === "choice" && !request.questionTypes.choice) {
      throw new Error(`A questão ${index + 1} veio como múltipla escolha, mas esse tipo não foi selecionado.`);
    }

    if (answerMode === "text" && !request.questionTypes.text) {
      throw new Error(`A questão ${index + 1} veio como dissertativa, mas esse tipo não foi selecionado.`);
    }

    const text = String(rawQuestion.text || "").trim();
    if (!text) {
      throw new Error(`A questão ${index + 1} veio sem enunciado.`);
    }

    const explanation = String(rawQuestion.explanation || "").trim();
    if (!explanation) {
      throw new Error(`A questão ${index + 1} veio sem explicação.`);
    }

    const parsedQuestion = {
      grade: request.grade,
      age: inferAgeFromGrade(request.grade),
      subject,
      text,
      answerMode,
      options: [],
      correct: "",
      expectedAnswer: "",
      explanation,
      generatedBy: "ai-structured",
    };

    if (answerMode === "choice") {
      const options = Array.isArray(rawQuestion.options)
        ? rawQuestion.options.map((option) => String(option || "").trim()).filter(Boolean)
        : [];
      if (options.length !== 4) {
        throw new Error(`A questão ${index + 1} precisa ter exatamente 4 alternativas.`);
      }

      const correct = String(rawQuestion.correct || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(correct)) {
        throw new Error(`A questão ${index + 1} precisa informar a alternativa correta entre A e D.`);
      }

      parsedQuestion.options = options;
      parsedQuestion.correct = correct;
      parsedQuestion.expectedAnswer = "";
      return parsedQuestion;
    }

    parsedQuestion.options = [];
    parsedQuestion.correct = "";
    parsedQuestion.expectedAnswer = String(rawQuestion.expectedAnswer || "").trim();
    if (!parsedQuestion.expectedAnswer) {
      throw new Error(`A questão ${index + 1} precisa informar a resposta esperada da dissertativa.`);
    }

    return parsedQuestion;
  });

  return {
    metadata: {
      grade: normalizeGradeLabel(metadata.grade || request.grade),
      subjects: Array.isArray(metadata.subjects) && metadata.subjects.length
        ? metadata.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
        : allowedSubjects,
      count: Math.max(1, Number(metadata.count || parsedQuestions.length)),
      generatedAt: String(metadata.generatedAt || new Date().toISOString()),
    },
    questions: parsedQuestions,
  };
}

async function getQuestionsForSelectedGrade() {
  const selectedGrade = getSelectedGrade();
  const importedQuestions = getImportedQuestionsForGrade(selectedGrade);
  if (importedQuestions.length) {
    return filterQuestionsByActiveSubjects(
      importedQuestions.filter((question) => question.grade === selectedGrade),
      selectedGrade,
    );
  }

  const remoteQuestions = await fetchQuestionsFromFirestore(selectedGrade);
  if (remoteQuestions.length) {
    return filterQuestionsByActiveSubjects(
      remoteQuestions.filter((question) => question.grade === selectedGrade),
      selectedGrade,
    );
  }

  const bundledQuestions = getBundledQuestionsForGrade(selectedGrade);
  if (bundledQuestions.length) {
    return filterQuestionsByActiveSubjects(bundledQuestions, selectedGrade);
  }

  return filterQuestionsByActiveSubjects(getFallbackQuestionsForGrade(selectedGrade), selectedGrade);
}

function renderQuestion() {
  showLockedStudentGate();
  setStudentGateMode("round");
  const question = roundQuestions[currentIndex];
  const totalRoundQuestions = roundQuestions.length;
  introMode = false;
  selectedAnswer = "";
  selectedTextAnswer = "";
  answered = false;
  retryQuestionMode = false;
  gradeLabel.textContent = `${getSelectedGrade()} Ano ${question.subject}`;
  gateTitle.textContent = "Desafio Rápido";
  gateSubtitle.textContent = "Leia com calma e escolha uma resposta.";
  questionCounter.textContent = `Progresso: ${currentIndex + 1}/${totalRoundQuestions}`;
  questionText.textContent = question.text;
  questionText.classList.remove("is-message");
  questionText.hidden = false;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  scoreLabel.textContent = String(correctCount);
  scoreSuffix.textContent = "⭐";
  progressBar.style.width = `${((currentIndex + 1) / totalRoundQuestions) * 100}%`;
  supportText.textContent = prototypeDemoModeActive
    ? "Modo exemplo ativo. Vamos usar essa base para adaptar o fluxo final."
    : correctCount
      ? `Você já acertou ${correctCount} de ${totalRoundQuestions}. Vamos seguir.`
      : "Você consegue! Vamos juntos.";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  setExplanationCopyUnlocked(false);
  nextButton.textContent = "Responder";
  nextButton.disabled = true;
  educationGate.scrollTop = 0;
  dissertativeRecoveryMode = false;

  answerList.innerHTML = "";
  if (isDissertativeQuestion(question)) {
    gateSubtitle.textContent = "Leia com calma e escreva sua resposta.";
    answerList.appendChild(buildDissertativeAnswerInput(question));
  } else {
    question.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index);
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.innerHTML = `<span class="answer-letter">${letter}</span><span>${formatAnswerOptionLabel(option)}</span>`;
      button.addEventListener("click", () => selectAnswer(letter, button));
      answerList.appendChild(button);
    });
  }

  if (manualUnlockButton) {
    manualUnlockButton.disabled = false;
    manualUnlockButton.removeAttribute("aria-disabled");
  }
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

async function submitAnswer() {
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
    const isRecoveryAttempt = isDissertativeQuestion(question) && dissertativeRecoveryMode;
    const isCorrect = isDissertativeQuestion(question)
      ? validateDissertativeAnswer(question, selectedTextAnswer)
      : selectedAnswer === question.correct;
    if (!isRecoveryAttempt && !firstAttemptResults[currentIndex]) {
      firstAttemptResults[currentIndex] = {
        subject: question.subject,
        correct: isCorrect,
      };
    }
    if (!isRecoveryAttempt) {
      updatePerformanceForAnswer(question.subject, isCorrect);
    }
    if (isCorrect) {
      correctCount += 1;
    }

    scoreLabel.textContent = String(correctCount);
    feedback.innerHTML = isCorrect
      ? "✅ Muito bem! Você acertou 👏 ⭐ +1 estrelinha"
      : "❌ Quase!<br />Vamos aprender juntos 😊";
    feedback.className = `feedback ${isCorrect ? "success" : "warning"}`;
    supportText.textContent = correctCount ? `⭐ ${correctCount} estrelinha${correctCount > 1 ? "s" : ""} • Você está indo muito bem!` : "Você consegue! Vamos juntos.";
    renderAnswerExplanation(question, selectedAnswer, isCorrect);

    if (isCorrect && isRecoveryAttempt) {
      dissertativeRecoveryMode = false;
      setExplanationCopyUnlocked(false);
      setDissertativeInputClipboardUnlocked(false);
      if (currentIndex < roundQuestions.length - 1) {
        currentIndex += 1;
        renderQuestion();
        return;
      }
      await finishRound();
      return;
    }

    if (!isCorrect) {
      if (isDissertativeQuestion(question)) {
        dissertativeRecoveryMode = true;
        setExplanationCopyUnlocked(true);
        setDissertativeInputClipboardUnlocked(true);
        nextButton.textContent = "Continuar";
        nextButton.disabled = !selectedTextAnswer.trim();
        return;
      }
      hardenExplanationBox();
      setExplanationCopyUnlocked(false);
      await saveResult(calculateScore(), false);
      renderParentDashboard();
      retryPending = true;
      nextButton.textContent = "Continuar";
      nextButton.disabled = false;
      return;
    }

    answered = true;
    nextButton.textContent = currentIndex === roundQuestions.length - 1 ? "Ver resultado" : "Próxima";
    nextButton.disabled = false;
    return;
  }

  if (currentIndex < roundQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  await finishRound();
}

async function finishRound() {
  const score = calculateScore();
  const passed = correctCount === roundQuestions.length;
  await saveResult(score, passed);
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
  clearUnlockTimer();
  setCycleActive(true);
  localStorage.removeItem(unlockAwardPendingStorageKey);
  activateUnlockedUsage();
  showUnlockAwardScreen();
  syncNativeTestState();
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
  clearAppClosingTransition();
  if (hasPendingUnlockAward()) {
    setCycleActive(true);
    setTestModeEnabled(true);
    showUnlockAwardScreen();
    syncNativeTestState();
    return true;
  }

  if (!isTestModeEnabled()) {
    const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
    if (unlockedUntil > Date.now()) {
      setCycleActive(true);
      setTestModeEnabled(true);
      if (shouldShowTestStatusView()) {
        setActiveView("test-status");
      } else {
        document.body.classList.add("unlock-award-active");
        phoneFrame.classList.add("screen-free");
        educationGate.hidden = true;
        unlockMessage.textContent = getUnlockAwardMessage();
        unlockedState.hidden = false;
      }
      scheduleOverlayReturn();
      startUnlockCountdown();
      return true;
    }
    renderIdleStudentState();
    return false;
  }

  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  if (unlockedUntil > Date.now()) {
    setCycleActive(true);
    if (shouldShowTestStatusView()) {
      setActiveView("test-status");
    } else {
      document.body.classList.add("unlock-award-active");
      phoneFrame.classList.add("screen-free");
      educationGate.hidden = true;
      unlockMessage.textContent = getUnlockAwardMessage();
      unlockedState.hidden = false;
    }
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

function resumeTestCycleNow() {
  localStorage.removeItem("smartUnlockUnlockedUntil");
  localStorage.setItem(forceResumeTestStorageKey, "true");
  setCycleActive(true);
  setTestModeEnabled(true);
  hideLoginGate();
  hidePasswordGate();
  document.body.classList.remove("unlock-award-active");
  introMode = false;
  retryPending = false;
  retryQuestionMode = false;
  answered = false;
  selectedAnswer = "";
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  welcomeStartLink.hidden = true;
  welcomeActionPanel.hidden = true;
  answerList.innerHTML = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  explanationBox.hidden = true;
  explanationBox.innerHTML = "";
  window.setTimeout(() => {
    startOverlayRound();
  }, 0);
}

function updateUnlockCountdown() {
  const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
  const remainingMs = Math.max(0, unlockedUntil - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  unlockCountdown.textContent = `Tempo restante: ${minutes}:${seconds}`;
  if (testStatusCountdown) {
    testStatusCountdown.textContent = `Próximo teste em ${minutes}:${seconds}`;
  }
  if (postLoginOnlyMode) {
    prototypeCycleStatusMessage = "";
    renderQuestionBankStatus();
  }
  if (remainingMs <= 0) {
    clearUnlockTimer();
    if (isCycleActive() || isTestModeEnabled()) {
      resumeTestCycleNow();
      return;
    }
    localStorage.removeItem("smartUnlockUnlockedUntil");
    document.body.classList.remove("unlock-award-active");
    if (unlockAwardOverlay) {
      unlockAwardOverlay.hidden = true;
    }
    unlockedState.hidden = true;
    syncNativeTestState();
  }
}

async function saveResult(score, passed) {
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

  const latestResult = {
    date: new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    score,
    correct: correctCount,
    total: roundQuestions.length,
    passed,
    unlockMinutes: getUnlockMinutes(),
    subjects: Object.keys(subjectHits).join(", "),
    subjectPerformance,
  };

  const existingResults = getResults();
  const nextResults = [latestResult, ...existingResults].slice(0, 20);

  localStorage.setItem("smartUnlockResults", JSON.stringify(nextResults));
  void saveRemoteProfileSnapshot({
    results: nextResults,
    performanceByYear: getPerformanceStore(),
  });

  return { used: 0, limit: 0, reachedLimit: false };
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
  if (staticParentPrototypeMode) {
    const transientMessage = shouldShowTransientPrototypeImportMessage() ? prototypeImportStatusMessage : "";
    const message = [prototypeCycleStatusMessage, transientMessage].filter(Boolean).join("\n");
    questionBankStatus.textContent = message;
    questionBankStatus.hidden = !message;
    renderQuestionBankPreviewSummary();
    return;
  }

  if (isAiVersionModeEnabled()) {
    const aiDraftSummary = formatAiDraftSummary();
    const aiDraft = getAiGenerationDraft();
    const aiGenerationMeta = getAiGenerationMeta();
    const typesLabel = getAiQuestionTypesSummary(aiDraft?.questionTypes || {});
    const generatedCount = aiDraft?.grade ? getAiGeneratedQuestionsForGrade(aiDraft.grade).length : 0;
    const apiErrorLine = aiGenerationMeta?.source === "simulated" && aiGenerationMeta?.errorMessage
      ? `Falha da API: ${aiGenerationMeta.errorMessage}`
      : "";
    questionBankStatus.textContent = aiDraftSummary
      ? generatedCount
        ? [
            `Origem: ${getAiGenerationSourceLabel(aiGenerationMeta?.source)}`,
            `${generatedCount} questão(ões) gerada(s) em ${normalizeGradeLabel(aiDraft?.grade || getSelectedGrade())}${typesLabel ? ` com tipos: ${typesLabel}.` : "."}`,
            apiErrorLine,
          ].filter(Boolean).join("\n")
        : `Versão IA pronta para gerar questões em ${normalizeGradeLabel(aiDraft?.grade || getSelectedGrade())}${typesLabel ? ` com tipos: ${typesLabel}.` : "."}`
      : "Versão IA: escolha as matérias e clique em Gerar Questões.";
    renderQuestionBankPreviewSummary();
    return;
  }

  const activeSubjects = getActiveSubjectsForGrade();
  questionBankStatus.textContent = activeSubjects.length
    ? `Matérias ativas: ${activeSubjects.join(", ")}`
    : "Matérias ativas: todas";
  renderQuestionBankPreviewSummary();
}

function configureQuestionFileInputForCurrentMode() {
  if (!questionFileInput) return;

  if (getParentDashboardMode() === "study-guided") {
    questionFileInput.removeAttribute("accept");
    questionFileInput.setAttribute("accept", "image/*");
    questionFileInput.setAttribute("multiple", "");
    return;
  }

  questionFileInput.setAttribute("accept", ".csv,text/csv");
  questionFileInput.setAttribute("multiple", "");
}

function renderStudyGuidedUploadPreview() {
  if (!studyGuidedUploadPreview || !studyGuidedUploadPreviewImages.length) return;

  const shouldShow = getParentDashboardMode() === "study-guided" && studyGuidedUploadPreviewDataUrls.length > 0;
  studyGuidedUploadPreview.hidden = !shouldShow;

  if (!shouldShow) {
    studyGuidedUploadPreviewImages.forEach((imageElement, index) => {
      studyGuidedUploadSlots[index]?.setAttribute("hidden", "");
      imageElement.hidden = true;
      imageElement.removeAttribute("src");
      imageElement.classList.add("is-empty");
    });
    return;
  }

  studyGuidedUploadPreviewImages.forEach((imageElement, index) => {
    const dataUrl = studyGuidedUploadPreviewDataUrls[index] || "";
    if (dataUrl) {
      studyGuidedUploadSlots[index]?.removeAttribute("hidden");
      imageElement.hidden = false;
      imageElement.src = dataUrl;
      imageElement.classList.remove("is-empty");
    } else {
      studyGuidedUploadSlots[index]?.setAttribute("hidden", "");
      imageElement.hidden = true;
      imageElement.removeAttribute("src");
      imageElement.classList.add("is-empty");
    }
  });
}

function setStudyGuidedUploadPreview(dataUrls) {
  studyGuidedUploadPreviewDataUrls = Array.isArray(dataUrls) ? dataUrls.filter(Boolean).slice(0, 3) : [];

  if (studyGuidedUploadPreviewDataUrls.length) {
    localStorage.setItem(studyGuidedUploadPreviewStorageKey, JSON.stringify(studyGuidedUploadPreviewDataUrls));
  } else {
    localStorage.removeItem(studyGuidedUploadPreviewStorageKey);
  }

  renderStudyGuidedUploadPreview();
  setStudyGuidedExplanation(null);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem enviada."));
    reader.readAsDataURL(file);
  });
}

function isImageFile(file) {
  if (!file) return false;

  if (typeof file.type === "string" && file.type.startsWith("image/")) {
    return true;
  }

  return /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif|jfif)$/i.test(file.name || "");
}

function parseStudyGuidedUploadPreviewStorage(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed.filter((value) => typeof value === "string" && value).slice(0, 3);
    }
  } catch (error) {
    // Mantem compatibilidade com o formato antigo de uma imagem unica.
  }

  return typeof rawValue === "string" && rawValue ? [rawValue] : [];
}

function removeStudyGuidedUploadPreviewImage(indexToRemove) {
  if (indexToRemove < 0 || indexToRemove >= studyGuidedUploadPreviewDataUrls.length) return;
  const nextImages = studyGuidedUploadPreviewDataUrls.filter((_, index) => index !== indexToRemove);
  setStudyGuidedUploadPreview(nextImages);
}

function normalizeStudyGuidedStep(step) {
  return String(step || "")
    .trim()
    .replace(/^\d+[\).\-\s]+/, "")
    .replace(/^\d+\s*[\.\-]\s*/, "")
    .trim();
}

function formatStudyGuidedParagraphs(text) {
  return String(text || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderStudyGuidedExplanation() {
  if (!studyGuidedExplanationPanel || !studyGuidedExplanationBody) return;

  const shouldShow = getParentDashboardMode() === "study-guided" && studyGuidedExplanationState?.explanation;
  studyGuidedExplanationPanel.hidden = !shouldShow;

  if (!shouldShow) {
    studyGuidedExplanationBody.innerHTML = "";
    return;
  }

  const introHtml = formatStudyGuidedParagraphs(
    studyGuidedExplanationState.explanation.intro || "Essa informação não está no material enviado",
  );
  const steps = Array.isArray(studyGuidedExplanationState.explanation.steps)
    ? studyGuidedExplanationState.explanation.steps
      .map(normalizeStudyGuidedStep)
      .filter(Boolean)
    : [];
  const visualExampleHtml = formatStudyGuidedParagraphs(
    studyGuidedExplanationState.explanation.visualExample || "Essa informação não está no material enviado",
  );
  const sourceLabel = studyGuidedExplanationState.source === "api" ? "API" : "Simulação";
  const errorMessage = studyGuidedExplanationState.errorMessage
    ? `
      <section class="study-guided-explanation-section study-guided-explanation-section--warning">
        <h4 class="study-guided-explanation-section-title">Falha da API</h4>
        <p>${escapeHtml(studyGuidedExplanationState.errorMessage)}</p>
      </section>
    `
    : "";

  studyGuidedExplanationBody.innerHTML = `
    <p class="study-guided-explanation-source"><strong>Origem:</strong> ${sourceLabel}</p>
    <section class="study-guided-explanation-section">
      <h4 class="study-guided-explanation-section-title">Explicação</h4>
      ${introHtml}
    </section>
    <section class="study-guided-explanation-section">
      <h4 class="study-guided-explanation-section-title">Explicação passo a passo</h4>
      <ol class="study-guided-explanation-steps">
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </section>
    <section class="study-guided-explanation-section">
      <h4 class="study-guided-explanation-section-title">Exemplo visual</h4>
      ${visualExampleHtml}
    </section>
    ${errorMessage}
  `;
}

function setStudyGuidedExplanation(data) {
  if (!data) {
    studyGuidedExplanationState = null;
    localStorage.removeItem(studyGuidedExplanationStorageKey);
    renderStudyGuidedExplanation();
    return;
  }

  studyGuidedExplanationState = parseStudyGuidedExplanationStorage(JSON.stringify(data));
  if (!studyGuidedExplanationState) {
    localStorage.removeItem(studyGuidedExplanationStorageKey);
    renderStudyGuidedExplanation();
    return;
  }

  localStorage.setItem(studyGuidedExplanationStorageKey, JSON.stringify(studyGuidedExplanationState));
  renderStudyGuidedExplanation();
}

function shouldShowTransientPrototypeImportMessage() {
  if (!prototypeImportStatusMessage) return false;

  return (
    prototypeImportStatusMessage.startsWith("Importando")
    || prototypeImportStatusMessage.startsWith("Não foi possível")
    || prototypeImportStatusMessage.startsWith("Nenhuma questão")
  );
}

function getPrototypeImportedSubjectsSummary() {
  const importedManifest = getImportedManifest();
  const importedByGrade = supportedStudentGrades
    .map((grade) => {
      const subjects = importedManifest[grade] || [];
      if (!subjects.length) return "";
      return `${grade} ano: ${subjects.map((subject) => getSubjectDisplayLabel(subject)).join(", ")}`;
    })
    .filter(Boolean);

  return importedByGrade.length ? `Matérias importadas:\n${importedByGrade.join("\n")}` : "";
}

function renderQuestionBankPreviewSummary() {
  if (!questionBankPreviewContent) return;

  const emptyStateLabel = isAiVersionModeEnabled()
    ? "Nenhuma questão gerada ainda."
    : "Nenhuma questão importada ainda.";

  if (isAiVersionModeEnabled()) {
    const generatedSummary = getAiGeneratedQuestionsSummary();
    const aiGenerationMeta = getAiGenerationMeta();
    if (generatedSummary.length) {
      const sourceLine = aiGenerationMeta ? `Origem: ${getAiGenerationSourceLabel(aiGenerationMeta.source)}` : "";
      const errorLine = aiGenerationMeta?.source === "simulated" && aiGenerationMeta?.errorMessage
        ? `Falha da API: ${aiGenerationMeta.errorMessage}`
        : "";
      questionBankPreviewContent.textContent = [sourceLine, errorLine, ...generatedSummary].filter(Boolean).join("\n\n");
      return;
    }

    const draftSummary = formatAiDraftSummary();
    if (!draftSummary) {
      questionBankPreviewContent.textContent = emptyStateLabel;
      return;
    }

    questionBankPreviewContent.textContent = draftSummary
      .split("\n")
      .filter(Boolean)
      .map((line) => `• ${line}`)
      .join("\n");
    return;
  }

  const summary = getPrototypeImportedSubjectsSummary();
  if (!summary) {
    questionBankPreviewContent.textContent = emptyStateLabel;
    return;
  }

  const formattedSummary = summary
    .replace(/^Matérias importadas:\s*/i, "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `• ${line}`)
    .join("\n");

  questionBankPreviewContent.textContent = formattedSummary;
}

function setQuestionBankPreviewOpen(isOpen) {
  if (!questionBankPreviewPanel || !questionBankPreviewButton || !questionBankPreviewShell) return;
  questionBankPreviewPanel.hidden = !isOpen;
  questionBankPreviewButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  questionBankPreviewShell.classList.toggle("is-open", isOpen);
}

function toggleQuestionBankPreview() {
  if (!questionBankPreviewPanel) return;
  setQuestionBankPreviewOpen(questionBankPreviewPanel.hidden);
}

function parseCsv(text) {
  const sampleLine = String(text || "").split(/\r?\n/, 1)[0] || "";
  const commaCount = (sampleLine.match(/,/g) || []).length;
  const semicolonCount = (sampleLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

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
    } else if (char === delimiter && !insideQuotes) {
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
  const match = text.match(/([1-9])\s*(?:o|º)?/i);
  return match ? `${match[1]}º` : text;
}

function normalizeSupportedStudentGrade(value) {
  const normalizedGrade = normalizeGradeLabel(value);
  return supportedStudentGrades.includes(normalizedGrade) ? normalizedGrade : "3º";
}

function inferAgeFromGrade(grade) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const ageByGrade = {
    "1º": 6,
    "2º": 7,
    "3º": 8,
    "4º": 9,
    "5º": 10,
    "6º": 11,
    "7º": 12,
    "8º": 13,
    "9º": 14,
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

  if (normalized.includes("historia da arte")) return "Arte";
  if (normalized.includes("bio")) return "Ciências";
  if (normalized.includes("quim")) return "Matemática";
  if (normalized.includes("fis")) return "Lógica";
  if (normalized.includes("mat")) return "Matemática";
  if (normalized.includes("port")) return "Português";
  if (normalized.includes("cien")) return "Ciências";
  if (normalized.includes("geo")) return "Geografia";
  if (normalized.includes("hist")) return "História";
  if (normalized.includes("ing")) return "Inglês";
  if (normalized.includes("art")) return "Arte";
  if (normalized.includes("log")) return "Lógica";
  return inferSubjectFromQuestion(subject);
}

function getSubjectDisplayLabel(subject) {
  const normalizedSubject = normalizeSubjectName(subject);
  return parentSubjectDisplayList.find((entry) => entry.subject === normalizedSubject)?.label || normalizedSubject;
}

function inferImportMetadataFromFilename(filename = "") {
  const baseName = String(filename || "")
    .replace(/\.[^.]+$/, "")
    .trim();
  const normalizedFileName = normalizeSheetName(baseName);
  const forcedGrade = normalizeGradeLabel(normalizedFileName);

  const subjectToken = normalizedFileName
    .replace(/\b([1-9])\s*(?:o|º)?\s*ano\b/g, "")
    .replace(/\b([1-9])\s*(?:o|º)?\b/g, "")
    .replace(/[_-]+/g, " ")
    .trim();

  return {
    forcedGrade: supportedStudentGrades.includes(forcedGrade) ? forcedGrade : "",
    forcedSubject: subjectToken ? normalizeSubjectName(subjectToken) : "",
  };
}

function createPerformanceEntry() {
  return trackedSubjects.reduce((accumulator, subject) => {
    accumulator[subject] = { acertos: 0, erros: 0 };
    return accumulator;
  }, {});
}

function createEmptyPerformanceStore() {
  return supportedStudentGrades.reduce((accumulator, grade) => {
    accumulator[grade] = createPerformanceEntry();
    return accumulator;
  }, {});
}

function getPerformanceStore() {
  const rawStore = JSON.parse(localStorage.getItem("smartUnlockPerformanceByYear") || "null");
  const store = {};

  supportedStudentGrades.forEach((grade) => {
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

function resetLatestTestEvaluationData() {
  localStorage.removeItem("smartUnlockResults");
  savePerformanceStore(createEmptyPerformanceStore());
}

function getSubjectChecksStore() {
  const rawStore = JSON.parse(localStorage.getItem(subjectChecksStorageKey) || "null");
  const store = {};

  supportedStudentGrades.forEach((grade) => {
    const source = rawStore?.[grade] || {};
    store[grade] = trackedSubjects.reduce((accumulator, subject) => {
      accumulator[subject] = Boolean(source?.[subject]);
      return accumulator;
    }, {});
  });

  return store;
}

function saveSubjectChecksStore(store) {
  localStorage.setItem(subjectChecksStorageKey, JSON.stringify(store));
}

function setPrototypeSubjectCheckForAllGrades(subject, checked) {
  const normalizedSubject = normalizeSubjectName(subject);
  const subjectStore = getSubjectChecksStore();
  const activeStore = getActiveSubjectsStore();

  supportedStudentGrades.forEach((grade) => {
    if (!subjectStore[grade]) {
      subjectStore[grade] = trackedSubjects.reduce((accumulator, name) => {
        accumulator[name] = false;
        return accumulator;
      }, {});
    }

    subjectStore[grade][normalizedSubject] = checked;

    const nextActive = trackedSubjects.filter((name) => Boolean(subjectStore[grade][name]));
    activeStore[grade] = nextActive;
  });

  saveSubjectChecksStore(subjectStore);
  saveActiveSubjectsStore(activeStore);
}

function resetPrototypeSubjectSelections() {
  const subjectStore = {};
  const activeStore = {};

  supportedStudentGrades.forEach((grade) => {
    subjectStore[grade] = trackedSubjects.reduce((accumulator, name) => {
      accumulator[name] = false;
      return accumulator;
    }, {});
    activeStore[grade] = [];
  });

  saveSubjectChecksStore(subjectStore);
  saveActiveSubjectsStore(activeStore);
}

function setPrototypeExclusiveSubjectSelection(subject, checked) {
  const normalizedSubject = normalizeSubjectName(subject);
  const subjectStore = getSubjectChecksStore();
  const activeStore = getActiveSubjectsStore();

  supportedStudentGrades.forEach((grade) => {
    if (!subjectStore[grade]) {
      subjectStore[grade] = trackedSubjects.reduce((accumulator, name) => {
        accumulator[name] = false;
        return accumulator;
      }, {});
    }

    trackedSubjects.forEach((name) => {
      subjectStore[grade][name] = checked ? name === normalizedSubject : false;
    });

    activeStore[grade] = checked ? [normalizedSubject] : [];
  });

  saveSubjectChecksStore(subjectStore);
  saveActiveSubjectsStore(activeStore);
}

function getCheckedSubjectsForGrade(grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const store = getSubjectChecksStore();

  return trackedSubjects.filter((subject) => Boolean(store?.[normalizedGrade]?.[subject]));
}

function isSubjectChecked(subject, grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const normalizedSubject = normalizeSubjectName(subject);
  const store = getSubjectChecksStore();

  return Boolean(store?.[normalizedGrade]?.[normalizedSubject]);
}

function toggleSubjectCheck(subject, grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const normalizedSubject = normalizeSubjectName(subject);
  const store = getSubjectChecksStore();

  if (!store[normalizedGrade]) {
    store[normalizedGrade] = trackedSubjects.reduce((accumulator, name) => {
      accumulator[name] = false;
      return accumulator;
    }, {});
  }

  store[normalizedGrade][normalizedSubject] = !store[normalizedGrade][normalizedSubject];
  saveSubjectChecksStore(store);
}

function getActiveSubjectsStore() {
  const rawStore = JSON.parse(localStorage.getItem(activeSubjectsStorageKey) || "null");
  const store = {};

  supportedStudentGrades.forEach((grade) => {
    const source = Array.isArray(rawStore?.[grade]) ? rawStore[grade] : [];
    store[grade] = source.map((subject) => normalizeSubjectName(subject)).filter(Boolean);
  });

  return store;
}

function saveActiveSubjectsStore(store) {
  localStorage.setItem(activeSubjectsStorageKey, JSON.stringify(store));
}

function getActiveSubjectsForGrade(grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const store = getActiveSubjectsStore();

  return Array.isArray(store[normalizedGrade]) ? store[normalizedGrade] : [];
}

function applyCheckedSubjectsToGrade(grade = getSelectedGrade()) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const checkedSubjects = getCheckedSubjectsForGrade(normalizedGrade);
  const store = getActiveSubjectsStore();

  store[normalizedGrade] = checkedSubjects;
  saveActiveSubjectsStore(store);

  return checkedSubjects;
}

function filterQuestionsByActiveSubjects(questionList, grade = getSelectedGrade()) {
  const activeSubjects = getActiveSubjectsForGrade(grade);
  if (!activeSubjects.length) return questionList;

  return questionList.filter((question) => activeSubjects.includes(normalizeSubjectName(question.subject)));
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

function importQuestionsFromCsv(text, forcedGrade = "", forcedSubject = "") {
  const rows = parseCsv(text);
  return importQuestionsFromRows(rows, forcedGrade, forcedSubject);
}

function importQuestionsFromRows(rows, forcedGrade = "", forcedSubject = "") {
  const headers = rows[0]?.map(normalizeHeader) || [];
  const findColumn = (...names) => names.map(normalizeHeader).map((name) => headers.indexOf(name)).find((index) => index >= 0);

  const columns = {
    grade: findColumn("Ano", "Série", "Serie"),
    age: findColumn("Idade"),
    subject: findColumn("Matéria", "Materia", "Disciplina"),
    type: findColumn("Tipo", "Modo", "Formato"),
    text: findColumn("Pergunta", "Questão", "Questao"),
    optionA: findColumn("Alternativa A", "Opção A", "Opcao A", "A"),
    optionB: findColumn("Alternativa B", "Opção B", "Opcao B", "B"),
    optionC: findColumn("Alternativa C", "Opção C", "Opcao C", "C"),
    optionD: findColumn("Alternativa D", "Opção D", "Opcao D", "D"),
    correct: findColumn("Resposta Correta", "Correta", "Gabarito"),
    level: findColumn("Nível", "Nivel", "Dificuldade"),
    time: findColumn("Tempo", "Tempo (seg)", "Segundos"),
  };

  if ((!forcedGrade && columns.grade === undefined) || columns.text === undefined || columns.correct === undefined) {
    throw new Error("Arquivo inválido. Verifique o modelo CSV.");
  }

  return rows
    .slice(1)
    .map((row) => {
      const rawCorrect = String(row[columns.correct] || "").trim();
      const explicitType = columns.type === undefined ? "" : String(row[columns.type] || "").trim().toLowerCase();
      const isDissertative = /dissert|texto|aberta/i.test(explicitType) || (!!rawCorrect && !/^[A-D]$/i.test(rawCorrect));
      const options = isDissertative
        ? []
        : [row[columns.optionA], row[columns.optionB], row[columns.optionC], columns.optionD !== undefined ? row[columns.optionD] : ""].filter(Boolean);
      const normalizedGrade = normalizeGradeLabel(forcedGrade || row[columns.grade]);

      return {
        grade: normalizedGrade,
        age: columns.age === undefined ? inferAgeFromGrade(normalizedGrade) : Number(row[columns.age] || inferAgeFromGrade(normalizedGrade)),
        subject: normalizeSubjectName(forcedSubject || (columns.subject === undefined ? inferSubjectFromQuestion(row[columns.text]) : row[columns.subject] || inferSubjectFromQuestion(row[columns.text]))),
        level: columns.level === undefined ? "Fácil" : (row[columns.level] || "Fácil"),
        text: row[columns.text],
        options,
        correct: isDissertative ? "" : rawCorrect.toUpperCase(),
        answerMode: isDissertative ? "text" : "choice",
        expectedAnswer: isDissertative ? rawCorrect : "",
      };
    })
    .filter((question) => {
      if (isDissertativeQuestion(question)) {
        return question.grade && question.age && question.subject && question.text && getQuestionExpectedAnswers(question).length > 0;
      }
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

function mergeImportedQuestions(questionList) {
  const questionBank = getStoredQuestionBank();

  questionList.forEach((question) => {
    const grade = normalizeGradeLabel(question.grade);
    const subject = normalizeSubjectName(question.subject);
    const currentQuestions = Array.isArray(questionBank[grade]) ? questionBank[grade] : [];
    const preservedQuestions = currentQuestions.filter((entry) => normalizeSubjectName(entry.subject) !== subject);
    const importedQuestions = questionList
      .filter((entry) => normalizeGradeLabel(entry.grade) === grade && normalizeSubjectName(entry.subject) === subject)
      .map((entry) => ({
        ...entry,
        grade,
        subject,
        age: Number(entry.age || inferAgeFromGrade(grade)),
      }));

    questionBank[grade] = ensureFourOptions([...preservedQuestions, ...importedQuestions]);
  });

  saveQuestionBank(questionBank);
  return questionBank;
}

function getResults() {
  return JSON.parse(localStorage.getItem("smartUnlockResults") || "[]");
}

function renderParentDashboard() {
  setAiVersionModeEnabled(true);
  const parentDashboardMode = getParentDashboardMode();
  parentView?.setAttribute("data-dashboard-mode", parentDashboardMode);
  document.body.classList.toggle("dashboard-mode-study-guided", parentDashboardMode === "study-guided");
  document.body.classList.toggle("dashboard-mode-tests", parentDashboardMode === "tests");
  configureQuestionFileInputForCurrentMode();
  renderStudyGuidedUploadPreview();
  renderStudyGuidedExplanation();
  if (aiDashboardKnowledge) {
    aiDashboardKnowledge.value = parentDashboardMode === "study-guided"
      ? getStudyGuidedKnowledge()
      : String(getAiGenerationDraft()?.knowledge || "");
  }
  if (parentDashboardMode === "study-guided") {
    closeUnlockTimePrototypeMenu();
    closeAiDashboardCountMenu();
  }
  const results = getResults();
  renderResponsibleAssessment();
  if (parentGreeting) {
    parentGreeting.textContent = "Escolha a Matéria";
  }
  lastScore.textContent = results[0] ? `${results[0].score}/10` : "--";
  roundCount.textContent = results.length;
  renderSubjectRanking();
  renderAccessControl();
  applyStaticParentPrototypeMode();
  renderParentalControlSettings();

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
  renderStudentGradeDisplay();
}

function renderUnlockTimeSelect() {
  if (staticParentPrototypeMode) {
    if (unlockTimeSelect) {
      if (!prototypeTimeExplicitlySelected) {
        unlockTimeSelect.selectedIndex = 0;
      }
      syncUnlockTimePrototypeLabel();
    }
    return;
  }
  unlockTimeSelect.value = String(getUnlockMinutes());
  if (welcomeUnlockTimeSelect) {
    welcomeUnlockTimeSelect.value = String(getUnlockMinutes());
  }
}

function formatUnlockTime(result) {
  if (!result.passed) return "Sem liberação";
  return `${formatMinutesLabel(result.unlockMinutes || getUnlockMinutes())} liberados`;
}

function getLatestResult() {
  const [latestResult] = getResults();
  return latestResult || null;
}

function getResultsAverageScore() {
  const results = getResults();
  if (!results.length) return "";

  const totalScore = results.reduce((sum, result) => sum + Number(result.score || 0), 0);
  return (totalScore / results.length).toFixed(1).replace(".", ",");
}

function getTotalUnlockedMinutes() {
  return getResults().reduce((sum, result) => {
    if (!result?.passed) return sum;
    return sum + Math.max(0, Number(result.unlockMinutes || 0));
  }, 0);
}

function getBestSubjectsSummary(result = getLatestResult()) {
  const ranking = getSubjectRanking(result).filter((item) => item.total > 0);
  if (!ranking.length) return "";

  const bestScore = Math.max(...ranking.map((item) => item.score));
  const bestSubjects = ranking
    .filter((item) => item.score === bestScore && item.score > 0)
    .map((item) => parentSubjectDisplayList.find((entry) => entry.subject === item.name)?.label || item.name);

  return [...new Set(bestSubjects)].join(", ");
}

function getNeedsImprovementSummary(result = getLatestResult()) {
  const subjectPerformance = result?.subjectPerformance || {};

  const subjectsNeedingImprovement = trackedSubjects
    .filter((subject) => {
      const data = subjectPerformance[subject] || { total: 0, correct: 0 };
      return Number(data.total || 0) - Number(data.correct || 0) > 0;
    })
    .map((subject) => parentSubjectDisplayList.find((entry) => entry.subject === subject)?.label || subject);

  return [...new Set(subjectsNeedingImprovement)].join(", ");
}

function getFocusSummary(result = getLatestResult()) {
  const subjectPerformance = result?.subjectPerformance || {};

  const subjectsWithErrors = trackedSubjects
    .map((subject) => ({
      subject,
      errors: Math.max(
        0,
        Number(subjectPerformance[subject]?.total || 0) - Number(subjectPerformance[subject]?.correct || 0),
      ),
    }))
    .filter((item) => item.errors > 0)
    .sort((left, right) => right.errors - left.errors);

  if (!subjectsWithErrors.length) return "";

  const focusSubject = parentSubjectDisplayList.find((entry) => entry.subject === subjectsWithErrors[0].subject)?.label || subjectsWithErrors[0].subject;
  return `Atenção para matéria ${focusSubject}.`;
}

function formatResponsibleAssessmentDate(dateText = "") {
  const normalized = String(dateText || "").trim();
  if (!normalized) return "";

  const match = normalized.match(/^(\d{2}\/\d{2})(?:\/\d{4})?,?\s*(\d{2}:\d{2})?$/);
  if (match) {
    const [, dayMonth, time] = match;
    return time ? `${dayMonth}, ${time}` : dayMonth;
  }

  return normalized;
}

function renderResponsibleAssessment() {
  const latestResult = getLatestResult();
  const averageScore = getResultsAverageScore();

  if (responsibleAssessmentDate) {
    responsibleAssessmentDate.textContent = formatResponsibleAssessmentDate(latestResult?.date || "");
  }

  if (responsibleAssessmentUnlockTime) {
    const totalUnlockedMinutes = getTotalUnlockedMinutes();
    responsibleAssessmentUnlockTime.textContent = totalUnlockedMinutes
      ? formatMinutesLabel(totalUnlockedMinutes)
      : "";
  }

  if (responsibleAssessmentSubjects) {
    responsibleAssessmentSubjects.textContent = latestResult?.subjects || "";
  }

  if (responsibleAssessmentCorrect) {
    responsibleAssessmentCorrect.textContent = latestResult ? String(Number(latestResult.correct || 0)) : "";
  }

  if (responsibleAssessmentWrong) {
    responsibleAssessmentWrong.textContent = latestResult
      ? String(Math.max(0, Number(latestResult.total || 0) - Number(latestResult.correct || 0)))
      : "";
  }

  if (responsibleAssessmentTotal) {
    responsibleAssessmentTotal.textContent = latestResult
      ? String(Math.max(1, Math.ceil(Number(latestResult.total || 0) / 5)))
      : "";
  }

  renderResponsibleSubjectBreakdown(latestResult);

  if (responsibleAssessmentPassed) {
    responsibleAssessmentPassed.textContent = latestResult ? (latestResult.passed ? "Passou" : "Não passou") : "";
  }

  if (responsibleAssessmentScore) {
    responsibleAssessmentScore.textContent = latestResult ? String(Number(latestResult.score || 0)).replace(".", ",") : "";
  }

  if (responsibleAssessmentAverage) {
    responsibleAssessmentAverage.textContent = averageScore || "";
  }
}

function getSubjectRanking(result = getLatestResult()) {
  const subjectPerformance = result?.subjectPerformance || {};

  return trackedSubjects.map((name) => {
    const data = subjectPerformance[name] || { total: 0, correct: 0 };
    const total = Number(data.total || 0);
    const score = total ? Math.round((Number(data.correct || 0) / total) * 100) : 0;

    return {
      name,
      score,
      total,
    };
  });
}

function closeResponsibleSubjectBreakdown() {
  if (responsibleSubjectBreakdownTrigger) {
    responsibleSubjectBreakdownTrigger.setAttribute("aria-expanded", "false");
  }
  if (responsibleSubjectBreakdownPanel) {
    responsibleSubjectBreakdownPanel.hidden = true;
  }
}

function renderResponsibleSubjectBreakdown(result = getLatestResult()) {
  if (!responsibleSubjectBreakdownPanel || !responsibleSubjectBreakdownTrigger) return;

  const subjectPerformance = result?.subjectPerformance || {};
  const items = Object.entries(subjectPerformance)
    .map(([subject, data]) => {
      const total = Math.max(0, Number(data?.total || 0));
      const correct = Math.max(0, Number(data?.correct || 0));
      return {
        label: getSubjectDisplayLabel(subject),
        total,
        correct,
      };
    })
    .filter((item) => item.total > 0)
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

  if (!items.length) {
    responsibleSubjectBreakdownPanel.innerHTML = '<p class="responsible-entry-assessment__dropdown-empty">Nenhuma matéria registrada nesta rodada.</p>';
    closeResponsibleSubjectBreakdown();
    return;
  }

  responsibleSubjectBreakdownPanel.innerHTML = items
    .map((item) => `
      <div class="responsible-entry-assessment__dropdown-item">
        <span>${item.label}</span>
        <strong>${item.correct} acerto${item.correct === 1 ? "" : "s"} de ${item.total}</strong>
      </div>
    `)
    .join("");
  closeResponsibleSubjectBreakdown();
}

function renderSubjectRanking() {
  const selectedGrade = getSelectedGrade();

  if (!parentSubjectDisplayList.length) {
    bestSubject.innerHTML = `<span class="subject-ranking-item">--</span>`;
    return;
  }

  bestSubject.innerHTML = parentSubjectDisplayList
    .map((item) => {
      const isChecked = isSubjectChecked(item.subject, selectedGrade);
      return `
        <span class="subject-ranking-item" data-subject-name="${item.label}" data-source-subject="${item.subject}">
          <span class="subject-ranking-label">${item.label}</span>
          <button
            class="subject-ranking-check ${isChecked ? "is-checked" : ""}"
            type="button"
            data-subject-name="${item.label}"
            data-subject-check="${item.subject}"
            aria-label="${isChecked ? "Desmarcar" : "Marcar"} ${item.label}"
            aria-pressed="${isChecked ? "true" : "false"}"
          ></button>
        </span>
      `;
    })
    .join("");

  bestSubject.querySelectorAll("[data-subject-check]").forEach((button) => {
    button.addEventListener("click", () => {
      if (staticParentPrototypeMode) {
        const nextChecked = button.getAttribute("aria-pressed") !== "true";
        setPrototypeSubjectCheckForAllGrades(button.dataset.subjectCheck, nextChecked);
      } else {
        toggleSubjectCheck(button.dataset.subjectCheck, selectedGrade);
        applyCheckedSubjectsToGrade(selectedGrade);
      }
      renderSubjectRanking();
      renderAiDashboardConfig();
      renderQuestionBankStatus();
    });
  });
}

switchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    requestProtectedView(button.dataset.view);
  });
});

if (welcomeInfoButton && welcomeInfoTooltip) {
  welcomeInfoButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = welcomeInfoButton.classList.contains("is-open");
    setWelcomeInfoOpen(!isOpen);
  });

document.addEventListener("click", (event) => {
    if (!welcomeInfoButton.contains(event.target)) {
      setWelcomeInfoOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setWelcomeInfoOpen(false);
    }
  });
}

viewTargetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.viewTarget === "history") {
      openHistoryFromSubmenu();
      return;
    }
    closeProfileMenu(false);
    requestProtectedView(button.dataset.viewTarget);
  });
});

if (historyCloseButton) {
  historyCloseButton.addEventListener("click", () => {
    closeProfileMenu(true);
  });
}

function requestProtectedView(view) {
  if (postLoginOnlyMode && !["child", "responsible-entry"].includes(view)) {
    view = "parent";
  }
  setActiveView(view);
}

function setActiveView(view) {
  setWelcomeInfoOpen(false);
  clearAppClosingTransition();
  if (view === "responsible-entry" && !responsibleEntryView) {
    view = "parent";
  }
  if (view === "dashboard-selector" && !dashboardSelectorView) {
    view = responsibleEntryView ? "responsible-entry" : "parent";
  }
  if (view === "test-status" && !testStatusView) {
    view = "parent";
  }
  if (postLoginOnlyMode && !["child", "responsible-entry", "dashboard-selector"].includes(view)) {
    view = "parent";
  }
  if (postLoginOnlyMode && view === "child" && !isTestModeEnabled() && !hasActiveUnlockWindow()) {
    view = "parent";
  }
  if (view === "child" && !isTestModeEnabled() && !hasActiveUnlockWindow()) {
    view = "parent";
  }
  if (shouldShowTestStatusView() && view !== "child") {
    view = "test-status";
  }
  if (shouldRequireResponsibleEntryGate(view)) {
    view = "responsible-entry";
  }
  if (!["parent", "responsible-entry"].includes(view)) {
    responsibleEntryAuthorized = false;
  }

  switchButtons.forEach((item) => {
    const isActive = item.dataset.view === view;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  childView.classList.toggle("active", view === "child");
  parentView.classList.toggle("active", view === "parent");
  historyView.classList.toggle("active", view === "history");
  responsibleEntryView?.classList.toggle("active", view === "responsible-entry");
  dashboardSelectorView?.classList.toggle("active", view === "dashboard-selector");
  testStatusView?.classList.toggle("active", view === "test-status");
  document.body.classList.toggle("parent-visual-light", view === "parent");
  document.body.classList.toggle("responsible-entry-visual-light", view === "responsible-entry");
  document.body.classList.toggle("dashboard-selector-visual-light", view === "dashboard-selector");
  document.body.classList.toggle("test-status-visual-light", view === "test-status");
  childView.hidden = view !== "child";
  parentView.hidden = view !== "parent";
  historyView.hidden = view !== "history";
  if (responsibleEntryView) {
    responsibleEntryView.hidden = view !== "responsible-entry";
  }
  if (dashboardSelectorView) {
    dashboardSelectorView.hidden = view !== "dashboard-selector";
  }
  if (testStatusView) {
    testStatusView.hidden = view !== "test-status";
  }
  document.body.classList.toggle("parent-home-only", view === "parent");

  if (view !== "child" || isTestModeEnabled() || hasActiveUnlockWindow()) {
    hideLoginGate();
  }

  if (view === "parent") {
    applyStaticParentPrototypeMode();
  }

  if (view === "responsible-entry") {
    clearResponsibleEntryForm();
    focusResponsibleEntryInput();
  }

  if (view === "test-status") {
    updateUnlockCountdown();
  }

  if (view === "child" && isTestModeEnabled()) {
    if (hasActiveUnlockWindow()) {
      restoreUnlockState();
    } else {
      renderWelcomeStudentState();
    }
  }

  renderParentDashboard();
}

function openParentFromWelcome() {
  requestProtectedView("parent");
}

window.__smartUnlockOpenParentAuthorized = function () {
  setBypassLoginReturnOnce();
  responsibleEntryAuthorized = true;
  setActiveView("parent");
};

window.__smartUnlockOpenParentalControl = function () {
  setActiveView("parent");
};

function getParentPassword() {
  const storedPassword = localStorage.getItem(parentPasswordStorageKey);
  if (!storedPassword) {
    return defaultParentPassword;
  }
  if (legacyDefaultParentPasswords.includes(storedPassword)) {
    localStorage.setItem(parentPasswordStorageKey, defaultParentPassword);
    return defaultParentPassword;
  }
  return storedPassword;
}

function getAcceptedLocalParentPasswords() {
  return [...new Set([getParentPassword(), defaultParentPassword, ...legacyDefaultParentPasswords])].filter(Boolean);
}

function matchesLocalParentPassword(password) {
  return getAcceptedLocalParentPasswords().includes(String(password || ""));
}

function syncNativeResponsibleConfig() {
  if (typeof window.__smartUnlockSendNativeConfig === "function") {
    window.__smartUnlockSendNativeConfig();
  }
}

function syncNativeResponsibleConfigSafely() {
  try {
    syncNativeResponsibleConfig();
  } catch (_) {
    // A entrada no app nao deve falhar por causa da sincronizacao nativa.
  }
}

initialSetupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const responsibleName = responsibleNameInput.value.trim();
  const responsibleEmail = responsibleEmailInput.value.trim().toLowerCase();
  const studentName = studentNameInput.value.trim() || "Nome do aluno";
  const grade = normalizeSupportedStudentGrade(setupGradeSelect.value);
  const parentPassword = setupPasswordInput.value.trim();
  const parentPasswordConfirmation = setupPasswordConfirmInput.value.trim();

  if (!responsibleName || !responsibleEmail || !grade || !parentPassword || !parentPasswordConfirmation) {
    initialSetupError.textContent = "Preencha todos os campos para continuar.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsibleEmail)) {
    initialSetupError.textContent = "Digite um e-mail válido.";
    responsibleEmailInput.focus();
    return;
  }

  if (parentPassword.length < 4) {
    initialSetupError.textContent = "A senha precisa ter pelo menos 4 caracteres.";
    setupPasswordInput.focus();
    return;
  }

  if (parentPassword !== parentPasswordConfirmation) {
    initialSetupError.textContent = "A confirmação de senha não confere.";
    setupPasswordConfirmInput.focus();
    return;
  }

  localStorage.setItem(
    initialSetupStorageKey,
    JSON.stringify({
      responsibleName,
      responsibleEmail,
      studentName,
      grade,
      accessEnabled: true,
      createdAt: new Date().toISOString(),
    }),
  );
  localStorage.setItem(parentPasswordStorageKey, parentPassword);
  localStorage.setItem("smartUnlockStudentGrade", grade);
  storeActiveSessionEmail(responsibleEmail);
  await saveRemoteProfileSnapshot({
    responsibleName,
    responsibleEmail,
    studentName,
    grade,
    accessEnabled: true,
    parentPassword,
  });
  renderStudentGradeDisplay();
  renderImportButtonLabel();
  refreshStudentGradePreview();
  renderProfileMenu();
  hideInitialSetupGate();
  continueAfterAccess();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const setup = getInitialSetup();
  const localResponsibleEmail = getProfileDocId(setup?.responsibleEmail || "");
  const recognizedEmail = getProfileDocId(localResponsibleEmail || getStoredActiveSessionEmail() || "");
  const email = (loginEmailInput.hidden ? recognizedEmail : loginEmailInput.value.trim().toLowerCase());
  const password = loginPasswordInput.value;
  const hasLocalProfile = Boolean(setup?.responsibleEmail);
  const localEmailMatches = hasLocalProfile && email === localResponsibleEmail;
  const localPasswordMatches = hasLocalProfile && matchesLocalParentPassword(password);

  if (hasLocalProfile && localEmailMatches && localPasswordMatches) {
    loginError.textContent = "";
    storeActiveSessionEmail(localResponsibleEmail);
    syncNativeResponsibleConfigSafely();
    hideLoginGate();
    continueAfterAccess();

    void (async () => {
      try {
        await ensureAdminDeviceOwnership();
        await refreshManagedAccessProfile();
        subscribeToActiveProfile(localResponsibleEmail);
      } catch (_) {
        // A entrada local nao deve falhar se a sincronizacao posterior falhar.
      }
    })();
    return;
  }

  const remoteProfile = await loadRemoteProfileSnapshot(email);
  const hasKnownProfile = Boolean(remoteProfile || hasLocalProfile);
  const isAdminLogin = email === defaultResponsibleEmail && password === defaultParentPassword;
  const isTesterCredentialAttempt = email === testerResponsibleEmail && password === testerParentPassword;
  const isHelenaTesterCredentialAttempt = email === helenaTesterEmail && password === helenaTesterPassword;
  const isPedroTesterCredentialAttempt = email === pedroTesterEmail && password === pedroTesterPassword;
  const isRodneyTesterCredentialAttempt = email === rodneyTesterEmail && password === rodneyTesterPassword;
  const isMaofTesterCredentialAttempt = email === maofTesterEmail && password === maofTesterPassword;
  const isAmelidanTesterCredentialAttempt = email === amelidanTesterEmail && password === amelidanTesterPassword;
  const effectivePassword = remoteProfile?.parentPassword || "";
  const passwordMatches =
    hasKnownProfile &&
    (password === effectivePassword || (hasLocalProfile && matchesLocalParentPassword(password)) || password === defaultParentPassword);
  const emailMatches = remoteProfile ? true : localEmailMatches;
  const accessEnabled = remoteProfile
    ? remoteProfile.accessEnabled !== false
    : hasLocalProfile
      ? setup?.accessEnabled !== false
      : true;

  if (!email || !password) {
    loginError.textContent = "Preencha e-mail e senha para continuar.";
    return;
  }

  if (isDisabledGeneratedTesterEmail(email)) {
    loginError.textContent = "Acesso desativado para este cadastro.";
    return;
  }

  if (!hasKnownProfile && email === defaultResponsibleEmail && password === defaultParentPassword) {
    await ensureDefaultSetupProfile();
    storeActiveSessionEmail(defaultResponsibleEmail);
    syncNativeResponsibleConfigSafely();
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        await ensureAdminDeviceOwnership();
        await refreshManagedAccessProfile();
        subscribeToActiveProfile(defaultResponsibleEmail);
        subscribeToManagedAccessProfile();
      } catch (_) {
        // Nao bloquear a entrada por falha de sincronizacao posterior.
      }
    })();
    return;
  }

  if (!remoteProfile && email === testerResponsibleEmail && password === testerParentPassword) {
    const testerProfile = await ensureTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildTesterSetupProfile(), testerParentPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(testerResponsibleEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        await refreshManagedAccessProfile();
        subscribeToActiveProfile(testerResponsibleEmail);
      } catch (_) {
        // Nao bloquear a entrada por falha de sincronizacao posterior.
      }
    })();
    return;
  }

  if (isHelenaTesterCredentialAttempt) {
    const testerProfile = await ensureHelenaTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildHelenaTesterProfile(), helenaTesterPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(helenaTesterEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        subscribeToActiveProfile(helenaTesterEmail);
      } catch (_) {}
    })();
    return;
  }

  if (isPedroTesterCredentialAttempt) {
    const testerProfile = await ensurePedroTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildPedroTesterProfile(), pedroTesterPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(pedroTesterEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        subscribeToActiveProfile(pedroTesterEmail);
      } catch (_) {}
    })();
    return;
  }

  if (isRodneyTesterCredentialAttempt) {
    const testerProfile = await ensureRodneyTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildRodneyTesterProfile(), rodneyTesterPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(rodneyTesterEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        subscribeToActiveProfile(rodneyTesterEmail);
      } catch (_) {}
    })();
    return;
  }

  if (isMaofTesterCredentialAttempt) {
    const testerProfile = await ensureMaofTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildMaofTesterProfile(), maofTesterPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(maofTesterEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        subscribeToActiveProfile(maofTesterEmail);
      } catch (_) {}
    })();
    return;
  }

  if (isAmelidanTesterCredentialAttempt) {
    const testerProfile = await ensureAmelidanTesterRemoteProfile();
    const profileToApply = testerProfile || buildBootstrapProfileSnapshot(buildAmelidanTesterProfile(), amelidanTesterPassword);
    applyRemoteProfileSnapshot(profileToApply);
    storeActiveSessionEmail(amelidanTesterEmail);
    syncNativeResponsibleConfigSafely();
    if (!testerProfile) {
      void saveRemoteProfileSnapshotForProfile(profileToApply);
    }
    hideLoginGate();
    continueAfterAccess();
    void (async () => {
      try {
        subscribeToActiveProfile(amelidanTesterEmail);
      } catch (_) {}
    })();
    return;
  }

  if (!hasKnownProfile) {
    loginError.textContent = "Cadastro não encontrado.";
    return;
  }

  if (!accessEnabled && !isAdminLogin) {
    loginError.textContent = "Acesso desativado para este cadastro.";
    return;
  }

  if (!emailMatches || !passwordMatches) {
    loginError.textContent = "E-mail ou senha incorretos. Tente novamente.";
    loginPasswordInput.select();
    return;
  }

  if (remoteProfile) {
    applyRemoteProfileSnapshot(remoteProfile);
  }

  storeActiveSessionEmail(email);
  syncNativeResponsibleConfigSafely();
  hideLoginGate();
  continueAfterAccess();
  void (async () => {
    try {
      await ensureAdminDeviceOwnership();
      if (isAdminLogin) {
        updateInitialSetup({ accessEnabled: true });
        await saveRemoteProfileSnapshot({
          responsibleEmail: defaultResponsibleEmail,
          accessEnabled: true,
          parentPassword: defaultParentPassword,
        });
      }
      await refreshManagedAccessProfile();
      subscribeToActiveProfile(email);
      if (isAdminLogin) {
        subscribeToManagedAccessProfile();
      }
    } catch (_) {
      // Nao bloquear a entrada por falha de sincronizacao posterior.
    }
  })();
});

if (backToLoginFromSetupButton) {
  backToLoginFromSetupButton.addEventListener("click", () => {
    clearActiveSessionEmail();
    showLoginGate();
  });
}

if (openSetupFromLoginButton) {
  openSetupFromLoginButton.addEventListener("click", () => {
    clearActiveSessionEmail();
    showInitialSetupGate();
  });
}

if (loginWithGoogleButton) {
  loginWithGoogleButton.addEventListener("click", () => {
    void handleGoogleAccess();
  });
}

if (openCountdownAppButton) {
  openCountdownAppButton.addEventListener("click", () => {
    if (hasPendingUnlockAward()) {
      showUnlockAwardScreen();
      return;
    }
    const unlockedUntil = Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0");
    if (unlockedUntil <= Date.now()) return;

    document.body.classList.add("unlock-award-active");
    unlockMessage.textContent = getUnlockAwardMessage();
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
  const nativeUnlockNow =
    typeof window.SmartUnlockNative?.useUnlockedNow === "function"
      ? () => window.SmartUnlockNative.useUnlockedNow()
      : typeof window.AndroidBridge?.useUnlockedNow === "function"
        ? () => window.AndroidBridge.useUnlockedNow()
        : null;
  if (hasPendingUnlockAward()) {
    activateUnlockedUsage();
  }
  document.body.classList.add("app-closing-transition");
  document.body.classList.remove("test-modal-active");
  document.body.classList.remove("unlock-award-active");
  if (unlockAwardOverlay) {
    unlockAwardOverlay.hidden = true;
  }
  unlockedState.hidden = true;
  if (nativeUnlockNow) {
    window.setTimeout(() => {
      nativeUnlockNow();
    }, 120);
    return;
  }
});

nextButton.addEventListener("click", submitAnswer);
clearResultsButton.addEventListener("click", () => {
  localStorage.removeItem("smartUnlockResults");
  localStorage.removeItem("smartUnlockPerformanceByYear");
  void saveRemoteProfileSnapshot({
    results: [],
    performanceByYear: getPerformanceStore(),
  });
  renderParentDashboard();
});

function handleManualUnlockAction() {
  if (postLoginOnlyMode) {
    const nextPressed = manualUnlockButton?.getAttribute("aria-pressed") !== "true";
    if (nextPressed) {
      const validationMessage = getPrototypeSetupValidation();
      if (validationMessage) {
        manualUnlockButton?.setAttribute("aria-pressed", "false");
        setTestModeEnabled(false);
        roundQuestions = [];
        currentIndex = 0;
        correctCount = 0;
        renderIdleStudentState();
        openSetupWarningModal(validationMessage);
        return;
      }
      manualUnlockButton?.setAttribute("aria-pressed", "true");
      setCycleActive(true);
      setTestModeEnabled(true);
      prototypeCycleStatusMessage = "";
      renderQuestionBankStatus();
      startRound();
    } else {
      manualUnlockButton?.setAttribute("aria-pressed", "false");
      setCycleActive(false);
      setTestModeEnabled(false);
      localStorage.removeItem("smartUnlockUnlockedUntil");
      renderIdleStudentState();
    }
    return;
  }
  manualUnlockButton?.setAttribute("aria-pressed", "true");
  setTestModeEnabled(true);
  startRound();
  if (window.AndroidBridge?.startTestLock) {
    window.AndroidBridge.startTestLock();
  }
  setActiveView("child");
}

if (manualUnlockButton) {
  manualUnlockButton.addEventListener("click", handleManualUnlockAction);
}

if (welcomeApplyTestButton) {
  welcomeApplyTestButton.addEventListener("click", () => {
    handleManualUnlockAction();
  });
}

if (setupWarningConfirmButton) {
  setupWarningConfirmButton.addEventListener("click", closeSetupWarningModal);
}

if (setupWarningOverlay) {
  setupWarningOverlay.addEventListener("click", closeSetupWarningModal);
}

if (aiGenerationCancelButton) {
  aiGenerationCancelButton.addEventListener("click", closeAiGenerationModal);
}

if (aiGenerationCountTrigger && aiGenerationCountMenu) {
  aiGenerationCountTrigger.addEventListener("click", () => {
    const isOpen = aiGenerationCountTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeAiGenerationCountMenu();
      return;
    }
    aiGenerationCountTrigger.setAttribute("aria-expanded", "true");
    aiGenerationCountMenu.hidden = false;
    aiGenerationCountTrigger.closest(".ai-generation-count-shell")?.classList.add("is-open");
  });
}

if (aiDashboardCountTrigger && aiDashboardCountMenu) {
  aiDashboardCountTrigger.addEventListener("click", () => {
    const isOpen = aiDashboardCountTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeAiDashboardCountMenu();
      return;
    }
    aiDashboardCountTrigger.setAttribute("aria-expanded", "true");
    aiDashboardCountMenu.hidden = false;
    aiDashboardCountTrigger.closest(".ai-dashboard-count-shell")?.classList.add("is-open");
  });
}

if (aiDashboardTypeChoice) {
  aiDashboardTypeChoice.addEventListener("change", persistAiDashboardDraft);
}

if (aiDashboardTypeText) {
  aiDashboardTypeText.addEventListener("change", persistAiDashboardDraft);
}

if (aiDashboardKnowledge) {
  aiDashboardKnowledge.addEventListener("input", () => {
    if (getParentDashboardMode() === "study-guided") {
      setStudyGuidedKnowledge(aiDashboardKnowledge.value || "");
      setStudyGuidedExplanation(null);
      return;
    }
    persistAiDashboardDraft();
  });
}

if (aiGenerationOverlay) {
  aiGenerationOverlay.addEventListener("click", closeAiGenerationModal);
}

if (aiGenerationContinueButton) {
  aiGenerationContinueButton.addEventListener("click", async () => {
    const selectionState = getAiGenerationSelectionState();

    if (!selectionState.ok) {
      closeAiGenerationModal();
      openSetupWarningModal(selectionState.message);
      return;
    }

    const questionTypes = {
      choice: Boolean(aiGenerationTypeChoice?.checked),
      text: Boolean(aiGenerationTypeText?.checked),
    };

    if (!questionTypes.choice && !questionTypes.text) {
      openSetupWarningModal("Selecione ao menos um tipo de questão para continuar na Versão IA.");
      return;
    }

    saveAiGenerationDraft({
      grade: selectionState.grade,
      subjects: selectionState.subjects,
      unlockMinutes: selectionState.unlockMinutes,
      count: Number(aiGenerationCount?.value || 5),
      questionTypes,
      knowledge: aiGenerationKnowledge?.value || "",
    });

    const aiDraft = getAiGenerationDraft();
    const generationPayload = buildAiGenerationPayload(aiDraft);
    const originalLabel = aiGenerationContinueButton.textContent;
    aiGenerationContinueButton.disabled = true;
    aiGenerationContinueButton.textContent = "Gerando...";

    try {
      const parsedResponse = await requestAiGeneratedQuestions(generationPayload);
      clearAiGeneratedQuestionBank();
      replaceAiGeneratedQuestionsForGrade(selectionState.grade, parsedResponse.questions);
      saveAiGenerationMeta({
        source: parsedResponse.source,
        generatedAt: parsedResponse.metadata?.generatedAt,
        count: parsedResponse.questions?.length || 0,
        grade: selectionState.grade,
      });
    } catch (error) {
      openSetupWarningModal(error instanceof Error ? error.message : "Não foi possível preparar as questões da Versão IA.");
      aiGenerationContinueButton.disabled = false;
      aiGenerationContinueButton.textContent = originalLabel;
      return;
    }

    aiGenerationContinueButton.disabled = false;
    aiGenerationContinueButton.textContent = originalLabel;
    closeAiGenerationModal();
    renderQuestionBankStatus();
    renderQuestionBankPreviewSummary();
    setQuestionBankPreviewOpen(true);
  });
}

if (testLogoutButton) {
  testLogoutButton.addEventListener("click", openTestLogoutModal);
}

if (testLogoutCancelButton) {
  testLogoutCancelButton.addEventListener("click", closeTestLogoutModal);
}

if (testLogoutOverlay) {
  testLogoutOverlay.addEventListener("click", closeTestLogoutModal);
}

if (testLogoutConfirmButton) {
  testLogoutConfirmButton.addEventListener("click", () => {
    const password = String(testLogoutPasswordInput?.value || "");
    if (!password) {
      if (testLogoutError) {
        testLogoutError.textContent = "Digite a senha do responsável.";
      }
      testLogoutPasswordInput?.focus();
      return;
    }
    if (password !== getParentPassword()) {
      if (testLogoutError) {
        testLogoutError.textContent = "Senha incorreta.";
      }
      testLogoutPasswordInput?.select();
      return;
    }
    forceResponsibleLogoutFromTest();
  });
}

if (testLogoutPasswordInput) {
  testLogoutPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTestLogoutModal();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      testLogoutConfirmButton?.click();
    }
  });
}

if (responsibleEntryUnlockButton) {
  responsibleEntryUnlockButton.addEventListener("click", tryUnlockResponsibleEntryView);
}

if (responsibleEntryPasswordInput) {
  responsibleEntryPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      tryUnlockResponsibleEntryView();
      return;
    }
    if (event.key === "Escape") {
      responsibleEntryPasswordInput.blur();
    }
  });
}

if (responsibleEntryExitButton) {
  responsibleEntryExitButton.addEventListener("click", () => {
    responsibleEntryAuthorized = false;
    clearResponsibleEntryForm();
    forceLoginGateState();
  });
}

if (responsibleEntryDashboardButton) {
  responsibleEntryDashboardButton.addEventListener("click", () => {
    responsibleEntryAuthorized = true;
    clearResponsibleEntryForm();
    setActiveView("parent");
  });
}

if (openStudyGuidedLandingButton) {
  openStudyGuidedLandingButton.addEventListener("click", () => {
    closeProfileMenu(false);
    responsibleEntryAuthorized = true;
    clearResponsibleEntryForm();
    setParentDashboardMode("study-guided");
    setActiveView("parent");
  });
}

if (openTestsLandingButton) {
  openTestsLandingButton.addEventListener("click", () => {
    closeProfileMenu(false);
    responsibleEntryAuthorized = true;
    clearResponsibleEntryForm();
    setParentDashboardMode("tests");
    setActiveView("parent");
  });
}

if (responsibleSubjectBreakdownTrigger) {
  responsibleSubjectBreakdownTrigger.addEventListener("click", () => {
    if (!responsibleSubjectBreakdownPanel) return;
    const isOpen = responsibleSubjectBreakdownTrigger.getAttribute("aria-expanded") === "true";
    responsibleSubjectBreakdownTrigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    responsibleSubjectBreakdownPanel.hidden = isOpen;
  });
}

if (parentDashboardBackButton) {
  parentDashboardBackButton.addEventListener("click", () => {
    responsibleEntryAuthorized = true;
    setActiveView(dashboardSelectorView ? "dashboard-selector" : "responsible-entry");
  });
}

document.addEventListener("click", (event) => {
  if (!responsibleSubjectBreakdownTrigger || !responsibleSubjectBreakdownPanel) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (responsibleSubjectBreakdownTrigger.contains(target) || responsibleSubjectBreakdownPanel.contains(target)) return;
  closeResponsibleSubjectBreakdown();
});

if (profileMenuExitButton) {
  profileMenuExitButton.addEventListener("click", () => {
    responsibleEntryAuthorized = false;
    clearResponsibleEntryForm();
    closeProfileMenu(false);
    forceLoginGateState();
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (fileImportPickerActive) {
      return;
    }
    responsibleEntryAuthorized = false;
    return;
  }
  if (fileImportPickerActive) {
    return;
  }
  clearAppClosingTransition();
  if (shouldShowTestStatusView()) {
    setActiveView("test-status");
    updateUnlockCountdown();
    return;
  }
  if ((parentView.classList.contains("active") || parentalControlView?.classList.contains("active")) && shouldRequireResponsibleEntryGate("parent")) {
    setActiveView("responsible-entry");
  }
});

window.addEventListener("focus", () => {
  if (fileImportPickerActive) {
    return;
  }
  clearAppClosingTransition();
  if (shouldShowTestStatusView()) {
    setActiveView("test-status");
    updateUnlockCountdown();
    return;
  }
  if ((parentView.classList.contains("active") || parentalControlView?.classList.contains("active")) && shouldRequireResponsibleEntryGate("parent")) {
    setActiveView("responsible-entry");
  }
});

if (testStatusStopButton) {
  testStatusStopButton.addEventListener("click", openTestLogoutModal);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (fileImportPickerActive) {
      return;
    }
    responsibleEntryAuthorized = false;
    return;
  }
  if (fileImportPickerActive) {
    return;
  }
  if ((parentView.classList.contains("active") || parentalControlView?.classList.contains("active")) && shouldRequireResponsibleEntryGate("parent")) {
    setActiveView("responsible-entry");
  }
});

window.addEventListener("focus", () => {
  if (fileImportPickerActive) {
    return;
  }
  if ((parentView.classList.contains("active") || parentalControlView?.classList.contains("active")) && shouldRequireResponsibleEntryGate("parent")) {
    setActiveView("responsible-entry");
  }
});



stopTestButton.addEventListener("click", openTestLogoutModal);

if (accessToggleButton) {
  accessToggleButton.addEventListener("click", async () => {
    const currentManagedProfile = await refreshManagedAccessProfile();
    const nextEnabled = currentManagedProfile?.accessEnabled === false;
    renderAccessControl();
    renderProfileMenu();

    await saveRemoteProfileSnapshotForProfile({
        ...(currentManagedProfile || buildTesterSetupProfile()),
        responsibleEmail: testerResponsibleEmail,
        accessEnabled: nextEnabled,
      });
    await refreshManagedAccessProfile();
  });
}

unlockTimeSelect.addEventListener("change", () => {
  if (staticParentPrototypeMode) {
    prototypeTimeExplicitlySelected = true;
  }
  syncUnlockTimePrototypeLabel();
  localStorage.setItem("smartUnlockMinutes", unlockTimeSelect.value);
  if (welcomeUnlockTimeSelect) {
    welcomeUnlockTimeSelect.value = unlockTimeSelect.value;
  }
  renderAiDashboardConfig();
  if (staticParentPrototypeMode) return;
  void saveRemoteProfileSnapshot({ unlockMinutes: Number(unlockTimeSelect.value) });
});

if (studentGradeDisplay) {
  studentGradeDisplay.addEventListener("change", () => {
    if (!studentGradeDisplay.value) return;
    syncStudentGradePrototypeLabel();
    if (staticParentPrototypeMode) {
      applyPrototypeGradeSelection(studentGradeDisplay.value);
      return;
    }
    const grade = normalizeSupportedStudentGrade(studentGradeDisplay.value);
    const previousGrade = getSelectedGrade();
    localStorage.setItem("smartUnlockStudentGrade", grade);
    updateInitialSetup({ grade });
    if (isAiVersionModeEnabled() && previousGrade && previousGrade !== grade) {
      clearAiGenerationState();
    }
    renderStudentGradeDisplay();
    refreshStudentGradePreview();
    renderAiDashboardConfig();
    renderQuestionBankStatus();
    void saveRemoteProfileSnapshot({ grade });

    if (isTestModeEnabled()) {
      startRound();
    }
  });
}

if (studentGradeDisplayUpper) {
  studentGradeDisplayUpper.addEventListener("change", () => {
    if (!studentGradeDisplayUpper.value) return;
    syncStudentGradeUpperPrototypeLabel();
    if (staticParentPrototypeMode) {
      applyPrototypeGradeSelection(studentGradeDisplayUpper.value);
      return;
    }
    const grade = normalizeSupportedStudentGrade(studentGradeDisplayUpper.value);
    const previousGrade = getSelectedGrade();
    localStorage.setItem("smartUnlockStudentGrade", grade);
    updateInitialSetup({ grade });
    if (isAiVersionModeEnabled() && previousGrade && previousGrade !== grade) {
      clearAiGenerationState();
    }
    renderStudentGradeDisplay();
    refreshStudentGradePreview();
    renderAiDashboardConfig();
    renderQuestionBankStatus();
    void saveRemoteProfileSnapshot({ grade });

    if (isTestModeEnabled()) {
      startRound();
    }
  });
}

if (welcomeGradeSelect) {
  welcomeGradeSelect.addEventListener("change", () => {
    const grade = normalizeSupportedStudentGrade(welcomeGradeSelect.value);
    const previousGrade = getSelectedGrade();
    localStorage.setItem("smartUnlockStudentGrade", grade);
    updateInitialSetup({ grade });
    if (isAiVersionModeEnabled() && previousGrade && previousGrade !== grade) {
      clearAiGenerationState();
    }
    if (studentGradeDisplay) {
      studentGradeDisplay.value = grade;
    }
    renderStudentGradeDisplay();
    refreshStudentGradePreview();
    renderAiDashboardConfig();
    renderQuestionBankStatus();
    void saveRemoteProfileSnapshot({ grade });

    if (isTestModeEnabled()) {
      startRound();
    }
  });
}

if (welcomeUnlockTimeSelect) {
  welcomeUnlockTimeSelect.addEventListener("change", () => {
    localStorage.setItem("smartUnlockMinutes", welcomeUnlockTimeSelect.value);
    unlockTimeSelect.value = welcomeUnlockTimeSelect.value;
    renderAiDashboardConfig();
    void saveRemoteProfileSnapshot({ unlockMinutes: Number(welcomeUnlockTimeSelect.value) });
  });
}

if (importCurrentGradeButton) {
  importCurrentGradeButton.addEventListener("click", async () => {
    if (importCurrentGradeButton.disabled) return;
    configureQuestionFileInputForCurrentMode();

    if (getParentDashboardMode() === "study-guided") {
      const selectionState = getStudyGuidedSelectionState();
      if (!selectionState.ok) {
        openSetupWarningModal(selectionState.message);
        return;
      }

      const hasKnowledgeText = Boolean(getStudyGuidedKnowledge());
      const hasUploadedImages = studyGuidedUploadPreviewDataUrls.length > 0;
      if (!hasKnowledgeText && !hasUploadedImages) {
        openSetupWarningModal("No Estudo Guiado, escreva o conteúdo da matéria ou envie ao menos uma imagem antes de clicar em Gerar Estudo.");
        return;
      }

      const generationPayload = buildStudyGuidedPayload(selectionState);
      importCurrentGradeButton.disabled = true;
      importCurrentGradeButton.classList.add("is-updating");
      importCurrentGradeButton.textContent = "Gerando...";

      try {
        const generatedExplanation = await requestAiStudyGuidedExplanation(generationPayload);
        setStudyGuidedExplanation(generatedExplanation);
      } catch (error) {
        openSetupWarningModal(error instanceof Error ? error.message : "Não foi possível gerar a explicação do estudo.");
        importCurrentGradeButton.disabled = false;
        importCurrentGradeButton.classList.remove("is-updating");
        renderImportButtonLabel();
        return;
      }

      importCurrentGradeButton.disabled = false;
      importCurrentGradeButton.classList.remove("is-updating");
      renderImportButtonLabel();
      return;
    }

    if (isAiVersionModeEnabled()) {
      const selectionState = getAiGenerationSelectionState();
      if (!selectionState.ok) {
        openSetupWarningModal(selectionState.message);
        return;
      }

      const questionTypes = getAiDashboardQuestionTypes();

      if (!questionTypes.choice && !questionTypes.text) {
        openSetupWarningModal("Selecione ao menos um tipo de questão para continuar na Versão IA.");
        return;
      }

      saveAiGenerationDraft({
        grade: selectionState.grade,
        subjects: selectionState.subjects,
        unlockMinutes: selectionState.unlockMinutes,
        count: Number(aiDashboardCount?.value || 5),
        questionTypes,
        knowledge: aiDashboardKnowledge?.value || "",
      });

      const aiDraft = getAiGenerationDraft();
      const generationPayload = buildAiGenerationPayload(aiDraft);
      importCurrentGradeButton.disabled = true;
      importCurrentGradeButton.classList.add("is-updating");
      importCurrentGradeButton.textContent = "Gerando...";

      try {
        const parsedResponse = await requestAiGeneratedQuestions(generationPayload);
        clearAiGeneratedQuestionBank();
        replaceAiGeneratedQuestionsForGrade(selectionState.grade, parsedResponse.questions);
        saveAiGenerationMeta({
          source: parsedResponse.source,
          generatedAt: parsedResponse.metadata?.generatedAt,
          count: parsedResponse.questions?.length || 0,
          grade: selectionState.grade,
        });
      } catch (error) {
        openSetupWarningModal(error instanceof Error ? error.message : "Não foi possível preparar as questões da Versão IA.");
        importCurrentGradeButton.disabled = false;
        importCurrentGradeButton.classList.remove("is-updating");
        renderImportButtonLabel();
        return;
      }

      importCurrentGradeButton.disabled = false;
      importCurrentGradeButton.classList.remove("is-updating");
      renderImportButtonLabel();
      renderQuestionBankStatus();
      renderQuestionBankPreviewSummary();
      setQuestionBankPreviewOpen(true);
      return;
    }

    fileImportPickerActive = true;
    questionFileInput?.click();
  });
}

if (questionFileInput) {
  questionFileInput.addEventListener("change", async () => {
    const isStudyGuidedMode = getParentDashboardMode() === "study-guided";
    const files = Array.from(questionFileInput.files || []);
    if (!files.length || !importCurrentGradeButton) {
      fileImportPickerActive = false;
      return;
    }

    importCurrentGradeButton.disabled = true;
    importCurrentGradeButton.classList.add("is-updating");
    if (questionBankStatus) {
      questionBankStatus.hidden = false;
      questionBankStatus.textContent = `Importando ${files.length} arquivo${files.length > 1 ? "s" : ""}...`;
    }
    prototypeImportStatusMessage = `Importando ${files.length} arquivo${files.length > 1 ? "s" : ""}...`;

    try {
      if (isStudyGuidedMode) {
        const validImages = files.filter(isImageFile);
        if (!validImages.length || validImages.length !== files.length) {
          throw new Error("Selecione uma imagem para o Estudo Guiado.");
        }

        const remainingSlots = Math.max(0, 3 - studyGuidedUploadPreviewDataUrls.length);
        if (!remainingSlots) {
          throw new Error("Voce pode carregar no maximo 3 imagens por rodada de estudo.");
        }

        const selectedImages = validImages.slice(0, remainingSlots);
        const imageDataUrls = await Promise.all(selectedImages.map((file) => readFileAsDataUrl(file)));
        setStudyGuidedUploadPreview([...studyGuidedUploadPreviewDataUrls, ...imageDataUrls]);
        prototypeImportStatusMessage = "";
        if (questionBankStatus) {
          questionBankStatus.hidden = true;
          questionBankStatus.textContent = "";
        }
        return;
      }

      const importedQuestions = [];

      for (const file of files) {
        const fileText = await file.text();
        const metadata = inferImportMetadataFromFilename(file.name);
        const parsedQuestions = importQuestionsFromCsv(fileText, metadata.forcedGrade, metadata.forcedSubject);
        importedQuestions.push(...parsedQuestions);
      }

      if (!importedQuestions.length) {
        throw new Error("Nenhuma questão válida foi encontrada nos arquivos selecionados.");
      }

      registerImportedQuestions(importedQuestions);
      const questionBank = mergeImportedQuestions(importedQuestions);
      localStorage.setItem("smartUnlockQuestionsUpdatedAt", formatSyncDate());
      firestoreGradeCache.clear();
      questions = loadQuestions();

      prototypeImportStatusMessage = "";

      void saveRemoteProfileSnapshot({
        questionBank,
        activeSubjectsByGrade: getActiveSubjectsStore(),
        questionsUpdatedAt: localStorage.getItem("smartUnlockQuestionsUpdatedAt"),
      });

      if (!isTestModeEnabled() && !hasActiveUnlockWindow()) {
        responsibleEntryAuthorized = true;
        setActiveView("parent");
      }

      if (isTestModeEnabled()) {
        startRound();
      }
    } catch (error) {
      if (questionBankStatus) {
        questionBankStatus.hidden = false;
        questionBankStatus.textContent = error instanceof Error ? error.message : "Não foi possível importar os arquivos.";
      }
      prototypeImportStatusMessage = error instanceof Error ? error.message : "Não foi possível importar os arquivos.";
    } finally {
      fileImportPickerActive = false;
      importCurrentGradeButton.classList.remove("is-updating");
      importCurrentGradeButton.disabled = false;
      questionFileInput.value = "";
      renderQuestionBankStatus();
    }
  });
}

if (studyGuidedUploadRemoveButtons.length) {
  studyGuidedUploadRemoveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.studyGuidedRemoveIndex);
      if (!Number.isFinite(index)) return;
      removeStudyGuidedUploadPreviewImage(index);
    });
  });
}

if (questionBankPreviewShell && questionBankPreviewButton) {
  const supportsHoverPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (supportsHoverPreview) {
    questionBankPreviewButton.addEventListener("mouseenter", () => {
      if (getParentDashboardMode() === "study-guided") return;
      setQuestionBankPreviewOpen(true);
    });

    questionBankPreviewButton.addEventListener("mouseleave", () => {
      if (getParentDashboardMode() === "study-guided") return;
      setQuestionBankPreviewOpen(false);
    });
  }

  questionBankPreviewButton.addEventListener("click", () => {
    if (getParentDashboardMode() === "study-guided") {
      setQuestionBankPreviewOpen(false);
      questionFileInput?.click();
      return;
    }
    toggleQuestionBankPreview();
  });

  if (supportsHoverPreview) {
    questionBankPreviewButton.addEventListener("focus", () => {
      if (getParentDashboardMode() === "study-guided") return;
      setQuestionBankPreviewOpen(true);
    });
  }
}

if (questionBankPreviewPanel) {
  const supportsHoverPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (supportsHoverPreview) {
    questionBankPreviewPanel.addEventListener("mouseenter", () => {
      setQuestionBankPreviewOpen(true);
    });

    questionBankPreviewPanel.addEventListener("mouseleave", () => {
      setQuestionBankPreviewOpen(false);
    });
  }
}

  if (profileMenuButton) {
  profileMenuButton.addEventListener("click", () => {
    const isOpen = profileMenuButton.getAttribute("aria-expanded") === "true";
    renderProfileMenu();
    if (isOpen) {
      closeProfileMenu(true);
      return;
    }
    setProfileMenuOpen(true);
  });

if (openPlansButton) {
  openPlansButton.addEventListener("click", () => {
    closeProfileMenu(false);
  });
}

if (openStandardVersionButton) {
  openStandardVersionButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAiVersionModeEnabled(false);
    renderProfileMenu();
    closeProfileMenu(false);
  });
}

if (openAiVersionButton) {
  openAiVersionButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAiVersionModeEnabled(true);
    renderProfileMenu();
    closeProfileMenu(false);
  });
}

if (openStudyGuidedDashboardButton) {
  openStudyGuidedDashboardButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setParentDashboardMode("study-guided");
    renderProfileMenu();
    setActiveView("parent");
    closeProfileMenu(false);
  });
}

if (openTestsDashboardButton) {
  openTestsDashboardButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setParentDashboardMode("tests");
    renderProfileMenu();
    setActiveView("parent");
    closeProfileMenu(false);
  });
}

if (parentalScheduleModeSelect) {
  parentalScheduleModeSelect.addEventListener("change", () => {
    updateParentalControlSettings({
      scheduleMode: parentalScheduleModeSelect.value,
    });
  });
}

if (parentalScheduleStartInput) {
  parentalScheduleStartInput.addEventListener("change", () => {
    updateParentalControlSettings({
      scheduleStart: parentalScheduleStartInput.value || "18:00",
    });
  });
}

if (parentalScheduleEndInput) {
  parentalScheduleEndInput.addEventListener("change", () => {
    updateParentalControlSettings({
      scheduleEnd: parentalScheduleEndInput.value || "20:00",
    });
  });
}

if (parentalProtectionLevelGroup) {
  parentalProtectionLevelGroup.querySelectorAll("[data-protection-level]").forEach((button) => {
    button.addEventListener("click", () => {
      const level = button.dataset.protectionLevel;
      if (!level) return;
      updateParentalControlSettings({
        protectionLevel: level,
      });
    });
  });
}

if (parentalControlMainToggle) {
  parentalControlMainToggle.addEventListener("click", () => {
    const currentSettings = getParentalControlSettings();
    updateParentalControlSettings({
      enabledDuringTest: !currentSettings.enabledDuringTest,
    });
  });
}

if (parentalControlBlockAllToggle) {
  parentalControlBlockAllToggle.addEventListener("click", () => {
    const currentSettings = getParentalControlSettings();
    if (!currentSettings.enabledDuringTest) return;
    updateParentalControlSettings({
      blockAllApps: !currentSettings.blockAllApps,
    });
  });
}

if (parentalControlReturnToggle) {
  parentalControlReturnToggle.addEventListener("click", () => {
    const currentSettings = getParentalControlSettings();
    if (!currentSettings.enabledDuringTest) return;
    updateParentalControlSettings({
      returnToTest: !currentSettings.returnToTest,
    });
  });
}

if (openSupportButton) {
  openSupportButton.addEventListener("click", () => {
    closeProfileMenu(false);
  });
}

if (studentGradePrototypeTrigger && studentGradePrototypeMenu) {
  studentGradePrototypeTrigger.addEventListener("click", () => {
    const isOpen = studentGradePrototypeTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeStudentGradePrototypeMenu();
      return;
    }
    closeStudentGradeUpperPrototypeMenu();
    studentGradePrototypeTrigger.setAttribute("aria-expanded", "true");
    studentGradePrototypeMenu.hidden = false;
    studentGradePrototypeTrigger.closest(".prototype-grade-shell")?.classList.add("is-open");
  });
}

if (studentGradeUpperPrototypeTrigger && studentGradeUpperPrototypeMenu) {
  studentGradeUpperPrototypeTrigger.addEventListener("click", () => {
    const isOpen = studentGradeUpperPrototypeTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeStudentGradeUpperPrototypeMenu();
      return;
    }
    closeStudentGradePrototypeMenu();
    closeUnlockTimePrototypeMenu();
    studentGradeUpperPrototypeTrigger.setAttribute("aria-expanded", "true");
    studentGradeUpperPrototypeMenu.hidden = false;
    studentGradeUpperPrototypeTrigger.closest(".prototype-grade-upper-shell")?.classList.add("is-open");
  });
}

if (unlockTimePrototypeTrigger && unlockTimePrototypeMenu) {
  unlockTimePrototypeTrigger.addEventListener("click", () => {
    const isOpen = unlockTimePrototypeTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeUnlockTimePrototypeMenu();
      return;
    }
    closeStudentGradePrototypeMenu();
    closeStudentGradeUpperPrototypeMenu();
    unlockTimePrototypeTrigger.setAttribute("aria-expanded", "true");
    unlockTimePrototypeMenu.hidden = false;
    unlockTimePrototypeTrigger.closest(".prototype-time-shell")?.classList.add("is-open");
  });
}

if (closeCadastroPanelButton) {
  closeCadastroPanelButton.addEventListener("click", () => {
    if (staticParentPrototypeMode) return;
      closeProfileMenu(true);
    });
  }

  document.addEventListener("click", (event) => {
    const elementTarget = event.target instanceof Element ? event.target : null;
    if (elementTarget && !elementTarget.closest(".prototype-grade-shell")) {
      closeStudentGradePrototypeMenu();
    }
    if (elementTarget && !elementTarget.closest(".prototype-grade-upper-shell")) {
      closeStudentGradeUpperPrototypeMenu();
    }
    if (elementTarget && !elementTarget.closest(".prototype-time-shell")) {
      closeUnlockTimePrototypeMenu();
    }
    if (elementTarget && !elementTarget.closest(".ai-generation-count-shell")) {
      closeAiGenerationCountMenu();
    }
    if (elementTarget && !elementTarget.closest(".ai-dashboard-count-shell")) {
      closeAiDashboardCountMenu();
    }
    if (questionBankPreviewShell && elementTarget && !elementTarget.closest(".question-bank-preview-shell")) {
      setQuestionBankPreviewOpen(false);
    }
    if (profileMenuPanel.hidden && profileDetailsPanel.hidden) return;
    const target = event.target;
    if (
      profileMenuOverlay?.contains(target) ||
      profileMenuPanel.contains(target) ||
      profileDetailsPanel.contains(target) ||
      profileMenuButton.contains(target)
    ) return;
    closeProfileMenu(true);
  });

  if (profileMenuOverlay) {
    profileMenuOverlay.addEventListener("click", () => {
      closeProfileMenu(false);
    });
  }
}

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
  if (splashDurationMs <= 0) {
    splashScreen.classList.add("is-hidden");
    if (hasOngoingProtectedCycle()) {
      resumeProtectedCycleAfterBoot();
      return;
    }
    clearActiveSessionEmail();
    clearActiveProfileSubscription();
    clearManagedAccessProfileSubscription();
    clearRetryRestartTimer();
    clearUnlockTimer();
    setTestModeEnabled(false);
    localStorage.removeItem("smartUnlockUnlockedUntil");
    setActiveView("child");
    localStorage.removeItem(bypassLoginReturnStorageKey);
    forceLoginGateState();
    return;
  }

  window.setTimeout(() => {
    splashScreen.classList.add("is-hidden");
    if (hasOngoingProtectedCycle()) {
      resumeProtectedCycleAfterBoot();
      return;
    }
    clearActiveSessionEmail();
    clearActiveProfileSubscription();
    clearManagedAccessProfileSubscription();
    clearRetryRestartTimer();
    clearUnlockTimer();
    setTestModeEnabled(false);
    localStorage.removeItem("smartUnlockUnlockedUntil");
    setActiveView("child");
    localStorage.removeItem(bypassLoginReturnStorageKey);
    forceLoginGateState();
  }, splashDurationMs);
}

function emergencyReleaseSplashToLogin() {
  try {
    splashScreen?.classList.add("is-hidden");
  } catch (_error) {
    // no-op
  }

  try {
    clearActiveSessionEmail();
    clearActiveProfileSubscription();
    clearManagedAccessProfileSubscription();
    clearRetryRestartTimer();
    clearUnlockTimer();
    setTestModeEnabled(false);
    localStorage.removeItem("smartUnlockUnlockedUntil");
    localStorage.removeItem(bypassLoginReturnStorageKey);
    setActiveView("child");
    forceLoginGateState();
  } catch (_error) {
    // no-op
  }
}

window.addEventListener("error", () => {
  emergencyReleaseSplashToLogin();
});

window.addEventListener("unhandledrejection", () => {
  emergencyReleaseSplashToLogin();
});

function bootApplication() {
  prepareInitialUiShell();
  ensureImportOnlyQuestionMode();
  questions = loadQuestions();
  renderParentDashboard();
  renderQuestionBankStatus();
  renderStudentGradeDisplay();
  renderImportButtonLabel();
  renderUnlockTimeSelect();
  refreshStudentGradePreview();
  renderProfileMenu();
  applyStaticParentPrototypeMode();
  runSplashScreen();
  void refreshManagedAccessProfile();
}

try {
  bootApplication();
} catch (_error) {
  emergencyReleaseSplashToLogin();
}
