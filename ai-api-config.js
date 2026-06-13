(() => {
  const productionBaseUrl = "https://desbloqueio-inteligente-app.vercel.app";
  const hostname = window.location?.hostname || "";
  const protocol = window.location?.protocol || "";
  const shouldUseProductionApi = protocol === "file:";

  window.DESBLOQUEIO_INTELIGENTE_AI_CONFIG = {
    providerMode: "api",
    baseUrl: shouldUseProductionApi ? productionBaseUrl : "",
    generateQuestionsPath: "/api/ai/generate-questions",
    generateStudyPath: "/api/ai/generate-study-explanation",
    generateStudyAudioPath: "/api/ai/generate-study-audio",
    timeoutMs: 18000,
  };
})();
