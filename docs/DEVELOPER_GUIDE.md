# 👨‍💻 化学UNO - 开发者指南

本文档面向开发者，介绍项目的技术架构、API接口和开发规范。

## 📋 目录

- [技术架构](#技术架架)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [API接口](#api接口)
- [WebSocket事件](#websocket事件)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [调试技巧](#调试技巧)

## 🏗️ 技术架构

### 技术栈概览

```
┌─────────────────────────────────────────┐
│           前端 (React + TS)              │
│  ┌─────────────────────────────────┐   │
│  │   React 18 + TypeScript 5.3     │   │
│  │   Socket.IO Client              │   │
│  │   Axios                         │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ WebSocket/HTTP
                  │
┌─────────────────▼───────────────────────┐
│        后端 (Node.js + TS)               │
│  ┌─────────────────────────────────┐   │
│  │   Express.js                    │   │
│  │   Socket.IO Server              │   │
│  │   TypeScript 5.3                │   │
│  │   化学数据库 (Database)          │   │
│  │   游戏逻辑 (GameLogic)           │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           配置文件                        │
│         config.json                     │
│    (元素、物质、反应规则)                  │
└─────────────────────────────────────────┘
```

### 技术选型说明

#### 前端
- **React 18**: 最新的React版本，支持并发特性
- **TypeScript 5.3**: 类型安全，提高代码质量
- **Socket.IO Client**: 实时双向通信
- **Axios**: HTTP请求库，支持移动端API配置

#### 后端
- **Node.js**: JavaScript运行时
- **Express.js**: 轻量级Web框架
- **Socket.IO**: WebSocket封装，支持降级
- **TypeScript**: 类型安全的服务端开发

#### 构建工具
- **pnpm**: 快速、节省空间的包管理器
- **pnpm workspace**: Monorepo管理
- **React Scripts**: 零配置构建工具
- **ts-node**: TypeScript直接运行

## 📁 项目结构

```
chemistryuno/
├── package.json                 # 根配置（workspace）
├── pnpm-workspace.yaml          # pnpm工作区配置
├── tsconfig.json                # TS根配置
├── config.json                  # 游戏配置
├── healthcheck.ts               # 健康检查
│
├── server/                      # 后端代码
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts                 # 主服务器
│   ├── gameLogic.ts             # 游戏逻辑
│   ├── database.ts              # 化学数据库
│   ├── rules.ts                 # 规则引擎
│   ├── configService.ts         # 配置服务
│   └── dist/                    # 编译输出
│
└── client/                      # 前端代码
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.tsx            # 入口
        ├── App.tsx              # 主应用
        ├── config/
        │   └── api.ts           # API配置
        ├── utils/
        │   └── chemistryFormatter.ts
        └── components/
            ├── GameLobby.tsx    # 游戏大厅
            ├── GameBoard.tsx    # 游戏界面
            ├── Card.tsx         # 卡牌组件
            ├── CompoundSelector.tsx
            ├── Setup.tsx
            ├── AdminPanel.tsx   # 管理面板
            └── AdminLogin.tsx
```

## 🔧 核心模块

### 后端核心模块

#### 1. Database (database.ts)

化学数据库类，管理元素、物质和反应数据。

```typescript
class Database {
  // 加载配置
  loadConfig(): void
  
  // 查找物质能组成的化合物
  findCompoundsFromElements(elements: string[]): string[]
  
  // 检查两个物质是否能反应
  canReact(compound1: string, compound2: string): boolean
  
  // 从化学式提取元素
  extractElements(formula: string): string[]
  
  // 获取/设置配置
  getConfig(): Config
  setConfig(config: Config): void
}
```

**关键算法**：

```typescript
// 元素提取（处理括号）
extractElements("Ca(OH)2") 
// → ["Ca", "O", "H"]

// 物质查找（排列组合）
findCompoundsFromElements(["H", "O", "Na"])
// → ["H2O", "NaOH", "Na2O", ...]

// 反应检查（双向查询）
canReact("AgNO3", "NaCl")
// → true (AgNO3 + NaCl → AgCl↓ + NaNO3)
```

#### 2. GameLogic (gameLogic.ts)

游戏逻辑管理类，处理游戏状态和规则。

```typescript
class GameLogic {
  games: Map<string, Game>
  
  // 游戏管理
  createGame(playerCount: number): string
  joinGame(gameId: string, playerId: string, playerName: string): void
  
  // 游戏流程
  startGame(gameId: string): void
  playCard(gameId: string, playerId: string, cards: string[]): void
  drawCards(gameId: string, playerId: string, count: number): void
  
  // 工具方法
  getCurrentPlayer(game: Game): Player
  getNextPlayer(game: Game): Player
  checkWinner(game: Game): string | null
}
```

**游戏状态结构**：

```typescript
interface Game {
  id: string
  players: Player[]
  deck: string[]
  discardPile: string[]
  currentPlayerIndex: number
  direction: number  // 1 或 -1
  phase: 'waiting' | 'playing' | 'finished'
  lastPlayedCompound: string | null
  winner: string | null
}

interface Player {
  id: string
  name: string
  hand: string[]
  connected: boolean
}
```

#### 3. Rules (rules.ts)

规则引擎，处理特殊卡牌和游戏规则。

```typescript
class Rules {
  // 检查卡牌是否为特殊卡
  isSpecialCard(card: string): boolean
  
  // 执行特殊卡牌效果
  executeSpecialCard(game: Game, card: string): void
  
  // 反转游戏方向（He, Ne, Ar, Kr）
  reverseDirection(game: Game): void
  
  // 跳过下一位玩家（Au）
  skipNextPlayer(game: Game): void
  
  // 摸牌惩罚（+2, +4）
  drawPenalty(game: Game, count: number): void
}
```

#### 4. ConfigService (configService.ts)

配置管理服务，处理配置的读写。

```typescript
class ConfigService {
  // 读取配置
  static readConfig(): Config
  
  // 写入配置
  static writeConfig(config: Config): void
  
  // 验证配置
  static validateConfig(config: Config): boolean
}
```

### 前端核心组件

#### 1. GameLobby.tsx

游戏大厅组件，处理创建/加入游戏。

```typescript
interface GameLobbyProps {}

function GameLobby() {
  const [playerName, setPlayerName] = useState('')
  const [gameId, setGameId] = useState('')
  const [playerCount, setPlayerCount] = useState(4)
  
  const createGame = () => { /* ... */ }
  const joinGame = () => { /* ... */ }
  
  return (/* JSX */)
}
```

#### 2. GameBoard.tsx

游戏主界面，显示游戏状态和玩家手牌。

```typescript
interface GameBoardProps {
  gameId: string
  playerId: string
  playerName: string
}

function GameBoard({ gameId, playerId, playerName }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  
  const playCard = (elements: string[]) => { /* ... */ }
  const drawCard = () => { /* ... */ }
  
  return (/* JSX */)
}
```

#### 3. CompoundSelector.tsx

物质选择器，显示可组成的物质列表。

```typescript
interface CompoundSelectorProps {
  compounds: string[]
  onSelect: (compound: string) => void
  onCancel: () => void
  currentCompound: string | null
}
```

#### 4. AdminPanel.tsx

管理面板，修改游戏配置。

```typescript
interface AdminPanelProps {}

function AdminPanel() {
  const [config, setConfig] = useState<Config | null>(null)
  
  const addReaction = () => { /* ... */ }
  const removeReaction = () => { /* ... */ }
  const saveConfig = () => { /* ... */ }
  
  return (/* JSX */)
}
```

## 🔌 API接口

### REST API

#### 游戏相关

**创建游戏**
```http
POST /api/game/create
Content-Type: application/json

{
  "playerCount": 4
}

Response:
{
  "gameId": "123456",
  "playerId": "player-uuid"
}
```

**获取游戏状态**
```http
GET /api/game/:gameId/:playerId

Response:
{
  "gameState": {
    "id": "123456",
    "players": [...],
    "currentPlayerIndex": 0,
    ...
  }
}
```

#### 化学相关

**获取可组成的物质**
```http
POST /api/compounds
Content-Type: application/json

{
  "elements": ["H", "O", "Na"]
}

Response:
{
  "compounds": ["H2O", "NaOH", "Na2O", ...]
}
```

**检查反应**
```http
POST /api/reaction/check
Content-Type: application/json

{
  "compound1": "AgNO3",
  "compound2": "NaCl"
}

Response:
{
  "canReact": true
}
```

#### 工具相关

**生成二维码**
```http
GET /api/qrcode?url=http://192.168.1.100:3000&roomId=123456

Response: (PNG image)
```

**获取移动端信息**
```http
GET /api/mobile-info

Response:
{
  "ip": "192.168.1.100",
  "port": 3000
}
```

#### 配置相关

**获取配置**
```http
GET /api/config

Response:
{
  "elements": [...],
  "compounds": [...],
  "reactions": [...]
}
```

**保存配置**
```http
POST /api/config
Content-Type: application/json
Authorization: Bearer <admin-password>

{
  "elements": [...],
  "compounds": [...],
  "reactions": [...]
}

Response:
{
  "success": true
}
```

## 🔄 WebSocket事件

### 客户端发送事件

**加入游戏**
```typescript
socket.emit('joinGame', {
  gameId: string,
  playerId: string,
  playerName: string
})
```

**打出卡牌**
```typescript
socket.emit('playCard', {
  gameId: string,
  playerId: string,
  elements: string[],
  compound: string
})
```

**摸牌**
```typescript
socket.emit('drawCard', {
  gameId: string,
  playerId: string
})
```

**开始游戏**
```typescript
socket.emit('startGame', {
  gameId: string,
  playerId: string
})
```

### 服务器发送事件

**游戏状态更新**
```typescript
socket.on('gameStateUpdate', (gameState: GameState) => {
  // 更新游戏状态
})
```

**游戏结束**
```typescript
socket.on('gameOver', (data: { winner: string }) => {
  // 显示获胜者
})
```

**玩家重新加入**
```typescript
socket.on('playerRejoined', (data: { playerId: string }) => {
  // 处理重连
})
```

**错误**
```typescript
socket.on('error', (message: string) => {
  // 显示错误信息
})
```

## 💻 开发工作流

### 开发环境启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器（前后端）
pnpm run dev

# 或分别启动
pnpm run dev:server  # 后端
pnpm run dev:client  # 前端
```

### 构建流程

```bash
# 构建前端
cd client
pnpm run build

# 构建后端
cd server
pnpm run build

# 或使用根命令
pnpm run build
```

### 测试

```bash
# 运行测试
pnpm test

# 健康检查
node healthcheck.ts
```

### 代码格式化

```bash
# 格式化代码
pnpm run format

# 检查代码风格
pnpm run lint
```

## 📐 代码规范

### TypeScript规范

1. **始终使用类型注解**
```typescript
// ✅ 好
function playCard(elements: string[]): void {
  // ...
}

// ❌ 不好
function playCard(elements) {
  // ...
}
```

2. **使用接口定义数据结构**
```typescript
interface Player {
  id: string
  name: string
  hand: string[]
}
```

3. **避免使用any**
```typescript
// ✅ 好
const config: Config = loadConfig()

// ❌ 不好
const config: any = loadConfig()
```

### 命名规范

- **变量/函数**: camelCase
  ```typescript
  const playerName = 'Alice'
  function createGame() {}
  ```

- **类/接口**: PascalCase
  ```typescript
  class GameLogic {}
  interface GameState {}
  ```

- **常量**: UPPER_SNAKE_CASE
  ```typescript
  const MAX_PLAYERS = 12
  const DEFAULT_HAND_SIZE = 10
  ```

### 文件组织

```typescript
// 1. 导入
import React from 'react'
import { Socket } from 'socket.io-client'

// 2. 接口/类型
interface Props {
  // ...
}

// 3. 常量
const DEFAULT_VALUE = 10

// 4. 组件/类
function Component() {
  // ...
}

// 5. 导出
export default Component
```

## 🐛 调试技巧

### 前端调试

```typescript
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('Game state:', gameState)
}

// React DevTools
// 安装：Chrome扩展 "React Developer Tools"

// WebSocket调试
socket.on('connect', () => {
  console.log('Connected to server')
})

socket.on('gameStateUpdate', (state) => {
  console.log('Game state updated:', state)
})
```

### 后端调试

```typescript
// 使用调试日志
console.log('[GameLogic] Creating game...')
console.log('[Database] Reaction check:', compound1, compound2)

// 使用调试器
// 在 VSCode 中设置断点，按F5启动调试

// 查看Socket连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
})
```

### 网络调试

```bash
# 查看端口占用
netstat -ano | findstr :3000

# 测试API
curl http://localhost:5000/api/config

# 查看WebSocket连接
# Chrome DevTools → Network → WS
```

### 常见问题排查

**前端无法连接后端**
1. 检查API配置：`client/src/config/api.ts`
2. 检查防火墙设置
3. 查看浏览器控制台错误

**反应验证失败**
1. 检查 `config.json` 中的反应规则
2. 查看服务器日志
3. 使用管理面板添加规则

**状态不同步**
1. 检查WebSocket连接
2. 查看 `gameStateUpdate` 事件
3. 确认客户端和服务器版本一致

## 📚 相关资源

- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [Socket.IO文档](https://socket.io/docs/)
- [Express文档](https://expressjs.com/)
- [pnpm文档](https://pnpm.io/)

## 🔗 相关文档

- [项目总结](PROJECT_SUMMARY.md) - 项目概览
- [快速参考](QUICK_REFERENCE.md) - 常用命令
- [部署指南](DEPLOYMENT_GUIDE.md) - 生产环境部署

---

[← 返回文档中心](README.md)
