import { useEffect, useState } from "./deps/preact.tsx";
import { listProjects, Project } from "./deps/scrapbox-rest.ts";

/** 参加しているprojectsを取得するhook */
export const useJoinedProject = (): readonly Project[] => {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    (async () => {
      const result = await listProjects([]);
      setProjects(result.ok ? result.value.projects : []);
    })();
  }, []);

  return projects;
};
