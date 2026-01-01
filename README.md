# ⚗️ 化学UNO - Chemistry UNO Game

一个基于化学知识的创意卡牌游戏网络应用。玩家需要打出能与上一个物质发生化学反应的物质来继续游戏。

> 📖 **快速开始？** 查看 [GETTING_STARTED.md](GETTING_STARTED.md) 了解如何启动应用

## 📋 项目概述

**化学UNO** 是一款将化学知识和UNO卡牌游戏完美结合的Web应用。系统内置了化学反应数据库，能够实时检验两个物质是否能发生反应，为玩家提供智能的卡牌推荐。

## 🎮 游戏规则

### 牌组成分
- **H、O**：各12张（常见元素）
- **C、N、F、Na、Mg、Al、Si、P、S、Cl、K、Ca、Mn、Fe、Cu、Zn、Br、I、Ag**：各4张
- **+2**：8张（摸2张牌）
- **+4**：4张（摸4张牌）
- **He、Ne、Ar、Kr**：各1张（反转游戏方向）
- **Au**：4张（跳过下一位玩家）

### 游戏流程
1. **初始化**：每位玩家初始获得10张牌
2. **出牌规则**：
   - 上家使用元素打出一种物质
   - 下家必须打出能与该物质**反应**的物质
   - 系统自动检索并展示当前元素能组成的所有物质
   - 玩家从物质列表中选择合适的物质打出
3. **无法打出**：摸2张牌，回合结束
4. **特殊卡牌**：
   - He/Ne/Ar/Kr：反转游戏方向
   - Au：跳过下一位玩家
   - +2/+4：指定下一位玩家额外摸牌
5. **胜利条件**：首先清空手牌的玩家获胜

## 🏗️ 项目结构

```
chemistryuno/
├── db.json                      # 化学知识库（元素、物质、反应）
├── server/                      # 后端（Node.js + Express）
│   ├── package.json
│   ├── index.js                # 主服务器文件
│   └── gameLogic.js            # 游戏逻辑和化学反应匹配
└── client/                      # 前端（React）
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js              # 主应用组件
        ├── App.css
        └── components/
            ├── GameLobby.js     # 游戏大厅（创建/加入游戏）
            ├── GameLobby.css
            ├── GameBoard.js     # 游戏主界面
            ├── GameBoard.css
            ├── Card.js          # 卡牌组件
            ├── Card.css
            ├── CompoundSelector.js  # 物质选择浮窗
            └── CompoundSelector.css
```

## 🚀 快速开始

### 前置要求
- Node.js >= 14.0
- npm >= 6.0

### 方案一：npm 一键启动（推荐）⭐

#### 1. 安装依赖
```bash
npm install
```

#### 2. 启动应用
```bash
npm start
```

这将自动启动后端服务器和前端应用：
- 后端：`http://localhost:5000`
- 前端：`http://localhost:3000`

#### 其他 npm 命令
```bash
npm run server    # 仅启动后端
npm run client    # 仅启动前端
npm run dev       # 开发模式（支持热重载）
npm run install-all  # 安装所有依赖
npm run clean     # 清理依赖
npm run update    # 更新依赖
npm run audit     # 检查安全漏洞
```

### 方案二：Docker 容器化启动

#### 前置要求
- Docker >= 20.0
- Docker Compose >= 1.29

#### 启动应用
```bash
docker-compose up
```

应用将在以下地址可访问：
- 前端：`http://localhost:3000`
- 后端：`http://localhost:5000`

#### 停止应用
```bash
docker-compose down
```

### 游戏入门
1. 打开浏览器访问 `http://localhost:3000`
2. 输入玩家名称
3. 选择"创建游戏"并选择玩家数量
4. 点击"创建游戏"按钮
5. 等待其他玩家加入或自己分别登录其他标签页测试

## 🔌 API 端点

### REST API

| 方法 | 端点 | 描述 |
|-----|------|------|
| POST | `/api/game/create` | 创建新游戏 |
| GET | `/api/game/:gameId/:playerId` | 获取游戏状态 |
| POST | `/api/compounds` | 获取元素能组成的物质 |
| POST | `/api/reaction/check` | 检查两个物质是否能反应 |

### WebSocket 事件

#### 发送事件
- `joinGame` - 加入游戏
- `playCard` - 打出卡牌
- `drawCard` - 摸牌

#### 接收事件
- `gameStateUpdate` - 游戏状态更新
- `gameOver` - 游戏结束
- `error` - 错误消息

## 🧪 核心算法

### 物质反应匹配

1. **元素提取**：从化学式中提取所有元素
   ```
   H2O → [H, O]
   Ca(OH)2 → [Ca, O, H]
   ```

2. **可用物质查找**：根据玩家拥有的元素，查找能组成的所有物质
   ```
   拥有元素: [H, O, Na, Cl]
   可组成: [H2O, NaCl, HCl, NaOH, ...]
   ```

3. **反应验证**：检查两个物质是否在反应数据库中有记录
   ```
   AgNO3 + NaCl → AgCl↓ + NaNO3 ✓
   ```

## 📊 数据库结构

`db.json` 包含：
- **metadata**: 元素列表
- **common_compounds**: 按类别分组的物质
  - oxides（氧化物）
  - hydroxides（氢氧化物）
  - acids（酸）
  - salts（盐）
  - other_inorganics（其他无机物）
- **representative_reactions**: 按类型分类的化学反应
  - acid_base（酸碱反应）
  - precipitation（沉淀反应）
  - redox（氧化还原反应）
  - thermal_decomposition（热分解反应）
  - combination（化合反应）
  - displacement（置换反应）
- **reactivity_series**: 活泼性序列
- **solubility_rules**: 溶解度规则

## 🎯 主要功能

- ✅ **实时多人游戏**：基于WebSocket的实时同步
- ✅ **智能物质推荐**：根据持有卡牌自动推荐可打出的物质
- ✅ **化学反应验证**：自动检验物质是否能反应
- ✅ **丰富的卡牌类型**：元素卡、特殊卡牌、功能卡
- ✅ **游戏逻辑完整**：支持方向反转、跳过、摸牌等规则
- ✅ **响应式设计**：支持不同屏幕尺寸

## 🛠️ 技术栈

### 后端
- **Express.js** - Web框架
- **Socket.io** - 实时通信
- **Node.js** - 运行时环境

### 前端
- **React 18** - UI框架
- **Socket.io-client** - WebSocket客户端
- **Axios** - HTTP客户端
- **CSS3** - 样式设计

## 📝 扩展可能性

1. **增强物质库**：添加更多化学物质和反应
2. **用户系统**：注册、登录、排行榜
3. **游戏记录**：保存游戏历史和分析
4. **AI对手**：实现智能机器人玩家
5. **移动端优化**：完全响应式设计
6. **教育模式**：显示化学反应方程式和原理
7. **多语言支持**：国际化适配

## ⚠️ 已知限制

- 仅支持2-4人游戏
- 不考虑化学计量系数
- 物质库为简化示例（可根据需要扩展）
- 暂不支持离线游戏存档

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交问题和改进建议！

---

**享受化学UNO的乐趣！** ⚗️🃏
