import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null 代表未登入

  const login = (username, password) => {
    // 模擬一組固定帳號
    if (username === "user1" && password === "1234") {
      setUser({ username });
      return true;
    }
    return false;
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

// 給其他地方使用登入資訊
export function useAuth() {
  return useContext(AuthContext);
}
