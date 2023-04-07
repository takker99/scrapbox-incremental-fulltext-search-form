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
import { FuzzySelect } from "./FuzzySelect.tsx";
import { Card } from "./Card.tsx";
import { useOpen, UseOpenOperators } from "./useOpen.ts";
import { useSearch } from "./useSearch.ts";
import { ProjectItem, useProjectSearch } from "./useProjectSearch.ts";
import { useProjects } from "./useProjects.ts";
import { CSS } from "./CSS.tsx";
import type { Scrapbox } from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

const Spinner = () => <i className="spinner" />;

const converter = ({ name, displayName }: ProjectItem) =>
  `${name} ${displayName}`;

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
  const source_ = useProjects(watchList);
  const source = useMemo(
    () => includeWatchList ? source_ : source_.filter((p) => p.isMember),
    [includeWatchList, source_],
  );
  const { searching, error, projects } = useProjectSearch(
    queryForProject,
    source,
  );

  // 横断検索のAPI limitに引っかかっているときはボタンを無効化する
  useEffect(() => error && setDisabled(true), [error]);

  const [project, setProject] = useState(scrapbox.Project.name);
  // 入力欄の値を反映する
  const onProjectChange = useCallback(
    ({ name }: ProjectItem) => setProject(name),
    [],
  );
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
  }, []);
  useEffect(() => exportOps(exportRef.current), [exportOps]);
  const handleClose = useCallback(
    (e: h.JSX.TargetedMouseEvent<HTMLDivElement>) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.id !== "background") return;
      close();
    },
    [],
  );

  return (
    <>
      <CSS />
      <div
        id="background"
        className={`modal${!isOpen ? " closed" : ""}`}
        onClick={handleClose}
      >
        <div className="controller">
          <FuzzySelect
            list={source}
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
            checked={includeWatchList}
            onChange={handleChecked}
          />
          <label>Search besides watch list</label>
          <button className="close-button" onClick={close}>x</button>
        </div>
        {error
          ? <div className="viewer error">{error}</div>
          : items.length > 0 &&
            (
              <>
                <div className="info">
                  {loading && <Spinner />}
                  {`${items.length} pages`}
                </div>
                <ul className="result">
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
              </>
            )}
      </div>
    </>
  );
};
