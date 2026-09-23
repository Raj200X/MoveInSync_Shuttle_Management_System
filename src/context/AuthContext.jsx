import { createContext, useContext, useState, useCallback } from 'react';
import usersData from '../mock/users.json';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mock registration store
  const [localUsers, setLocalUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sms_local_users')) || [];
    } catch { return []; }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = useCallback((email, password) => {
    const allUsers = [...usersData, ...localUsers];
    const found = allUsers.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = found;
    localStorage.setItem('sms_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }, [localUsers]);

  const register = useCallback((name, email, password, role) => {
    const allUsers = [...usersData, ...localUsers];
    if (allUsers.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    const newUser = { id: `u${Date.now()}`, name, email, password, role };
    const updatedUsers = [...localUsers, newUser];
    
    setLocalUsers(updatedUsers);
    localStorage.setItem('sms_local_users', JSON.stringify(updatedUsers));
    
    // Auto-login after register
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('sms_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }, [localUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem('sms_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
