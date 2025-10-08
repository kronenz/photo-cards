/**
 * Focus Trap Utility
 * 
 * Feature: 002-integrated-holographic-platform
 * Task: T052 [US5]
 * 
 * Purpose: Implement keyboard focus trap in modals for accessibility compliance
 * - Trap focus within modal boundaries
 * - Handle Tab/Shift+Tab navigation
 * - Return focus to trigger element when modal closes
 * - Support escape key to close modal
 */

export interface FocusTrapOptions {
  /** Element to return focus to when trap is deactivated */
  returnFocusTo?: HTMLElement | null;
  /** Whether to trap focus on activation */
  trapFocus?: boolean;
  /** Whether to allow focus to escape on Escape key */
  allowEscape?: boolean;
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Whether to prevent scrolling when trap is active */
  preventScroll?: boolean;
}

export class FocusTrap {
  private container: HTMLElement;
  private options: FocusTrapOptions;
  private previouslyFocusedElement: HTMLElement | null = null;
  private isActive = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private originalBodyStyle: string = '';

  constructor(container: HTMLElement, options: FocusTrapOptions = {}) {
    this.container = container;
    this.options = {
      trapFocus: true,
      allowEscape: true,
      preventScroll: true,
      ...options,
    };
  }

  /**
   * Activate focus trap
   */
  activate(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Store original body style
    if (this.options.preventScroll) {
      this.originalBodyStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    // Set up keyboard event handler
    this.keydownHandler = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.keydownHandler);

    // Focus first focusable element
    if (this.options.trapFocus) {
      this.focusFirstElement();
    }
  }

  /**
   * Deactivate focus trap
   */
  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Restore body style
    if (this.options.preventScroll) {
      document.body.style.overflow = this.originalBodyStyle;
    }

    // Remove keyboard event handler
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }

    // Return focus to previously focused element
    if (this.options.returnFocusTo) {
      this.options.returnFocusTo.focus();
    } else if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  /**
   * Handle keyboard events
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isActive) return;

    // Handle Escape key
    if (event.key === 'Escape' && this.options.allowEscape) {
      event.preventDefault();
      event.stopPropagation();
      this.options.onEscape?.();
      return;
    }

    // Handle Tab key for focus trapping
    if (event.key === 'Tab' && this.options.trapFocus) {
      this.handleTabKey(event);
    }
  }

  /**
   * Handle Tab key navigation within trap
   */
  private handleTabKey(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: move backwards
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move forwards
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Get all focusable elements within the container
   */
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    // Filter out elements that are not visible or are disabled
    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('disabled') &&
        !element.hasAttribute('aria-hidden')
      );
    });
  }

  /**
   * Focus the first focusable element
   */
  private focusFirstElement(): void {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Focus a specific element within the trap
   */
  focusElement(element: HTMLElement): void {
    if (this.isActive && this.container.contains(element)) {
      element.focus();
    }
  }

  /**
   * Check if focus trap is active
   */
  get active(): boolean {
    return this.isActive;
  }

  /**
   * Update options
   */
  updateOptions(newOptions: Partial<FocusTrapOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

/**
 * Create a focus trap for a modal element
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): FocusTrap {
  return new FocusTrap(container, options);
}

/**
 * Focus trap hook for Svelte components
 */
export function useFocusTrap(
  container: HTMLElement | null,
  options: FocusTrapOptions = {}
): FocusTrap | null {
  if (!container) return null;
  return createFocusTrap(container, options);
}

/**
 * Utility to find the next focusable element
 */
export function getNextFocusableElement(
  currentElement: HTMLElement,
  container: HTMLElement,
  reverse = false
): HTMLElement | null {
  const focusableElements = Array.from(
    container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], area[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    )
  ) as HTMLElement[];

  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return null;

  const nextIndex = reverse 
    ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
    : (currentIndex + 1) % focusableElements.length;

  return focusableElements[nextIndex] || null;
}

/**
 * Utility to check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch {
      return false;
    }
  });
}

/**
 * Utility to get all focusable elements in a container
 */
export function getAllFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
}
