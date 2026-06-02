import API from "./api";

export const reviewResumeText = async (resumeText) => {
  const response = await API.post("/ai/review-resume", { resumeText });
  return response.data;
};

export const generateCoverLetterText = async (jobDescription, seekerProfile) => {
  const response = await API.post("/ai/cover-letter", { jobDescription, seekerProfile });
  return response.data;
};

export const analyzeJobMatchPercent = async (resumeText, jobDescription) => {
  const response = await API.post("/ai/match-score", { resumeText, jobDescription });
  return response.data;
};

export const generatePrepMaterials = async (jobRole, jobDescription) => {
  const response = await API.post("/ai/interview-prep", { jobRole, jobDescription });
  return response.data;
};

export const writeJobDescriptionDraft = async (jobTitle, companyName, keyRequirements) => {
  const response = await API.post("/ai/write-jd", { jobTitle, companyName, keyRequirements });
  return response.data;
};

export const analyzeSkillsGapReport = async (userSkills, targetIndustry) => {
  const response = await API.post("/ai/skills-gap", { userSkills, targetIndustry });
  return response.data;
};
