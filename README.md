# ⚗️ 化学UNO - Chemistry UNO Game

一个基于化学知识的创意卡牌游戏网络应用。玩家需要打出能与上一个物质发生化学反应的物质来继续游戏。

## 📚 快速导航

| 🎯 需求 | 📖 查看文档 |
|--------|-----------|
| 📄 **浏览所有文档** | [文档中心](docs/README.md) |
| 🚀 **想玩游戏？** | [快速开始](docs/GETTING_STARTED.md) |
| 📦 **从npm迁移到pnpm？** | [pnpm迁移指南](docs/PNPM_MIGRATION_GUIDE.md) |
| 🔷 **TypeScript迁移说明** | [TypeScript迁移总结](TYPESCRIPT_MIGRATION_SUMMARY.md) |
| 📱 **手机玩游戏？** | [移动端访问](docs/MOBILE_ACCESS_GUIDE.md) |
| 🔧 **修改反应规则？** | [管理面板指南](docs/ADMIN_PANEL_GUIDE.md) |
| 🌐 **生产环境部署？** | [部署指南](docs/DEPLOYMENT_GUIDE.md) |
| ⚡ **快速部署？** | [快速部署](docs/QUICK_DEPLOY.md) |
| ⚠️ **看不到WebUI？** | [WebUI设置](docs/WEBUI_SETUP.md) |
| 🎮 **游戏规则？** | 👇 下方详见 |
| 👨‍💻 **要开发？** | [开发者指南](docs/DEVELOPER_GUIDE.md) |
| 📋 **项目概览？** | [项目总结](docs/PROJECT_SUMMARY.md) |
| 🔧 **安装依赖？** | [安装指南](docs/INSTALLATION_GUIDE.md) |
| ⚡ **快速查询？** | [快速参考](docs/QUICK_REFERENCE.md) |

## 📋 项目概述

**化学UNO** 是一款将化学知识和UNO卡牌游戏完美结合的Web应用。系统内置了化学反应数据库，能够实时检验两个物质是否能发生反应，为玩家提供智能的卡牌推荐。

## 🎮 游戏规则

### 牌组成分（可自定义修改）
- **H、O**：各12张（常见元素）
- **C、N、F、Na、Mg、Al、Si、P、S、Cl、K、Ca、Mn、Fe、Cu、Zn、Br、I、Ag**：各4张
- **+2**：8张（摸2张牌）
- **+4**：4张（摸4张牌）
- **He、Ne、Ar、Kr**：各1张（反转游戏方向）
- **Au**：4张（跳过下一位玩家）

### 游戏流程
1. **初始化**：每位玩家初始获得10张牌
2. **出牌规则**：
   - 上家使用元素打出一种物质
   - 下家必须打出能与该物质**反应**的物质
   - 系统自动检索并展示当前元素能组成的所有物质
   - 玩家从物质列表中选择合适的物质打出
   - （不考虑物质/方程式中的系数）
3. **无法打出**：摸2张牌，回合结束
4. **特殊卡牌**：
   - He/Ne/Ar/Kr：反转游戏方向
   - Au：跳过下一位玩家
   - +2/+4：指定下一位玩家额外摸牌
5. **胜利条件**：首先清空手牌的玩家获胜

## 🏗️ 项目结构

```
chemistryuno/
├── package.json                 # 项目主配置（pnpm workspace）
├── pnpm-workspace.yaml          # pnpm工作区配置
├── tsconfig.json                # TypeScript根配置
├── config.json                  # 游戏配置文件（元素、物质、反应）
├── Dockerfile                   # Docker开发环境配置
├── Dockerfile.production        # Docker生产环境配置
├── docker-compose.yml           # Docker Compose开发配置
├── docker-compose.production.yml # Docker Compose生产配置
├── healthcheck.ts               # 健康检查脚本
├── server/                      # 后端（Node.js + TypeScript + Express + Socket.IO）
│   ├── package.json
│   ├── tsconfig.json            # 后端TypeScript配置
│   ├── index.ts                 # 主服务器文件（WebSocket + REST API）
│   ├── gameLogic.ts             # 游戏逻辑和化学反应匹配
│   ├── database.ts              # 化学数据库类
│   ├── rules.ts                 # 游戏规则引擎
│   ├── configService.ts         # 配置管理服务
│   ├── *.js                     # 编译前的旧JS文件（待清理）
│   └── dist/                    # TypeScript编译输出目录
├── client/                      # 前端（React 18 + TypeScript）
│   ├── package.json
│   ├── tsconfig.json            # 前端TypeScript配置
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.tsx            # 入口文件
│       ├── index.css
│       ├── App.tsx              # 主应用组件
│       ├── App.css
│       ├── config/
│       │   └── api.ts           # API配置（支持移动端）
│       ├── utils/
│       │   └── chemistryFormatter.ts  # 化学式格式化
│       └── components/
│           ├── GameLobby.tsx    # 游戏大厅（创建/加入游戏）
│           ├── GameLobby.css
│           ├── GameBoard.tsx    # 游戏主界面
│           ├── GameBoard.css
│           ├── Card.tsx         # 卡牌组件
│           ├── Card.css
│           ├── CompoundSelector.tsx # 物质选择浮窗
│           ├── CompoundSelector.css
│           ├── Setup.tsx        # 游戏设置组件
│           ├── Setup.css
│           ├── AdminPanel.tsx   # 管理面板（修改反应规则）
│           ├── AdminPanel.css
│           ├── AdminLogin.tsx   # 管理员登录
│           ├── AdminLogin.css
│           └── *.js             # 编译前的旧JS文件（待清理）
└── docs/                        # 完整文档目录
    ├── README.md                # 文档中心
    ├── ADMIN_PANEL_GUIDE.md     # 管理面板使用指南
    ├── MOBILE_ACCESS_GUIDE.md   # 移动端访问指南
    ├── DEPLOYMENT_GUIDE.md      # 部署指南
    ├── DEVELOPER_GUIDE.md       # 开发者指南
    └── ... （更多文档）
```

