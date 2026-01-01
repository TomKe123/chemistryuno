# 安装和依赖管理指南

## 📋 前置要求

### 必需
- **Node.js**: >= 14.0 LTS 
  - 下载: https://nodejs.org/
  - 验证: `node --version` (应该 >= v14.0.0)

- **npm**: >= 6.0 (通常与Node.js一起安装)
  - 验证: `npm --version`

### 可选
- **yarn**: 作为 npm 的替代（不必需）
- **Git**: 版本控制（如果用git clone）

---

## 🔧 安装步骤

### 第1步：检查环境

```powershell
# Windows PowerShell / CMD
node --version
npm --version

# 输出示例：
# v18.13.0
# 8.19.3
```

### 第2步：安装后端依赖

```bash
cd d:\SystemFolders\Desktop\chemistryuno\server
npm install
```

**预期输出**：
```
added 60 packages in 10s
```

**安装的包**：
- express (Web框架)
- socket.io (实时通信)
- cors (跨域支持)
- 其他依赖...

### 第3步：安装前端依赖

```bash
cd ../client
npm install
```

**预期输出**：
```
added 1500+ packages in 2-3 minutes
```

**关键包**：
- react (UI框架)
- react-dom (React渲染)
- socket.io-client (WebSocket客户端)
- react-scripts (构建工具)
- axios (HTTP客户端)

---

## 📦 依赖详解

### 后端依赖 (server/package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "socket.io": "^4.5.4"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

| 包 | 版本 | 用途 |
|---|------|------|
| express | 4.18.2 | Web框架，处理HTTP请求 |
| socket.io | 4.5.4 | 实时双向通信 |
| cors | 2.8.5 | 跨域资源共享 |
| nodemon | 2.0.20 | 开发时自动重启服务器 |

### 前端依赖 (client/package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.5.4",
    "axios": "^1.3.4"
  }
}
```

| 包 | 版本 | 用途 |
|---|------|------|
| react | 18.2.0 | React库 |
| react-dom | 18.2.0 | React DOM渲染 |
| react-scripts | 5.0.1 | Create React App构建工具 |
| socket.io-client | 4.5.4 | WebSocket客户端 |
| axios | 1.3.4 | HTTP请求库 |

---

## 🚀 启动应用

> 📖 详细的启动指南请查看 [GETTING_STARTED.md](GETTING_STARTED.md)

### 方式1：npm 一键启动（推荐）⭐

```bash
# 项目根目录
npm install    # 首次需要安装依赖
npm start      # 启动前后端
```

应用将自动启动：
- **后端**: http://localhost:5000
- **前端**: http://localhost:3000

### 方式2：Docker 容器化启动

```bash
docker-compose up
```

应用地址：http://localhost:3000

---

## 📝 npm 常用命令

### 前端命令

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 运行测试
npm test

# 弹出配置（不可逆！）
npm run eject
```

---

## 🔄 更新依赖

### 查看可更新的包

```bash
npm outdated
```

### 更新所有包到最新版本

```bash
npm update
```

### 更新特定包

```bash
npm install package_name@latest
```

### 安全审计

```bash
npm audit
npm audit fix  # 自动修复安全问题
```

---

## 🗑️ 清理和重置

### 清理 node_modules（节省空间）

```bash
# 删除 node_modules
rm -rf node_modules  # Linux/macOS
rmdir /s node_modules  # Windows

# 重新安装
npm install
```

### 清理 npm 缓存

```bash
npm cache clean --force
```

### 完全重置项目

```bash
# 后端
cd server
rm -rf node_modules package-lock.json
npm install

# 前端
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 安全最佳实践

### 1. 定期更新依赖
```bash
npm update
npm audit fix
```

### 2. 使用 package-lock.json
- ✓ 保证依赖版本一致性
- ✓ 提高安装速度
- ✓ 增强安全性

### 3. 避免危险命令
- ❌ `npm install -g` (全局安装)
- ❌ `sudo npm` (用管理员权限)
- ❌ 删除 package-lock.json

### 4. 检查安全漏洞
```bash
npm audit
```

---

## 🐛 常见问题

### Q1: npm install 很慢
**A**: 使用淘宝镜像或换网络
```bash
npm config set registry https://registry.npm.taobao.org
# 恢复默认
npm config set registry https://registry.npmjs.org/
```

### Q2: 找不到 node 或 npm
**A**: Node.js未安装或不在PATH中
```bash
# 验证
which node  # Linux/macOS
where node  # Windows
```

### Q3: 依赖冲突
**A**: 删除node_modules后重新安装
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q4: 权限错误 (Permission denied)
**A**: 检查目录权限
```bash
# Linux/macOS
sudo chown -R $USER:$USER .

# Windows (以管理员身份运行终端)
```

### Q5: 某个包安装失败
**A**: 尝试单独安装该包
```bash
npm install package_name --save
```

---

## 📊 安装过程检查清单

- [ ] Node.js 已安装 (v14+)
- [ ] npm 已安装 (v6+)
- [ ] 后端依赖已安装 (`server/node_modules/`)
- [ ] 前端依赖已安装 (`client/node_modules/`)
- [ ] 后端可启动 (npm start)
- [ ] 前端可启动 (npm start)
- [ ] 浏览器可访问 http://localhost:3000
- [ ] WebSocket 连接正常

---

## 📚 相关资源

### 官方文档
- [Node.js 官网](https://nodejs.org/)
- [npm 官网](https://www.npmjs.com/)
- [Express 文档](https://expressjs.com/)
- [React 文档](https://react.dev/)

### 包信息
```bash
# 查看特定包的详细信息
npm info express

# 查看包的GitHub主页
npm home socket.io

# 查看包的已知问题
npm bugs react
```

---

## 🎯 下一步

安装完成后：

1. ✅ 启动应用: 查看 [GETTING_STARTED.md](GETTING_STARTED.md) 获取启动指南
2. ✅ 打开浏览器: http://localhost:3000
3. ✅ 开始游戏: 创建游戏或加入现有游戏
4. ✅ 阅读文档: 查看 README.md 了解游戏规则

---

**需要启动应用？** 查看 [GETTING_STARTED.md](GETTING_STARTED.md)

**需要技术细节？** 查看 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

*最后更新: 2026年*
