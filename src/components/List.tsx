import { Fragment, type ReactNode } from 'react';

type ListProps<ListItem> = {
  items: ListItem[];
  getKey?: (item: ListItem, index: number) => string;
  limit?: number;
  renderItem: (item: ListItem, index: number) => ReactNode;
};

const List = <ListItem,>({
  items,
  getKey,
  limit = -1,
  renderItem,
}: ListProps<ListItem>) => {
  const shouldLimit = limit > -1;

  return (
    <>
      {items.map((item: ListItem, index: number) => {
        if (shouldLimit && index >= limit) {
          return null;
        }

        const key = getKey ? getKey(item, index) : `${index}`;

        return <Fragment key={key}>{renderItem(item, index)}</Fragment>;
      })}
    </>
  );
};

export default List;
