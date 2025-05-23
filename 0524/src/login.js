import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true
};

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false
      };
    case "LOGOUT":
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 清除所有相關的 localStorage 資料
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('favorites_') || 
            key.startsWith('unread_') || 
            key.startsWith('chat_')) {
          localStorage.removeItem(key);
        }
      });
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false
      };
    case "UPDATE_USER":
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // 初始化時檢查 localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: "LOGIN",
          payload: { user: parsedUser, token }
        });
      } catch (error) {
        console.error('解析用戶資料錯誤:', error);
        dispatch({ type: "LOGOUT" });
      }
    }
    
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  // API 請求函數（包含 token）
  const apiRequest = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`http://localhost:3002${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      dispatch({ type: "LOGOUT" });
      throw new Error('登入已過期，請重新登入');
    }

    return response;
  };

  const login = async (account, password) => {
    try {
      const response = await fetch('http://localhost:3002/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登入失敗');
      }

      const data = await response.json();
      dispatch({ type: "LOGIN", payload: data });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    login,
    logout,
    updateUser,
    apiRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
};


/*import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // 引入你的登入樣式

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("登入錯誤:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 內使用");
  }
  return context;
}

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      setError("");
      navigate("/");
    } else {
      setError("帳號或密碼錯誤");
    }
  };

  return (
    <div className="login-container">
      <h2>登入</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="帳號"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="密碼"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="login-button">
          登入
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}*/