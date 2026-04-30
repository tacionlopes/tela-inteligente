const sheetUrl = document.querySelector("#sheetUrl");
const syncButton = document.querySelector("#syncButton");
const statusText = document.querySelector("#status");

chrome.storage.local.get(["sheetCsvUrl"], (result) => {
  if (result.sheetCsvUrl) {
    sheetUrl.value = result.sheetCsvUrl;
  }
});

syncButton.addEventListener("click", async () => {
  const url = sheetUrl.value.trim();
  setStatus("Sincronizando...", "");
  syncButton.disabled = true;

  try {
    if (!url.startsWith("https://")) {
      throw new Error("Use uma URL HTTPS publicada pelo Google Sheets ou Apps Script.");
    }

    chrome.storage.local.set({ sheetCsvUrl: url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Não consegui baixar a planilha.");
    }

    const csv = await response.text();
    const questions = importQuestionsFromCsv(csv);

    if (!questions.length) {
      throw new Error("Nenhuma questão válida encontrada.");
    }

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) {
      throw new Error("Abra o app Desbloqueio Inteligente antes de sincronizar.");
    }

    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: injectQuestions,
      args: [questions],
    });

    setStatus(`${questions.length} questões sincronizadas com o app.`, "success");
  } catch (error) {
    setStatus(error.message || "Não foi possível sincronizar.", "error");
  } finally {
    syncButton.disabled = false;
  }
});

function injectQuestions(questions) {
  localStorage.setItem("smartUnlockQuestions", JSON.stringify(questions));
  localStorage.setItem(
    "smartUnlockQuestionsUpdatedAt",
    new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  window.dispatchEvent(new CustomEvent("smartUnlockQuestionsUpdated"));
}

function setStatus(message, type) {
  statusText.textContent = message;
  statusText.className = type;
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

function normalizeHeader(header) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function importQuestionsFromCsv(text) {
  const rows = parseCsv(text);
  const headers = rows[0]?.map(normalizeHeader) || [];
  const findColumn = (...names) =>
    names.map(normalizeHeader).map((name) => headers.indexOf(name)).find((index) => index >= 0);

  const columns = {
    grade: findColumn("Ano", "Série", "Serie"),
    age: findColumn("Idade"),
    subject: findColumn("Matéria", "Materia", "Disciplina"),
    text: findColumn("Pergunta", "Questão", "Questao"),
    optionA: findColumn("Alternativa A", "Opção A", "Opcao A", "A"),
    optionB: findColumn("Alternativa B", "Opção B", "Opcao B", "B"),
    optionC: findColumn("Alternativa C", "Opção C", "Opcao C", "C"),
    optionD: findColumn("Alternativa D", "Opção D", "Opcao D", "D"),
    correct: findColumn("Resposta Correta", "Correta", "Gabarito"),
    level: findColumn("Nível", "Nivel", "Dificuldade"),
  };

  const requiredColumns = [
    columns.grade,
    columns.age,
    columns.subject,
    columns.text,
    columns.optionA,
    columns.optionB,
    columns.optionC,
    columns.correct,
  ];

  if (requiredColumns.some((column) => column === undefined)) {
    throw new Error("CSV sem colunas obrigatórias.");
  }

  return rows
    .slice(1)
    .map((row) => {
      const options = [row[columns.optionA], row[columns.optionB], row[columns.optionC]];
      if (columns.optionD !== undefined) {
        options.push(row[columns.optionD]);
      }

      return {
        grade: row[columns.grade],
        age: Number(row[columns.age]),
        subject: row[columns.subject],
        level: row[columns.level] || "Fácil",
        text: row[columns.text],
        options,
        correct: (row[columns.correct] || "").trim().toUpperCase(),
      };
    })
    .filter((question) => {
      const validAnswers = question.options.map((_, index) => String.fromCharCode(65 + index));
      const hasValidAnswer = validAnswers.includes(question.correct);
      return question.grade && question.age && question.subject && question.text && question.options.filter(Boolean).length >= 3 && hasValidAnswer;
    });
}
