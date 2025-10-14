/**
 * Scroll-based animations using Intersection Observer
 * SSGOI-inspired smooth animations triggered by scroll
 */

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean; // Animate only once
  delay?: number;
  duration?: number;
}

const defaultOptions: ScrollAnimationOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  once: true,
  delay: 0,
  duration: 600
};

/**
 * Apply scroll-triggered animation to an element
 */
export function scrollAnimate(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  const opts = { ...defaultOptions, ...options };

  // Add initial hidden state
  node.style.opacity = '0';
  node.style.transform = 'translateY(30px)';
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), transform ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
  node.style.transitionDelay = `${opts.delay}ms`;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !opts.once) {
            // Trigger animation
            setTimeout(() => {
              node.style.opacity = '1';
              node.style.transform = 'translateY(0)';
            }, 10);

            hasAnimated = true;

            if (opts.once) {
              observer.unobserve(node);
            }
          }
        } else if (!opts.once) {
          // Reset if not "once"
          node.style.opacity = '0';
          node.style.transform = 'translateY(30px)';
        }
      });
    },
    {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Fade in from bottom on scroll
 */
export function scrollFadeUp(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  return scrollAnimate(node, {
    ...options
  });
}

/**
 * Fade in from left on scroll
 */
export function scrollFadeLeft(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  const opts = { ...defaultOptions, ...options };

  node.style.opacity = '0';
  node.style.transform = 'translateX(-30px)';
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), transform ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
  node.style.transitionDelay = `${opts.delay}ms`;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !opts.once) {
            setTimeout(() => {
              node.style.opacity = '1';
              node.style.transform = 'translateX(0)';
            }, 10);
            hasAnimated = true;
            if (opts.once) observer.unobserve(node);
          }
        } else if (!opts.once) {
          node.style.opacity = '0';
          node.style.transform = 'translateX(-30px)';
        }
      });
    },
    {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Fade in from right on scroll
 */
export function scrollFadeRight(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  const opts = { ...defaultOptions, ...options };

  node.style.opacity = '0';
  node.style.transform = 'translateX(30px)';
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), transform ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
  node.style.transitionDelay = `${opts.delay}ms`;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !opts.once) {
            setTimeout(() => {
              node.style.opacity = '1';
              node.style.transform = 'translateX(0)';
            }, 10);
            hasAnimated = true;
            if (opts.once) observer.unobserve(node);
          }
        } else if (!opts.once) {
          node.style.opacity = '0';
          node.style.transform = 'translateX(30px)';
        }
      });
    },
    {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Scale up on scroll
 */
export function scrollScale(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  const opts = { ...defaultOptions, ...options };

  node.style.opacity = '0';
  node.style.transform = 'scale(0.9)';
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), transform ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
  node.style.transitionDelay = `${opts.delay}ms`;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !opts.once) {
            setTimeout(() => {
              node.style.opacity = '1';
              node.style.transform = 'scale(1)';
            }, 10);
            hasAnimated = true;
            if (opts.once) observer.unobserve(node);
          }
        } else if (!opts.once) {
          node.style.opacity = '0';
          node.style.transform = 'scale(0.9)';
        }
      });
    },
    {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Blur in on scroll
 */
export function scrollBlur(
  node: HTMLElement,
  options: ScrollAnimationOptions = {}
): { destroy: () => void } {
  const opts = { ...defaultOptions, ...options };

  node.style.opacity = '0';
  node.style.filter = 'blur(10px)';
  node.style.transform = 'translateY(20px)';
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), filter ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1), transform ${opts.duration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
  node.style.transitionDelay = `${opts.delay}ms`;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !opts.once) {
            setTimeout(() => {
              node.style.opacity = '1';
              node.style.filter = 'blur(0px)';
              node.style.transform = 'translateY(0)';
            }, 10);
            hasAnimated = true;
            if (opts.once) observer.unobserve(node);
          }
        } else if (!opts.once) {
          node.style.opacity = '0';
          node.style.filter = 'blur(10px)';
          node.style.transform = 'translateY(20px)';
        }
      });
    },
    {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Stagger animation helper for multiple elements
 */
export function scrollStagger(
  selector: string,
  options: ScrollAnimationOptions = {},
  staggerDelay: number = 100
): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    scrollAnimate(element as HTMLElement, {
      ...options,
      delay: (options.delay || 0) + index * staggerDelay
    });
  });
}
