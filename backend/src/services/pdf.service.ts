import puppeteer from "puppeteer";
import type { QuestionPaper } from "../types";

function difficultyLabel(d: string): string {
  if (d === "easy") return "Easy";
  if (d === "hard") return "Hard";
  return "Moderate";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPaperHtml(paper: QuestionPaper): string {
  const sectionsHtml = paper.sections
    .map(
      (section) => `
    <div class="section">
      <h2>${escapeHtml(section.title)}</h2>
      <p class="instruction">${escapeHtml(section.instruction)}</p>
      ${section.questions
        .map(
          (q) => `
        <div class="question">
          <div class="q-header">
            <span class="q-num">Q${q.number}.</span>
            <span class="badge ${q.difficulty}">${difficultyLabel(q.difficulty)}</span>
            <span class="marks">[${q.marks} marks]</span>
          </div>
          <p class="q-text">${escapeHtml(q.text)}</p>
          ${
            q.options?.length
              ? `<ul>${q.options.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>`
              : ""
          }
        </div>`
        )
        .join("")}
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; padding: 40px; color: #1a1d26; font-size: 12pt; }
    .header { text-align: center; border-bottom: 2px solid #5b4fe8; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 18pt; color: #5b4fe8; }
    .meta { display: flex; justify-content: space-between; margin: 16px 0; font-size: 11pt; }
    .student-info { margin: 20px 0; }
    .student-info .line { border-bottom: 1px solid #333; margin: 12px 0; padding-bottom: 4px; }
    .instructions { background: #f8f9fc; padding: 12px; margin-bottom: 24px; border-left: 4px solid #5b4fe8; }
    .instructions li { margin-left: 20px; margin-bottom: 4px; }
    .section { margin-bottom: 28px; page-break-inside: avoid; }
    .section h2 { font-size: 14pt; color: #5b4fe8; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    .instruction { font-style: italic; color: #555; margin: 8px 0 16px; }
    .question { margin-bottom: 20px; }
    .q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .q-num { font-weight: bold; }
    .badge { font-size: 9pt; padding: 2px 8px; border-radius: 4px; font-family: sans-serif; }
    .badge.easy { background: #d1fae5; color: #065f46; }
    .badge.medium { background: #fef3c7; color: #92400e; }
    .badge.hard { background: #fee2e2; color: #991b1b; }
    .marks { margin-left: auto; font-weight: bold; }
    .q-text { line-height: 1.5; }
    ul { margin: 8px 0 0 24px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(paper.title)}</h1>
    <p>${escapeHtml(paper.subject)}</p>
  </div>
  <div class="meta">
    <span>Total Marks: ${paper.totalMarks}</span>
    <span>Duration: ${paper.durationMinutes} minutes</span>
  </div>
  <div class="student-info">
    <div class="line">Name: _________________________________</div>
    <div class="line">Roll Number: _________________________</div>
    <div class="line">Section: _____________________________</div>
  </div>
  <div class="instructions">
    <strong>General Instructions</strong>
    <ul>${paper.generalInstructions.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
  </div>
  ${sectionsHtml}
</body>
</html>`;
}

export async function generatePdfBuffer(paper: QuestionPaper): Promise<Buffer> {
  const html = buildPaperHtml(paper);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
