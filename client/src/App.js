import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import './App.css';

const App = () => {
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
      } else {
        alert(`游戏结束！${data.playerName}获胜！`);
      }
      setGameStarted(false);
      setGameState(null);
      setRoomCode(null);
    });

    newSocket.on('roomClosed', (data) => {
      alert(data.message);
      // 重置所有状态，返回大厅
      setGameStarted(false);
      setGameState(null);
      setRoomCode(null);
      setPlayerId(null);
      setIsSpectator(false);
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

      {!gameStarted ? (
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

export default App;
