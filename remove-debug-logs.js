/**
 * 删除调试日志脚本
 * 自动删除客户端代码中的console.log/console.error等调试语句
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  console.log('');
  log('cyan', '═'.repeat(60));
  log('cyan', `  ${text}`);
  log('cyan', '═'.repeat(60));
  console.log('');
}

// 需要清理的文件列表
const filesToClean = [
  'client/src/components/GameLobby.tsx',
  'client/src/components/GameBoard.tsx',
  'client/src/components/AdminPanel.tsx',
  'client/src/App.tsx',
];

// 保留的console.log模式（服务器启动等重要信息）
const keepPatterns = [
  /服务器运行在/,
  /WebSocket 服务已启动/,
];

function shouldKeepLine(line) {
  return keepPatterns.some(pattern => pattern.test(line));
}

function removeDebugLogs(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log('yellow', `⚠ 文件不存在: ${filePath}`);
    return { removed: 0, kept: 0 };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  let removed = 0;
  let kept = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 检测console语句的开始
    if (trimmed.match(/console\.(log|error|warn|debug|info)\s*\(/)) {
      // 如果是需要保留的日志
      if (shouldKeepLine(line)) {
        newLines.push(line);
        kept++;
        i++;
        continue;
      }

      // 找到完整的console语句（可能跨多行）
      let bracketCount = 0;
      let inString = false;
      let stringChar = '';
      let consoleLines = [line];
      let complete = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && line[j - 1] !== '\\') {
          inString = false;
        } else if (!inString) {
          if (char === '(') bracketCount++;
          else if (char === ')') bracketCount--;
        }
      }

      // 如果括号平衡且以分号结尾，说明是单行语句
      if (bracketCount === 0 && (trimmed.endsWith(';') || trimmed.endsWith(')'))) {
        removed++;
        i++;
        continue;
      }

      // 多行console语句，继续读取直到括号平衡
      let currentLineIdx = i + 1;
      while (currentLineIdx < lines.length && bracketCount !== 0) {
        const nextLine = lines[currentLineIdx];
        consoleLines.push(nextLine);

        for (let j = 0; j < nextLine.length; j++) {
          const char = nextLine[j];
          
          if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringChar = char;
          } else if (inString && char === stringChar && nextLine[j - 1] !== '\\') {
            inString = false;
          } else if (!inString) {
            if (char === '(') bracketCount++;
            else if (char === ')') {
              bracketCount--;
              if (bracketCount === 0) {
                complete = true;
                break;
              }
            }
          }
        }

        currentLineIdx++;
        
        if (complete || currentLineIdx >= lines.length) break;
      }

      removed++;
      i = currentLineIdx;
      continue;
    }

    newLines.push(line);
    i++;
  }

  // 写回文件
  fs.writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
  
  return { removed, kept };
}

// 主函数
function main() {
  header('🧹 删除客户端调试日志');

  let totalRemoved = 0;
  let totalKept = 0;

  for (const file of filesToClean) {
    const result = removeDebugLogs(file);
    if (result.removed > 0 || result.kept > 0) {
      log('green', `✓ ${file}`);
      log('cyan', `  删除: ${result.removed} 行`);
      if (result.kept > 0) {
        log('yellow', `  保留: ${result.kept} 行`);
      }
    }
    totalRemoved += result.removed;
    totalKept += result.kept;
  }

  console.log('');
  log('green', `✅ 完成！共删除 ${totalRemoved} 行调试日志${totalKept > 0 ? `，保留 ${totalKept} 行重要日志` : ''}`);
  console.log('');
}

main();
