import { extractTextFromPdf } from "../utils/pdfExtractor.js";
import { askAI, parseAIJson } from "./ai.service.js";
import { normalizeSkills } from "../utils/skillNormalizer.js";
import { calculateRuleBasedMatch } from "./jobMatching.service.js";

const RESUME_PARSE_PROMPT = `
You are an expert resume parser for the Pakistani job market.
Extract structured data from the resume text provided.
Respond ONLY with valid JSON — no markdown, no explanation.
The JSON structure MUST be exactly:
{
  "skills": ["skill1", "skill2"],
  "education": [
    { "degree": "BSc Computer Science", "institution": "University Name", "year": "2024" }
  ],
  "experience": [
    { "title": "Job Title", "company": "Company Name", "duration": "Jan 2023 - Present", "description": "Brief summary" }
  ],
  "headline": "Professional headline if found",
  "summary": "Brief professional summary"
}
Rules:
- skills must be lowercase, trimmed strings
- If a field is not found, use an empty array or empty string
- Extract all technical and soft skills mentioned
`;

const EMPTY_PARSED_RESUME = {
  skills: [],
  education: [],
  experience: [],
  headline: "",
  summary: "",
};

/**
 * Validate and sanitize AI-parsed resume data.
 */
export const validateParsedResume = (parsed) => {
  const result = { ...EMPTY_PARSED_RESUME };

  if (!parsed || typeof parsed !== "object") return result;

  if (Array.isArray(parsed.skills)) {
    result.skills = normalizeSkills(parsed.skills);
  }

  if (Array.isArray(parsed.education)) {
    result.education = parsed.education
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        degree: String(e.degree || "").trim(),
        institution: String(e.institution || "").trim(),
        year: String(e.year || "").trim(),
      }))
      .filter((e) => e.degree || e.institution);
  }

  if (Array.isArray(parsed.experience)) {
    result.experience = parsed.experience
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        title: String(e.title || "").trim(),
        company: String(e.company || "").trim(),
        duration: String(e.duration || "").trim(),
        description: String(e.description || "").trim(),
      }))
      .filter((e) => e.title || e.company);
  }

  result.headline = String(parsed.headline || "").trim();
  result.summary = String(parsed.summary || "").trim();

  return result;
};

/**
 * Rule-based skill extraction fallback when AI fails.
 */
const extractSkillsRuleBased = (resumeText) => {
  const commonSkills = [
    "javascript", "typescript", "react", "node", "nodejs", "express", "mongodb",
    "python", "java", "c++", "html", "css", "tailwind", "git", "docker",
    "aws", "sql", "mysql", "postgresql", "figma", "photoshop", "excel",
    "communication", "leadership", "project management", "agile", "scrum",
    "machine learning", "data analysis", "seo", "digital marketing",
    "mern", "next.js", "vue", "angular", "flutter", "react native",
    "rest api", "graphql", "redis", "kubernetes", "ci/cd",
  ];

  const lowerText = resumeText.toLowerCase();
  const found = commonSkills.filter((skill) => lowerText.includes(skill));
  return normalizeSkills(found);
};

/**
 * Extract text from PDF and parse with AI (with rule-based fallback).
 */
export const processResumeUpload = async (filePath) => {
  const resumeText = await extractTextFromPdf(filePath);

  let parsedResume = { ...EMPTY_PARSED_RESUME };
  let parseSource = "rule-based";

  try {
    const aiResponse = await askAI(RESUME_PARSE_PROMPT, `Resume Text:\n${resumeText}`);
    const rawParsed = parseAIJson(aiResponse);
    parsedResume = validateParsedResume(rawParsed);
    parseSource = "ai";

    if (parsedResume.skills.length === 0) {
      parsedResume.skills = extractSkillsRuleBased(resumeText);
      parseSource = "rule-based-fallback";
    }
  } catch (err) {
    console.warn("[Resume] AI parsing failed, using rule-based extraction:", err.message);
    parsedResume.skills = extractSkillsRuleBased(resumeText);
    parsedResume.summary = resumeText.slice(0, 300);
    parseSource = "rule-based-fallback";
  }

  return {
    resumeText,
    parsedResume,
    parseSource,
    parsedAt: new Date(),
  };
};

/**
 * Build resume text for AI matching from profile data.
 */
export const buildResumeContext = (user) => {
  const parts = [];

  if (user?.profile?.resumeText) {
    parts.push(user.profile.resumeText);
  }

  if (user?.profile?.parsedResume) {
    const pr = user.profile.parsedResume;
    if (pr.skills?.length) parts.push(`Skills: ${pr.skills.join(", ")}`);
    if (pr.education?.length) {
      parts.push(
        "Education: " +
          pr.education.map((e) => `${e.degree} at ${e.institution} (${e.year})`).join("; ")
      );
    }
    if (pr.experience?.length) {
      parts.push(
        "Experience: " +
          pr.experience.map((e) => `${e.title} at ${e.company} — ${e.description}`).join("; ")
      );
    }
  }

  if (user?.profile?.skills?.length) {
    parts.push(`Profile Skills: ${user.profile.skills.join(", ")}`);
  }

  if (user?.profile?.bio) parts.push(`Bio: ${user.profile.bio}`);
  if (user?.profile?.headline) parts.push(`Headline: ${user.profile.headline}`);
  if (user?.name) parts.push(`Name: ${user.name}`);

  return parts.join("\n").trim();
};

/**
 * Analyze job match: AI with rule-based fallback.
 */
export const analyzeJobMatchWithFallback = async (resumeText, jobDescription, userSkills = []) => {
  const systemPrompt = `
    You are an AI recruiter. Compare the candidate's resume with the job description.
    Respond in valid JSON only. No markdown wrappers.
    JSON structure:
    {
      "matchPercentage": 75,
      "matchingSkills": ["skill1"],
      "missingSkills": ["skill2"],
      "criticalGapsExplanation": "Brief explanation",
      "recommendations": ["Action item"]
    }
  `;

  try {
    const aiResponse = await askAI(systemPrompt, `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`);
    const parsed = parseAIJson(aiResponse);

    return {
      matchPercentage: Math.min(100, Math.max(0, Number(parsed.matchPercentage) || 0)),
      matchingSkills: normalizeSkills(parsed.matchingSkills || []),
      missingSkills: normalizeSkills(parsed.missingSkills || []),
      criticalGapsExplanation: String(parsed.criticalGapsExplanation || ""),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      source: "ai",
    };
  } catch (err) {
    console.warn("[Match] AI analysis failed, using rule-based fallback:", err.message);

    const jobSkillsMatch = jobDescription.match(/requirements?:?\s*([^\n]+)/i);
    const jobSkills = jobSkillsMatch
      ? jobSkillsMatch[1].split(/[,;]/).map((s) => s.trim())
      : [];

    const userSkillList = normalizeSkills([
      ...userSkills,
      ...extractSkillsRuleBased(resumeText),
    ]);

    return calculateRuleBasedMatch(userSkillList, jobSkills.length ? jobSkills : extractSkillsRuleBased(jobDescription));
  }
};
