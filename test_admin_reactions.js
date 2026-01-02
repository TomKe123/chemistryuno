// 测试管理面板的反应修改功能
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';
const CONFIG_PATH = path.join(__dirname, 'config.json');

function httpRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testReactionModification() {
  console.log('=== 测试管理面板反应修改功能 ===\n');

  try {
    // 1. 获取当前配置
    console.log('1. 获取当前配置...');
    const getRes = await httpRequest(`${API_BASE}/api/config`, 'GET');
    const originalConfig = getRes.data.config;
    console.log('✓ 配置获取成功');
    console.log('  当前反应数:', Object.keys(originalConfig.representative_reactions || {}).length);

    // 2. 修改配置（添加一个新反应）
    console.log('\n2. 修改配置（添加测试反应 TestCompound）...');
    const modifiedConfig = JSON.parse(JSON.stringify(originalConfig));
    modifiedConfig.representative_reactions = modifiedConfig.representative_reactions || {};
    modifiedConfig.representative_reactions['TestCompound'] = ['H2O', 'NaCl'];
    
    // 3. 保存配置
    console.log('3. 保存配置...');
    const putRes = await httpRequest(`${API_BASE}/api/config`, 'PUT', modifiedConfig);
    console.log('✓ 配置保存成功');
    console.log('  响应:', putRes.status, putRes.data.success ? '成功' : '失败');
    
    // 4. 验证配置是否保存
    console.log('\n4. 验证配置...');
    const verifyRes = await httpRequest(`${API_BASE}/api/config`, 'GET');
    const savedConfig = verifyRes.data.config;
    
    if (savedConfig.representative_reactions['TestCompound']) {
      console.log('✓ 新反应已成功保存');
      console.log('  TestCompound可以反应:', savedConfig.representative_reactions['TestCompound'].join(', '));
    } else {
      console.log('✗ 新反应未保存');
    }
    
    // 5. 恢复原配置
    console.log('\n5. 恢复原配置...');
    await httpRequest(`${API_BASE}/api/config`, 'PUT', originalConfig);
    console.log('✓ 原配置已恢复');
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('✗ 测试失败:', error.message);
  }
}

// 检查服务器是否运行
httpRequest(`${API_BASE}/`)
  .then(() => {
    console.log('✓ 服务器运行中\n');
    return testReactionModification();
  })
  .catch(err => {
    console.error('✗ 服务器未运行，请先启动服务器: npm run dev');
    console.error('  错误:', err.message);
  });
