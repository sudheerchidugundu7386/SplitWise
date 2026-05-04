import { createContext, useState, useEffect, useContext } from "react";
import { getMe, setAuthToken } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        try {
          const { data } = await getMe();
          setUser(data);
        } catch (error) {
          console.error("Auth failed on load:", error);
          localStorage.removeItem("token");
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginContext = (userData, token) => {
    localStorage.setItem("token", token);
    setAuthToken(token);
    setUser(userData);
  };

  const logoutContext = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login: loginContext, logout: logoutContext }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
