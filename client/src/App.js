import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import './App.css';

const App = () => {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const adminPassword = process.env.REACT_APP_ADMIN || '';
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem('adminAuthed') === 'true');

  useEffect(() => {
    sessionStorage.setItem('adminAuthed', adminAuthed ? 'true' : 'false');
  }, [adminAuthed]);

  if (isAdminRoute) {
    return adminAuthed ? (
      <AdminPanel />
    ) : (
      <AdminLogin
        expectedPassword={adminPassword}
        onSuccess={() => setAdminAuthed(true)}
      />
    );
  }

  return <GameApp />;
};

const GameApp = () => {
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [socket, setSocket] = useState(null);
  // 从 sessionStorage 加载昵称（页面关闭时自动清除）
  const [playerName, setPlayerName] = useState(() => {
    return sessionStorage.getItem('playerName') || '';
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [gameWinner, setGameWinner] = useState(null);

  // 保存昵称到 sessionStorage
  useEffect(() => {
    if (playerName) {
      sessionStorage.setItem('playerName', playerName);
    } else {
      sessionStorage.removeItem('playerName');
    }
  }, [playerName]);

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('已连接到服务器');
    });

    newSocket.on('playerJoined', (data) => {
      console.log(`${data.playerName} 加入了房间`);
    });

    newSocket.on('gameStarted', (data) => {
      setGameState(data.gameState);
      setGameStarted(true);
    });

    newSocket.on('gameStateUpdate', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('gameOver', (data) => {
      if (data.reason === 'notEnoughPlayers') {
        alert(data.message);
        setGameStarted(false);
        setGameState(null);
        setRoomCode(null);
      } else {
        // 显示胜利结算页面
        setGameWinner({
          playerName: data.playerName,
          playerId: data.winner,
          finalScore: data.finalScore,
          gameTime: data.gameTime || 0
        });
      }
    });

    newSocket.on('roomClosed', (data) => {
      alert(data.message + ' - 3秒后返回大厅');
      // 3秒后重置所有状态，返回大厅
      setTimeout(() => {
        setGameStarted(false);
        setGameState(null);
        setRoomCode(null);
        setPlayerId(null);
        setIsSpectator(false);
        setGameWinner(null);
      }, 3000);
    });

    newSocket.on('playerLeft', (data) => {
      console.log(`${data.playerName} 离开了房间`);
    });

    newSocket.on('error', (message) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleGameReady = (room, pid, name, spectator = false) => {
    setRoomCode(room);
    setPlayerId(pid);
    setPlayerName(name);
    setIsSpectator(spectator);
    setGameStarted(true);

    // 更新URL显示房间号
    window.history.pushState(null, '', `?room=${room}&player=${pid}`);

    if (socket) {
      socket.emit('joinRoom', {
        roomCode: room,
        playerId: pid,
        playerName: name,
        isSpectator: spectator
      });
    }
  };

  return (
    <div className="app">
      {error && <div className="error-message">{error}</div>}

      {gameWinner ? (
        <div className="game-over-screen">
          <div className="winner-card">
            <h1 className="winner-title">🏆 游戏结束</h1>
            <div className="winner-info">
              <p className="winner-name">{gameWinner.playerName} 获胜！</p>
              <div className="winner-stats">
                <div className="stat-item">
                  <span className="stat-label">用时</span>
                  <span className="stat-value">{formatTime(gameWinner.gameTime)}</span>
                </div>
                {gameWinner.finalScore !== undefined && (
                  <div className="stat-item">
                    <span className="stat-label">最终得分</span>
                    <span className="stat-value">{gameWinner.finalScore}</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="back-to-lobby-btn"
              onClick={() => {
                setGameWinner(null);
                setGameStarted(false);
                setGameState(null);
                setRoomCode(null);
                setPlayerId(null);
                setIsSpectator(false);
              }}
            >
              返回大厅
            </button>
          </div>
        </div>
      ) : !gameStarted ? (
        <GameLobby
          onGameReady={handleGameReady}
          playerName={playerName}
          setPlayerName={setPlayerName}
        />
      ) : (
        <GameBoard
          gameState={gameState}
          roomCode={roomCode}
          playerId={playerId}
          socket={socket}
          playerName={playerName}
          isSpectator={isSpectator}
        />
      )}
    </div>
  );
};

// 格式化时间函数
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default App;
