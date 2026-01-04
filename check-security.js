#!/usr/bin/env node
/**
 * 敏感信息检查脚本
 * 扫描项目中可能存在的敏感信息
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function header(title) {
  console.log('');
  log('magenta', '═'.repeat(60));
  log('magenta', `  ${title}`);
  log('magenta', '═'.repeat(60));
  console.log('');
}

// 敏感模式列表
const sensitivePatterns = [
  { pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi, name: '硬编码密码', severity: 'high' },
  { pattern: /Kc@20100205/g, name: '旧的默认密码', severity: 'critical' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'API密钥', severity: 'high' },
  { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, name: '密钥', severity: 'high' },
  { pattern: /token\s*[:=]\s*['"][^'"]{20,}['"]/gi, name: 'Token', severity: 'high' },
  { pattern: /REACT_APP_ADMIN\s*=\s*[^y][^\s'"]+/g, name: '环境变量中的密码', severity: 'medium' }
];

// 要扫描的文件扩展名
const scanExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.env'];

// 排除的目录
const excludeDirs = ['node_modules', 'dist', 'build', '.git', '.npm-cache'];

function shouldScanFile(filePath) {
  // 检查是否在排除目录中
  if (excludeDirs.some(dir => filePath.includes(path.sep + dir + path.sep) || filePath.startsWith(dir + path.sep))) {
    return false;
  }
  
  // 检查文件扩展名
  const ext = path.extname(filePath);
  return scanExtensions.includes(ext) || path.basename(filePath).startsWith('.env');
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const findings = [];
    
    for (const { pattern, name, severity } of sensitivePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          file: filePath,
          pattern: name,
          severity: severity,
          matches: matches.slice(0, 3) // 只显示前3个匹配
        });
      }
    }
    
    return findings;
  } catch (err) {
    return [];
  }
}

function scanDirectory(dir, results = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          scanDirectory(filePath, results);
        }
      } else if (shouldScanFile(filePath)) {
        const findings = scanFile(filePath);
        results.push(...findings);
      }
    }
  } catch (err) {
    // 忽略无法访问的目录
  }
  
  return results;
}

function checkEnvFiles() {
  const issues = [];
  
  // 检查 .env.production 是否存在且已配置
  const envProdPath = path.join(process.cwd(), 'client', '.env.production');
  if (fs.existsSync(envProdPath)) {
    const content = fs.readFileSync(envProdPath, 'utf-8');
    if (content.includes('REACT_APP_ADMIN=your_') || content.includes('REACT_APP_ADMIN=\n') || !content.includes('REACT_APP_ADMIN=')) {
      issues.push({
        file: 'client/.env.production',
        message: '管理员密码未设置或使用默认占位符'
      });
    }
  } else {
    issues.push({
      file: 'client/.env.production',
      message: '环境变量文件不存在'
    });
  }
  
  // 检查 .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('.env.production') && !content.includes('client/.env.production')) {
      issues.push({
        file: '.gitignore',
        message: '.env.production 未添加到 .gitignore'
      });
    }
  }
  
  return issues;
}

function main() {
  header('Chemistry UNO - 敏感信息安全扫描');
  
  log('cyan', '正在扫描项目文件...\n');
  
  const rootDir = process.cwd();
  const findings = scanDirectory(rootDir);
  const envIssues = checkEnvFiles();
  
  // 按严重程度分类
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  
  // 输出结果
  if (critical.length > 0) {
    log('red', '🚨 严重问题 (Critical):');
    critical.forEach(f => {
      log('red', `  ${f.file}`);
      log('red', `    问题: ${f.pattern}`);
      f.matches.forEach(m => log('red', `    匹配: ${m.substring(0, 50)}...`));
    });
    console.log('');
  }
  
  if (high.length > 0) {
    log('red', '⚠️  高风险 (High):');
    high.forEach(f => {
      log('red', `  ${f.file}`);
      log('red', `    问题: ${f.pattern}`);
    });
    console.log('');
  }
  
  if (medium.length > 0) {
    log('yellow', '⚡ 中风险 (Medium):');
    medium.forEach(f => {
      log('yellow', `  ${f.file}`);
      log('yellow', `    问题: ${f.pattern}`);
    });
    console.log('');
  }
  
  if (envIssues.length > 0) {
    log('yellow', '📋 配置问题:');
    envIssues.forEach(issue => {
      log('yellow', `  ${issue.file}: ${issue.message}`);
    });
    console.log('');
  }
  
  // 总结
  log('magenta', '═'.repeat(60));
  const totalIssues = findings.length + envIssues.length;
  
  if (totalIssues === 0) {
    log('green', '✅ 未发现敏感信息泄露！');
  } else {
    log('red', `❌ 发现 ${totalIssues} 个潜在问题`);
    console.log('');
    log('cyan', '建议操作:');
    log('cyan', '  1. 查看 docs/SECURITY.md 了解安全最佳实践');
    log('cyan', '  2. 移除或替换硬编码的敏感信息');
    log('cyan', '  3. 使用环境变量管理密码和密钥');
    log('cyan', '  4. 确保 .env 文件已添加到 .gitignore');
  }
  log('magenta', '═'.repeat(60));
  console.log('');
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
