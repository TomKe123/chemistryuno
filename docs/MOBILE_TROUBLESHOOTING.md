# 移动端问题排查指南

## 问题：手机端无法创建/加入房间

### 已修复的问题

#### 1. CORS 跨域配置限制
**问题：** Socket.IO 和 Express 的 CORS 配置只允许 `http://localhost:3000`，移动设备无法连接。

**修复：** 
- 更新 `server/index.js` 的 CORS 配置
- 支持局域网 IP 地址访问
- 支持 192.168.x.x, 10.x.x.x, 172.16-31.x.x 等局域网地址

#### 2. 错误提示不明确
**问题：** 移动端连接失败时，错误信息过于简单，无法诊断问题。

**修复：**
- 添加详细的控制台日志
- 显示完整的错误信息和网络状态

## 使用方法

### 1. 获取电脑 IP 地址

在电脑上打开 PowerShell 或命令提示符：

```powershell
ipconfig | Select-String "IPv4"
```

或者

```cmd
ipconfig | findstr "IPv4"
```

找到你的局域网 IP，例如：`192.168.1.100`

### 2. 确保服务器正在运行

#### 启动后端服务器
```bash
cd server
npm start
```

服务器应该显示：
```
服务器运行在 http://localhost:5000
```

#### 启动前端开发服务器
```bash
cd client
npm start
```

前端应该显示：
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.1.100:3000
```

### 3. 在手机上访问

1. **确保手机和电脑在同一 WiFi 网络**

2. **在手机浏览器中输入地址：**
   ```
   http://192.168.1.100:3000
   ```
   （替换为你的实际 IP 地址）

3. **打开浏览器开发者工具**（如果支持）
   - Chrome Android: 地址栏输入 `chrome://inspect`
   - Safari iOS: 设置 → Safari → 高级 → 网页检查器

### 4. 测试创建房间

1. 在手机浏览器打开游戏
2. 输入玩家名称（例如：`测试玩家`）
3. 点击"创建房间"按钮
4. 查看浏览器控制台的日志

**预期的控制台日志：**
```
API配置已加载: {
  baseUrl: "http://192.168.1.100:5000",
  hostname: "192.168.1.100",
  isLocalhost: false
}

📱 开始创建房间...
API端点: http://192.168.1.100:5000/api/game/create
玩家名称: 测试玩家

✅ 创建房间成功: {
  roomCode: "ABCD",
  playerId: "uuid-xxx",
  ...
}
```

**如果看到错误：**
```
❌ 创建房间失败: Network Error
错误详情: {
  message: "Network Error",
  url: "http://192.168.1.100:5000/api/game/create"
}
```

## 常见问题排查

### 问题 1: Network Error / 网络错误

**可能原因：**
1. 防火墙阻止了端口访问
2. 服务器没有运行
3. IP 地址输入错误
4. 手机和电脑不在同一网络

**解决方法：**

#### A. 检查防火墙设置（Windows）

打开 PowerShell（管理员权限）：

```powershell
# 允许端口 3000（前端）
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000

# 允许端口 5000（后端）
netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=TCP localport=5000
```

或者临时关闭防火墙测试：
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

#### B. 测试服务器连接

在手机浏览器直接访问后端：
```
http://192.168.1.100:5000
```

应该看到服务器状态页面。

#### C. 使用 curl 测试 API

在电脑上测试：
```bash
curl -X POST http://192.168.1.100:5000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"playerName":"测试玩家"}'
```

### 问题 2: CORS Error / 跨域错误

**错误信息：**
```
Access to XMLHttpRequest at 'http://192.168.1.100:5000/api/game/create' 
from origin 'http://192.168.1.100:3000' has been blocked by CORS policy
```

**解决方法：**

检查服务器日志，应该看到：
```
✓ 允许的来源: http://192.168.1.100:3000
```

如果看到：
```
🚫 拒绝的来源: http://192.168.1.100:3000
```

说明 CORS 配置有问题。检查 `server/index.js` 中的 CORS 配置。

### 问题 3: Socket.IO 连接失败

**错误信息：**
```
WebSocket connection to 'ws://192.168.1.100:5000/socket.io/' failed
```

**解决方法：**

1. 检查服务器日志中的 Socket.IO CORS 配置
2. 确保允许 WebSocket 连接
3. 检查是否有代理服务器干扰

### 问题 4: iOS 自动缩放

