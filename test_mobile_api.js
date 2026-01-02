// 测试移动端API连接
const http = require('http');
const os = require('os');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testMobileAPI() {
  console.log(`${colors.blue}🧪 测试移动端 API 连接${colors.reset}\n`);
  
  // 获取本机IP地址
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  
  console.log(`📍 本机IP地址: ${localIP}\n`);
  
  const testURLs = [
    { url: 'http://localhost:5000', desc: 'localhost' },
    { url: `http://${localIP}:5000`, desc: '局域网IP' }
  ];
  
  for (const { url, desc } of testURLs) {
    console.log(`${colors.yellow}测试: ${url} (${desc})${colors.reset}`);
    
    // 测试1: 服务器状态
    try {
      const response = await httpRequest(url);
      if (response.status === 200) {
        console.log(`${colors.green}✅ 服务器响应正常 (状态码: ${response.status})${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  服务器响应异常 (状态码: ${response.status})${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.red}❌ 服务器无响应: ${err.message}${colors.reset}`);
      console.log(`   ${colors.yellow}提示: 请确保后端服务器正在运行 (npm start in server folder)${colors.reset}\n`);
      continue;
    }
    
    // 测试2: 创建房间 API
    try {
      const body = JSON.stringify({ playerName: '测试玩家' });
      const response = await httpRequest(`${url}/api/game/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Origin': `http://${localIP}:3000`
        },
        body: body
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.data);
        console.log(`${colors.green}✅ 创建房间 API 正常${colors.reset}`);
        console.log(`   房间号: ${data.roomCode}`);
        console.log(`   玩家ID: ${data.playerId}`);
      } else {
        console.log(`${colors.red}❌ 创建房间失败 (状态码: ${response.status})${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.red}❌ 创建房间失败: ${err.message}${colors.reset}`);
    }
    
    // 测试3: CORS 头检查
    try {
      const response = await httpRequest(`${url}/api/game/create`, {
        method: 'OPTIONS',
        headers: {
          'Origin': `http://${localIP}:3000`,
          'Access-Control-Request-Method': 'POST'
        }
      });
      
      const corsHeader = response.headers['access-control-allow-origin'];
      if (corsHeader) {
        console.log(`${colors.green}✅ CORS 配置正常${colors.reset}`);
        console.log(`   允许来源: ${corsHeader}`);
      } else {
        console.log(`${colors.yellow}⚠️  未找到 CORS 头${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.yellow}⚠️  CORS 预检请求失败: ${err.message}${colors.reset}`);
    }
    
    console.log('');
  }
  
  // 移动端访问指南
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📱 移动端访问指南${colors.reset}\n`);
  console.log(`1. 确保手机和电脑连接到同一 WiFi 网络`);
  console.log(`2. 在手机浏览器中访问: ${colors.green}http://${localIP}:3000${colors.reset}`);
  console.log(`3. 后端 API 地址会自动配置为: ${colors.green}http://${localIP}:5000${colors.reset}`);
  console.log(``);
  console.log(`${colors.yellow}⚠️  如果无法访问，请检查:${colors.reset}`);
  console.log(`   - 防火墙是否允许端口 3000 和 5000`);
  console.log(`   - 前端开发服务器是否正在运行 (npm start in client folder)`);
  console.log(`   - 后端服务器是否正在运行 (npm start in server folder)`);
  console.log(``);
  console.log(`${colors.blue}🛠️  Windows 防火墙配置命令:${colors.reset}`);
  console.log(`   ${colors.green}netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000${colors.reset}`);
  console.log(`   ${colors.green}netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=TCP localport=5000${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

// 运行测试
testMobileAPI().catch(err => {
  console.error(`${colors.red}测试过程出错: ${err.message}${colors.reset}`);
});
