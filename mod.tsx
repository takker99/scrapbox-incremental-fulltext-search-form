/** @jsxImportSource npm:preact@10 */
import { render } from "./deps/preact.tsx";
import { App } from "./App.tsx";

/** search formの操作関数 */
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
