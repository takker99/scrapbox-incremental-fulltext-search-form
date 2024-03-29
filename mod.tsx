/// <reference no-default-lib="lib" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */
import { h, render } from "./deps/preact.tsx";
import { App } from "./App.tsx";

export interface Operators {
  /** formを開く */
  open: () => void;

  /** formを閉じる */
  close: () => void;

  /** 開閉切り替え */
  toggle: () => void;
}

/** search formを起動する
 *
 * @return formの開閉操作関数
 */
export const setup = (): Promise<Operators> => {
  const app = document.createElement("div");
  const shadowRoot = app.attachShadow({ mode: "open" });
  document.body.append(app);

  return new Promise<Operators>((resolve) => {
    render(<App exportOps={resolve} />, shadowRoot);
  });
};
