# 📦 从 npm 迁移到 pnpm 指南

## 🎯 迁移概述

本项目已从 npm 迁移到 pnpm 作为包管理工具。pnpm 提供了更快的安装速度、更少的磁盘空间占用和更严格的依赖管理。

## 🚀 快速开始

### 1. 安装 pnpm

```bash
# 使用 npm 安装 pnpm（推荐）
npm install -g pnpm

# 或使用 Corepack（Node.js 16.13+）
corepack enable
corepack prepare pnpm@8.15.0 --activate

# Windows PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 2. 清理旧的 npm 文件

```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules client/node_modules server/node_modules
rm -f package-lock.json client/package-lock.json server/package-lock.json

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, client\node_modules, server\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json, client\package-lock.json, server\package-lock.json -ErrorAction SilentlyContinue
```

### 3. 使用 pnpm 安装依赖

```bash
# 安装所有依赖
pnpm install
```

## 📝 命令对照表

| npm 命令 | pnpm 命令 | 说明 |
|---------|-----------|------|
| `npm install` | `pnpm install` | 安装所有依赖 |
| `npm install <pkg>` | `pnpm add <pkg>` | 安装单个包 |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` | 安装开发依赖 |
| `npm install -g <pkg>` | `pnpm add -g <pkg>` | 全局安装 |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` | 卸载包 |
| `npm update` | `pnpm update` | 更新依赖 |
| `npm run <script>` | `pnpm run <script>` | 运行脚本 |
| `npm start` | `pnpm start` | 启动项目 |
| `npm test` | `pnpm test` | 运行测试 |
| `npm audit` | `pnpm audit` | 安全审计 |
| `npm cache clean --force` | `pnpm store prune` | 清理缓存 |

## 🎮 项目特定命令

### 开发命令

```bash
# 启动开发服务器（前端+后端）
pnpm start

# 仅启动后端
pnpm run server

# 仅启动前端
pnpm run client

# 开发模式（热重载）
pnpm run dev
```

### 构建命令

```bash
# 构建前端
pnpm run build

# 安装所有依赖
pnpm install
```

### 维护命令

```bash
# 清理依赖
pnpm run clean

# 更新依赖
pnpm run update

# 安全审计
pnpm run audit

# 修复安全问题
pnpm run audit-fix

# 健康检查
pnpm run health
```

### Docker 命令

```bash
# 构建生产镜像
pnpm run docker:build

# 启动 Docker 服务
pnpm run docker:up

# 停止 Docker 服务
pnpm run docker:down

# 查看 Docker 日志
pnpm run docker:logs

# 重启 Docker 服务
pnpm run docker:restart
```

## 🔧 配置文件变化

### 新增文件

1. **`pnpm-workspace.yaml`** - pnpm 工作区配置
   ```yaml
   packages:
     - 'client'
     - 'server'
   ```

2. **`.npmrc`** - pnpm 配置文件
   ```ini
   shamefully-hoist=true
   strict-peer-dependencies=false
   auto-install-peers=true
   ```

### 更新文件

1. **`package.json`** - 更新了 engines 字段
   ```json
   {
     "engines": {
       "node": ">=14.0.0",
       "pnpm": ">=8.0.0"
     },
     "packageManager": "pnpm@8.15.0"
   }
   ```

2. **所有 npm 脚本命令已更新为 pnpm**

## 🐳 Docker 变化

### Dockerfile

- 安装 pnpm: `corepack enable && corepack prepare pnpm@8.15.0 --activate`
- 使用 `pnpm install --prod` 替代 `npm install --production`
- 使用 `pnpm start` 替代 `npm start`

### Dockerfile.production

- 多阶段构建中使用 pnpm
- 使用 `pnpm install --frozen-lockfile --prod` 确保一致性

## ⚠️ 注意事项

### 1. Lock 文件

- pnpm 使用 `pnpm-lock.yaml` 而不是 `package-lock.json`
- 请将 `pnpm-lock.yaml` 提交到版本控制

### 2. node_modules 结构

- pnpm 使用符号链接和硬链接优化磁盘空间
- node_modules 结构与 npm 不同，但不影响使用

### 3. Peer Dependencies

- pnpm 默认对 peer dependencies 更严格
- 配置文件中已设置 `auto-install-peers=true` 以自动安装

### 4. Hoisting

- pnpm 默认不提升依赖到根目录
- 配置文件中已设置 `shamefully-hoist=true` 以兼容某些工具

## 💡 优势

### 速度更快

- 使用内容寻址存储，避免重复下载
- 并行安装依赖
- 比 npm 快 2-3 倍

### 节省空间

- 所有版本的包只存储一次
- 使用硬链接共享文件
- 可节省数 GB 的磁盘空间

### 更严格的依赖管理

- 防止幽灵依赖（phantom dependencies）
- 确保只能访问 package.json 中声明的依赖
- 提高项目稳定性

## 🆘 故障排除

### pnpm 命令找不到

```bash
# 确保 pnpm 已安装
npm install -g pnpm

# 或使用 Corepack
corepack enable
```

### 依赖安装失败

```bash
# 清理 pnpm 存储
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 某些包无法正常工作

```bash
# 尝试提升所有依赖
# 在 .npmrc 中添加或确认：
shamefully-hoist=true
```

### 遇到 peer dependencies 错误

```bash
# 在 .npmrc 中添加或确认：
auto-install-peers=true
strict-peer-dependencies=false
```

## 📚 更多资源

- [pnpm 官方文档](https://pnpm.io/)
- [pnpm vs npm](https://pnpm.io/motivation)
- [工作区（Workspace）功能](https://pnpm.io/workspaces)
- [配置选项](https://pnpm.io/npmrc)

## ✅ 检查清单

迁移完成后，请确认：

- [ ] pnpm 已安装（`pnpm --version`）
- [ ] 旧的 npm lock 文件已删除
- [ ] 新的 `pnpm-lock.yaml` 已生成
- [ ] 依赖已成功安装（`pnpm install`）
- [ ] 项目可以正常启动（`pnpm start`）
- [ ] 所有脚本命令都能正常工作
- [ ] Docker 镜像可以成功构建
- [ ] 文档已更新

---

**注意**: 如果在迁移过程中遇到问题，请查看项目的 [GETTING_STARTED.md](GETTING_STARTED.md) 或提交 issue。
