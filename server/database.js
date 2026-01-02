const configService = require('./configService');

/**
 * 物质和反应库 - 提供优化的查询性能
 */
class ChemistryDatabase {
  constructor() {
    this.config = configService.getConfig();
    this.compoundToElements = this.buildCompoundToElements();
    this.reactionMap = this.buildReactionMap();

    configService.onChange((nextConfig) => {
      this.config = nextConfig;
      this.compoundToElements = this.buildCompoundToElements();
      this.reactionMap = this.buildReactionMap();
    });
  }

  /**
   * 判断物质是否在配置的常见物质列表中
   */
  isKnownCompound(compound) {
    return Boolean(this.compoundToElements[compound]);
  }

  /**
   * 构建物质到元素的映射
   */
  buildCompoundToElements() {
    const map = {};
    const allCompounds = this.getAllCompounds();

    allCompounds.forEach(compound => {
      const elements = this.extractElements(compound);
      map[compound] = elements;
    });

    return map;
  }

  /**
   * 获取所有物质
   */
  getAllCompounds() {
    const compounds = [];

    const addCompounds = (obj) => {
      if (Array.isArray(obj)) {
        compounds.push(...obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(val => {
          if (Array.isArray(val)) {
            compounds.push(...val);
          } else if (typeof val === 'object') {
            addCompounds(val);
          }
        });
      }
    };

    addCompounds(this.config.common_compounds || {});
    return compounds;
  }

  /**
   * 从化学式中提取元素符号
   * @param {string} formula - 化学式
   * @returns {string[]} 元素列表
   */
  extractElements(formula) {
    const elements = new Set();
    const elementPattern = /[A-Z][a-z]?/g;
    const matches = formula.match(elementPattern);

    if (matches) {
      matches.forEach(element => {
        if (element && element.length <= 2) {
          // 验证是否为有效的元素符号
          if (this.config.metadata?.elements?.includes(element) ||
              Object.keys(this.getSpecialCards()).includes(element)) {
            elements.add(element);
          }
        }
      });
    }

    return Array.from(elements);
  }

  /**
   * 获取特殊卡牌
   */
  getSpecialCards() {
    return configService.getSpecialCards();
  }

  /**
   * 构建反应映射 - 优化查询性能
   */
  buildReactionMap() {
    const map = new Map();

    if (this.config.representative_reactions && typeof this.config.representative_reactions === 'object') {
      // 新格式：{ "HCl": ["NaOH", "Ca(OH)2"], ... }
      for (const [reactant, partners] of Object.entries(this.config.representative_reactions)) {
        const normalizedReactant = reactant.replace(/[↓↑]/g, '').trim();
        
        if (Array.isArray(partners)) {
          partners.forEach(partner => {
            const normalizedPartner = partner.replace(/[↓↑]/g, '').trim();
            const key = `${normalizedReactant}|${normalizedPartner}`;
            map.set(key, true);
          });
        }
      }
    }

    return map;
  }

  /**
   * 检查两个物质是否能反应
   * @param {string} compound1
   * @param {string} compound2
   * @returns {boolean} 能否反应
   */
  getReactionBetweenCompounds(compound1, compound2) {
    // 规范化物质名称（移除箭头、向上箭头等符号）
    const normalize = (str) => str.replace(/[↓↑]/g, '').trim();
    const c1 = normalize(compound1);
    const c2 = normalize(compound2);

    // 检查双向反应
    const key = `${c1}|${c2}`;
    const reverseKey = `${c2}|${c1}`;
    
    return this.reactionMap.has(key) || this.reactionMap.has(reverseKey);
  }

  /**
   * 根据持有的元素获取可能的物质
   * @param {string[]} elements - 持有的元素
   * @returns {string[]} 可能的物质列表
   */
  getCompoundsByElements(elements) {
    const elementSet = new Set(elements);
    const possibleCompounds = [];

    for (const [compound, requiredElements] of Object.entries(this.compoundToElements)) {
      // 检查是否至少有一个必需的元素在玩家的元素中
      // 这样玩家打出 H 时可以看到所有含 H 的物质
      if (requiredElements.some(elem => elementSet.has(elem))) {
        possibleCompounds.push(compound);
      }
    }

    return possibleCompounds;
  }

  /**
   * 检查是否可以打出物质
   * @param {string} currentCompound - 当前物质
   * @param {string} lastCompound - 上一个物质
   * @returns {boolean}
   */
  canPlayCompound(currentCompound, lastCompound) {
    if (!lastCompound) return true; // 第一轮
    return this.getReactionBetweenCompounds(lastCompound, currentCompound) !== null;
  }

  /**
   * 获取物质的类别
   * @param {string} compound
   * @returns {string} 类别名称
   */
  getCompoundCategory(compound) {
    for (const [category, items] of Object.entries(this.config.common_compounds || {})) {
      if (Array.isArray(items) && items.includes(compound)) {
        return category;
      }
      if (typeof items === 'object') {
        for (const [subcat, subitems] of Object.entries(items)) {
          if (Array.isArray(subitems) && subitems.includes(compound)) {
            return `${category}/${subcat}`;
          }
        }
      }
    }
    return 'unknown';
  }

  /**
   * 验证化学式的格式
   * @param {string} formula
   * @returns {boolean}
   */
  isValidFormula(formula) {
    // 简单的化学式验证
    const pattern = /^[A-Z][a-z]?(\d+)?([A-Z][a-z]?(\d+)?)*(\([A-Z][a-z]?(\d+)?\)(\d+)?)*$/;
    return pattern.test(formula);
  }
}

// 创建单例
const database = new ChemistryDatabase();

module.exports = database;
