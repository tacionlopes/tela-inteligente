(() => {
  const productionBaseUrl = "https://desbloqueio-inteligente-app.vercel.app";
  const hostname = window.location?.hostname || "";
  const protocol = window.location?.protocol || "";
  const shouldUseProductionApi =
    protocol === "file:" || hostname === "127.0.0.1" || hostname === "localhost";

  window.DESBLOQUEIO_INTELIGENTE_AI_CONFIG = {
    providerMode: "api",
    baseUrl: shouldUseProductionApi ? productionBaseUrl : "",
    generateQuestionsPath: "/api/ai/generate-questions",
    generateStudyPath: "/api/ai/generate-study-explanation",
    timeoutMs: 120000,
  };
})();
