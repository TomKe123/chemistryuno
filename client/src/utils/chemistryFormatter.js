/**
 * 化学式格式化工具
 * 将化学式转换为带下标的HTML格式
 */

/**
 * 将化学式转换为HTML格式（带下标和上标）
 * 例如: H2O → H<sub>2</sub>O
 *       Ca(OH)2 → Ca(OH)<sub>2</sub>
 *       CuSO4 → CuSO<sub>4</sub>
 * @param {string} formula - 化学式
 * @returns {JSX.Element} 格式化后的React元素
 */
export const formatFormula = (formula) => {
  if (!formula || typeof formula !== 'string') {
    return formula;
  }

  const parts = [];
  let i = 0;

  while (i < formula.length) {
    // 匹配元素符号（大写字母+可选的小写字母）
    if (/[A-Z]/.test(formula[i])) {
      let element = formula[i];
      i++;
      
      // 添加小写字母
      while (i < formula.length && /[a-z]/.test(formula[i])) {
        element += formula[i];
        i++;
      }
      
      // 添加可能的上标（如O²⁻）
      if (i < formula.length && /[⁺⁻]/.test(formula[i])) {
        element += formula[i];
        i++;
      }
      
      parts.push(element);

      // 检查是否有数字
      let number = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        number += formula[i];
        i++;
      }
      
      if (number) {
        parts.push(<sub key={`${element}-sub-${number}`}>{number}</sub>);
      }
    } else if (formula[i] === '(') {
      // 处理括号
      let parenContent = '';
      let parenCount = 1;
      i++; // 跳过左括号
      
      while (i < formula.length && parenCount > 0) {
        if (formula[i] === '(') parenCount++;
        else if (formula[i] === ')') parenCount--;
        
        if (parenCount > 0) {
          parenContent += formula[i];
        }
        i++;
      }
      
      parts.push('(');
      // 递归处理括号内容
      parts.push(formatFormula(parenContent));
      parts.push(')');
      
      // 检查括号后的数字
      let number = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        number += formula[i];
        i++;
      }
      
      if (number) {
        parts.push(<sub key={`paren-sub-${number}`}>{number}</sub>);
      }
    } else if (formula[i] === '↓' || formula[i] === '↑') {
      // 保留沉淀和气体符号
      parts.push(formula[i]);
      i++;
    } else {
      parts.push(formula[i]);
      i++;
    }
  }

  // 如果只有一个部分且是字符串，直接返回
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return parts[0];
  }

  return parts.length === 0 ? formula : parts;
};

/**
 * 纯文本格式化（用于日志或纯文本显示）
 * @param {string} formula - 化学式
 * @returns {string} 格式化后的文本
 */
export const formatFormulaAsText = (formula) => {
  if (!formula || typeof formula !== 'string') {
    return formula;
  }

  return formula
    .replace(/(\d+)/g, (match) => {
      // 将数字转换为下标Unicode字符
      const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
      return match.split('').map(d => subscripts[parseInt(d)]).join('');
    });
};
