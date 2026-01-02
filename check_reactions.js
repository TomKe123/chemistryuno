const config = require('./config.json');

console.log('=== 检查 representative_reactions 数据结构 ===\n');

console.log('类型:', typeof config.representative_reactions);
console.log('是否为对象:', config.representative_reactions !== null && typeof config.representative_reactions === 'object');
console.log('是否为数组:', Array.isArray(config.representative_reactions));

console.log('\n前10个反应:');
const entries = Object.entries(config.representative_reactions).slice(0, 10);
entries.forEach(([k, v]) => {
  console.log(`  ${k}:`, Array.isArray(v) ? v.join(', ') : typeof v);
});

console.log('\n总反应数:', Object.keys(config.representative_reactions).length);
