import { memo, useCallback } from 'react';
import './Card.css';

type CardProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: string;
  onSelect: () => void;
};

const Card = ({ title, description, actionLabel, icon, onSelect }: CardProps) => {
  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  return (
    <article className="suggestion-card">
      <div className="suggestion-card__icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="suggestion-card__title">{title}</h3>
      <p className="suggestion-card__description">{description}</p>
      <button
        type="button"
        className="suggestion-card__cta"
        onClick={handleClick}
      >
        {actionLabel}
      </button>
    </article>
  );
};

export default memo(Card);
