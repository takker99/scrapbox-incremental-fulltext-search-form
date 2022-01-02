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
  useState,
} from "./deps/preact.tsx";
import { FuzzySelect } from "./components/FuzzySelect.tsx";
import { ErrorMessage } from "./components/ErrorMessage.tsx";
import { Card } from "./components/Card.tsx";
import { useOpen } from "./hooks/useOpen.ts";
import { useSearch } from "./hooks/useSearch.ts";
import { useProjectSearch } from "./hooks/useProjectSearch.ts";
import { CSS } from "./style.css.min.ts";
import type { Scrapbox } from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

const Spinner = () => <i className="" />;

const openForm: (() => void) | undefined;
const converter = ({ key, text }) => `${key} ${text}`;
interface Props {
  watchList: string[];
}
function App({ watchList }: Props) {
  const [isOpen, { open, close }] = useOpen(false);
  const [project, setProject] = useState(scrapbox.Project.name ?? "help-jp");
  const [query, setQuery] = useState("");
  const [disabled, setDisabled] = useState(true);
  // ボタンの状態から、横断検索の開始を判定する
  const queryForProject = useMemo(() => disabled ? query : "", [
    disabled,
    query,
  ]);

  const [includeWatchList, setIncludeWatchList] = useState(false);
  const { loading, items } = useSearch({ project, query }); // 全文検索する
  const { searching, error, projects } = useProjectSearch({ // projectを横断検索する
    query: queryForProject,
    watchList: watchList,
    includeWatchList,
  });
  // FuzzySelect用にデータを加工する
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

  // 入力欄の値を反映する
  const onProjectChange = ({ key }) => setProject(key);
  const onInput = ({ target: { value } }) => {
    setDisabled(false);
    setQuery(value);
  };

  /** <Esc>を押したら検索フォームを閉じる */
  const handleKeydown = useCallback(({ key }) => {
    if (key !== "Escape") return;
    close();
  }, []);

  // 検索結果アイテムを押したときの動作
  // 同じタブでページを開くときは、検索フォームを一旦閉じる
  const handleClick = useCallback(
    ({ ctrlKey, shiftKey, altKey, metaKey, target }) => {
      if (
        target.target === "_blank" || ctrlKey || shiftKey || altKey || metaKey
      ) {
        return;
      }
      close();
    },
    [],
  );

  // project横断検索を開始したら、開始ボタンを無効化する
  const onFilter = useCallback(() => setDisabled(true), []);

  // Componentの外から検索フォームを開けるようにする
  useEffect(() => openForm = open, []);

  return (
    <>
      <style>{CSS}</style>
      <div hidden={isOpen}>
        <Background onClose={close} />
        {/*どのcomponentsにfocusが当たっていても、フォームを閉じるショートカットキーを検知できるようにするためにcapture modeを用いている*/}
        <div className="container" onKeydownCapture={handleKeydown}>
          <div className="search-form">
            <FuzzySelect
              list={list}
              converter={converter}
              onSelect={onProjectChange}
            />
            <input type="text" value={query} onInput={onInput} />
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
              value={!includeWatchList}
              onChange={({ target }) => setIncludeWatchList(target.value)}
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
            <ErrorMessage error={error} />
          </div>
          {items.length > 0 &&
            (
              <ul className="dropdown">
                {items.map((item) => (
                  <li key={item.title}>
                    <Card
                      item={item}
                      baseProject={scrapbox.Project.name ?? "help-jp"}
                      onClick={handleClick}
                    />
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </>
  );
}

export interface MountOption {
  /** Watch Listからも検索するかどうか
   *
   * @default true
   */
  includingWatchList?: boolean;
}
export function mount(projects = [], option: MountOption = {}) {
  const app = document.createElement("div");
  const shadowRoot = app.attachShadow({ mode: "open" });
  document.body.append(app);
  render(<App watchList={watchList} />, shadowRoot);

  return () => openForm?.();
}
