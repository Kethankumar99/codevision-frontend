import axios from 'axios';

let authToken = null;

export const setToken = (token) => { authToken = token; };

const API = axios.create({ 
  baseURL: 'https://codevision-backend-production-68c7.up.railway.app/api',
  timeout: 30000
});

API.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const loginUser = (email, password) => API.post('/auth/login', { email, password });
export const registerUser = (data) => API.post('/auth/register', data);
export const uploadZip = (file) => { const fd = new FormData(); fd.append('file', file); return API.post('/projects/upload', fd, { timeout: 120000 }); };
export const uploadGitHub = (gitUrl) => API.post('/projects/upload-github', null, { params: { gitUrl } });
export const detectLanguage = (id) => API.post(`/projects/${id}/detect-language`);
export const extractApis = (id) => API.post(`/projects/${id}/extract-apis`);
export const mapFlows = (id) => API.post(`/projects/${id}/map-flows`);
export const getFiles = (id) => API.get(`/projects/${id}/files`);
export const getFileContent = (projectId, filePath) => API.get(`/projects/${projectId}/file-content`, { params: { path: filePath } });

export default API;