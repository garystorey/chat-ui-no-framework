import { memo} from 'react';
import Card from './Card';
import { Suggestion } from '../types';
import './Card.css';
import List from './List';

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
        <List<Suggestion>
          className="suggestions__list"
          items={suggestions}
          keyfield="id"
          as={(suggestion) => (
              <Card key={suggestion.id} className="suggestions__item"
              title={suggestion.title}
              description={suggestion.description}
              label={suggestion.actionLabel}
              icon={suggestion.icon}
              onSelect={suggestion.handleSelect}
            />
          )} />
    </section>
  );
};

export default memo(Suggestions);
