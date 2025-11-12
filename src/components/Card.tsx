import { memo, useCallback, useId } from 'react';
import './Card.css';

type CardProps = {
  title: string;
  description: string;
  label: string;
  icon: string;
  className?: string;
  onSelect: () => void;
};

function Card ({ title, description, label, icon, onSelect, className="" }: CardProps) {
  const titleId = useId();
  const descriptionId = useId();

  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const classes =`suggestion-card ${className}`.trim();

  return (
    <div
      className={classes}
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
        {label}
      </button>
    </div>
  );
};

export default memo(Card);
