const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const DEFAULT_MAX_OUTPUT_TOKENS = Math.max(1200, Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 2000));

const AI_STUDY_EXPLANATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "explanation"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["grade", "subjects", "generatedAt", "usedKnowledgeBase", "usedImages", "isCompatible", "incompatibilityMessage"],
      properties: {
        grade: { type: "string" },
        subjects: {
          type: "array",
          items: { type: "string" },
        },
        generatedAt: { type: "string" },
        usedKnowledgeBase: { type: "boolean" },
        usedImages: { type: "number" },
        isCompatible: { type: "boolean" },
        incompatibilityMessage: { type: "string" },
      },
    },
    explanation: {
      type: "object",
      additionalProperties: false,
      required: ["intro", "steps", "visualExample"],
      properties: {
        intro: { type: "string" },
        steps: {
          type: "array",
          items: { type: "string" },
        },
        visualExample: { type: "string" },
      },
    },
  },
};

const STUDY_GUIDED_INCOMPATIBILITY_MESSAGE = "A matéria escolhida e o conteúdo enviado não correspondem. No Estudo Guiado, escolha uma única matéria por vez e envie um conteúdo alinhado a ela.";

const STUDY_GUIDED_SUBJECT_KEYWORD_HINTS = {
  "Português": ["substantivo", "verbo", "adjetivo", "oração", "crase", "pontuação", "concordância", "acentuação", "interpretação", "texto"],
  "História": ["guerra", "império", "colônia", "revolução", "independência", "idade média", "presidente", "ditadura", "povo antigo", "civilização"],
  "Geografia": ["mapa", "território", "clima", "relevo", "vegetação", "hidrografia", "continente", "população", "urbanização", "paisagem"],
  "Biologia": ["coração", "célula", "corpo humano", "sistema digestório", "respiração", "órgão", "ser vivo", "genética", "ecossistema", "fotossíntese"],
  "Química": ["átomo", "átomos", "molécula", "moléculas", "elemento químico", "tabela periódica", "reação química", "mistura", "substância", "ligação química"],
  "Física": ["força", "movimento", "energia", "velocidade", "gravidade", "massa", "aceleração", "eletricidade", "circuito", "ondas"],
  "Inglês": ["verb to be", "simple present", "simple past", "present continuous", "english", "inglês", "vocabulary", "reading", "listening"],
  "Artes": ["pintura", "escultura", "teatro", "música", "dança", "obra de arte", "artista", "cores", "desenho", "cinema"],
};

function normalizePlainText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getStudyGuidedDisplaySubject(subject) {
  const normalized = normalizePlainText(subject);

  if (normalized === normalizePlainText("Ciências")) return "Biologia";
  if (normalized === normalizePlainText("Matemática")) return "Química";
  if (normalized === normalizePlainText("Lógica")) return "Física";
  if (normalized === normalizePlainText("Historia da Arte")) return "Artes";

  return String(subject || "").trim();
}

