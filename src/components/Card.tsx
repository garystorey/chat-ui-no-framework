import { memo, useCallback, useId } from 'react';
import './Card.css';

type CardProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: string;
  onSelect: () => void;
};

const Card = ({ title, description, actionLabel, icon, onSelect }: CardProps) => {
  const titleId = useId();
  const descriptionId = useId();

  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  return (
    <article
      className="suggestion-card"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="suggestion-card__icon" aria-hidden="true">
        {icon}
      </div>
      <h3 id={titleId} className="suggestion-card__title">
        {title}
      </h3>
      <p id={descriptionId} className="suggestion-card__description">
        {description}
      </p>
      <button
        type="button"
        className="suggestion-card__cta"
        onClick={handleClick}
        aria-describedby={`${titleId} ${descriptionId}`}
      >
        {actionLabel}
      </button>
    </article>
  );
};

export default memo(Card);
