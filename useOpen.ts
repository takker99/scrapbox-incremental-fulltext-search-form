import { useCallback, useState } from "./deps/preact.tsx";

export interface UseOpenOperators {
  open: () => void;
  close: () => void;
}
export const useOpen = (
  flag: boolean,
): readonly [boolean, UseOpenOperators] => {
  const [isOpen, setOpen] = useState(flag);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return [isOpen, { open, close }] as const;
};
