# 快速部署指南

> 选择你喜欢的部署方式，复制命令直接执行即可！

## 🚀 方式一：Docker 部署（推荐）

### Docker Compose 部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置管理员密码

# 2. 构建并启动
docker-compose -f docker-compose.production.yml up -d

# 3. 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

## 🛠️ 方式二：npm 手动部署

```bash
# 1. 安装依赖
npm run install-all

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置管理员密码

# 3. 构建前端
npm run build

# 4. 启动服务器
npm start
```

## 🏥 健康检查

```bash
# 运行健康检查脚本
node healthcheck.js

# 或使用 curl
curl http://localhost:5000

# 或使用浏览器访问
# http://your-domain.com
```

## 📊 常用管理命令

### Docker

```bash
# 查看容器状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml down
```

### npm

```bash
# 开发模式启动（开发环境）
npm start

# 生产模式启动（手动）
npm run build
NODE_ENV=production npm start

# 查看进程
ps aux | grep node
```

## ⚙️ 必需配置

在 `.env` 文件中设置：

```env
NODE_ENV=production
PORT=5000
REACT_APP_ADMIN=your_strong_password
REACT_APP_API_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## 📖 更多帮助

- [完整部署指南](DEPLOYMENT_GUIDE.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)
- [部署完成指南](DEPLOYMENT_COMPLETE.md)
- [开发者指南](DEVELOPER_GUIDE.md)
- [项目主页](../README.md)
