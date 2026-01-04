# Chemistry UNO - 生产环境一键部署指南

本指南介绍如何使用一键部署脚本快速将 Chemistry UNO 部署到生产环境。

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [部署选项](#部署选项)
- [使用 pnpm 命令](#使用-pnpm-命令)
- [常见场景](#常见场景)
- [部署后管理](#部署后管理)
- [故障排除](#故障排除)

## 🎯 前置要求

在开始部署之前，请确保已安装以下工具：

- **Node.js** >= 14.0.0
- **pnpm** >= 8.0.0
- **Docker** >= 20.0.0
- **Docker Compose** >= 2.0.0

### 检查安装

```bash
node --version
pnpm --version
docker --version
docker-compose --version
```

## 🚀 快速开始

### Windows 用户

```powershell
# 标准部署
.\deploy-production.ps1

# 或使用 pnpm 命令
pnpm run deploy:prod
```

### Linux/Mac 用户

```bash
# 赋予执行权限（首次运行）
chmod +x deploy-production.sh

# 标准部署
./deploy-production.sh

# 或使用 pnpm 命令
pnpm run deploy:prod
```

## ⚙️ 部署选项

### Windows (PowerShell)

```powershell
# 查看所有选项
.\deploy-production.ps1 -Help

# 清理后重新部署
.\deploy-production.ps1 -Clean

# 启用 HTTPS/SSL 支持
.\deploy-production.ps1 -WithSSL

# 跳过构建步骤（使用现有构建）
.\deploy-production.ps1 -SkipBuild

# 跳过测试步骤
.\deploy-production.ps1 -SkipTests

# 组合多个选项
.\deploy-production.ps1 -Clean -WithSSL
```

### Linux/Mac (Bash)

```bash
# 查看所有选项
./deploy-production.sh --help

# 清理后重新部署
./deploy-production.sh --clean

# 启用 HTTPS/SSL 支持
./deploy-production.sh --with-ssl

# 跳过构建步骤（使用现有构建）
./deploy-production.sh --skip-build

# 跳过测试步骤
./deploy-production.sh --skip-tests

# 组合多个选项
./deploy-production.sh --clean --with-ssl
```

## 📦 使用 pnpm 命令

为了方便使用，我们在 `package.json` 中预定义了以下快捷命令：

```bash
# 标准生产部署
pnpm run deploy:prod

# 清理后重新部署
pnpm run deploy:prod:clean

# 启用 SSL 的部署
pnpm run deploy:prod:ssl

# 跳过构建直接部署（快速部署）
pnpm run deploy:prod:skip-build
```

## 🎬 常见场景

### 场景 1: 首次部署

```bash
# 完整的初始部署
pnpm run deploy:prod

# 或者
.\deploy-production.ps1          # Windows
./deploy-production.sh           # Linux/Mac
```

### 场景 2: 代码更新后重新部署

```bash
# 标准重新部署（推荐）
pnpm run deploy:prod

# 或快速部署（如果已经手动构建过）
pnpm run deploy:prod:skip-build
```

### 场景 3: 完全清理后重新部署

```bash
# 删除所有容器和镜像后重新部署
pnpm run deploy:prod:clean

# 或者
.\deploy-production.ps1 -Clean   # Windows
./deploy-production.sh --clean   # Linux/Mac
```

### 场景 4: 启用 HTTPS 的生产环境

```bash
# 首先准备 SSL 证书（放在 nginx/ssl 目录）
mkdir -p nginx/ssl
# 将证书文件放入该目录

# 启用 SSL 部署
pnpm run deploy:prod:ssl

# 或者
.\deploy-production.ps1 -WithSSL  # Windows
./deploy-production.sh --with-ssl # Linux/Mac
```

### 场景 5: 仅更新配置不重新构建

```bash
# 修改 config.json 后
pnpm run deploy:prod:skip-build

# 或者
.\deploy-production.ps1 -SkipBuild   # Windows
./deploy-production.sh --skip-build  # Linux/Mac
```

## 🔧 部署后管理

### 查看服务状态

```bash
docker-compose -f docker-compose.production.yml ps
```

### 查看实时日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看应用日志
docker-compose -f docker-compose.production.yml logs -f app

# 查看 nginx 日志（如果启用了 SSL）
docker-compose -f docker-compose.production.yml logs -f nginx
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.production.yml restart

# 重启特定服务
docker-compose -f docker-compose.production.yml restart app
```

### 停止服务

```bash
# 停止服务但保留数据
docker-compose -f docker-compose.production.yml stop

# 停止并删除容器
docker-compose -f docker-compose.production.yml down

# 停止并删除容器和卷
docker-compose -f docker-compose.production.yml down -v
```

### 访问应用

部署成功后，可以通过以下地址访问：

- **主应用**: http://localhost 或 http://your-server-ip
- **API 端点**: http://localhost:5000
- **HTTPS** (如果启用): https://localhost

## 🛠️ 故障排除

### 问题 1: 端口被占用

```bash
# 检查端口占用
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :80
lsof -i :5000

# 解决方案：修改 docker-compose.production.yml 中的端口映射
```

### 问题 2: Docker 镜像构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新运行部署
pnpm run deploy:prod:clean
```

### 问题 3: 容器启动后立即退出

```bash
# 查看详细日志
docker-compose -f docker-compose.production.yml logs app

# 检查容器状态
docker-compose -f docker-compose.production.yml ps -a

# 进入容器调试
docker exec -it chemistry-uno-app sh
```

### 问题 4: 依赖安装失败

```bash
# 清理所有依赖
pnpm run clean

# 重新安装
pnpm install

# 然后重新部署
pnpm run deploy:prod
```

### 问题 5: 前端资源加载失败

检查 `client/build` 目录是否存在且包含文件：

```bash
# Windows
dir client\build

# Linux/Mac
ls -la client/build

# 如果为空，手动构建
pnpm run build:all
```

## 📊 部署脚本执行流程

1. **环境检查**
   - 检查 Node.js、pnpm、Docker、Docker Compose 是否安装
   - 显示版本信息

2. **清理阶段**（如果指定 -Clean 或 --clean）
   - 停止并删除现有容器
   - 删除旧镜像

3. **依赖安装**
   - 安装项目依赖（pnpm install）

4. **健康检查**（如果未跳过）
   - 运行健康检查脚本

5. **构建阶段**（如果未跳过）
   - 构建前端（React 应用）
   - 构建后端（TypeScript 编译）

6. **Docker 构建**
   - 构建生产环境 Docker 镜像
   - 应用多阶段构建优化

7. **部署阶段**
   - 停止旧容器
   - 启动新容器
   - 等待服务就绪

8. **验证阶段**
   - 检查容器状态
   - 显示最新日志
   - 输出访问信息

## 🔒 安全建议

1. **配置文件**
   - 生产环境使用独立的 `config.json`
   - 不要将敏感信息提交到版本控制

2. **SSL/HTTPS**
   - 生产环境强烈建议启用 HTTPS
   - 使用受信任的 SSL 证书

3. **防火墙**
   - 配置防火墙规则限制访问
   - 仅开放必要的端口

4. **日志**
   - 定期检查日志文件
   - 配置日志轮转避免磁盘占满

## 📝 配置文件说明

### config.json

生产环境的配置文件，包含：
- 服务器端口
- 数据库连接
- 日志级别
- 其他应用配置

### docker-compose.production.yml

生产环境的 Docker Compose 配置：
- 容器配置
- 端口映射
- 环境变量
- 健康检查
- 日志卷挂载

## 🎯 性能优化建议

1. **使用构建缓存**
   - 使用 `--skip-build` 选项可以跳过不必要的重复构建

2. **定期清理**
   - 定期运行 `docker system prune` 清理未使用的资源

3. **监控资源**
   - 使用 `docker stats` 监控容器资源使用

4. **日志管理**
   - 配置日志大小限制
   - 使用日志聚合工具

## 📚 相关文档

- [快速部署指南](QUICK_DEPLOY.md)
- [部署指南](DEPLOYMENT_GUIDE.md)
- [Docker 最佳实践](DEPLOYMENT_GUIDE.md#docker-部署)
- [故障排除](QUICK_REFERENCE.md#故障排除)

## 💡 提示

- 首次部署建议使用标准模式（不加任何参数）
- 更新代码后使用标准重新部署即可
- 遇到问题时使用 `--clean` 清理后重新部署
- 生产环境建议启用 HTTPS
- 定期查看日志监控应用状态

## 🤝 获取帮助

如果遇到问题：

1. 查看部署脚本的详细输出
2. 检查 Docker 日志
3. 参考故障排除章节
4. 查阅相关文档

---

**祝你部署顺利！🚀**
