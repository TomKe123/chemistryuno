# 化学UNO - 快速参考

## 🚀 一键启动

### Windows
```batch
cd d:\SystemFolders\Desktop\chemistryuno
start-game.bat
```

### Linux/macOS
```bash
cd ~/Desktop/chemistryuno
bash start-game.sh
```

### 手动启动
```bash
# 终端1 - 后端 (端口 5000)
cd server && npm install && npm start

# 终端2 - 前端 (端口 3000)
cd client && npm install && npm start
```

浏览器: http://localhost:3000

---

## 🎮 游戏规则速查

| 卡牌 | 数量 | 功能 |
|-----|------|------|
| H | 12 | 元素卡 |
| O | 12 | 元素卡 |
| C-Zn, Br, I, Ag | 各4 | 元素卡 |
| +2 | 8 | 下家摸2张 |
| +4 | 4 | 下家摸4张 |
| He, Ne, Ar, Kr | 各1 | 反转方向 |
| Au | 4 | 跳过下家 |

**目标**: 首先清空手牌

**核心规则**: 出牌必须选择能与上一物质**反应**的物质

---

## 📱 界面导航

### 游戏大厅
1. 输入玩家名称
2. 选择创建或加入游戏
3. 选择玩家数量 (2-4人)
4. 点击创建/加入

### 游戏界面
- **上方**: 游戏信息 + 其他玩家状态
- **中央**: 最后打出的物质
- **下方**: 我的卡牌 (可点击选择)

### 物质选择窗口
- 显示该元素能组成的所有物质
- 支持搜索过滤
- 选择或取消

---

## 📚 文件说明

### 文档
- `README.md` - 完整说明和规则
- `DEVELOPER_GUIDE.md` - 技术文档
- `PROJECT_SUMMARY.md` - 项目总结

### 后端 (server/)
```
index.js        - Express服务器和WebSocket
gameLogic.js    - 游戏逻辑核心
database.js     - 化学数据库 (物质+反应)
rules.js        - 游戏规则引擎
package.json    - 依赖配置
```

### 前端 (client/src/)
```
App.js          - 主应用
components/
  ├─ GameLobby.js       - 大厅界面
  ├─ GameBoard.js       - 游戏主界面
  ├─ Card.js           - 卡牌组件
  └─ CompoundSelector.js - 物质选择器
```

### 数据
```
db.json         - 化学知识库 (元素、物质、反应)
```

---

## 🔗 API 速查

### REST API
```
POST   /api/game/create           创建游戏
GET    /api/game/:id/:player      获取状态
POST   /api/compounds             查询物质
POST   /api/reaction/check        验证反应
GET    /api/game/:id/stats       统计信息
```

### WebSocket 事件
```
发送:
  joinGame(gameId, playerId, playerName)
  playCard(gameId, playerId, card, compound, playerName)
  drawCard(gameId, playerId)

接收:
  gameStateUpdate({ gameState, lastPlay })
  gameOver({ winner, playerName, finalScore })
  error(message)
```

---

## ⚡ 常见问题

**Q: 无法打出卡牌？**
A: 你的元素组成的物质无法与上一物质反应，点击"摸牌"摸2张。

**Q: 如何添加新物质？**
A: 修改 `db.json` 的 `common_compounds` 部分。

**Q: 如何调试？**
A: 检查浏览器控制台 (F12) 和服务器日志。

**Q: 如何多人游戏？**
A: 在不同设备/浏览器中用同一 gameId 加入游戏。

---

## 🛠️ 技术栈

**后端**: Node.js + Express + Socket.io
**前端**: React 18 + Socket.io-client + CSS3
**数据**: JSON 知识库

---

## 📊 项目统计

- **总代码行数**: 1500+
- **React 组件**: 4个
- **API 端点**: 5个
- **WebSocket 事件**: 6个
- **物质**: 150+ 种
- **化学反应**: 40+ 种

---

## 🎯 核心算法

### 物质匹配流程
```
点击卡牌 
  ↓
提取元素 (H, O, etc)
  ↓
查询可组成的物质 (H2O, OH- 等)
  ↓
验证是否能与上一物质反应
  ↓
广播游戏状态更新
```

### 元素提取示例
```
H2O      → [H, O]
Ca(OH)2  → [Ca, O, H]
AgNO3    → [Ag, N, O]
```

---

## 📦 依赖版本

**后端**: 
- express@^4.18.2
- socket.io@^4.5.4
- cors@^2.8.5

**前端**:
- react@^18.2.0
- react-dom@^18.2.0
- socket.io-client@^4.5.4
- axios@^1.3.4

---

## 🎨 界面特点

✨ 渐变背景
✨ 卡牌悬停效果
✨ 流畅动画
✨ 响应式设计
✨ 实时状态更新

---

## 📝 使用例子

### 游戏流程示例

```
玩家1: 点击 [H]
       → 显示: H2O, HCl, H2SO4, ...
       → 选择: H2O

玩家2: 点击 [Na]
       → 显示: NaOH, NaCl, Na2SO4, ...
       → 选择: NaOH (与H2O反应)
       ✓ 验证通过: H2O + NaOH → ?

玩家3: 无法出牌
       → 点击"摸牌"
       → 摸2张卡牌
       → 回合结束
```

---

## 🚨 故障排除

| 问题 | 原因 | 解决 |
|-----|------|------|
| 无法连接服务器 | 后端未启动 | 运行 npm start |
| 页面白屏 | 依赖未安装 | 运行 npm install |
| 物质显示为空 | 数据库问题 | 检查 db.json |
| WebSocket 错误 | CORS 问题 | 检查端口配置 |

---

**祝你游戏愉快！** 🎉⚗️

*更多信息: 查看 README.md 或 DEVELOPER_GUIDE.md*
