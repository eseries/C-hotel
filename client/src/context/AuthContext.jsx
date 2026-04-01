import { createContext, useContext, useMemo, useState } from 'react';
import { loginApi, logoutApi, changePasswordApi } from '../api/authApi';
import { decodeJwtPayload } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved);

    const token = localStorage.getItem('token');
    const payload = decodeJwtPayload(token);
    return payload
      ? {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          hotelId: payload.hotelId
        }
      : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginApi(credentials);
      const nextToken = data.data.token;
      const payload = decodeJwtPayload(nextToken);
      const nextUser = {
        ...data.data.user,
        id: payload?.id || data.data.user?.id,
        email: payload?.email || data.data.user?.email,
        role: payload?.role || data.data.user?.role,
        hotelId: payload?.hotelId ?? data.data.user?.hotelId
      };

      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (_error) {
      // Ignore API logout errors.
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (payload) => {
    try {
      await changePasswordApi(payload);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Unable to change password' };
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(token), login, logout, changePassword }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
