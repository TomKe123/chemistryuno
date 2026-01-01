import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GameLobby.css';

const GameLobby = ({ onGameReady, playerName, setPlayerName }) => {
  const [activeTab, setActiveTab] = useState('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [qrcode, setQrcode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [gameReadyTriggered, setGameReadyTriggered] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(false);

  // 检查是否有未完成的游戏会话
  const checkExistingSession = async (name) => {
    if (!name || !name.trim()) return;
    
    setCheckingSession(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/player/${encodeURIComponent(name.trim())}/session`);
      if (response.data.hasSession) {
        setExistingSession(response.data.session);
      } else {
        setExistingSession(null);
      }
    } catch (err) {
      console.error('检查会话失败:', err);
      setExistingSession(null);
    } finally {
      setCheckingSession(false);
    }
  };

  // 当玩家名称改变时检查会话
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (playerName && playerName.trim()) {
        checkExistingSession(playerName.trim());
      } else {
        setExistingSession(null);
      }
    }, 500); // 延迟500ms避免频繁请求
    
    return () => clearTimeout(timeoutId);
  }, [playerName]);

  // 重新加入现有游戏
  const handleRejoinSession = () => {
    if (existingSession) {
      onGameReady(existingSession.roomCode, existingSession.playerId, false);
      setExistingSession(null);
    }
  };

  // 忽略现有会话
  const handleIgnoreSession = () => {
    setExistingSession(null);
  };

  // 获取房间列表
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data.rooms);
    } catch (err) {
      console.error('获取房间列表失败:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // 大厅标签页自动刷新房间列表
  useEffect(() => {
    if (activeTab === 'lobby') {
      fetchRooms();
      const interval = setInterval(fetchRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 快速加入房间
  const handleQuickJoin = async (targetRoomCode) => {
    if (!playerName.trim()) {
      setError('请先输入玩家名称');
      return;
    }
    setRoomCodeInput(targetRoomCode);
    await handleJoin(false, targetRoomCode);
  };

  // 创建房间
  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('请输入玩家名称');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/game/create', {
        playerName: playerName.trim()
      });
      
      setRoomCode(response.data.roomCode);
      setPlayerId(response.data.playerId);
      setGameState(response.data.gameState);
      setIsHost(true);
      setError('');
      
      console.log('创建房间返回的 gameState:', response.data.gameState);
      
      // 获取二维码
      const qrResponse = await axios.get(`http://localhost:5000/api/game/${response.data.roomCode}/qrcode`);
      setQrcode(qrResponse.data.qrcode);
      
    } catch (err) {
      setError(err.response?.data?.error || '创建房间失败');
    }
  };

  // 加入房间
  const handleJoin = async (asSpectator = false, targetRoom = null) => {
    if (!playerName.trim()) {
      setError('请输入玩家名称');
      return;
    }
    const roomToJoin = targetRoom || roomCodeInput.trim();
    if (!roomToJoin) {
      setError('请输入房间号');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/game/join', {
        roomCode: roomToJoin,
        playerName: playerName.trim(),
        asSpectator: asSpectator
      });
      
      setRoomCode(response.data.roomCode);
      setPlayerId(response.data.playerId);
      setGameState(response.data.gameState);
      setIsHost(false);
      setIsSpectator(response.data.isSpectator || false);
      setError('');
      
      // 如果游戏已开始，直接进入游戏
      if (response.data.gameState.gameStarted) {
        onGameReady(response.data.roomCode, response.data.playerId, playerName.trim(), response.data.isSpectator);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || '加入房间失败');
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    try {
      await axios.post(`http://localhost:5000/api/game/${roomCode}/start`, {
        playerId: playerId
      });
      
      // 不在这里调用 onGameReady，等轮询检测到 gameStarted 后再调用
      
    } catch (err) {
      setError(err.response?.data?.error || '开始游戏失败');
    }
  };

  // 轮询房间信息
  useEffect(() => {
    if (!roomCode) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/game/${roomCode}/info`);
        console.log('轮询返回的房间信息:', response.data.gameState || response.data);
        
        // 处理两种可能的返回格式
        const roomData = response.data.gameState || response.data;
        setGameState(roomData);
        
        // 如果游戏已开始，触发回调（仅触发一次）
        if (roomData.gameStarted && !gameReadyTriggered) {
          console.log('游戏已开始，准备进入游戏界面');
          setGameReadyTriggered(true);
          onGameReady(roomCode, playerId, playerName, isSpectator);
        }
      } catch (err) {
        console.error('轮询房间信息失败:', err);
        // 如果房间不存在（404），清理状态返回大厅
        if (err.response?.status === 404) {
          setRoomCode(null);
          setGameState(null);
          setPlayerId(null);
          setIsHost(false);
          setIsSpectator(false);
          setError('房间已关闭');
          setTimeout(() => setError(''), 3000);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomCode, playerId, playerName, isSpectator, onGameReady, gameReadyTriggered]);

  // 如果已在房间中，显示等待界面
  if (roomCode && gameState) {
    const playerCount = gameState.playerCount ?? gameState.players?.length ?? 0;
    const maxPlayers = gameState.maxPlayers ?? 12;
    const players = gameState.players ?? [];
    
    console.log('等待房间渲染 - playerCount:', playerCount, 'players:', players, 'isHost:', isHost);
    
    return (
      <div className="lobby-container">
        <div className="lobby-card waiting-room">
          <h1 className="lobby-title">⚗️ 化学UNO - 房间 {roomCode}</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="room-info">
            <div className="player-count">
              <h3>玩家列表 ({playerCount}/{maxPlayers})</h3>
              <div className="players-list">
                {players.map((player) => (
                  <div key={player.id} className="player-item">
                    <span className="player-name">{player.name}</span>
                    {player.isHost && <span className="host-badge">房主</span>}
                  </div>
                ))}
              </div>
            </div>
            
            {gameState.spectators && gameState.spectators.length > 0 && (
              <div className="spectator-count">
                <h3>观战者 ({gameState.spectators.length})</h3>
                <div className="spectators-list">
                  {gameState.spectators.map((spectator) => (
                    <div key={spectator.id} className="spectator-item">
                      <span className="spectator-icon">👁️</span>
                      <span className="spectator-name">{spectator.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isSpectator && (
              <div className="spectator-notice">
                <p>你正在以观战者身份观看游戏</p>
              </div>
            )}
            
            {isHost && qrcode && (
              <div className="qrcode-section">
                <h3>扫码加入</h3>
                <img src={qrcode} alt="房间二维码" className="qrcode-image" />
                <p className="join-url">或输入房间号：{roomCode}</p>
              </div>
            )}
            
            {!isHost && !isSpectator && (
              <div className="waiting-message">
                <p>等待房主开始游戏...</p>
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {isHost && (
              <div className="host-controls">
                <p className="info-text">至少需要2名玩家才能开始游戏（当前: {playerCount}人）</p>
                <button 
                  className="start-btn" 
                  onClick={handleStartGame}
                  disabled={playerCount < 2}
                >
                  开始游戏
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 初始大厅界面
  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">⚗️ 化学UNO</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 显示未完成的游戏会话提示 */}
        {existingSession && (
          <div className="session-alert">
            <div className="session-alert-header">
              <span className="session-icon">🎮</span>
              <strong>检测到未完成的游戏</strong>
            </div>
            <div className="session-alert-content">
              <p>房间号: <strong>{existingSession.roomCode}</strong></p>
              <p>状态: {existingSession.isOffline ? '离线中' : '在线'}</p>
              <p>游戏{existingSession.gameStarted ? '进行中' : '准备中'}</p>
            </div>
            <div className="session-alert-actions">
              <button className="rejoin-btn" onClick={handleRejoinSession}>
                重新加入
              </button>
              <button className="ignore-btn" onClick={handleIgnoreSession}>
                创建新游戏
              </button>
            </div>
          </div>
        )}
        
        <div className="player-input-section">
          <input
            type="text"
            placeholder="输入你的玩家名称"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="player-name-input"
            maxLength="20"
          />
          {checkingSession && <span className="checking-session">检查会话中...</span>}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'lobby' ? 'active' : ''}`}
            onClick={() => setActiveTab('lobby')}
          >
            🏠 大厅
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            创建房间
          </button>
          <button
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            加入房间
          </button>
        </div>

        {activeTab === 'lobby' && (
          <div className="tab-content lobby-content">
            <div className="lobby-header">
              <h3>在线房间</h3>
              <button className="refresh-btn" onClick={fetchRooms} disabled={loadingRooms}>
                {loadingRooms ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>
            
            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>暂无房间</p>
                <p className="hint">创建一个房间开始游戏吧！</p>
              </div>
            ) : (
              <div className="rooms-list">
                {rooms.map((room) => (
                  <div key={room.roomCode} className="room-card">
                    <div className="room-header">
                      <span className="room-code">#{room.roomCode}</span>
                      <span className={`room-status ${room.gameStarted ? 'playing' : 'waiting'}`}>
                        {room.gameStarted ? '🎮 进行中' : '⏳ 等待中'}
                      </span>
                    </div>
                    <div className="room-details">
                      <div className="room-info-item">
                        <span className="label">房主:</span>
                        <span className="value">{room.hostName}</span>
                      </div>
                      <div className="room-info-item">
                        <span className="label">玩家:</span>
                        <span className="value">{room.playerCount}/{room.maxPlayers}</span>
                      </div>
                      {room.spectatorCount > 0 && (
                        <div className="room-info-item">
                          <span className="label">观战:</span>
                          <span className="value">👁️ {room.spectatorCount}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className={`quick-join-btn ${room.gameStarted ? 'spectate' : 'join'}`}
                      onClick={() => handleQuickJoin(room.roomCode)}
                    >
                      {room.gameStarted ? '观战' : room.playerCount >= room.maxPlayers ? '观战' : '加入'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="tab-content">
            <div className="rules-box">
              <h3>游戏规则</h3>
              <ul>
                <li>支持 2-12 人游戏</li>
                <li>初始每人10张牌</li>
                <li>每2人增加一组牌堆</li>
                <li>打出物质必须与上一个物质能反应</li>
                <li>无法打出则摸2张牌</li>
                <li>特殊卡牌：He/Ne/Ar/Kr反转方向，Au跳过，+2/+4额外摸牌</li>
              </ul>
            </div>

            <button className="create-btn" onClick={handleCreate}>
              创建房间
            </button>
          </div>
        )}

        {activeTab === 'join' && (
          <div className="tab-content">
            <div className="input-group">
              <label>房间号：</label>
              <input
                type="text"
                placeholder="输入6位房间号"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="text-input"
                maxLength="6"
              />
            </div>

            <div className="join-buttons">
              <button className="join-btn" onClick={() => handleJoin(false)}>
                加入游戏
              </button>
              <button className="spectate-btn" onClick={() => handleJoin(true)}>
                观战
              </button>
            </div>
            
            <div className="info-box">
              <p>💡 <strong>提示：</strong></p>
              <p>• 游戏开始前可以作为玩家加入</p>
              <p>• 游戏开始后只能以观战者身份观看</p>
              <p>• 房间满员时也可选择观战</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
