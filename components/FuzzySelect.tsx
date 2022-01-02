/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
import { h, useCallback, useEffect, useState } from "../deps/preact.tsx";
import type { RefCallback } from "../deps/preact.tsx";
import { useFuzzySearch } from "../hooks/useFuzzySearch.ts";
import { useScrollItemIntoView } from "../hooks/useScrollItemIntoView.ts";
import { useSelect } from "../hooks/useSelect.ts";

interface Position {
  top: number;
  left: number;
}

export interface Item {
  key: string;
  text: string;
}
export interface Props {
  list: Item[];
  onSelect?: (item: Item) => void;
  convert: (item: Item) => string;
}
export function FuzzySelect({ list: _initialList, onSelect, convert }: Props) {
  // DropDownの座標計算
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const adjust = useCallback<RefCallback<HTMLInputElement>>((ref) => {
    const { left = 0, bottom = 0 } = ref?.getBoundingClientRect?.() ??
      {};
    setPosition({ top: bottom, left });
  }, []);

  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState(""); // <input>に表示する文字列
  const list = useFuzzySearch(query, _initialList, convert);
  const {
    item,
    selectPrev,
    selectNext,
    select,
    blur,
  } = useSelect(list);
  useEffect(() => {
    if (!item) return;
    onSelect?.(item);
    setDisplay(item.text);
  }, [item]);

  // 開閉判定・表示する文字列の更新・検索文字列の更新
  const [open, setOpen] = useState(false);
  const onInput: h.JSX.GenericEventHandler<HTMLInputElement> = useCallback(
    ({ currentTarget: { value } }) => {
      setDisplay(value);
      setOpen(true);
      if (item?.text === value) return;
      blur();
      setQuery(value);
    },
    [item],
  );
  // 入力欄のクリックで開閉する
  const onClick = useCallback(() => setOpen((old) => !old), []);
  // focusが外れたら閉じる
  const onBlur = useCallback(
    () => !document.activeElement && setOpen(false),
    [],
  );

  // キーボード操作
  const onKeyDown: h.JSX.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const { key, shiftKey } = e;
      if (key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        return;
      }
      if (key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (!item) {
          select(0);
        }
        setOpen(false);
        return;
      }

      // windowが開いていなければ、focusを別のcomponentに移す
      if (key === "Tab" && !open) return;

      if (key === "ArrowUp" || (key === "Tab" && shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        selectPrev();
        return;
      }
      if (key === "ArrowDown" || (key === "Tab" && !shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        selectNext();
        return;
      }
    },
    [selectPrev, selectNext, select, open],
  );
  // mouse wheelで項目選択する
  const onWheel: h.JSX.WheelEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { deltaY } = e;
      if (deltaY > 0) {
        selectNext();
        return;
      }
      if (deltaY < 0) {
        selectPrev();
        return;
      }
    },
    [selectNext, selectPrev],
  );

  const keys = useScrollItemIntoView(list, item, (item) => item.key);
  const onClickItem: h.JSX.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      // liのdata-keyから、クリックされた要素の番号を計算する
      const li = e.currentTarget.parentElement;
      const key = li?.dataset?.key ?? list[0].key;
      const index = list.findIndex((item) => item.key === key);
      select(Math.min(index, 0));
      setOpen(false);
    },
    [list],
  );

  return (
    <span style="position: relative;">
      <input
        ref={adjust}
        type="text"
        value={display}
        onInput={onInput}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
      />
      {open && (
        <ul
          className="dropdown"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {list.length > 0
            ? list.map(({ key, text }, index) => (
              <li key={key} {...keys[index]}>
                <a onClick={onClickItem}>{text}</a>
              </li>
            ))
            : (
              <li>
                <span class="message">Not found</span>
              </li>
            )}
        </ul>
      )}
    </span>
  );
}
