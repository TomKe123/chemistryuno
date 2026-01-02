# 玩家重新加入游戏功能修复

## 问题描述

用户报告"玩家无法重新加入游戏"。经过排查，发现了两个关键问题：

### 问题 1: 参数传递错误
在 `GameLobby.js` 中，`handleRejoinSession` 函数调用 `onGameReady` 时传递的参数不正确。

**错误代码：**
```javascript
onGameReady(existingSession.roomCode, existingSession.playerId, false);
```

**问题：**
`handleGameReady` 函数签名为：
```javascript
const handleGameReady = (room, pid, name, spectator = false) => {
  // ...
}
```

缺少了第三个参数 `name`（玩家名称），导致：
- `name` 参数实际接收到了 `false`（本应是 spectator 参数）
- `spectator` 参数变成了 `undefined`
- 玩家名称丢失，导致重新加入失败

### 问题 2: 离线状态未正确恢复
在 `server/index.js` 中，玩家重新连接时，只有在存在超时清理任务时才会将 `isOffline` 设置为 `false`。

**问题场景：**
如果玩家快速断线重连（在30秒超时触发之前），`pendingCleanup` 中可能还没有该玩家的清理任务，导致 `player.isOffline` 仍然为 `true`。

## 修复方案

### 修复 1: 正确传递玩家名称

**文件：** `client/src/components/GameLobby.js`

**修改前：**
```javascript
const handleRejoinSession = () => {
  if (existingSession) {
    onGameReady(existingSession.roomCode, existingSession.playerId, false);
    setExistingSession(null);
  }
};
```

**修改后：**
```javascript
const handleRejoinSession = () => {
  if (existingSession) {
    console.log('重新加入游戏:', existingSession);
    // 正确传递参数：roomCode, playerId, playerName, isSpectator
    onGameReady(
      existingSession.roomCode, 
      existingSession.playerId, 
      existingSession.playerName,
      false
    );
    setExistingSession(null);
  }
};
```

**改进：**
- 正确传递4个参数：`roomCode`, `playerId`, `playerName`, `isSpectator`
- 添加调试日志，便于排查问题
- 从 `existingSession` 中获取玩家名称

### 修复 2: 确保离线状态正确恢复

**文件：** `server/index.js`

**修改前：**
```javascript
} else if (player) {
  // 如果是普通玩家重新连接，标记为在线并取消昵称释放的超时
  const cleanupKey = `${roomCode}:${playerId}`;
  const cleanup = pendingCleanup.get(cleanupKey);
  if (cleanup) {
    console.log(`✓ 玩家 ${playerName} 已重新连接，取消昵称释放超时`);
    clearTimeout(cleanup.timeoutId);
    pendingCleanup.delete(cleanupKey);
    
    // 标记为在线
    player.isOffline = false;
  }
} else if (isSpectator) {
```

**修改后：**
```javascript
} else if (player) {
  // 如果是普通玩家重新连接，标记为在线并取消昵称释放的超时
  const cleanupKey = `${roomCode}:${playerId}`;
  const cleanup = pendingCleanup.get(cleanupKey);
  if (cleanup) {
    console.log(`✓ 玩家 ${playerName} 已重新连接，取消昵称释放超时`);
    clearTimeout(cleanup.timeoutId);
    pendingCleanup.delete(cleanupKey);
  }
  
  // 无论是否有超时清理，都要确保标记为在线
  if (player.isOffline) {
    console.log(`✓ 玩家 ${playerName} 从离线状态恢复为在线`);
    player.isOffline = false;
  }
} else if (isSpectator) {
```

**改进：**
- 将 `player.isOffline = false` 移出 `if (cleanup)` 判断
- 无论是否存在超时清理任务，都确保玩家状态恢复为在线
- 添加独立的日志，记录离线状态恢复

## 测试

### 测试脚本
创建了 `test_rejoin.js` 用于测试重新加入功能：

```bash
node test_rejoin.js
```

### 测试步骤

1. **创建房间并开始游戏**
   - 创建房间，添加两个玩家
   - 开始游戏

2. **检查会话信息**
   - 调用 `/api/player/:playerName/session` 接口
   - 验证返回的会话信息是否正确

3. **模拟断线重连**
   - 关闭浏览器或断开连接
   - 重新打开游戏，输入相同的玩家名称
   - 应该看到"重新加入"按钮
   - 点击重新加入，应该能成功恢复游戏

### 预期结果

1. **会话检查成功**
   ```json
   {
     "hasSession": true,
     "session": {
       "roomCode": "ABCD",
       "playerId": "uuid-xxx",
       "playerName": "测试玩家A",
       "gameStarted": true,
       "isOffline": false
     }
   }
   ```

2. **重新加入成功**
   - 玩家能够看到当前游戏状态
   - 手牌、弃牌堆、当前玩家等信息正确显示
   - 可以继续进行游戏

