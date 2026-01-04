import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Setup from './components/Setup';
import './App.css';
import { SOCKET_URL } from './config/api';
import API_ENDPOINTS from './config/api';

interface GameWinner {
  playerName: string;
  playerId: number;
  finalScore?: number;
  gameTime: number;
}

const App: React.FC = () => {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isSetupRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/setup');
  const adminPassword = process.env.REACT_APP_ADMIN || '';
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem('adminAuthed') === 'true');

  // 检查是否需要初始化设置
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.checkSetup);
        setNeedsSetup(!response.data.isSetup);
        setCheckingSetup(false);
        
        // 如果需要设置且不在设置页面，跳转到设置页面
        if (!response.data.isSetup && !isSetupRoute) {
          window.location.href = '/setup';
        }
      } catch (error) {
        console.error('检查设置状态失败:', error);
        setCheckingSetup(false);
      }
    };

    checkSetup();
  }, [isSetupRoute]);

  useEffect(() => {
    sessionStorage.setItem('adminAuthed', adminAuthed ? 'true' : 'false');
  }, [adminAuthed]);

  // 正在检查设置状态
  if (checkingSetup) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        检查系统状态...
      </div>
    );
  }

  // 显示设置页面
  if (isSetupRoute || needsSetup) {
    return <Setup onComplete={() => setNeedsSetup(false)} />;
  }

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

const GameApp: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  // 从 sessionStorage 加载昵称（页面关闭时自动清除）
  const [playerName, setPlayerName] = useState<string>(() => {
    return sessionStorage.getItem('playerName') || '';
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [gameWinner, setGameWinner] = useState<GameWinner | null>(null);

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
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('已连接到服务器');
    });

    newSocket.on('playerJoined', (data: any) => {
      console.log(`${data.playerName} 加入了房间`);
    });

    newSocket.on('gameStarted', (data: any) => {
      setGameState(data.gameState);
      setGameStarted(true);
    });

    newSocket.on('gameStateUpdate', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('gameOver', (data: any) => {
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

    newSocket.on('roomClosed', (data: any) => {
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

    newSocket.on('playerLeft', (data: any) => {
      console.log(`${data.playerName} 离开了房间`);
    });

    newSocket.on('error', (message: string) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleGameReady = (room: string, pid: string, name: string, spectator: boolean = false) => {
    setRoomCode(room);
    setPlayerId(Number(pid));
    setPlayerName(name);
    setIsSpectator(spectator);
    setGameStarted(true);

    // 更新URL显示房间号
    window.history.pushState(null, '', `?room=${room}&player=${pid}`);

    if (socket) {
      socket.emit('joinRoom', {
        roomCode: room,
        playerId: Number(pid),
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
      ) : roomCode && playerId !== null ? (
        <GameBoard
          gameState={gameState}
          roomCode={roomCode}
          playerId={String(playerId)}
          socket={socket}
          playerName={playerName}
          isSpectator={isSpectator}
        />
      ) : null}
    </div>
  );
};

// 格式化时间函数
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default App;
