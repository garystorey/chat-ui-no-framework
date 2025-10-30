import './Card.css';

type CardProps = {
  text: string;
  onSelect: (value: string) => void;
};

const Card = ({ text, onSelect }: CardProps) => {
  return (
    <button type="button" className="suggestion-card" onClick={() => onSelect(text)}>
      {text}
    </button>
  );
};

export default Card;
