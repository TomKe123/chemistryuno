import React from 'react';
import './Card.css';

const Card = ({ card, onClick, isSelected, disabled }) => {
  // 根据卡牌类型设置颜色
  const getCardColor = (card) => {
    if (card === '+2' || card === '+4') return 'special-draw';
    if (card === 'He' || card === 'Ne' || card === 'Ar' || card === 'Kr') return 'special-reverse';
    if (card === 'Au') return 'special-skip';
    if (card === 'H' || card === 'O') return 'common';
    return 'element';
  };

  const cardColor = getCardColor(card);

  return (
    <div
      className={`card ${cardColor} ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onClick(card)}
    >
      <div className="card-content">
        <span className="card-value">{card}</span>
      </div>
    </div>
  );
};

export default Card;
