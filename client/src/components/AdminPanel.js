import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';
import API_ENDPOINTS from '../config/api';

const EFFECT_OPTIONS = [
  { value: 'reverse', label: '反转 (reverse)' },
  { value: 'skip', label: '跳过 (skip)' },
  { value: 'draw2', label: '+2 (draw2)' },
  { value: 'draw4', label: '+4 (draw4)' }
];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const AdminPanel = () => {
  const [config, setConfig] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newCard, setNewCard] = useState({ name: '', count: 1 });
  const [newSpecial, setNewSpecial] = useState({ name: '', effect: 'reverse' });
  const [newReaction, setNewReaction] = useState({ reactant: '', partners: '' });
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_ENDPOINTS.config);
      setConfig(res.data.config);
      setDraft(deepClone(res.data.config));
      setLastSavedAt(new Date());
    } catch (err) {
      setError(err.response?.data?.error || '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const resetDraft = () => {
    if (config) {
      setDraft(deepClone(config));
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    console.log('💾 开始保存配置...');
    
    // 清理 representative_reactions 中的空行
    const cleanedDraft = {
      ...draft,
      representative_reactions: Object.fromEntries(
        Object.entries(draft.representative_reactions || {}).map(([reactant, partners]) => {
          // 过滤掉空行和只有空格的行
          const cleanedPartners = Array.isArray(partners) 
            ? partners.map(p => p.trim()).filter(Boolean)
            : [];
          return [reactant, cleanedPartners];
        })
      )
    };
    
    console.log('  反应数量:', Object.keys(cleanedDraft.representative_reactions || {}).length);
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put(API_ENDPOINTS.config, cleanedDraft);
      setConfig(res.data.config);
      setDraft(deepClone(res.data.config));
      setMessage('配置已保存 ✓');
      setLastSavedAt(new Date());
      console.log('✅ 配置保存成功');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '保存失败';
      setError(errorMsg);
      console.error('❌ 保存失败:', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const updateCardCount = (card, value) => {
    const count = Number(value);
    setDraft((prev) => {
      const next = deepClone(prev);
      next.card_config = next.card_config || { element_counts: {}, special_cards: {} };
      next.card_config.element_counts[card] = Number.isFinite(count) ? count : 0;
      return next;
    });
  };

  const handleAddCard = () => {
    if (!newCard.name.trim()) return;
    updateCardCount(newCard.name.trim(), newCard.count);
    setNewCard({ name: '', count: 1 });
  };

  const updateSpecialCard = (card, effect) => {
    setDraft((prev) => {
      const next = deepClone(prev);
      next.card_config = next.card_config || { element_counts: {}, special_cards: {} };
      next.card_config.special_cards[card] = effect;
      return next;
    });
  };

  const handleAddSpecial = () => {
    if (!newSpecial.name.trim()) return;
    updateSpecialCard(newSpecial.name.trim(), newSpecial.effect);
    setNewSpecial({ name: '', effect: 'reverse' });
  };

  const updateCompoundList = (path, textValue) => {
    const list = textValue
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setDraft((prev) => {
      const next = deepClone(prev);
      let cursor = next.common_compounds;
      for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        cursor[key] = cursor[key] || {};
        cursor = cursor[key];
      }
      cursor[path[path.length - 1]] = list;
      return next;
    });
  };

  const updateReactionPartners = (reactant, textValue) => {
    // 直接将文本按行分割，不进行 trim 和 filter
    // 这样用户可以正常输入和编辑
    const partners = textValue.split('\n');

    setDraft((prev) => {
      return {
        ...prev,
        representative_reactions: {
          ...prev.representative_reactions,
          [reactant]: partners
        }
      };
    });
  };

  const addReactant = () => {
    if (!newReaction.reactant.trim()) return;
    const partners = newReaction.partners
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    console.log(`➕ 添加新反应: ${newReaction.reactant.trim()} -> [${partners.join(', ')}]`);

    setDraft((prev) => {
      const next = deepClone(prev);
      if (!next.representative_reactions) {
        next.representative_reactions = {};
      }
      next.representative_reactions[newReaction.reactant.trim()] = partners;
      console.log('✓ 反应已添加到草稿，需点击"保存配置"按钮');
      return next;
    });
    setNewReaction({ reactant: '', partners: '' });
  };

  const orderedElementCounts = useMemo(() => {
    if (!draft?.card_config?.element_counts) return [];
    return Object.entries(draft.card_config.element_counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [draft]);

  const hasChanges = useMemo(() => {
    if (!config || !draft) return false;
    return JSON.stringify(config) !== JSON.stringify(draft);
  }, [config, draft]);

  const stats = useMemo(() => {
    const totalCards = orderedElementCounts.reduce((sum, [, count]) => sum + Number(count || 0), 0);
    const specialCount = draft?.card_config?.special_cards ? Object.keys(draft.card_config.special_cards).length : 0;
    const compoundGroups = draft?.common_compounds ? Object.keys(draft.common_compounds).length : 0;
    const reactionTypes = draft?.representative_reactions ? Object.keys(draft.representative_reactions).length : 0;
    return { totalCards, specialCount, compoundGroups, reactionTypes };
  }, [draft, orderedElementCounts]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">加载配置中...</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="admin-page">
        <div className="admin-card error">无法加载配置</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>化学UNO 配置后台</h1>
          <p className="subtitle">在此调整卡牌数量、特殊牌效果、物质列表与反应规则</p>
          <div className="pill">已通过密码验证</div>
        </div>
        <div className="header-actions">
          <a className="ghost-btn" href="/">返回游戏</a>
          <button className="ghost-btn" onClick={fetchConfig} disabled={loading || saving}>重新加载</button>
          <button className="ghost-btn" onClick={resetDraft} disabled={saving || !hasChanges}>重置更改</button>
          <button className="primary-btn" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? '保存中...' : hasChanges ? '保存配置' : '无更改'}
          </button>
        </div>
      </div>

      <div className="meta-bar">
        <div className="meta-group">
          <span className={`badge ${hasChanges ? 'warn' : 'ok'}`}>
            {hasChanges ? '待保存' : '已同步'}
          </span>
          {lastSavedAt && (
            <span className="meta-text">上次保存：{lastSavedAt.toLocaleString()}</span>
          )}
        </div>
        <div className="meta-group">
          <span className="meta-text">总牌数：{stats.totalCards}</span>
          <span className="meta-text">特殊牌：{stats.specialCount}</span>
          <span className="meta-text">物质分类：{stats.compoundGroups}</span>
          <span className="meta-text">反应类型：{stats.reactionTypes}</span>
        </div>
      </div>

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="admin-grid">
        <section className="admin-card">
          <div className="section-header">
            <h2>卡牌与数量</h2>
            <span className="section-desc">编辑所有卡牌的库存数量</span>
          </div>
          <div className="table">
            <div className="table-head">
              <span>卡牌</span>
              <span>数量</span>
            </div>
            {orderedElementCounts.map(([card, count]) => (
              <div key={card} className="table-row">
                <span className="mono">{card}</span>
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => updateCardCount(card, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="inline-form">
            <input
              type="text"
              placeholder="新增卡牌符号"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            />
            <input
              type="number"
              min="0"
              value={newCard.count}
              onChange={(e) => setNewCard({ ...newCard, count: Number(e.target.value) })}
            />
            <button onClick={handleAddCard}>添加卡牌</button>
          </div>
        </section>

        <section className="admin-card">
          <div className="section-header">
            <h2>特殊牌效果</h2>
            <span className="section-desc">配置特殊牌对应的效果</span>
          </div>
          <div className="table">
            <div className="table-head">
              <span>卡牌</span>
              <span>效果</span>
            </div>
            {draft.card_config?.special_cards &&
              Object.entries(draft.card_config.special_cards).map(([card, effect]) => (
                <div key={card} className="table-row">
                  <span className="mono">{card}</span>
                  <select value={effect} onChange={(e) => updateSpecialCard(card, e.target.value)}>
                    {EFFECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
          <div className="inline-form">
            <input
              type="text"
              placeholder="新增特殊牌"
              value={newSpecial.name}
              onChange={(e) => setNewSpecial({ ...newSpecial, name: e.target.value })}
            />
            <select
              value={newSpecial.effect}
              onChange={(e) => setNewSpecial({ ...newSpecial, effect: e.target.value })}
            >
              {EFFECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button onClick={handleAddSpecial}>添加特殊牌</button>
          </div>
        </section>

        <section className="admin-card wide">
          <div className="section-header">
            <h2>常见物质</h2>
            <span className="section-desc">用逗号分隔每一类物质</span>
          </div>
          <div className="compound-grid">
            {Object.entries(draft.common_compounds || {}).map(([category, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={category} className="compound-block">
                    <div className="compound-title">{category}</div>
                    <textarea
                      value={value.join(', ')}
                      onChange={(e) => updateCompoundList([category], e.target.value)}
                      rows={4}
                    />
                  </div>
                );
              }

              if (typeof value === 'object' && value !== null) {
                return (
                  <div key={category} className="compound-block">
                    <div className="compound-title">{category}</div>
                    {Object.entries(value).map(([sub, list]) => (
                      <div key={`${category}-${sub}`} className="compound-subblock">
                        <div className="compound-subtitle">{sub}</div>
                        <textarea
                          value={Array.isArray(list) ? list.join(', ') : ''}
                          onChange={(e) => updateCompoundList([category, sub], e.target.value)}
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </section>

        <section className="admin-card wide">
          <div className="section-header">
            <h2>反应规则</h2>
            <span className="section-desc">每个反应物对应可与之反应的物质列表（修改后请点击顶部"保存配置"按钮）</span>
          </div>
          {hasChanges && (
            <div style={{ 
              padding: '12px', 
              background: '#fef3c7', 
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '13px',
              color: '#92400e'
            }}>
              ⚠️ 您有未保存的更改，请点击顶部"保存配置"按钮保存
            </div>
          )}
          <div className="reaction-grid">
            {Object.entries(draft.representative_reactions || {}).sort((a, b) => a[0].localeCompare(b[0])).map(([reactant, partners]) => {
              // 确保 partners 是数组
              const partnersList = Array.isArray(partners) ? partners : [];
              const textValue = partnersList.join('\n');
              
              return (
              <div key={reactant} className="reaction-block">
                <div className="reaction-title">{reactant}</div>
                <textarea
                  rows={4}
                  value={textValue}
                  onChange={(e) => updateReactionPartners(reactant, e.target.value)}
                  placeholder="一行一个物质"
                  style={{ resize: 'vertical' }}
                />
                <button 
                  className="btn-delete"
                  onClick={() => {
                    if (window.confirm(`确定要删除反应物 "${reactant}" 吗？`)) {
                      console.log(`🗑️ 删除反应: ${reactant}`);
                      setDraft(prev => {
                        const next = deepClone(prev);
                        delete next.representative_reactions[reactant];
                        console.log('✓ 反应已从草稿删除，需点击"保存配置"按钮');
                        return next;
                      });
                    }
                  }}
                >删除</button>
              </div>
              );
            })}
          </div>
          <div className="inline-form">
            <input
              type="text"
              placeholder="反应物（如 HCl）"
              value={newReaction.reactant}
              onChange={(e) => setNewReaction({ ...newReaction, reactant: e.target.value })}
            />
            <textarea
              rows={2}
              placeholder="可反应物质（一行一个）"
              value={newReaction.partners}
              onChange={(e) => setNewReaction({ ...newReaction, partners: e.target.value })}
            />
            <button onClick={addReactant}>添加反应物</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
