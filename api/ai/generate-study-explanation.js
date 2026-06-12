const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const DEFAULT_MAX_OUTPUT_TOKENS = Math.max(1200, Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 5000));

const AI_STUDY_EXPLANATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "explanation"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["grade", "subjects", "generatedAt", "usedKnowledgeBase", "usedImages"],
      properties: {
        grade: { type: "string" },
        subjects: {
          type: "array",
          items: { type: "string" },
        },
        generatedAt: { type: "string" },
        usedKnowledgeBase: { type: "boolean" },
        usedImages: { type: "number" },
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

  const parsedContent = JSON.parse(outputText);
  if (parsedContent?.metadata && !parsedContent.metadata.generatedAt) {
    parsedContent.metadata.generatedAt = new Date().toISOString();
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
