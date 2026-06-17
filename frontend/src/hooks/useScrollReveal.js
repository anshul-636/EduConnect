import { useEffect } from 'react';

/**
 * Adds scroll-reveal behaviour to any element with class `.reveal`, `.reveal-left` or `.reveal-scale`.
 * A `threshold` (0–1) controls how much of the element must be visible before triggering.
 */
export function useScrollReveal(threshold = 0.12) {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');

    if (!('IntersectionObserver' in window)) {
      // Fallback for old browsers — just show everything
      targets.forEach(el => el.classList.add('visible'));
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

    targets.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);
}
