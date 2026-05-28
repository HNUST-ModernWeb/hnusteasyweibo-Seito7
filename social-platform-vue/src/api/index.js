import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：自动附加 JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sharehub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || "Network error";
    if (err.response?.status === 401) {
      localStorage.removeItem("sharehub_token");
      localStorage.removeItem("sharehub_user");
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;