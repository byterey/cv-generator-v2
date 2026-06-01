export function buildGenerationPrompt(cvData, jdText) {
  const cvJson = JSON.stringify(cvData, null, 2);

  return [
    {
      role: 'system',
      content: `You are an expert CV writer. Your task is to produce an overlay JSON that tailors a CV to a specific job description.

Rules:
- Never fabricate facts, metrics, or claims not present in the original CV data
- Only rephrase bullets to match the JD's exact terminology when the underlying fact is identical
- Reorder bullets within each role to put the most relevant ones first
- Write a new headline and summary using JD language but grounded in the CV facts
- Strong bullet format: [Action verb] + [what was done] + [quantified result or scale]
- Weak openers to replace: supported, helped, assisted, worked with, participated in

Respond ONLY with valid JSON matching the overlay schema. No markdown, no prose outside JSON.

Overlay schema:
{
  "headline": string,
  "summary": string,
  "meta": { "sections": string[] },
  "experience": [
    {
      "company": string,
      "bullet_order": number[],
      "bullet_rephrase": { "<index>": string }
    }
  ],
  "skills": {
    "category_order": string[]
  }
}`,
    },
    {
      role: 'user',
      content: `CV DATA (JSON):\n${cvJson}\n\nJOB DESCRIPTION:\n${jdText}`,
    },
  ];
}