**现象：** 点击输入框时页面被放大

**解决方法：** 已在 CSS 中修复（输入框字体 16px）

### 问题 5: 按钮点击无响应

**可能原因：**
1. CSS `pointer-events` 被禁用
2. JavaScript 错误阻止了执行
3. 触摸事件冲突

**解决方法：**

检查控制台是否有 JavaScript 错误：
```
Uncaught TypeError: ...
```

检查 CSS 中是否有：
```css
button {
  pointer-events: none; /* 应该是 auto */
}
```

### 问题 6: 请求超时

**现象：** 请求一直处于 pending 状态

**可能原因：**
1. 网络延迟过高
2. 服务器负载过高
3. 后端没有正确响应

**解决方法：**

增加 axios 超时时间：
```javascript
axios.post(url, data, { timeout: 10000 }) // 10秒超时
```

## 调试技巧

### 1. 查看完整的请求信息

在 `GameLobby.js` 中，已添加详细日志：
```javascript
console.log('📱 开始创建房间...');
console.log('API端点:', API_ENDPOINTS.createGame);
console.log('玩家名称:', playerName.trim());
```

### 2. 使用 Chrome 远程调试

1. 电脑上打开 Chrome
2. 访问 `chrome://inspect`
3. 连接手机（USB 或同一网络）
4. 可以实时查看手机浏览器的控制台

### 3. 使用网络抓包

使用 Charles 或 Fiddler 查看 HTTP 请求：
- 请求 URL 是否正确
- 请求头是否包含 Content-Type
- 响应状态码
- 响应内容

### 4. 简化测试

创建一个简单的测试页面：
```html
<!DOCTYPE html>
<html>
<body>
<button onclick="testAPI()">测试 API</button>
<div id="result"></div>

<script>
async function testAPI() {
  try {
    const response = await fetch('http://192.168.1.100:5000/api/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({playerName: '测试'})
    });
    
    const data = await response.json();
    document.getElementById('result').innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('result').innerText = 'Error: ' + err.message;
  }
}
</script>
</body>
</html>
```

## 验证清单

- [ ] 电脑 IP 地址正确
- [ ] 手机和电脑在同一 WiFi
- [ ] 后端服务器正在运行（端口 5000）
- [ ] 前端开发服务器正在运行（端口 3000）
- [ ] 防火墙允许端口 3000 和 5000
- [ ] 可以在手机浏览器访问 `http://IP:5000`
- [ ] 可以在手机浏览器访问 `http://IP:3000`
- [ ] 浏览器控制台显示 API 配置日志
- [ ] 没有 CORS 错误
- [ ] 没有 Network Error
- [ ] Socket.IO 连接成功

## 服务器日志示例

**正常连接：**
```
✓ 允许的来源: http://192.168.1.100:3000
📝 创建新房间: ABCD
✓ 玩家 测试玩家 创建了房间 ABCD
已连接到服务器
```

**被拒绝的连接：**
```
🚫 拒绝的来源: http://unknown-ip:3000
```

## 技术细节

### 更新的 CORS 配置

```javascript
// server/index.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // 支持局域网IP访问
  /^http:\/\/192\.168\.\d+\.\d+:3000$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:3000$/,
  // 支持任意IP地址（开发环境）
  /^http:\/\/[\d.]+:3000$/
];
```

### API 动态地址配置

```javascript
// client/src/config/api.js
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  // 移动设备自动使用当前主机的 5000 端口
  return `http://${window.location.hostname}:5000`;
};
```

## 生产环境建议

在生产环境中，应该：

1. **使用反向代理（Nginx）**
   - 前后端使用同一域名
   - 避免 CORS 问题

2. **使用 HTTPS**
   - 保护数据安全
   - 支持 Service Worker

3. **环境变量配置**
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

4. **限制 CORS 来源**
   ```javascript
   origin: 'https://yourdomain.com'
   ```

## 需要帮助？

如果按照以上步骤仍然无法解决问题：

1. 收集以下信息：
   - 手机型号和浏览器版本
   - 电脑 IP 地址
   - 浏览器控制台的完整错误信息
   - 服务器端的日志输出

2. 检查是否有以下限制：
   - 企业网络防火墙
   - 路由器隔离设置
   - VPN 或代理干扰

3. 尝试：
   - 使用电脑浏览器的手机模拟模式测试
   - 使用另一部手机测试
   - 在不同的 WiFi 网络下测试
