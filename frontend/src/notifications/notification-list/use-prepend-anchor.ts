import { useState } from "react";

const START_INDEX = 100_000;

type Identifiable = { id: string };

export default function usePrependAnchor<T extends Identifiable>(
  items: T[] | undefined,
  atTop: boolean,
) {
  const [prevItems, setPrevItems] = useState(items);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [newAboveCount, setNewAboveCount] = useState(0);
  // Bumped when the list is replaced. Used as the Virtuoso `key` so a fresh instance
  // starts at START_INDEX — Virtuoso only supports *decreasing* firstItemIndex in place.
  const [listKey, setListKey] = useState(0);

  if (items !== prevItems) {
    setPrevItems(items);
    const prevFirstId = prevItems?.[0]?.id;
    const prependedCount =
      prevFirstId && items ? items.findIndex((n) => n.id === prevFirstId) : -1;

    if (!items || !prevItems) {
      if (firstItemIndex !== START_INDEX) {
        setFirstItemIndex(START_INDEX);
        setListKey((k) => k + 1);
      }
      setNewAboveCount(0);
    } else if (prependedCount > 0 && !atTop) {
      setFirstItemIndex((i) => i - prependedCount);
      setNewAboveCount((c) => c + prependedCount);
    }
  }

  if (atTop && newAboveCount > 0) {
    setNewAboveCount(0);
  }

  return { firstItemIndex, newAboveCount, listKey };
}
