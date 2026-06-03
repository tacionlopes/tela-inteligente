const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const DEFAULT_MAX_OUTPUT_TOKENS = Math.max(1200, Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 5000));

const AI_GENERATED_QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "questions"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["grade", "subjects", "count", "generatedAt"],
      properties: {
        grade: { type: "string" },
        subjects: {
          type: "array",
          items: { type: "string" },
        },
        count: { type: "number" },
        generatedAt: { type: "string" },
      },
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "grade",
          "subject",
          "text",
          "answerMode",
          "options",
          "correct",
          "expectedAnswer",
          "explanation",
        ],
        properties: {
          grade: { type: "string" },
          subject: { type: "string" },
          text: { type: "string" },
          answerMode: {
            type: "string",
            enum: ["choice", "text"],
          },
          options: {
            type: "array",
            items: { type: "string" },
          },
          correct: { type: "string" },
          expectedAnswer: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
  },
};

function sendJson(response, statusCode, payload) {
  if (typeof response.status === "function") {
    return response.status(statusCode).json(payload);
  }

  response.statusCode = statusCode;
  if (typeof response.setHeader === "function") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  response.end(JSON.stringify(payload));
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function validateGenerationRequest(request) {
  if (!request || typeof request !== "object") {
    return "O corpo da requisição precisa incluir um objeto request.";
  }

  if (!String(request.grade || "").trim()) {
    return "O campo grade é obrigatório.";
  }

  if (!Array.isArray(request.subjects) || !request.subjects.length) {
    return "Selecione ao menos uma matéria para gerar questões.";
  }

  if (!Number.isFinite(Number(request.count)) || Number(request.count) < 1) {
    return "O campo count precisa ser maior que zero.";
  }

  if (!request.questionTypes?.choice && !request.questionTypes?.text) {
    return "Selecione ao menos um tipo de questão.";
  }

  return "";
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

async function callOpenAiGenerateQuestions({ request, prompt }) {
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
      instructions: String(prompt?.system || ""),
      input: String(prompt?.user || ""),
      max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "generated_questions_response",
          strict: true,
          schema: AI_GENERATED_QUESTIONS_SCHEMA,
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
    throw new Error("A OpenAI não devolveu conteúdo estruturado para as questões.");
  }

  const parsedContent = JSON.parse(outputText);
  if (parsedContent?.metadata && !parsedContent.metadata.generatedAt) {
    parsedContent.metadata.generatedAt = new Date().toISOString();
  }

  return parsedContent;
}

async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, {
      error: "method_not_allowed",
      message: "Use POST para gerar questões com IA.",
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

  const generationRequest = body?.request;
  const validationMessage = validateGenerationRequest(generationRequest);
  if (validationMessage) {
    return sendJson(response, 400, {
      error: "invalid_request",
      message: validationMessage,
    });
  }

  const prompt = body?.prompt || {};

  try {
    const generatedQuestions = await callOpenAiGenerateQuestions({
      request: generationRequest,
      prompt,
    });

    return sendJson(response, 200, generatedQuestions);
  } catch (error) {
    return sendJson(response, 502, {
      error: "generation_failed",
      message: getErrorMessage(error, "A geração de questões falhou."),
    });
  }
}

module.exports = handler;
