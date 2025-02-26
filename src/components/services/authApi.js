// services/authService.js
import api from "../../store/axios";

export const loginUser = async (formData) => {
  return api.post("/api/auth/login", formData);
};

export const registerUser = async (formData) => {
  return api.post("/api/auth/register", formData);
};
