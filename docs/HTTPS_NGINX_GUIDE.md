# Nginx / 宝塔面板 HTTPS 配置指南

由于您的网站使用了 HTTPS (SSL) 访问，浏览器出于安全原因（Mixed Content 策略），禁止前端 HTTPS 页面请求后端 HTTP 接口。

因此，您**必须**配置 Nginx 反向代理，使前端和后端使用同一个域名和 HTTPS 协议。

## 场景描述

- **前端域名**: `https://cu.tomsite.us.kg`
- **前端服务**: 运行在 `localhost:4000`
- **后端服务**: 运行在 `localhost:4001`
- **问题**: 访问前端正常，但 API 请求 (`http://cu.tomsite.us.kg:4001`) 被浏览器拦截

## 解决方案

我们将前端代码修改为使用相对路径（`/api/...`），然后通过 Nginx 将这些请求转发到后端。

### 1. 宝塔面板配置步骤

1. 登录宝塔面板，进入 **网站** 菜单
2. 找到您的网站 `cu.tomsite.us.kg`，点击 **设置**
3. 进入 **反向代理** 选项卡（如果之前配过，请先删除或修改）
   - **注意**：宝塔的"反向代理"功能通常只能代理一个目标。如果您用它来代理前端 (4000)，我们需要手动修改配置文件来代理后端 (4001)。

4. 推荐方法：点击 **配置文件** 菜单，找到 `server { ... }` 块。

5. 复制以下配置并在配置文件中覆盖或添加相应部分：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name cu.tomsite.us.kg; # 替换您的域名
    
    # SSL 配置 (宝塔会自动生成，保留原样即可)
    # ssl_certificate ...
    # ssl_certificate_key ...
    
    # 1. 前端代理 (React 应用)
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. WebSocket 代理 (Socket.IO)
    location /socket.io {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # 其他宝塔默认配置...
}
```

6. 保存并重载 Nginx 配置。

### 2. 标准 Nginx 配置

如果您直接编辑 `nginx.conf` 或 `/etc/nginx/sites-available/default`：

```nginx
server {
    listen 80;
    server_name cu.tomsite.us.kg;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name cu.tomsite.us.kg;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 验证

配置完成后：
1. 前端代码会自动检测到 HTTPS 协议，并将 API 地址设置为空字符串。
2. 浏览器发出的请求将变为：`https://cu.tomsite.us.kg/api/setup/check` (不再带 :4001 端口)。
3. Nginx 接收请求，转发给本地的 4001 端口。
4. Mixed Content 错误和 Network Error 应该消失。

## 重要提示

应用新的前端代码需要**重新构建**：

```bash
pnpm run build
pnpm run deploy
```
