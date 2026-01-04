#!/usr/bin/env node
/**
 * Chemistry UNO - PNPM 一键部署方案
 * 不需要 Docker，直接使用 Node.js 运行
 */

const { execSync, spawn } = require('child_process');
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
  header('Chemistry UNO - PNPM 一键部署');
  
  log('cyan', '[→] 平台: ' + process.platform);
  log('cyan', '[→] Node.js: ' + process.version);
  
  // 检查依赖
  log('cyan', '\n[→] 检查必需工具...');
  if (!exec('pnpm --version', null)) {
    log('red', '[✗] 缺少 pnpm，请先安装: npm install -g pnpm');
    process.exit(1);
  }
  log('green', '[✓] pnpm 已安装');
  
  // 安装依赖
  if (!exec('pnpm install', '\n[→] 安装项目依赖...')) {
    log('red', '[✗] 依赖安装失败');
    process.exit(1);
  }
  log('green', '[✓] 依赖安装完成');
  
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
  
  // 检查配置文件
  if (!fs.existsSync('config.json')) {
    log('yellow', '[!] config.json 不存在，使用默认配置');
  }
  
  // 成功信息
  console.log('');
  log('green', '═'.repeat(60));
  log('green', '  部署完成！');
  log('green', '═'.repeat(60));
  console.log('');
  
  log('cyan', '启动服务：');
  log('cyan', '  1. 后端：cd server && node dist/index.js');
  log('cyan', '  2. 前端：npx serve -s client/build -l 4000');
  log('cyan', '  或使用：pnpm run serve');
  console.log('');
  log('cyan', '访问地址：');
  log('cyan', '  前端：http://localhost:4000');
  log('cyan', '  后端：http://localhost:5000');
  console.log('');
  
  // 询问是否自动启动
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  //readline.question('\n是否立即启动服务？(y/N) ', (answer) => {
    //readline.close();
    
    if (true) {
      log('green', '\n[→] 正在启动服务...\n');
      
      // 启动后端
      const backend = spawn('node', ['server/dist/index.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      // 等待2秒后启动前端
      setTimeout(() => {
        const frontend = spawn('npx', ['serve', '-s', 'client/build', '-l', '4000'], {
          stdio: 'inherit',
          shell: true
        });
        
        console.log('');
        log('green', '服务已启动！');
        log('cyan', '访问 http://localhost:4000');
        log('yellow', '按 Ctrl+C 停止服务');
      }, 2000);
    } else {
      log('cyan', '\n请手动启动服务：');
      log('cyan', '  pnpm run serve');
    }
  };


deploy().catch(err => {
  log('red', `[✗] 部署失败: ${err.message}`);
  process.exit(1);
});
