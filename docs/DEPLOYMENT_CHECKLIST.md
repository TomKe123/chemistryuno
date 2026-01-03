# 🚀 生产环境部署检查清单

## 部署前检查（Pre-Deployment）

### 1. 环境准备
- [ ] 服务器系统已安装（推荐 Ubuntu 20.04/22.04 或 CentOS 7/8）
- [ ] 已安装 Node.js 18+（npm 部署方式）
- [ ] 已安装 Docker 20.10+（Docker 部署方式）
- [ ] 已安装 Docker Compose 2.0+（Docker 部署方式）
- [ ] 已安装 Git

### 2. 网络和端口
- [ ] 域名已解析到服务器 IP
- [ ] 防火墙已开放必要端口（80, 443, 3000, 5000）
- [ ] SSL 证书已准备好（Let's Encrypt 或购买的证书）
- [ ] CDN 已配置（可选，推荐）

### 3. 代码准备
- [ ] 代码已推送到 Git 仓库
- [ ] 所有测试已通过
- [ ] 依赖版本已锁定（package-lock.json）
- [ ] 敏感信息已从代码中移除

### 4. 配置文件
- [ ] `.env` 文件已创建并配置
- [ ] 管理员密码已设置（REACT_APP_ADMIN）
- [ ] API_URL 已设置为生产域名
- [ ] config.json 已配置好游戏规则
- [ ] nginx.conf 已根据实际域名修改（Docker 部署）

## 部署过程检查（During Deployment）

### 方式 A：Docker 部署（推荐）
- [ ] Docker 和 Docker Compose 已安装
- [ ] Dockerfile.production 已检查
- [ ] docker-compose.production.yml 已配置
- [ ] 构建镜像成功：`docker-compose -f docker-compose.production.yml build`
- [ ] 容器启动成功：`docker-compose -f docker-compose.production.yml up -d`
- [ ] 容器运行正常：`docker-compose -f docker-compose.production.yml ps`

### 方式 B：npm 手动部署
- [ ] Node.js 已安装
- [ ] 依赖已安装：`npm run install-all`
- [ ] 前端已构建：`npm run build`
- [ ] 服务已启动：`npm start`

## 部署后检查（Post-Deployment）

### 1. 服务健康检查
- [ ] API 服务可访问：`curl http://localhost:5000`
- [ ] 前端页面可访问：访问首页
- [ ] WebSocket 连接正常：测试游戏创建
- [ ] 健康检查脚本通过：`node healthcheck.js`

### 2. 功能测试
- [ ] 创建游戏房间成功
- [ ] 玩家可以加入房间
- [ ] 游戏逻辑运行正常
- [ ] 管理员面板可访问（/admin）
- [ ] 管理员可以修改配置
- [ ] 移动端显示正常

### 3. 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] WebSocket 延迟 < 100ms
- [ ] CPU 使用率 < 50%（空闲时）
- [ ] 内存使用 < 500MB（空闲时）
- [ ] 并发连接测试（至少 20 个玩家）

### 4. 安全检查
- [ ] HTTPS 已启用（生产环境推荐）
- [ ] 管理员密码强度足够
- [ ] CORS 已正确配置
- [ ] 敏感信息未暴露在前端
- [ ] 日志中无敏感信息泄露
- [ ] 防火墙规则已设置

### 5. 日志和监控
- [ ] 日志文件正确写入
- [ ] 日志轮转已配置（Docker）
- [ ] 错误日志可访问
- [ ] 访问日志可访问

### 6. 备份和恢复
- [ ] 配置文件已备份
- [ ] 恢复流程已测试

## 生产环境维护检查（Maintenance）

### 日常检查
- [ ] 每日检查日志错误
- [ ] 每日检查磁盘空间
- [ ] 每日检查服务运行状态
- [ ] 每周检查系统更新
- [ ] 每周检查依赖安全更新

### 定期任务
- [ ] 每月备份配置和数据
- [ ] 每月检查 SSL 证书有效期
- [ ] 每季度性能压测
- [ ] 每季度安全审计

## 🆘 故障排查清单

### 服务无法启动
- [ ] 检查端口占用：`netstat -nltp | grep 5000`
- [ ] 检查配置文件语法
- [ ] 检查环境变量是否正确
- [ ] 检查文件权限

### 性能问题
- [ ] 检查 CPU 和内存使用：`top` 或 `htop`
- [ ] 检查 WebSocket 连接数
- [ ] 检查日志文件大小

### 连接问题
- [ ] 检查防火墙规则
- [ ] 检查 CORS 配置
- [ ] 检查 Nginx 配置（如有）
- [ ] 检查 DNS 解析

## 📝 部署命令速查

### Docker 方式
```bash
# 部署
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 重启
docker-compose -f docker-compose.production.yml restart

# 停止
docker-compose -f docker-compose.production.yml down
```

### npm 方式
```bash
# 安装依赖
npm run install-all

# 构建前端
npm run build

# 启动服务
npm start
```

### 健康检查
```bash
# API 健康检查
curl http://localhost:5000

# 使用健康检查脚本
node healthcheck.js

# Docker 健康检查
docker inspect --format='{{.State.Health.Status}}' chemistryuno-app-1
```

---

**所有检查项完成后，部署即告成功！** ✅
