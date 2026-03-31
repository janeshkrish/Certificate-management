import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api"
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong.") {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    fallbackMessage
  );
}

export async function loginRequest(credentials) {
  const { data } = await api.post("/login", credentials);
  return data;
}

export async function fetchProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function fetchDomains() {
  const { data } = await api.get("/domains");
  return data;
}

export async function createDomain(payload) {
  const { data } = await api.post("/domains", payload);
  return data;
}

export async function removeDomain(domainId) {
  await api.delete(`/domains/${domainId}`);
}

export async function fetchCertificates(params = {}) {
  const { data } = await api.get("/certificates", { params });
  return data;
}

export async function createCertificate(formData) {
  const { data } = await api.post("/certificates", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function updateCertificate(certificateId, formData) {
  const { data } = await api.put(`/certificates/${certificateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function removeCertificate(certificateId) {
  await api.delete(`/certificates/${certificateId}`);
}

export default api;

