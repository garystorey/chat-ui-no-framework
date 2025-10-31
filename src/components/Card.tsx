import { memo, useCallback } from 'react';
import './Card.css';

type CardProps = {
  text: string;
  onSelect: (value: string) => void;
};

const Card = ({ text, onSelect }: CardProps) => {
  const handleClick = useCallback(() => {
    onSelect(text);
  }, [onSelect, text]);

  return (
    <button type="button" className="suggestion-card" onClick={handleClick}>
      {text}
    </button>
  );
};

export default memo(Card);
