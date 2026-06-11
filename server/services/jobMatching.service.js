import Job from "../models/Job.js";
import { normalizeSkills, findMatchingSkills, skillsMatch } from "../utils/skillNormalizer.js";

/**
 * Rule-based skill match score between user skills and job requirements.
 */
export const calculateRuleBasedMatch = (userSkills, jobSkillsRequired) => {
  const normalizedUser = normalizeSkills(userSkills);
  const normalizedJob = normalizeSkills(jobSkillsRequired);

  if (normalizedJob.length === 0) {
    return {
      matchPercentage: normalizedUser.length > 0 ? 60 : 0,
      matchingSkills: [],
      missingSkills: [],
      criticalGapsExplanation: "This job has no listed skill requirements.",
      recommendations: normalizedUser.length > 0
        ? ["Your profile skills may still be relevant — review the full description."]
        : ["Add skills to your profile to improve matching."],
      source: "rule-based",
    };
  }

  const matchingSkills = findMatchingSkills(normalizedUser, normalizedJob);
  const missingSkills = normalizedJob.filter(
    (jobSkill) => !normalizedUser.some((userSkill) => skillsMatch(userSkill, jobSkill))
  );

  const matchPercentage = Math.round((matchingSkills.length / normalizedJob.length) * 100);

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    criticalGapsExplanation:
      missingSkills.length > 0
        ? `You are missing ${missingSkills.length} of ${normalizedJob.length} required skills.`
        : "Your skills align well with this job's requirements.",
    recommendations:
      missingSkills.length > 0
        ? missingSkills.slice(0, 3).map((s) => `Consider learning or highlighting: ${s}`)
        : ["Great match! Tailor your cover letter to highlight your matching skills."],
    source: "rule-based",
  };
};

/**
 * Find active jobs that match a user's skills, sorted by match score.
 */
export const findJobsForUser = async (userSkills, options = {}) => {
  const { page = 1, limit = 10, city, category } = options;
  const normalizedUserSkills = normalizeSkills(userSkills);

  const query = { status: "active" };
  if (city) query["location.city"] = { $regex: new RegExp(city, "i") };
  if (category && category !== "All") query.category = category;

  const allJobs = await Job.find(query)
    .populate("company", "name logo city industry size")
    .sort({ createdAt: -1 });

  const scored = allJobs
    .map((job) => {
      const match = calculateRuleBasedMatch(normalizedUserSkills, job.skillsRequired || []);
      return {
        job: job.toObject(),
        matchScore: match.matchPercentage,
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
      };
    })
    .filter((item) => item.matchScore > 0 || normalizedUserSkills.length === 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  const skip = (Number(page) - 1) * Number(limit);
  const paginated = scored.slice(skip, skip + Number(limit));

  return {
    jobs: paginated,
    pagination: {
      totalJobs: scored.length,
      totalPages: Math.ceil(scored.length / Number(limit)) || 1,
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};
