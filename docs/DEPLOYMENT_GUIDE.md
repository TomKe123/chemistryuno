# 化学UNO - 生产环境部署指南

## 📋 目录

- [部署方式](#部署方式)
- [前置要求](#前置要求)
- [快速部署](#快速部署)
- [Docker部署](#docker部署)
- [npm手动部署](#npm手动部署)
- [环境变量配置](#环境变量配置)
- [Nginx配置](#nginx配置)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

---

## 🚀 部署方式

本项目支持两种部署方式：

1. **Docker 部署** (推荐) ⭐ - 容器化部署，环境隔离，易于管理
2. **npm 手动部署** - 直接使用 Node.js，适合小规模部署

---

## 📦 前置要求

### Docker 部署

- Docker >= 20.10
- Docker Compose >= 2.0
- 至少 2GB 内存
- 至少 5GB 磁盘空间

### npm 手动部署

- Node.js >= 18.0
- npm >= 9.0
- 至少 2GB 内存
- 至少 3GB 磁盘空间

---

## ⚡ 快速部署

### 快速部署命令

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd chemistryuno

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置管理员密码

# 3. Docker 部署（推荐）
docker-compose -f docker-compose.production.yml up -d

# 或者使用 npm 手动部署
npm run install-all
npm run build
npm start
```

---

## 🐳 Docker 部署

### 1. 准备配置文件

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑环境变量（设置管理员密码等）
nano .env  # 或使用 vim, vi 等编辑器
```

`.env` 文件示例：
```env
NODE_ENV=production
PORT=5000
REACT_APP_ADMIN=your_strong_password
REACT_APP_API_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### 2. Docker Compose 部署

```bash
# 构建镜像
docker-compose -f docker-compose.production.yml build

# 启动服务
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 查看容器状态
docker-compose -f docker-compose.production.yml ps
```

### 4. 验证部署

```bash
# 运行健康检查
node healthcheck.js

# 或使用 curl
curl http://localhost:5000

# 访问前端
# 浏览器访问 http://localhost 或 http://your-domain.com
```

### 5. Docker 管理命令

```bash
# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml down

# 重新构建并启动
docker-compose -f docker-compose.production.yml up -d --build

# 查看实时日志
docker-compose -f docker-compose.production.yml logs -f

# 进入容器调试
docker-compose -f docker-compose.production.yml exec app sh
```

---

## 🛠️ npm 手动部署

### 1. 安装依赖

```bash
# 安装所有依赖（root + client + server）
npm run install-all

# 或者分别安装
npm install          # root
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑 .env 文件
nano .env
```

必需配置：
```env
NODE_ENV=production
PORT=5000
REACT_APP_ADMIN=your_strong_password
REACT_APP_API_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### 3. 构建前端

```bash
# 构建生产版本
npm run build

# 构建后的文件在 client/build 目录
```

### 4. 启动服务

```bash
# 方式一：使用 npm start（开发模式，包含热重载）
npm start

# 方式二：生产模式启动
NODE_ENV=production npm start

# 方式三：分别启动前端和后端
# 终端1：启动后端
cd server && npm start

# 终端2：启动前端（开发服务器）
cd client && npm start
```

### 5. 使用 Nginx 部署（推荐用于生产环境）

如果使用 npm 部署，建议使用 Nginx 作为反向代理：

```bash
# 1. 安装 Nginx
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL

# 2. 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/chemistryuno
sudo ln -s /etc/nginx/sites-available/chemistryuno /etc/nginx/sites-enabled/

# 3. 测试配置
sudo nginx -t

# 4. 重启 Nginx
sudo systemctl restart nginx
```

### 6. 后台运行

使用 `nohup` 或 `screen` 让服务在后台运行：

```bash
# 使用 nohup
nohup npm start > app.log 2>&1 &

# 查看日志
tail -f app.log

# 停止服务
ps aux | grep node
kill <pid>
```

或使用 `screen`：

```bash
# 创建新 screen 会话
screen -S chemistryuno

# 在 screen 中启动服务
npm start

# 分离 screen (Ctrl+A, 然后按 D)

# 重新连接
screen -r chemistryuno
```

---

## ⚙️ 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | API 服务器端口 | `5000` |
| `REACT_APP_ADMIN` | 管理员密码 | `your_strong_password` |
| `REACT_APP_API_URL` | API 地址 | `https://your-domain.com` |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ALLOWED_ORIGINS` | CORS 允许的源 | `*` |
| `LOG_LEVEL` | 日志级别 | `info` |

### 配置示例

#### 开发环境
```env
NODE_ENV=development
PORT=5000
REACT_APP_ADMIN=admin123
REACT_APP_API_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000
```

#### 生产环境
```env
NODE_ENV=production
PORT=5000
REACT_APP_ADMIN=StrongPassword123!@#
REACT_APP_API_URL=https://chemistry-uno.com
ALLOWED_ORIGINS=https://chemistry-uno.com,https://www.chemistry-uno.com
```

---

## 🌐 Nginx 配置

项目提供了 `nginx.conf` 配置文件模板。

### 基础配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /app/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### HTTPS 配置（推荐）

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
}
```

### 使用 Let's Encrypt 申请免费 SSL 证书

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期（添加到 crontab）
sudo crontab -e
# 添加：0 0 * * * certbot renew --quiet
```

---

## 📊 监控和日志

### Docker 方式

#### 查看日志

```bash
# 查看所有日志
docker-compose -f docker-compose.production.yml logs

# 实时查看日志
docker-compose -f docker-compose.production.yml logs -f

# 查看最近 100 行
docker-compose -f docker-compose.production.yml logs --tail=100

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs app
```

#### 健康检查

```bash
# 查看容器健康状态
docker inspect --format='{{.State.Health.Status}}' chemistryuno-app-1

# 使用健康检查脚本
node healthcheck.js

# 或使用 npm 命令
npm run health
```

#### 容器监控

```bash
# 查看容器资源使用
docker stats

# 查看容器详细信息
docker inspect chemistryuno-app-1
```

### npm 方式

#### 查看日志

```bash
# 如果使用 nohup 运行
tail -f app.log

# 实时跟踪日志
tail -f app.log | grep -i error
```

#### 进程监控

```bash
# 查看 Node.js 进程
ps aux | grep node

# 查看进程资源使用
top -p <pid>

# 或使用 htop
htop
```

---

## 🆘 故障排除

### 1. 端口被占用

**问题**：服务无法启动，提示端口已被占用

**解决方法**：

```bash
# Linux/macOS
# 查看端口占用
lsof -i :5000
lsof -i :80

# 杀死占用进程
kill -9 <PID>

# Windows
# 查看端口占用
netstat -ano | findstr :5000
netstat -ano | findstr :80

# 杀死占用进程
taskkill /PID <PID> /F
```

### 2. Docker 容器无法启动

**问题**：`docker-compose up` 失败

**解决方法**：

```bash
# 查看详细日志
docker-compose -f docker-compose.production.yml logs

# 清理旧容器和镜像
docker-compose -f docker-compose.production.yml down -v
docker system prune -a

# 重新构建
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### 3. 前端无法连接后端

**问题**：前端页面加载但无法连接 API

**检查**：

1. 确认 `REACT_APP_API_URL` 配置正确
2. 确认后端服务正在运行
3. 检查 CORS 配置

```bash
# 测试 API 连接
curl http://localhost:5000

# 检查 WebSocket 连接
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/socket.io/
```

### 4. 管理员面板无法访问

**问题**：访问 `/admin` 提示密码错误

**解决方法**：

1. 确认 `.env` 中 `REACT_APP_ADMIN` 已设置
2. 重新构建前端（环境变量在构建时注入）

```bash
# Docker 方式
docker-compose -f docker-compose.production.yml up -d --build

# npm 方式
npm run build
npm start
```

### 5. WebSocket 连接失败

**问题**：游戏无法实时更新

**检查**：

1. Nginx 配置是否正确代理 WebSocket
2. 防火墙是否允许 WebSocket 连接
3. 浏览器控制台是否有错误

```nginx
# Nginx WebSocket 配置
location /socket.io {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 6. 内存不足

**问题**：服务器内存占用过高

**解决方法**：

```bash
# Docker 方式：限制容器内存
# 在 docker-compose.production.yml 中添加：
services:
  app:
    mem_limit: 1g
    memswap_limit: 1g

# npm 方式：限制 Node.js 内存
NODE_OPTIONS="--max-old-space-size=512" npm start
```

### 7. 磁盘空间不足

**问题**：磁盘空间耗尽

**解决方法**：

```bash
# 清理 Docker 资源
docker system prune -a -f

# 清理日志
docker-compose -f docker-compose.production.yml logs --tail=0

# 清理 npm 缓存
npm cache clean --force
```

---

## 🔐 安全建议

### 1. 使用强密码
- 管理员密码至少 12 位
- 包含大小写字母、数字、特殊字符
- 定期更换密码

### 2. 启用 HTTPS
- 生产环境必须使用 HTTPS
- 使用 Let's Encrypt 免费证书
- 配置 HSTS 头

### 3. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4. 限制 CORS

```env
# 只允许特定域名
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 5. 定期更新

```bash
# 更新系统包
sudo apt update && sudo apt upgrade

# 更新 Node.js 依赖
npm audit fix

# 更新 Docker 镜像
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

---

## 📚 相关文档

- [README.md](../README.md) - 项目介绍
- [DEPLOYMENT.md](../DEPLOYMENT.md) - 部署文件说明
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - 部署检查清单
- [DEPLOYMENT_COMPLETE.md](../DEPLOYMENT_COMPLETE.md) - 部署完成指南
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - 开发者指南
- [QUICK_DEPLOY.txt](../QUICK_DEPLOY.txt) - 快速部署命令

---

## 🎉 部署完成

恭喜！如果你已经完成了上述步骤，你的 Chemistry UNO 应该已经成功部署到生产环境了。

现在你可以：
- 访问前端页面开始游戏
- 使用管理员面板管理配置
- 邀请朋友一起玩
- 监控服务运行状态

**需要帮助？** 查看 [故障排除](#故障排除) 或提交 Issue。

**祝你游戏愉快！** 🎮🎊✨
