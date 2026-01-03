#!/usr/bin/env node
/**
 * 健康检查脚本
 * 用于监控系统、Docker 健康检查等
 */

const http = require('http');
const https = require('https');

const CONFIG = {
  server: {
    host: process.env.HEALTH_CHECK_HOST || 'localhost',
    port: process.env.HEALTH_CHECK_PORT || 5000,
    path: '/',
    timeout: 5000
  }
};

/**
 * 执行 HTTP 健康检查
 */
function checkHttp(config) {
  return new Promise((resolve, reject) => {
    const client = config.port === 443 ? https : http;
    
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.path,
      method: 'GET',
      timeout: config.timeout
    };

    const req = client.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({
          status: 'healthy',
          statusCode: res.statusCode,
          message: 'Server is responding'
        });
      } else {
        reject({
          status: 'unhealthy',
          statusCode: res.statusCode,
          message: `Unexpected status code: ${res.statusCode}`
        });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        status: 'unhealthy',
        error: 'timeout',
        message: 'Health check timeout'
      });
    });

    req.on('error', (err) => {
      reject({
        status: 'unhealthy',
        error: err.code,
        message: err.message
      });
    });

    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🏥 Running health check...');
  console.log(`   Target: ${CONFIG.server.host}:${CONFIG.server.port}${CONFIG.server.path}`);
  
  try {
    const result = await checkHttp(CONFIG.server);
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.status}`);
    console.log(`   HTTP Status: ${result.statusCode}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed');
    console.error(`   Status: ${error.status}`);
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
}

// 运行健康检查
main();
