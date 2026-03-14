import { useEffect, useState } from "react";

/**
 * Returns a number 0–1 representing how far the user has scrolled
 * from the top of `targetRef` element to its bottom.
 */
export function useScrollProgress(targetRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = targetRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Full range: element top enters viewport → element bottom leaves viewport
      const totalTravel = rect.height + windowH;
      const traveled = windowH - rect.top;
      const p = Math.min(Math.max(traveled / totalTravel, 0), 1);
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [targetRef]);

  return progress;
}

/**
 * Returns global page scroll progress 0–1.
 */
export function usePageScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? window.scrollY / docH : 0;
      setProgress(Math.min(Math.max(p, 0), 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}
