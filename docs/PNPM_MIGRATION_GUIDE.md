# 📦 化学UNO - pnpm迁移指南

本指南介绍项目如何从npm迁移到pnpm，以及使用pnpm的优势。

## 🎯 为什么迁移到pnpm？

### 性能对比

| 特性 | npm | pnpm | 提升 |
|------|-----|------|------|
| 安装速度 | 基准 | 2-3倍 | ⚡⚡⚡ |
| 磁盘占用 | 基准 | 节省60%+ | 💾💾💾 |
| node_modules大小 | 大 | 小 | 📦📦📦 |

### 主要优势

1. **⚡ 更快的安装速度**
   - 并行安装
   - 高效的缓存机制
   - 增量安装

2. **💾 节省磁盘空间**
   - 内容寻址存储
   - 硬链接共享依赖
   - 全局存储

3. **🔒 更严格的依赖管理**
   - 非扁平化node_modules
   - 防止幽灵依赖
   - 更好的隔离性

4. **🎯 Monorepo支持**
   - 原生workspace支持
   - 高效的依赖管理
   - 快速的跨包操作

## 📊 迁移前后对比

### 安装时间对比

```bash
# npm install（首次）
Time: ~120s

# pnpm install（首次）
Time: ~45s

# npm install（有缓存）
Time: ~60s

# pnpm install（有缓存）
Time: ~10s
```

### 磁盘占用对比

```
项目依赖：~45个包

npm方式：
node_modules: ~250MB
总计: ~250MB

pnpm方式：
node_modules: ~80MB（硬链接）
全局store: ~200MB（共享）
实际占用: ~80MB
```

## 🔄 迁移步骤

### 1. 安装pnpm

```bash
# 使用npm安装（推荐）
npm install -g pnpm

# 或使用脚本安装
# Windows PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
pnpm --version
```

### 2. 配置pnpm（可选）

```bash
# 设置淘宝镜像（国内用户推荐）
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config list

# 设置存储路径（可选）
pnpm config set store-dir ~/.pnpm-store
```

### 3. 清理npm文件

```bash
# 删除npm依赖
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, client/node_modules, server/node_modules

# 删除lock文件
rm package-lock.json
rm client/package-lock.json
rm server/package-lock.json
```

### 4. 创建workspace配置

在项目根目录创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'client'
  - 'server'
