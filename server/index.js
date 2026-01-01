const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const gameLogic = require('./gameLogic');
const database = require('./database');
const GameRules = require('./rules');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 存储游戏会话
const gameSessions = new Map();
const playerSockets = new Map(); // playerName -> socketId

// 路由：创建新游戏
app.post('/api/game/create', (req, res) => {
  const { playerCount, gameId } = req.body;
  
  if (playerCount < 2 || playerCount > 4) {
    return res.status(400).json({ error: '玩家数量必须在2-4之间' });
  }
  
  const newGameId = gameId || 'game_' + Date.now();
  const gameState = GameRules.initializeGame(playerCount);
  
  gameSessions.set(newGameId, gameState);
  
  res.json({
    gameId: newGameId,
    gameState: sanitizeGameState(gameState, null)
  });
});

// 路由：获取游戏状态
app.get('/api/game/:gameId/:playerId', (req, res) => {
  const { gameId, playerId } = req.params;
  const gameState = gameSessions.get(gameId);
  
  if (!gameState) {
    return res.status(404).json({ error: '游戏不存在' });
  }
  
  res.json({
    gameState: sanitizeGameState(gameState, parseInt(playerId))
  });
});

// 路由：获取可能的物质
app.post('/api/compounds', (req, res) => {
  const { elements } = req.body;
  
  try {
    const compounds = database.getCompoundsByElements(elements);
    res.json({ compounds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：检查物质是否能够反应
app.post('/api/reaction/check', (req, res) => {
  const { compound1, compound2 } = req.body;
  
  try {
    const reaction = database.getReactionBetweenCompounds(compound1, compound2);
    res.json({
      canReact: reaction !== null,
      reaction: reaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：获取游戏统计
app.get('/api/game/:gameId/stats', (req, res) => {
  const { gameId } = req.params;
  const gameState = gameSessions.get(gameId);
  
  if (!gameState) {
    return res.status(404).json({ error: '游戏不存在' });
  }
  
  res.json({
    stats: GameRules.getGameStats(gameState)
  });
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('玩家连接:', socket.id);
  
  socket.on('joinGame', (data) => {
    const { gameId, playerId, playerName } = data;
    const gameState = gameSessions.get(gameId);
    
    if (!gameState) {
      socket.emit('error', '游戏不存在');
      return;
    }
    
    socket.join(gameId);
    playerSockets.set(playerName, socket.id);
    
    // 向所有玩家广播当前游戏状态
    io.to(gameId).emit('gameStateUpdate', {
      gameState: sanitizeGameState(gameState, playerId),
      players: gameState.players.length
    });
  });
  
  socket.on('playCard', (data) => {
    const { gameId, playerId, card, compound } = data;
    const gameState = gameSessions.get(gameId);
    
    if (!gameState || gameState.currentPlayer !== playerId) {
      if (!database.canPlayCompound(compound, gameState.lastCompound)) {
        socket.emit('error', '这个物质无法与上一个物质反应');
        return;
      }
    }
    
    // 移除卡牌
    const index = player.hand.indexOf(card);
    player.hand.splice(index, 1);
    
    // 记录物质和卡牌
    if (compound) {
      gameState.lastCompound = compound;
      player.compounds.push(compound);
    }
    gameState.lastCard = card;
    
    // 如果是特殊卡牌，应用效果
    if (GameRules.isSpecialCard(card)) {
      GameRules.applySpecialCard(card, gameState);
    }
    
    // 检查是否胜利
    if (GameRules.isWinner(player)) {
      io.to(gameId).emit('gameOver', {
        winner: playerId,
        playerName: data.playerName,
        finalScore: GameRules.calculateScore(player.hand)
      });
      gameSessions.delete(gameId);
      return;
    }
    
    // 移到下一个玩家
    GameRules.nextPlayer(gameState);
    
    // 广播游戏状态更新
    io.to(gameId).emit('gameStateUpdate', {
      gameState: sanitizeGameState(gameState, null),
      lastPlay: { playerId, card, compound, playerName: data.playerName
        winner: playerId,
        playerName: data.playerName
      });
      gameSessions.delete(gameId);
      return;
    }
    
    // 移到下一个玩家
    gameLogic.nextPlayer(gameState);
    
    // 广播游戏状态更新
    io.to(gameId).emit('gameStateUpdate', {
      gameState: sanitizeGameState(gameState, null),
      lastPlay: { playerId, card, compound }
    });
  });
  
  socket.on('drawCard', (data) => {
    const { gameId, playerId } = data;
    const gameState = gameSessions.get(gameId);
    
    if (!gameState || gameState.currentPlayer !== playerId) {
      socket.emit('error', '不是你的回合或游戏不存在');
      return;
    }
    
    const player = gameState.players[playerId];
    // 摸2张牌
    GameRules.drawCard(player, gameState, 2);
    
    gameState.history.push({
      action: 'draw',
      player: playerId,
      cardsDrawn: 2
    });
    
    // 移到下一个玩家
    GameRules.nextPlayer(gameState);
    
    // 广播游戏状态更新
    io.to(gameId).emit('gameStateUpdate', {
      gameState: sanitizeGameState(gameState, null),
      lastPlay: { playerId, action: 'draw', playerName: data.playerNamete, null),
      lastPlay: { playerId, action: 'draw' }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('玩家断开连接:', socket.id);
  });
});

// 辅助函数：隐藏其他玩家的卡牌
function sanitizeGameState(gameState, playerId) {
  const sanitized = {
    currentPlayer: gameState.currentPlayer,
    direction: gameState.direction,
    lastCompound: gameState.lastCompound,
    deckCount: gameState.deck.length,
    gameActive: gameState.gameActive,
    players: gameState.players.map((player, idx) => ({
      id: player.id,
      hand: idx === playerId ? player.hand : Array(player.hand.length).fill('unknown'),
      compounds: player.compounds,
      handCount: player.hand.length
    }))
  };
  
  return sanitized;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
