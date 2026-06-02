import API from "./api";

export const getProfile = async () => {
  const response = await API.get("/users/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.put("/users/profile", profileData);
  return response.data;
};

export const getSavedJobs = async () => {
  const response = await API.get("/users/saved-jobs");
  return response.data;
};

export const uploadResumeFile = async (formData) => {
  const response = await API.post("/users/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const uploadAudioPitchFile = async (formData) => {
  const response = await API.post("/users/upload-pitch", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};
