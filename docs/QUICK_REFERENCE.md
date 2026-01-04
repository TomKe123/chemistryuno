# ⚡ 化学UNO - 快速参考卡

常用命令和操作的速查表。

## 📦 安装和启动

### 初次安装

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm

# 克隆项目
git clone <项目地址>
cd chemistryuno

# 安装依赖
pnpm install

# 启动开发服务器
pnpm start
```

### 常用命令

| 命令 | 功能 |
|------|------|
| `pnpm install` | 安装所有依赖 |
| `pnpm start` | 启动开发服务器 |
| `pnpm run dev` | 启动开发模式（热重载） |
| `pnpm run build` | 构建生产版本 |
| `pnpm test` | 运行测试 |
| `pnpm run dev:server` | 仅启动后端 |
| `pnpm run dev:client` | 仅启动前端 |

## 🌐 访问地址

### 本地访问

```
前端界面: http://localhost:3000
后端API:  http://localhost:5000
管理面板: http://localhost:3000/admin
```

### 移动端访问

```bash
# 1. 获取电脑IP地址
# Windows
ipconfig

# macOS/Linux
ifconfig
```

```
访问地址: http://[电脑IP]:3000
例如: http://192.168.1.100:3000
```

## 🎮 游戏流程

### 创建游戏（房主）

1. 访问 `http://localhost:3000`
2. 输入玩家名称
3. 选择"创建游戏"
4. 选择玩家数量（2-12人）
5. 点击"创建游戏"
6. 分享房间号或二维码

### 加入游戏（玩家）

1. 访问游戏地址
2. 输入玩家名称
3. 输入房间号
4. 点击"加入游戏"

### 游戏规则

| 卡牌类型 | 效果 |
|---------|------|
| 元素卡 | 组成物质打出 |
| He/Ne/Ar/Kr | 反转游戏方向 |
| Au | 跳过下一位玩家 |
| +2 | 下家摸2张牌 |
| +4 | 下家摸4张牌 |

## 🔧 管理面板

### 访问

```
地址: http://localhost:3000/admin
密码: 在.env文件中设置REACT_APP_ADMIN_PASSWORD
```

### 配置文件

```bash
# 配置文件位置
config.json

# 备份配置
cp config.json config.json.backup

# 恢复配置
cp config.json.backup config.json
```

## 🐳 Docker部署

### 开发环境

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 生产环境

```bash
# 启动
docker-compose -f docker-compose.production.yml up -d

# 查看状态
docker-compose -f docker-compose.production.yml ps

# 重启
docker-compose -f docker-compose.production.yml restart

# 停止
docker-compose -f docker-compose.production.yml down
```

## 🔍 故障排查

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### 清除缓存

```bash
# 清除pnpm缓存
pnpm store prune

# 删除依赖重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 查看日志

```bash
# PM2日志
pm2 logs

# Docker日志
docker-compose logs -f

# 开发模式
# 查看终端输出
```

## 🌐 网络配置

### 防火墙（Windows）

```powershell
# 以管理员身份运行PowerShell

# 允许端口3000
netsh advfirewall firewall add rule name="ChemistryUNO-3000" dir=in action=allow protocol=TCP localport=3000

# 允许端口5000
netsh advfirewall firewall add rule name="ChemistryUNO-5000" dir=in action=allow protocol=TCP localport=5000
```

### 防火墙（Linux）

```bash
# UFW
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp

# Firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

## 📝 配置文件

### 环境变量 (.env)

```bash
NODE_ENV=development
PORT=5000
CLIENT_PORT=3000
REACT_APP_ADMIN_PASSWORD=your-password
```

### package.json 脚本

```json
{
  "scripts": {
    "start": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev:server": "cd server && pnpm run dev",
    "dev:client": "cd client && pnpm start",
    "build": "pnpm run build:server && pnpm run build:client",
    "build:server": "cd server && pnpm run build",
    "build:client": "cd client && pnpm run build"
  }
}
```

## 🔑 快捷键和技巧

### 开发技巧

```bash
# 同时查看前后端日志
pnpm start

# 只开发前端（后端已运行）
cd client && pnpm start

# 只开发后端（前端已构建）
cd server && pnpm run dev

# 快速重启
Ctrl+C (停止) → pnpm start
```

### 浏览器调试

```
F12 - 打开开发者工具
Ctrl+Shift+I - 打开开发者工具
Network标签 - 查看网络请求
Console标签 - 查看日志和错误
Application标签 - 查看localStorage
```

## 📊 API快速测试

```bash
# 测试服务器状态
curl http://localhost:5000

# 获取配置
curl http://localhost:5000/api/config

# 创建游戏
curl -X POST http://localhost:5000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"playerCount":4}'

# 查询物质
curl -X POST http://localhost:5000/api/compounds \
  -H "Content-Type: application/json" \
  -d '{"elements":["H","O"]}'
```

## 🔗 常用链接

| 链接 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 | http://localhost:5000 |
| 管理面板 | http://localhost:3000/admin |
| React文档 | https://react.dev/ |
| Socket.IO文档 | https://socket.io/docs/ |
| pnpm文档 | https://pnpm.io/ |
| TypeScript文档 | https://www.typescriptlang.org/docs/ |

## 📱 移动端速查

### 获取IP地址

```bash
# Windows
ipconfig | findstr IPv4

# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### 二维码生成

```
自动生成: 创建房间后自动显示
手动生成: GET /api/qrcode?url=<地址>&roomId=<房间号>
```

## 🚨 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| Port 3000 already in use | 端口被占用 | 关闭占用进程或换端口 |
| Cannot find module | 依赖未安装 | `pnpm install` |
| WebSocket connection failed | 防火墙阻止 | 配置防火墙规则 |
| 403 Forbidden | 管理员密码错误 | 检查.env文件 |
| EACCES permission denied | 权限不足 | 使用sudo或管理员权限 |

## 📚 文档导航

| 文档 | 链接 |
|------|------|
| 文档中心 | [docs/README.md](README.md) |
| 快速开始 | [GETTING_STARTED.md](GETTING_STARTED.md) |
| 安装指南 | [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) |
| 开发者指南 | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| 部署指南 | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| 移动端访问 | [MOBILE_ACCESS_GUIDE.md](MOBILE_ACCESS_GUIDE.md) |
| 管理面板 | [ADMIN_PANEL_GUIDE.md](ADMIN_PANEL_GUIDE.md) |

## 💡 提示

- 🔄 修改代码后会自动热重载
- 💾 管理面板修改立即生效
- 📱 手机和电脑必须在同一WiFi
- 🔒 生产环境记得设置强密码
- 📦 使用pnpm比npm快2-3倍
- 🐳 Docker部署最简单

---

[← 返回文档中心](README.md)
