import { useEffect, useMemo, useState } from "../deps/preact.tsx";
import { getJoinedProjects } from "../fetch.ts";

/** projectの情報 */
export interface ProjectSummary {
  /** project id */ id: string;
  /** URLで使われるprojectの名前 */ name: string;
  /** projectの表示名 */ displayName: string;
}
let joinedProjectList: ProjectSummary[] | undefined;

/** 参加しているProjectのlistを取得する */
export function useJoinedProjectList() {
  useEffect(() => {
    if (joinedProjectList) return;
    (async () => {
      // 参加しているprojectを取得する
      const projects = await getJoinedProjects();
      joinedProjectList = projects.map(({ id, name, displayName }) => ({
        id,
        name,
        displayName,
      }));
    })();
  }, []);

  return joinedProjectList ?? [];
}
