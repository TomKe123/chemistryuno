@echo off
REM 化学UNO 启动脚本（Windows）

echo ======================================
echo     启动化学UNO应用
echo ======================================

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到Node.js
    echo 请从 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)

echo 已检测到Node.js版本:
node --version

REM 创建一个检查依赖的脚本
echo 正在检查依赖...

REM 启动后端服务器
echo.
echo ======================================
echo 启动后端服务器 (端口 5000)...
echo ======================================

start "Chemistry-UNO Server" cmd /k "cd server && npm install && npm start"

REM 等待3秒让后端启动
timeout /t 3 /nobreak

REM 启动前端应用
echo.
echo ======================================
echo 启动前端应用 (端口 3000)...
echo ======================================

start "Chemistry-UNO Client" cmd /k "cd client && npm install && npm start"

echo.
echo ======================================
echo 应用启动中...
echo 后端: http://localhost:5000
echo 前端: http://localhost:3000
echo 浏览器将在几秒后自动打开
echo ======================================
echo.
pause
