import API from "./api";

export const getJobs = async (params = {}) => {
  const response = await API.get("/jobs", { params });
  return response.data; // contains jobs array and pagination details
};

export const getJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await API.post("/jobs", jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await API.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await API.delete(`/jobs/${id}`);
  return response.data;
};

export const getMyListings = async () => {
  const response = await API.get("/jobs/my/listings");
  return response.data;
};

export const saveOrUnsaveJob = async (id) => {
  const response = await API.post(`/jobs/${id}/save`);
  return response.data; // { saved: true/false }
};

export const getMatchedJobs = async (params = {}) => {
  const response = await API.get("/jobs/matched", { params });
  return response.data;
};
