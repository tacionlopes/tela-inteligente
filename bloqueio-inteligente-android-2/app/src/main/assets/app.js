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
const studyGuidedTestDraftStorageKey = "smartUnlockStudyGuidedTestDraft";
const studyGuidedTestQuestionBankStorageKey = "smartUnlockStudyGuidedTestQuestionBank";
const studyGuidedTestMetaStorageKey = "smartUnlockStudyGuidedTestMeta";
const studyGuidedKnowledgeStorageKey = "smartUnlockStudyGuidedKnowledge";
const studyGuidedConversationStorageKey = "smartUnlockStudyGuidedConversation";
const studyGuidedKnowledgePlaceholder = "Escreva o conteúdo ou tema da matéria";
const legacyStudyGuidedKnowledgePlaceholders = new Set([
  "Escreva o conteúdo, tema da matéria, ou faça upload da imagem do conteúdo da matéria que está no livro ou caderno.",
  "Escreva o conteúdo, tema da matéria, ou faça upload da imagem do conteúdo da matéria que está no livro ou caderno",
]);
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
- Antes de finalizar qualquer texto, faça uma revisão gramatical completa.
- Corrija ortografia, acentuação, pontuação, vírgulas, concordância verbal, concordância nominal e fluidez.
- Não deixe sair nenhum texto truncado, duro, telegráfico ou com aparência de rascunho.
- Escreva com padrão alto de português, como material didático muito bem revisado.
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
const lastActiveViewStorageKey = "smartUnlockLastActiveView";
const activeRuntimeSessionStorageKey = "smartUnlockActiveRuntimeSession";
const recognizedLoginProfileStorageKey = "smartUnlockRecognizedLoginProfile";
let appBootCompleted = false;
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
const testSummaryExitButton = document.querySelector("#testSummaryExitButton");
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
const studyGuidedCameraButton = document.querySelector("#studyGuidedCameraButton");
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
const studyGuidedReplayOverlay = document.querySelector("#studyGuidedReplayOverlay");
const studyGuidedReplayModal = document.querySelector("#studyGuidedReplayModal");
const studyGuidedReplayMessage = document.querySelector("#studyGuidedReplayMessage");
const studyGuidedReplayCancelButton = document.querySelector("#studyGuidedReplayCancelButton");
const studyGuidedReplayConfirmButton = document.querySelector("#studyGuidedReplayConfirmButton");
const studyGuidedAudioWaitOverlay = document.querySelector("#studyGuidedAudioWaitOverlay");
const studyGuidedAudioWaitModal = document.querySelector("#studyGuidedAudioWaitModal");
const studyGuidedAudioWaitMessage = document.querySelector("#studyGuidedAudioWaitMessage");
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
let studyGuidedAudioPlayer = null;
let studyGuidedAudioObjectUrl = "";
let studyGuidedAudioLoadingSection = "";
let studyGuidedAudioActiveSection = "";
let studyGuidedAudioPaused = false;
let studyGuidedAudioPreloadedSources = new Map();
let studyGuidedAudioPlaylistIndex = 0;
let studyGuidedReflectionAnalysisDebounceId = 0;
let studyGuidedReflectionStagnationTimeoutId = 0;
let studyGuidedReflectionRequestToken = 0;
let studyGuidedReflectionAnalyzing = false;
let studyGuidedReflectionEvaluating = false;
let studyGuidedReplayResolve = null;
const studyGuidedUnderstandingSegmentCount = 8;
const studyGuidedStagnationPromptDelayMs = 30000;
const studyGuidedUploadPreviewStorageKey = "smartUnlockStudyGuidedUploadPreview";
const studyGuidedExplanationStorageKey = "smartUnlockStudyGuidedExplanation";
const studyGuidedReflectionStorageKey = "smartUnlockStudyGuidedReflection";
const studyGuidedPreviewVersionStorageKey = "smartUnlockStudyGuidedPreviewVersion";

function syncStudyGuidedPreviewVersion() {
  const previewVersion = new URLSearchParams(window.location.search).get("v") || "";
  if (!previewVersion) return;

  const isLocalPreviewRuntime = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const lastPreviewVersion = String(localStorage.getItem(studyGuidedPreviewVersionStorageKey) || "");
  if (isLocalPreviewRuntime || (lastPreviewVersion && lastPreviewVersion !== previewVersion)) {
    localStorage.removeItem(studyGuidedExplanationStorageKey);
    localStorage.removeItem(studyGuidedReflectionStorageKey);
  }

  if (lastPreviewVersion !== previewVersion) {
    localStorage.setItem(studyGuidedPreviewVersionStorageKey, previewVersion);
  }
}

syncStudyGuidedPreviewVersion();
let studyGuidedUploadPreviewDataUrls = parseStudyGuidedUploadPreviewStorage(
  localStorage.getItem(studyGuidedUploadPreviewStorageKey),
);
let studyGuidedExplanationState = parseStudyGuidedExplanationStorage(
  localStorage.getItem(studyGuidedExplanationStorageKey),
);
let studyGuidedReflectionState = parseStudyGuidedReflectionStorage(
  localStorage.getItem(studyGuidedReflectionStorageKey),
);
let studyGuidedConversationState = parseStudyGuidedConversationStorage(
  localStorage.getItem(studyGuidedConversationStorageKey),
);
let studyGuidedTestDraft = parseStudyGuidedTestDraft(
  localStorage.getItem(studyGuidedTestDraftStorageKey),
);
let studyGuidedTestGenerating = false;
let studyGuidedTestApplying = false;
let studyGuidedFollowupGenerating = false;
const optionalLibsState = {
  xlsxLoading: false,
  firebaseLoading: false,
};
const studyGuidedStepsAudioMaxLength = 9000;
const studyGuidedAudioChunkMaxLength = 1200;
const studyGuidedFollowupInvalidMessage = "Este conteúdo não corresponde à matéria escolhida nem ao conteúdo atualmente em estudo. Faça uma pergunta relacionada ao tema atual.";

