// 测试textarea输入功能
console.log('=== 测试管理面板textarea问题 ===\n');

// 检查 partners 是否为数组
const testData = {
  representative_reactions: {
    'HCl': ['NaOH', 'Ca(OH)2', 'Mg', 'KMnO4'],
    'NaOH': ['HCl', 'H2SO4', 'CuSO4']
  }
};

console.log('1. 测试数据结构:');
Object.entries(testData.representative_reactions).forEach(([reactant, partners]) => {
  console.log(`  ${reactant}:`);
  console.log(`    - 类型: ${Array.isArray(partners) ? 'Array' : typeof partners}`);
  console.log(`    - 值: ${partners}`);
  console.log(`    - join('\\n'): ${partners.join('\n')}`);
});

console.log('\n2. 测试 updateReactionPartners 逻辑:');
const textValue = 'NaOH\nCa(OH)2\nMg\nKMnO4';
const partners = textValue
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

console.log('  输入文本:', textValue);
console.log('  处理后数组:', partners);
console.log('  数组长度:', partners.length);

console.log('\n3. 问题诊断:');
console.log('  如果 partners 不是数组，(partners || []).join() 会返回空字符串');
console.log('  如果 partners 是 undefined，会导致 textarea 显示空白');

// 检查可能的问题场景
const problemScenarios = [
  { partners: null, result: (null || []).join('\n') },
  { partners: undefined, result: (undefined || []).join('\n') },
  { partners: [], result: ([]).join('\n') },
  { partners: ['NaOH'], result: (['NaOH']).join('\n') }
];

console.log('\n4. 测试不同场景:');
problemScenarios.forEach(scenario => {
  console.log(`  partners = ${JSON.stringify(scenario.partners)} -> "${scenario.result}"`);
});
