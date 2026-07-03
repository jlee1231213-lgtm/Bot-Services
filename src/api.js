

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token automatically if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -----------------------------
   GUILD SETTINGS
------------------------------*/
export const getGuildSettings = (id) => API.get(`/guild/${id}/settings`);

export const updateGuildSettings = (id, data) =>
  API.post(`/guild/${id}/settings`, data);

/* -----------------------------
   PREMIUM SYSTEM
------------------------------*/
export const getPremium = (id) => API.get(`/guild/${id}/premium`);

export const enablePremium = (id, data) =>
  API.post(`/guild/${id}/premium/enable`, data);

export const disablePremium = (id) =>
  API.post(`/guild/${id}/premium/disable`);

/* -----------------------------
   BOT REQUESTS
------------------------------*/
export const createBotRequest = (data) =>
  API.post(`/bot/request`, data);

export const getBotRequests = () => API.get(`/bot/requests`);

/* -----------------------------
   SESSIONS
------------------------------*/
export const createSession = (id, data) =>
  API.post(`/session/${id}`, data);

export const getSession = (id) => API.get(`/session/${id}`);

export const deleteSession = (id) => API.delete(`/session/${id}`);