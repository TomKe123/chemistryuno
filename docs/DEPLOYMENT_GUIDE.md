# 🌐 化学UNO - 部署指南

本文档介绍如何将化学UNO部署到生产环境。

## 📋 目录

- [部署概述](#部署概述)
- [准备工作](#准备工作)
- [Docker部署](#docker部署)
- [手动部署](#手动部署)
- [Nginx配置](#nginx配置)
- [域名配置](#域名配置)
- [HTTPS配置](#https配置)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [常见问题](#常见问题)

## 📊 部署概述

### 部署方式

| 方式 | 难度 | 适用场景 | 推荐度 |
|------|------|---------|-------|
| Docker Compose | ⭐ | 生产环境 | ⭐⭐⭐⭐⭐ |
| 手动部署 | ⭐⭐⭐ | 自定义需求 | ⭐⭐⭐ |
| 云平台 | ⭐⭐ | 快速上线 | ⭐⭐⭐⭐ |

### 系统要求

**服务器配置**
- CPU: 2核+
- 内存: 2GB+
- 磁盘: 10GB+
- 操作系统: Linux（Ubuntu 20.04+、CentOS 7+）

**网络要求**
- 公网IP或域名
- 开放端口：80（HTTP）、443（HTTPS）、3000（前端）、5000（后端）

## 🔧 准备工作

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y git curl wget vim
```

### 2. 安装Node.js

```bash
# 使用NodeSource安装Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 3. 安装pnpm

```bash
# 全局安装pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

### 4. 克隆项目

```bash
# 克隆项目
cd /var/www
git clone <项目地址> chemistryuno
cd chemistryuno

# 安装依赖
pnpm install
```

## 🐳 Docker部署（推荐）

### 1. 安装Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置环境变量

```bash
# 创建 .env 文件
cat > .env << EOF
NODE_ENV=production
PORT=5000
CLIENT_PORT=3000
ADMIN_PASSWORD=your-admin-password-here
EOF
```

### 3. 构建和启动

```bash
# 使用生产环境配置
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 查看运行状态
docker-compose -f docker-compose.production.yml ps
```

### 4. 管理容器

```bash
# 停止服务
docker-compose -f docker-compose.production.yml stop

# 重启服务
docker-compose -f docker-compose.production.yml restart

# 删除容器
docker-compose -f docker-compose.production.yml down

# 重新构建
docker-compose -f docker-compose.production.yml up -d --build
```

### Docker Compose配置说明

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./config.json:/app/config.json
    restart: always
    
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.production
    ports:
      - "3000:80"
    depends_on:
      - server
    restart: always
```

## 🔨 手动部署

### 1. 构建前端

```bash
# 进入前端目录
cd client

# 构建生产版本
pnpm run build

# 构建结果在 client/build/ 目录
```

### 2. 构建后端

```bash
# 进入后端目录
cd server

# 编译TypeScript
pnpm run build

# 编译结果在 server/dist/ 目录
```

### 3. 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动后端
cd server
pm2 start dist/index.js --name chemistryuno-server

# 启动前端（使用serve）
npm install -g serve
cd ../client
pm2 start serve --name chemistryuno-client -- -s build -l 3000

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 4. PM2常用命令

```bash
# 查看进程列表
pm2 list

# 查看日志
pm2 logs chemistryuno-server
pm2 logs chemistryuno-client

# 重启
pm2 restart chemistryuno-server
pm2 restart all

# 停止
pm2 stop chemistryuno-server
pm2 stop all

# 删除
pm2 delete chemistryuno-server
```

## 🔧 Nginx配置

### 1. 安装Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 配置反向代理

```bash
# 创建配置文件
sudo vim /etc/nginx/sites-available/chemistryuno
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;  # 替换为你的域名

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/chemistryuno /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 🌐 域名配置

### 1. DNS设置

在域名提供商处添加A记录：

```
类型: A
主机: @（或www）
值: <服务器公网IP>
TTL: 600
```

### 2. 验证DNS

```bash
# 检查DNS解析
nslookup yourdomain.com
ping yourdomain.com
```

## 🔒 HTTPS配置

### 使用Let's Encrypt免费证书

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书并自动配置Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

### 手动配置SSL证书

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## ⚡ 性能优化

### 1. 前端优化

```bash
# 启用Gzip压缩
# 在 nginx.conf 中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

### 2. 缓存配置

```nginx
# 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 连接限制

```nginx
# 限制请求频率
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

location /api {
    limit_req zone=mylimit burst=20;
    # ...
}
```

### 4. Node.js优化

```bash
# 设置环境变量
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# PM2集群模式
pm2 start dist/index.js -i max --name chemistryuno-cluster
```

## 📊 监控和日志

### 1. PM2监控

```bash
# 实时监控
pm2 monit

# Web界面监控（PM2 Plus）
pm2 plus
```

### 2. 日志管理

```bash
# 查看日志
pm2 logs

# 日志轮转
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Nginx日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 4. 系统监控

```bash
# 安装监控工具
sudo apt install -y htop iotop nethogs

# 查看系统资源
htop
df -h
free -h
```

## 🔥 防火墙配置

### UFW（Ubuntu）

```bash
# 启用UFW
sudo ufw enable

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

### Firewalld（CentOS）

```bash
# 启动firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## ❓ 常见问题

### Q1: 部署后无法访问

**检查项**：
1. 防火墙是否开放端口
2. 服务是否正常运行（`pm2 list` 或 `docker ps`）
3. Nginx配置是否正确（`nginx -t`）
4. 域名DNS是否解析正确

### Q2: WebSocket连接失败

**解决方案**：
1. 确认Nginx配置了WebSocket支持
2. 检查防火墙是否允许WebSocket连接
3. 查看浏览器控制台错误信息

### Q3: HTTPS证书错误

**解决方案**：
```bash
# 检查证书
sudo certbot certificates

# 手动续期
sudo certbot renew

# 重启Nginx
sudo systemctl restart nginx
```

### Q4: 服务器内存不足

**解决方案**：
```bash
# 限制Node.js内存使用
export NODE_OPTIONS="--max-old-space-size=1024"

# 添加swap空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🔄 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 重新构建
pnpm run build

# Docker方式
docker-compose -f docker-compose.production.yml up -d --build

# PM2方式
pm2 restart all
```

### 备份

```bash
# 备份配置文件
cp config.json config.json.backup

# 备份数据库（如果有）
# 根据实际情况进行备份
```

## 📚 相关文档

- [快速部署指南](QUICK_DEPLOY.md) - 最快速的部署方法
- [开发者指南](DEVELOPER_GUIDE.md) - 技术架构
- [快速参考](QUICK_REFERENCE.md) - 常用命令

---

[← 返回文档中心](README.md)
