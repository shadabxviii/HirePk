import API from "./api";

/**
 * Fetch system-wide analytics for admin
 */
export const getAdminAnalytics = async () => {
  const response = await API.get("/admin/analytics");
  return response.data;
};

/**
 * Fetch all registered users
 */
export const getAdminUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

/**
 * Delete a user by ID
 */
export const deleteAdminUser = async (userId) => {
  const response = await API.delete(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Fetch all applications
 */
export const getAdminApplications = async () => {
  const response = await API.get("/admin/applications");
  return response.data;
};

/**
 * Fetch all posted jobs
 */
export const getAdminJobs = async () => {
  const response = await API.get("/admin/jobs");
  return response.data;
};

/**
 * Update job listing status (approve, reject, close)
 */
export const updateAdminJobStatus = async (jobId, status) => {
  const response = await API.patch(`/admin/jobs/${jobId}/status`, { status });
  return response.data;
};

/**
 * Delete a job listing by ID
 */
export const deleteAdminJob = async (jobId) => {
  const response = await API.delete(`/admin/jobs/${jobId}`);
  return response.data;
};
