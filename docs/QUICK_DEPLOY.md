# ⚡ 化学UNO - 快速部署指南

最快速、最简单的生产环境部署方法（支持 Windows / Linux / macOS）。

## 🎯 一键部署（5分钟）

### 前提条件

- ✅ 已安装 Node.js >= 14.0
- ✅ 已安装 pnpm >= 8.0
- ✅ 已安装 Docker 和 Docker Compose

### 部署步骤

```bash
# 1. 克隆或进入项目目录
cd chemistryuno

# 2. 安装依赖
pnpm install

# 3. 一键部署到生产环境
pnpm run deploy:prod

# 完成！服务将自动构建并启动
```

### 部署选项

```bash
# 标准部署
pnpm run deploy:prod

# 清理后重新部署
pnpm run deploy:prod:clean

# 启用 SSL 部署
pnpm run deploy:prod:ssl

# 跳过构建直接部署（适用于已构建的项目）
pnpm run deploy:prod:skip-build

# 查看帮助
node deploy.js --help
```

### 访问应用

```
前端: http://localhost
后端 API: http://localhost:5000
管理面板: http://localhost/admin
```

## 🐳 仅使用 Docker 部署

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
