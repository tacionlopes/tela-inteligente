const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const DEFAULT_MAX_OUTPUT_TOKENS = Math.max(900, Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1400));

const STUDY_GUIDED_FOLLOWUP_INVALID_MESSAGE = "Este conteúdo não corresponde à matéria escolhida nem ao conteúdo atualmente em estudo. Faça uma pergunta relacionada ao tema atual.";

const STUDY_GUIDED_SUBJECT_KEYWORD_HINTS = {
  "Português": ["substantivo", "verbo", "adjetivo", "oração", "crase", "pontuação", "concordância", "acentuação", "interpretação", "texto"],
  "História": ["guerra", "império", "colônia", "revolução", "independência", "idade média", "presidente", "ditadura", "civilização", "tratado"],
  "Geografia": ["mapa", "território", "clima", "relevo", "vegetação", "hidrografia", "continente", "população", "urbanização", "paisagem"],
  "Biologia": ["coração", "célula", "corpo humano", "sistema digestório", "respiração", "órgão", "ser vivo", "genética", "ecossistema", "fotossíntese"],
  "Química": ["átomo", "átomos", "molécula", "moléculas", "elemento químico", "tabela periódica", "reação química", "mistura", "substância", "ligação química"],
  "Física": ["força", "movimento", "energia", "velocidade", "gravidade", "massa", "aceleração", "eletricidade", "circuito", "ondas"],
  "Inglês": ["verb to be", "simple present", "simple past", "present continuous", "english", "inglês", "vocabulary", "reading", "listening"],
  "Artes": ["pintura", "escultura", "teatro", "música", "dança", "obra de arte", "artista", "cores", "desenho", "cinema"],
};

const AI_STUDY_FOLLOWUP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "answer"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["grade", "subjects", "generatedAt", "isCompatible", "incompatibilityMessage"],
      properties: {
        grade: { type: "string" },
        subjects: {
          type: "array",
          items: { type: "string" },
        },
        generatedAt: { type: "string" },
        isCompatible: { type: "boolean" },
        incompatibilityMessage: { type: "string" },
      },
    },
    answer: { type: "string" },
  },
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

function buildInvalidResponse(request, message = STUDY_GUIDED_FOLLOWUP_INVALID_MESSAGE) {
  return {
    metadata: {
      grade: String(request?.grade || "").trim(),
      subjects: Array.isArray(request?.subjects) ? request.subjects.map((subject) => String(subject || "").trim()).filter(Boolean) : [],
      generatedAt: new Date().toISOString(),
      isCompatible: false,
      incompatibilityMessage: message,
    },
    answer: message,
  };
}

function validateStudyFollowupRequest(request) {
  if (!request || typeof request !== "object") {
    return "O corpo da requisição precisa incluir um objeto request.";
  }

  if (!String(request.grade || "").trim()) {
    return "O campo grade é obrigatório.";
  }

  if (!Array.isArray(request.subjects) || request.subjects.length !== 1) {
    return "Selecione uma única matéria antes de fazer uma pergunta complementar.";
  }

  if (!String(request.question || "").trim()) {
    return "Escreva uma pergunta complementar antes de enviar.";
  }

  if (!String(request.knowledgeBase || "").trim() && !String(request.explanation?.intro || "").trim()) {
    return "Gere primeiro o conteúdo principal do estudo antes de fazer perguntas complementares.";
  }

  return "";
}

function validateStudyFollowupCompatibility(request) {
  const selectedSubjectLabel = getStudyGuidedDisplaySubject(request.subjects[0]);
  const combinedReference = [
    String(request.knowledgeBase || "").trim(),
    String(request.explanation?.intro || "").trim(),
    ...(Array.isArray(request.explanation?.steps) ? request.explanation.steps : []),
  ].filter(Boolean).join(" ");
  const question = String(request.question || "").trim();

  const detectedQuestionSubject = detectStudyGuidedLikelySubjectFromText(question);
  const detectedReferenceSubject = detectStudyGuidedLikelySubjectFromText(combinedReference);

  if (detectedQuestionSubject && detectedQuestionSubject !== selectedSubjectLabel) {
    return { ok: false, response: buildInvalidResponse(request) };
  }

  if (detectedReferenceSubject && detectedReferenceSubject !== selectedSubjectLabel) {
    return { ok: false, response: buildInvalidResponse(request) };
  }

  return { ok: true, response: null };
}

