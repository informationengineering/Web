import React, { useState } from 'react';
import { useAuth } from './login';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(account, password);
      setError("");
      navigate("/");
    } catch (err) {
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
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
          autoComplete="account"
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
}
