import { useEffect, useRef, useState } from "./deps/preact.tsx";
import { searchForPages } from "./deps/scrapbox-rest.ts";

export interface FoundPage {
  title: string;
  words: string[];
  lines: string[];
}
export interface UserSearchResult {
  loading: boolean;
  items: FoundPage[];
}

export const useSearch = (project: string, query: string): UserSearchResult => {
  const [items, setItems] = useState<FoundPage[]>([]);
  const [loading, setLoading] = useState(false);

  const done = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (query === "") {
      setItems((prev) => prev.length === 0 ? prev : []);
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
        setItems(result.ok ? result.value.pages : []);
      } finally {
        setLoading(false);
      }
    })();

    return () => terminate = true;
  }, [query, project]);

  return { loading, items };
};
