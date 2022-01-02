import { useEffect, useMemo, useRef } from "../deps/preact.tsx";

/** リスト中の要素が描画領域内に収まるように自動でスクロールするhook */
export function useScrollItemIntoView<E extends Element, T>(
  items: T[],
  selected: T | undefined,
  makeKey: (item: T) => string,
) {
  const props = useMemo(
    () =>
      items.map((item) => ({ "data-key": makeKey(item) }), [
        items,
        makeKey,
      ]),
    [items, makeKey],
  );
  const ref = useRef<E>(null);
  useEffect(() => {
    if (!selected) return;
    const list = ref.current;
    if (!list) return;
    const selectedItem = list.querySelector(
      `[data-key="${makeKey(selected)}"]`,
    );
    if (!selectedItem) return;

    const root = list.getBoundingClientRect();
    const item = selectedItem.getBoundingClientRect();
    if (root.top > item.top) {
      list.scrollTop -= root.top - item.top;
      return;
    }
    if (root.bottom < item.bottom) {
      list.scrollTop += item.bottom - root.bottom;
      return;
    }
    // browserの表示領域内にも収める
    const { top, bottom } = selectedItem.getBoundingClientRect();
    // 上部のはみ出しをなくす
    if (top < 0) {
      selectedItem.scrollIntoView();
      return;
    }
    // 下部のはみ出しをなくす
    if (bottom > window.innerHeight) {
      selectedItem.scrollIntoView(false);
      return;
    }
  }, [selected, makeKey]);

  return props;
}
