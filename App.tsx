/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
/** @jsxFrag Fragment */
import {
  Fragment,
  h,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "./deps/preact.tsx";
import { FuzzySelect, Item } from "./FuzzySelect.tsx";
import { Card } from "./Card.tsx";
import { useOpen, UseOpenOperators } from "./useOpen.ts";
import { useSearch } from "./useSearch.ts";
import { useProjectSearch } from "./useProjectSearch.ts";
import { CSS } from "./CSS.tsx";
import type { Scrapbox } from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

const Spinner = () => <i className="" />;

const converter = ({ key, text }: Item) => `${key} ${text}`;

export interface AppProps {
  watchList: string[];
  exportOps: (init: UseOpenOperators) => void;
}

export const App = ({ watchList, exportOps }: AppProps) => {
  const [query, setQuery] = useState("");
  const [disabled, setDisabled] = useState(true);
  // ボタンの状態から、横断検索の開始を判定する
  const queryForProject = useMemo(() => disabled ? query : "", [
    disabled,
    query,
  ]);
  // project横断検索を開始したら、開始ボタンを無効化する
  const onFilter = useCallback(() => setDisabled(true), []);

  const [includeWatchList, setIncludeWatchList] = useState(false);
  const watchList_ = useMemo(() => includeWatchList ? watchList : [], [
    includeWatchList,
    watchList,
  ]);
  const { searching, error, projects } = useProjectSearch(queryForProject, {
    watchList: watchList_,
  });

  /** FuzzySelect用データ */
  const list = useMemo(
    () =>
      projects.map(({ name, displayName }) => ({
        key: name,
        text: displayName,
      })),
    [projects],
  );

  // 横断検索のAPI limitに引っかかっているときはボタンを無効化する
  useEffect(() => error && setDisabled(true), [error]);

  const [project, setProject] = useState(scrapbox.Project.name);
  // 入力欄の値を反映する
  const onProjectChange = useCallback(({ key }: Item) => setProject(key), []);
  // 全文検索する
  const { loading, items } = useSearch(project, query);

  const handleInput = useCallback(
    (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
      setDisabled(false);
      setQuery(e.currentTarget.value);
    },
    [],
  );
  const handleChecked = useCallback(
    (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) =>
      setIncludeWatchList(e.currentTarget.checked),
    [],
  );
  const [isOpen, { open, close, toggle }] = useOpen(false);
  const exportRef = useRef<UseOpenOperators>({ open, close, toggle });
  useEffect(() => {
    Object.assign(exportRef.current, { open, close, toggle });
  }, [open, close, toggle]);
  useEffect(() => exportOps(exportRef.current), [exportOps]);

  return (
    <>
      <CSS />
      <div
        id="background"
        className={`modal${!isOpen ? " closed" : ""}`}
        onClick={close}
      >
        <div className="controller">
          <button className="close-button" onClick={close}>x</button>
          <FuzzySelect
            list={list}
            convert={converter}
            onSelect={onProjectChange}
          />
          <input type="text" value={query} onInput={handleInput} />
          <button type="button" onClick={onFilter} disabled={disabled}>
            {disabled
              ? (
                <>
                  {searching && <Spinner />}
                  {`Found ${projects.length} projects`}
                </>
              )
              : <>Search all projects</>}
          </button>
          <input
            type="checkbox"
            checked={!includeWatchList}
            onChange={handleChecked}
          />
          <label>Search besides watch list</label>
          <span className="info">
            {loading
              ? (
                <>
                  <Spinner />
                  {`Searching for ${query}...`}
                </>
              )
              : <>{`${items.length} results`}</>}
          </span>
        </div>
        {error
          ? <div className="viewer error">{error}</div>
          : items.length > 0 &&
            (
              <div className="viewer">
                <ul className="dropdown">
                  {items.map((item) => (
                    <li key={item.title}>
                      <Card
                        {...item}
                        project={project}
                        query={query}
                        close={close}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </div>
    </>
  );
};
