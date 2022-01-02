export type {
  MemberProject,
  Page,
  Scrapbox,
} from "https://raw.githubusercontent.com/scrapbox-jp/types/0.0.5/mod.ts";

/** The response of https://scrapbox.io/api/pages/:projectname/search/query */
export interface SearchQueryResponse {
  /** 検索対象のprojectの名前 */ projectName: string;
  /** 検索語句 */ searchQuery: string;
  query: {
    /** AND検索に使った語句 */ words: string[];
    /** NOT検索に使った語句 */ excludes: string[];
  };
  /** 検索件数の上限 */ limit: number;
  /** 検索件数 */ count: number;
  /** 詳細不明 */ existsExactTitleMatch: boolean;
  /** 検索エンジン */ backend: "elasticsearch";
  /** ヒットしたページ */
  pages: {
    /** page id */ id: string;
    /** page title */ title: string;
    /** page thumbnail
     *
     * なければ空文字が入る
     */
    image: string;
    words: string[];
    /** 検索語句に一致した行
     *
     * タイトル行のみが一致した場合は、検索語句の有無にかかわらずその次の行のみが入る
     */
    lines: string[];
  }[];
}

/** The response of https://scrapbox.io/api/projects/search/query and https://scrapbox.io/api/projects/search/watch-list*/
export interface ProjectSearchQueryResponse {
  /** 検索語句 */ searchQuery: string;
  query: {
    /** AND検索に使った語句 */ words: string[];
    /** NOT検索に使った語句 */ excludes: string[];
  };
  /** ヒットしたprojects */
  projects: {
    /** project id*/ id: string;
    /** projectのfavicon (存在する場合のみ) */ image?: string;
    /** URLで使われるprojectの名前 */ name: string;
    /** projectの表示名 */ displayName: string;
  }[];
}
