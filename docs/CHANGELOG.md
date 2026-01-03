# 更新日志

## [1.2.0] - 2026-01-03

### 重大变更
- 📦 **从 npm 迁移到 pnpm**
  - 使用 pnpm 作为包管理工具
  - 安装速度提升 2-3 倍
  - 磁盘空间节省显著
  - 添加工作区（workspace）支持
  - 更严格的依赖管理

### 新增
- ✨ 新增 `pnpm-workspace.yaml` 工作区配置
- ✨ 新增 `.npmrc` pnpm 配置文件
- 📚 新增 [PNPM_MIGRATION_GUIDE.md](PNPM_MIGRATION_GUIDE.md) 迁移指南
- 📚 新增 [PNPM_MIGRATION_SUMMARY.md](../PNPM_MIGRATION_SUMMARY.md) 迁移总结

### 更新
- 🔄 更新所有 npm 命令为 pnpm 命令
- 🔄 更新 Dockerfile 和 Dockerfile.production 支持 pnpm
- 🔄 更新 docker-compose.yml 使用 pnpm
- 🔄 更新 package.json 脚本和 engines 配置
- 📝 更新所有文档中的 npm 引用为 pnpm
- 📝 更新 README.md 添加迁移指南链接

### 改进
- ⚡ 依赖安装速度显著提升
- 💾 磁盘空间使用大幅减少
- 🔒 依赖管理更加严格和安全
- 🔧 简化了 monorepo 管理（使用工作区特性）

### 迁移说明
查看 [PNPM 迁移指南](PNPM_MIGRATION_GUIDE.md) 了解详细的迁移步骤。

---

## [1.1.0] - 2024-01-XX

### 新增功能
- ✨ **生产环境部署方案**
  - Docker Compose 容器化部署（推荐）
  - npm 手动部署方式
  - 自动化 Docker 部署脚本（deploy.sh, deploy.ps1）
  - 健康检查脚本
  - Nginx 反向代理配置
  - 环境变量配置模板

- 🎮 **移动端支持**
  - 响应式设计优化
  - 触摸操作支持
  - 移动端游戏体验优化

- 🔧 **管理员面板**
  - 在线配置管理
  - 游戏规则调整
  - 实时配置更新

- 📦 **配置系统**
  - 统一配置文件（config.json）
  - 环境变量支持
  - 动态配置加载

### 改进
- 📝 完善部署文档（DEPLOYMENT_GUIDE.md）
- 🔧 添加生产环境配置文件（docker-compose.production.yml）
- 📦 优化 Docker 镜像构建（多阶段构建）
- 🚀 简化部署流程（Docker 一键部署）
- 🧹 清理项目结构（移除测试脚本和冗余配置）
- 💾 迁移配置存储（db.json → config.json）

### 修复
- 🐛 修复配置文件读取路径问题
- 🔒 增强安全性配置
- 🔧 修复 WebSocket 重连问题
- 📱 修复移动端显示问题

### 移除
- 🗑️ 移除 PM2 部署方式（简化为 Docker + npm）
- 🗑️ 移除 Makefile 和监控脚本（专注核心功能）
- 🗑️ 移除测试脚本（13个文件）
- 🗑️ 移除 db.json（迁移到 config.json）

---

## [1.0.0] - 初始版本

### 核心功能
- 🎮 基础游戏逻辑
- 🎨 React 前端界面
- 🔌 Socket.io 实时通信
- 🧪 化学元素卡牌系统
- ⚗️ 化学反应机制
- 👥 多人游戏支持

### 技术栈
- React 18.2
- Node.js + Express
- Socket.io 4.5
- 化学元素数据库

---

## 版本说明

- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

---

**项目维护者**: Chemistry UNO Team  
**最后更新**: 2024-01-XX
