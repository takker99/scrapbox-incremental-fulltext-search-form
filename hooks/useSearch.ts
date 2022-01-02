import { useMemo, useState } from "../deps/preact.tsx";
import { useLoader } from "./useLoader.ts";
import { throttle } from "../deps/throttle.ts";
import { searchForPages } from "../fetch.ts";

export interface FoundPage {
  project: string;
  title: string;
  words: string[];
  lines: string[];
}
export function useSearch(project: string, query: string) {
  const [items, setItems] = useState<FoundPage[]>([]);

  const search = useMemo(() =>
    throttle(
      async (_project: string, _query: string) => {
        if (_query === "" || _project === "") {
          setItems([]);
          return;
        }
        try {
          const { pages } = await searchForPages(_query, _project);
          setItems(
            pages.map(({ title, words, lines }) => ({
              project: _project,
              title,
              words,
              lines,
            })),
          );
        } catch (e) {
          console.error(e);
          setItems([]);
        }
      },
      {
        interval: 500,
        trailing: true,
      },
    ), []);

  const loading = useLoader(
    async () => await search(project, query),
    1500,
    [search, project, query],
  );

  return { loading, items };
}
