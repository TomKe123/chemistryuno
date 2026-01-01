# 化学UNO - 开发者指南

## 项目架构

### 前端架构 (React)
```
src/
├── App.js                    # 主应用，管理游戏状态和WebSocket连接
├── App.css
├── index.js                  # React入口
├── index.css
└── components/
    ├── GameLobby.js         # 游戏大厅 - 创建/加入游戏
    ├── GameBoard.js         # 游戏主界面 - 显示卡牌、游戏状态
    ├── Card.js              # 卡牌组件 - 单个卡牌显示
    └── CompoundSelector.js  # 物质选择浮窗 - 选择打出的物质
```

### 后端架构 (Node.js/Express)
```
server/
├── index.js                 # Express服务器和WebSocket处理
├── gameLogic.js            # 核心游戏逻辑（保留用于兼容性）
├── database.js             # ChemistryDatabase类 - 物质库和反应匹配
└── rules.js                # GameRules类 - 游戏规则引擎
```

## 核心概念

### 1. 物质反应匹配系统

#### 工作流程
```
玩家点击卡牌 → 获取该元素能组成的物质 → 显示物质列表 → 玩家选择物质 
→ 验证是否能与上一物质反应 → 更新游戏状态
```

#### 验证逻辑
```javascript
// 1. 提取元素
H2O → ['H', 'O']
NaCl → ['Na', 'Cl']

// 2. 检查共同元素
['H', 'O'] ∩ ['Na', 'Cl'] = ∅ → 查找反应
在反应库中查找两个物质的反应对

// 3. 反应匹配
AgNO3 + NaCl → AgCl↓ + NaNO3 ✓
```

### 2. 游戏状态管理

**GameState** 结构：
```javascript
{
  deck: [],                    // 剩余卡牌堆
  players: [
    {
      id: 0,
      hand: ['H', 'O', ...],   // 手牌
      compounds: ['H2O', ...], // 打出的物质历史
      score: 0
    },
    // ... 更多玩家
  ],
  currentPlayer: 0,            // 当前玩家索引
  direction: 1,                // 1顺时针 -1逆时针
  lastCompound: 'H2O',         // 最后打出的物质
  lastCard: 'H',               // 最后打出的卡牌
  gameActive: true,
  turnCount: 0,
  history: []                  // 游戏历史记录
}
```

## API 接口说明

### REST API

#### 1. 创建游戏
```
POST /api/game/create
Content-Type: application/json

请求体：
{
  "playerCount": 2,
  "gameId": "game_xxx" (可选)
}

响应：
{
  "gameId": "game_1704067200000",
  "gameState": { ... }
}
```

#### 2. 获取物质列表
```
POST /api/compounds
Content-Type: application/json

请求体：
{
  "elements": ["H", "O"]
}

响应：
{
  "compounds": ["H2O", "H2O2", ...]
}
```

#### 3. 检查反应
```
POST /api/reaction/check
Content-Type: application/json

请求体：
{
  "compound1": "AgNO3",
  "compound2": "NaCl"
}

响应：
{
  "canReact": true,
  "reaction": {
    "type": "precipitation",
    "reaction": "AgNO3 + NaCl → AgCl↓ + NaNO3"
  }
}
```

#### 4. 获取游戏统计
```
GET /api/game/:gameId/stats

响应：
{
  "stats": {
    "totalTurns": 12,
    "playersRemaining": 3,
    "currentPlayerId": 1,
    "deckRemaining": 45,
    "lastCompound": "H2O",
    "direction": "顺时针"
  }
}
```

### WebSocket 事件

#### 客户端发送事件

##### joinGame
```javascript
socket.emit('joinGame', {
  gameId: 'game_xxx',
  playerId: 0,
  playerName: '玩家1'
});
```

##### playCard
```javascript
socket.emit('playCard', {
  gameId: 'game_xxx',
  playerId: 0,
  card: 'H',              // 打出的卡牌
  compound: 'H2O',        // 打出的物质（可选）
  playerName: '玩家1'
});
```

##### drawCard
```javascript
socket.emit('drawCard', {
  gameId: 'game_xxx',
  playerId: 0
});
```

#### 服务器广播事件

##### gameStateUpdate
```javascript
// 当游戏状态变化时广播
{
  gameState: { ... },      // 隐藏其他玩家的卡牌
  lastPlay: {
    playerId: 0,
    card: 'H',
    compound: 'H2O',
    playerName: '玩家1'
  }
}
```

##### gameOver
```javascript
{
  winner: 0,
  playerName: '玩家1',
  finalScore: 5
}
```

##### error
```javascript
// 发生错误时
socket.emit('error', '错误描述信息');
```

## 关键类和方法

### ChemistryDatabase 类

#### 主要方法
```javascript
// 获取元素能组成的物质
getCompoundsByElements(elements: string[]): string[]

// 检查两个物质是否能反应
getReactionBetweenCompounds(compound1: string, compound2: string): object|null

// 检查是否可以打出
canPlayCompound(currentCompound: string, lastCompound: string): boolean

// 从化学式提取元素
extractElements(formula: string): string[]

// 获取物质分类
getCompoundCategory(compound: string): string
```

