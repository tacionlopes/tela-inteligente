const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDocxText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\t/g, " ")
    .trim();
}

function textToParagraphs(value) {
  const normalized = normalizeDocxText(value);
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/)
    .flatMap((block) => block.split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildRunXml(text, options = {}) {
  const size = Number(options.size || 24);
  const color = String(options.color || "111111");
  const bold = options.bold ? "<w:b/>" : "";
  const italic = options.italic ? "<w:i/>" : "";

  return [
    "<w:r>",
    "<w:rPr>",
    bold,
    italic,
    `<w:color w:val="${xmlEscape(color)}"/>`,
    `<w:sz w:val="${size}"/>`,
    `<w:szCs w:val="${size}"/>`,
    "</w:rPr>",
    `<w:t xml:space="preserve">${xmlEscape(text)}</w:t>`,
    "</w:r>",
  ].join("");
}

function buildParagraphXml(text, options = {}) {
  const spacingBefore = Number(options.spacingBefore ?? 0);
  const spacingAfter = Number(options.spacingAfter ?? 120);
  const indentLeft = Number(options.indentLeft ?? 0);
  const keepNext = options.keepNext ? "<w:keepNext/>" : "";

  return [
    "<w:p>",
    "<w:pPr>",
    keepNext,
    `<w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}" w:line="360" w:lineRule="auto"/>`,
    indentLeft ? `<w:ind w:left="${indentLeft}"/>` : "",
    "</w:pPr>",
    buildRunXml(text, options),
    "</w:p>",
  ].join("");
}

function buildHeadingXml(text, level = 2) {
  const sizeMap = { 1: 34, 2: 28, 3: 24 };
  const beforeMap = { 1: 0, 2: 220, 3: 160 };
  const afterMap = { 1: 180, 2: 120, 3: 80 };
  return buildParagraphXml(text, {
    bold: true,
    color: "3D8CA9",
    size: sizeMap[level] || 28,
    spacingBefore: beforeMap[level] || 180,
    spacingAfter: afterMap[level] || 120,
    keepNext: true,
  });
}

function buildMetaXml(label, value) {
  return buildParagraphXml(`${label}: ${value}`, {
    color: "4D7180",
    size: 22,
    spacingAfter: 40,
  });
}

function buildDocxDocumentXml(payload) {
  const metadata = payload?.metadata || {};
  const explanation = payload?.explanation || {};
  const conversation = Array.isArray(payload?.conversation) ? payload.conversation : [];
  const steps = Array.isArray(explanation.steps) ? explanation.steps : [];
  const subjectLabel = Array.isArray(metadata.subjects) ? metadata.subjects.find(Boolean) || "" : "";
  const gradeLabel = String(metadata.grade || "").trim();
  const generatedAt = String(payload?.generatedAtLabel || "").trim();

  const parts = [];
  parts.push(buildHeadingXml("Desbloqueio Inteligente", 1));
  if (subjectLabel) parts.push(buildMetaXml("Matéria", subjectLabel));
  if (gradeLabel) parts.push(buildMetaXml("Ano", gradeLabel));
  if (generatedAt) parts.push(buildMetaXml("Gerado em", generatedAt));

  parts.push(buildHeadingXml("Conteúdo", 2));
  const introParagraphs = textToParagraphs(explanation.intro || "Sem conteúdo gerado.");
  introParagraphs.forEach((paragraph) => {
    parts.push(buildParagraphXml(paragraph, { color: "111111", size: 24 }));
  });

  parts.push(buildHeadingXml("Explicação passo a passo", 2));
  steps.forEach((step, index) => {
    parts.push(buildParagraphXml(`${index + 1}. ${normalizeDocxText(step)}`, {
      color: "111111",
      size: 24,
      spacingAfter: 90,
    }));
  });

  if (conversation.length) {
    parts.push(buildHeadingXml("Perguntas complementares", 2));
    conversation.forEach((message) => {
      const label = message?.role === "user" ? "Pergunta" : "Resposta";
      parts.push(buildHeadingXml(label, 3));
      textToParagraphs(message?.text || "").forEach((paragraph) => {
        parts.push(buildParagraphXml(paragraph, { color: "111111", size: 24 }));
      });
    });
  }

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">',
    "<w:body>",
    parts.join(""),
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>',
    "</w:body>",
    "</w:document>",
  ].join("");
}

function buildContentTypesXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    "</Types>",
  ].join("");
}

function buildRootRelsXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
    "</Relationships>",
  ].join("");
}

function buildDocumentRelsXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    "</Relationships>",
  ].join("");
}

function buildStylesXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:color w:val="111111"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>',
    "</w:styles>",
  ].join("");
}

function buildCoreXml(payload) {
  const created = new Date().toISOString();
  const subjectLabel = Array.isArray(payload?.metadata?.subjects) ? payload.metadata.subjects.find(Boolean) || "Estudo" : "Estudo";
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    "<dc:title>Desbloqueio Inteligente</dc:title>",
    `<dc:subject>${xmlEscape(subjectLabel)}</dc:subject>`,
    "<dc:creator>Codex</dc:creator>",
    "<cp:lastModifiedBy>Codex</cp:lastModifiedBy>",
    `<dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>`,
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified>`,
    "</cp:coreProperties>",
  ].join("");
}

function buildAppXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">',
    "<Application>Codex</Application>",
    "</Properties>",
  ].join("");
}

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = ((date.getHours() & 0x1f) << 11)
    | ((date.getMinutes() & 0x3f) << 5)
    | Math.floor((date.getSeconds() & 0x3f) / 2);
  const dosDate = (((year - 1980) & 0x7f) << 9)
    | (((date.getMonth() + 1) & 0x0f) << 5)
    | (date.getDate() & 0x1f);
  return { dosTime, dosDate };
}

function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = getDosDateTime(new Date());

  entries.forEach((entry) => {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const dataBuffer = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const crc = crc32(dataBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(now.dosTime, 10);
    localHeader.writeUInt16LE(now.dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(now.dosTime, 12);
    centralHeader.writeUInt16LE(now.dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function sanitizeFilePart(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildDocxBuffer(payload) {
  const entries = [
    { name: "[Content_Types].xml", data: buildContentTypesXml() },
    { name: "_rels/.rels", data: buildRootRelsXml() },
    { name: "docProps/core.xml", data: buildCoreXml(payload) },
    { name: "docProps/app.xml", data: buildAppXml() },
    { name: "word/document.xml", data: buildDocxDocumentXml(payload) },
    { name: "word/styles.xml", data: buildStylesXml() },
    { name: "word/_rels/document.xml.rels", data: buildDocumentRelsXml() },
  ];
  return createStoredZip(entries);
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

function sendBinary(response, statusCode, buffer, fileName) {
  response.statusCode = statusCode;
  if (typeof response.setHeader === "function") {
    response.setHeader("Content-Type", DOCX_CONTENT_TYPE);
    response.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    response.setHeader("Content-Length", String(buffer.length));
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  response.end(buffer);
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  if (typeof response.setHeader === "function") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  response.end(JSON.stringify(payload));
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "method_not_allowed", message: "Use POST para baixar o estudo em DOCX." });
    return;
  }

  try {
    const payload = await collectJsonBody(request);
    const explanation = payload?.explanation || {};
    const hasIntro = String(explanation.intro || "").trim();
    const hasSteps = Array.isArray(explanation.steps) && explanation.steps.some((step) => String(step || "").trim());

    if (!hasIntro && !hasSteps) {
      sendJson(response, 400, { error: "missing_content", message: "Gere primeiro um Desbloqueio antes de baixar em DOCX." });
      return;
    }

    const subjectLabel = Array.isArray(payload?.metadata?.subjects) ? payload.metadata.subjects.find(Boolean) || "estudo" : "estudo";
    const gradeLabel = String(payload?.metadata?.grade || "").trim();
    const fileNameParts = ["desbloqueio", sanitizeFilePart(subjectLabel), sanitizeFilePart(gradeLabel)].filter(Boolean);
    const fileName = `${fileNameParts.join("-") || "desbloqueio-estudo"}.docx`;
    const generatedAtLabel = new Date().toLocaleString("pt-BR");
    const buffer = buildDocxBuffer({ ...payload, generatedAtLabel });
    sendBinary(response, 200, buffer, fileName);
  } catch (error) {
    sendJson(response, 500, {
      error: "docx_export_failed",
      message: error instanceof Error && error.message ? error.message : "Nao foi possivel gerar o DOCX agora.",
    });
  }
};
