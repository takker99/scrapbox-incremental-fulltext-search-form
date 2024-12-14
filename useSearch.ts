import { isOk, unwrapOk } from "./deps/option-t.ts";
import { useEffect, useRef, useState } from "./deps/preact.tsx";
import { searchForPages, SearchResult } from "./deps/scrapbox-rest.ts";

export interface FoundPage {
  title: string;
  words: string[];
  lines: string[];
}
export interface UserSearchResult {
  loading: boolean;
  result?: SearchResult;
}

export const useSearch = (project: string, query: string): UserSearchResult => {
  const [result, setItems] = useState<SearchResult | undefined>();
  const [loading, setLoading] = useState(false);

  const done = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (query === "") {
      setItems(undefined);
      return;
    }

    let terminate = false;
    done.current = (async () => {
      await done.current;
      if (terminate) return;

      setLoading(true);
      try {
        const result = await searchForPages(query, project);
        if (terminate) return;
        setItems(isOk(result) ? unwrapOk(result) : undefined);
      } finally {
        setLoading(false);
      }
    })();

    return () => terminate = true;
  }, [query, project]);

  return { loading, result };
};
