# 移动端访问指南

## 问题说明

之前的版本使用硬编码的 `localhost:5000` 地址，导致移动设备无法访问服务器。现已修复。

## 修复内容

### 1. 创建 API 配置文件

创建了 `client/src/config/api.js`，自动检测访问方式：
- 在电脑浏览器访问（localhost）时：使用 `http://localhost:5000`
- 在移动设备访问时：使用实际的服务器IP地址和端口

### 2. 更新所有组件

已更新以下文件使用新的API配置：
- `App.js` - Socket.IO 连接
- `GameLobby.js` - 创建/加入房间
- `GameBoard.js` - 游戏操作
- `AdminPanel.js` - 管理面板

### 3. 移动端CSS优化

在 `GameLobby.css` 中添加了移动端优化：
- 所有按钮添加触摸支持（`touch-action: manipulation`）
- 输入框字体大小设为 16px（防止 iOS 自动缩放）
- 移动端最小触摸区域 48px

## 使用方法

### 1. 启动服务器

在项目根目录启动后端服务器：

```bash
cd server
npm start
```

服务器会在 5000 端口启动。

### 2. 启动前端

在另一个终端启动前端开发服务器：

```bash
cd client
npm start
```

前端会在 3000 端口启动。

### 3. 电脑访问

在电脑浏览器中访问：
```
http://localhost:3000
```

### 4. 手机访问

#### 方法一：使用电脑的局域网IP地址

1. **获取电脑IP地址**
   
   在 Windows 上打开命令提示符：
   ```cmd
   ipconfig
   ```
   
   找到类似这样的内容：
   ```
   无线局域网适配器 WLAN:
      IPv4 地址 . . . . . . . . . . . . : 192.168.1.100
   ```

2. **确保手机和电脑在同一WiFi网络**

3. **在手机浏览器中访问**
   ```
   http://192.168.1.100:3000
   ```
   
   （将 `192.168.1.100` 替换为你的实际IP地址）

#### 方法二：使用环境变量指定API地址

在 `client` 目录创建 `.env` 文件：
```env
REACT_APP_API_URL=http://192.168.1.100:5000
```

然后重启前端服务器。

## 验证

### 测试创建房间

1. 在手机浏览器打开游戏
2. 输入玩家名称
3. 点击"创建房间"按钮
4. 应该能看到房间号和二维码

### 检查浏览器控制台

打开手机浏览器的开发者工具（如果支持），查看是否有以下日志：
```
API配置已加载: {
  baseUrl: "http://192.168.1.100:5000",
  hostname: "192.168.1.100",
  isLocalhost: false
}
```

## 常见问题

### Q1: 手机无法连接到服务器

**原因：** 防火墙阻止了端口访问

**解决方法：**
1. 在 Windows 防火墙中允许 Node.js 或端口 3000、5000
2. 临时关闭防火墙测试

### Q2: 点击按钮没有反应

**原因：** 可能是触摸事件问题

**解决方法：**
- 清除浏览器缓存
- 尝试长按按钮
- 检查浏览器控制台的错误信息

### Q3: 输入框聚焦时页面被放大（iOS）

**原因：** 输入框字体小于 16px

**解决方法：** 已在 CSS 中强制设置 `font-size: 16px !important;`

### Q4: 后端API地址错误

**检查方法：**
1. 在手机浏览器打开 `http://你的IP:3000`
2. 按 F12 或打开开发者工具
3. 查看 Console 标签页，应该看到：
   ```
   API配置已加载: {...}
   ```

## 技术说明

### API配置逻辑

```javascript
const getApiBaseUrl = () => {
  // 1. 优先使用环境变量
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. localhost访问使用本地地址
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // 3. 其他情况使用实际主机地址
  return `http://${window.location.hostname}:5000`;
};
```

### 移动端优化CSS

```css
/* 触摸优化 */
button {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  user-select: none;
}

/* 防止iOS自动缩放 */
input {
  font-size: 16px !important;
}

/* 移动端触摸区域 */
@media (max-width: 768px) {
  button {
    min-height: 48px;
  }
}
```

## 生产环境部署

在生产环境中，建议：

1. **使用反向代理（Nginx）**
   - 前端和后端使用同一域名
   - 不需要配置CORS
   - 示例配置：
     ```nginx
     location /api {
       proxy_pass http://localhost:5000;
     }
     
     location /socket.io {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
     }
     ```

2. **使用HTTPS**
   - 保护数据传输
   - 支持更多浏览器功能

3. **构建生产版本**
   ```bash
   cd client
   npm run build
   ```

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 检查后端服务器日志
3. 确保手机和电脑在同一网络
4. 尝试重启服务器和刷新页面
