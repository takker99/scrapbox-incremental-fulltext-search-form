import { useMemo } from "./deps/preact.tsx";
import { Asearch } from "./deps/asearch.ts";

/** あいまい検索するhook
 *
 * @param 検索語句
 * @param 検索候補
 * @param 検索候補を検索用文字列に変換する函数
 */
export const useFuzzySearch = <T>(
  query: string,
  candidates: readonly T[],
  converter: (candidate: T) => string,
) =>
  useMemo(() => {
    if (!query) return candidates;

    const { match } = Asearch(` ${query} `);
    return candidates.flatMap((candidate) => {
      const result = match(converter(candidate));
      return result.found ? [[candidate, result.distance]] as const : [];
    }).sort((a, b) => a[1] - b[1]).map(([candidate]) => candidate);
  }, [query, candidates, converter]);
