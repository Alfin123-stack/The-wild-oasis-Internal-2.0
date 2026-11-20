import { request } from "./request";

// Booking baru + pemulihan
export const createBooking = (payload) => request("/api/bookings", { method: "POST", json: payload });
export const restoreBooking = (id) => request(`/api/bookings/${id}/restore`, { method: "POST" });
export const getAvailableCabins = ({ start, end, guests }) =>
  request(`/api/cabins/available?start=${start}&end=${end}&guests=${guests || 1}`);

// Tamu
export const getGuests = (q = "") => request(`/api/guests?q=${encodeURIComponent(q)}`);
export const getGuest = (id) => request(`/api/guests/${id}`);
export const updateGuest = (id, json) => request(`/api/guests/${id}`, { method: "PATCH", json });

// Insight, aktivitas, pencarian
export const getInsights = (date) => request(`/api/insights?date=${date}`);
export const getActivity = ({ user, action, date } = {}) => {
  const p = new URLSearchParams();
  if (user) p.set("user", user);
  if (action) p.set("action", action);
  if (date) p.set("date", date);
  return request(`/api/activity?${p}`);
};
export const globalSearch = (q) => request(`/api/search?q=${encodeURIComponent(q)}`);

// User (admin)
export const updateUserAdmin = (id, json) => request(`/api/users/${id}`, { method: "PATCH", json });

// AI
export const getAiStatus = () => request("/api/ai/status");
export const askAi = (question, date) => request("/api/ai/ask", { method: "POST", json: { question, date } });
export const draftMessage = (json) => request("/api/ai/draft", { method: "POST", json });
export const getWeeklyReport = (date) => request(`/api/ai/report?date=${date}`);
export const getPriceSuggestions = (date) => request(`/api/ai/prices?date=${date}`);
