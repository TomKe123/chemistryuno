# 🎮 化学UNO - 快速参考卡

## 🚀 30秒快速启动

### Windows/Linux/macOS - pnpm 方式
```bash
pnpm install && pnpm start
```
👉 浏览器打开 http://localhost:3000

### 任何平台 - Docker 方式
```bash
docker-compose up
```
👉 浏览器打开 http://localhost:3000

---

## 📚 文档索引

| 需求 | 查看文件 |
|------|---------|
| 🎮 想玩游戏 | [GETTING_STARTED.md](GETTING_STARTED.md) |
| 📖 游戏规则 | [README.md](../README.md) |
| 💻 要开发 | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| ⚙️ 安装问题 | [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) |
| 🔍 快速查询 | [QUICK_START.md](QUICK_START.md) |

---

## 🎯 游戏步骤

1. 输入玩家名称
2. 创建/加入游戏
3. 选择 2-4 人
4. 出牌 = 选择能反应的物质
5. 打出所有卡牌即获胜

---

## 🛠️ pnpm 常用命令

```bash
pnpm start            # 启动前后端 ⭐
pnpm run server       # 仅启动后端 (TypeScript)
pnpm run client       # 仅启动前端 (React + TypeScript)
pnpm run dev          # 开发模式（热重载）
pnpm install          # 安装所有依赖（workspace）
pnpm run clean        # 清理缓存和node_modules
pnpm run build        # 构建前端生产版本
pnpm run build:server # 编译后端TypeScript
pnpm run health       # 运行健康检查
```

---

## 🐳 Docker 常用命令

```bash
docker-compose up       # 启动 ⭐
docker-compose down     # 停止
docker-compose up -d    # 后台启动
docker-compose logs -f  # 查看日志
```

---

## ❓ 问题排查

| 问题 | 解决方案 |
|------|---------|
| 端口占用 | 修改 server/index.ts 的 PORT 变量 |
| pnpm 找不到 | `npm install -g pnpm` 或 `corepack enable` |
| 依赖安装失败 | `pnpm store prune && pnpm install` |
| 连接失败 | 确保后端运行在 5000 端口 |
| TypeScript错误 | 检查 tsconfig.json 配置 |

---

## 📊 项目信息

- **语言**: TypeScript + React
- **包管理**: pnpm (workspace)
- **代码**: 2500+ 行
- **文档**: 20+ 份
- **物质**: 150+ 种
- **反应**: 40+ 种
- **API**: 8 个端点
- **组件**: 7 个 React 组件

---

## 🎉 现在就开始！

```bash
pnpm install && pnpm start
```

祝你游戏愉快！🚀
