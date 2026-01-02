#!/usr/bin/env node
// 快速演示：单张元素卡打出时的物质选择

const database = require('./server/database.js');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  化学UNO - 单张元素卡物质选择演示                    ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// 模拟玩家打出不同元素卡
const demonstrations = [
  { 
    element: 'H', 
    name: '氢元素',
    scenario: '玩家手中有 H 卡，点击后看到的选项：'
  },
  { 
    element: 'O', 
    name: '氧元素',
    scenario: '玩家手中有 O 卡，点击后看到的选项：'
  },
  { 
    element: 'Cl', 
    name: '氯元素',
    scenario: '玩家手中有 Cl 卡，点击后看到的选项：'
  },
  { 
    element: 'Na', 
    name: '钠元素',
    scenario: '玩家手中有 Na 卡，点击后看到的选项：'
  },
];

demonstrations.forEach((demo, index) => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${index + 1}. ${demo.name} (${demo.element})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📋 场景: ${demo.scenario}\n`);
  
  const compounds = database.getCompoundsByElements([demo.element]);
  
  // 识别单质
  const simpleSubstances = {
    'H': 'H2', 'O': 'O2', 'N': 'N2', 'Cl': 'Cl2', 
    'F': 'F2', 'Br': 'Br2', 'I': 'I2', 'P': 'P4', 'S': 'S8',
    'C': 'C', 'Fe': 'Fe', 'Cu': 'Cu', 'Zn': 'Zn', 
    'Al': 'Al', 'Mg': 'Mg', 'Ca': 'Ca', 'Na': 'Na', 
    'K': 'K', 'Ag': 'Ag', 'Mn': 'Mn', 'Si': 'Si'
  };
  
  const simpleSubstance = simpleSubstances[demo.element];
  
  console.log(`📊 共有 ${compounds.length} 个可选物质：\n`);
  
  // 显示前15个
  const displayCount = Math.min(15, compounds.length);
  
  compounds.slice(0, displayCount).forEach((compound, idx) => {
    const isSimple = compound === simpleSubstance;
    const label = isSimple ? '⭐ [单质]' : '  ';
    const number = `${idx + 1}`.padStart(2, ' ');
    console.log(`   ${number}. ${label} ${compound}`);
  });
  
  if (compounds.length > displayCount) {
    console.log(`\n   ... 还有 ${compounds.length - displayCount} 个化合物\n`);
  }
  
  // 显示关键特性
  console.log(`\n💡 特点：`);
  console.log(`   • 单质 ${simpleSubstance} 排在第一位`);
  console.log(`   • 包含所有含 ${demo.element} 的化合物`);
  console.log(`   • 玩家可以搜索或直接选择`);
});

console.log('\n\n╔════════════════════════════════════════════════════════╗');
console.log('║  演示完成！                                           ║');
console.log('║  运行 npm run dev 启动服务器进行实际测试             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');
