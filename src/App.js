import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./page/Home";
import LoginPage from "./login/LoginPage";
import { AuthProvider, useAuth } from "./login/AuthContext";
import Profile from "./page/Profile";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
