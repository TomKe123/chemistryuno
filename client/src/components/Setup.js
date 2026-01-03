import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Setup.css';
import API_ENDPOINTS from '../config/api';

const Setup = ({ onComplete }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const validatePassword = () => {
    if (!adminPassword) {
      setError('请输入管理员密码');
      return false;
    }
    if (adminPassword.length < 6) {
      setError('密码长度至少6位');
      return false;
    }
    if (adminPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.setup, {
        adminPassword: adminPassword
      });

      if (response.data.success) {
        setStep(2);
        // 3秒后刷新页面，让新的环境变量生效
        setTimeout(() => {
          window.location.href = '/admin';
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || '保存失败，请重试');
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="setup-container">
        <div className="setup-card success">
          <div className="success-icon">✓</div>
          <h1>设置完成！</h1>
          <p>管理员密码已保存</p>
          <p className="redirect-hint">正在跳转到管理面板...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>⚗️ 化学UNO 初始化设置</h1>
          <p className="setup-subtitle">欢迎！请设置管理员密码以继续</p>
        </div>

        <div className="setup-info">
          <div className="info-item">
            <span className="info-icon">🔐</span>
            <div>
              <strong>管理员密码</strong>
              <p>用于访问 /admin 管理面板，可以修改游戏配置和化学反应规则</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">⚙️</span>
            <div>
              <strong>安全提示</strong>
              <p>请设置一个强密码，建议至少8位，包含字母和数字</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="adminPassword">管理员密码</label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="请输入管理员密码（至少6位）"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="setup-button" disabled={loading}>
            {loading ? '正在保存...' : '完成设置'}
          </button>
        </form>

        <div className="setup-footer">
          <p>💡 提示：设置完成后可以在管理面板中修改密码</p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
