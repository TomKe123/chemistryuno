import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onSuccess, expectedPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expectedPassword) {
      setError('未配置管理员密码，请设置 REACT_APP_ADMIN');
      return;
    }
    if (password === expectedPassword) {
      setError('');
      onSuccess();
    } else {
      setError('密码错误');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>管理后台登录</h1>
        <p className="login-subtitle">请输入管理员密码以进入配置后台</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit">进入后台</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
