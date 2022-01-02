import { useCallback, useEffect, useState } from "../deps/preact.tsx";

export function useLoader(
  callback: CallableFunction,
  delay: number,
  deps = [] as unknown[],
) {
  const [loading, setLoading] = useState(false);
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    (async () => {
      const timer = setTimeout(() => setLoading(true), delay);
      await memoizedCallback();
      clearTimeout(timer);
      setLoading(false);
    })();
  }, [memoizedCallback, delay]);

  return loading;
}
