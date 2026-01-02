const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const CONFIG_PATH = path.join(__dirname, '../config.json');
const LEGACY_DB_PATH = path.join(__dirname, '../db.json');

// 默认卡牌配置，作为缺失字段时的兜底
const DEFAULT_CARD_CONFIG = {
  element_counts: {
    H: 12,
    O: 12,
    C: 4,
    N: 4,
    F: 4,
    Na: 4,
    Mg: 4,
    Al: 4,
    Si: 4,
    P: 4,
    S: 4,
    Cl: 4,
    K: 4,
    Ca: 4,
    Mn: 4,
    Fe: 4,
    Cu: 4,
    Zn: 4,
    Br: 4,
    I: 4,
    Ag: 4,
    '+4': 4,
    '+2': 8,
    He: 1,
    Ne: 1,
    Ar: 1,
    Kr: 1,
    Au: 4
  },
  special_cards: {
    He: 'reverse',
    Ne: 'reverse',
    Ar: 'reverse',
    Kr: 'reverse',
    Au: 'skip',
    '+4': 'draw4',
    '+2': 'draw2'
  }
};

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[configService] 无法读取 ${filePath}:`, err.message);
    return null;
  }
}

function loadInitialConfig() {
  // 优先使用 config.json，其次尝试 legacy db.json，最后回退到内置默认值
  const configFromFile = readJson(CONFIG_PATH) || readJson(LEGACY_DB_PATH);
  if (configFromFile) {
    return applyDefaults(configFromFile);
  }

  return {
    metadata: { elements: [], note: 'fallback config' },
    card_config: DEFAULT_CARD_CONFIG,
    common_compounds: {},
    representative_reactions: [],
    reactivity_series: {},
    solubility_rules: {}
  };
}

function applyDefaults(config) {
  const next = { ...config };
  next.card_config = {
    element_counts: {
      ...DEFAULT_CARD_CONFIG.element_counts,
      ...(config.card_config?.element_counts || {})
    },
    special_cards: {
      ...DEFAULT_CARD_CONFIG.special_cards,
      ...(config.card_config?.special_cards || {})
    }
  };
  return next;
}

class ConfigService extends EventEmitter {
  constructor() {
    super();
    this.config = loadInitialConfig();
  }

  getConfig() {
    return this.config;
  }

  getElementCounts() {
    return this.config.card_config?.element_counts || DEFAULT_CARD_CONFIG.element_counts;
  }

  getSpecialCards() {
    return this.config.card_config?.special_cards || DEFAULT_CARD_CONFIG.special_cards;
  }

  getElementsList() {
    return this.config.metadata?.elements || [];
  }

  refreshFromDisk() {
    this.config = loadInitialConfig();
    this.emit('changed', this.config);
    return this.config;
  }

  saveConfig(newConfig) {
    if (!newConfig || typeof newConfig !== 'object') {
      throw new Error('配置格式无效');
    }
    this.config = applyDefaults(newConfig);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf8');
    this.emit('changed', this.config);
    return this.config;
  }

  updateConfig(updater) {
    const draft = JSON.parse(JSON.stringify(this.config));
    const updated = updater(draft);
    return this.saveConfig(updated);
  }

  onChange(callback) {
    this.on('changed', callback);
  }
}

module.exports = new ConfigService();
