import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import CompoundSelector from './CompoundSelector';
import './GameBoard.css';

const GameBoard = ({ gameState, gameId, playerId, socket, playerName }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [compounds, setCompounds] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [showCompoundSelector, setShowCompoundSelector] = useState(false);

  const isCurrentPlayer = gameState && gameState.currentPlayer === playerId;

  // 当玩家点击卡牌时，获取可能的物质
  const handleCardClick = async (card) => {
    if (!isCurrentPlayer) return;

    setSelectedCard(card);

    try {
      const response = await axios.post('http://localhost:5000/api/compounds', {
        elements: [card]
      });

      setCompounds(response.data.compounds);
      setShowCompoundSelector(true);
    } catch (error) {
      console.error('获取物质列表失败:', error);
    }
  };

  // 玩家选择物质后
  const handleCompoundSelect = (compound) => {
    setSelectedCompound(compound);
    
    if (socket) {
      socket.emit('playCard', {
        gameId,
        playerId,
        card: selectedCard,
        compound,
        playerName
      });
    }

    setShowCompoundSelector(false);
    setSelectedCard(null);
    setCompounds([]);
  };

  // 玩家无法打出时摸牌
  const handleDrawCard = () => {
    if (!isCurrentPlayer) return;

    if (socket) {
      socket.emit('drawCard', {
        gameId,
        playerId
      });
    }
  };

  if (!gameState) {
    return <div className="loading">加载中...</div>;
  }

  const currentPlayer = gameState.players[playerId];

  return (
    <div className="game-board">
      {/* 游戏信息面板 */}
      <div className="game-info-panel">
        <div className="game-header">
          <h1>⚗️ 化学UNO</h1>
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">游戏ID</span>
              <span className="stat-value">{gameId.substring(0, 10)}...</span>
            </div>
            <div className="stat">
              <span className="stat-label">剩余卡牌</span>
              <span className="stat-value">{gameState.deckCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">当前玩家</span>
              <span className={`stat-value ${isCurrentPlayer ? 'current' : ''}`}>
                玩家{gameState.currentPlayer + 1}
              </span>
            </div>
          </div>
        </div>

        {/* 游戏中央区域 */}
        <div className="center-area">
          <div className="pile-area">
            <div className="pile-label">最后打出物质</div>
            <div className="last-compound">
              {gameState.lastCompound ? (
                <div className="compound-card">{gameState.lastCompound}</div>
              ) : (
                <div className="compound-card empty">游戏开始</div>
              )}
            </div>
          </div>

          {/* 其他玩家 */}
          <div className="other-players">
            {gameState.players.map((player, idx) => (
              idx !== playerId && (
                <div key={idx} className={`player-info ${idx === gameState.currentPlayer ? 'active' : ''}`}>
                  <span className="player-label">玩家{idx + 1}</span>
                  <span className="hand-count">{player.handCount}张</span>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="turn-indicator">
          {isCurrentPlayer ? (
            <div className="your-turn">轮到你了！点击卡牌选择物质</div>
          ) : (
            <div className="waiting">等待中...</div>
          )}
        </div>
      </div>

      {/* 玩家手牌区 */}
      <div className="player-hand-area">
        <div className="hand-label">我的卡牌（{currentPlayer.handCount}张）</div>
        <div className="hand-cards">
          {currentPlayer.hand.map((card, idx) => (
            <Card
              key={idx}
              card={card}
              onClick={() => handleCardClick(card)}
              isSelected={selectedCard === card}
              disabled={!isCurrentPlayer}
            />
          ))}
        </div>

        {isCurrentPlayer && (
          <button className="draw-btn" onClick={handleDrawCard}>
            摸牌 (无法打出)
          </button>
        )}
      </div>

      {/* 物质选择器浮窗 */}
      {showCompoundSelector && (
        <CompoundSelector
          compounds={compounds}
          selectedCard={selectedCard}
          onSelect={handleCompoundSelect}
          onClose={() => setShowCompoundSelector(false)}
        />
      )}
    </div>
  );
};

export default GameBoard;
