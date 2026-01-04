import React, { useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onSuccess: () => void;
  expectedPassword: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, expectedPassword }) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // 从localStorage读取密码作为备选
    const storedPassword = localStorage.getItem('adminPassword') || '';
    const actualPassword = expectedPassword || storedPassword;
    
    if (!actualPassword) {
      setError('未配置管理员密码，请返回 /setup 页面设置');
      return;
    }
    if (password === actualPassword) {
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