function detectStudyGuidedLikelySubjectFromText(rawText) {
  const text = normalizePlainText(rawText);
  if (!text) return "";

  let bestSubject = "";
  let bestScore = 0;

  Object.entries(STUDY_GUIDED_SUBJECT_KEYWORD_HINTS).forEach(([subjectLabel, keywords]) => {
    const score = keywords.reduce((total, keyword) => (
      total + (text.includes(normalizePlainText(keyword)) ? 1 : 0)
    ), 0);

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

function buildIncompatibleStudyGuidedResponse(request, message = STUDY_GUIDED_INCOMPATIBILITY_MESSAGE) {
  return {
    metadata: {
      grade: String(request?.grade || "").trim(),
      subjects: Array.isArray(request?.subjects) ? request.subjects.map((subject) => String(subject || "").trim()).filter(Boolean) : [],
      generatedAt: new Date().toISOString(),
      usedKnowledgeBase: Boolean(String(request?.knowledgeBase || "").trim()),
      usedImages: Array.isArray(request?.uploadedImages) ? request.uploadedImages.filter(Boolean).length : 0,
      isCompatible: false,
      incompatibilityMessage: message,
    },
    explanation: {
      intro: "",
      steps: [],
      visualExample: "",
    },
  };
}

function validateStudyGuidedSubjectCompatibility(request) {
  const selectedSubjects = Array.isArray(request?.subjects) ? request.subjects : [];
  if (selectedSubjects.length !== 1) {
    return {
      ok: false,
      response: buildIncompatibleStudyGuidedResponse(
        request,
        "No Estudo Guiado, escolha apenas uma matéria por vez antes de gerar a explicação."
      ),
    };
  }

  const knowledgeText = String(request?.knowledgeBase || "").trim();
  const hasUploadedImages = Array.isArray(request?.uploadedImages) && request.uploadedImages.some(Boolean);
  if (!knowledgeText) {
    return { ok: true, response: null };
  }

  const selectedSubjectLabel = getStudyGuidedDisplaySubject(selectedSubjects[0]);
  const detectedSubject = detectStudyGuidedLikelySubjectFromText(knowledgeText);

  if (detectedSubject && detectedSubject !== selectedSubjectLabel) {
    return {
      ok: false,
      response: buildIncompatibleStudyGuidedResponse(request),
    };
  }

  if (!detectedSubject && !hasUploadedImages && isStudyGuidedTextTooVague(knowledgeText)) {
    return {
      ok: false,
      response: buildIncompatibleStudyGuidedResponse(
        request,
        "O conteúdo enviado é inválido para a matéria escolhida. Escreva um tema real da matéria para gerar o estudo."
      ),
    };
  }

  return { ok: true, response: null };
}

function sendJson(response, statusCode, payload) {
  if (typeof response.status === "function") {
    if (typeof response.setHeader === "function") {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    return response.status(statusCode).json(payload);
  }

  response.statusCode = statusCode;
  if (typeof response.setHeader === "function") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  response.end(JSON.stringify(payload));
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function safeJsonParse(rawText) {
  if (!rawText) {
    throw new Error("A OpenAI não devolveu conteúdo estruturado para a explicação.");
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const jsonMatch = String(rawText).match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (_) {
        // continua para o erro final mais claro
      }
    }

    throw new Error("A resposta da IA veio em formato inválido. Tente novamente com um conteúdo mais específico ou mais curto.");
  }
}

async function collectJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  return rawBody ? JSON.parse(rawBody) : {};
}

function validateStudyRequest(request) {
  if (!request || typeof request !== "object") {
    return "O corpo da requisição precisa incluir um objeto request.";
  }

  if (!String(request.grade || "").trim()) {
    return "O campo grade é obrigatório.";
  }

  if (!Array.isArray(request.subjects) || !request.subjects.length) {
    return "Selecione ao menos uma matéria para gerar o estudo.";
  }

  const hasKnowledgeBase = Boolean(String(request.knowledgeBase || "").trim());
  const hasUploadedImages = Array.isArray(request.uploadedImages) && request.uploadedImages.some(Boolean);

  if (!hasKnowledgeBase && !hasUploadedImages) {
    return "Envie um conteúdo digitado ou ao menos uma imagem para gerar o estudo.";
  }

  return "";
}

async function callOpenAiGenerateStudyExplanation({ request, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("A variável OPENAI_API_KEY ainda não foi configurada.");
  }

  const inputContent = [
    {
      type: "input_text",
      text: String(prompt?.user || ""),
    },
    ...((Array.isArray(request.uploadedImages) ? request.uploadedImages : [])
      .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
      .slice(0, 3)
      .map((imageUrl) => ({
        type: "input_image",
        image_url: imageUrl,
      }))),
  ];

  const openAiResponse = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      instructions: String(prompt?.system || ""),
      input: [
        {
          role: "user",
          content: inputContent,
        },
      ],
      max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "study_guided_explanation_response",
          strict: true,
          schema: AI_STUDY_EXPLANATION_SCHEMA,
        },
      },
    }),
  });

  const rawOpenAiPayload = await openAiResponse.json();

  if (!openAiResponse.ok) {
    const apiErrorMessage = rawOpenAiPayload?.error?.message || `OpenAI respondeu com status ${openAiResponse.status}.`;
    throw new Error(apiErrorMessage);
  }

  const outputText = rawOpenAiPayload?.output_text
    || rawOpenAiPayload?.output?.[0]?.content?.find?.((item) => item?.type === "output_text")?.text
    || "";

  if (!outputText) {
    throw new Error("A OpenAI não devolveu conteúdo estruturado para a explicação.");
  }

  const parsedContent = safeJsonParse(outputText);
  if (parsedContent?.metadata && !parsedContent.metadata.generatedAt) {
    parsedContent.metadata.generatedAt = new Date().toISOString();
  }

  if (parsedContent?.metadata && typeof parsedContent.metadata.isCompatible !== "boolean") {
    parsedContent.metadata.isCompatible = true;
  }

  if (parsedContent?.metadata && typeof parsedContent.metadata.incompatibilityMessage !== "string") {
    parsedContent.metadata.incompatibilityMessage = "";
  }

  return parsedContent;
}

async function handler(request, response) {
  if (request.method === "OPTIONS") {
    if (typeof response.setHeader === "function") {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, {
      error: "method_not_allowed",
      message: "Use POST para gerar a explicação do Estudo Guiado com IA.",
    });
  }

  let body;
  try {
    body = await collectJsonBody(request);
  } catch (error) {
    return sendJson(response, 400, {
      error: "invalid_json",
      message: getErrorMessage(error, "Não foi possível ler o JSON enviado."),
    });
  }

  const studyRequest = body?.request;
  const validationMessage = validateStudyRequest(studyRequest);
  if (validationMessage) {
    return sendJson(response, 400, {
      error: "invalid_request",
      message: validationMessage,
    });
  }

  const compatibilityValidation = validateStudyGuidedSubjectCompatibility(studyRequest);
  if (!compatibilityValidation.ok) {
    return sendJson(response, 200, compatibilityValidation.response);
  }

  const prompt = body?.prompt || {};

  try {
    const generatedExplanation = await callOpenAiGenerateStudyExplanation({
      request: studyRequest,
      prompt,
    });

    return sendJson(response, 200, generatedExplanation);
  } catch (error) {
    console.error("[AI generate study explanation] Falha na geracao:", error);
    return sendJson(response, 502, {
      error: "generation_failed",
      message: getErrorMessage(error, "A geração da explicação falhou."),
    });
  }
}

module.exports = handler;
