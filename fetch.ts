import type {
  MemberProject,
  ProjectSearchQueryResponse,
  SearchQueryResponse,
} from "./deps/scrapbox.ts";

interface ErrorLike {
  name: string;
  message: string;
}

/** 参加しているprojectsを取得する */
export async function getJoinedProjects() {
  const res = await fetch("/api/projects");
  await throwError(res);
  const { projects } = (await res.json()) as { projects: MemberProject[] };
  return projects;
}

/** project内全文検索を実行する
 *
 * @param query 検索語句
 * @param project 検索対象のproject name
 */
export async function searchForPages(query: string, project: string) {
  const res = await fetch(
    `/api/pages/${project}/search/query?q=${encodeURIComponent(query)}`,
  );
  await throwError(res);
  return (await res.json()) as SearchQueryResponse;
}

/** 参加しているprojectを横断検索する
 *
 * @param query 検索語句
 */
export async function searchJoinedProjects(query: string) {
  const res = await fetch(
    `/api/projects/search/query?q=${encodeURIComponent(query)}`,
  );
  await throwError(res);
  return (await res.json()) as ProjectSearchQueryResponse;
}

/** 参加していないprojectを横断検索する
 *
 * @param query 検索語句
 * @param projectIds 横断検索したいprojectsのidのlist
 */
export async function* searchNotJoinedProjects(
  query: string,
  projectIds: string[],
) {
  // 参加しているprojectsを除く
  const joinedIds = (await getJoinedProjects()).map((project) => project.id);
  const notJoinedProjects = [
    ...new Set(projectIds.filter((id) => !joinedIds.includes(id))),
  ];

  // 100件ずつ検索する
  const chunkNum = Math.floor(notJoinedProjects.length / 100) + 1;
  for (let index = 0; index < chunkNum; index++) {
    const params = new URLSearchParams();
    params.append("q", encodeURIComponent(query));
    notJoinedProjects.slice(index * 100, 100 + index * 100)
      .forEach((id) => params.append("ids", id));
    const res = await fetch(
      `/api/projects/search/watch-list?${params.toString()}`,
    );
    await throwError(res);
    yield (await res.json()) as ProjectSearchQueryResponse;
  }
}

async function throwError(response: Response) {
  if (response.ok) return;
  const { message, name } = (await response.json()) as ErrorLike;
  const error = new Error();
  error.name = name;
  error.message = message;
  throw error;
}
