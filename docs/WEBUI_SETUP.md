# 🚀 启动指南 - 确保看到WebUI

## ⚠️ 常见问题：访问 localhost:3000 时没有看到游戏界面

### ✅ 完整的启动步骤

#### 第1步：安装所有依赖

```bash
npm run install-all
```

这会自动安装以下内容：
- 根目录依赖 (concurrently)
- `server/` 依赖 (express, socket.io, cors)
- `client/` 依赖 (react, react-scripts, axios, socket.io-client)

**预计时间**: 2-5 分钟（取决于网速）

#### 第2步：启动服务器和前端

```bash
npm start
```

这会同时启动：
- **后端**: `http://localhost:5000` (Express + Socket.io)
- **前端**: `http://localhost:3000` (React 开发服务器)

#### 第3步：打开浏览器

访问: **http://localhost:3000** 应该看到游戏界面

---

## 🔍 诊断步骤

如果看不到前端界面，按以下步骤排查：

### 1️⃣ 检查后端是否运行

访问: http://localhost:5000

**正常情况**：看到服务器状态页面，显示 "服务器运行中" ✅

**问题解决**：
- 如果显示 `Cannot GET /`，说明后端没有启动
- 检查终端是否有错误信息

### 2️⃣ 检查 client 依赖是否安装

```bash
cd client
npm list
```

**正常情况**：显示 react, react-scripts 等已安装

**如果显示 missing**：
```bash
npm install
```

### 3️⃣ 检查前端是否编译

在 React 启动的终端中，应该看到：
```
Compiled successfully!
You can now view chemistry-uno in the browser.
```

**如果看到错误**：
```bash
cd client
npm install
npm start
```

### 4️⃣ 检查端口占用

如果看到 "Port 3000 is in use" 错误：

```bash
# Windows - 查看占用端口 3000 的进程
netstat -ano | findstr :3000

# 然后杀死进程（替换 PID）
taskkill /PID <PID> /F
```

---

## 📝 各种启动方式

| 方式 | 命令 | 功能 |
|------|------|------|
| 完整启动 | `npm start` | 同时启动前后端 |
| 仅后端 | `npm run server` | 只启动服务器 |
| 仅前端 | `npm run client` | 只启动 React 应用 |
| 开发模式 | `npm run dev` | 后端热重载 + 前端 |
| 只安装依赖 | `npm run install-all` | 不启动，仅安装 |

---

## 🐳 使用 Docker（如果 npm 有问题）

```bash
docker-compose up
```

然后访问: http://localhost:3000

---

## 📋 完整的启动流程（从零开始）

```bash
# 1. 进入项目目录
cd chemistryuno

# 2. 安装所有依赖
npm run install-all

# 3. 启动应用
npm start

# 4. 打开浏览器
# 前端: http://localhost:3000
# 后端状态: http://localhost:5000
```

---

## 🆘 仍然看不到前端？

### 检查列表

- [ ] 运行了 `npm run install-all`？
- [ ] 运行了 `npm start`？
- [ ] 浏览器访问的是 `http://localhost:3000`（不是 5000）？
- [ ] 终端中看到 "Compiled successfully"？
- [ ] 没有红色错误信息？

### 核心排查

1. **检查终端输出**：
   - 如果有红色错误，记下错误信息
   - 确保看到两条信息：
     - ✓ 服务器运行在 http://localhost:5000
     - ✓ WebSocket 服务已启动

2. **完全重新安装**：
   ```bash
   npm run clean
   npm run install-all
   npm start
   ```

3. **检查 Node.js 版本**：
   ```bash
   node --version  # 应该 >= 14.0.0
   npm --version   # 应该 >= 6.0.0
   ```

---

## ✅ 成功的迹象

当看到以下内容时，说明启动成功：

**后端终端**：
```
✓ 服务器运行在 http://localhost:5000
✓ WebSocket 服务已启动，等待连接...
```

**前端终端**：
```
Compiled successfully!
You can now view chemistry-uno in the browser.
Local:   http://localhost:3000
```

**浏览器**：
- 看到 "化学UNO" 游戏界面
- 可以输入玩家名称
- 可以创建或加入游戏

---

祝游戏愉快！🎮⚗️
