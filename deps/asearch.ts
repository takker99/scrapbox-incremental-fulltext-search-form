// ported from https://github.com/takker99/deno-asearch/blob/0.4.1/mod.ts
const INITPATTERN = 0x80000000;
const wildCard = " ";

/** 初期状態の有限オートマトンを作る */
export const makeInitState = (
  maxDistance: number,
): State => {
  const state: State = [INITPATTERN];
  for (let i = 1; i <= maxDistance; i++) {
    state.push(0);
  }
  return state;
};

/** masks used for Bitap algorithm */
export interface Mask {
  /** masks represented by occurrences of each charcter */
  shift: Map<string, number>;
  /** the wild mask */
  wild: number;
  /** the mask represented by accept state */
  accept: number;
}

/** options for search */
export interface SearchOption {
  /** turn false if you want to disable case insensitive search
   *
   * @default true
   */
  ignoreCase?: boolean;
}
/** あいまい検索に使うマスクを作成する
 *
 * @param source 検索対象の文字列
 */
export const makeMask = (source: string, option?: SearchOption): Mask => {
  const { ignoreCase = true } = option ?? {};
  const shift = new Map<string, number>();
  let wild = 0;
  let accept = INITPATTERN;
  let prevChar = "";
  for (const char of source) {
    if (char === wildCard && char !== prevChar) {
      wild |= accept;
    } else {
      for (
        const i of ignoreCase
          ? [char, char.toLowerCase(), char.toUpperCase()]
          : [char]
      ) {
        const pat = (shift.get(i) ?? 0) | accept;
        shift.set(i, pat);
      }
      accept >>>= 1;
    }
    prevChar = char;
  }

  return { shift, wild, accept };
};

export type State = [number, ...number[]];
/** 状態遷移機械に文字列を入力する
 *
 * @param text 入力する文字列
 * @param mask bit masks
 * @param state 入力前の状態遷移機械
 */
export const moveState = (
  text: string,
  mask: Omit<Mask, "accept">,
  state: State,
): State => {
  const bits: State = [...state];
  const { shift, wild } = mask;
  for (const char of text) {
    const charMask = shift.get(char) ?? 0;
    if (bits.length > 1) {
      for (let i = bits.length - 1; i > 0; i--) {
        bits[i] = (bits[i] & wild) | ((bits[i] & charMask) >>> 1) |
          (bits[i - 1] >>> 1) | bits[i - 1];
      }
    }
    bits[0] = (bits[0] & wild) | ((bits[0] & charMask) >>> 1);
    if (bits.length > 1) {
      for (let i = 1; i < bits.length; i++) {
        bits[i] |= bits[i - 1] >>> 1;
      }
    }
  }
  return bits;
};

/** あいまい検索結果
 *
 * 見つかった場合はLevenshtein距離も格納する
 */
export type MatchResult = {
  found: false;
} | {
  found: true;
  distance: number;
};
export interface AsearchResult {
  /** 検索対象の文字列 */ source: string;

  /** 与えた文字列が特定のLevenshtein距離でマッチするか判定する
   *
   * @param str 判定する文字列
   * @param distance 指定するLevenshtein距離
   * @return マッチしたら`true`
   */
  test: (str: string, distance: number) => boolean;

  /** 与えた文字列と検索対象文字列とのLevenshtein距離を返す
   *
   * Levenshtein距離が`maxDistance`を超える場合は、マッチしなかったとみなす
   *
   * @param str この文字列との距離を計算する
   * @param [maxDistance=3] 許容するLevenshtein距離
   * @return 編集距離とマッチ結果を返す
   */
  match: (str: string, maxDistance?: number) => MatchResult;
}
/** あいまい検索を実行する函数を作る
 *
 * @param source 検索対象の文字列
 * @param option search options
 */
export const Asearch = (
  source: string,
  option?: SearchOption,
): AsearchResult => {
  const mask = makeMask(source, option);
  const lengthWithoutWild = source.split(wildCard).join("").length;
  const canPartiallyMatch = source.length !== lengthWithoutWild;

  const test = (str: string, distance = 0): boolean => {
    if (
      lengthWithoutWild > str.length + distance ||
      (!canPartiallyMatch && (str.length > source.length + distance))
    ) {
      return false;
    }
    if (str === "") return distance === lengthWithoutWild;
    const initState = makeInitState(distance);
    const state = moveState(str, mask, initState);
    return (state[distance] & mask.accept) !== 0;
  };

  const match = (
    str: string,
    maxDistance = 3,
  ): MatchResult => {
    if (
      lengthWithoutWild > str.length + maxDistance ||
      (!canPartiallyMatch && (str.length > source.length + maxDistance))
    ) {
      return { found: false };
    }
    if (str === "") {
      return { found: true, distance: lengthWithoutWild };
    }

    const initState = makeInitState(maxDistance);
    const state = moveState(str, mask, initState);
    const distance = state.findIndex((s) => (s & mask.accept) !== 0);
    return distance >= 0 ? { found: true, distance } : { found: false };
  };

  return {
    test,
    match,
    source,
  };
};