function normalizeStudyGuidedAudioText(rawText) {
  return String(rawText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function limitStudyGuidedAudioText(text, maxLength) {
  const normalized = normalizeStudyGuidedAudioText(text);
  if (!maxLength || normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength);
  const lastSpaceIndex = sliced.lastIndexOf(" ");
  return (lastSpaceIndex > Math.floor(maxLength * 0.7) ? sliced.slice(0, lastSpaceIndex) : sliced).trim();
}

function splitStudyGuidedAudioTextIntoChunks(text, maxLength = studyGuidedAudioChunkMaxLength) {
  const normalized = normalizeStudyGuidedAudioText(text);
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    let splitIndex = Math.max(
      remaining.lastIndexOf(". ", maxLength),
      remaining.lastIndexOf("! ", maxLength),
      remaining.lastIndexOf("? ", maxLength),
      remaining.lastIndexOf("; ", maxLength),
      remaining.lastIndexOf(": ", maxLength),
    );

    if (splitIndex < Math.floor(maxLength * 0.55)) {
      splitIndex = remaining.lastIndexOf(" ", maxLength);
    }

    if (splitIndex < Math.floor(maxLength * 0.4)) {
      splitIndex = maxLength;
    } else {
      splitIndex += 1;
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks.filter(Boolean);
}

function getStudyGuidedExplanationSignature(source) {
  if (!source?.explanation) return "";

  const intro = normalizeStudyGuidedAudioText(source.explanation.intro || "");
  const steps = Array.isArray(source.explanation.steps)
    ? source.explanation.steps.map((step) => normalizeStudyGuidedAudioText(step)).join(" | ")
    : "";
  const visualExample = normalizeStudyGuidedAudioText(source.explanation.visualExample || "");

  return `${intro}::${steps}::${visualExample}`.slice(0, 6000);
}

function createDefaultStudyGuidedTestDraft(signature = "") {
  return {
    signature,
    count: 5,
    questionTypes: {
      choice: true,
      text: false,
    },
    previewOpen: false,
  };
}

function createEmptyStudyGuidedConversationState(signature = "") {
  return {
    signature: String(signature || "").trim(),
    messages: [],
  };
}

function parseStudyGuidedConversationStorage(rawValue) {
  if (!rawValue) return createEmptyStudyGuidedConversationState();

  try {
    const parsed = JSON.parse(rawValue);
    const messages = Array.isArray(parsed?.messages)
      ? parsed.messages
        .map((item, index) => ({
          id: String(item?.id || `message-${index + 1}`),
          role: item?.role === "user" ? "user" : "assistant",
          text: String(item?.text || "").trim(),
          createdAt: String(item?.createdAt || "").trim(),
        }))
        .filter((item) => item.text)
      : [];

    return {
      signature: String(parsed?.signature || "").trim(),
      messages,
    };
  } catch {
    return createEmptyStudyGuidedConversationState();
  }
}

function saveStudyGuidedConversationState() {
  if (!studyGuidedConversationState?.signature && !(studyGuidedConversationState?.messages || []).length) {
    localStorage.removeItem(studyGuidedConversationStorageKey);
    return;
  }

  localStorage.setItem(studyGuidedConversationStorageKey, JSON.stringify(studyGuidedConversationState));
}

function syncStudyGuidedConversationState() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);

  if (!currentSignature) {
    studyGuidedConversationState = createEmptyStudyGuidedConversationState();
    localStorage.removeItem(studyGuidedConversationStorageKey);
    return;
  }

  if (!studyGuidedConversationState || studyGuidedConversationState.signature !== currentSignature) {
    studyGuidedConversationState = createEmptyStudyGuidedConversationState(currentSignature);
    saveStudyGuidedConversationState();
  }
}

function getStudyGuidedConversationMessages() {
  syncStudyGuidedConversationState();
  return Array.isArray(studyGuidedConversationState?.messages) ? studyGuidedConversationState.messages : [];
}

function appendStudyGuidedConversationMessage(role, text) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) return;

  syncStudyGuidedConversationState();
  const nextMessage = {
    id: `study-guided-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: role === "user" ? "user" : "assistant",
    text: normalizedText,
    createdAt: new Date().toISOString(),
  };

  studyGuidedConversationState.messages = [...getStudyGuidedConversationMessages(), nextMessage].slice(-20);
  saveStudyGuidedConversationState();
}

function parseStudyGuidedTestDraft(rawValue) {
  if (!rawValue) return createDefaultStudyGuidedTestDraft();

  try {
    const parsed = JSON.parse(rawValue);
    return {
      signature: String(parsed?.signature || "").trim(),
      count: Math.max(1, Number(parsed?.count || 5)),
      questionTypes: {
        choice: Boolean(parsed?.questionTypes?.choice ?? true),
        text: Boolean(parsed?.questionTypes?.text),
      },
      previewOpen: Boolean(parsed?.previewOpen),
    };
  } catch (_) {
    return createDefaultStudyGuidedTestDraft();
  }
}

function getStudyGuidedTestDraft() {
  return {
    ...studyGuidedTestDraft,
    questionTypes: {
      choice: Boolean(studyGuidedTestDraft?.questionTypes?.choice),
      text: Boolean(studyGuidedTestDraft?.questionTypes?.text),
    },
  };
}

function saveStudyGuidedTestDraft(draft) {
  const nextDraft = {
    signature: String(draft?.signature || "").trim(),
    count: Math.max(1, Number(draft?.count || 5)),
    questionTypes: {
      choice: Boolean(draft?.questionTypes?.choice),
      text: Boolean(draft?.questionTypes?.text),
    },
    previewOpen: Boolean(draft?.previewOpen),
  };
  studyGuidedTestDraft = nextDraft;
  localStorage.setItem(studyGuidedTestDraftStorageKey, JSON.stringify(nextDraft));
}

function createEmptyStudyGuidedReflectionState(signature = "") {
  return {
    signature,
    text: "",
    blurLocked: false,
    reviewUnlocked: false,
    progressSegments: 0,
    progressScore: 0,
    progressSource: "",
    progressNotice: "",
    canEvaluate: false,
    readyToEvaluate: false,
    progressMessage: "",
    lastProgressAt: 0,
    promptShown: false,
    finalEvaluation: null,
  };
}

function parseStudyGuidedReflectionStorage(rawValue) {
  if (!rawValue) return createEmptyStudyGuidedReflectionState();

  try {
    const parsed = JSON.parse(rawValue);
    return {
      signature: String(parsed?.signature || "").trim(),
      text: String(parsed?.text || ""),
      blurLocked: Boolean(parsed?.blurLocked),
      reviewUnlocked: Boolean(parsed?.reviewUnlocked),
      progressSegments: Math.max(0, Math.min(studyGuidedUnderstandingSegmentCount, Number(parsed?.progressSegments || 0))),
      progressScore: Math.max(0, Math.min(100, Number(parsed?.progressScore || 0))),
      progressSource: String(parsed?.progressSource || "").trim(),
      progressNotice: String(parsed?.progressNotice || "").trim(),
      canEvaluate: Boolean(parsed?.canEvaluate),
      readyToEvaluate: Boolean(parsed?.readyToEvaluate),
      progressMessage: String(parsed?.progressMessage || "").trim(),
      lastProgressAt: Math.max(0, Number(parsed?.lastProgressAt || 0)),
      promptShown: Boolean(parsed?.promptShown),
      finalEvaluation: parsed?.finalEvaluation && typeof parsed.finalEvaluation === "object"
        ? {
          analysis: String(parsed.finalEvaluation.analysis || "").trim(),
          positives: Array.isArray(parsed.finalEvaluation.positives)
            ? parsed.finalEvaluation.positives.map((item) => String(item || "").trim()).filter(Boolean)
            : [],
          deepenings: Array.isArray(parsed.finalEvaluation.deepenings)
            ? parsed.finalEvaluation.deepenings.map((item) => String(item || "").trim()).filter(Boolean)
            : [],
          didacticExplanation: String(parsed.finalEvaluation.didacticExplanation || "").trim(),
          sampleAnswer: String(parsed.finalEvaluation.sampleAnswer || "").trim(),
          summary: String(parsed.finalEvaluation.summary || "").trim(),
          source: String(parsed.finalEvaluation.source || "").trim(),
          notice: String(parsed.finalEvaluation.notice || "").trim(),
        }
        : null,
    };
  } catch (error) {
    return createEmptyStudyGuidedReflectionState();
  }
}

function syncStudyGuidedReflectionState() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);

  if (!currentSignature) {
    studyGuidedReflectionState = createEmptyStudyGuidedReflectionState();
    localStorage.removeItem(studyGuidedReflectionStorageKey);
    return;
  }

  if (studyGuidedReflectionState.signature === currentSignature) {
    return;
  }

  studyGuidedReflectionState = createEmptyStudyGuidedReflectionState(currentSignature);
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function getStudyGuidedReflectionText() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) {
    return "";
  }
  return String(studyGuidedReflectionState.text || "");
}

function isStudyGuidedReflectionBlurLocked() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  return Boolean(
    currentSignature
    && studyGuidedReflectionState.signature === currentSignature
    && studyGuidedReflectionState.blurLocked,
  ) && !studyGuidedReflectionState.reviewUnlocked;
}

function setStudyGuidedReflectionText(value) {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature) return;

  const nextText = String(value || "");
  const previousSignature = studyGuidedReflectionState.signature;
  const previousText = String(studyGuidedReflectionState.text || "");
  const nextTrimmedText = nextText.trim();
  studyGuidedReflectionState = {
    signature: currentSignature,
    text: nextText,
    blurLocked: previousSignature === currentSignature
      ? (studyGuidedReflectionState.blurLocked || nextTrimmedText.length > 0)
      : nextTrimmedText.length > 0,
    reviewUnlocked: nextTrimmedText.length > 0 ? false : studyGuidedReflectionState.reviewUnlocked,
    progressSegments: previousSignature === currentSignature ? studyGuidedReflectionState.progressSegments : 0,
    progressScore: previousSignature === currentSignature ? studyGuidedReflectionState.progressScore : 0,
    progressSource: previousSignature === currentSignature ? studyGuidedReflectionState.progressSource : "",
    progressNotice: previousSignature === currentSignature ? studyGuidedReflectionState.progressNotice : "",
    canEvaluate: previousSignature === currentSignature ? studyGuidedReflectionState.canEvaluate : false,
    readyToEvaluate: previousSignature === currentSignature ? studyGuidedReflectionState.readyToEvaluate : false,
    progressMessage: previousSignature === currentSignature ? studyGuidedReflectionState.progressMessage : "",
    lastProgressAt: previousSignature === currentSignature
      ? (studyGuidedReflectionState.lastProgressAt || (nextTrimmedText ? Date.now() : 0))
      : (nextTrimmedText ? Date.now() : 0),
    promptShown: previousSignature === currentSignature ? studyGuidedReflectionState.promptShown : false,
    finalEvaluation: previousText !== nextText ? null : studyGuidedReflectionState.finalEvaluation,
  };
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function updateStudyGuidedReflectionBlurState() {
  if (!studyGuidedExplanationBody) return;
  const content = studyGuidedExplanationBody.querySelector(".study-guided-explanation-content");
  if (!content) return;
  content.classList.toggle("is-blurred", isStudyGuidedReflectionBlurLocked());
}

function updateStudyGuidedReflectionTextareaVisualState() {
  if (!studyGuidedExplanationBody) return;
  const textarea = studyGuidedExplanationBody.querySelector(".study-guided-reflection-textarea");
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  textarea.classList.toggle("has-content", textarea.value.trim().length > 0);
}

const studyGuidedReflectionStopWords = new Set([
  "a", "ao", "aos", "as", "com", "como", "da", "das", "de", "do", "dos", "e", "ela", "ele",
  "em", "entre", "essa", "esse", "esta", "este", "eu", "foi", "mais", "mas", "na", "nas",
  "no", "nos", "o", "os", "ou", "para", "por", "que", "se", "sem", "ser", "sua", "suas",
  "seu", "seus", "tem", "uma", "umas", "um", "uns",
]);

function getStudyGuidedReflectionStateForCurrentExplanation() {
  syncStudyGuidedReflectionState();
  return studyGuidedReflectionState;
}

function canStudyGuidedReflectionBeEvaluated(reflectionState = getStudyGuidedReflectionStateForCurrentExplanation()) {
  const progressSegments = Math.max(0, Number(reflectionState?.progressSegments || 0));
  return Boolean(reflectionState?.canEvaluate) || progressSegments >= Math.ceil(studyGuidedUnderstandingSegmentCount / 2);
}

function isStudyGuidedReflectionReady(reflectionState = getStudyGuidedReflectionStateForCurrentExplanation()) {
  const progressSegments = Math.max(0, Number(reflectionState?.progressSegments || 0));
  return Boolean(reflectionState?.readyToEvaluate) || progressSegments >= studyGuidedUnderstandingSegmentCount;
}

function normalizeStudyGuidedMeaningText(text) {
  return normalizeAnswerComparisonText(text)
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStudyGuidedMeaningfulWords(text) {
  return normalizeStudyGuidedMeaningText(text)
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !studyGuidedReflectionStopWords.has(word));
}

function extractStudyGuidedReferenceKeywords(explanation) {
  const sourceText = [
    explanation?.intro || "",
    ...(Array.isArray(explanation?.steps) ? explanation.steps : []),
    explanation?.visualExample || "",
  ].join(" ");

  const counts = new Map();
  getStudyGuidedMeaningfulWords(sourceText).forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      return right[0].length - left[0].length;
    })
    .slice(0, 14)
    .map(([word]) => word);
}

function buildStudyGuidedWritingEvaluationRequest(mode = "progress") {
  if (!studyGuidedExplanationState?.explanation) return null;

  const reflectionState = getStudyGuidedReflectionStateForCurrentExplanation();
  const explanation = studyGuidedExplanationState.explanation;
  const metadata = studyGuidedExplanationState.metadata || {};
  const selectedGrade = String(metadata.grade || "").trim();
  const selectedSubjects = Array.isArray(metadata.subjects)
    ? metadata.subjects.map((subject) => String(subject || "").trim()).filter(Boolean)
    : [];
  const studentText = String(reflectionState.text || "").trim();

  if (!selectedGrade || !selectedSubjects.length || !studentText) return null;

  return {
    mode,
    request: {
      grade: selectedGrade,
      subjects: selectedSubjects,
      explanation: {
        intro: String(explanation.intro || "").trim(),
        steps: Array.isArray(explanation.steps) ? explanation.steps.map((step) => String(step || "").trim()).filter(Boolean) : [],
        visualExample: String(explanation.visualExample || "").trim(),
      },
      studentText,
    },
  };
}

function getStudyGuidedSchoolStage(grade) {
  const normalizedGrade = String(grade || "").toLowerCase();
  const match = normalizedGrade.match(/(\d+)/);
  const gradeNumber = match ? Number(match[1]) : NaN;
  return Number.isFinite(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 5
    ? "fundamental_1"
    : "fundamental_2";
}

function buildStudyGuidedLocalProgressEvaluation(request) {
  const schoolStage = getStudyGuidedSchoolStage(request?.grade);
  const isFundamentalOne = schoolStage === "fundamental_1";
  const studentWords = getStudyGuidedMeaningfulWords(request?.studentText || "");
  const referenceKeywords = extractStudyGuidedReferenceKeywords(request?.explanation || {});
  const studentWordSet = new Set(studentWords);
  const matchedKeywords = referenceKeywords.filter((word) => studentWordSet.has(word));
  const overlapRatio = referenceKeywords.length ? matchedKeywords.length / referenceKeywords.length : 0;
  const ideaDensityFactor = isFundamentalOne
    ? (studentWords.length >= 14 ? 1 : studentWords.length >= 10 ? 0.88 : studentWords.length >= 6 ? 0.7 : 0.42)
    : (studentWords.length >= 18 ? 1 : studentWords.length >= 12 ? 0.9 : studentWords.length >= 8 ? 0.72 : 0.42);
  const baseScore = Math.round(Math.min(100, overlapRatio * 100 * ideaDensityFactor));
  const score = matchedKeywords.length === 0
    ? 0
    : Math.max(baseScore, studentWords.length >= (isFundamentalOne ? 7 : 10) ? 18 : 8);

  let segments = 0;
  if (studentWords.length >= (isFundamentalOne ? 3 : 4) && matchedKeywords.length >= 1) {
    segments = Math.max(1, Math.min(
      studyGuidedUnderstandingSegmentCount,
      Math.round((score / 100) * studyGuidedUnderstandingSegmentCount),
    ));
  }

  const minimumKeywordMatches = isFundamentalOne
    ? Math.max(1, Math.min(3, Math.ceil(referenceKeywords.length * 0.18)))
    : Math.max(2, Math.min(4, Math.ceil(referenceKeywords.length * 0.24)));
  const canEvaluate = segments >= Math.ceil(studyGuidedUnderstandingSegmentCount / 2)
    && matchedKeywords.length >= Math.max(1, minimumKeywordMatches - 1)
    && studentWords.length >= (isFundamentalOne ? 5 : 8)
    && overlapRatio >= (isFundamentalOne ? 0.12 : 0.18);
  const isReady = matchedKeywords.length >= minimumKeywordMatches
    && studentWords.length >= (isFundamentalOne ? 7 : 10)
    && overlapRatio >= (isFundamentalOne ? 0.2 : 0.28);
  if (isReady) {
    segments = studyGuidedUnderstandingSegmentCount;
  }

  let message = "Comece a escrever com as ideias principais do que você entendeu.";
  if (isReady) {
    message = "Você atingiu um nível de entendimento, mas ainda precisa melhorar, clique em Avaliar.";
  } else if (canEvaluate) {
    message = "O botão de avaliar já foi liberado, mas sua barra ainda pode subir mais com complementações importantes.";
  } else if (segments >= 6) {
    message = isFundamentalOne
      ? "Você já mostrou boa parte do conteúdo. Agora vale completar melhor a explicação."
      : "Você já retomou boa parte das ideias centrais. Falta só organizar melhor o que compreendeu.";
  } else if (segments >= 3) {
    message = isFundamentalOne
      ? "Sua escrita já mostra entendimento. Continue explicando com suas palavras."
      : "Sua escrita já se aproxima do conteúdo. Continue explicando com suas palavras.";
  } else if (segments >= 1) {
    message = isFundamentalOne
      ? "Já existem sinais de entendimento. Tente contar um pouco mais do que você aprendeu."
      : "Já existem sinais de entendimento. Agora tente ligar melhor as ideias principais.";
  }

  return {
    segments,
    score,
    canEvaluate,
    isReady,
    message,
  };
}

function buildStudyGuidedLocalFinalEvaluation(request) {
  const schoolStage = getStudyGuidedSchoolStage(request?.grade);
  const isFundamentalOne = schoolStage === "fundamental_1";
  const progress = buildStudyGuidedLocalProgressEvaluation(request);
  const explanation = request?.explanation || {};
  const referenceKeywords = extractStudyGuidedReferenceKeywords(request?.explanation || {});
  const studentWordSet = new Set(getStudyGuidedMeaningfulWords(request?.studentText || ""));
  const matchedKeywords = referenceKeywords.filter((word) => studentWordSet.has(word));
  const missingKeywords = referenceKeywords.filter((word) => !studentWordSet.has(word)).slice(0, 3);
  const steps = Array.isArray(explanation.steps) ? explanation.steps.map((item) => String(item || "").trim()).filter(Boolean) : [];
  const intro = String(explanation.intro || "").trim();
  const didacticExplanation = steps.join(" ") || intro || "Retome as ideias centrais do conteúdo com suas palavras.";
  const sampleAnswer = [intro, steps[0], steps[1]].filter(Boolean).join(" ") || didacticExplanation;

  const positives = [];
  if (matchedKeywords.length) {
    positives.push(
      isFundamentalOne
        ? `Você já conseguiu lembrar ideias importantes do conteúdo, como ${matchedKeywords.slice(0, 3).join(", ")}.`
        : `Você retomou ideias importantes do conteúdo, como ${matchedKeywords.slice(0, 3).join(", ")}.`,
    );
  }
  if (progress.segments >= 4) {
    positives.push(
      isFundamentalOne
        ? "Sua escrita mostra que você tentou explicar o conteúdo com suas próprias palavras."
        : "Sua escrita já mostra que você não apenas copiou palavras soltas, mas tentou explicar o conteúdo com sentido.",
    );
  }
  if (progress.segments >= studyGuidedUnderstandingSegmentCount) {
    positives.push(
      isFundamentalOne
        ? "Sua resposta já mostra um entendimento claro do que foi estudado."
        : "A resposta está organizada o suficiente para mostrar entendimento real da explicação feita anteriormente.",
    );
  }

  const deepenings = [];
  if (missingKeywords.length) {
    deepenings.push(
      isFundamentalOne
        ? `Você ainda pode acrescentar melhor estas ideias: ${missingKeywords.join(", ")}.`
        : `Vale acrescentar melhor estas ideias centrais: ${missingKeywords.join(", ")}.`,
    );
  }
  if (progress.segments < studyGuidedUnderstandingSegmentCount) {
    deepenings.push(
      isFundamentalOne
        ? "Tente explicar de forma mais completa como as ideias do conteúdo se ligam."
        : "Explique com mais clareza como as ideias do conteúdo se ligam entre si, em vez de escrever apenas partes isoladas.",
    );
  }
  if (studentWordSet.size < 12) {
    deepenings.push(
      isFundamentalOne
        ? "Escreva um pouco mais para mostrar melhor o que você entendeu."
        : "Escreva um pouco mais, com frases completas, para mostrar melhor o que você realmente entendeu.",
    );
  }

  return {
    analysis: progress.isReady
      ? (isFundamentalOne
        ? "Sua escrita mostra um bom entendimento do conteúdo e já explica as ideias principais com clareza."
        : "Sua escrita demonstra um bom nível de compreensão do conteúdo e já organiza as ideias centrais com sentido.")
      : (progress.canEvaluate
        ? (isFundamentalOne
          ? "Sua escrita já mostra entendimento parcial consistente do conteúdo, mas ainda pode ficar mais completa."
          : "Sua escrita já demonstra compreensão parcial consistente do conteúdo, mas ainda precisa aprofundar alguns pontos centrais.")
        : (isFundamentalOne
          ? "Sua escrita começou a mostrar entendimento do conteúdo, mas ainda faltam ideias importantes para completar a explicação."
          : "Sua escrita já toca no tema, mas ainda faltam ideias importantes para mostrar compreensão mais completa do conteúdo.")),
    positives: positives.slice(0, 3),
    deepenings: deepenings.slice(0, 3),
    didacticExplanation,
    sampleAnswer,
    summary: progress.isReady
      ? (isFundamentalOne
        ? "Sua Lousa já mostra um bom entendimento do conteúdo. Agora você pode só deixar a explicação ainda mais completa."
        : "Sua Lousa já mostra um bom entendimento do conteúdo, mas sempre dá para deixar a explicação ainda mais clara e completa.")
      : (isFundamentalOne
        ? "Você já começou bem, mas ainda precisa completar melhor algumas ideias importantes do conteúdo."
        : "Você já começou a construir o entendimento, mas ainda precisa reforçar algumas ideias centrais para a Lousa ficar mais completa."),
  };
}

function clearStudyGuidedReflectionTimers() {
  if (studyGuidedReflectionAnalysisDebounceId) {
    window.clearTimeout(studyGuidedReflectionAnalysisDebounceId);
    studyGuidedReflectionAnalysisDebounceId = 0;
  }
  if (studyGuidedReflectionStagnationTimeoutId) {
    window.clearTimeout(studyGuidedReflectionStagnationTimeoutId);
    studyGuidedReflectionStagnationTimeoutId = 0;
  }
}

function updateStudyGuidedReflectionProgress(result, options = {}) {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) return;

  const previousSegments = Math.max(0, Number(studyGuidedReflectionState.progressSegments || 0));
  const nextSegments = Math.max(0, Math.min(studyGuidedUnderstandingSegmentCount, Number(result?.segments || 0)));
  const now = Date.now();
  const progressed = nextSegments > previousSegments;

  studyGuidedReflectionState = {
    ...studyGuidedReflectionState,
    progressSegments: nextSegments,
    progressScore: Math.max(0, Math.min(100, Number(result?.score || 0))),
    progressSource: String(result?._evaluationSource || result?.source || "").trim(),
    progressNotice: String(result?._evaluationNotice || result?.notice || "").trim(),
    canEvaluate: Boolean(result?.canEvaluate),
    readyToEvaluate: Boolean(result?.isReady),
    progressMessage: String(result?.message || "").trim(),
    lastProgressAt: progressed
      ? now
      : (studyGuidedReflectionState.lastProgressAt || now),
    promptShown: progressed ? false : studyGuidedReflectionState.promptShown,
    finalEvaluation: options.preserveFinalEvaluation ? studyGuidedReflectionState.finalEvaluation : null,
  };

  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function setStudyGuidedReflectionPromptShown(value) {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) return;
  studyGuidedReflectionState = {
    ...studyGuidedReflectionState,
    promptShown: Boolean(value),
  };
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function resetStudyGuidedReflectionPromptCycle() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) return;
  studyGuidedReflectionState = {
    ...studyGuidedReflectionState,
    lastProgressAt: Date.now(),
    promptShown: false,
  };
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function setStudyGuidedReflectionReviewUnlocked(value) {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) return;
  studyGuidedReflectionState = {
    ...studyGuidedReflectionState,
    reviewUnlocked: Boolean(value),
  };
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function closeStudyGuidedReplayModal() {
  if (studyGuidedReplayOverlay) {
    studyGuidedReplayOverlay.hidden = true;
  }
  if (studyGuidedReplayModal) {
    studyGuidedReplayModal.hidden = true;
  }
}

function settleStudyGuidedReplayModal(value) {
  const resolver = studyGuidedReplayResolve;
  studyGuidedReplayResolve = null;
  closeStudyGuidedReplayModal();
  if (typeof resolver === "function") {
    resolver(Boolean(value));
  }
}

function openStudyGuidedReplayModal(message) {
  if (!studyGuidedReplayOverlay || !studyGuidedReplayModal || !studyGuidedReplayMessage) {
    return Promise.resolve(false);
  }

  studyGuidedReplayMessage.textContent = message;
  studyGuidedReplayOverlay.hidden = false;
  studyGuidedReplayModal.hidden = false;

  return new Promise((resolve) => {
    studyGuidedReplayResolve = resolve;
  });
}

function closeStudyGuidedAudioWaitModal() {
  if (studyGuidedAudioWaitOverlay) {
    studyGuidedAudioWaitOverlay.hidden = true;
  }
  if (studyGuidedAudioWaitModal) {
    studyGuidedAudioWaitModal.hidden = true;
  }
}

function openStudyGuidedAudioWaitModal(message = "O áudio já vai começar") {
  if (!studyGuidedAudioWaitOverlay || !studyGuidedAudioWaitModal || !studyGuidedAudioWaitMessage) {
    return;
  }

  studyGuidedAudioWaitMessage.textContent = message;
  studyGuidedAudioWaitOverlay.hidden = false;
  studyGuidedAudioWaitModal.hidden = false;
}

function setStudyGuidedFinalEvaluation(result) {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  if (!currentSignature || studyGuidedReflectionState.signature !== currentSignature) return;
  studyGuidedReflectionState = {
    ...studyGuidedReflectionState,
    finalEvaluation: result && typeof result === "object"
      ? {
        analysis: String(result.analysis || "").trim(),
        positives: Array.isArray(result.positives) ? result.positives.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 4) : [],
        deepenings: Array.isArray(result.deepenings) ? result.deepenings.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 4) : [],
        didacticExplanation: String(result.didacticExplanation || "").trim(),
        sampleAnswer: String(result.sampleAnswer || "").trim(),
        summary: String(result.summary || "").trim(),
        source: String(result?._evaluationSource || result?.source || "").trim(),
        notice: String(result?._evaluationNotice || result?.notice || "").trim(),
      }
      : null,
  };
  localStorage.setItem(studyGuidedReflectionStorageKey, JSON.stringify(studyGuidedReflectionState));
}

function buildStudyGuidedProgressBarMarkup(activeSegments) {
  return Array.from({ length: studyGuidedUnderstandingSegmentCount }, (_, index) => {
    const segmentNumber = index + 1;
    return `<span class="study-guided-reflection-progress-segment${segmentNumber <= activeSegments ? " is-active" : ""}" aria-hidden="true"></span>`;
  }).join("");
}

function buildStudyGuidedFinalEvaluationHtml(evaluation) {
  if (!evaluation) return "";

  const analysis = String(evaluation.analysis || "").trim();
  const positives = Array.isArray(evaluation.positives) ? evaluation.positives.filter(Boolean) : [];
  const deepenings = Array.isArray(evaluation.deepenings) ? evaluation.deepenings.filter(Boolean) : [];
  const didacticExplanation = String(evaluation.didacticExplanation || "").trim();
  const sampleAnswer = String(evaluation.sampleAnswer || "").trim();
  const summary = String(evaluation.summary || "").trim();

  return `
    ${analysis ? `<p class="study-guided-reflection-feedback-summary">🧠 Análise da resposta<br>${escapeHtml(analysis)}</p>` : ""}
    ${positives.length ? `
      <div class="study-guided-reflection-feedback-block">
        <h5 class="study-guided-reflection-feedback-title">Pontos positivos</h5>
        <ul class="study-guided-reflection-feedback-list">
          ${positives.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}
    ${deepenings.length ? `
      <div class="study-guided-reflection-feedback-block">
        <h5 class="study-guided-reflection-feedback-title">O que poderia ser aprofundado</h5>
        <ul class="study-guided-reflection-feedback-list">
          ${deepenings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}
    ${didacticExplanation ? `
      <div class="study-guided-reflection-feedback-block">
        <h5 class="study-guided-reflection-feedback-title">Explicação completa</h5>
        <p class="study-guided-reflection-feedback-summary">${escapeHtml(didacticExplanation)}</p>
      </div>
    ` : ""}
    ${sampleAnswer ? `
      <div class="study-guided-reflection-feedback-block">
        <h5 class="study-guided-reflection-feedback-title">Exemplo de resposta completa</h5>
        <p class="study-guided-reflection-feedback-summary">${escapeHtml(sampleAnswer)}</p>
      </div>
    ` : ""}
    ${summary ? `<p class="study-guided-reflection-feedback-summary">${escapeHtml(summary)}</p>` : ""}
  `;
}

function buildStudyGuidedFinalEvaluationLoadingHtml() {
  return `
    <div class="study-guided-reflection-feedback-block">
      <h5 class="study-guided-reflection-feedback-title">Avaliação da Lousa</h5>
      <p class="study-guided-reflection-feedback-summary">A IA está avaliando o que foi escrito na Lousa.</p>
    </div>
  `;
}

function hasStudyGuidedFinalEvaluationContent(result) {
  if (!result || typeof result !== "object") return false;
  const analysis = String(result.analysis || "").trim();
  const positives = Array.isArray(result.positives) ? result.positives.filter(Boolean) : [];
  const deepenings = Array.isArray(result.deepenings) ? result.deepenings.filter(Boolean) : [];
  const didacticExplanation = String(result.didacticExplanation || "").trim();
  const sampleAnswer = String(result.sampleAnswer || "").trim();
  const summary = String(result.summary || "").trim();
  return Boolean(analysis || positives.length || deepenings.length || didacticExplanation || sampleAnswer || summary);
}

function triggerStudyGuidedFinalEvaluationFromUi(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  void handleStudyGuidedFinalEvaluation();
}

function bindStudyGuidedReflectionEvaluateButton() {
  if (!studyGuidedExplanationBody) return;

  const evaluateButton = studyGuidedExplanationBody.querySelector("[data-study-guided-evaluate]");
  if (!(evaluateButton instanceof HTMLButtonElement)) return;
  if (evaluateButton.dataset.evaluateBound === "true") return;

  evaluateButton.dataset.evaluateBound = "true";
  evaluateButton.onclick = triggerStudyGuidedFinalEvaluationFromUi;
  evaluateButton.onpointerup = triggerStudyGuidedFinalEvaluationFromUi;
  evaluateButton.ontouchend = triggerStudyGuidedFinalEvaluationFromUi;
  evaluateButton.addEventListener("click", triggerStudyGuidedFinalEvaluationFromUi);
}

function refreshStudyGuidedReflectionUi() {
  if (!studyGuidedExplanationBody) return;

  updateStudyGuidedReflectionBlurState();
  updateStudyGuidedReflectionTextareaVisualState();

  const reflectionState = getStudyGuidedReflectionStateForCurrentExplanation();
  const track = studyGuidedExplanationBody.querySelector("[data-study-guided-progress-track]");
  const message = studyGuidedExplanationBody.querySelector("[data-study-guided-progress-message]");
  const origin = studyGuidedExplanationBody.querySelector("[data-study-guided-progress-origin]");
  const notice = studyGuidedExplanationBody.querySelector("[data-study-guided-progress-notice]");
  const evaluateButton = studyGuidedExplanationBody.querySelector("[data-study-guided-evaluate]");
  const feedback = studyGuidedExplanationBody.querySelector("[data-study-guided-evaluation-feedback]");

  if (track) {
    track.innerHTML = buildStudyGuidedProgressBarMarkup(reflectionState.progressSegments || 0);
  }

  if (message) {
    const text = studyGuidedReflectionAnalyzing
      ? "A IA está comparando sua escrita com a explicação."
      : String(reflectionState.progressMessage || "").trim();
    message.textContent = text;
    message.hidden = !text;
  }

  if (origin) {
    origin.hidden = true;
    origin.textContent = "";
  }

  if (notice) {
    notice.hidden = true;
    notice.textContent = "";
  }

  if (evaluateButton) {
    evaluateButton.hidden = !canStudyGuidedReflectionBeEvaluated(reflectionState);
    evaluateButton.disabled = Boolean(studyGuidedReflectionEvaluating);
    evaluateButton.textContent = studyGuidedReflectionEvaluating ? "Avaliando..." : "Avaliar";
  }

  if (feedback) {
    const html = studyGuidedReflectionEvaluating && !reflectionState.finalEvaluation
      ? buildStudyGuidedFinalEvaluationLoadingHtml()
      : buildStudyGuidedFinalEvaluationHtml(reflectionState.finalEvaluation);
    feedback.innerHTML = html;
    feedback.hidden = !html;
  }

  refreshStudyGuidedTestUi();
}

function scheduleStudyGuidedStagnationPrompt() {
  if (studyGuidedReflectionStagnationTimeoutId) {
    window.clearTimeout(studyGuidedReflectionStagnationTimeoutId);
    studyGuidedReflectionStagnationTimeoutId = 0;
  }

  const reflectionState = getStudyGuidedReflectionStateForCurrentExplanation();
  const text = String(reflectionState.text || "").trim();
  if (!text || !reflectionState.finalEvaluation || reflectionState.promptShown) {
    return;
  }

  const baseTimestamp = Math.max(0, Number(reflectionState.lastProgressAt || 0)) || Date.now();
  const elapsed = Date.now() - baseTimestamp;
  const remaining = Math.max(0, studyGuidedStagnationPromptDelayMs - elapsed);

  studyGuidedReflectionStagnationTimeoutId = window.setTimeout(async () => {
    const latestState = getStudyGuidedReflectionStateForCurrentExplanation();
    if (!String(latestState.text || "").trim() || !latestState.finalEvaluation || latestState.promptShown) {
      return;
    }

    setStudyGuidedReflectionPromptShown(true);
    const wantsReplay = await openStudyGuidedReplayModal("Você gostaria de reler toda a explicação antes de continuar escrevendo na Lousa?");
    if (wantsReplay) {
      setStudyGuidedReflectionReviewUnlocked(true);
    }
    resetStudyGuidedReflectionPromptCycle();
    refreshStudyGuidedReflectionUi();
    scheduleStudyGuidedStagnationPrompt();
  }, remaining);
}

async function requestAiStudyGuidedWritingEvaluation(mode = "progress") {
  const payload = buildStudyGuidedWritingEvaluationRequest(mode);
  if (!payload) {
    throw new Error("A escrita da Lousa ainda não está pronta para avaliação.");
  }

  return mode === "final"
    ? buildStudyGuidedLocalFinalEvaluation(payload.request)
    : buildStudyGuidedLocalProgressEvaluation(payload.request);
}

async function runStudyGuidedReflectionProgressAnalysis() {
  const text = getStudyGuidedReflectionText().trim();
  if (!text) {
    clearStudyGuidedReflectionTimers();
    return;
  }

  const requestToken = ++studyGuidedReflectionRequestToken;
  studyGuidedReflectionAnalyzing = true;
  refreshStudyGuidedReflectionUi();

  try {
    const result = await requestAiStudyGuidedWritingEvaluation("progress");
    if (requestToken !== studyGuidedReflectionRequestToken) return;
    updateStudyGuidedReflectionProgress(result, { preserveFinalEvaluation: true });
    refreshStudyGuidedReflectionUi();
    scheduleStudyGuidedStagnationPrompt();
  } finally {
    if (requestToken === studyGuidedReflectionRequestToken) {
      studyGuidedReflectionAnalyzing = false;
      refreshStudyGuidedReflectionUi();
    }
  }
}

function queueStudyGuidedReflectionProgressAnalysis() {
  if (studyGuidedReflectionAnalysisDebounceId) {
    window.clearTimeout(studyGuidedReflectionAnalysisDebounceId);
  }
  studyGuidedReflectionAnalysisDebounceId = window.setTimeout(() => {
    studyGuidedReflectionAnalysisDebounceId = 0;
    void runStudyGuidedReflectionProgressAnalysis();
  }, 1200);
}

async function handleStudyGuidedFinalEvaluation() {
  if (studyGuidedReflectionEvaluating) return;
  const reflectionState = getStudyGuidedReflectionStateForCurrentExplanation();
  if (!canStudyGuidedReflectionBeEvaluated(reflectionState)) return;

  studyGuidedReflectionEvaluating = true;
  const payload = buildStudyGuidedWritingEvaluationRequest("final");
  if (!payload) {
    studyGuidedReflectionEvaluating = false;
    refreshStudyGuidedReflectionUi();
    return;
  }
  setStudyGuidedFinalEvaluation(null);
  refreshStudyGuidedReflectionUi();

  try {
    const result = await requestAiStudyGuidedWritingEvaluation("final");
    const safeResult = hasStudyGuidedFinalEvaluationContent(result)
      ? result
      : {
        ...buildStudyGuidedLocalFinalEvaluation(payload.request),
        _evaluationSource: "fallback",
        _evaluationNotice: "A avaliação final voltou vazia e foi refeita com o fallback local.",
      };

    setStudyGuidedFinalEvaluation(safeResult);
    resetStudyGuidedReflectionPromptCycle();
    scheduleStudyGuidedStagnationPrompt();
  } catch (error) {
    window.alert(getErrorMessage(error, "Não foi possível avaliar a Lousa agora."));
  } finally {
    studyGuidedReflectionEvaluating = false;
    refreshStudyGuidedReflectionUi();
  }
}

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

function getRecognizedLoginProfile() {
  const setup = getInitialSetup();
  const setupEmail = getProfileDocId(setup?.responsibleEmail || "");
  if (setupEmail) {
    return {
      responsibleName: String(setup?.responsibleName || "").trim(),
      responsibleEmail: setupEmail,
    };
  }

  try {
    const savedProfile = JSON.parse(localStorage.getItem(recognizedLoginProfileStorageKey) || "null");
    const savedEmail = getProfileDocId(savedProfile?.responsibleEmail || "");
    if (!savedEmail) return null;
    return {
      responsibleName: String(savedProfile?.responsibleName || "").trim(),
      responsibleEmail: savedEmail,
    };
  } catch {
    return null;
  }
}

function storeRecognizedLoginProfile(profile = {}) {
  const responsibleEmail = getProfileDocId(profile?.responsibleEmail || "");
  if (!responsibleEmail) {
    localStorage.removeItem(recognizedLoginProfileStorageKey);
    return;
  }

  localStorage.setItem(
    recognizedLoginProfileStorageKey,
    JSON.stringify({
      responsibleName: String(profile?.responsibleName || "").trim(),
      responsibleEmail,
    }),
  );
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
  const rawValue = String(localStorage.getItem(studyGuidedKnowledgeStorageKey) || "");
  const trimmedValue = rawValue.trim();
  if (legacyStudyGuidedKnowledgePlaceholders.has(trimmedValue)) {
    localStorage.removeItem(studyGuidedKnowledgeStorageKey);
    return "";
  }
  return trimmedValue;
}

function setStudyGuidedKnowledge(value) {
  const normalizedValue = String(value || "");
  const trimmedValue = normalizedValue.trim();
  if (!trimmedValue || legacyStudyGuidedKnowledgePlaceholders.has(trimmedValue)) {
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
  localStorage.removeItem(lastActiveViewStorageKey);
}

function hasActiveRuntimeSession() {
  try {
    if (sessionStorage.getItem(activeRuntimeSessionStorageKey) === "true") {
      return true;
    }
  } catch (_error) {
    // no-op
  }

  try {
    return localStorage.getItem(activeRuntimeSessionStorageKey) === "true";
  } catch (_error) {
    return false;
  }
}

function markActiveRuntimeSession() {
  try {
    sessionStorage.setItem(activeRuntimeSessionStorageKey, "true");
  } catch (_error) {
    // no-op
  }

  try {
    localStorage.setItem(activeRuntimeSessionStorageKey, "true");
  } catch (_error) {
    // no-op
  }
}

function clearActiveRuntimeSession() {
  try {
    sessionStorage.removeItem(activeRuntimeSessionStorageKey);
  } catch (_error) {
    // no-op
  }

  try {
    localStorage.removeItem(activeRuntimeSessionStorageKey);
  } catch (_error) {
    // no-op
  }
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

function getStoredLastActiveView() {
  const storedView = String(localStorage.getItem(lastActiveViewStorageKey) || "").trim();
  if (["parent", "child", "history", "dashboard-selector", "test-status"].includes(storedView)) {
    return storedView;
  }
  return "";
}

function storeLastActiveView(view) {
  if (["parent", "child", "history", "dashboard-selector", "test-status"].includes(view)) {
    localStorage.setItem(lastActiveViewStorageKey, view);
    return;
  }
  localStorage.removeItem(lastActiveViewStorageKey);
}

function getSessionReturnView() {
  const storedView = getStoredLastActiveView();
  if (storedView) {
    return storedView;
  }
  if (dashboardSelectorView) {
    return "dashboard-selector";
  }
  return responsibleEntryView ? "responsible-entry" : "parent";
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
  storeRecognizedLoginProfile({
    responsibleName: snapshot.responsibleName || "",
    responsibleEmail: snapshot.responsibleEmail,
  });

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

function buildDissertativeEvaluation(question, answer) {
  const responseText = String(answer || "").trim();
  const expectedAnswers = getQuestionExpectedAnswers(question);
  const bestExpected = expectedAnswers[0] || "";
  const bestScore = expectedAnswers.reduce((highest, candidate) => {
    return Math.max(highest, computeSimilarityScore(responseText, candidate, question?.text || ""));
  }, 0);
  const expectedTokens = extractMeaningfulTokens(bestExpected);
  const answerTokens = extractMeaningfulTokens(responseText);
  const sharedTokens = expectedTokens.filter((token) => answerTokens.includes(token));
  const missingTokens = expectedTokens.filter((token) => !answerTokens.includes(token));
  const explanation = getExplanationForQuestion(question);

  let level = "initial";
  if (bestScore >= 0.76) {
    level = "complete";
  } else if (bestScore >= 0.45) {
    level = "partial";
  }

  const analysisByLevel = {
    complete: "Sua resposta está dentro do contexto da matéria e mostra boa compreensão do que a questão queria avaliar.",
    partial: "Sua resposta está no contexto da matéria e mostra compreensão parcial do conteúdo, mas ainda pode ficar mais completa.",
    initial: "Sua resposta toca no tema, mas ainda demonstra pouca precisão nos conceitos principais pedidos pela questão.",
  };

  const positiveLines = [];
  if (responseText) {
    positiveLines.push("Você tentou responder com suas próprias palavras, o que é importante em questões abertas.");
  }
  if (sharedTokens.length) {
    positiveLines.push(`Você mencionou ideias centrais do conteúdo, como ${sharedTokens.slice(0, 3).join(", ")}.`);
  }
  if (level === "complete") {
    positiveLines.push("A resposta mostra que você compreendeu bem a relação entre o enunciado e o conteúdo estudado.");
  } else if (level === "partial") {
    positiveLines.push("Há sinais de compreensão do tema, mesmo que a resposta ainda precise de alguns ajustes.");
  }
  if (!positiveLines.length) {
    positiveLines.push("Sua resposta está relacionada ao tema da questão.");
  }

  const deepenLines = [];
  if (missingTokens.length) {
    deepenLines.push(`Vale aprofundar pontos como ${missingTokens.slice(0, 4).join(", ")}.`);
  }
  if (level === "partial") {
    deepenLines.push("Tente ligar melhor sua resposta ao que o enunciado pediu de forma mais direta.");
  }
  if (level === "initial") {
    deepenLines.push("Faltou trazer os conceitos essenciais que conectam sua resposta ao conteúdo estudado.");
    deepenLines.push("Tente explicar a ideia principal com mais clareza e com um exemplo do próprio conteúdo.");
  }
  if (!deepenLines.length) {
    deepenLines.push("Sua resposta já cobre bem o essencial; agora o foco pode ser deixar a explicação ainda mais clara.");
  }

  const sampleAnswer = bestExpected || explanation.explanation || "Uma resposta completa precisa retomar os conceitos centrais do conteúdo estudado.";

  return {
    score: bestScore,
    mastered: bestScore >= 0.64,
    level,
    analysis: analysisByLevel[level],
    positives: positiveLines,
    deepenings: deepenLines,
    didacticExplanation: explanation.explanation,
    sampleAnswer,
    feedbackTitle: level === "complete"
      ? "🧠 Boa compreensão demonstrada"
      : level === "partial"
        ? "🧠 Compreensão em desenvolvimento"
        : "🧠 Vamos aprofundar essa resposta",
    supportText: level === "complete"
      ? "Você mostrou entendimento do conteúdo. Vamos seguir."
      : "Sua resposta pode ficar mais forte com alguns ajustes.",
  };
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
  const parentDashboardMode = getParentDashboardMode();

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
    aiDashboardKnowledge.placeholder = studyGuidedKnowledgePlaceholder;
    aiDashboardKnowledge.value = parentDashboardMode === "study-guided"
      ? getStudyGuidedKnowledge()
      : (shouldReuseDraft ? draft.knowledge : "");
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
- Em questão de múltipla escolha, o campo "text" deve trazer apenas o enunciado.
- Nunca inclua A), B), C) ou D) dentro do campo "text".
- Em múltipla escolha, as quatro alternativas devem aparecer somente em "options".
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
    generateStudyFollowupPath: String(rawConfig.generateStudyFollowupPath || "/api/ai/generate-study-followup").trim() || "/api/ai/generate-study-followup",
    generateStudyAudioPath: String(rawConfig.generateStudyAudioPath || "/api/ai/generate-study-audio").trim() || "/api/ai/generate-study-audio",
    evaluateStudyWritingPath: String(rawConfig.evaluateStudyWritingPath || "/api/ai/evaluate-study-writing").trim() || "/api/ai/evaluate-study-writing",
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

function getAiGenerateStudyFollowupUrl(config = getAiApiConfig()) {
  if (!config.baseUrl) {
    return config.generateStudyFollowupPath;
  }

  return new URL(config.generateStudyFollowupPath, config.baseUrl).toString();
}

function getAiGenerateStudyAudioUrl(config = getAiApiConfig()) {
  if (!config.baseUrl) {
    return config.generateStudyAudioPath;
  }

  return new URL(config.generateStudyAudioPath, config.baseUrl).toString();
}

function getAiEvaluateStudyWritingUrl(config = getAiApiConfig()) {
  if (!config.baseUrl) {
    return config.evaluateStudyWritingPath;
  }

  return new URL(config.evaluateStudyWritingPath, config.baseUrl).toString();
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
    const normalizedErrorMessage = error?.name === "AbortError"
      ? "A geração do teste demorou mais do que o esperado. Tente novamente."
      : (error instanceof Error ? error.message : "Falha desconhecida na API.");
    console.warn("Versão IA: usando fallback simulado após falha na API.", error);
    return {
      ...buildSimulatedResult(),
      errorMessage: normalizedErrorMessage,
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

  if (activeSubjects.length > 1) {
    return {
      ok: false,
      message: "No Estudo Guiado, faça um estudo por vez. Escolha apenas uma matéria para gerar a explicação.",
      grade: selectedGrade,
      subjects: activeSubjects,
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

const studyGuidedSubjectKeywordHints = {
  "Português": ["substantivo", "verbo", "adjetivo", "oração", "crase", "pontuação", "concordância", "acentuação", "interpretação", "texto"],
  "História": ["guerra", "império", "colônia", "revolução", "independência", "idade média", "presidente", "ditadura", "povo antigo", "civilização"],
  "Geografia": ["mapa", "território", "clima", "relevo", "vegetação", "hidrografia", "continente", "população", "urbanização", "paisagem"],
  "Biologia": ["coração", "célula", "corpo humano", "sistema digestório", "respiração", "órgão", "ser vivo", "genética", "ecossistema", "fotossíntese"],
  "Química": ["átomo", "átomos", "molécula", "moléculas", "elemento químico", "tabela periódica", "reação química", "mistura", "substância", "ligação química"],
  "Física": ["força", "movimento", "energia", "velocidade", "gravidade", "massa", "aceleração", "eletricidade", "circuito", "ondas"],
  "Inglês": ["verb to be", "simple present", "simple past", "present continuous", "english", "inglês", "vocabulary", "reading", "listening"],
  "Artes": ["pintura", "escultura", "teatro", "música", "dança", "obra de arte", "artista", "cores", "desenho", "cinema"],
};

function detectStudyGuidedLikelySubjectFromText(rawText) {
  const text = String(rawText || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!text) return "";

  let bestSubject = "";
  let bestScore = 0;

  Object.entries(studyGuidedSubjectKeywordHints).forEach(([subjectLabel, keywords]) => {
    const score = keywords.reduce((total, keyword) => {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return total + (text.includes(normalizedKeyword) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestSubject = subjectLabel;
    }
  });

  return bestScore > 0 ? bestSubject : "";
}

function isStudyGuidedTextTooVague(rawText) {
  const normalizedText = String(rawText || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedText) return true;

  const words = normalizedText.split(" ").filter(Boolean);
  if (words.length < 2) return true;

  return normalizedText.length < 12;
}

function validateStudyGuidedContentForSelectedSubject(selectionState) {
  const selectedSubjects = Array.isArray(selectionState?.subjects) ? selectionState.subjects : [];
  if (selectedSubjects.length !== 1) {
    return {
      ok: false,
      message: "No Estudo Guiado, faça um estudo por vez. Escolha apenas uma matéria para gerar a explicação.",
    };
  }

  const selectedSubjectLabel = getSubjectDisplayLabel(selectedSubjects[0]);
  const knowledgeText = getStudyGuidedKnowledge();
  const hasUploadedImages = studyGuidedUploadPreviewDataUrls.length > 0;

  if (!knowledgeText && !hasUploadedImages) {
    return {
      ok: false,
      message: "No Estudo Guiado, escreva o conteúdo da matéria ou envie ao menos uma imagem antes de clicar em Gerar Estudo.",
    };
  }

  if (knowledgeText) {
    const detectedSubject = detectStudyGuidedLikelySubjectFromText(knowledgeText);
    if (detectedSubject && detectedSubject !== selectedSubjectLabel) {
      return {
        ok: false,
        message: "O conteúdo não corresponde à matéria escolhida. No Estudo Guiado, escolha uma única matéria por vez e envie um conteúdo alinhado a ela.",
      };
    }

    if (!detectedSubject && !hasUploadedImages && isStudyGuidedTextTooVague(knowledgeText)) {
      return {
        ok: false,
        message: "O conteúdo enviado é inválido para a matéria escolhida. Escreva um tema real da matéria para gerar o estudo.",
      };
    }
  }

  return { ok: true, message: "" };
}

function compactStudyGuidedKnowledge(rawText) {
  const cleaned = String(rawText || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join("\n")
    .trim();

  if (!cleaned) return "";

  return cleaned.length > 420
    ? `${cleaned.slice(0, 417).trim()}...`
    : cleaned;
}

function buildStudyGuidedTeacherPersona(request) {
  if (!request) return "";

  const subjectLabels = Array.isArray(request.subjects)
    ? request.subjects.map((subject) => getSubjectDisplayLabel(subject)).filter(Boolean)
    : [];

  const gradeLabel = request.grade ? `${request.grade}º ano` : "ano selecionado";

  if (!subjectLabels.length) {
    return `Atue como um(a) professor(a) do ${gradeLabel}, com linguagem simples, passo a passo e foco total no material enviado.`;
  }

  if (subjectLabels.length === 1) {
    return `Atue como um(a) professor(a) de ${subjectLabels[0]} do ${gradeLabel}, ensinando como em sala de aula: fala fluida, didática clara, linguagem simples, excelente gramática, pontuação impecável, boa concordância, analogias úteis e foco total na compreensão real da aluna.`;
  }

  return `Atue como os(as) professores(as) das matérias ${subjectLabels.join(", ")} do ${gradeLabel}, tratando cada explicação de acordo com a matéria correspondente, com fala fluida, didática clara, linguagem simples, excelente gramática, pontuação impecável, boa concordância, analogias úteis e foco total na compreensão real da aluna.`;
}

function buildStudyGuidedUserPrompt(request) {
  if (!request) return "";

  const subjectLabels = request.subjects.map((subject) => getSubjectDisplayLabel(subject)).join(", ");
  const compactKnowledge = compactStudyGuidedKnowledge(request.knowledgeBase);
  const hasKnowledgeBase = Boolean(compactKnowledge);
  const teacherPersona = buildStudyGuidedTeacherPersona(request);

  return `Você vai explicar um conteúdo escolar para uma aluna que está vendo esse assunto pela primeira vez.

Contexto:
- Ano: ${request.grade} ano
- Etapa: ${request.gradeGroup}
- Matéria(s): ${subjectLabels}
- Perfil docente obrigatório: ${teacherPersona}
- Texto digitado em "Conteúdo da Matéria" (recorte principal):
${hasKnowledgeBase ? compactKnowledge : "(não informado)"}
- Quantidade de imagens enviadas: ${request.uploadedImages.length}

Instruções obrigatórias:
- Antes de explicar, valide se a resposta está coerente com o ano e com a(s) matéria(s) selecionada(s).
- Quando a matéria e o ano forem definidos, trate essa combinação como obrigatória em toda a resposta.
- Faça essa validação internamente.
- Não escreva na resposta frases como "esse conteúdo é coerente com..." ou "está adequado ao ano...".
- A seção "intro" deve começar resumindo diretamente o conteúdo enviado, em vez de comentar a validação.
- Se o conteúdo digitado for "Coração", por exemplo, a intro deve resumir em poucas linhas o que é o coração.
- Se o conteúdo vier por imagem, a intro deve resumir em poucas linhas o tema principal identificado na imagem.
- Mantenha o texto original do conteúdo como base.
- Faça uma explicação abrangente o suficiente para garantir entendimento real do conteúdo.
- Priorize os pontos mais importantes e explique o que realmente precisa ser compreendido.
- Use linguagem fácil.
- Evite termos técnicos; quando aparecerem, explique em linguagem simples.
- Garanta boa gramática, boa concordância e frases naturais em toda a resposta.
- Faça revisão final obrigatória de ortografia, acentuação, vírgulas, pontuação e concordância antes de responder.
- Não deixe nenhum trecho com aparência de rascunho, frase solta, quebra estranha ou construção mal acabada.
- Use um tom didático, claro, humano e fluido, como um(a) professor(a) explicando em sala para alunos que estão vendo o assunto pela primeira vez.
- Organize a resposta em etapas claras e progressivas.
- A introdução deve resumir o conteúdo com naturalidade, sem começar com frases como "o texto mostra", "o conteúdo mostra" ou "o material mostra".
- A seção "intro" deve funcionar como um resumo curto do conteúdo.
- Prefira de 2 a 4 frases curtas na "intro".
- Não transforme a "intro" em uma explicação longa; a explicação detalhada fica na seção "steps".
- Se o conteúdo enviado for um enunciado de exercício ou uma atividade, trate isso como prioridade máxima na seção "steps".
- Em exercícios e atividades, sua principal função NÃO é resolver imediatamente.
- Primeiro, ajude a aluna a entender o enunciado, traduzindo o texto para uma linguagem simples, clara e acessível.
- Em exercícios e atividades, nunca assuma que a aluna entendeu o enunciado.
- Explique primeiro e calcule ou resolva depois.
- Em exercícios e atividades, use linguagem de professor(a) de Ensino Fundamental II, especialmente como um(a) professor(a) de 9º ano: didática forte, frases claras, ótima gramática e zero enrolação.
- Se o enunciado estiver confuso, mostre primeiro uma versão simplificada antes da resolução.
- Mostre com clareza: o que a questão quer saber, quais dados importam, o que pode confundir e qual caminho a aluna deve seguir para responder.
- A seção "steps" deve ter apenas a quantidade de etapas realmente necessária para o entendimento.
- Faça internamente um cálculo de importância textual: se o conteúdo exigir mais desenvolvimento, aumente os passos; se exigir menos, reduza.
- Prefira entre 3 e 5 etapas. Na maioria dos casos, use 3 ou 4.
- Cada etapa deve desenvolver uma única ideia importante com clareza e de forma enxuta.
- Prefira uma frase curta por etapa. Use duas frases curtas apenas quando isso for realmente necessário para o entendimento.
- Evite blocos longos dentro de um mesmo passo.
- Quando uma ideia puder ser dita com menos palavras sem perder entendimento, escolha a forma mais curta.
- Evite repetir o que já foi explicado na introdução.
- Cada passo deve ir direto ao ponto, mas com informação suficiente para o aluno realmente entender a ideia explicada.
- Em conteúdos mais simples, reduza a quantidade de texto dentro de cada passo.
- Em enunciados de exercício e atividades, a seção "steps" deve seguir obrigatoriamente esta ordem:
- Passo 1 - Reescreva o enunciado: reescreva com palavras simples, como se estivesse explicando para uma aluna de 13 a 15 anos; elimine palavras difíceis; divida frases longas em frases curtas; mantenha exatamente o mesmo significado.
- Passo 2 - Identifique as informações importantes: use o formato "O que sabemos:" e liste apenas os dados realmente importantes.
- Passo 3 - Traduza o português da questão para a lógica da disciplina: deixe claro o que cada frase quer dizer dentro da matéria escolhida.
- Se a matéria for Matemática, no passo 3 monte também uma tabela com duas colunas: "Palavra ou frase" e "Significado matemático". Inclua expressões do tipo soma, diferença, dobro, triplo, metade, maior que, menor que e outras equivalentes encontradas no enunciado.
- Passo 4 - Defina as incógnitas ou elementos principais: explique com clareza "Vamos chamar..." e nomeie o que precisa ser descoberto.
- Passo 5 - Monte a estrutura de resolução: mostre como cada frase do enunciado se transforma em conta, equação, relação, regra, argumento ou procedimento da matéria correspondente.
- Passo 6 - Resolva: mostre apenas um passo por linha, sem pular etapas.
- Passo 7 - Verifique a resposta: substitua ou confira a resposta no problema original e mostre por que ela faz sentido.
- Passo 8 - Fechamento: explique em até 3 frases o que o exercício queria, como foi traduzido para a linguagem da matéria e qual foi a resposta final.
- Em Matemática, preserve explicitamente a diferença entre "texto" e "matemática".
- Em outras matérias, preserve explicitamente a diferença entre "o que a questão está pedindo" e "como responder corretamente".
- O exemplo deve ajudar o aluno a visualizar ou sentir o conteúdo em uma situação real da vida.
- Ensine como um(a) professor(a) da matéria selecionada para o ano escolhido.
- Quando houver exercícios, conduza a explicação como quem também resolve exercícios da matéria escolhida.
- Quando quiser facilitar a compreensão, use analogias, comparações simples e situações reais do dia a dia.
- Preserve esse mesmo perfil pedagógico mesmo quando o conteúdo vier por imagem.
- Use as informações do conteúdo digitado, das imagens enviadas e conhecimento web estritamente alinhado ao tema e ao ano escolar.
- Se alguma informação não estiver no material enviado e também não puder ser sustentada com segurança pelo conteúdo alinhado ao tema, diga exatamente: "Essa informação não está no material enviado".
- Não fuja das matérias selecionadas.
- Antes de gerar a explicação, valide se o conteúdo digitado ou a imagem enviada realmente correspondem à matéria selecionada.
- Se não corresponderem, marque metadata.isCompatible como false.
- Quando metadata.isCompatible for false, preencha metadata.incompatibilityMessage com: "A matéria escolhida e o conteúdo enviado não correspondem. No Estudo Guiado, escolha uma única matéria por vez e envie um conteúdo alinhado a ela."
- Quando metadata.isCompatible for false, não invente explicação; devolva intro, steps e visualExample vazios.
- Considere incompatível quando o tema central apontar claramente para outra matéria. Exemplos: átomos, moléculas e reações -> Química; força, energia e movimento -> Física; guerras, revoluções e impérios -> História; mapas, clima e relevo -> Geografia; coração, células e órgãos -> Biologia.
- O último passo deve funcionar como um fechamento bem estruturado do conteúdo já explicado.
- Não transforme esse fechamento em exercício, pergunta, atividade ou checklist.
- Não escreva a palavra "conclusão", mas faça esse fechamento soar natural e útil para fixação do entendimento.
- A seção "visualExample" deve funcionar apenas como um campo "Exemplo".
- Não use wireframe, setas, esquemas de lousa ou diagramas textuais.
- Nesse campo, explique o conteúdo em uma situação real da vida, usando analogias, comparações e exemplos simples que facilitem o entendimento.
- Deixe o exemplo um pouco mais curto e direto do que a explicação principal, mas com contexto suficiente para facilitar o entendimento.
- Sempre que possível, use 2 frases curtas ou 1 frase um pouco mais desenvolvida no exemplo.
- Responda com profundidade suficiente para ensinar bem, mas sem exagerar em repetição.
- Retorne apenas JSON válido.

Formato obrigatório:
{
  "metadata": {
    "grade": "string",
    "subjects": ["string"],
    "generatedAt": "ISO-8601 string",
    "usedKnowledgeBase": true,
    "usedImages": 0,
    "isCompatible": true,
    "incompatibilityMessage": ""
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
      system: "Você é uma IA educacional que explica conteúdos escolares com clareza, fidelidade ao material enviado e linguagem simples. Sempre valide a matéria e o ano escolar selecionados antes de responder e atue como professor(a) correspondente a essa combinação. Faça essa validação internamente e nunca use a introdução para falar da validação; a introdução deve começar explicando diretamente o conteúdo enviado. Escreva com ótima gramática, excelente ortografia, acentuação correta, vírgulas e pontuação bem colocadas, boa concordância, clareza didática e tom humano, fluido e natural, como um(a) professor(a) explicando em sala de aula. Revise toda a resposta antes de finalizar.",
      user: buildStudyGuidedUserPrompt(request),
    },
  };
}

function buildStudyGuidedTestKnowledgeBase() {
  if (!studyGuidedExplanationState?.explanation) return "";

  const intro = normalizeStudyGuidedAudioText(studyGuidedExplanationState.explanation.intro || "");
  const steps = Array.isArray(studyGuidedExplanationState.explanation.steps)
    ? studyGuidedExplanationState.explanation.steps
      .map(normalizeStudyGuidedStep)
      .map((step) => normalizeStudyGuidedAudioText(step))
      .filter(Boolean)
    : [];

  return [intro, ...steps].filter(Boolean).join("\n");
}

function buildStudyGuidedTestRequest(selectionState = getStudyGuidedSelectionState()) {
  if (!selectionState?.ok || !selectionState.grade) return null;

  const draft = getStudyGuidedTestDraft();
  return {
    grade: normalizeGradeLabel(selectionState.grade),
    gradeGroup: getGradeGroupDisplayLabel(selectionState.grade),
    subjects: Array.isArray(selectionState.subjects)
      ? selectionState.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
      : [],
    unlockMinutes: Math.max(1, Number(localStorage.getItem("smartUnlockMinutes") || unlockTimeSelect?.value || 1)),
    count: Math.max(1, Number(draft.count || 5)),
    questionTypes: {
      choice: Boolean(draft.questionTypes?.choice),
      text: Boolean(draft.questionTypes?.text),
    },
    knowledgeBase: buildStudyGuidedTestKnowledgeBase(),
  };
}

function buildStudyGuidedTestPayload(selectionState = getStudyGuidedSelectionState()) {
  const request = buildStudyGuidedTestRequest(selectionState);
  if (!request) return null;

  return {
    request,
    prompt: {
      system: aiGenerationSystemPrompt,
      user: buildAiGenerationUserPrompt(request),
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
      intro: `${firstTopic} é o tema central deste estudo. Aqui vai um resumo curto com a ideia principal do conteúdo.`,
      steps: [
        "Identifique a ideia principal do conteúdo enviado.",
        "Explique os pontos mais importantes com linguagem simples.",
        "Relacione o conteúdo à matéria escolhida de forma natural.",
        "Feche retomando o que mais importa guardar.",
      ],
      visualExample: knowledgeText
        ? `Exemplo: imagine uma situação do dia a dia em que "${firstTopic}" apareça de forma simples e concreta, ajudando a perceber essa ideia com mais facilidade.`
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
        isCompatible: parsed.metadata?.isCompatible !== false,
        incompatibilityMessage: String(parsed.metadata?.incompatibilityMessage || "").trim(),
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
      isCompatible: rawResponse?.metadata?.isCompatible !== false,
      incompatibilityMessage: String(rawResponse?.metadata?.incompatibilityMessage || "").trim(),
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
    if (rawResponse?.metadata?.isCompatible === false) {
      const incompatibilityMessage = String(
        rawResponse?.metadata?.incompatibilityMessage
        || "A matéria escolhida e o conteúdo enviado não correspondem. No Estudo Guiado, escolha uma única matéria por vez e envie um conteúdo alinhado a ela."
      ).trim();
      throw new Error(incompatibilityMessage);
    }
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

function buildStudyGuidedFollowupRequest(question, selectionState = getStudyGuidedSelectionState()) {
  if (!selectionState?.ok || !studyGuidedExplanationState?.explanation) return null;

  return {
    grade: normalizeGradeLabel(selectionState.grade),
    gradeGroup: getGradeGroupDisplayLabel(selectionState.grade),
    subjects: Array.isArray(selectionState.subjects)
      ? selectionState.subjects.map((subject) => normalizeSubjectName(subject)).filter(Boolean)
      : [],
    knowledgeBase: getStudyGuidedKnowledge(),
    uploadedImages: studyGuidedUploadPreviewDataUrls.slice(0, 3),
    explanation: {
      intro: String(studyGuidedExplanationState.explanation.intro || "").trim(),
      steps: Array.isArray(studyGuidedExplanationState.explanation.steps)
        ? studyGuidedExplanationState.explanation.steps.map((step) => String(step || "").trim()).filter(Boolean)
        : [],
    },
    history: getStudyGuidedConversationMessages().map((message) => ({
      role: message.role,
      text: message.text,
    })),
    question: String(question || "").trim(),
  };
}

function buildStudyGuidedFollowupPayload(question, selectionState = getStudyGuidedSelectionState()) {
  const request = buildStudyGuidedFollowupRequest(question, selectionState);
  if (!request) return null;
  return { request };
}

function parseStudyGuidedFollowupResponse(rawResponse) {
  return {
    source: rawResponse?.source === "api" ? "api" : "simulated",
    compatible: rawResponse?.metadata?.isCompatible !== false,
    message: String(rawResponse?.message || rawResponse?.answer || "").trim(),
  };
}

function buildLocalStudyGuidedFollowup(payload) {
  const request = payload?.request || {};
  const question = String(request.question || "").trim();
  const selectedSubjects = Array.isArray(request.subjects) ? request.subjects : [];
  const selectedSubjectLabel = selectedSubjects.length ? getSubjectDisplayLabel(selectedSubjects[0]) : "";
  const detectedSubject = detectStudyGuidedLikelySubjectFromText(question);

  if (selectedSubjects.length !== 1 || (detectedSubject && detectedSubject !== selectedSubjectLabel)) {
    return {
      source: "simulated",
      compatible: false,
      message: studyGuidedFollowupInvalidMessage,
    };
  }

  const intro = String(request.explanation?.intro || "").trim();
  const steps = Array.isArray(request.explanation?.steps) ? request.explanation.steps.map((step) => String(step || "").trim()).filter(Boolean) : [];
  const referenceSnippet = [intro, ...steps].filter(Boolean).join(" ").trim();
  const shortenedReference = referenceSnippet.length > 460
    ? `${referenceSnippet.slice(0, 457).trim()}...`
    : referenceSnippet;

  return {
    source: "simulated",
    compatible: true,
    message: shortenedReference
      ? `Vamos continuar dentro deste mesmo conteúdo. ${shortenedReference} Em relação à sua pergunta, observe como essa dúvida se conecta ao tema principal e aos pontos já explicados.`
      : "Vamos continuar dentro deste mesmo conteúdo e aprofundar essa dúvida com base no que já foi estudado.",
  };
}

async function requestAiStudyGuidedFollowup(payload) {
  if (!payload?.request) {
    throw new Error("A pergunta complementar ainda não está pronta para ser enviada.");
  }

  const config = getAiApiConfig();
  if (config.providerMode !== "api") {
    return buildLocalStudyGuidedFollowup(payload);
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), config.timeoutMs)
    : null;

  try {
    const response = await fetch(getAiGenerateStudyFollowupUrl(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: payload.request,
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

    return parseStudyGuidedFollowupResponse(await response.json());
  } catch (error) {
    console.warn("Estudo Guiado: usando resposta complementar local após falha na API.", error);
    return buildLocalStudyGuidedFollowup(payload);
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

function getStudyGuidedTestQuestionBank() {
  return normalizeQuestionBank(JSON.parse(localStorage.getItem(studyGuidedTestQuestionBankStorageKey) || "null"));
}

function saveStudyGuidedTestQuestionBank(bank) {
  localStorage.setItem(
    studyGuidedTestQuestionBankStorageKey,
    JSON.stringify(normalizeQuestionBank(bank)),
  );
}

function clearStudyGuidedTestQuestionBank() {
  saveStudyGuidedTestQuestionBank(createEmptyQuestionBank());
}

function getStudyGuidedTestQuestionsForGrade(grade) {
  return getStudyGuidedTestQuestionBank()[normalizeGradeLabel(grade)] || [];
}

function getStudyGuidedTestMeta() {
  try {
    const rawMeta = JSON.parse(localStorage.getItem(studyGuidedTestMetaStorageKey) || "null");
    if (!rawMeta || typeof rawMeta !== "object") return null;
    return {
      signature: String(rawMeta.signature || "").trim(),
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

function saveStudyGuidedTestMeta(meta) {
  localStorage.setItem(
    studyGuidedTestMetaStorageKey,
    JSON.stringify({
      signature: String(meta?.signature || "").trim(),
      source: meta?.source === "api" ? "api" : "simulated",
      generatedAt: String(meta?.generatedAt || new Date().toISOString()),
      count: Math.max(0, Number(meta?.count || 0)),
      grade: normalizeGradeLabel(meta?.grade || ""),
      errorMessage: String(meta?.errorMessage || "").trim(),
    }),
  );
}

function clearStudyGuidedTestGeneratedState(options = {}) {
  clearStudyGuidedTestQuestionBank();
  localStorage.removeItem(studyGuidedTestMetaStorageKey);
  if (!options.preservePreviewOpen) {
    saveStudyGuidedTestDraft({
      ...getStudyGuidedTestDraft(),
      previewOpen: false,
    });
  }
}

function syncStudyGuidedTestState() {
  const currentSignature = getStudyGuidedExplanationSignature(studyGuidedExplanationState);
  const currentDraft = getStudyGuidedTestDraft();
  const currentMeta = getStudyGuidedTestMeta();

  if (!currentSignature) {
    saveStudyGuidedTestDraft(createDefaultStudyGuidedTestDraft());
    clearStudyGuidedTestQuestionBank();
    localStorage.removeItem(studyGuidedTestMetaStorageKey);
    return;
  }

  if (currentDraft.signature === currentSignature && (!currentMeta || currentMeta.signature === currentSignature)) {
    return;
  }

  saveStudyGuidedTestDraft({
    ...createDefaultStudyGuidedTestDraft(currentSignature),
    count: currentDraft.count,
    questionTypes: {
      choice: Boolean(currentDraft.questionTypes?.choice ?? true),
      text: Boolean(currentDraft.questionTypes?.text),
    },
    previewOpen: false,
  });
  clearStudyGuidedTestQuestionBank();
  localStorage.removeItem(studyGuidedTestMetaStorageKey);
}

function replaceStudyGuidedTestQuestionsForGrade(grade, questionList) {
  const normalizedGrade = normalizeGradeLabel(grade);
  const questionBank = getStudyGuidedTestQuestionBank();
  questionBank[normalizedGrade] = ensureFourOptions(
    questionList.map((question) => ({
      ...question,
      grade: normalizedGrade,
      age: Number(question.age || inferAgeFromGrade(normalizedGrade)),
      subject: normalizeSubjectName(question.subject),
    })),
  );
  saveStudyGuidedTestQuestionBank(questionBank);
  return questionBank;
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
  forceResponsibleLogoutFromTest();
}

function showPasswordGate() {}

function hidePasswordGate() {}

function forceResponsibleLogoutFromTest() {
  const returnDashboardMode = getParentDashboardMode();
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
  responsibleEntryAuthorized = true;
  clearResponsibleEntryForm();
  if (returnDashboardMode === "study-guided" || returnDashboardMode === "tests") {
    setParentDashboardMode(returnDashboardMode);
  }
  setActiveView("parent");
}

function setStudentGateMode(mode) {
  const isWelcome = mode === "welcome";
  educationGate.classList.toggle("is-welcome", isWelcome);
  stepLine.hidden = isWelcome;
  progressTrack.hidden = isWelcome;
  supportText.hidden = isWelcome;
  actionRow.hidden = isWelcome;
  gradeLabel.hidden = isWelcome;
  nextButton.classList.remove("test-summary-retry-button");
  if (testSummaryExitButton) {
    testSummaryExitButton.hidden = true;
  }
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

function renderAnswerExplanation(question, selectedValue, isCorrect, dissertativeEvaluation = null) {
  if (!explanationBox) return;

  if (isDissertativeQuestion(question)) {
    const evaluation = dissertativeEvaluation || buildDissertativeEvaluation(question, selectedValue);
    explanationBox.innerHTML = `
      🧠 Análise da resposta<br />${escapeHtml(evaluation.analysis)}
      <br /><br />✅ Pontos positivos<br />- ${evaluation.positives.map((item) => escapeHtml(item)).join("<br />- ")}
      <br /><br />📚 O que poderia ser aprofundado<br />- ${evaluation.deepenings.map((item) => escapeHtml(item)).join("<br />- ")}
      <br /><br />🎯 Explicação completa da questão<br />${escapeHtml(evaluation.didacticExplanation)}
      <br /><br />✍ Exemplo de resposta completa<br />${escapeHtml(evaluation.sampleAnswer)}
    `;
    explanationBox.hidden = false;
    return;
  }

  const details = getMultipleChoiceFeedbackDetails(question, selectedValue, isCorrect);
  explanationBox.innerHTML = isCorrect
    ? `🧠 Explicação:<br />${escapeHtml(details.explanation)}`
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
  return false;
}

function refreshStudentGradePreview() {
  gradeLabel.textContent = getGradeDisplayLabel();
}

function renderImportButtonLabel() {
  if (!importCurrentGradeButton) return;
  const aiVersionModeEnabled = isAiVersionModeEnabled();
  const parentDashboardMode = getParentDashboardMode();
  const isStudyGuidedMode = parentDashboardMode === "study-guided";
  const label = aiVersionModeEnabled
    ? (isStudyGuidedMode ? "Gerar Desbloqueio" : "Gerar Teste")
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
    questionBankPreviewButton.classList.toggle("import-preview-button--upload", isStudyGuidedMode);
    questionBankPreviewButton.classList.toggle("import-preview-button--upload-icon-only", isStudyGuidedMode);
    questionBankPreviewButton.innerHTML = isStudyGuidedMode
      ? `
        <span class="import-preview-button__upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M12 16V4"></path>
            <path d="M7.5 8.5 12 4l4.5 4.5"></path>
            <path d="M5 11.5V19h14v-7.5"></path>
          </svg>
        </span>
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
    questionBankPreviewButton.hidden = !isStudyGuidedMode;
  }
  if (questionBankPreviewShell) {
    questionBankPreviewShell.hidden = !isStudyGuidedMode;
    questionBankPreviewShell.classList.remove("is-open");
  }
  if (questionBankPreviewPanel) {
    questionBankPreviewPanel.hidden = true;
  }
  if (studyGuidedCameraButton) {
    studyGuidedCameraButton.hidden = !isStudyGuidedMode;
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

function canUseNativeStudyGuidedCamera() {
  return typeof window.SmartUnlockNative?.openStudyGuidedCamera === "function";
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
  const recognizedProfile = getRecognizedLoginProfile();
  const storedSessionEmail = getStoredActiveSessionEmail();
  const recognizedEmail = getProfileDocId(
    recognizedProfile?.responsibleEmail || storedSessionEmail || getCurrentProfileEmail() || "",
  );
  const hasRecognizedProfile = Boolean(recognizedEmail);
  loginEmailInput.value = hasRecognizedProfile ? recognizedEmail : "";
  loginPasswordInput.value = "";
  loginEmailInput.hidden = hasRecognizedProfile;
  loginEmailInput.disabled = hasRecognizedProfile;
  if (loginRecognizedHint) {
    const recognizedName =
      recognizedProfile?.responsibleName?.trim() ||
      localSetup?.responsibleName?.trim() ||
      "Cadastro reconhecido";
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
  clearActiveRuntimeSession();
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
  clearActiveRuntimeSession();
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
  markActiveRuntimeSession();
  hidePasswordGate();
  clearRetryRestartTimer();
  clearUnlockTimer();
  closeProfileMenu(false);
  setTestModeEnabled(false);
  localStorage.removeItem("smartUnlockUnlockedUntil");
  unlockedState.hidden = true;
  educationGate.hidden = true;
  phoneFrame.classList.add("screen-free");
  responsibleEntryAuthorized = true;
  clearResponsibleEntryForm();
  setActiveView(getSessionReturnView());
  if (!postLoginOnlyMode) {
    renderIdleStudentState();
  }
}

function shouldResumeAuthenticatedSessionAfterBoot() {
  return hasActiveRuntimeSession() && Boolean(getStoredActiveSessionEmail());
}

function resumeAuthenticatedSessionAfterBoot() {
  const storedSessionEmail = getStoredActiveSessionEmail();
  if (!storedSessionEmail) {
    return false;
  }

  responsibleEntryAuthorized = true;
  hideLoginGate();
  continueAfterAccess();

  void (async () => {
    try {
      await ensureAdminDeviceOwnership();
      await refreshManagedAccessProfile();
      subscribeToActiveProfile(storedSessionEmail);
    } catch (_error) {
      // A retomada local nao deve falhar se a sincronizacao posterior falhar.
    }
  })();

  return true;
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

function sanitizeChoiceQuestionText(rawText, rawOptions = []) {
  const originalText = String(rawText || "").trim();
  if (!originalText) return "";

  let sanitizedText = originalText
    .replace(/\s+/g, " ")
    .replace(/\s([A-D])\)\s+/g, "\n$1) ")
    .replace(/\s([A-D])\.\s+/g, "\n$1. ")
    .trim();

  const splitByAlternatives = sanitizedText.split(/\n(?=[A-D][\)\.]\s)/);
  if (splitByAlternatives.length > 1) {
    sanitizedText = splitByAlternatives[0].trim();
  }

  const fallbackSplit = sanitizedText.match(/^(.*?)(?=\s[A-D][\)\.]\s)/);
  if (fallbackSplit?.[1]) {
    sanitizedText = fallbackSplit[1].trim();
  }

  const normalizedOptions = Array.isArray(rawOptions)
    ? rawOptions.map((option) => String(option || "").trim()).filter(Boolean)
    : [];

  normalizedOptions.forEach((option) => {
    if (!option) return;
    const escapedOption = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    sanitizedText = sanitizedText
      .replace(new RegExp(`\\s*[A-D][\\)\\.]\\s*${escapedOption}`, "gi"), "")
      .replace(/\s{2,}/g, " ")
      .trim();
  });

  return sanitizedText.replace(/\s+/g, " ").trim();
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

      parsedQuestion.text = sanitizeChoiceQuestionText(text, options) || text;
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

async function restartRoundFromSummary() {
  retryPending = false;
  answered = false;
  dissertativeRecoveryMode = false;
  selectedAnswer = "";
  selectedTextAnswer = "";
  if (testSummaryExitButton) {
    testSummaryExitButton.hidden = true;
  }

  if (postLoginOnlyMode) {
    manualUnlockButton?.setAttribute("aria-pressed", "true");
    setCycleActive(true);
    setTestModeEnabled(true);
    prototypeCycleStatusMessage = "";
    renderQuestionBankStatus();
    setActiveView("parent");
    await startRound();
    return;
  }

  manualUnlockButton?.setAttribute("aria-pressed", "true");
  setTestModeEnabled(true);
  setActiveView("child");
  await startRound();
  if (window.AndroidBridge?.startTestLock) {
    window.AndroidBridge.startTestLock();
  }
}

async function submitAnswer() {
  if (introMode) {
    renderQuestion();
    return;
  }

  if (retryPending) {
    await restartRoundFromSummary();
    return;
  }

  const question = roundQuestions[currentIndex];

  if (!answered) {
    const isRecoveryAttempt = isDissertativeQuestion(question) && dissertativeRecoveryMode;
    const dissertativeEvaluation = isDissertativeQuestion(question)
      ? buildDissertativeEvaluation(question, selectedTextAnswer)
      : null;
    const isCorrect = isDissertativeQuestion(question)
      ? dissertativeEvaluation.mastered
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
    if (isDissertativeQuestion(question)) {
      feedback.innerHTML = dissertativeEvaluation.feedbackTitle;
      feedback.className = `feedback ${isCorrect ? "success" : "warning"}`;
      supportText.textContent = dissertativeEvaluation.supportText;
      renderAnswerExplanation(question, selectedTextAnswer, isCorrect, dissertativeEvaluation);
    } else {
      feedback.innerHTML = isCorrect
        ? "✅ Muito bem! Você acertou 👏 ⭐ +1 estrelinha"
        : "❌ Quase!<br />Vamos aprender juntos 😊";
      feedback.className = `feedback ${isCorrect ? "success" : "warning"}`;
      supportText.textContent = correctCount ? `⭐ ${correctCount} estrelinha${correctCount > 1 ? "s" : ""} • Você está indo muito bem!` : "Você consegue! Vamos juntos.";
      renderAnswerExplanation(question, selectedAnswer, isCorrect);
    }

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
      dissertativeRecoveryMode = false;
      hardenExplanationBox();
      setExplanationCopyUnlocked(false);
      setDissertativeInputClipboardUnlocked(false);
      answered = true;
      nextButton.textContent = currentIndex === roundQuestions.length - 1 ? "Ver resultado" : "Continuar";
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
  introMode = false;
  answered = true;
  retryPending = true;
  retryQuestionMode = false;
  dissertativeRecoveryMode = false;
  selectedAnswer = "";
  selectedTextAnswer = "";
  answerList.innerHTML = "";
  questionCounter.textContent = `Resultado: ${correctCount}/${roundQuestions.length}`;
  gateTitle.textContent = "Rodada concluída";
  gateSubtitle.textContent = "Veja seu resultado e escolha se quer tentar de novo ou sair.";
  questionText.textContent = "";
  questionText.hidden = true;
  supportText.textContent = "";
  feedback.innerHTML = "";
  feedback.className = "feedback";
  feedback.hidden = true;
  explanationBox.hidden = false;
  explanationBox.innerHTML = `
    <strong>Resultado final</strong><br />
    Acertos: ${correctCount} de ${roundQuestions.length}<br />
    Erros: ${Math.max(0, roundQuestions.length - correctCount)}<br />
    Nota: ${score}/10
  `;
  actionRow.hidden = true;
  nextButton.classList.remove("test-summary-retry-button");
  if (testSummaryExitButton) {
    testSummaryExitButton.hidden = false;
  }
  educationGate.scrollTop = 0;
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

  try {
    if (studyGuidedUploadPreviewDataUrls.length) {
      localStorage.setItem(studyGuidedUploadPreviewStorageKey, JSON.stringify(studyGuidedUploadPreviewDataUrls));
    } else {
      localStorage.removeItem(studyGuidedUploadPreviewStorageKey);
    }
  } catch (error) {
    console.warn("[Study guided] Nao foi possivel persistir a miniatura da imagem:", error);
  }

  renderStudyGuidedUploadPreview();
  setStudyGuidedExplanation(null);
}

function appendStudyGuidedCapturedImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return;

  const remainingSlots = Math.max(0, 3 - studyGuidedUploadPreviewDataUrls.length);
  if (!remainingSlots) {
    openSetupWarningModal("Voce pode carregar no maximo 3 imagens por rodada de estudo.");
    return;
  }

  setStudyGuidedUploadPreview([...studyGuidedUploadPreviewDataUrls, dataUrl].slice(0, 3));
  prototypeImportStatusMessage = "";
  if (questionBankStatus) {
    questionBankStatus.hidden = true;
    questionBankStatus.textContent = "";
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem enviada."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível preparar a imagem enviada."));
    image.src = dataUrl;
  });
}

async function optimizeStudyGuidedImage(file) {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageElement(originalDataUrl);
  const maxDimension = 1280;
  const longestSide = Math.max(image.naturalWidth || image.width || 0, image.naturalHeight || image.height || 0) || 1;
  const scale = Math.min(1, maxDimension / longestSide);
  const width = Math.max(1, Math.round((image.naturalWidth || image.width || 1) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height || 1) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return originalDataUrl;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
  return compressedDataUrl.length < originalDataUrl.length ? compressedDataUrl : originalDataUrl;
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

window.__smartUnlockReceiveStudyGuidedCameraImage = function (dataUrl) {
  appendStudyGuidedCapturedImage(dataUrl);
};

window.__smartUnlockReceiveStudyGuidedCameraError = function (message) {
  openSetupWarningModal(
    typeof message === "string" && message.trim()
      ? message
      : "Nao foi possivel tirar a foto do conteudo agora.",
  );
};

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

function formatStudyGuidedFollowupAnswerHtml(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return "";

  const parts = [];
  let pendingListItems = [];

  const flushList = () => {
    if (!pendingListItems.length) return;
    parts.push(`
      <ul class="study-guided-followup-answer-list">
        ${pendingListItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `);
    pendingListItems = [];
  };

  const formatInline = (value) => escapeHtml(String(value || ""))
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  lines.forEach((line) => {
    const bulletMatch = line.match(/^(?:[-*]\s+|\d+\)\s*|\d+\.\s*)(.+)$/);
    if (bulletMatch) {
      pendingListItems.push(formatInline(bulletMatch[1]));
      return;
    }

    flushList();
    parts.push(`<p>${formatInline(line)}</p>`);
  });

  flushList();
  return parts.join("");
}

function canUseStudyGuidedAudioPlayback() {
  return typeof window !== "undefined" && typeof window.Audio !== "undefined" && typeof window.URL?.createObjectURL === "function";
}

function clearStudyGuidedAudioPreloadedSources() {
  studyGuidedAudioPreloadedSources.forEach((source) => {
    if (Array.isArray(source?.objectUrls)) {
      source.objectUrls.forEach((objectUrl) => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      });
      return;
    }
    if (source?.objectUrl) URL.revokeObjectURL(source.objectUrl);
  });
  studyGuidedAudioPreloadedSources = new Map();
}

function stopStudyGuidedAudioPlayback() {
  closeStudyGuidedAudioWaitModal();

  if (studyGuidedAudioPlayer) {
    studyGuidedAudioPlayer.pause();
    studyGuidedAudioPlayer.src = "";
    studyGuidedAudioPlayer = null;
  }

  if (studyGuidedAudioObjectUrl) {
    URL.revokeObjectURL(studyGuidedAudioObjectUrl);
    studyGuidedAudioObjectUrl = "";
  }

  studyGuidedAudioActiveSection = "";
  studyGuidedAudioPaused = false;
  studyGuidedAudioLoadingSection = "";
  studyGuidedAudioPlaylistIndex = 0;
  setStudyGuidedAudioButtonState();
}

function resetStudyGuidedAudioUsage() {
  stopStudyGuidedAudioPlayback();
}

function setStudyGuidedAudioButtonState() {
  if (!studyGuidedExplanationBody) return;

  studyGuidedExplanationBody.querySelectorAll(".study-guided-audio-shell").forEach((shell) => {
    const section = String(shell.getAttribute("data-speech-shell") || "");
    const button = shell.querySelector(".study-guided-audio-button");
    const controls = shell.querySelector(".study-guided-audio-controls");
    const pauseButton = shell.querySelector('[data-audio-control="pause"]');
    const playButton = shell.querySelector('[data-audio-control="play"]');
    if (!button) return;

    const isLoading = section && section === studyGuidedAudioLoadingSection;
    const isActive = section && section === studyGuidedAudioActiveSection && Boolean(studyGuidedAudioPlayer);
    const label = button.querySelector(".study-guided-audio-button__label");

    button.hidden = Boolean(isActive);
    button.disabled = Boolean(isLoading);
    button.classList.toggle("is-loading", isLoading);
    button.classList.remove("is-played");
    button.setAttribute("aria-pressed", isLoading ? "true" : "false");

    if (controls) {
      controls.hidden = !isActive;
    }

    if (pauseButton) {
      pauseButton.disabled = !isActive || studyGuidedAudioPaused;
      pauseButton.classList.toggle("is-active", isActive && !studyGuidedAudioPaused);
    }

    if (playButton) {
      playButton.disabled = !isActive || !studyGuidedAudioPaused;
      playButton.classList.toggle("is-active", isActive && studyGuidedAudioPaused);
    }

    if (label) {
      label.textContent = isLoading ? "Aguarde..." : "Ouvir";
    }
  });
}

function pauseStudyGuidedAudioPlayback() {
  if (!studyGuidedAudioPlayer || !studyGuidedAudioActiveSection || studyGuidedAudioPaused) return;
  studyGuidedAudioPlayer.pause();
  studyGuidedAudioPaused = true;
  setStudyGuidedAudioButtonState();
}

async function resumeStudyGuidedAudioPlayback() {
  if (!studyGuidedAudioPlayer || !studyGuidedAudioActiveSection || !studyGuidedAudioPaused) return;

  try {
    await studyGuidedAudioPlayer.play();
    studyGuidedAudioPaused = false;
    setStudyGuidedAudioButtonState();
  } catch (error) {
    window.alert(getErrorMessage(error, "Não foi possível retomar o áudio agora."));
  }
}

function seekStudyGuidedAudioPlayback(offsetSeconds) {
  if (!studyGuidedAudioPlayer || !studyGuidedAudioActiveSection || !Number.isFinite(offsetSeconds)) return;

  const duration = Number.isFinite(studyGuidedAudioPlayer.duration)
    ? studyGuidedAudioPlayer.duration
    : Number.POSITIVE_INFINITY;
  const nextTime = Math.min(
    Math.max(0, (Number(studyGuidedAudioPlayer.currentTime) || 0) + offsetSeconds),
    duration,
  );
  studyGuidedAudioPlayer.currentTime = nextTime;
}

function buildStudyGuidedAudioText(section) {
  if (!studyGuidedExplanationState?.explanation) return "";

  const cleanStepForAudio = (rawStep) =>
    String(rawStep || "")
      .replace(/^\s*\d+[\).\-\s:]+/, "")
      .replace(/\s+/g, " ")
      .trim();

  if (section === "intro") {
    return normalizeStudyGuidedAudioText(studyGuidedExplanationState.explanation.intro || "");
  }

  if (section === "steps") {
    const steps = Array.isArray(studyGuidedExplanationState.explanation.steps)
      ? studyGuidedExplanationState.explanation.steps
        .map(normalizeStudyGuidedStep)
        .map(cleanStepForAudio)
        .filter(Boolean)
      : [];
    return limitStudyGuidedAudioText(steps.join(" "), studyGuidedStepsAudioMaxLength);
  }

  if (section === "example") {
    return normalizeStudyGuidedAudioText(studyGuidedExplanationState.explanation.visualExample || "");
  }

  if (section === "full") {
    const intro = normalizeStudyGuidedAudioText(studyGuidedExplanationState.explanation.intro || "");
    const steps = Array.isArray(studyGuidedExplanationState.explanation.steps)
      ? studyGuidedExplanationState.explanation.steps
        .map(normalizeStudyGuidedStep)
        .map(cleanStepForAudio)
        .filter(Boolean)
        .join(" ")
      : "";
    const example = normalizeStudyGuidedAudioText(studyGuidedExplanationState.explanation.visualExample || "");
    return normalizeStudyGuidedAudioText([intro, steps, example].filter(Boolean).join(" "));
  }

  return "";
}

function buildStudyGuidedAudioStreamUrl(section) {
  const text = buildStudyGuidedAudioText(section);
  if (!text) {
    throw new Error("Não há conteúdo disponível para gerar o áudio.");
  }

  const config = getAiApiConfig();
  if (config.providerMode !== "api") {
    throw new Error("O áudio real só fica disponível quando a API estiver ativa.");
  }

  const audioUrl = new URL(getAiGenerateStudyAudioUrl(config), window.location.href);
  audioUrl.searchParams.set("section", section);
  audioUrl.searchParams.set("text", text);
  audioUrl.searchParams.set("t", String(Date.now()));
  return audioUrl.toString();
}

async function requestStudyGuidedAudioBlob(text) {
  const normalizedText = normalizeStudyGuidedAudioText(text);
  if (!normalizedText) {
    throw new Error("Não há conteúdo disponível para gerar o áudio.");
  }

  const config = getAiApiConfig();
  if (config.providerMode !== "api") {
    throw new Error("O áudio real só fica disponível quando a API estiver ativa.");
  }

  const response = await fetch(getAiGenerateStudyAudioUrl(config), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: normalizedText }),
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

  const audioBlob = await response.blob();
  if (!audioBlob.size) {
    throw new Error("A API não devolveu áudio para esse conteúdo.");
  }

  return audioBlob;
}

async function preloadStudyGuidedSectionAudio(section) {
  if (!canUseStudyGuidedAudioPlayback() || !section) return false;

  const text = buildStudyGuidedAudioText(section);
  if (!text) return false;
  const chunks = splitStudyGuidedAudioTextIntoChunks(text);
  if (!chunks.length) return false;

  const cachedSource = studyGuidedAudioPreloadedSources.get(section);
  if (cachedSource?.text === text && Array.isArray(cachedSource?.objectUrls) && cachedSource.objectUrls.length) {
    return true;
  }

  if (Array.isArray(cachedSource?.objectUrls)) {
    cachedSource.objectUrls.forEach((objectUrl) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
    studyGuidedAudioPreloadedSources.delete(section);
  } else if (cachedSource?.objectUrl) {
    URL.revokeObjectURL(cachedSource.objectUrl);
    studyGuidedAudioPreloadedSources.delete(section);
  }

  studyGuidedAudioLoadingSection = section;
  setStudyGuidedAudioButtonState();

  try {
    const audioBlobs = await Promise.all(chunks.map((chunk) => requestStudyGuidedAudioBlob(chunk)));
    const objectUrls = audioBlobs.map((audioBlob) => URL.createObjectURL(audioBlob));
    studyGuidedAudioPreloadedSources.set(section, {
      text,
      chunks,
      objectUrls,
    });
    return true;
  } finally {
    if (studyGuidedAudioLoadingSection === section) {
      studyGuidedAudioLoadingSection = "";
      setStudyGuidedAudioButtonState();
    }
  }
}

async function playStudyGuidedSectionAudio(section) {
  if (!canUseStudyGuidedAudioPlayback()) return;
  if (!section || studyGuidedAudioLoadingSection) return;

  markActiveRuntimeSession();
  stopStudyGuidedAudioPlayback();

  try {
    let audioSourceUrls = [];
    const cachedSource = studyGuidedAudioPreloadedSources.get(section);
    const text = buildStudyGuidedAudioText(section);

    if (Array.isArray(cachedSource?.objectUrls) && cachedSource?.text === text && cachedSource.objectUrls.length) {
      audioSourceUrls = cachedSource.objectUrls.slice();
    } else {
      const loadingStartedAt = Date.now();
      studyGuidedAudioLoadingSection = section;
      setStudyGuidedAudioButtonState();
      openStudyGuidedAudioWaitModal("O áudio já vai começar");

      const chunks = splitStudyGuidedAudioTextIntoChunks(text);
      const audioBlobs = await Promise.all(chunks.map((chunk) => requestStudyGuidedAudioBlob(chunk)));
      const objectUrls = audioBlobs.map((audioBlob) => URL.createObjectURL(audioBlob));
      studyGuidedAudioPreloadedSources.set(section, {
        text,
        chunks,
        objectUrls,
      });
      audioSourceUrls = objectUrls;

      const remaining = 1200 - (Date.now() - loadingStartedAt);
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
    }

    const audio = new Audio();
    audio.preload = "metadata";
    audio.playsInline = true;
    studyGuidedAudioPlaylistIndex = 0;
    audio.src = audioSourceUrls[0] || "";

    studyGuidedAudioPlayer = audio;
    studyGuidedAudioActiveSection = section;
    studyGuidedAudioPaused = false;

    const readyPromise = new Promise((resolve, reject) => {
      audio.addEventListener("canplay", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("Não foi possível carregar o áudio agora.")), { once: true });
    });

    const playingPromise = new Promise((resolve, reject) => {
      audio.addEventListener("playing", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("Não foi possível carregar o áudio agora.")), { once: true });
    });

    audio.onended = async () => {
      const nextIndex = studyGuidedAudioPlaylistIndex + 1;
      if (nextIndex < audioSourceUrls.length) {
        studyGuidedAudioPlaylistIndex = nextIndex;
        audio.src = audioSourceUrls[nextIndex];
        audio.load();
        try {
          await audio.play();
        } catch (_) {
          stopStudyGuidedAudioPlayback();
        }
        return;
      }
      stopStudyGuidedAudioPlayback();
    };
    audio.onerror = () => {
      stopStudyGuidedAudioPlayback();
    };
    audio.onpause = () => {
      if (audio.ended) return;
      studyGuidedAudioPaused = true;
      setStudyGuidedAudioButtonState();
    };
    audio.onplay = () => {
      studyGuidedAudioPaused = false;
      setStudyGuidedAudioButtonState();
    };

    audio.load();
    await Promise.all([readyPromise, audio.play(), playingPromise]);
    closeStudyGuidedAudioWaitModal();
    studyGuidedAudioLoadingSection = "";
    setStudyGuidedAudioButtonState();
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "A geração do áudio demorou demais. Tente novamente."
      : getErrorMessage(error, "Não foi possível reproduzir o áudio agora.");
    window.alert(message);
    stopStudyGuidedAudioPlayback();
  }
}

const studyGuidedTestCountOptions = [
  { value: 5, label: "5 questões" },
  { value: 10, label: "10 questões" },
];

function getStudyGuidedTestCountLabel() {
  const draft = getStudyGuidedTestDraft();
  const selectedOption = studyGuidedTestCountOptions.find((option) => option.value === Number(draft.count || 5));
  return selectedOption?.label || "5 questões";
}

function shouldShowStudyGuidedTestFlow() {
  return Boolean(studyGuidedExplanationState?.explanation);
}

function getStudyGuidedTestPreviewSummary() {
  const selectionState = getStudyGuidedSelectionState();
  const grade = selectionState.grade || getStudyGuidedTestMeta()?.grade || getSelectedGrade();
  const questions = grade ? getStudyGuidedTestQuestionsForGrade(grade) : [];
  const meta = getStudyGuidedTestMeta();

  if (questions.length) {
    const errorLine = meta?.source === "simulated" && meta.errorMessage
      ? `Falha da API: ${meta.errorMessage}`
      : "";
    const questionLines = questions.map((question, index) => {
      const subjectLabel = getSubjectDisplayLabel(question.subject);
      const typeLabel = isDissertativeQuestion(question) ? "Dissertativa" : "Múltipla escolha";
      return `${index + 1}. ${normalizeGradeLabel(question.grade)} ano • ${subjectLabel} • ${typeLabel}\n${truncateAiPreviewText(question.text)}`;
    });
    return [errorLine, ...questionLines].filter(Boolean).join("\n\n");
  }

  return "Nenhuma questão gerada ainda.";
}

function getStudyGuidedEligibleGeneratedQuestions() {
  const selectionState = getStudyGuidedSelectionState();
  if (!selectionState.ok) {
    return {
      ok: false,
      detail: selectionState.message,
      grade: "",
      questions: [],
    };
  }

  const generatedQuestions = getStudyGuidedTestQuestionsForGrade(selectionState.grade);
  if (!generatedQuestions.length) {
    return {
      ok: false,
      detail: "Gere o teste do Desbloqueio antes de clicar em Aplicar Teste.",
      grade: selectionState.grade,
      questions: [],
    };
  }

  const selectedSubject = normalizeSubjectName(selectionState.subjects[0]);
  const eligibleQuestions = generatedQuestions.filter((question) =>
    normalizeSubjectName(question.subject) === selectedSubject,
  );

  if (!eligibleQuestions.length) {
    return {
      ok: false,
      detail: "As questões geradas não correspondem à matéria selecionada neste Desbloqueio.",
      grade: selectionState.grade,
      questions: [],
    };
  }

  return {
    ok: true,
    detail: "",
    grade: selectionState.grade,
    questions: eligibleQuestions,
  };
}

function buildStudyGuidedTestBlockHtml() {
  const draft = getStudyGuidedTestDraft();
  const previewText = getStudyGuidedTestPreviewSummary();
  const hasQuestions = getStudyGuidedEligibleGeneratedQuestions().questions.length > 0;
  const isDisabled = studyGuidedTestGenerating || studyGuidedTestApplying;

  return `
    <div class="study-guided-test-intro">
      <div class="study-guided-test-intro__icon" aria-hidden="true">
        <img src="assets/study-guided-test-icon.png" alt="" loading="lazy" decoding="async">
      </div>
      <h4 class="study-guided-test-intro__title">Vamos aplicar um Teste de Conhecimento</h4>
      <p class="study-guided-test-intro__text">Escolha a quantidade de questões e o tipo de teste e clique em Gerar Teste e depois em Aplicar Teste.</p>
    </div>

    <div class="study-guided-test-config">
      <div class="ai-generation-count-shell study-guided-test-count-shell" data-study-guided-test-count-shell>
        <button
          type="button"
          class="ai-generation-count-trigger study-guided-test-count-trigger"
          data-study-guided-test-count-trigger
          aria-haspopup="listbox"
          aria-expanded="false"
        >
          ${escapeHtml(getStudyGuidedTestCountLabel())}
        </button>
        <div class="ai-generation-count-menu study-guided-test-count-menu" data-study-guided-test-count-menu hidden>
          ${studyGuidedTestCountOptions.map((option) => `
            <button
              type="button"
              class="ai-generation-count-option"
              data-study-guided-test-count-option="${option.value}"
            >
              ${escapeHtml(option.label)}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="study-guided-test-choice-row">
        <div class="study-guided-test-types" aria-label="Tipo de questão do Desbloqueio">
          <label class="ai-generation-checkbox" for="studyGuidedTestTypeChoice">
            <input
              id="studyGuidedTestTypeChoice"
              type="checkbox"
              data-study-guided-test-type="choice"
              ${draft.questionTypes?.choice ? "checked" : ""}
            />
            <span>Múltipla escolha</span>
          </label>
          <label class="ai-generation-checkbox" for="studyGuidedTestTypeText">
            <input
              id="studyGuidedTestTypeText"
              type="checkbox"
              data-study-guided-test-type="text"
              ${draft.questionTypes?.text ? "checked" : ""}
            />
            <span>Dissertativas</span>
          </label>
        </div>

        <div class="study-guided-test-actions import-buttons-container">
          <button
            type="button"
            class="file-button import-button study-guided-test-generate-button${studyGuidedTestGenerating ? " is-updating" : ""}"
            data-study-guided-test-generate
            ${isDisabled ? "disabled" : ""}
          >
            <span class="import-button__label">${studyGuidedTestGenerating ? "Gerando..." : "Gerar Teste"}</span>
          </button>
        </div>
      </div>
    </div>

    ${hasQuestions ? `
      <div class="study-guided-test-apply">
        <button
          type="button"
          class="apply-test-primary-button"
          data-study-guided-test-apply
          ${isDisabled ? "disabled" : ""}
        >
          ${studyGuidedTestApplying ? "Aplicando..." : "Aplicar Teste"}
        </button>
      </div>
    ` : ""}
  `;
}

function refreshStudyGuidedTestUi() {
  if (!studyGuidedExplanationBody) return;

  const testGroup = studyGuidedExplanationBody.querySelector("[data-study-guided-test-group]");
  if (!(testGroup instanceof HTMLElement)) return;

  const shouldShow = shouldShowStudyGuidedTestFlow();
  testGroup.hidden = !shouldShow;
  if (!shouldShow) {
    testGroup.innerHTML = "";
    return;
  }

  syncStudyGuidedTestState();
  testGroup.innerHTML = buildStudyGuidedTestBlockHtml();
}

function ensureStudyGuidedFollowupComposer() {
  if (document.querySelector(".study-guided-followup-composer")) {
    return document.querySelector(".study-guided-followup-composer");
  }

  const composer = document.createElement("div");
  composer.className = "study-guided-followup-composer";
  composer.hidden = true;
  composer.innerHTML = `
    <div class="study-guided-followup-composer__inner">
      <textarea
        class="study-guided-followup-composer__input"
        placeholder="Pergunte mais sobre este conteúdo..."
        rows="1"
      ></textarea>
      <button
        type="button"
        class="study-guided-followup-composer__send"
        aria-label="Enviar pergunta complementar"
        title="Enviar pergunta complementar"
      >
        <img
          class="study-guided-followup-composer__send-logo"
          src="assets/login-logo-symbol-light.png"
          alt=""
        />
      </button>
    </div>
  `;

  const input = composer.querySelector(".study-guided-followup-composer__input");
  const sendButton = composer.querySelector(".study-guided-followup-composer__send");

  input?.addEventListener("input", () => {
    const textarea = input;
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  });

  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void handleStudyGuidedFollowupSubmit();
  });

  sendButton?.addEventListener("click", () => {
    void handleStudyGuidedFollowupSubmit();
  });

  document.body.appendChild(composer);
  return composer;
}

function getStudyGuidedFollowupHistoryHtml() {
  const messages = getStudyGuidedConversationMessages();
  if (!messages.length) return "";

  return messages.map((message) => `
    <article class="study-guided-followup-message study-guided-followup-message--${message.role}">
      <div class="study-guided-followup-message__label">
        ${message.role === "user" ? "Pergunta" : "Resposta complementar"}
      </div>
      <div class="study-guided-followup-message__bubble">
        ${message.role === "assistant"
          ? formatStudyGuidedFollowupAnswerHtml(message.text)
          : formatStudyGuidedParagraphs(message.text)}
      </div>
    </article>
  `).join("");
}

function updateStudyGuidedFollowupComposerVisibility() {
  const composer = ensureStudyGuidedFollowupComposer();
  if (!(composer instanceof HTMLElement)) return;

  const shouldShow = Boolean(
    studyGuidedExplanationState?.explanation
    && !studyGuidedExplanationPanel?.hidden
  );

  composer.hidden = !shouldShow;
  document.body.classList.toggle("study-guided-followup-active", shouldShow);

  if (!shouldShow) {
    composer.classList.remove("is-generating");
  }
}

function refreshStudyGuidedFollowupUi() {
  updateStudyGuidedFollowupComposerVisibility();
  if (!studyGuidedExplanationBody) return;

  const historyGroup = studyGuidedExplanationBody.querySelector("[data-study-guided-followup-group]");
  const historyPanel = studyGuidedExplanationBody.querySelector("[data-study-guided-followup-history]");
  const composer = ensureStudyGuidedFollowupComposer();
  const input = composer?.querySelector(".study-guided-followup-composer__input");
  const sendButton = composer?.querySelector(".study-guided-followup-composer__send");
  const messages = getStudyGuidedConversationMessages();

  if (historyGroup instanceof HTMLElement) {
    historyGroup.hidden = messages.length === 0;
  }
  if (historyPanel instanceof HTMLElement) {
    historyPanel.innerHTML = getStudyGuidedFollowupHistoryHtml();
  }

  if (composer instanceof HTMLElement) {
    composer.classList.toggle("is-generating", studyGuidedFollowupGenerating);
  }
  if (input instanceof HTMLTextAreaElement) {
    input.disabled = studyGuidedFollowupGenerating;
    if (!studyGuidedFollowupGenerating) {
      input.style.height = "auto";
    }
  }
  if (sendButton instanceof HTMLButtonElement) {
    sendButton.disabled = studyGuidedFollowupGenerating;
    sendButton.setAttribute(
      "aria-label",
      studyGuidedFollowupGenerating ? "Enviando pergunta complementar" : "Enviar pergunta complementar"
    );
    sendButton.setAttribute(
      "title",
      studyGuidedFollowupGenerating ? "Enviando pergunta complementar" : "Enviar pergunta complementar"
    );
  }
}

function scrollStudyGuidedConversationToBottom() {
  const historyPanel = studyGuidedExplanationBody?.querySelector("[data-study-guided-followup-history]");
  if (historyPanel instanceof HTMLElement) {
    historyPanel.scrollIntoView({ block: "end", behavior: "smooth" });
  }
  const composer = ensureStudyGuidedFollowupComposer();
  if (composer instanceof HTMLElement) {
    composer.scrollIntoView({ block: "end", behavior: "smooth" });
  }
}

async function handleStudyGuidedFollowupSubmit() {
  const composer = ensureStudyGuidedFollowupComposer();
  const input = composer?.querySelector(".study-guided-followup-composer__input");
  if (!(input instanceof HTMLTextAreaElement) || studyGuidedFollowupGenerating) return;

  const question = String(input.value || "").trim();
  if (!question) return;

  const selectionState = getStudyGuidedSelectionState();
  if (!selectionState.ok) {
    openSetupWarningModal(selectionState.message);
    return;
  }

  const payload = buildStudyGuidedFollowupPayload(question, selectionState);
  if (!payload) {
    openSetupWarningModal("Gere primeiro o conteúdo principal do estudo antes de fazer perguntas complementares.");
    return;
  }

  studyGuidedFollowupGenerating = true;
  appendStudyGuidedConversationMessage("user", question);
  input.value = "";
  refreshStudyGuidedFollowupUi();
  scrollStudyGuidedConversationToBottom();

  try {
    const response = await requestAiStudyGuidedFollowup(payload);
    const answerText = response?.compatible === false
      ? studyGuidedFollowupInvalidMessage
      : String(response?.message || "").trim() || "Não consegui complementar esse ponto agora.";
    appendStudyGuidedConversationMessage("assistant", answerText);
  } catch (error) {
    appendStudyGuidedConversationMessage(
      "assistant",
      error instanceof Error && error.message
        ? error.message
        : "Não foi possível responder essa pergunta complementar agora.",
    );
  } finally {
    studyGuidedFollowupGenerating = false;
    refreshStudyGuidedFollowupUi();
    scrollStudyGuidedConversationToBottom();
  }
}

function closeStudyGuidedTestCountMenu() {
  if (!studyGuidedExplanationBody) return;
  const shell = studyGuidedExplanationBody.querySelector("[data-study-guided-test-count-shell]");
  const trigger = studyGuidedExplanationBody.querySelector("[data-study-guided-test-count-trigger]");
  const menu = studyGuidedExplanationBody.querySelector("[data-study-guided-test-count-menu]");

  if (shell instanceof HTMLElement) {
    shell.classList.remove("is-open");
  }
  if (trigger instanceof HTMLElement) {
    trigger.setAttribute("aria-expanded", "false");
  }
  if (menu instanceof HTMLElement) {
    menu.hidden = true;
  }
}

function updateStudyGuidedTestDraft(partialDraft = {}, options = {}) {
  const currentDraft = getStudyGuidedTestDraft();
  saveStudyGuidedTestDraft({
    ...currentDraft,
    ...partialDraft,
    signature: getStudyGuidedExplanationSignature(studyGuidedExplanationState),
    questionTypes: {
      choice: partialDraft.questionTypes?.choice ?? currentDraft.questionTypes.choice,
      text: partialDraft.questionTypes?.text ?? currentDraft.questionTypes.text,
    },
  });

  if (options.clearGeneratedState) {
    clearStudyGuidedTestGeneratedState({ preservePreviewOpen: false });
  }

  refreshStudyGuidedTestUi();
}

async function handleStudyGuidedGenerateTest() {
  if (studyGuidedTestGenerating) return;

  const selectionState = getStudyGuidedSelectionState();
  if (!selectionState.ok) {
    openSetupWarningModal(selectionState.message);
    return;
  }

  const draft = getStudyGuidedTestDraft();
  if (!draft.questionTypes.choice && !draft.questionTypes.text) {
    openSetupWarningModal("Selecione ao menos um tipo de questão para gerar o teste do Desbloqueio.");
    return;
  }

  const knowledgeBase = buildStudyGuidedTestKnowledgeBase();
  if (!knowledgeBase) {
    openSetupWarningModal("Ainda não há explicação suficiente do Desbloqueio para gerar o teste.");
    return;
  }

  const payload = buildStudyGuidedTestPayload(selectionState);
  if (!payload) {
    openSetupWarningModal("Não foi possível montar o teste do Desbloqueio agora.");
    return;
  }

  studyGuidedTestGenerating = true;
  refreshStudyGuidedTestUi();

  try {
    const parsedResponse = await requestAiGeneratedQuestions(payload);
    replaceStudyGuidedTestQuestionsForGrade(selectionState.grade, parsedResponse.questions);
    saveStudyGuidedTestMeta({
      signature: getStudyGuidedExplanationSignature(studyGuidedExplanationState),
      source: parsedResponse.source,
      generatedAt: parsedResponse.metadata?.generatedAt,
      count: parsedResponse.questions?.length || 0,
      grade: selectionState.grade,
      errorMessage: parsedResponse.errorMessage || "",
    });
    saveStudyGuidedTestDraft({
      ...getStudyGuidedTestDraft(),
      signature: getStudyGuidedExplanationSignature(studyGuidedExplanationState),
      previewOpen: true,
    });
  } catch (error) {
    openSetupWarningModal(error instanceof Error ? error.message : "Não foi possível gerar o teste do Desbloqueio agora.");
  } finally {
    studyGuidedTestGenerating = false;
    refreshStudyGuidedTestUi();
  }
}

function applyStudyGuidedGeneratedTestRound() {
  if (studyGuidedTestApplying) return;

  const eligible = getStudyGuidedEligibleGeneratedQuestions();
  if (!eligible.ok) {
    openSetupWarningModal(eligible.detail);
    return;
  }

  const draft = getStudyGuidedTestDraft();
  const desiredCount = Math.max(1, Number(draft.count || 5));
  if (eligible.questions.length < desiredCount) {
    openSetupWarningModal(`Gere ao menos ${desiredCount} questão(ões) no Desbloqueio antes de aplicar este teste.`);
    return;
  }

  studyGuidedTestApplying = true;
  refreshStudyGuidedTestUi();

  try {
    clearRetryRestartTimer();
    clearUnlockTimer();
    localStorage.removeItem("smartUnlockUnlockedUntil");
    resetLatestTestEvaluationData();
    setCycleActive(true);
    setTestModeEnabled(true);
    showLockedStudentGate();
    prototypeDemoModeActive = false;
    initializeRoundFromQuestions(getRandomQuestionsByYear(eligible.grade, desiredCount, eligible.questions));
    renderQuestion();
  } finally {
    studyGuidedTestApplying = false;
    refreshStudyGuidedTestUi();
  }
}

function renderStudyGuidedExplanation() {
  if (!studyGuidedExplanationPanel || !studyGuidedExplanationBody) return;

  const shouldShow = getParentDashboardMode() === "study-guided" && studyGuidedExplanationState?.explanation;
  studyGuidedExplanationPanel.hidden = !shouldShow;

  if (!shouldShow) {
    stopStudyGuidedAudioPlayback();
    studyGuidedExplanationBody.innerHTML = "";
    updateStudyGuidedFollowupComposerVisibility();
    return;
  }

  stopStudyGuidedAudioPlayback();
  syncStudyGuidedTestState();

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
  const isCompatibilityWarning = studyGuidedExplanationState?.metadata?.isCompatible === false;
  const showStepsAudioButton = !studyGuidedExplanationState.errorMessage && steps.length > 0;
  syncStudyGuidedReflectionState();
  const reflectionText = getStudyGuidedReflectionText();
  const shouldBlurExplanation = isStudyGuidedReflectionBlurLocked();
  const errorMessage = studyGuidedExplanationState.errorMessage
    ? `
      <section class="study-guided-explanation-section study-guided-explanation-section--warning">
        <h4 class="study-guided-explanation-section-title">${isCompatibilityWarning ? "Aviso do estudo" : "Falha da API"}</h4>
        <p>${escapeHtml(studyGuidedExplanationState.errorMessage)}</p>
      </section>
    `
    : "";

  studyGuidedExplanationBody.innerHTML = `
    <div class="study-guided-explanation-content${shouldBlurExplanation ? " is-blurred" : ""}">
      <div class="study-guided-explanation-group">
        <div class="study-guided-explanation-actions">
          <h4 class="study-guided-explanation-section-title">Conteúdo</h4>
        </div>
        <section class="study-guided-explanation-section">
          ${introHtml}
        </section>
      </div>
      <div class="study-guided-explanation-group">
        <div class="study-guided-explanation-actions">
          <h4 class="study-guided-explanation-section-title">Explicação passo a passo</h4>
          ${showStepsAudioButton ? `
          <div class="study-guided-audio-shell" data-speech-shell="steps">
            <button type="button" class="study-guided-audio-button" data-speech-section="steps" aria-pressed="false">
              <span class="study-guided-audio-button__spinner" aria-hidden="true"></span>
              <span class="study-guided-audio-button__label">Ouvir</span>
              <span class="study-guided-audio-button__icon" aria-hidden="true"></span>
            </button>
            <div class="study-guided-audio-controls" hidden>
              <button type="button" class="study-guided-audio-control-button" data-audio-control="backward" aria-label="Voltar áudio">
                <span class="study-guided-audio-control-button__skip study-guided-audio-control-button__skip--backward" aria-hidden="true"></span>
              </button>
              <button type="button" class="study-guided-audio-control-button" data-audio-control="pause" aria-label="Pausar áudio">
                <span class="study-guided-audio-control-button__pause" aria-hidden="true"></span>
              </button>
              <button type="button" class="study-guided-audio-control-button" data-audio-control="play" aria-label="Continuar áudio">
                <span class="study-guided-audio-control-button__play" aria-hidden="true"></span>
              </button>
            </div>
          </div>
          ` : ""}
        </div>
        <section class="study-guided-explanation-section">
          <ol class="study-guided-explanation-steps">
            ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </section>
      </div>
    </div>
    <div class="study-guided-explanation-group study-guided-followup-group" data-study-guided-followup-group hidden>
      <div class="study-guided-explanation-actions">
        <h4 class="study-guided-explanation-section-title">Perguntas complementares</h4>
      </div>
      <section class="study-guided-explanation-section">
        <div class="study-guided-followup-history" data-study-guided-followup-history></div>
      </section>
    </div>
    <div class="study-guided-explanation-group study-guided-test-group" data-study-guided-test-group hidden></div>
    ${errorMessage}
  `;

  setStudyGuidedAudioButtonState();
  bindStudyGuidedReflectionEvaluateButton();
  refreshStudyGuidedReflectionUi();
  refreshStudyGuidedTestUi();
  refreshStudyGuidedFollowupUi();
  scheduleStudyGuidedStagnationPrompt();
}

studyGuidedExplanationBody?.addEventListener("click", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;

  const controlButton = target.closest(".study-guided-audio-control-button");
  if (controlButton instanceof HTMLElement) {
    const control = String(controlButton.dataset.audioControl || "");
    if (control === "backward") {
      seekStudyGuidedAudioPlayback(-5);
      return;
    }
    if (control === "pause") {
      pauseStudyGuidedAudioPlayback();
      return;
    }
    if (control === "play") {
      resumeStudyGuidedAudioPlayback();
      return;
    }
    if (control === "forward") {
      seekStudyGuidedAudioPlayback(5);
      return;
    }
  }

  const button = target.closest(".study-guided-audio-button");
  if (!(button instanceof HTMLElement)) return;
  playStudyGuidedSectionAudio(String(button.dataset.speechSection || ""));
});

studyGuidedExplanationBody?.addEventListener("input", (event) => {
  const textarea = event.target instanceof HTMLTextAreaElement
    ? event.target.closest(".study-guided-reflection-textarea")
    : null;
  if (!textarea) return;
  setStudyGuidedReflectionText(textarea.value);
  const immediatePayload = buildStudyGuidedWritingEvaluationRequest("progress");
  if (immediatePayload) {
    updateStudyGuidedReflectionProgress(buildStudyGuidedLocalProgressEvaluation(immediatePayload.request));
  } else {
    updateStudyGuidedReflectionBlurState();
  }
  refreshStudyGuidedReflectionUi();
  scheduleStudyGuidedStagnationPrompt();
  queueStudyGuidedReflectionProgressAnalysis();
});

studyGuidedExplanationBody?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement
    ? event.target.closest("[data-study-guided-evaluate]")
    : null;
  if (!button) return;
  void handleStudyGuidedFinalEvaluation();
});

studyGuidedExplanationBody?.addEventListener("click", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;

  const countOption = target.closest("[data-study-guided-test-count-option]");
  if (countOption instanceof HTMLElement) {
    const nextCount = Math.max(1, Number(countOption.dataset.studyGuidedTestCountOption || 5));
    updateStudyGuidedTestDraft(
      {
        count: nextCount,
        previewOpen: false,
      },
      { clearGeneratedState: true },
    );
    closeStudyGuidedTestCountMenu();
    return;
  }

  const countTrigger = target.closest("[data-study-guided-test-count-trigger]");
  if (countTrigger instanceof HTMLElement) {
    const shell = countTrigger.closest("[data-study-guided-test-count-shell]");
    const menu = shell?.querySelector("[data-study-guided-test-count-menu]");
    const isOpen = countTrigger.getAttribute("aria-expanded") === "true";
    countTrigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    shell?.classList.toggle("is-open", !isOpen);
    if (menu instanceof HTMLElement) {
      menu.hidden = isOpen;
    }
    return;
  }

  const previewToggle = target.closest("[data-study-guided-test-preview-toggle]");
  if (previewToggle instanceof HTMLElement) {
    return;
  }

  const generateButton = target.closest("[data-study-guided-test-generate]");
  if (generateButton instanceof HTMLElement) {
    void handleStudyGuidedGenerateTest();
    return;
  }

  const applyButton = target.closest("[data-study-guided-test-apply]");
  if (applyButton instanceof HTMLElement) {
    applyStudyGuidedGeneratedTestRound();
  }
});

studyGuidedExplanationBody?.addEventListener("change", (event) => {
  const input = event.target instanceof HTMLInputElement
    ? event.target.closest("[data-study-guided-test-type]")
    : null;
  if (!(input instanceof HTMLInputElement)) return;

  const currentDraft = getStudyGuidedTestDraft();
  const nextTypes = {
    choice: input.dataset.studyGuidedTestType === "choice" ? input.checked : currentDraft.questionTypes.choice,
    text: input.dataset.studyGuidedTestType === "text" ? input.checked : currentDraft.questionTypes.text,
  };

  updateStudyGuidedTestDraft(
    {
      questionTypes: nextTypes,
      previewOpen: false,
    },
    { clearGeneratedState: true },
  );
});

studyGuidedExplanationBody?.addEventListener("mouseover", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;

  const previewToggle = target.closest("[data-study-guided-test-preview-toggle]");
  const previewPanel = target.closest("[data-study-guided-test-preview-panel]");
  if (!previewToggle && !previewPanel) return;

  const fromElement = event.relatedTarget instanceof Node ? event.relatedTarget : null;
  if (fromElement && ((previewToggle instanceof HTMLElement && previewToggle.contains(fromElement))
    || (previewPanel instanceof HTMLElement && previewPanel.contains(fromElement)))) {
    return;
  }

  updateStudyGuidedTestDraft({ previewOpen: true });
});

studyGuidedExplanationBody?.addEventListener("mouseout", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;

  const previewToggle = target.closest("[data-study-guided-test-preview-toggle]");
  const previewPanel = target.closest("[data-study-guided-test-preview-panel]");
  if (!previewToggle && !previewPanel) return;

  const toElement = event.relatedTarget instanceof Node ? event.relatedTarget : null;
  if (toElement && ((previewToggle instanceof HTMLElement && previewToggle.contains(toElement))
    || (previewPanel instanceof HTMLElement && previewPanel.contains(toElement)))) {
    return;
  }

  updateStudyGuidedTestDraft({ previewOpen: false });
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target?.closest("[data-study-guided-test-count-shell]")) {
    closeStudyGuidedTestCountMenu();
  }
});

function setStudyGuidedExplanation(data) {
  resetStudyGuidedAudioUsage();
  clearStudyGuidedAudioPreloadedSources();
  clearStudyGuidedReflectionTimers();

  if (!data) {
    studyGuidedExplanationState = null;
    studyGuidedReflectionState = createEmptyStudyGuidedReflectionState();
    studyGuidedConversationState = createEmptyStudyGuidedConversationState();
    localStorage.removeItem(studyGuidedExplanationStorageKey);
    localStorage.removeItem(studyGuidedReflectionStorageKey);
    localStorage.removeItem(studyGuidedConversationStorageKey);
    saveStudyGuidedTestDraft(createDefaultStudyGuidedTestDraft());
    clearStudyGuidedTestQuestionBank();
    localStorage.removeItem(studyGuidedTestMetaStorageKey);
    renderStudyGuidedExplanation();
    return;
  }

  studyGuidedExplanationState = parseStudyGuidedExplanationStorage(JSON.stringify(data));
  if (!studyGuidedExplanationState) {
    studyGuidedReflectionState = createEmptyStudyGuidedReflectionState();
    studyGuidedConversationState = createEmptyStudyGuidedConversationState();
    localStorage.removeItem(studyGuidedExplanationStorageKey);
    localStorage.removeItem(studyGuidedReflectionStorageKey);
    localStorage.removeItem(studyGuidedConversationStorageKey);
    saveStudyGuidedTestDraft(createDefaultStudyGuidedTestDraft());
    clearStudyGuidedTestQuestionBank();
    localStorage.removeItem(studyGuidedTestMetaStorageKey);
    renderStudyGuidedExplanation();
    return;
  }

  syncStudyGuidedReflectionState();
  syncStudyGuidedTestState();
  syncStudyGuidedConversationState();
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
    aiDashboardKnowledge.placeholder = studyGuidedKnowledgePlaceholder;
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
  storeLastActiveView(view);

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
  storeRecognizedLoginProfile({
    responsibleName,
    responsibleEmail,
  });
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

if (studyGuidedReplayCancelButton) {
  studyGuidedReplayCancelButton.addEventListener("click", () => {
    settleStudyGuidedReplayModal(false);
  });
}

if (studyGuidedReplayConfirmButton) {
  studyGuidedReplayConfirmButton.addEventListener("click", () => {
    settleStudyGuidedReplayModal(true);
  });
}

if (studyGuidedReplayOverlay) {
  studyGuidedReplayOverlay.addEventListener("click", () => {
    settleStudyGuidedReplayModal(false);
  });
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

if (testSummaryExitButton) {
  testSummaryExitButton.addEventListener("click", forceResponsibleLogoutFromTest);
}

if (testLogoutCancelButton) {
  testLogoutCancelButton.addEventListener("click", closeTestLogoutModal);
}

if (testLogoutOverlay) {
  testLogoutOverlay.addEventListener("click", closeTestLogoutModal);
}

if (testLogoutConfirmButton) {
  testLogoutConfirmButton.addEventListener("click", () => {
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
    return;
  }
  if (fileImportPickerActive) {
    return;
  }
  clearAppClosingTransition();
  if (shouldShowTestStatusView()) {
    setActiveView("test-status");
    updateUnlockCountdown();
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
  }
});

if (testStatusStopButton) {
  testStatusStopButton.addEventListener("click", openTestLogoutModal);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    return;
  }
  if (fileImportPickerActive) {
    return;
  }
});

window.addEventListener("focus", () => {
  if (fileImportPickerActive) {
    return;
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

      const contentValidation = validateStudyGuidedContentForSelectedSubject(selectionState);
      if (!contentValidation.ok) {
        openSetupWarningModal(contentValidation.message);
        return;
      }

      const generationPayload = buildStudyGuidedPayload(selectionState);
      const persistedStudyGuidedKnowledge = aiDashboardKnowledge?.value || getStudyGuidedKnowledge();
      importCurrentGradeButton.disabled = true;
      importCurrentGradeButton.classList.add("is-updating");
      importCurrentGradeButton.textContent = "Gerando...";

      try {
        const generatedExplanation = await requestAiStudyGuidedExplanation(generationPayload);
        if (persistedStudyGuidedKnowledge.trim()) {
          setStudyGuidedKnowledge(persistedStudyGuidedKnowledge);
          if (aiDashboardKnowledge) aiDashboardKnowledge.value = persistedStudyGuidedKnowledge;
        }
        setStudyGuidedExplanation(generatedExplanation);
        try {
          await preloadStudyGuidedSectionAudio("steps");
        } catch (audioError) {
          console.error("[Study guided audio preload] Falha ao pré-carregar o áudio:", audioError);
        }
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
        const imageDataUrls = await Promise.all(selectedImages.map((file) => optimizeStudyGuidedImage(file)));
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

if (studyGuidedCameraButton) {
  studyGuidedCameraButton.addEventListener("click", () => {
    if (getParentDashboardMode() !== "study-guided") return;

    if (studyGuidedUploadPreviewDataUrls.length >= 3) {
      openSetupWarningModal("Voce pode carregar no maximo 3 imagens por rodada de estudo.");
      return;
    }

    if (canUseNativeStudyGuidedCamera()) {
      window.SmartUnlockNative.openStudyGuidedCamera();
      return;
    }

    openSetupWarningModal("Tirar foto direto funciona no aplicativo Android. Aqui no preview, use Fazer upload.");
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
    }
  });

  if (supportsHoverPreview) {
    questionBankPreviewButton.addEventListener("focus", () => {
      if (getParentDashboardMode() === "study-guided") return;
      setQuestionBankPreviewOpen(true);
    });

    questionBankPreviewButton.addEventListener("blur", () => {
      if (getParentDashboardMode() === "study-guided") return;
      setQuestionBankPreviewOpen(false);
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
    appBootCompleted = true;
    if (hasOngoingProtectedCycle()) {
      resumeProtectedCycleAfterBoot();
      return;
    }
    if (shouldResumeAuthenticatedSessionAfterBoot()) {
      resumeAuthenticatedSessionAfterBoot();
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
    appBootCompleted = true;
    if (hasOngoingProtectedCycle()) {
      resumeProtectedCycleAfterBoot();
      return;
    }
    if (shouldResumeAuthenticatedSessionAfterBoot()) {
      resumeAuthenticatedSessionAfterBoot();
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
  if (appBootCompleted) {
    return;
  }

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
