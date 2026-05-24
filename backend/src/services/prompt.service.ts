import type { AssignmentInput } from "../types";

export function buildGenerationPrompt(input: AssignmentInput): string {
  const typeSummary = input.questionTypes
    .filter((t) => t.count > 0)
    .map(
      (t) =>
        `${t.label}: ${t.count} questions, ${t.marksPerQuestion} marks each`
    )
    .join("\n");

  const context = input.uploadedText
    ? `\nReference material from upload:\n${input.uploadedText.slice(0, 4000)}\n`
    : "";

  return `You are an expert exam paper creator for K-12 and higher education.

Create a structured question paper as valid JSON only. No markdown, no explanation outside JSON.

Assignment:
- Title: ${input.title}
- Subject: ${input.subject}
- Due date: ${input.dueDate}
${context}
Question requirements:
${typeSummary}

Additional instructions from teacher:
${input.additionalInstructions || "None"}

Return JSON matching this exact schema:
{
  "title": "string",
  "subject": "string",
  "totalMarks": number,
  "durationMinutes": number,
  "generalInstructions": ["string"],
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "text": "question text",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "type": "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_blank",
          "options": ["A", "B", "C", "D"]
        }
      ]
    }
  ]
}

Rules:
- Group questions into logical sections (A, B, C...)
- Match requested question counts and marks per type
- Mix difficulties appropriately
- MCQ must include options array
- Section instructions should reflect question types (e.g. "Attempt any 3 out of 5")`;
}
