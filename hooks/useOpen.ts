import { useCallback, useState } from "../deps/preact.tsx";

export function useOpen(flag: boolean) {
  const [isOpen, setOpen] = useState(flag);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return [isOpen, { open, close }] as const;
}
