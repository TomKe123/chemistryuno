// 测试玩家重新加入功能
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testRejoin() {
  console.log('🧪 测试玩家重新加入功能\n');
  
  try {
    // 步骤 1: 创建房间
    console.log('1️⃣ 创建房间...');
    const createResponse = await axios.post(`${API_BASE}/api/game/create`, {
      playerName: '测试玩家A'
    });
    
    const roomCode = createResponse.data.roomCode;
    const playerId = createResponse.data.playerId;
    
    console.log(`✓ 房间创建成功: ${roomCode}`);
    console.log(`✓ 玩家ID: ${playerId}\n`);
    
    // 步骤 2: 添加第二个玩家
    console.log('2️⃣ 添加第二个玩家...');
    const joinResponse = await axios.post(`${API_BASE}/api/game/join`, {
      roomCode: roomCode,
      playerName: '测试玩家B'
    });
    
    const player2Id = joinResponse.data.playerId;
    console.log(`✓ 玩家B加入成功: ${player2Id}\n`);
    
    // 步骤 3: 开始游戏
    console.log('3️⃣ 开始游戏...');
    await axios.post(`${API_BASE}/api/game/${roomCode}/start`, {
      playerId: playerId
    });
    console.log('✓ 游戏已开始\n');
    
    // 步骤 4: 检查玩家A的会话
    console.log('4️⃣ 检查玩家A的会话...');
    const sessionResponse = await axios.get(
      `${API_BASE}/api/player/${encodeURIComponent('测试玩家A')}/session`
    );
    
    console.log('会话信息:', JSON.stringify(sessionResponse.data, null, 2));
    
    if (sessionResponse.data.hasSession) {
      console.log('✅ 测试通过: 可以找到玩家会话');
      console.log(`   - 房间号: ${sessionResponse.data.session.roomCode}`);
      console.log(`   - 玩家ID: ${sessionResponse.data.session.playerId}`);
      console.log(`   - 玩家名称: ${sessionResponse.data.session.playerName}`);
      console.log(`   - 游戏已开始: ${sessionResponse.data.session.gameStarted}`);
      console.log(`   - 是否离线: ${sessionResponse.data.session.isOffline}`);
      
      // 验证返回的数据
      if (sessionResponse.data.session.playerName === '测试玩家A') {
        console.log('✅ 玩家名称正确');
      } else {
        console.log('❌ 玩家名称不正确');
      }
      
      if (sessionResponse.data.session.roomCode === roomCode) {
        console.log('✅ 房间号正确');
      } else {
        console.log('❌ 房间号不正确');
      }
      
    } else {
      console.log('❌ 测试失败: 找不到玩家会话');
    }
    
    // 步骤 5: 检查不存在的玩家
    console.log('\n5️⃣ 检查不存在的玩家...');
    const noSessionResponse = await axios.get(
      `${API_BASE}/api/player/${encodeURIComponent('不存在的玩家')}/session`
    );
    
    if (!noSessionResponse.data.hasSession) {
      console.log('✅ 正确返回: 不存在的玩家没有会话');
    } else {
      console.log('❌ 错误: 不存在的玩家不应该有会话');
    }
    
    console.log('\n✅ 所有测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('状态码:', error.response.status);
    }
  }
}

// 运行测试
testRejoin();
