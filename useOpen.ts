import { useCallback, useState } from "./deps/preact.tsx";

export interface UseOpenOperators {
  open: () => void;
  close: () => void;
  toggle: () => void;
}
export const useOpen = (
  flag: boolean,
): readonly [boolean, UseOpenOperators] => {
  const [isOpen, setOpen] = useState(flag);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return [isOpen, { open, close, toggle }] as const;
};
