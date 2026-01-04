# ⚠️ 化学UNO - WebUI设置指南

本指南帮助解决"看不到WebUI"或网络访问问题。

## 📋 问题诊断

### 快速检查清单

- [ ] 服务器是否正常启动？
- [ ] 端口是否被占用？
- [ ] 防火墙是否允许访问？
- [ ] IP地址是否正确？
- [ ] 网络连接是否正常？

## 🔍 问题1：服务器未启动

### 症状

- 浏览器显示"无法访问此网站"
- 或"连接被拒绝"

### 检查方法

```bash
# 查看进程
# Windows
tasklist | findstr node

# macOS/Linux
ps aux | grep node
```

### 解决方案

```bash
# 启动服务器
pnpm start

# 或使用开发模式
pnpm run dev

# 等待看到：
# Server running on http://localhost:5000
# React app running on http://localhost:3000
```

## 🔍 问题2：端口被占用

### 症状

启动时显示：
```
Error: Port 3000 is already in use
```

### 查找占用进程

**Windows**:
```powershell
# 查找占用端口3000的进程
netstat -ano | findstr :3000

# 输出示例：
# TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
# 最后一列是进程ID (PID)

# 结束进程
taskkill /PID 12345 /F
```

**macOS/Linux**:
```bash
# 查找并结束占用端口的进程
lsof -ti:3000 | xargs kill -9
```

### 更换端口

如果不想关闭占用进程，可以更换端口：

**修改前端端口**:
```bash
# 在 client/.env 文件中添加
PORT=8080
```

**修改后端端口**:
```bash
# 在 server/.env 文件中添加
PORT=8081
```

## 🔍 问题3：防火墙阻止

### Windows防火墙

#### 方法1：允许Node.js程序

1. 打开"控制面板"
2. 选择"Windows Defender 防火墙"
3. 点击"允许应用或功能通过Windows Defender防火墙"
4. 点击"更改设置"（需要管理员权限）
5. 找到"Node.js"或点击"允许其他应用"
6. 勾选"专用"和"公用"网络
7. 点击"确定"

#### 方法2：允许端口（推荐）

```powershell
# 以管理员身份运行PowerShell

# 允许TCP端口3000（前端）
netsh advfirewall firewall add rule name="ChemistryUNO Frontend" dir=in action=allow protocol=TCP localport=3000

# 允许TCP端口5000（后端）
netsh advfirewall firewall add rule name="ChemistryUNO Backend" dir=in action=allow protocol=TCP localport=5000

# 查看规则
netsh advfirewall firewall show rule name=all | findstr ChemistryUNO
```

#### 方法3：创建入站规则（GUI方式）

1. 打开"高级安全Windows Defender防火墙"
2. 选择"入站规则"
3. 点击"新建规则"
4. 选择"端口" → 下一步
5. 选择"TCP"，输入"3000,5000" → 下一步
6. 选择"允许连接" → 下一步
7. 全选（域、专用、公用）→ 下一步
8. 输入名称"Chemistry UNO" → 完成

### macOS防火墙

```bash
# 查看防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 允许Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node

# 重新加载防火墙
sudo pkill -HUP socketfilterfw
```

### Linux防火墙

**Ubuntu/Debian (UFW)**:
```bash
# 允许端口
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp

# 查看状态
sudo ufw status numbered

# 如果UFW未启用
sudo ufw enable
```

**CentOS/RHEL (firewalld)**:
```bash
# 允许端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp

# 重新加载
sudo firewall-cmd --reload

# 查看规则
sudo firewall-cmd --list-all
```

## 🔍 问题4：IP地址错误（移动端）

### 常见错误

❌ 错误的IP地址：
```
http://localhost:3000         # 只能在本机访问
http://127.0.0.1:3000        # 只能在本机访问
```

✅ 正确的IP地址：
```
http://192.168.1.100:3000    # 局域网IP
http://10.0.0.50:3000        # 局域网IP
```

### 获取正确的IP地址

**Windows**:
```powershell
# 方法1：使用ipconfig
ipconfig

# 查找"无线局域网适配器 WLAN"下的"IPv4 地址"
# 例如：192.168.1.100

# 方法2：使用PowerShell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "WLAN*").IPAddress
```

