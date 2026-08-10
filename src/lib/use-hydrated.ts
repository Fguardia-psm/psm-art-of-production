import { useEffect, useState } from "react";

/** True after client mount — safe to trust zustand persist / localStorage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
