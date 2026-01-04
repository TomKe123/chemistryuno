#!/usr/bin/env node
/**
 * Chemistry UNO - Docker 一键部署方案
 * 需要 Docker 和 Docker Compose
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, description) {
  if (description) {
    log('cyan', `[→] ${description}`);
  }
  try {
    execSync(command, { stdio: 'inherit', shell: true });
    return true;
  } catch (err) {
    return false;
  }
}

function header(title) {
  console.log('');
  log('magenta', '═'.repeat(60));
  log('magenta', `  ${title}`);
  log('magenta', '═'.repeat(60));
  console.log('');
}

async function deploy() {
  header('Chemistry UNO - Docker 一键部署');
  
  log('cyan', '[→] 平台: ' + process.platform);
  log('cyan', '[→] Node.js: ' + process.version);
  
  // 检查 Docker
  log('cyan', '\n[→] 检查 Docker...');
  if (!exec('docker --version', null)) {
    log('red', '[✗] 缺少 Docker，请先安装 Docker Desktop');
    log('cyan', '下载地址: https://www.docker.com/products/docker-desktop');
    process.exit(1);
  }
  log('green', '[✓] Docker 已安装');
  
  // 检查 Docker Compose
  if (!exec('docker-compose --version', null)) {
    log('red', '[✗] 缺少 Docker Compose');
    process.exit(1);
  }
  log('green', '[✓] Docker Compose 已安装');
  
  // 安装依赖（构建需要）
  if (!exec('pnpm install', '\n[→] 安装项目依赖...')) {
    log('red', '[✗] 依赖安装失败');
    process.exit(1);
  }
  log('green', '[✓] 依赖安装完成');
  
  // 检查环境变量文件
  const clientEnvFile = path.join(process.cwd(), 'client', '.env.production');
  if (!fs.existsSync(clientEnvFile)) {
    log('yellow', '[!] client/.env.production 不存在，正在创建...');
    const envContent = `# 生产环境变量
REACT_APP_ADMIN=Kc@20100205!
PORT=4000
BROWSER=none
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
`;
    fs.writeFileSync(clientEnvFile, envContent, 'utf-8');
    log('green', '[✓] 已创建 client/.env.production');
  }
  
  // 构建前端
  if (!exec('cd client && pnpm run build', '\n[→] 构建前端应用...')) {
    log('red', '[✗] 前端构建失败');
    process.exit(1);
  }
  log('green', '[✓] 前端构建完成');
  
  // 构建后端
  if (!exec('cd server && pnpm run build', '\n[→] 构建后端应用...')) {
    log('red', '[✗] 后端构建失败');
    process.exit(1);
  }
  log('green', '[✓] 后端构建完成');
  
  // 停止旧容器
  log('cyan', '\n[→] 停止旧容器...');
  exec('docker-compose -f docker-compose.production.yml down', null);
  
  // 构建 Docker 镜像
  if (!exec('docker-compose -f docker-compose.production.yml build', '\n[→] 构建 Docker 镜像...')) {
    log('red', '[✗] Docker 构建失败');
    process.exit(1);
  }
  log('green', '[✓] Docker 构建完成');
  
  // 启动容器
  if (!exec('docker-compose -f docker-compose.production.yml up -d', '\n[→] 启动容器...')) {
    log('red', '[✗] 容器启动失败');
    process.exit(1);
  }
  log('green', '[✓] 容器启动成功');
  
  // 等待服务就绪
  log('cyan', '\n[→] 等待服务就绪...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 显示状态
  log('cyan', '\n[→] 容器状态：');
  exec('docker-compose -f docker-compose.production.yml ps', null);
  
  // 成功信息
  console.log('');
  log('green', '═'.repeat(60));
  log('green', '  部署完成！');
  log('green', '═'.repeat(60));
  console.log('');
  
  log('cyan', '访问地址：');
  log('cyan', '  前端：http://localhost:4000');
  log('cyan', '  后端：http://localhost:5000');
  console.log('');
  
  log('cyan', '常用命令：');
  log('cyan', '  查看日志：docker-compose -f docker-compose.production.yml logs -f');
  log('cyan', '  停止服务：docker-compose -f docker-compose.production.yml down');
  log('cyan', '  重启服务：docker-compose -f docker-compose.production.yml restart');
  console.log('');
}

deploy().catch(err => {
  log('red', `[✗] 部署失败: ${err.message}`);
  process.exit(1);
});
