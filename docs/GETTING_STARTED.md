# 🎮 化学UNO - 快速启动指南

## 📋 前置要求

- **Node.js**: v14.0 或更高版本
- **npm**: v6.0 或更高版本
- （可选）**Docker** 和 **Docker Compose**

## 🚀 启动方案

### 方案 1️⃣：npm 启动（推荐）⭐

#### 步骤 1：安装依赖
```bash
npm install
```

这将自动安装项目根目录、后端 (`server/`) 和前端 (`client/`) 的所有依赖。

#### 步骤 2：启动应用
```bash
npm start
```

**输出说明**：
```
> chemistry-uno@1.0.0 start
> concurrently "npm run server" "npm run client"

[server] 正在启动后端服务器...
[server] Server running on http://localhost:5000

[client] 正在启动前端应用...
[client] Compiled successfully!
[client] You can now view chemistry-uno in the browser.
[client] Local: http://localhost:3000
```

浏览器将自动打开 http://localhost:3000

#### 常用命令

| 命令 | 功能 |
|------|------|
| `npm start` | 启动前后端（推荐） |
| `npm run server` | 仅启动后端（端口 5000） |
| `npm run client` | 仅启动前端（端口 3000） |
| `npm run dev` | 开发模式（支持热重载） |
| `npm install` | 首次安装所有依赖 |
| `npm run install-all` | 重新安装所有依赖 |
| `npm run clean` | 清理 node_modules 和 lock 文件 |
| `npm run update` | 更新所有依赖 |
| `npm run audit` | 检查安全漏洞 |

---

### 方案 2️⃣：Docker 启动

#### 前置要求

- Docker >= 20.0
- Docker Compose >= 1.29

#### 启动应用

```bash
docker-compose up
```

**输出说明**：
```
Creating chemistry-uno_server_1  ... done
Creating chemistry-uno_client_1  ... done
Attaching to chemistry-uno_server_1, chemistry-uno_client_1
server_1  | Server running on http://localhost:5000
client_1  | Compiled successfully!
```

应用地址：http://localhost:3000

#### 常用命令

| 命令 | 功能 |
|------|------|
| `docker-compose up` | 启动所有服务 |
| `docker-compose down` | 停止所有服务 |
| `docker-compose up -d` | 后台启动 |
| `docker-compose logs -f` | 查看实时日志 |
| `docker-compose restart` | 重启服务 |

---

## ✅ 验证启动成功

### 浏览器访问

打开浏览器访问 http://localhost:3000

**你应该看到**：
- ✅ 化学 UNO 游戏大厅
- ✅ "创建游戏" 和 "加入游戏" 选项
- ✅ 玩家名称输入框

### 终端检查

```bash
# 检查后端服务
curl http://localhost:5000/api/compounds

# 期望返回：
# [{"name": "H2O", "type": "oxide", ...}, ...]
```

---

## 🎮 开始游戏

1. **输入玩家名称**（如 "玩家1"）
2. **创建游戏**
   - 选择玩家数量（2-4 人）
   - 点击 "创建游戏"
   - 记住游戏 ID
3. **其他玩家加入**
   - 使用相同的游戏 ID
   - 点击 "加入游戏"
4. **开始游戏** - 人数齐后自动开始

---

## 🛠️ 故障排除

### 问题：`npm: command not found`

**解决方案**：
- 安装 Node.js (https://nodejs.org/)
- 重启终端
- 运行 `npm --version` 验证

### 问题：端口 3000 或 5000 已占用

**解决方案**：
```bash
# 查看占用进程
lsof -i :3000
lsof -i :5000

# 杀死进程（Linux/macOS）
kill -9 <PID>

# 或者修改后端端口，编辑 server/index.js 第 6 行
const PORT = 5001; // 改为其他端口
```

### 问题：依赖安装失败

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 重新安装
npm run clean
npm install
```

### 问题：连接到后端失败

**检查清单**：
- ✅ 后端是否运行（`npm run server`）
- ✅ 后端是否在 http://localhost:5000 运行
- ✅ 防火墙是否阻止连接
- ✅ 浏览器控制台（F12）是否有错误

---

## 📚 更多文档

- [完整说明书](../README.md) - 详细的项目说明和游戏规则
- [开发者指南](./DEVELOPER_GUIDE.md) - 技术架构和 API 文档
- [安装指南](./INSTALLATION_GUIDE.md) - 详细的安装步骤

---

## 💡 提示

- **开发模式**：使用 `npm run dev` 获得热重载支持（修改代码自动刷新）
- **Docker 模式**：更推荐用于生产环境部署
- **多人游戏**：在不同浏览器/设备中使用相同的游戏 ID 加入

---

**祝你游戏愉快！** 🎉
