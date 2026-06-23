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
const STUDY_GUIDED_GRADE_INCOMPATIBILITY_MESSAGE = "O assunto solicitado não faz parte da matéria e do ano selecionados. Escolha um conteúdo compatível ou gere um novo estudo.";

const STUDY_GUIDED_SUBJECT_KEYWORD_HINTS = {
  "Português": ["substantivo", "verbo", "adjetivo", "oração", "crase", "pontuação", "concordância", "acentuação", "interpretação", "texto"],
  "Matemática": ["matemática", "matematica", "números", "numeros", "número", "numero", "números reais", "numeros reais", "número real", "numero real", "conjuntos numéricos", "conjuntos numericos", "números racionais", "numeros racionais", "números irracionais", "numeros irracionais", "irracional", "irracionais", "inteiro", "inteiros", "natural", "naturais", "decimal", "decimais", "dízima", "dizima", "porcento", "porcentagem", "fração", "fracao", "frações", "fracoes", "raiz", "raiz quadrada", "raízes", "raizes", "potência", "potencia", "potências", "potencias", "expoente", "múltiplo", "multiplo", "divisor", "divisores", "equação", "equacao", "equações", "equacoes", "inequação", "inequacao", "álgebra", "algebra", "expressão numérica", "expressao numerica", "geometria", "ângulo", "angulo", "área", "area", "perímetro", "perimetro", "volume", "estatística", "estatistica", "probabilidade", "gráfico", "grafico", "tabela", "razão", "razao", "proporção", "proporcao", "regra de três", "regra de tres", "bhaskara"],
  "História": ["guerra", "império", "colônia", "revolução", "independência", "idade média", "presidente", "ditadura", "povo antigo", "civilização"],
  "Geografia": ["mapa", "território", "clima", "relevo", "vegetação", "hidrografia", "continente", "população", "urbanização", "paisagem"],
  "Biologia": ["coração", "célula", "corpo humano", "sistema digestório", "respiração", "órgão", "ser vivo", "genética", "ecossistema", "fotossíntese"],
  "Química": ["átomo", "átomos", "molécula", "moléculas", "elemento químico", "tabela periódica", "reação química", "mistura", "substância", "ligação química", "distribuição eletrônica", "distribuicao eletronica", "camada de valência", "camada de valencia", "configuração eletrônica", "configuracao eletronica", "elétrons", "eletrons"],
  "Física": ["força", "movimento", "energia", "velocidade", "gravidade", "massa", "aceleração", "aceleracao", "eletricidade", "circuito", "ondas", "frequência", "frequencia", "período", "periodo", "hertz", "oscilação", "oscilacao"],
  "Inglês": ["verb to be", "simple present", "simple past", "present continuous", "english", "inglês", "vocabulary", "reading", "listening"],
  "Artes": ["pintura", "escultura", "teatro", "música", "dança", "obra de arte", "artista", "cores", "desenho", "cinema"],
};

const STUDY_GUIDED_SUBJECT_SPECIALIST_PROFILES = {
  "Português": "Atue como professor especialista em leitura, interpretação, gramática, gêneros textuais e produção de textos.",
  "Matemática": "Atue como professor especialista em raciocínio lógico, resolução de problemas, cálculos, geometria, álgebra e estatística.",
  "História": "Atue como professor especialista em contexto histórico, causas, consequências, linhas do tempo e relação entre passado e presente.",
  "Geografia": "Atue como professor especialista em espaço geográfico, mapas, clima, relevo, população, economia e sociedade.",
  "Biologia": "Atue como professor investigativo, relacionando teoria, saúde, ambiente, tecnologia, cotidiano e sociedade.",
  "Física": "Atue como professor investigativo, relacionando teoria, movimento, energia, fenômenos do cotidiano, tecnologia e sociedade.",
  "Química": "Atue como professor investigativo, relacionando matéria, transformações, experimentos simples, cotidiano, tecnologia e sociedade.",
  "Inglês": "Atue como professor de vocabulário, leitura, gramática, interpretação e uso prático da língua inglesa.",
  "Artes": "Atue como professor de leitura visual, movimentos artísticos, criatividade, expressão e interpretação de imagens.",
};

