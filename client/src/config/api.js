// API配置 - 支持移动设备访问
const getApiBaseUrl = () => {
  // 如果是开发环境且指定了API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 在生产环境或移动设备访问时，使用当前主机
  // 如果前端和后端在同一台服务器上，使用相对路径
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // 移动设备访问时，使用实际的服务器地址
  // 假设后端运行在5000端口
  return `http://${window.location.hostname}:5000`;
};

export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = API_BASE_URL;

// API端点
export const API_ENDPOINTS = {
  // 游戏相关
  createGame: `${API_BASE_URL}/api/game/create`,
  joinGame: `${API_BASE_URL}/api/game/join`,
  startGame: (roomCode) => `${API_BASE_URL}/api/game/${roomCode}/start`,
  gameInfo: (roomCode) => `${API_BASE_URL}/api/game/${roomCode}/info`,
  gameQrcode: (roomCode) => `${API_BASE_URL}/api/game/${roomCode}/qrcode`,
  
  // 房间相关
  rooms: `${API_BASE_URL}/api/rooms`,
  
  // 玩家相关
  playerSession: (name) => `${API_BASE_URL}/api/player/${encodeURIComponent(name)}/session`,
  
  // 配置相关
  config: `${API_BASE_URL}/api/config`,
  configRefresh: `${API_BASE_URL}/api/config/refresh`,
  
  // 初始化设置
  checkSetup: `${API_BASE_URL}/api/setup/check`,
  setup: `${API_BASE_URL}/api/setup`,
  
  // 化合物相关
  compounds: `${API_BASE_URL}/api/compounds`,
};

console.log('API配置已加载:', {
  baseUrl: API_BASE_URL,
  hostname: window.location.hostname,
  isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
});

export default API_ENDPOINTS;
