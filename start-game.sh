#!/bin/bash
# Chemistry UNO 启动脚本（Linux/macOS）

echo "======================================"
echo "    启动化学UNO应用"
echo "======================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js"
    echo "请从 https://nodejs.org/ 下载并安装 Node.js"
    exit 1
fi

echo "已检测到Node.js版本:"
node --version

echo ""
echo "======================================"
echo "启动后端服务器 (端口 5000)..."
echo "======================================"

cd server
npm install
npm start &
SERVER_PID=$!

# 等待后端启动
sleep 3

echo ""
echo "======================================"
echo "启动前端应用 (端口 3000)..."
echo "======================================"

cd ../client
npm install
npm start &
CLIENT_PID=$!

echo ""
echo "======================================"
echo "应用启动中..."
echo "后端: http://localhost:5000"
echo "前端: http://localhost:3000"
echo "======================================"
echo ""

# 等待两个进程
wait $SERVER_PID $CLIENT_PID