3. **离线状态正确恢复**
   - 在服务器日志中看到：
     ```
     ✓ 玩家 测试玩家A 从离线状态恢复为在线
     ```

## 相关代码流程

### 客户端重新加入流程

1. **输入玩家名称**
   ```
   GameLobby -> playerName 改变
   ```

2. **检查现有会话**（延迟500ms）
   ```
   useEffect -> checkExistingSession()
   -> GET /api/player/:playerName/session
   -> setExistingSession(session)
   ```

3. **显示重新加入提示**
   ```
   existingSession !== null
   -> 显示"重新加入"按钮
   ```

4. **点击重新加入**
   ```
   handleRejoinSession()
   -> onGameReady(roomCode, playerId, playerName, false)
   -> handleGameReady() in App.js
   -> socket.emit('joinRoom', {...})
   ```

5. **恢复游戏状态**
   ```
   服务器广播 gameStateUpdate
   -> 客户端接收并更新 gameState
   -> GameBoard 组件显示游戏界面
   ```

### 服务器端重连处理流程

1. **接收 joinRoom 事件**
   ```
   socket.on('joinRoom', (data))
   ```

2. **查找玩家**
   ```
   player = gameState.players.find(p => p.id === playerId)
   ```

3. **取消超时清理**（如果存在）
   ```
   if (cleanup) {
     clearTimeout(cleanup.timeoutId)
     pendingCleanup.delete(cleanupKey)
   }
   ```

4. **恢复在线状态**
   ```
   if (player.isOffline) {
     player.isOffline = false
   }
   ```

5. **广播状态更新**
   ```
   io.to(roomCode).emit('playerJoined', {...})
   broadcastGameStateToAll(io, roomCode, gameState)
   ```

## 可能的后续问题

### 1. 多设备登录
如果同一个玩家从不同设备登录，可能会导致冲突。

**建议：**
- 检测到同名玩家重新连接时，踢出旧连接
- 或者阻止新连接，提示"该玩家已在线"

### 2. 会话过期
30秒超时可能过短，特别是在网络不稳定的情况下。

**建议：**
- 考虑延长超时时间（如2分钟）
- 或者根据游戏状态动态调整超时时间

### 3. 游戏状态同步
快速重连时，客户端可能错过某些游戏事件。

**建议：**
- 重连时发送完整的游戏状态
- 已在 `broadcastGameStateToAll` 中实现

## 验证清单

- [x] 修复参数传递错误
- [x] 修复离线状态恢复逻辑
- [x] 添加调试日志
- [x] 创建测试脚本
- [ ] 在实际环境中测试
- [ ] 测试网络不稳定情况
- [ ] 测试多人同时重连
- [ ] 测试观战者重连

## 使用说明

### 如何重新加入游戏

1. **断线后**
   - 保持浏览器页面打开，或
   - 记住你使用的玩家名称

2. **重新访问游戏**
   - 输入之前使用的玩家名称
   - 等待0.5秒，系统会自动检查会话

3. **看到重新加入提示**
   - 如果有现有游戏，会显示：
     ```
     检测到你在房间 ABCD 中有进行中的游戏
     [重新加入] [忽略]
     ```

4. **点击"重新加入"**
   - 自动恢复到游戏界面
   - 继续之前的游戏

### 注意事项

- 离开游戏后必须在30秒内重新加入
- 必须使用完全相同的玩家名称
- 如果游戏已结束，无法重新加入

## 技术细节

### API 端点

**GET /api/player/:playerName/session**

检查玩家是否有现有会话。

**请求示例：**
```
GET /api/player/测试玩家A/session
```

**响应示例（有会话）：**
```json
{
  "hasSession": true,
  "session": {
    "roomCode": "ABCD",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "playerName": "测试玩家A",
    "gameStarted": true,
    "isOffline": false
  }
}
```

**响应示例（无会话）：**
```json
{
  "hasSession": false,
  "session": null
}
```

### Socket 事件

**客户端发送：joinRoom**
```javascript
socket.emit('joinRoom', {
  roomCode: 'ABCD',
  playerId: 'uuid-xxx',
  playerName: '测试玩家A',
  isSpectator: false
});
```

**服务器广播：playerJoined**
```javascript
io.to(roomCode).emit('playerJoined', {
  playerId: 'uuid-xxx',
  playerName: '测试玩家A',
  isSpectator: false,
  playerCount: 4,
  spectatorCount: 0
});
```

**服务器广播：gameStateUpdate**
```javascript
io.to(roomCode).emit('gameStateUpdate', {
  gameState: {
    // 完整的游戏状态
  }
});
```

## 总结

通过这次修复：
1. ✅ 修复了参数传递错误，确保玩家名称正确传递
2. ✅ 修复了离线状态恢复逻辑，无论何时重连都能正确恢复
3. ✅ 添加了详细的调试日志，便于排查问题
4. ✅ 创建了测试脚本，可以自动化测试重新加入功能

玩家现在应该能够正常重新加入游戏了。
