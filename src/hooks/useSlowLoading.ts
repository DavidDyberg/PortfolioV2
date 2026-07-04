import { useEffect, useState } from "react";

/** Returns true when `isLoading` has been true continuously for `delayMs`. */
export const useSlowLoading = (isLoading: boolean, delayMs = 8000): boolean => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(t);
  }, [isLoading, delayMs]);

  return slow;
};
