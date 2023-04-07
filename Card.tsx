/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
import { h, useCallback } from "./deps/preact.tsx";
import {
  encodeTitleURI,
  pushPageTransition,
  Scrapbox,
} from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

export interface CardProps {
  project: string;
  title: string;
  lines: string[];
  query: string;
  close: () => void;
}

export const Card = ({ project, title, lines, query, close }: CardProps) => {
  const handleClick = useCallback(
    (e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
      pushPageTransition({ type: "search", query, to: { project, title } });
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      close();
    },
    [project, title, query, close],
  );

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
        {lines.map((line) => <span>{line}</span>)}
      </div>
    </a>
  );
};
