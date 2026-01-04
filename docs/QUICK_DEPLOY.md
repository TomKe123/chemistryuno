# ⚡ 化学UNO - 快速部署指南

最快速、最简单的生产环境部署方法（支持 Windows / Linux / macOS）。

## 🎯 一键部署（5分钟）

### 前提条件

- ✅ 已安装 Node.js >= 14.0
- ✅ 已安装 pnpm >= 8.0
- ✅ 根据模式选择安装相应工具

### 部署步骤

```bash
# 1. 进入项目目录
cd chemistryuno

# 2. 安装依赖
pnpm install

# 3. 选择部署模式

# Docker 部署（推荐）
pnpm run prod:deploy:docker

# 或 PM2 部署（Linux/macOS）
pnpm run prod:deploy:pm2

# 或 Systemd 部署（Linux）
pnpm run prod:deploy:systemd

# 完成！服务将自动构建并启动
```

### 部署模式快速比较

```
Docker     | 生产级隔离 | 需要 Docker | 最推荐
PM2        | 轻量级    | 仅需 Node.js | Linux/macOS
Systemd    | 系统集成  | Linux only | Linux 生产
Direct     | 开发模式  | 仅需 Node.js | 测试用
```

## 🐳 Docker 部署（推荐）

### 要求
- Docker >= 20.0
- Docker Compose >= 2.0

### 3 步启动

```bash
# 1. 部署
pnpm run prod:deploy:docker

# 2. 查看状态
pnpm run prod:status docker

# 3. 访问
# http://localhost
# http://localhost:5000
```

### 管理服务

```bash
# 查看日志
pnpm run prod:logs docker

# 重启服务
pnpm run prod:restart docker

# 停止服务
pnpm run prod:stop docker
```

## 🚀 PM2 部署（Linux/macOS）

### 要求
- Node.js >= 14.0
- PM2: `npm install -g pm2`

### 3 步启动

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 部署
pnpm run prod:deploy:pm2

# 3. 访问
# http://localhost:5000 (后端)
# http://localhost:3000 (前端)
```

### 管理服务

```bash
# 查看日志
pnpm run prod:logs pm2

# 查看状态
pnpm run prod:status pm2

# 重启服务
pnpm run prod:restart pm2
```

## 🐧 Systemd 部署（Linux Only）

### 要求
- Linux with systemd (Ubuntu 18.04+, Debian 10+)
- Node.js >= 14.0

### 部署

```bash
pnpm run prod:deploy:systemd
```

脚本会输出需要执行的 systemctl 命令。

### 管理服务

```bash
# 查看状态
sudo systemctl status chemistry-uno

# 查看日志
sudo journalctl -u chemistry-uno -f

# 重启
sudo systemctl restart chemistry-uno
```

## 🔧 部署后配置

### 环境变量

```bash
# 复制环境模板
cp .env.production.example .env.production

# 编辑配置
nano .env.production
```

### Nginx 反向代理（可选）

```bash
# 如果需要使用 80 端口或配置 HTTPS
# 参考完整指南中的 Nginx 配置部分
```

## 📊 部署状态检查

```bash
# 健康检查
pnpm run prod:health

# 查看日志
pnpm run prod:logs docker  # Docker
pnpm run prod:logs pm2     # PM2

# 查看状态
pnpm run prod:status docker
```

## 🆘 常见问题

### Q: 部署失败，提示缺少 Docker？

**A:**

## 🔧 快速配置Nginx（可选）

如果需要使用80端口和域名访问：

```bash
# 1. 安装Nginx
sudo apt install -y nginx

# 2. 创建配置文件
sudo tee /etc/nginx/sites-available/chemistryuno > /dev/null << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/chemistryuno /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. 配置防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

现在可以通过 `http://yourdomain.com` 访问！

## 🔒 快速HTTPS（Let's Encrypt）

```bash
# 1. 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d yourdomain.com

# 3. 完成！自动续期已配置
```

现在可以通过 `https://yourdomain.com` 安全访问！

## 🎮 开始使用

1. 打开 `http://yourdomain.com` 或 `http://your-server-ip:3000`
2. 创建游戏房间
3. 分享房间号给朋友
4. 开始游戏！

## 📋 常用管理命令

```bash
# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml stop

# 启动服务
docker-compose -f docker-compose.production.yml start

# 更新应用
git pull
docker-compose -f docker-compose.production.yml up -d --build
```

## ❓ 遇到问题？

### 无法访问？

```bash
# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs

# 检查防火墙
sudo ufw status
```

### 端口被占用？

```bash
# 修改 docker-compose.production.yml 中的端口
# 将 3000:3000 改为 8080:3000
# 将 5000:5000 改为 8081:5000
```

## 📚 需要更多？

- 详细配置：查看 [完整部署指南](DEPLOYMENT_GUIDE.md)
- 性能优化：查看 [部署指南 - 性能优化](DEPLOYMENT_GUIDE.md#性能优化)
- 监控日志：查看 [部署指南 - 监控和日志](DEPLOYMENT_GUIDE.md#监控和日志)

---

[← 返回文档中心](README.md)
