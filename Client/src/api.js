import axios from "axios";

/**
 * Single source of truth for the backend origin.
 * Set VITE_API_URL in production; localhost is the safe development default.
 */
const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
});

/** Resolve an uploaded file path returned by the API into a full URL. */
export const fileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/** Initials used by avatars when no profile photo is available. */
export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CC";

export default BASE_URL;
