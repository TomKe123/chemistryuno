const fs = require('fs');
const path = require('path');

// 读取db.json
const dbPath = path.join(__dirname, '../db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

/**
 * 游戏规则引擎
 */
class GameRules {
  // 元素牌数量
  static ELEMENT_COUNTS = {
    'H': 12, 'O': 12,
    'C': 4, 'N': 4, 'F': 4, 'Na': 4, 'Mg': 4, 'Al': 4, 'Si': 4, 'P': 4,
    'S': 4, 'Cl': 4, 'K': 4, 'Ca': 4, 'Mn': 4, 'Fe': 4, 'Cu': 4, 'Zn': 4,
    'Br': 4, 'I': 4, 'Ag': 4,
    '+4': 4, '+2': 8,
    'He': 1, 'Ne': 1, 'Ar': 1, 'Kr': 1,
    'Au': 4
  };

  // 特殊卡牌功能映射
  static SPECIAL_CARDS = {
    'He': 'reverse', 'Ne': 'reverse', 'Ar': 'reverse', 'Kr': 'reverse',
    'Au': 'skip',
    '+4': 'draw4', '+2': 'draw2'
  };

  // 获取所有卡牌类型
  static getAllCardTypes() {
    return Object.keys(this.ELEMENT_COUNTS);
  }

  // 检查是否是特殊卡牌
  static isSpecialCard(card) {
    return card in this.SPECIAL_CARDS;
  }

  // 检查是否是元素卡
  static isElementCard(card) {
    return !this.isSpecialCard(card) && card !== '+2' && card !== '+4';
  }

  // 检查是否是常见元素（H、O）
  static isCommonElement(card) {
    return card === 'H' || card === 'O';
  }

  /**
   * 初始化游戏
   * @param {number} playerCount - 玩家数量
   * @returns {object} 游戏状态
   */
  static initializeGame(playerCount) {
    const deck = this.createDeck();
    const players = [];

    for (let i = 0; i < playerCount; i++) {
      const hand = [];
      // 每人初始10张牌
      for (let j = 0; j < 10; j++) {
        if (deck.length > 0) {
          hand.push(deck.pop());
        }
      }
      players.push({
        id: i,
        hand: hand,
        compounds: [],
        score: 0
      });
    }

    return {
      deck: deck,
      players: players,
      currentPlayer: 0,
      direction: 1, // 1 顺时针，-1 逆时针
      lastCompound: null,
      lastCard: null,
      gameActive: true,
      turnCount: 0,
      history: []
    };
  }

  /**
   * 创建并洗牌的卡牌堆
   */
  static createDeck() {
    const deck = [];

    for (const [card, count] of Object.entries(this.ELEMENT_COUNTS)) {
      for (let i = 0; i < count; i++) {
        deck.push(card);
      }
    }

    // 洗牌
    return this.shuffleDeck(deck);
  }

  /**
   * Fisher-Yates洗牌算法
   */
  static shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 处理特殊卡牌效果
   */
  static applySpecialCard(card, gameState) {
    const special = this.SPECIAL_CARDS[card];

    switch (special) {
      case 'reverse':
        gameState.direction *= -1;
        gameState.history.push({
          action: 'reverse',
          card: card,
          player: gameState.currentPlayer
        });
        break;

      case 'skip':
        this.skipNextPlayer(gameState);
        gameState.history.push({
          action: 'skip',
          card: card,
          player: gameState.currentPlayer
        });
        break;

      case 'draw2':
        // 累加+2
        gameState.pendingDraws = (gameState.pendingDraws || 0) + 2;
        gameState.history.push({
          action: 'draw2',
          card: card,
          player: gameState.currentPlayer,
          totalDraws: gameState.pendingDraws
        });
        break;

      case 'draw4':
        // 累加+4
        gameState.pendingDraws = (gameState.pendingDraws || 0) + 4;
        gameState.history.push({
          action: 'draw4',
          card: card,
          player: gameState.currentPlayer,
          totalDraws: gameState.pendingDraws
        });
        break;

      default:
        break;
    }
  }

  /**
   * 跳过下一个玩家
   */
  static skipNextPlayer(gameState) {
    const playerCount = gameState.players.length;
    gameState.currentPlayer = (gameState.currentPlayer + gameState.direction + playerCount) % playerCount;
  }

  /**
   * 给下一个玩家增加卡牌
   */
  static addCardsToNextPlayer(gameState, count) {
    const nextPlayerIndex = (gameState.currentPlayer + gameState.direction + gameState.players.length) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];

    for (let i = 0; i < count; i++) {
      if (gameState.deck.length > 0) {
        nextPlayer.hand.push(gameState.deck.pop());
      }
    }
  }

  /**
   * 移到下一个玩家
   */
  static nextPlayer(gameState) {
    const playerCount = gameState.players.length;
    gameState.currentPlayer = (gameState.currentPlayer + gameState.direction + playerCount) % playerCount;
    gameState.turnCount++;
    
    // 检查是否有累加的抽牌需要结算
    if (gameState.pendingDraws > 0) {
      const currentPlayer = gameState.players[gameState.currentPlayer];
      
      // 检查当前玩家是否有+2或+4卡可以继续累加
      const hasDrawCard = currentPlayer.hand.some(card => card === '+2' || card === '+4');
      
      // 如果没有加牌卡，则结算累加的抽牌
      if (!hasDrawCard) {
        console.log(`玩家${gameState.currentPlayer}无法继续累加，抽${gameState.pendingDraws}张牌`);
        for (let i = 0; i < gameState.pendingDraws; i++) {
          if (gameState.deck.length > 0) {
            currentPlayer.hand.push(gameState.deck.pop());
          }
        }
        gameState.pendingDraws = 0;
        
        // 抽牌后跳过该玩家
        gameState.currentPlayer = (gameState.currentPlayer + gameState.direction + playerCount) % playerCount;
      }
    }
  }

  /**
   * 玩家是否已赢得游戏
   */
  static isWinner(player) {
    return player.hand.length === 0;
  }

  /**
   * 给玩家摸卡
   */
  static drawCard(player, gameState, count = 1) {
    for (let i = 0; i < count; i++) {
      if (gameState.deck.length > 0) {
        player.hand.push(gameState.deck.pop());
      }
    }
  }

  /**
   * 计算得分（可扩展）
   */
  static calculateScore(hand) {
    let score = 0;
    hand.forEach(card => {
      if (card === '+4') score += 50;
      else if (card === '+2') score += 20;
      else if (this.isSpecialCard(card)) score += 10;
      else score += 1;
    });
    return score;
  }

  /**
   * 获取游戏统计信息
   */
  static getGameStats(gameState) {
    return {
      totalTurns: gameState.turnCount,
      playersRemaining: gameState.players.filter(p => p.hand.length > 0).length,
      currentPlayerId: gameState.currentPlayer,
      deckRemaining: gameState.deck.length,
      lastCompound: gameState.lastCompound,
      direction: gameState.direction === 1 ? '顺时针' : '逆时针'
    };
  }
}

module.exports = GameRules;
