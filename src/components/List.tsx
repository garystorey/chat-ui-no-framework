import type { ComponentPropsWithRef, ReactNode } from 'react';

type ListProps<ListItem> = ComponentPropsWithRef<'section'> & {
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
    <section {...props}>
      {visibleItems.map((item) => (
        <div key={getKey(item)}>{as(item)}</div>
      ))}
    </section>
  );
};

export default List;
