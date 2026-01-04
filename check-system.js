#!/usr/bin/env node
/**
 * 跨平台兼容性测试脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'pipe' });
    log('green', `✓ ${name} 已安装`);
    return true;
  } catch (err) {
    log('red', `✗ ${name} 未安装`);
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    log('green', `✓ ${name} 存在`);
    return true;
  } else {
    log('yellow', `⚠ ${name} 不存在`);
    return false;
  }
}

console.log('');
log('magenta', '═'.repeat(60));
log('magenta', '  Chemistry UNO - 跨平台兼容性检查');
log('magenta', '═'.repeat(60));
console.log('');

// 系统信息
log('cyan', '【系统信息】');
log('cyan', `  操作系统: ${process.platform}`);
log('cyan', `  架构: ${process.arch}`);
log('cyan', `  Node.js: ${process.version}`);
console.log('');

// 检查必需工具
log('cyan', '【必需工具】');
const hasNode = checkCommand('node --version', 'Node.js');
const hasPnpm = checkCommand('pnpm --version', 'pnpm');
console.log('');

// 检查启动脚本
log('cyan', '【启动脚本】');
checkFile('start.js', 'start.js (跨平台)');
checkFile('start.bat', 'start.bat (Windows)');
checkFile('start.sh', 'start.sh (Linux/Mac)');
console.log('');

// 检查部署脚本
log('cyan', '【部署脚本】');
checkFile('deploy-pnpm.js', 'deploy-pnpm.js (跨平台)');
checkFile('deploy.bat', 'deploy.bat (Windows)');
checkFile('deploy.sh', 'deploy.sh (Linux/Mac)');
console.log('');

// 检查项目结构
log('cyan', '【项目结构】');
checkFile('package.json', 'package.json');
checkFile('pnpm-workspace.yaml', 'pnpm-workspace.yaml');
checkFile('client/package.json', 'client/package.json');
checkFile('server/package.json', 'server/package.json');
checkFile('config.json', 'config.json');
console.log('');

// 检查依赖
log('cyan', '【依赖安装】');
const hasNodeModules = checkFile('node_modules', 'node_modules');
const hasClientModules = checkFile('client/node_modules', 'client/node_modules');
const hasServerModules = checkFile('server/node_modules', 'server/node_modules');
console.log('');

// 检查Linux/Mac脚本权限
if (process.platform !== 'win32') {
  log('cyan', '【脚本权限检查】');
  try {
    const startShStat = fs.statSync('start.sh');
    const deployShStat = fs.statSync('deploy.sh');
    
    const startShExecutable = (startShStat.mode & 0o111) !== 0;
    const deployShExecutable = (deployShStat.mode & 0o111) !== 0;
    
    if (startShExecutable) {
      log('green', '✓ start.sh 可执行');
    } else {
      log('yellow', '⚠ start.sh 需要执行权限: chmod +x start.sh');
    }
    
    if (deployShExecutable) {
      log('green', '✓ deploy.sh 可执行');
    } else {
      log('yellow', '⚠ deploy.sh 需要执行权限: chmod +x deploy.sh');
    }
  } catch (err) {
    log('yellow', '⚠ 无法检查脚本权限');
  }
  console.log('');
}

// 总结
log('magenta', '═'.repeat(60));
if (hasNode && hasPnpm) {
  log('green', '✓ 系统已准备就绪！');
  console.log('');
  log('cyan', '快速启动:');
  if (process.platform === 'win32') {
    log('cyan', '  双击 start.bat 或运行: node start.js');
  } else {
    log('cyan', '  运行: ./start.sh 或 node start.js');
  }
} else {
  log('yellow', '⚠ 请先安装缺失的工具');
  if (!hasPnpm) {
    log('cyan', '  安装 pnpm: npm install -g pnpm');
  }
}
log('magenta', '═'.repeat(60));
console.log('');
