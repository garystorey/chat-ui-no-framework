import { memo} from 'react';
import Card from './Card';
import { Suggestion } from '../types';
import './Card.css';


type SuggesionsProps = {
    suggestions: Suggestion[];
    classes?: string[];
}
const Suggestions = ({suggestions, classes = ['']}: SuggesionsProps) => {

return (
    <section className={classes.join(' ')}>
      <h2 id="suggestions-heading" className="sr-only">
        Suggested prompts
      </h2>
      <ul className="suggestions__list">
        {suggestions.map((suggestion: Suggestion) => (
          <li key={suggestion.id} className="suggestions__item">
            <Card
              title={suggestion.title}
              description={suggestion.description}
              actionLabel={suggestion.actionLabel}
              icon={suggestion.icon}
              onSelect={suggestion.handleSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default memo(Suggestions);
