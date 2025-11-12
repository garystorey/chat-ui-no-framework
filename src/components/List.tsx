import type { ComponentPropsWithRef, ReactNode } from 'react';

type ListProps<ListItem> = ComponentPropsWithRef<'ul'> & {
  items: ListItem[];
  keyfield: keyof ListItem | ((item: ListItem) => string);
  limit?: number;
  as: (item: ListItem) => ReactNode;
};

const List = <ListItem,>({
  items,
  keyfield,
  limit = -1,
  as,
  ...props
}: ListProps<ListItem>) => {
  const getKey =
    typeof keyfield === 'function'
      ? keyfield
      : (item: ListItem) => String(item[keyfield]);

  const visibleItems = limit > -1 ? items.slice(0, limit) : items;

  return (
    <ul {...props}>
      {visibleItems.map((item) => (
        <li key={getKey(item)}>{as(item)}</li>
      ))}
    </ul>
  );
};

export default List;
