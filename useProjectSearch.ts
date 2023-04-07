/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
/** @jsxFrag Fragment */
import { useEffect, useRef, useState } from "./deps/preact.tsx";
import {
  ErrorLike,
  Project,
  searchForJoinedProjects,
  searchForWatchList,
} from "./deps/scrapbox-rest.ts";

export interface UseProjectSearchOptions {
  watchList?: string[];
}
export interface ProjectItem {
  name: string;
  displayName: string;
}
export const useProjectSearch = (
  query: string,
  source: readonly Project[],
) => {
  /** 検索結果 */
  const [projects, setProjects] = useState<readonly ProjectItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<ErrorLike | undefined>(undefined);
  const done = useRef<Promise<void>>(Promise.resolve());

  // projectを横断検索する
  useEffect(() => {
    // 検索語句が空なら、defaultのproject listを返す
    if (query === "") {
      setProjects(source);
      setError(undefined);
      return;
    }

    let terminate = false;
    done.current = (async () => {
      // 前回の検索処理が終わってから検索し始める
      await done.current;
      if (terminate) return;

      setSearching(true);
      let changed = false;
      try {
        // 参加しているprojectから検索する
        {
          const result = await searchForJoinedProjects(query);
          if (terminate) return;
          if (result.ok) {
            setProjects(result.value.projects);
            changed = true;
          } else {
            setProjects([]);
            setError(result.value);
          }
        }
        const watchList = source.map((p) => p.id);
        if (watchList.length === 0) return;

        const chunk = 100;
        // watch listから100件ずつ検索する
        const chunkNum = Math.floor(watchList.length / chunk) + 1;
        for (let index = 0; index < chunkNum; index++) {
          const result = await searchForWatchList(
            query,
            watchList.slice(index * chunk, (index + 1) * chunk),
          );
          if (terminate) return;
          if (result.ok) {
            setProjects((prev) =>
              changed
                ? [...prev, ...result.value.projects]
                : result.value.projects
            );
            changed = true;
          } else {
            setError(result.value);
          }
        }
      } catch (e) {
        setError(e.toString());
      } finally {
        setSearching(false);
      }
    })();
    return () => terminate = true;
  }, [query, source]);

  return { searching, error, projects };
};
