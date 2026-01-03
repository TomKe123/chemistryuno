# 更新日志

## [1.3.0] - 2026-01-03

### 重大变更
- 🔷 **全面迁移到 TypeScript**
  - 前端全部组件迁移至 TypeScript (TSX)
  - 后端所有模块迁移至 TypeScript
  - 添加完整的类型定义和接口
  - 提升代码安全性和可维护性
  - 改善IDE开发体验

### 新增
- ✨ 新增 TypeScript 配置文件
  - 根目录 `tsconfig.json`
  - `server/tsconfig.json` (后端配置)
  - `client/tsconfig.json` (前端配置)
- ✨ 新增类型定义和接口
- ✨ 添加 ts-node 支持直接运行 TypeScript
- 🔧 后端添加 `build:server` 脚本编译 TypeScript

### 更新
- 🔄 所有 `.js` 文件迁移为 `.ts`
- 🔄 所有 React 组件迁移为 `.tsx`
- 🔄 更新依赖包支持 TypeScript
  - @types/node, @types/express, @types/cors
  - @types/react, @types/react-dom
- 📝 更新所有文档反映 TypeScript 技术栈
- 📝 更新开发指南包含 TypeScript 说明

### 改进
- ⚡ 编译时类型检查，减少运行时错误
- 🔒 更好的代码安全性和类型安全
- 💡 改善IDE智能提示和代码补全
- 📖 代码自文档化（类型即文档）

### 技术栈更新
- TypeScript 5.3+
- React 18 + TypeScript
- Node.js + Express + TypeScript
- 保持与 pnpm 8.15+ 的兼容

---

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
- TypeScript 5.3+
- React 18.2 + TypeScript
- Node.js + Express + TypeScript
- Socket.IO 4.5+
- pnpm 8.15+
- 化学元素数据库

---

## 版本说明

- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

---

**项目维护者**: Chemistry UNO Team  
**最后更新**: 2024-01-XX
