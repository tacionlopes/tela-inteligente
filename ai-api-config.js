(() => {
  const productionBaseUrl = "https://desbloqueio-inteligente-app.vercel.app";
  const protocol = window.location?.protocol || "";
  const shouldUseProductionApi = protocol === "file:";

  window.DESBLOQUEIO_INTELIGENTE_AI_CONFIG = {
    providerMode: "api",
    baseUrl: shouldUseProductionApi ? productionBaseUrl : "",
    generateQuestionsPath: "/api/ai/generate-questions",
    generateStudyPath: "/api/ai/generate-study-explanation",
    generateStudyFollowupPath: "/api/ai/generate-study-followup",
    generateStudyAudioPath: "/api/ai/generate-study-audio",
    evaluateStudyWritingPath: "/api/ai/evaluate-study-writing",
    timeoutMs: 45000,
  };
})();
