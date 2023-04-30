/** 正規表現をescapeする */
export const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
