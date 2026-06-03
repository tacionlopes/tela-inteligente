import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(rootDir, "data", "question-bank");
const outputPath = join(rootDir, "data", "question-bank.js");

function normalizeHeader(header) {
  return String(header || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeGradeLabel(value) {
  const text = String(value || "").trim();
  const match = text.match(/([1-5])\s*(?:o|º)?/i);
  return match ? `${match[1]}º` : text;
}

function inferAgeFromGrade(grade) {
  const ageByGrade = {
    "1º": 6,
    "2º": 7,
    "3º": 8,
    "4º": 9,
    "5º": 10,
  };

  return ageByGrade[normalizeGradeLabel(grade)] || 8;
}

function inferSubjectFromQuestion(text) {
  const questionText = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/[+\-x÷*/=]|\bquanto\b|\bresultado\b|\bmultiplo\b|\bmetade\b|\bnumero\b/.test(questionText)) {
    return "Matemática";
  }
  if (/\bpalavra\b|\bverbo\b|\bplural\b|\brima\b|\bletra\b|\bsinonimo\b|\bantonimo\b|\bsujeito\b|\bsubstantivo\b|\badjetivo\b/.test(questionText)) {
    return "Português";
  }
  if (/\bmapa\b|\bcontinente\b|\bpais\b|\bcidade\b|\bcapital\b|\bclima\b|\brelevo\b|\brio\b/.test(questionText)) {
    return "Geografia";
  }
  if (/\bindependencia\b|\bbrasil colonia\b|\bimperio\b|\brepublica\b|\bdescobrimento\b|\bhistoria\b/.test(questionText)) {
    return "História";
  }
  if (/\benglish\b|\bingles\b|\btranslate\b|\btraducao\b|\bcolor\b|\banimal in english\b/.test(questionText)) {
    return "Inglês";
  }
  if (/\bpintura\b|\bcor primar\b|\bmusica\b|\barte\b|\bdesenho\b/.test(questionText)) {
    return "Arte";
  }
  if (/\blado\b|\bmaior\b|\boposto\b|\bdepois\b|\bsequencia\b|\blogica\b|\bfigura\b/.test(questionText)) {
    return "Lógica";
  }
  return "Ciências";
}

function parseCsv(text) {
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
    } else if (char === "," && !insideQuotes) {
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

function parseQuestionFile(filename) {
  const content = readFileSync(join(sourceDir, filename), "utf8");
  const rows = parseCsv(content);
  const headers = rows[0]?.map(normalizeHeader) || [];
  const findColumn = (...names) =>
    names
      .map(normalizeHeader)
      .map((name) => headers.indexOf(name))
      .find((index) => index >= 0);

  const columns = {
    grade: findColumn("Ano", "Serie", "Série"),
    text: findColumn("Pergunta", "Questao", "Questão"),
    optionA: findColumn("A", "Alternativa A", "Opcao A", "Opção A"),
    optionB: findColumn("B", "Alternativa B", "Opcao B", "Opção B"),
    optionC: findColumn("C", "Alternativa C", "Opcao C", "Opção C"),
    optionD: findColumn("D", "Alternativa D", "Opcao D", "Opção D"),
    correct: findColumn("Correta", "Resposta Correta", "Gabarito"),
    level: findColumn("Nivel", "Nível", "Dificuldade"),
  };

  return rows.slice(1).map((row) => {
    const grade = normalizeGradeLabel(row[columns.grade]);
    const text = row[columns.text];
    return {
      grade,
      age: inferAgeFromGrade(grade),
      subject: inferSubjectFromQuestion(text),
      level: row[columns.level] || "Fácil",
      text,
      options: [row[columns.optionA], row[columns.optionB], row[columns.optionC], row[columns.optionD]],
      correct: String(row[columns.correct] || "").trim().toUpperCase(),
    };
  }).filter((question) => question.grade && question.text && question.options.every(Boolean) && question.correct);
}

function buildQuestionBank() {
  const files = readdirSync(sourceDir).filter((entry) => entry.endsWith(".csv")).sort();
  const bank = {
    "1º": [],
    "2º": [],
    "3º": [],
    "4º": [],
    "5º": [],
  };

  files.forEach((file) => {
    const questions = parseQuestionFile(file);
    questions.forEach((question) => {
      if (bank[question.grade]) {
        bank[question.grade].push(question);
      }
    });
  });

  const thirdGradeQuestions = Array.isArray(bank["3º"]) ? bank["3º"] : [];
  const cloneQuestionsForGrade = (grade) =>
    thirdGradeQuestions.map((question) => ({
      ...question,
      grade,
      age: inferAgeFromGrade(grade),
    }));

  bank["4º"] = cloneQuestionsForGrade("4º");
  bank["5º"] = cloneQuestionsForGrade("5º");

  return bank;
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `window.TELA_INTELIGENTE_QUESTION_BANK = ${JSON.stringify(buildQuestionBank(), null, 2)};\n`,
  "utf8",
);