const STUDY_GUIDED_GRADE_PROGRESSION_PROFILES = {
  "6º": "Mantenha a explicação em nível introdutório, com base forte, linguagem simples e sem aprofundar conteúdos típicos de séries posteriores.",
  "7º": "Mantenha uma progressão intermediária, com ampliação de conceitos, mas ainda com bastante apoio didático e exemplos concretos.",
  "8º": "Aprofunde um pouco mais, com relações entre conceitos e aplicação prática, sem ultrapassar a complexidade do 8º ano.",
  "9º": "Você pode trabalhar com maior autonomia conceitual, interpretação mais madura e preparação para conteúdos mais exigentes, sem sair do Fundamental II.",
};

const STUDY_GUIDED_COMPLEXITY_RULES = [
  {
    subject: "Química",
    minGrade: 7,
    keywords: ["átomo", "átomos", "molécula", "moléculas", "tabela periódica", "tabela periodica", "elemento químico", "elementos químicos"],
  },
  {
    subject: "Química",
    minGrade: 9,
    keywords: ["distribuição eletrônica", "distribuicao eletronica", "camada de valência", "camada de valencia", "configuração eletrônica", "configuracao eletronica"],
  },
  {
    subject: "Química",
    minGrade: 9,
    keywords: ["estequiometria", "cálculo estequiométrico", "calculo estequiometrico"],
  },
  {
    subject: "Física",
    minGrade: 8,
    keywords: ["velocidade", "aceleração", "aceleracao", "força", "forca", "movimento", "gravidade", "ondas", "eletricidade"],
  },
  {
    subject: "Matemática",
    minGrade: 7,
    keywords: ["equação do 1º grau", "equacao do 1 grau", "equação do primeiro grau", "equacao do primeiro grau"],
  },
  {
    subject: "Matemática",
    minGrade: 9,
    keywords: ["equação do 2º grau", "equacao do 2 grau", "equação do segundo grau", "equacao do segundo grau", "bhaskara", "função quadrática", "funcao quadratica"],
  },
  {
    subject: "Português",
    minGrade: 8,
    keywords: ["oração subordinada", "oracao subordinada", "análise sintática", "analise sintatica", "predicativo", "aposto", "vocativo"],
  },
];

function normalizePlainText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeGradeNumber(value) {
  const match = String(value || "").match(/([1-9])/);
  return match ? Number(match[1]) : 0;
}

function getStudyGuidedDisplaySubject(subject) {
  const normalized = normalizePlainText(subject);

  if (normalized === normalizePlainText("Ciências")) return "Biologia";
  if (normalized === normalizePlainText("Matemática")) return "Matemática";
  if (normalized === normalizePlainText("Lógica")) return "Física";
  if (normalized === normalizePlainText("Historia da Arte")) return "Artes";

  return String(subject || "").trim();
}

function getStudyGuidedSubjectSpecialistProfile(subjectLabel) {
  return STUDY_GUIDED_SUBJECT_SPECIALIST_PROFILES[String(subjectLabel || "").trim()] || "Atue como professor especialista da matéria selecionada.";
}

