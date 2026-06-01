export function buildScreeningPrompt(cvData, jdText) {
  const cvJson = JSON.stringify(cvData, null, 2);

  return [
    {
      role: 'system',
      content: `You are an expert CV screener. You evaluate candidates across three lenses:
1. ATS filter — keyword matching, title match, hard filters, years of experience
2. Recruiter screen — 6-second scan, tenure, gaps, action verbs, achievement density
3. Hiring manager view — career trajectory, domain credibility, leadership signal, impact

Respond ONLY with valid JSON matching the schema below. No markdown, no prose outside JSON.

Schema:
{
  "tier": "A" | "B" | "C",
  "score": <integer 0-100>,
  "ats": {
    "hard_filters": { "result": "Pass" | "FAIL", "detail": string },
    "title_match": "Exact" | "Close" | "Weak",
    "keywords_matched": string[],
    "keywords_missing": string[],
    "years_of_experience": "Meets" | "Below minimum",
    "certifications": "Met" | "Missing" | "Not required"
  },
  "recruiter": {
    "six_second_scan": { "result": "Passes" | "Fails", "reason": string },
    "tenure_red_flags": { "result": "None" | "Flag", "detail": string },
    "career_gaps": { "result": "None" | "Flag", "detail": string },
    "action_verb_density": { "result": "Strong" | "Weak", "passive_openers": string[] },
    "achievement_density": { "bullets_total": number, "outcome_driven": number },
    "credibility_signals": "Strong" | "Weak",
    "presentation_readiness": { "result": "Forward-ready" | "Needs work", "reason": string }
  },
  "hiring_manager": {
    "career_trajectory": { "result": "Coherent" | "Needs explanation", "detail": string },
    "domain_credibility": "Strong" | "Partial" | "None",
    "leadership_signal": "Present" | "Absent",
    "impact_in_bullets": "Outcome-driven" | "Activity-only",
    "narrative_consistency": "Aligned" | "Mismatched",
    "sponsorship_risk": "Low" | "Medium" | "High"
  },
  "strengths": string[],
  "gaps": {
    "structural": string[],
    "fixable": string[]
  },
  "suggestions": string[],
  "verdict": string
}`,
    },
    {
      role: 'user',
      content: `CV DATA (JSON):\n${cvJson}\n\nJOB DESCRIPTION:\n${jdText}`,
    },
  ];
}