### GameRules 类

#### 主要方法
```javascript
// 初始化游戏
static initializeGame(playerCount: number): object

// 创建并洗牌
static createDeck(): string[]

// 应用特殊卡牌效果
static applySpecialCard(card: string, gameState: object)

// 跳到下一个玩家
static nextPlayer(gameState: object)

// 给玩家摸卡
static drawCard(player: object, gameState: object, count: number = 1)

// 计算玩家得分
static calculateScore(hand: string[]): number

// 获取游戏统计
static getGameStats(gameState: object): object

// 检查赢家
static isWinner(player: object): boolean
```

## 数据库结构 (db.json)

### 元数据
```json
{
  "metadata": {
    "elements": ["H", "O", "C", ...]
  }
}
```

### 物质库
```json
{
  "common_compounds": {
    "oxides": ["H2O", "CO2", ...],
    "hydroxides": ["NaOH", ...],
    "acids": ["HCl", ...],
    "salts": {
      "chlorides": ["NaCl", ...],
      "sulfates": ["Na2SO4", ...]
    }
  }
}
```

### 反应数据
```json
{
  "representative_reactions": [
    {
      "type": "acid_base",
      "reactions": [
        "HCl + NaOH → NaCl + H2O",
        ...
      ]
    },
    {
      "type": "precipitation",
      "reactions": [...]
    },
    ...
  ]
}
```

## 前端流程

### 游戏循环

```
1. 用户打开应用
   ↓
2. 游戏大厅页面
   - 输入玩家名称
   - 选择创建或加入游戏
   ↓
3. 游戏已连接 (通过WebSocket)
   ↓
4. GameBoard 显示
   - 显示游戏信息（当前玩家、剩余卡牌等）
   - 显示玩家手牌
   - 如果是当前玩家：
     a. 点击卡牌
     b. 系统获取该卡牌能组成的物质
     c. 显示物质选择浮窗
     d. 玩家选择物质或取消
   - 实时监听游戏状态更新
   ↓
5. 游戏结束
   - 显示获胜者信息
   - 返回大厅
```

## 后端流程

### 游戏处理

```
1. 玩家发送 playCard 事件
   ↓
2. 验证：
   - 是否是当前玩家
   - 卡牌是否在手中
   - 物质是否能与上一物质反应
   ↓
3. 更新游戏状态：
   - 移除卡牌
   - 记录物质
   - 应用特殊效果
   ↓
4. 检查胜利条件
   - 如果玩家手牌为空 → 游戏结束
   ↓
5. 更新玩家轮次
   - 计算下一个玩家
   ↓
6. 广播更新
   - 向所有连接的玩家发送新游戏状态
```

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-----|-----|--------|
| "不是你的回合" | playerId不匹配currentPlayer | 等待轮次 |
| "你没有这张卡牌" | 卡牌不在手中 | 检查手牌列表 |
| "这个物质无法反应" | 物质在反应库中不存在 | 选择其他物质或摸牌 |
| "游戏不存在" | gameId无效 | 检查游戏ID |

## 测试建议

### 单机测试
1. 打开多个浏览器标签页
2. 分别创建不同玩家（playerId 0, 1, 2, 3）
3. 同一游戏ID加入游戏
4. 测试出牌流程

### 功能测试
- [ ] 卡牌选择和物质匹配
- [ ] 反应验证算法
- [ ] 特殊卡牌效果
- [ ] 游戏轮次切换
- [ ] 胜利检测
- [ ] WebSocket 同步

### 性能测试
- 大量卡牌时UI响应性
- 反应库查询速度
- 多人游戏的网络延迟

## 扩展建议

### 1. 增强物质库
修改 `db.json` 的 `common_compounds` 和 `representative_reactions` 部分，添加更多化学物质和反应。

### 2. AI玩家
在 `GameRules` 中添加 AI 决策逻辑：
```javascript
class AIPlayer {
  makeDecision(hand, possibleCompounds, lastCompound) {
    // 选择能反应的物质或摸牌
  }
}
```

### 3. 用户认证
添加用户注册和登录功能，保存玩家统计数据。

### 4. 排行榜
实现游戏统计和排行榜功能。

### 5. 重放系统
使用 `gameState.history` 实现游戏回放。

## 调试技巧

### 后端调试
```javascript
// 在 index.js 中添加
console.log('游戏状态:', gameState);
console.log('玩家手牌:', gameState.players[playerId].hand);
console.log('反应验证:', database.getReactionBetweenCompounds(c1, c2));
```

### 前端调试
```javascript
// 在 GameBoard.js 中添加
console.log('当前游戏状态:', gameState);
console.log('可能的物质:', compounds);
console.log('是否是当前玩家:', isCurrentPlayer);
```

### 数据库调试
```javascript
// 在 database.js 中测试
const db = require('./database');
console.log(db.getCompoundsByElements(['H', 'O']));
console.log(db.getReactionBetweenCompounds('H2O', 'NaCl'));
```

---

**需要帮助？** 请参考主 README.md 或查看示例代码。
