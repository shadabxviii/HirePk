import API from "./api";

export const applyToJob = async (applicationData) => {
  const response = await API.post("/applications", applicationData);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await API.get("/applications/my");
  return response.data;
};

export const getApplicantsForJob = async (jobId) => {
  const response = await API.get(`/applications/job/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await API.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
};
