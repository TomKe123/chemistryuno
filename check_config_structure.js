const config = require('./config.json');

console.log('=== 检查配置文件中的 representative_reactions ===\n');

const entries = Object.entries(config.representative_reactions).slice(0, 5);

entries.forEach(([reactant, partners]) => {
  console.log(`${reactant}:`);
  console.log(`  类型: ${typeof partners}`);
  console.log(`  是数组: ${Array.isArray(partners)}`);
  console.log(`  值:`, partners);
  console.log('');
});
