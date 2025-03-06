import axios from "axios";

// API URL
const API_URL = "http://localhost:5050/api/auth";

// Login Function
export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        const { token } = response.data;

        // Save token to localStorage or cookies
        localStorage.setItem("token", token);

        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

// Logout Function
export const logout = (): void => {
  localStorage.removeItem("token");
};

// Get Token
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
