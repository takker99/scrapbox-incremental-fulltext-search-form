import { useCallback, useMemo, useState } from "./deps/preact.tsx";

export interface Options {
  /** 初期選択項目の番号 */
  defaultSelected?: number;
}

export const useSelect = <T>(list: T[], {
  defaultSelected,
}: Options = {}) => {
  const [index, setIndex] = useState(defaultSelected); // 未選択のときはundefinedになる
  const item = useMemo(
    () => index === undefined ? undefined : list[index],
    [
      index,
      list,
    ],
  );

  /** 前の項目に移動する */
  const selectPrev = useCallback(
    () => setIndex((_index) => ((_index ?? 0) - 1 + list.length) % list.length),
    [list],
  );
  /** 次の項目に移動する */
  const selectNext = useCallback(
    () => setIndex((_index) => ((_index ?? -1) + 1) % list.length),
    [list],
  );
  /** 項目選択を解除する */
  const blur = useCallback(() => setIndex(undefined), []);

  return {
    item,
    select: setIndex,
    selectPrev,
    selectNext,
    blur,
  };
};
