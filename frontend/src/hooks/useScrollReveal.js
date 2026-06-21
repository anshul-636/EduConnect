import { useEffect } from 'react';

/**
 * Adds scroll-reveal behaviour to any element with class `.reveal`, `.reveal-left`,
 * `.reveal-right` or `.reveal-scale`.
 *
 * Uses a MutationObserver alongside the IntersectionObserver so cards that render
 * later (e.g. after an async fetch finishes) are picked up automatically — not
 * just the elements present at first paint.
 *
 * A `threshold` (0–1) controls how much of the element must be visible before triggering.
 */
export function useScrollReveal(threshold = 0.12) {
  useEffect(() => {
    const SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

    if (!('IntersectionObserver' in window)) {
      // Fallback for old browsers — just show everything, now and as it arrives
      document.querySelectorAll(SELECTOR).forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold }
    );

    const observeAll = () => {
      document.querySelectorAll(SELECTOR).forEach(el => {
        if (!el.classList.contains('visible')) observer.observe(el);
      });
    };

    observeAll();

    // Watch for new reveal targets added to the DOM (async data, route changes, etc.)
    const mutationObserver = new MutationObserver(observeAll);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);
}
