import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error al cargar datos de usuario:', err);
      setError('Error al cargar datos de usuario');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      // Guardar en estado y localStorage
      setCurrentUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return currentUser?.cargo === 'ROLE_ADMIN';
  };

  // Valores que se proporcionarán a través del contexto
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;