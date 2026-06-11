import API from "./api";

export const getMyCompany = async () => {
  const response = await API.get("/companies/my");
  return response.data;
};

export const updateMyCompany = async (formData) => {
  const response = await API.put("/companies/my", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await API.get(`/companies/${id}`);
  return response.data;
};
