#!/usr/bin/env node
/**
 * Chemistry UNO - 跨平台生产环境部署脚本
 * 支持 Windows, Linux, macOS
 * 支持 Docker 和 非 Docker 部署模式
 */

const { execSync } = require('child_process');
const fs = require('fs');

// 命令行参数解析
const args = process.argv.slice(2);
const options = {
  skipBuild: args.includes('--skip-build'),
  skipTests: args.includes('--skip-tests'),
  withSSL: args.includes('--with-ssl'),
  clean: args.includes('--clean'),
  noDocker: args.includes('--no-docker'),
  help: args.includes('--help') || args.includes('-h')
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function colorLog(color, prefix, message) {
  console.log(`${colors[color]}${prefix} ${message}${colors.reset}`);
}

function success(message) {
  colorLog('green', '[SUCCESS]', message);
}

function error(message) {
  colorLog('red', '[ERROR]', message);
}

function info(message) {
  colorLog('cyan', '[INFO]', message);
}

function warning(message) {
  colorLog('yellow', '[WARNING]', message);
}

function header(message) {
  console.log('');
  colorLog('magenta', '='.repeat(60), '');
  colorLog('magenta', '', message);
  colorLog('magenta', '='.repeat(60), '');
  console.log('');
}

// 执行命令
function exec(command, description) {
  if (description) {
    info(description);
  }
  try {
    execSync(command, { stdio: 'inherit', shell: true });
    return true;
  } catch (err) {
    return false;
  }
}

// 检查命令是否存在
function commandExists(command) {
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${cmd} ${command}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
Chemistry UNO Production Deployment Script
==========================================

Usage: node deploy.js [options]
       npm run deploy:prod [-- options]
       pnpm run deploy:prod [-- options]

Options:
  --no-docker     Deploy without Docker (direct Node.js mode)
  --skip-build    Skip build steps
  --skip-tests    Skip test steps
  --with-ssl      Enable SSL/HTTPS support (Docker mode only)
  --clean         Clean all containers and images before deployment (Docker mode only)
  --help, -h      Show this help message

Deployment Modes:
  Docker Mode (default):     Uses Docker containers (requires Docker)
  No-Docker Mode:            Runs directly with Node.js (use --no-docker flag)

Examples:
  node deploy.js                     # Standard Docker deployment
  node deploy.js --no-docker         # Deploy without Docker
  node deploy.js --with-ssl          # Deploy with SSL (Docker)
  node deploy.js --clean             # Clean and redeploy (Docker)
  node deploy.js --skip-build        # Skip build and deploy
  
  pnpm run deploy:prod               # Using pnpm (Docker)
  pnpm run deploy:prod:no-docker     # Using pnpm without Docker
  pnpm run deploy:prod -- --clean    # Using pnpm with options
`);
  process.exit(0);
}

// 主部署流程
async function deploy() {
  if (options.help) {
    showHelp();
  }

  header('Chemistry UNO - Production Deployment');
  info(`Platform: ${process.platform}`);
  info(`Node.js: ${process.version}`);
  info(`Deployment Mode: ${options.noDocker ? 'No-Docker (Direct Node.js)' : 'Docker'}`);

  // 检查必要的依赖
  info('Checking required dependencies...');
  const requiredCommands = ['node', 'pnpm'];
  
  // Docker 只在非 no-docker 模式下是必需的
  if (!options.noDocker) {
    requiredCommands.push('docker', 'docker-compose');
  }
  
  const missingCommands = requiredCommands.filter(cmd => !commandExists(cmd));

  if (missingCommands.length > 0) {
    error(`Missing required commands: ${missingCommands.join(', ')}`);
    if (!options.noDocker && (missingCommands.includes('docker') || missingCommands.includes('docker-compose'))) {
      info('Tip: Use --no-docker flag to deploy without Docker');
    }
    error('Please install missing tools first');
    process.exit(1);
  }
  success('All dependencies check passed');

  // 显示版本信息
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    info(`pnpm: ${pnpmVersion}`);
    
    if (!options.noDocker) {
      const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
      info(`Docker: ${dockerVersion}`);
    }
  } catch (e) {
    // Ignore version check errors
  }

  // 清理选项（仅 Docker 模式）
  if (options.clean && !options.noDocker) {
    warning('Clean mode: Will stop and remove all containers and images');
    
    info('Stopping and removing containers...');
    exec('docker-compose -f docker-compose.production.yml down -v');
    
    info('Removing old images...');
    exec('docker rmi chemistry-uno-app -f 2>/dev/null || true');
    
    success('Clean completed');
  } else if (options.clean && options.noDocker) {
    warning('Clean option is ignored in no-docker mode');
  }

  // 安装依赖
  if (!exec('pnpm install', 'Installing project dependencies...')) {
    error('Dependencies installation failed');
    process.exit(1);
  }
  success('Dependencies installation completed');

  // 运行健康检查
  if (!options.skipTests) {
    info('Running health check...');
    if (!exec('pnpm run health')) {
      warning('Health check failed, but continuing deployment');
    } else {
      success('Health check passed');
    }
  }

  // 构建应用
  if (!options.skipBuild) {
    if (!exec('pnpm run build', 'Building frontend application...')) {
      error('Frontend build failed');
      process.exit(1);
    }
    success('Frontend build completed');

    if (!exec('pnpm run build:server', 'Building backend application...')) {
      error('Backend build failed');
      process.exit(1);
    }
    success('Backend build completed');
  } else {
    warning('Skipping build step');
  }

  // 检查配置文件
  if (!fs.existsSync('config.json')) {
    warning('config.json not found, using default configuration');
    if (fs.existsSync('config.json.example')) {
      fs.copyFileSync('config.json.example', 'config.json');
    }
  }

  if (options.noDocker) {
    // ============ No-Docker 模式 ============
    info('No-Docker mode: Build completed successfully');
    
    if (options.withSSL) {
      warning('SSL option is only available in Docker mode');
    }
    
    // 部署成功
    console.log('');
    colorLog('green', '', '================================================================');
    colorLog('green', '', '              Build Successful!');
    colorLog('green', '', '================================================================');
    console.log('');
    
    success('Chemistry UNO has been built successfully');
    console.log('');
    info('To run the application in production mode:');
    console.log('');
    info('Option 1 - Manual start:');
    info('  1. Backend:  cd server && node dist/index.js');
    info('  2. Frontend: Serve client/build/ with a static file server');
    info('     Example:  npx serve -s client/build -l 3000');
    console.log('');
    info('Option 2 - Development mode (for testing):');
    info('  pnpm start');
    console.log('');
    info('Expected URLs:');
    info('  - Frontend: http://localhost:3000 (or your configured port)');
    info('  - Backend:  http://localhost:5000');
    console.log('');
    info('For production deployment, consider:');
    info('  - Using PM2: pm2 start server/dist/index.js --name chemistry-uno');
    info('  - Using systemd service on Linux');
    info('  - Using nginx to serve static files and proxy API');
    console.log('');
    colorLog('cyan', '', 'Enjoy the game! 🧪🎮');
    console.log('');
    
  } else {
    // ============ Docker 模式 ============
    if (options.withSSL) {
      process.env.COMPOSE_PROFILES = 'with-ssl';
      info('SSL support enabled');
    }

    if (!exec('docker-compose -f docker-compose.production.yml build --no-cache', 'Building Docker image...')) {
      error('Docker image build failed');
      process.exit(1);
    }
    success('Docker image build completed');

    // 停止旧容器
    info('Stopping old containers...');
    exec('docker-compose -f docker-compose.production.yml down');
    success('Old containers stopped');

    // 启动新容器
    const upCommand = options.withSSL
      ? 'docker-compose -f docker-compose.production.yml --profile with-ssl up -d'
      : 'docker-compose -f docker-compose.production.yml up -d';

    if (!exec(upCommand, 'Starting production containers...')) {
      error('Container startup failed');
      process.exit(1);
    }
    success('Containers started successfully');

    // 等待服务启动
    info('Waiting for service to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 检查容器状态
    info('Checking container status...');
    exec('docker-compose -f docker-compose.production.yml ps');

    // 显示日志
    info('Recent logs:');
    exec('docker-compose -f docker-compose.production.yml logs --tail=10');

    // 部署成功
    console.log('');
    colorLog('green', '', '================================================================');
    colorLog('green', '', '              Deployment Successful!');
    colorLog('green', '', '================================================================');
    console.log('');

    success('Chemistry UNO has been successfully deployed to production');
    console.log('');
    info('Access URLs:');
    info('  - HTTP:  http://localhost');
    if (options.withSSL) {
      info('  - HTTPS: https://localhost');
    }
    info('  - API:   http://localhost:5000');
    console.log('');
    info('Common commands:');
    info('  View logs:    docker-compose -f docker-compose.production.yml logs -f');
    info('  Stop service: docker-compose -f docker-compose.production.yml down');
    info('  Restart:      docker-compose -f docker-compose.production.yml restart');
    info('  Check status: docker-compose -f docker-compose.production.yml ps');
    console.log('');
    colorLog('cyan', '', 'Enjoy the game! 🧪🎮');
    console.log('');
  }
}

// 运行部署
deploy().catch(err => {
  error(`Deployment failed: ${err.message}`);
  process.exit(1);
});
