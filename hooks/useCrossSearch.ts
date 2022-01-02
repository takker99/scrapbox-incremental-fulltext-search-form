import { useEffect, useMemo, useState } from "../deps/preact.tsx";
import { useJoinedProjectList } from "./useJoinedProjectList.ts";
import type { ProjectSummary } from "./useJoinedProjectList.ts";
import { searchJoinedProjects, searchNotJoinedProjects } from "../fetch.ts";

export interface CrossSearchOptions {
  /** 追加で横断検索したいprojects */
  projects?: ProjectSummary[];
}
export function useCrossSearch(
  query: string,
  { projects = [] }: CrossSearchOptions = {},
) {
  /** 参加しているprojectsのlist */
  const joinedList = useJoinedProjectList();
  const [results, setResults] = useState<ProjectSummary[]>([]); // 検索結果
  const [searching, setSearching] = useState(false); // 検索中かどうか
  const [error, setError] = useState<Error | undefined>(undefined);

  // projectを横断検索する
  useEffect(() => {
    (async () => {
      setError(undefined);

      // 検索語句が空なら、defaultのproject listを返す
      if (query === "") {
        setResults([...joinedList, ...projects]);
        return;
      }

      setSearching(true);
      setResults([]); // 一旦クリア
      try {
        // 参加しているprojectから検索する
        setResults((await searchJoinedProjects(query)).projects);

        // watch listから検索する
        if (projects.length > 0) {
          for await (
            const json of searchNotJoinedProjects(
              query,
              projects.map((project) => project.id),
            )
          ) {
            setResults((before) => [...before, ...json.projects]);
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          throw e;
        }
      } finally {
        setSearching(false);
      }
    })();
  }, [query, projects, joinedList]);

  return { searching, error, results };
}
