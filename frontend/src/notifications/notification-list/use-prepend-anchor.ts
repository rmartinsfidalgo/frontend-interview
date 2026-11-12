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

  if (items !== prevItems) {
    setPrevItems(items);
    const prevFirstId = prevItems?.[0]?.id;
    const prependedCount =
      prevFirstId && items ? items.findIndex((n) => n.id === prevFirstId) : -1;

    if (!items || !prevItems) {
      setFirstItemIndex(START_INDEX);
      setNewAboveCount(0);
    } else if (prependedCount > 0 && !atTop) {
      setFirstItemIndex((i) => i - prependedCount);
      setNewAboveCount((c) => c + prependedCount);
    }
  }

  if (atTop && newAboveCount > 0) {
    setNewAboveCount(0);
  }

  return { firstItemIndex, newAboveCount };
}
