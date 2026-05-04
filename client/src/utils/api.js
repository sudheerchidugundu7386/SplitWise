import axios from "axios";

/**
 * Axios instance — in dev, Vite proxies /api to localhost:5000.
 * In production, set VITE_API_URL to the backend URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ── Auth APIs ──────────────────────────────────────────────

export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (data) => api.post("/api/auth/login", data);
export const getMe = () => api.get("/api/auth/me");
export const getUserProfile = () => api.get("/api/auth/profile");

// ── Group APIs ─────────────────────────────────────────────

export const createGroup = (data) => api.post("/api/groups", data);

export const getGroup = (groupId) => api.get(`/api/groups/${groupId}`);
export const addMember = (groupId, data) => api.post(`/api/groups/${groupId}/members`, data);
export const syncMemberExpenses = (groupId, memberName) => 
  api.put(`/api/groups/${groupId}/members/${encodeURIComponent(memberName)}/sync`);

export const updateMemberUpi = (groupId, memberName, upiId) =>
  api.put(`/api/groups/${groupId}/members/${encodeURIComponent(memberName)}/upi`, { upiId });

// ── Expense APIs ───────────────────────────────────────────

export const addExpense = (groupId, data) =>
  api.post(`/api/groups/${groupId}/expenses`, data);

export const getExpenses = (groupId) =>
  api.get(`/api/groups/${groupId}/expenses`);

export const deleteExpense = (expenseId) =>
  api.delete(`/api/expenses/${expenseId}`);

// ── Balance APIs ───────────────────────────────────────────

export const getBalances = (groupId) =>
  api.get(`/api/groups/${groupId}/balances`);

export const settlePayment = (groupId, data) =>
  api.post(`/api/groups/${groupId}/settle`, data);

export default api;
