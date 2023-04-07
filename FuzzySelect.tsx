/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
import { h, useCallback, useEffect, useRef, useState } from "./deps/preact.tsx";
import { useFuzzySearch } from "./useFuzzySearch.ts";
import { useScrollItemIntoView } from "./useScrollItemIntoView.ts";
import { ProjectItem } from "./useProjectSearch.ts";
import { useSelect } from "./useSelect.ts";

export interface Item {
  key: string;
  text: string;
}
export interface Props {
  list: readonly ProjectItem[];
  onSelect?: (item: ProjectItem) => void;
  convert: (item: ProjectItem) => string;
}
export const FuzzySelect = (
  { list: _initialList, onSelect, convert }: Props,
) => {
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
    setDisplay(item.displayName);
  }, [item]);

  // 開閉判定・表示する文字列の更新・検索文字列の更新
  const [open, setOpen] = useState(false);
  const onInput: h.JSX.GenericEventHandler<HTMLInputElement> = useCallback(
    ({ currentTarget: { value } }) => {
      setDisplay(value);
      setOpen(true);
      if (item?.displayName === value) return;
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
      const { key } = e;
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

      if (key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        selectPrev();
        return;
      }
      if (key === "ArrowDown") {
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

  const keys = useScrollItemIntoView(list, item, (item) => item.name);
  const onClickItem: h.JSX.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      // liのdata-keyから、クリックされた要素の番号を計算する
      const li = e.currentTarget.parentElement;
      const key = li?.dataset?.key ?? list[0].name;
      const index = list.findIndex((item) => item.name === key);
      select(Math.min(index, 0));
      setOpen(false);
    },
    [list],
  );

  // DropDownの座標計算用
  const inputRef = useRef<HTMLInputElement>(null);
  const { bottom = 0, left = 0 } =
    inputRef.current?.getBoundingClientRect?.() ?? {};

  return (
    <div className="fuzzy-select">
      <input
        ref={inputRef}
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
          style={{
            top: `${bottom}px`,
            left: `${left}px`,
          }}
        >
          {list.length > 0
            ? list.map(({ name, displayName }, index) => (
              <li
                key={name}
                {...keys[index]}
                {...(name === item?.name ? { className: "selected" } : {})}
              >
                <a onClick={onClickItem}>{displayName}</a>
              </li>
            ))
            : (
              <li>
                <span class="message">Not found</span>
              </li>
            )}
        </ul>
      )}
    </div>
  );
};