```

### 5. 更新package.json

根目录 `package.json`：

```json
{
  "name": "chemistryuno",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev:server": "cd server && pnpm run dev",
    "dev:client": "cd client && pnpm start",
    "build": "pnpm run build:server && pnpm run build:client",
    "build:server": "cd server && pnpm run build",
    "build:client": "cd client && pnpm run build",
    "install:all": "pnpm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 6. 安装依赖

```bash
# 安装所有workspace的依赖
pnpm install

# pnpm会自动：
# 1. 读取workspace配置
# 2. 安装根依赖
# 3. 安装client依赖
# 4. 安装server依赖
# 5. 创建符号链接
```

### 7. 验证迁移

```bash
# 检查安装
pnpm list --depth=0

# 启动应用
pnpm start

# 应该看到：
# Server running on http://localhost:5000
# React app running on http://localhost:3000
```

## 🎯 Workspace配置详解

### 目录结构

```
chemistryuno/
├── package.json              # 根package
├── pnpm-workspace.yaml       # workspace配置
├── pnpm-lock.yaml            # lock文件
├── node_modules/             # 根依赖
│   └── .pnpm/                # pnpm虚拟存储
├── client/
│   ├── package.json          # 客户端package
│   └── node_modules/         # 符号链接
└── server/
    ├── package.json          # 服务端package
    └── node_modules/         # 符号链接
```

### pnpm-workspace.yaml配置

```yaml
packages:
  # 包含client和server
  - 'client'
  - 'server'
  
  # 或使用通配符
  # - 'packages/*'
  
  # 排除某些目录
  # - '!**/test/**'
```

### 跨包依赖

如果需要在client中引用server的代码：

```json
// client/package.json
{
  "dependencies": {
    "server": "workspace:*"
  }
}
```

## 📝 常用命令对比

### 安装依赖

| npm | pnpm |
|-----|------|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm install -g <pkg>` | `pnpm add -g <pkg>` |

### 运行脚本

| npm | pnpm |
|-----|------|
| `npm run start` | `pnpm start` |
| `npm run build` | `pnpm build` |
| `npm test` | `pnpm test` |

### 更新依赖

| npm | pnpm |
|-----|------|
| `npm update` | `pnpm update` |
| `npm update <pkg>` | `pnpm update <pkg>` |
| `npm outdated` | `pnpm outdated` |

### 删除依赖

| npm | pnpm |
|-----|------|
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| `npm uninstall -g <pkg>` | `pnpm remove -g <pkg>` |

### 清除缓存

| npm | pnpm |
|-----|------|
| `npm cache clean --force` | `pnpm store prune` |

### Workspace命令

```bash
# 在所有workspace中运行命令
pnpm -r <command>

# 在特定workspace运行
pnpm --filter client <command>
pnpm --filter server <command>

# 安装依赖到特定workspace
pnpm --filter client add axios
```

## 🔧 项目特定配置

### 并发启动脚本

```json
{
  "scripts": {
    "start": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev:server": "cd server && pnpm run dev",
    "dev:client": "cd client && pnpm start"
  }
}
```

### 构建脚本

```json
{
  "scripts": {
    "build": "pnpm run build:server && pnpm run build:client",
    "build:server": "cd server && pnpm run build",
    "build:client": "cd client && pnpm run build"
  }
}
```

## ⚠️ 常见问题

### Q1: pnpm install失败

```bash
# 清除store
pnpm store prune

# 删除lock文件
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q2: 找不到模块

**原因**：pnpm的严格依赖管理

**解决**：
```bash
# 确保依赖在package.json中声明
pnpm add <missing-package>
```

### Q3: peer依赖警告

```bash
# 安装peer依赖
pnpm add <peer-dependency>

# 或使用--shamefully-hoist（不推荐）
pnpm install --shamefully-hoist
```

### Q4: workspace依赖问题

```bash
# 重新链接workspace
pnpm install

# 查看workspace列表
pnpm list -r --depth -1
```

### Q5: 全局包找不到

```bash
# 查看全局安装路径
pnpm bin -g

# 添加到PATH（如果需要）
# Windows: 编辑系统环境变量
# macOS/Linux: 编辑 ~/.bashrc 或 ~/.zshrc
export PATH="$(pnpm bin -g):$PATH"
```

## 🎓 高级用法

### 1. 过滤器

```bash
# 只在client中运行
pnpm --filter client start

# 在多个包中运行
pnpm --filter client --filter server build

# 使用通配符
pnpm --filter "./packages/*" test
```

### 2. 递归命令

```bash
# 在所有workspace运行
pnpm -r run build

# 并行运行
pnpm -r --parallel run dev
```

### 3. 依赖分析

```bash
# 为什么安装了某个包
pnpm why <package>

# 列出所有依赖
pnpm list --depth=1

# 检查过时的包
pnpm outdated
```

### 4. 性能优化

```bash
# 使用--prefer-frozen-lockfile（CI环境）
pnpm install --frozen-lockfile

# 跳过可选依赖
pnpm install --no-optional

# 离线模式
pnpm install --offline
```

## 📊 性能监控

```bash
# 查看安装统计
pnpm install --reporter=append-only

# 查看store信息
pnpm store status

# 清理未使用的包
pnpm store prune
```

## 🔄 回退到npm（如需要）

```bash
# 1. 删除pnpm文件
rm -rf node_modules
rm pnpm-lock.yaml
rm pnpm-workspace.yaml

# 2. 恢复npm
npm install

# 3. 更新scripts（改回npm run）
```

## 💡 最佳实践

1. **使用lock文件**
   - 提交 `pnpm-lock.yaml` 到版本控制
   - 确保团队使用相同版本

2. **CI/CD配置**
   ```yaml
   # .github/workflows/ci.yml
   - name: Install pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8
   
   - name: Install dependencies
     run: pnpm install --frozen-lockfile
   ```

3. **镜像源配置**
   ```bash
   # .npmrc
   registry=https://registry.npmmirror.com
   ```

4. **定期维护**
   ```bash
   # 更新依赖
   pnpm update --latest
   
   # 清理store
   pnpm store prune
   ```

## 📚 相关资源

- [pnpm官方文档](https://pnpm.io/)
- [Workspace文档](https://pnpm.io/workspaces)
- [迁移指南](https://pnpm.io/installation#using-a-shorter-alias)

## 📖 相关文档

- [安装指南](INSTALLATION_GUIDE.md) - 详细安装步骤
- [开发者指南](DEVELOPER_GUIDE.md) - 开发配置
- [快速参考](QUICK_REFERENCE.md) - 常用命令

---

[← 返回文档中心](README.md)
