import React, { useState } from 'react';
import './GameLobby.css';

const GameLobby = ({ onCreateGame, onJoinGame, playerName, setPlayerName }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [playerCount, setPlayerCount] = useState(2);
  const [gameIdInput, setGameIdInput] = useState('');
  const [playerIdInput, setPlayerIdInput] = useState('0');

  const handleCreate = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }
    onCreateGame(playerCount);
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }
    if (!gameIdInput.trim()) {
      alert('请输入游戏ID');
      return;
    }
    onJoinGame(gameIdInput, parseInt(playerIdInput), playerName);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">⚗️ 化学UNO</h1>
        
        <div className="player-input-section">
          <input
            type="text"
            placeholder="输入你的玩家名称"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="player-name-input"
            maxLength="20"
          />
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            创建游戏
          </button>
          <button
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            加入游戏
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="tab-content">
            <div className="input-group">
              <label>选择玩家数量：</label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                className="select-input"
              >
                <option value={2}>2人游戏</option>
                <option value={3}>3人游戏</option>
                <option value={4}>4人游戏</option>
              </select>
            </div>

            <div className="rules-box">
              <h3>游戏规则</h3>
              <ul>
                <li>初始每人10张牌</li>
                <li>打出物质必须与上一个物质能反应</li>
                <li>无法打出则摸2张牌</li>
                <li>特殊卡牌：He/Ne/Ar/Kr反转方向，Au跳过，+2/+4额外摸牌</li>
              </ul>
            </div>

            <button className="create-btn" onClick={handleCreate}>
              创建游戏
            </button>
          </div>
        )}

        {activeTab === 'join' && (
          <div className="tab-content">
            <div className="input-group">
              <label>游戏ID：</label>
              <input
                type="text"
                placeholder="输入游戏ID"
                value={gameIdInput}
                onChange={(e) => setGameIdInput(e.target.value)}
                className="text-input"
              />
            </div>

            <div className="input-group">
              <label>你的玩家ID (0-3)：</label>
              <input
                type="number"
                min="0"
                max="3"
                value={playerIdInput}
                onChange={(e) => setPlayerIdInput(e.target.value)}
                className="text-input"
              />
            </div>

            <button className="join-btn" onClick={handleJoin}>
              加入游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
