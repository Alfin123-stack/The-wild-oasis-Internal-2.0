import { request } from "./request";

export async function getBookings({ status, sortBy, page, q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (sortBy) params.set("sortBy", sortBy);
  if (page) params.set("page", page);
  return request(`/api/bookings?${params}`); // { bookings, count }
}

export async function getBooking(id) {
  return request(`/api/bookings/${id}`);
}

// Booking yang DIBUAT sejak `date` (30 hari terakhir, dsb).
export async function getBookingsAfterDate(date) {
  return request(`/api/bookings/range?kind=bookings&date=${encodeURIComponent(date)}`);
}

// Booking yang DIMULAI sejak `date`.
export async function getStaysAfterDate(date) {
  return request(`/api/bookings/range?kind=stays&date=${encodeURIComponent(date)}`);
}

// Booking yang beririsan dengan jendela [from, to] (timeline, cabin status, in-house).
export async function getTimelineBookings(from, to) {
  return request(
    `/api/bookings/range?kind=timeline&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

// Aktivitas = ada check-in atau check-out hari ini.
export async function getStaysTodayActivity(date) {
  return request(`/api/bookings/today${date ? `?date=${encodeURIComponent(date)}` : ""}`);
}

export async function updateBooking(id, obj) {
  return request(`/api/bookings/${id}`, { method: "PATCH", json: obj });
}

export async function deleteBooking(id) {
  return request(`/api/bookings/${id}`, { method: "DELETE" });
}
