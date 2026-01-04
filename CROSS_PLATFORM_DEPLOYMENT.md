# 跨平台部署方案说明

## 🎯 更新内容

项目已从使用平台特定的部署脚本（PowerShell/Bash）迁移到使用跨平台 Node.js 部署脚本，并支持 Docker 和非 Docker 两种部署模式。

## ✨ 主要改进

### 之前的问题
- ❌ Windows 需要 `deploy-production.ps1` (PowerShell)
- ❌ Linux/macOS 需要 `deploy-production.sh` (Bash)
- ❌ 维护两套脚本，容易不同步
- ❌ PowerShell 脚本在某些 Windows 系统上执行策略问题
- ❌ Bash 脚本需要设置执行权限
- ❌ **Docker 是必需的，无法在没有 Docker 的环境部署**

### 现在的方案
- ✅ 单一的 `deploy.js` 脚本
- ✅ 基于 Node.js，跨平台通用
- ✅ Windows / Linux / macOS 无缝支持
- ✅ 无需额外权限或执行策略配置
- ✅ 易于维护和扩展
- ✅ **支持无 Docker 部署模式**
- ✅ **Docker 变为可选项，非必需**

## 📝 文件变更

### 新增文件
- `deploy.js` - 跨平台部署脚本（Node.js）

### 已删除
- `deploy-production.ps1` - Windows PowerShell 脚本（已移除）
- `deploy-production.sh` - Linux/macOS Bash 脚本（不存在/已移除）

### 已更新
- `package.json` - 更新部署命令指向 `deploy.js`
- `README.md` - 更新部署说明
- `docs/PRODUCTION_DEPLOYMENT.md` - 更新部署文档
- `docs/QUICK_DEPLOY.md` - 更新快速部署指南

## 🚀 使用方法

### Docker 模式（默认）
```bash
# 推荐方式（所有平台通用）
pnpm run deploy:prod

# 或直接运行脚本
node deploy.js
```

### 无 Docker 模式（新增 🆕）
```bash
# 不需要 Docker，仅需 Node.js 和 pnpm
pnpm run deploy:prod:no-docker

# 或直接运行脚本
node deploy.js --no-docker
```

**无 Docker 模式适用于：**
- 没有安装 Docker 的环境
- 开发/测试环境
- 轻量级部署需求
- 需要直接访问进程的场景

### 部署选项
```bash
# Docker 模式选项
pnpm run deploy:prod:clean      # 清理后重新部署
pnpm run deploy:prod:ssl        # 启用 SSL 部署
pnpm run deploy:prod:skip-build # 跳过构建直接部署

# 或直接使用 node 命令
node deploy.js --clean
node deploy.js --with-ssl
node deploy.js --skip-build
node deploy.js --no-docker --skip-tests

# 查看帮助
node deploy.js --help
- **智能依赖检测** - Docker 仅在需要时才检查
- **双模式支持** - 自动适配 Docker 和非 Docker 环境

## 🎨 功能特性

1. **依赖检查** - 自动检测 node, pnpm（和可选的 docker, docker-compose）
2. **版本信息** - 显示平台和工具版本
3. **部署模式选择** - Docker 或非 Docker 模式
4. **清理模式** - 可选的容器和镜像清理（Docker 模式）
5. **构建控制** - 可跳过前端/后端构建
6. **SSL 支持** - 可选的 HTTPS 配置（Docker 模式）
7. **实时反馈** - 彩色输出和进度提示
8. **错误处理** - 友好的错误消息和退出
9. **智能提示** - 如果缺少 Docker，提示可使用 --no-docker
- 异步操作支持

## 🎨 功能特性

1. **依赖检查** - 自动检测 node, pnpm, docker, docker-compose
2. **版本信息** - 显示平台和工具版本
3. **清理模式** - 可选的容器和镜像清理
4. **构建控制** - 可跳过前端/后端构建
5. **SSL 支持** - 可选的 HTTPS 配置
6. **实时反馈** - 彩色输出和进度提示
7. **错误处理** - 友好的Docker 模式 | 无 Docker 模式 |
|------|---------|------------|---------------|
| Windows 10/11 | ≥14.0 | ✅ 完全支持 | ✅ 完全支持 |
| Linux (Ubuntu/Debian/CentOS) | ≥14.0 | ✅ 完全支持 | ✅ 完全支持 |
| macOS | ≥14.0 | ✅ 完全支持 | ✅ 完全支持 |
| Windows 7/8 | ≥14.0 | ⚠️ 未测试 | ✅ 应该支持 |

## 🔍 故障排除

### 问题：找不到 Docker 命令
```
[ERROR] Missing required commands: docker, docker-compose
```
**解决方案**：
- **选项 1**：安装 Docker Desktop（Windows/macOS）或 Docker Engine（Linux）
- **选项 2**：使用无 Docker 模式：`pnpm run deploy:prod:no-docker`

### 问题：权限错误
```
Error: EACCES: permission denied
```
**解决方案**：
- Linux: 使用 `sudo` 或将用户添加到 docker 组
- Windows: 以管理员身份运行终端

### 问题：端口占用
```
Error: bind: address already in use
```
**解决方案**：
- Docker 模式：停止占用端口的服务或修改 docker-compose.production.yml 中的端口映射
- 无 Docker 模式：修改服务器配置的端口号
```
Error: bind: address already in use
```
**解决方案**：停止占用端口的服务或修改 docker-compose.production.yml 中的端口映射

## 📚 相关文档

- [完整部署指南](docs/PRODUCTION_DEPLOYMENT.md)
- [快速部署指南](docs/QUICK_DEPLOY.md)
- [开发者指南](docs/DEVELOPER_GUIDE.md)
✅ 更简单的使用方式
- ✅ 更好的跨平台兼容性
- ✅ 更少的维护成本
- ✅ 更友好的用户体验
- ✅ **灵活的部署选择**（Docker 或非 Docker）
- ✅ **降低了部署门槛**（Docker 不再是必需的）

### Docker 模式
适合生产环境，所有平台使用相同的命令：
```bash
pnpm run deploy:prod
```

### 无 Docker 模式
适合开发/测试环境或无法安装 Docker 的场景：
```bash
pnpm run deploy:prod:no-docker
```

就是这么简单！ 🚀

## 📌 快速参考

| 需求 | 命令 |
|------|------|
| 有 Docker，标准部署 | `pnpm run deploy:prod` |
| 没有 Docker | `pnpm run deploy:prod:no-docker` |
| 清理后重新部署 | `pnpm run deploy:prod:clean` |
| 启用 SSL（Docker） | `pnpm run deploy:prod:ssl` |
| 跳过构建 | `pnpm run deploy:prod:skip-build` |
| 查看帮助 | `node deploy.js --help` |
pnpm run deploy:prod
```

就是这么简单！ 🚀
