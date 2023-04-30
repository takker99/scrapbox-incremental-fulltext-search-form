/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
import { h, useCallback, useMemo } from "./deps/preact.tsx";
import {
  encodeTitleURI,
  pushPageTransition,
  Scrapbox,
} from "./deps/scrapbox.ts";
import { SearchResult } from "./deps/scrapbox-rest.ts";
import { escapeRegExp } from "./escapeRegExp.ts";
declare const scrapbox: Scrapbox;

export type Page = SearchResult["pages"][0];

export interface CardProps extends Page {
  project: string;
  query: string;
  close: () => void;
}

export const Card = (
  { project, title, words, lines, query, close }: CardProps,
) => {
  const handleClick = useCallback(
    (e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
      pushPageTransition({ type: "search", query, to: { project, title } });
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      close();
    },
    [project, title, query, close],
  );

  const highlightedLines = useMemo(() => {
    const regExp = new RegExp(
      `(${words.map((word) => escapeRegExp(word)).join("|")})`,
      "i",
    );
    return lines.flatMap((line) => {
      const words = line.split(regExp);
      return (
        <span>
          {words.map((word, i) => i % 2 === 0 ? word : <strong>{word}</strong>)}
        </span>
      );
    });
  }, [lines, words]);

  return (
    <a
      href={`/${project}/${encodeTitleURI(title)}`}
      target={`${project === scrapbox.Project.name ? "" : "_blank"}`}
      rel={`${
        project === scrapbox.Project.name ? "route" : "noopener noreferrer"
      }`}
      onClick={handleClick}
    >
      {title}
      <div className="description">
        {highlightedLines}
      </div>
    </a>
  );
};