function getStudyGuidedGradeProgressionProfile(grade) {
  return STUDY_GUIDED_GRADE_PROGRESSION_PROFILES[String(grade || "").trim()] || "Respeite rigorosamente o nível de complexidade adequado ao ano selecionado.";
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

function getSubjectKeywordScore(subjectLabel, rawText) {
  const keywords = STUDY_GUIDED_SUBJECT_KEYWORD_HINTS[String(subjectLabel || "").trim()] || [];
  const normalizedText = normalizePlainText(rawText);
  if (!normalizedText || !keywords.length) return 0;

  return keywords.reduce((total, keyword) => (
    total + (normalizedText.includes(normalizePlainText(keyword)) ? 1 : 0)
  ), 0);
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

  if (selectedSubjectLabel === "Matemática") {
    return { ok: true, response: null };
  }

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

function validateStudyGuidedGradeComplexity(request) {
  const knowledgeText = String(request?.knowledgeBase || "").trim();
  if (!knowledgeText) {
    return { ok: true, response: null };
  }

  const gradeNumber = normalizeGradeNumber(request?.grade);
  if (!gradeNumber) {
    return { ok: true, response: null };
  }

  const normalizedText = normalizePlainText(knowledgeText);
  const selectedDisplaySubject = getStudyGuidedDisplaySubject(String(request?.subjects?.[0] || "").trim());

  const matchedRule = STUDY_GUIDED_COMPLEXITY_RULES.find((rule) => {
    if (String(rule.subject || "").trim() !== selectedDisplaySubject) {
      return false;
    }

    if (gradeNumber >= Number(rule.minGrade || 0)) {
      return false;
    }

    return rule.keywords.some((keyword) => normalizedText.includes(normalizePlainText(keyword)));
  });

  if (!matchedRule) {
    return { ok: true, response: null };
  }

  return {
    ok: false,
    response: buildIncompatibleStudyGuidedResponse(
      request,
      STUDY_GUIDED_GRADE_INCOMPATIBILITY_MESSAGE
    ),
  };
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

function buildStudyGuidedTeacherPersona(request) {
  const subjectLabel = getStudyGuidedDisplaySubject(String(request?.subjects?.[0] || "").trim());
  const gradeLabel = String(request?.grade || "").trim() || "ano selecionado";
  const subjectProfile = getStudyGuidedSubjectSpecialistProfile(subjectLabel);
  const gradeProfile = getStudyGuidedGradeProgressionProfile(request?.grade);

  return `Atue como professor especialista de ${subjectLabel} do ${gradeLabel} ano do Ensino Fundamental II. ${subjectProfile} ${gradeProfile}`;
}

function buildSystemPrompt(request) {
  return [
    "Você é um Professor Especialista do Ensino Fundamental II do aplicativo Desbloqueio Inteligente.",
    "Sua função é ensinar, explicar, corrigir, gerar exercícios, simulados, reforços e complementos respeitando sempre: o ano escolhido pelo aluno, a matéria escolhida, o conteúdo programático compatível, a linguagem adequada à idade e a progressão correta entre as séries.",
    "O ano escolar é o filtro principal do conteúdo.",
    "Nenhuma resposta pode ser gerada sem validar simultaneamente etapa de ensino, ano escolar, matéria e nível de complexidade.",
    "Antes de responder, assuma o papel do professor especialista da matéria selecionada.",
    "Se o conteúdo estiver acima da série, explique apenas a base necessária, sem aprofundar além do ano.",
    "Se não for possível adaptar com segurança, trate como incompatível.",
    "Nunca use a introdução para comentar a validação; a introdução deve começar explicando diretamente o conteúdo enviado.",
    "Escreva com ótima gramática, excelente ortografia, acentuação correta, pontuação bem colocada, clareza didática e tom humano, paciente, acolhedor e fluido.",
    "Não responda fora da matéria selecionada, não avance para conteúdo de outro ano sem avisar e não use linguagem universitária.",
    `Perfil docente obrigatório: ${buildStudyGuidedTeacherPersona(request)}`,
  ].join("\n");
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

  const gradeValidation = validateStudyGuidedGradeComplexity(studyRequest);
  if (!gradeValidation.ok) {
    return sendJson(response, 200, gradeValidation.response);
  }

  const prompt = body?.prompt || {};
  const resolvedPrompt = {
    system: String(prompt?.system || "").trim() || buildSystemPrompt(studyRequest),
    user: String(prompt?.user || "").trim(),
  };

  try {
    const generatedExplanation = await callOpenAiGenerateStudyExplanation({
      request: studyRequest,
      prompt: resolvedPrompt,
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