## 🚀 快速开始

### 前置要求
- **Node.js** >= 14.0
- **pnpm** >= 8.0 ([安装指南](https://pnpm.io/installation))

> 💡 项目已从 npm 迁移到 pnpm，具有更快的安装速度和更小的磁盘占用。

### 开发环境

```bash
# 1. 安装依赖（使用pnpm workspace自动安装所有子包）
pnpm install

# 2. 启动开发服务器（并发启动前后端）
pnpm start
# 或使用开发模式（热重载）
pnpm run dev

# 3. 访问应用
# 前端：http://localhost:3000
# 后端：http://localhost:5000
```

### 生产环境部署（跨平台）

```bash
# Docker 部署（推荐 - 需要 Docker）
pnpm run deploy:prod

# 无 Docker 部署（仅需 Node.js 和 pnpm）
pnpm run deploy:prod:no-docker

# 其他部署选项
pnpm run deploy:prod:clean      # 清理后重新部署（Docker）
pnpm run deploy:prod:ssl        # 启用SSL部署（Docker）
pnpm run deploy:prod:skip-build # 跳过构建直接部署
```

**部署模式说明：**
- **Docker 模式**（默认）：需要安装 Docker，自动容器化部署
- **无 Docker 模式**：仅需 Node.js 和 pnpm，构建后手动启动服务

详见 [完整部署指南](docs/DEPLOYMENT_GUIDE.md) 或 [快速部署指南](docs/QUICK_DEPLOY.md)

### 游戏入门

#### 电脑端
1. 打开浏览器访问 `http://localhost:4000`
2. 输入玩家名称
3. 选择"创建游戏"并选择玩家数量
4. 点击"创建游戏"按钮
5. 分享房间二维码或房间号给其他玩家

#### 移动端（手机/平板）
1. **确保设备与电脑在同一WiFi网络**
2. **获取电脑IP地址**：
   - Windows: 运行 `ipconfig`，查看 IPv4 地址
   - macOS/Linux: 运行 `ifconfig` 或 `ip addr`
3. **手机浏览器访问**：`http://[电脑IP]:4000`
   - 例如：`http://192.168.1.100:4000`
4. 扫描房间二维码或输入房间号加入游戏

> 💡 提示：创建房间后会自动生成二维码，手机扫码即可快速加入！

#### 管理面板（修改游戏配置）
1. 访问 `http://localhost:4000/admin`
2. 输入管理员密码（在 `.env` 文件中配置 `REACT_APP_ADMIN`）
3. 可以添加、修改、删除化学反应规则
4. 点击"保存配置"使修改生效

详细使用说明：[管理面板指南](docs/ADMIN_PANEL_GUIDE.md)

## 🔌 API 端点

### REST API

| 方法 | 端点 | 描述 |
|-----|------|------|
| POST | `/api/game/create` | 创建新游戏 |
| GET | `/api/game/:gameId/:playerId` | 获取游戏状态 |
| POST | `/api/compounds` | 获取元素能组成的物质 |
| POST | `/api/reaction/check` | 检查两个物质是否能反应 |
| GET | `/api/qrcode` | 生成房间二维码 |
| GET | `/api/config` | 获取游戏配置 |
| POST | `/api/config` | 保存游戏配置（管理员）|
| GET | `/api/mobile-info` | 获取移动端访问信息 |

### WebSocket 事件

#### 发送事件
- `joinGame` - 加入游戏（支持重新加入）
- `playCard` - 打出卡牌
- `drawCard` - 摸牌
- `startGame` - 开始游戏（房主）
- `disconnect` - 断开连接

#### 接收事件
- `gameStateUpdate` - 游戏状态更新
- `gameOver` - 游戏结束
- `playerRejoined` - 玩家重新加入
- `error` - 错误消息

## 🧪 核心算法

### 物质反应匹配

1. **元素提取**：从化学式中提取所有元素
   ```
   H2O → [H, O]
   Ca(OH)2 → [Ca, O, H]
   ```

2. **可用物质查找**：根据玩家拥有的元素，查找能组成的所有物质
   ```
   拥有元素: [H, O, Na, Cl]
   可组成: [H2O, NaCl, HCl, NaOH, ...]
   ```

3. **反应验证**：检查两个物质是否在反应数据库中有记录
   ```
   AgNO3 + NaCl → AgCl↓ + NaNO3 ✓
   ```

## 🎯 主要功能

### 核心游戏功能
- ✅ **实时多人游戏**：基于WebSocket的实时同步
- ✅ **智能物质推荐**：根据持有卡牌自动推荐可打出的物质
- ✅ **化学反应验证**：自动检验物质是否能反应
- ✅ **丰富的卡牌类型**：元素卡、特殊卡牌、功能卡
- ✅ **游戏逻辑完整**：支持方向反转、跳过、摸牌等规则
- ✅ **观战模式**：支持中途断线重连和观战
- ✅ **昵称记忆**：自动记住玩家昵称（会话级别）

### 移动端支持
- ✅ **跨设备访问**：支持手机、平板通过局域网访问
- ✅ **二维码分享**：自动生成房间二维码，扫码即可加入
- ✅ **自动API检测**：自动识别访问设备，选择正确的服务器地址
- ✅ **触摸优化**：移动端触摸交互优化
- ✅ **响应式设计**：支持不同屏幕尺寸

### 管理功能
- ✅ **管理面板**：可视化修改游戏配置（访问 `/admin`）
- ✅ **反应规则管理**：动态添加/修改/删除化学反应规则
- ✅ **配置持久化**：配置保存到 `config.json` 文件
- ✅ **实时生效**：配置修改后立即生效，无需重启服务器

### 网络功能
- ✅ **局域网支持**：支持同一WiFi下多设备联机
- ✅ **跨平台**：Windows/macOS/Linux 全平台支持
- ✅ **服务器状态页**：访问服务器根路径查看状态和快速链接

## 🛠️ 技术栈

### 后端
- **Node.js >= 14.0** - JavaScript运行时
- **TypeScript 5.3+** - 类型安全的JavaScript超集
- **Express.js** - Web框架
- **Socket.IO 4.5+** - 实时双向通信
- **ts-node** - TypeScript直接执行
- **QRCode** - 二维码生成

### 前端
- **React 18** - UI框架
- **TypeScript 5.3+** - 类型安全开发
- **Socket.IO-client 4.5+** - WebSocket客户端
- **Axios** - HTTP客户端
- **React Scripts 5.0** - 构建工具链
- **CSS3** - 样式设计

### 工具链
- **pnpm 8.15+** - 快速、节省磁盘空间的包管理器
- **pnpm workspace** - Monorepo管理
- **Docker** - 容器化部署
- **concurrently** - 并发任务运行

### 开发工具
- **nodemon** - 开发热重载
- **TypeScript Compiler** - 类型检查和编译

## 📝 扩展可能性

1. **增强物质库**：添加更多化学物质和反应
2. **用户系统**：注册、登录、排行榜
3. **游戏记录**：保存游戏历史和分析
4. **AI对手**：实现智能机器人玩家
5. **移动端优化**：完全响应式设计
6. **教育模式**：显示化学反应方程式和原理
7. **多语言支持**：国际化适配

## ⚠️ 已知限制

- 仅支持2-12人游戏（4人游戏已经过验证）
- 物质库为简化示例（可根据需要扩展）
- 暂不支持离线游戏存档

---

## 📚 完整文档

所有详细文档已整理到 **[docs/](docs/)** 目录：

| 文档 | 说明 | 适用人群 |
|------|------|--------|
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | 启动应用完整指南 | 👥 所有用户 |
| [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) | 快速参考卡 | ⚡ 快速查阅 |
| [QUICK_START.md](docs/QUICK_START.md) | 游戏规则速查表 | 🎮 游戏玩家 |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | 详细安装指南 | 🔧 安装问题 |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | 技术架构和API | 👨‍💻 开发者 |
| [PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) | 项目技术总结 | 📊 项目概览 |
| [FILE_MANIFEST.md](docs/FILE_MANIFEST.md) | 完整文件清单 | 📋 文件说明 |
| [CLEANUP_SUMMARY.md](docs/CLEANUP_SUMMARY.md) | 项目简化说明 | 📝 了解变更 |
| [INDEX.md](docs/INDEX.md) | 项目索引 | 🔍 查找内容 |
| [COMPLETION_REPORT.md](docs/COMPLETION_REPORT.md) | 完成报告 | ✅ 项目状态 |

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交问题和改进建议！

---

**享受化学UNO的乐趣！** ⚗️🃏
