// 测试单张元素打出时的物质选择
const database = require('./server/database.js');

console.log('====================================');
console.log('测试：打出单张元素时的物质选择');
console.log('====================================\n');

// 测试用例：不同类型的元素
const testCases = [
  { element: 'H', name: '氢', expected: ['H2', 'H2O', 'HCl', 'H2SO4'] },
  { element: 'O', name: '氧', expected: ['O2', 'H2O', 'CO2', 'SO2'] },
  { element: 'Cl', name: '氯', expected: ['Cl2', 'HCl', 'NaCl', 'CaCl2'] },
  { element: 'Na', name: '钠', expected: ['Na', 'NaOH', 'NaCl', 'Na2SO4'] },
  { element: 'Fe', name: '铁', expected: ['Fe', 'FeO', 'Fe2O3', 'FeCl2'] },
  { element: 'C', name: '碳', expected: ['C', 'CO', 'CO2', 'CaCO3'] },
  { element: 'N', name: '氮', expected: ['N2', 'NO', 'NO2', 'NH3'] },
];

testCases.forEach(({ element, name, expected }) => {
  console.log(`\n测试元素: ${element} (${name})`);
  console.log('----------------------------------');
  
  const compounds = database.getCompoundsByElements([element]);
  
  console.log(`✓ 共找到 ${compounds.length} 个物质`);
  
  // 检查预期的物质是否都包含在内
  const allExpectedFound = expected.every(exp => compounds.includes(exp));
  
  if (allExpectedFound) {
    console.log(`✓ 所有预期物质都已包含`);
  } else {
    console.log(`✗ 缺少预期物质:`);
    expected.forEach(exp => {
      if (!compounds.includes(exp)) {
        console.log(`  - ${exp}`);
      }
    });
  }
  
  // 显示前10个物质
  console.log(`\n前 ${Math.min(10, compounds.length)} 个物质:`);
  compounds.slice(0, 10).forEach((compound, idx) => {
    const isSimple = compound === element || 
                     (element === 'H' && compound === 'H2') ||
                     (element === 'O' && compound === 'O2') ||
                     (element === 'N' && compound === 'N2') ||
                     (element === 'Cl' && compound === 'Cl2') ||
                     (element === 'F' && compound === 'F2') ||
                     (element === 'Br' && compound === 'Br2') ||
                     (element === 'I' && compound === 'I2') ||
                     (element === 'P' && compound === 'P4') ||
                     (element === 'S' && compound === 'S8');
    
    const marker = isSimple ? ' [单质]' : '';
    console.log(`  ${idx + 1}. ${compound}${marker}`);
  });
  
  if (compounds.length > 10) {
    console.log(`  ... 还有 ${compounds.length - 10} 个`);
  }
});

console.log('\n====================================');
console.log('测试完成！');
console.log('====================================');
