import { create } from "zustand";
import API from "../services/api";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Set auth state from external source (like Google OAuth callback token)
  setToken: (token) => {
    localStorage.setItem("token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },

  // Check if user session is valid on application boot
  checkAuth: async () => {
    const token = get().token;
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    set({ isLoading: true, error: null });
    try {
      // Fetch profile from server
      const response = await API.get("/auth/me");
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err) {
      console.warn("Session check failed, clearing token:", err.message);
      localStorage.removeItem("token");
      delete API.defaults.headers.common["Authorization"];
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Email and Password Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post("/auth/login", { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Register user
  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post("/auth/register", { name, email, password, role });
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Update profile data in local state
  updateProfileState: (updatedUser) => {
    set({ user: updatedUser });
  },

  // Logout session
  logout: async () => {
    set({ isLoading: true });
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed, clearing local state anyway:", err);
    } finally {
      localStorage.removeItem("token");
      delete API.defaults.headers.common["Authorization"];
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    }
  }
}));

export default useAuthStore;
export { useAuthStore };
