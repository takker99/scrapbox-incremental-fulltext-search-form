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
  useRef,
  useState,
} from "./deps/preact.tsx";
import { Card } from "./Card.tsx";
import { useOpen, UseOpenOperators } from "./useOpen.ts";
import { useSearch } from "./useSearch.ts";
import { CSS } from "./CSS.tsx";
import type { Scrapbox } from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

const Spinner = () => <i className="spinner" />;

export interface AppProps {
  exportOps: (init: UseOpenOperators) => void;
}

export const App = ({ exportOps }: AppProps) => {
  const [query, setQuery] = useState("");

  const project = scrapbox.Project.name;
  // 全文検索する
  const { loading, result } = useSearch(project, query);

  const handleInput = useCallback(
    (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
      setQuery(e.currentTarget.value);
    },
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
          <input type="text" value={query} onInput={handleInput} />
          <div className="info">
            {loading && <Spinner />}
            {`${result?.pages?.length ?? 0} pages`}
          </div>
        </div>
        {result?.pages && result.pages.length > 0 &&
          (
            <ul className="result">
              {result.pages.map((item) => (
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
          )}
      </div>
    </>
  );
};
