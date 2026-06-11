import { askAI } from "../services/ai.service.js";
import { analyzeJobMatchWithFallback, buildResumeContext } from "../services/resume.service.js";
import { normalizeSkills } from "../utils/skillNormalizer.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * AI Resume Reviewer
 * POST /api/ai/review-resume
 */
export const reviewResume = async (req, res, next) => {
  try {
    let { resumeText } = req.body;

    if (!resumeText) {
      const user = await User.findById(req.user._id);
      resumeText = buildResumeContext(user);
    }

    if (!resumeText) {
      throw new ApiError(400, "Resume text is required. Upload a PDF resume or paste text.");
    }

    const systemPrompt = `
      You are an expert ATS recruiter and career coach in Pakistan.
      Review the provided resume and give detailed professional feedback in Markdown:
      1. Overall Score (out of 100)
      2. Strengths
      3. Key Weaknesses & Missing Details
      4. ATS Compatibility Suggestions
      5. Practical recommendations for the Pakistani market.
    `;

    const result = await askAI(systemPrompt, `Resume Text:\n${resumeText}`);

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
    if (!jobDescription) {
      throw new ApiError(400, "Job Description is required.");
    }

    let profileText = seekerProfile;
    if (!profileText) {
      const user = await User.findById(req.user._id);
      profileText = buildResumeContext(user);
    }

    if (!profileText) {
      throw new ApiError(400, "Seeker profile or resume is required.");
    }

    const systemPrompt = `
      Write a premium, tailored cover letter for the Pakistani job market.
      Return ONLY the cover letter — no preamble.
    `;

    const result = await askAI(
      systemPrompt,
      `Job Description:\n${jobDescription}\n\nCandidate Profile:\n${profileText}`
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { coverLetter: result }, "Cover letter generated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Job Match Score with rule-based fallback
 * POST /api/ai/match-score
 */
export const analyzeJobMatch = async (req, res, next) => {
  try {
    let { resumeText, jobDescription } = req.body;

    if (!jobDescription) {
      throw new ApiError(400, "Job Description is required for match scoring.");
    }

    const user = await User.findById(req.user._id);
    const userSkills = user?.profile?.skills || [];

    if (!resumeText) {
      resumeText = buildResumeContext(user);
    }

    if (!resumeText) {
      throw new ApiError(400, "Resume text or profile data is required. Upload a PDF resume first.");
    }

    const parsedResult = await analyzeJobMatchWithFallback(
      resumeText,
      jobDescription,
      userSkills
    );

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
      Generate 10 interview questions (5 technical, 5 behavioral) for the given role.
      Format in clean Markdown with question, why it's asked, and answer tips.
    `;

    const result = await askAI(
      systemPrompt,
      `Job Role: ${jobRole}\n${jobDescription ? `Job Description:\n${jobDescription}` : ""}`
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { prepMaterial: result }, "Interview prep materials generated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * AI Job Description Writer
 * POST /api/ai/write-jd
 */
export const writeJobDescription = async (req, res, next) => {
  try {
    const { jobTitle, companyName, keyRequirements } = req.body;
    if (!jobTitle) {
      throw new ApiError(400, "Job title is required.");
    }

    const systemPrompt = `
      Write a professional Job Description for Pakistani job portals in Markdown.
      Include: Overview, Responsibilities, Requirements, Skills, Benefits.
    `;

    const result = await askAI(
      systemPrompt,
      `Job Title: ${jobTitle}\nCompany: ${companyName || "Our Company"}\nRequirements: ${keyRequirements || "Standard"}`
    );

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
    let { userSkills, targetIndustry } = req.body;

    if (!userSkills) {
      const user = await User.findById(req.user._id);
      userSkills = [
        ...(user?.profile?.skills || []),
        ...(user?.profile?.parsedResume?.skills || []),
      ];
    }

    if (!userSkills || (Array.isArray(userSkills) && userSkills.length === 0)) {
      throw new ApiError(400, "User skills are required. Upload a resume or add skills to your profile.");
    }

    const skillsStr = Array.isArray(userSkills)
      ? normalizeSkills(userSkills).join(", ")
      : userSkills;

    const systemPrompt = `
      Analyze skills against Pakistani market demands. Format in encouraging Markdown.
      Cover: high-demand skills, gaps, and learning path recommendations.
    `;

    const result = await askAI(
      systemPrompt,
      `Candidate Skills: ${skillsStr}\nTarget Industry: ${targetIndustry || "General IT"}`
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { skillsGapReport: result }, "Skills gap report generated successfully."));
  } catch (error) {
    next(error);
  }
};
