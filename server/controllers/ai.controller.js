import { askGroq } from "../utils/groq.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * AI Resume Reviewer
 * POST /api/ai/review-resume
 */
export const reviewResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      throw new ApiError(400, "Resume text content is required for review.");
    }

    const systemPrompt = `
      You are an expert ATS (Applicant Tracking System) recruiter and technical career coach in Pakistan.
      Review the provided resume text and give a highly detailed, professional feedback report.
      Break down your response into the following clear Markdown sections:
      1. Overall Score (out of 100)
      2. Strengths (what is done well)
      3. Key Weaknesses & Missing Details
      4. ATS Compatibility Suggestions
      5. Practical recommendations to improve formatting/content for the Pakistani market.
      Keep the tone encouraging, professional, and highly actionable.
    `;

    const result = await askGroq(systemPrompt, `Resume Text:\n${resumeText}`);

    return res
      .status(200)
      .json(new ApiResponse(200, { feedback: result }, "Resume analyzed successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Cover Letter Generator
 * POST /api/ai/cover-letter
 */
export const generateCoverLetter = async (req, res, next) => {
  try {
    const { jobDescription, seekerProfile } = req.body;
    if (!jobDescription || !seekerProfile) {
      throw new ApiError(400, "Both Job Description and Seeker Profile/Resume are required.");
    }

    const systemPrompt = `
      You are an expert career writer. Write a premium, highly tailored cover letter based on the provided Job Description and Job Seeker profile.
      The cover letter must:
      - Highlight how the candidate's skills directly align with the requirements.
      - Have a professional, engaging opening and closing.
      - Mention localization details if appropriate.
      - Be fully formatted with placeholders for contact information.
      Do not include any conversational preamble or postscript in your response; return ONLY the cover letter.
    `;

    const userMessage = `
      Job Description:
      ${jobDescription}
      
      Candidate Profile:
      ${seekerProfile}
    `;

    const result = await askGroq(systemPrompt, userMessage);

    return res
      .status(200)
      .json(new ApiResponse(200, { coverLetter: result }, "Cover letter generated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Job Match Score & Gap Analyzer
 * POST /api/ai/match-score
 */
export const analyzeJobMatch = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      throw new ApiError(400, "Both Resume text and Job Description are required for match scoring.");
    }

    const systemPrompt = `
      You are an AI recruiter. Compare the candidate's resume with the job description.
      You must respond in a valid JSON format only. Do not include any markdown, markdown block wrapper, or explanation outside of the JSON object.
      The JSON structure MUST be exactly:
      {
        "matchPercentage": 75,
        "matchingSkills": ["Skill A", "Skill B"],
        "missingSkills": ["Skill C", "Skill D"],
        "criticalGapsExplanation": "Brief explanation of gaps...",
        "recommendations": ["Action item A", "Action item B"]
      }
      Analyze carefully and accurately.
    `;

    const userMessage = `
      Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
    `;

    const responseText = await askGroq(systemPrompt, userMessage);
    
    // Parse response
    let parsedResult;
    try {
      // Handle potential model output wrappers (e.g. ```json ... ```)
      const cleanJsonString = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsedResult = JSON.parse(cleanJsonString);
    } catch (e) {
      console.warn("Failed to parse JSON from Groq, falling back to regex extraction:", e);
      // Fallback fallback if JSON parse fails
      parsedResult = {
        matchPercentage: 50,
        matchingSkills: [],
        missingSkills: [],
        criticalGapsExplanation: "AI parsing error. Please review manually.",
        recommendations: []
      };
    }

    return res
      .status(200)
      .json(new ApiResponse(200, parsedResult, "Job match analysis complete."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Interview Preparation Generator
 * POST /api/ai/interview-prep
 */
export const generateInterviewPrep = async (req, res, next) => {
  try {
    const { jobRole, jobDescription } = req.body;
    if (!jobRole) {
      throw new ApiError(400, "Job role is required.");
    }

    const systemPrompt = `
      You are an elite interviewer. Generate 10 highly likely interview questions (5 technical, 5 behavioral) for a candidate applying for the given role.
      For each question:
      - Include the Question
      - Provide a "Why this is asked" insight
      - Provide a "Key points to include in your answer" tip
      Format the output in a clean, readable Markdown layout with clear headings. Include a concluding motivational note for the candidate.
    `;

    const userMessage = `
      Job Role: ${jobRole}
      ${jobDescription ? `Job Description:\n${jobDescription}` : ""}
    `;

    const result = await askGroq(systemPrompt, userMessage);

    return res
      .status(200)
      .json(new ApiResponse(200, { prepMaterial: result }, "Interview prep materials generated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Job Description (JD) Writer
 * POST /api/ai/write-jd
 * Private: Employer only
 */
export const writeJobDescription = async (req, res, next) => {
  try {
    const { jobTitle, companyName, keyRequirements } = req.body;
    if (!jobTitle) {
      throw new ApiError(400, "Job title is required to draft a job description.");
    }

    const systemPrompt = `
      You are an expert HR manager. Write a professional, attractive, and complete Job Description (JD) suitable for Pakistani job portals.
      Include sections:
      1. Job Overview
      2. Key Responsibilities
      3. Requirements & Qualifications (incorporating any user provided key requirements)
      4. Skills Needed (Technical & Soft Skills)
      5. Benefits & Perks
      Tone should be professional, clear, and represent the company values. Return the output in Markdown.
    `;

    const userMessage = `
      Job Title: ${jobTitle}
      Company: ${companyName || "Our Company"}
      Key requirements from employer: ${keyRequirements || "Standard requirements"}
    `;

    const result = await askGroq(systemPrompt, userMessage);

    return res
      .status(200)
      .json(new ApiResponse(200, { jobDescription: result }, "Job description draft generated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Skills Gap Analyzer
 * POST /api/ai/skills-gap
 */
export const analyzeSkillsGap = async (req, res, next) => {
  try {
    const { userSkills, targetIndustry } = req.body;
    if (!userSkills) {
      throw new ApiError(400, "User skills are required.");
    }

    const systemPrompt = `
      You are an IT industry career advisor in Pakistan.
      Analyze the candidate's skills against current market demands in the specified target industry (or general IT if unspecified).
      List:
      1. High-demand skills in Pakistan for this industry.
      2. The gaps in the candidate's current skillset.
      3. Learning path recommendation (free courses, certifications, projects they should build).
      Format the output in clean, encouraging Markdown.
    `;

    const userMessage = `
      Candidate Skills: ${Array.isArray(userSkills) ? userSkills.join(", ") : userSkills}
      Target Industry: ${targetIndustry || "General Information Technology"}
    `;

    const result = await askGroq(systemPrompt, userMessage);

    return res
      .status(200)
      .json(new ApiResponse(200, { skillsGapReport: result }, "Skills gap report generated successfully."));
  } catch (error) {
    next(error);
  }
};