**macOS**:
```bash
# 方法1：使用ifconfig
ifconfig en0 | grep "inet " | awk '{print $2}'

# 方法2：使用networksetup
ipconfig getifaddr en0
```

**Linux**:
```bash
# 方法1：使用ip命令
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1

# 方法2：使用hostname
hostname -I | awk '{print $1}'
```

### 自动获取IP

访问服务器根路径会自动显示：
```
http://localhost:5000
```

页面会显示：
```
移动端访问地址：http://192.168.1.100:3000
```

## 🔍 问题5：网络隔离

### 症状

- 电脑可以访问，手机无法访问
- 已确认在同一WiFi网络
- 防火墙已配置

### 可能原因

1. **AP隔离（客户端隔离）**
   - 路由器启用了AP隔离功能
   - 禁止不同设备之间通信

2. **企业/学校网络策略**
   - 网络管理员设置了访问限制
   - VLN隔离

### 解决方案

#### 方案1：关闭AP隔离

1. 登录路由器管理页面（通常是 192.168.1.1）
2. 找到无线设置
3. 关闭"AP隔离"或"客户端隔离"
4. 保存并重启路由器

#### 方案2：使用手机热点

```
1. 手机开启热点
2. 电脑连接手机热点
3. 其他设备连接手机热点
4. 使用手机热点IP访问
```

#### 方案3：使用有线连接

```
1. 电脑使用有线网络连接路由器
2. 手机使用WiFi连接同一路由器
3. 确保不是访客网络
```

## 🔍 问题6：浏览器兼容性

### 推荐浏览器

✅ 支持良好：
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

⚠️ 可能有问题：
- IE 11 及以下（不支持）
- 旧版本移动浏览器

### 清除浏览器缓存

**Chrome/Edge**:
```
Ctrl + Shift + Delete
选择"缓存的图片和文件"
清除数据
```

**Firefox**:
```
Ctrl + Shift + Delete
选择"缓存"
立即清除
```

**Safari**:
```
Command + Option + E
清空缓存
```

## 🔍 问题7：CORS错误

### 症状

浏览器控制台显示：
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### 解决方案

检查 `server/index.ts` 中的CORS配置：

```typescript
const cors = require('cors');
app.use(cors({
  origin: '*',  // 开发环境允许所有来源
  credentials: true
}));
```

## 🧪 测试网络连通性

### 测试1：本地访问

```bash
# 测试前端
curl http://localhost:3000

# 测试后端
curl http://localhost:5000

# 应该返回HTML或JSON内容
```

### 测试2：局域网访问

```bash
# 在另一台设备上测试
curl http://192.168.1.100:3000
curl http://192.168.1.100:5000
```

### 测试3：Ping测试

```bash
# 从手机ping电脑
# 使用网络工具App（如Network Analyzer）

# 或在电脑上ping手机
ping 192.168.1.101
```

### 测试4：端口扫描

```bash
# 使用telnet测试端口
telnet 192.168.1.100 3000

# 或使用nc（netcat）
nc -zv 192.168.1.100 3000
```

## 📊 完整诊断流程

```bash
# 1. 检查服务是否运行
ps aux | grep node

# 2. 检查端口是否监听
netstat -an | findstr :3000

# 3. 测试本地访问
curl http://localhost:3000

# 4. 获取本机IP
ipconfig  # Windows
ifconfig  # macOS/Linux

# 5. 测试局域网访问
curl http://[本机IP]:3000

# 6. 检查防火墙规则
netsh advfirewall firewall show rule name=all

# 7. 手机测试
# 手机浏览器访问 http://[本机IP]:3000
```

## 💡 最佳实践

1. **开发时关闭不必要的防火墙规则**
2. **使用固定IP地址**（避免DHCP变化）
3. **使用质量好的路由器**（避免网络问题）
4. **定期更新浏览器**
5. **检查网络质量**（WiFi信号强度）

## 📚 相关文档

- [移动端访问指南](MOBILE_ACCESS_GUIDE.md) - 详细的移动端配置
- [快速开始](GETTING_STARTED.md) - 基础设置
- [故障排除](INSTALLATION_GUIDE.md#故障排除) - 更多问题解决

---

[← 返回文档中心](README.md)
