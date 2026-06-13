const OPENAI_TTS_API_URL = "https://api.openai.com/v1/audio/speech";
const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "alloy";
const MAX_STUDY_AUDIO_CHARACTERS = 900;
const OPENAI_TTS_TIMEOUT_MS = 30000;

function setCorsHeaders(response) {
  if (typeof response.setHeader !== "function") return;
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  setCorsHeaders(response);
  if (typeof response.setHeader === "function") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
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

function sanitizeAudioInput(rawText) {
  return String(rawText || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_STUDY_AUDIO_CHARACTERS);
}

function getRequestUrl(request) {
  const host = typeof request.headers?.host === "string" ? request.headers.host : "localhost";
  return new URL(request.url || "/", `http://${host}`);
}

async function generateStudyAudio(rawText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("A variável OPENAI_API_KEY ainda não foi configurada.");
  }

  const input = sanitizeAudioInput(rawText);
  if (!input) {
    throw new Error("Não há conteúdo disponível para gerar o áudio.");
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), OPENAI_TTS_TIMEOUT_MS) : null;

  let openAiResponse;
  try {
    openAiResponse = await fetch(OPENAI_TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_TTS_MODEL,
        voice: DEFAULT_TTS_VOICE,
        input,
        response_format: "mp3",
      }),
      signal: controller?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A geração do áudio demorou demais. Tente novamente.");
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  if (!openAiResponse.ok) {
    let apiErrorMessage = `OpenAI respondeu com status ${openAiResponse.status}.`;

    try {
      const errorPayload = await openAiResponse.json();
      apiErrorMessage = errorPayload?.error?.message || apiErrorMessage;
    } catch {
      // Mantem a mensagem padrao quando a resposta nao vier em JSON.
    }

    throw new Error(apiErrorMessage);
  }

  const audioBuffer = Buffer.from(await openAiResponse.arrayBuffer());
  if (!audioBuffer.length) {
    throw new Error("A OpenAI não devolveu áudio para esse conteúdo.");
  }

  return audioBuffer;
}

async function handler(request, response) {
  if (request.method === "OPTIONS") {
    setCorsHeaders(response);
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, {
      error: "method_not_allowed",
      message: "Use GET ou POST para gerar o áudio do Estudo Guiado com IA.",
    });
  }

  let text = "";
  if (request.method === "GET") {
    const requestUrl = getRequestUrl(request);
    text = sanitizeAudioInput(requestUrl.searchParams.get("text"));
  } else {
    let body;
    try {
      body = await collectJsonBody(request);
    } catch (error) {
      return sendJson(response, 400, {
        error: "invalid_json",
        message: getErrorMessage(error, "Não foi possível ler o JSON enviado."),
      });
    }
    text = sanitizeAudioInput(body?.text);
  }

  if (!text) {
    return sendJson(response, 400, {
      error: "invalid_request",
      message: "Envie o texto da explicação para gerar o áudio.",
    });
  }

  try {
    const audioBuffer = await generateStudyAudio(text);
    setCorsHeaders(response);
    response.statusCode = 200;
    if (typeof response.setHeader === "function") {
      response.setHeader("Content-Type", "audio/mpeg");
      response.setHeader("Content-Length", String(audioBuffer.length));
      response.setHeader("Cache-Control", "no-store");
    }
    response.end(audioBuffer);
  } catch (error) {
    console.error("[AI generate study audio] Falha na geracao:", error);
    return sendJson(response, 502, {
      error: "generation_failed",
      message: getErrorMessage(error, "A geração do áudio falhou."),
    });
  }
}

module.exports = handler;