function safeJsonParse(rawText) {
  if (!rawText) {
    throw new Error("A OpenAI não devolveu conteúdo estruturado para a pergunta complementar.");
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const jsonMatch = String(rawText).match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("A resposta complementar da IA veio em formato inválido.");
  }
}

function buildSystemPrompt(request) {
  const subjectLabel = getStudyGuidedDisplaySubject(request.subjects[0]);
  return [
    "Você é um professor que continua uma conversa de estudo guiado.",
    "Responda sempre em português do Brasil.",
    "Considere o contexto já estudado antes de responder.",
    "Valide se a nova pergunta está relacionada à matéria selecionada e ao conteúdo atualmente em estudo.",
    `Matéria selecionada: ${subjectLabel}.`,
    `Ano/Nível selecionado: ${String(request.grade || "").trim()}.`,
    `Se a pergunta NÃO estiver relacionada, responda exatamente com: ${STUDY_GUIDED_FOLLOWUP_INVALID_MESSAGE}`,
    "Se estiver relacionada, responda como continuação da conversa, com linguagem simples, clara e útil.",
    "Você pode aprofundar conceitos, dar exemplos e tirar dúvidas, mas sem trocar de matéria.",
    "A resposta deve ser complementar ao conteúdo já mostrado na tela, e não um novo estudo completo.",
  ].join("\n");
}

function buildUserPrompt(request) {
  const historyText = (Array.isArray(request.history) ? request.history : [])
    .map((item) => `${item?.role === "user" ? "Aluno" : "Professor"}: ${String(item?.text || "").trim()}`)
    .filter(Boolean)
    .join("\n");

  return [
    `Matéria: ${getStudyGuidedDisplaySubject(request.subjects[0])}`,
    `Ano/Nível: ${String(request.grade || "").trim()}`,
    "",
    "Conteúdo principal já gerado:",
    String(request.explanation?.intro || "").trim() || "Não informado.",
    "",
    "Explicação passo a passo já gerada:",
    ...(Array.isArray(request.explanation?.steps) ? request.explanation.steps.map((step, index) => `${index + 1}. ${String(step || "").trim()}`) : ["Não informado."]),
    "",
    "Base de conteúdo digitada/enviada pelo aluno:",
    String(request.knowledgeBase || "").trim() || "Não informado.",
    "",
    historyText ? `Histórico complementar até agora:\n${historyText}\n` : "",
    `Nova pergunta do aluno: ${String(request.question || "").trim()}`,
    "",
    "Responda em continuidade ao estudo.",
  ].filter(Boolean).join("\n");
}

async function callOpenAiGenerateStudyFollowup(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("A variável OPENAI_API_KEY ainda não foi configurada.");
  }

  const openAiResponse = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      instructions: buildSystemPrompt(request),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildUserPrompt(request),
            },
          ],
        },
      ],
      max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "study_guided_followup_response",
          strict: true,
          schema: AI_STUDY_FOLLOWUP_SCHEMA,
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

  const parsed = safeJsonParse(outputText);
  if (parsed?.metadata && !parsed.metadata.generatedAt) {
    parsed.metadata.generatedAt = new Date().toISOString();
  }
  if (parsed?.metadata && typeof parsed.metadata.isCompatible !== "boolean") {
    parsed.metadata.isCompatible = true;
  }
  if (parsed?.metadata && typeof parsed.metadata.incompatibilityMessage !== "string") {
    parsed.metadata.incompatibilityMessage = "";
  }
  return parsed;
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
      message: "Use POST para enviar uma pergunta complementar do Estudo Guiado.",
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
  const validationMessage = validateStudyFollowupRequest(studyRequest);
  if (validationMessage) {
    return sendJson(response, 400, {
      error: "invalid_request",
      message: validationMessage,
    });
  }

  const compatibilityValidation = validateStudyFollowupCompatibility(studyRequest);
  if (!compatibilityValidation.ok) {
    return sendJson(response, 200, compatibilityValidation.response);
  }

  try {
    const answer = await callOpenAiGenerateStudyFollowup(studyRequest);
    return sendJson(response, 200, answer);
  } catch (error) {
    console.error("[AI generate study followup] Falha na geracao:", error);
    return sendJson(response, 502, {
      error: "generation_failed",
      message: getErrorMessage(error, "A pergunta complementar não pôde ser respondida agora."),
    });
  }
}

module.exports = handler;
