# 🔧 化学UNO - 安装指南

本文档提供详细的安装步骤和常见问题解决方案。

## 📋 目录

- [系统要求](#系统要求)
- [安装Node.js](#安装nodejs)
- [安装pnpm](#安装pnpm)
- [安装项目依赖](#安装项目依赖)
- [验证安装](#验证安装)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

## 💻 系统要求

### 操作系统
- Windows 7/10/11
- macOS 10.13+
- Linux（Ubuntu 18.04+、CentOS 7+ 等）

### 硬件要求
- **CPU**: 双核及以上
- **内存**: 至少 2GB RAM（推荐 4GB+）
- **磁盘空间**: 至少 500MB 可用空间

### 软件要求
- **Node.js**: >= 14.0（推荐 LTS 版本）
- **pnpm**: >= 8.0（推荐最新版本）
- **浏览器**: Chrome、Firefox、Safari、Edge（现代浏览器）

## 📦 安装Node.js

### Windows

#### 方法一：使用官方安装包（推荐）

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 LTS 版本（长期支持版）
3. 运行安装程序，按提示完成安装
4. 安装过程中建议勾选"Add to PATH"

#### 方法二：使用包管理器

使用 Chocolatey：
```powershell
choco install nodejs-lts
```

使用 Scoop：
```powershell
scoop install nodejs-lts
```

### macOS

#### 方法一：使用Homebrew（推荐）

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node
```

#### 方法二：使用官方安装包

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 macOS 安装包
3. 运行 .pkg 文件完成安装

### Linux

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装Node.js LTS版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### CentOS/RHEL

```bash
# 安装Node.js LTS版本
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

#### 使用nvm（推荐，支持版本管理）

```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载shell配置
source ~/.bashrc  # 或 ~/.zshrc

# 安装Node.js LTS
nvm install --lts

# 设置默认版本
nvm alias default node
```

### 验证Node.js安装

```bash
# 检查Node.js版本
node --version
# 输出示例：v18.17.0

# 检查npm版本
npm --version
# 输出示例：9.6.7
```

## ⚡ 安装pnpm

### 使用npm安装（推荐）

```bash
# 全局安装pnpm
npm install -g pnpm

# 验证安装
pnpm --version
# 输出示例：8.15.0
```

### 其他安装方法

#### Windows PowerShell

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

#### macOS/Linux

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### 使用Homebrew（macOS）

```bash
brew install pnpm
```

### 配置pnpm（可选）

```bash
# 设置淘宝镜像（中国用户推荐）
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config get registry
```

## 📥 安装项目依赖

### 1. 获取项目代码

```bash
# 克隆项目（如果使用Git）
git clone <项目地址>
cd chemistryuno

# 或解压下载的ZIP文件
```

### 2. 安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 首次安装可能需要3-5分钟
# 安装完成后会看到：
# dependencies: +XXX
# Done in X.Xs
```

### 安装过程说明

pnpm 会自动：
1. 读取 `pnpm-workspace.yaml` 配置
2. 安装根目录依赖
3. 安装 `client/` 前端依赖
4. 安装 `server/` 后端依赖
5. 链接工作区内的包

### 如果使用npm

```bash
# 安装根依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 安装后端依赖
cd server
npm install
cd ..
```

## ✅ 验证安装

### 1. 检查依赖安装

```bash
# 检查pnpm安装的包
pnpm list --depth=0

# 应该看到类似输出：
# chemistryuno@1.0.0
# ├── concurrently 8.2.2
# ├── qrcode 1.5.3
# └── ...
```

### 2. 启动测试

```bash
# 启动开发服务器
pnpm start

# 等待服务启动（约10-20秒）
# 应该看到：
# Server running on http://localhost:5000
# React app running on http://localhost:3000
```

### 3. 浏览器测试

打开浏览器访问：
- http://localhost:3000 - 前端界面
- http://localhost:5000 - 后端API

看到游戏界面说明安装成功！

## ❓ 常见问题

### Q1: npm install 速度很慢

**原因**：国内访问npm官方源速度慢

**解决方案**：

```bash
# 方案1：使用pnpm（本身就很快）
npm install -g pnpm
pnpm install

# 方案2：使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install

# 方案3：使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### Q2: 权限错误（EACCES）

**Windows系统**：
```powershell
# 以管理员身份运行PowerShell
npm install -g pnpm
```

**macOS/Linux系统**：
```bash
# 方案1：使用sudo
sudo npm install -g pnpm

# 方案2：修改npm默认目录（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g pnpm
```

### Q3: node-gyp 编译错误

**Windows系统**：
```powershell
# 安装构建工具
npm install -g windows-build-tools
```

**macOS系统**：
```bash
# 安装Xcode命令行工具
xcode-select --install
```

**Linux系统**：
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

### Q4: 版本不兼容

```bash
# 检查Node.js版本
node --version

# 如果版本低于14.0，需要升级
# 使用nvm管理版本
nvm install 18
nvm use 18
```

### Q5: pnpm install 失败

```bash
# 清除pnpm缓存
pnpm store prune

# 删除lock文件和node_modules
rm -rf node_modules pnpm-lock.yaml
rm -rf client/node_modules client/pnpm-lock.yaml
rm -rf server/node_modules server/pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q6: Cannot find module 'xxx'

**原因**：依赖未正确安装

**解决方案**：
```bash
# 重新安装依赖
pnpm install

# 或安装特定包
pnpm add <package-name>
```

### Q7: 端口被占用

```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 结束进程
taskkill /PID <进程ID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 🔧 故障排除

### 完全重装

如果遇到无法解决的问题，尝试完全重装：

```bash
# 1. 删除所有依赖
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
rm -rf pnpm-lock.yaml
rm -rf client/pnpm-lock.yaml
rm -rf server/pnpm-lock.yaml

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, client/node_modules, server/node_modules, pnpm-lock.yaml, client/pnpm-lock.yaml, server/pnpm-lock.yaml

# 2. 清除缓存
pnpm store prune
npm cache clean --force

# 3. 重新安装
pnpm install
```

### 检查环境变量

**Windows**：
```powershell
# 检查PATH
$env:PATH

# 应该包含Node.js路径，例如：
# C:\Program Files\nodejs\
```

**macOS/Linux**：
```bash
# 检查PATH
echo $PATH

# 应该包含Node.js路径
which node
which npm
which pnpm
```

### 日志分析

```bash
# 查看详细安装日志
pnpm install --loglevel verbose

# 查看错误详情
pnpm install --loglevel error
```

## 📚 相关文档

- [快速开始指南](GETTING_STARTED.md) - 安装后的下一步
- [pnpm迁移指南](PNPM_MIGRATION_GUIDE.md) - 从npm迁移到pnpm
- [开发者指南](DEVELOPER_GUIDE.md) - 开发环境配置

## 💡 建议

1. **优先使用pnpm**：速度快、节省空间
2. **使用LTS版本的Node.js**：更稳定
3. **国内用户使用镜像源**：提高下载速度
4. **定期更新依赖**：`pnpm update`

---

[← 返回文档中心](README.md)
