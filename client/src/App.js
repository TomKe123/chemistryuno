import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import './App.css';

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('已连接到服务器');
    });

    newSocket.on('gameStateUpdate', (data) => {
      setGameState(data.gameState);
    });

    newSocket.on('gameOver', (data) => {
      alert(`游戏结束！${data.playerName}获胜！`);
      setGameStarted(false);
      setGameState(null);
    });

    newSocket.on('error', (message) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateGame = async (playerCount) => {
    try {
      const response = await axios.post('http://localhost:5000/api/game/create', {
        playerCount
      });

      const newGameId = response.data.gameId;
      setGameId(newGameId);
      setPlayerId(0);
      setGameStarted(true);

      if (socket) {
        socket.emit('joinGame', {
          gameId: newGameId,
          playerId: 0,
          playerName: playerName || `玩家1`
        });
      }

      setGameState(response.data.gameState);
    } catch (err) {
      setError('创建游戏失败: ' + err.message);
    }
  };

  const handleJoinGame = (inputGameId, inputPlayerId, name) => {
    setGameId(inputGameId);
    setPlayerId(inputPlayerId);
    setPlayerName(name);
    setGameStarted(true);

    if (socket) {
      socket.emit('joinGame', {
        gameId: inputGameId,
        playerId: inputPlayerId,
        playerName: name
      });
    }
  };

  return (
    <div className="app">
      {error && <div className="error-message">{error}</div>}

      {!gameStarted ? (
        <GameLobby
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          playerName={playerName}
          setPlayerName={setPlayerName}
        />
      ) : (
        <GameBoard
          gameState={gameState}
          gameId={gameId}
          playerId={playerId}
          socket={socket}
          playerName={playerName}
        />
      )}
    </div>
  );
};

export default App;
