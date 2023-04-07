import { useEffect, useState } from "./deps/preact.tsx";
import { listProjects, Project } from "./deps/scrapbox-rest.ts";

/** projectsを取得するhook */
export const useProjects = (watchList: string[]): readonly Project[] => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    (async () => {
      //  listから100件ずつ検索する
      const chunk = 100;
      const chunkNum = Math.floor(watchList.length / chunk) + 1;
      let updated = false;
      for (let index = 0; index < chunkNum; index++) {
        const result = await listProjects(
          watchList.slice(index * chunk, (index + 1) * chunk),
        );
        if (!result.ok) continue;
        setProjects((prev) =>
          updated
            ? [
              ...prev,
              ...result.value.projects.filter((p) =>
                !prev.some((p2) => p2.id === p.id)
              ),
            ]
            : result.value.projects
        );
        updated = true;
      }
      if (!updated) setProjects([]);
    })();
  }, [watchList]);

  return projects;
};
