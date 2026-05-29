import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext(null);

export const AuthProviderContent = ({ children, navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    navigate("/", { replace: true });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const data = await authService.verify();

        if (data?.authenticated || data?.valid) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // 401 desde apiFetch lanza un error — sesión inválida o expirada
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  return (
    <AuthProviderContent navigate={navigate}>{children}</AuthProviderContent>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
