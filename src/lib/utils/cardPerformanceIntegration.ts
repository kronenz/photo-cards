/**
 * Card Performance Integration Utility
 * Task 10 Implementation - 성능 최적화 및 브라우저 호환성 구현
 * 
 * Integrates performance optimization with existing card system
 * Provides easy-to-use functions for card performance management
 */

import { 
  CardPerformanceOptimizer, 
  getPerformanceOptimizer,
  detectEnhancedCapabilities,
  detectBrowserSupport,
  generateCSSFallbacks
} from './performanceOptimizer';

export interface CardPerformanceOptions {
  enableAutoOptimization?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAdaptiveQuality?: boolean;
  debugMode?: boolean;
}

/**
 * Enhanced card performance manager
 */
export class CardPerformanceManager {
  private optimizer: CardPerformanceOptimizer;
  private options: CardPerformanceOptions;
  private managedElements: Map<HTMLElement, boolean> = new Map();
  private performanceStylesheet: HTMLStyleElement | null = null;

  constructor(options: CardPerformanceOptions = {}) {
    this.options = {
      enableAutoOptimization: true,
      enablePerformanceMonitoring: true,
      enableAdaptiveQuality: true,
      debugMode: false,
      ...options
    };

    this.optimizer = getPerformanceOptimizer();
    this.initializePerformanceStyles();
    
    if (this.options.debugMode) {
      this.enableDebugMode();
    }
  }

  /**
   * Initialize performance-related styles
   */
  private initializePerformanceStyles(): void {
    if (typeof document === 'undefined') return;

    // Create and inject CSS fallbacks
    const browserSupport = detectBrowserSupport();
    const fallbackCSS = generateCSSFallbacks(browserSupport);
    
    if (fallbackCSS) {
      this.performanceStylesheet = document.createElement('style');
      this.performanceStylesheet.textContent = fallbackCSS;
      this.performanceStylesheet.setAttribute('data-performance-fallbacks', 'true');
      document.head.appendChild(this.performanceStylesheet);
    }

    // Add performance class to document based on device capabilities
    const capabilities = detectEnhancedCapabilities();
    const performanceClass = this.getPerformanceClass(capabilities);
    document.documentElement.classList.add(performanceClass);
  }

  /**
   * Get performance class based on device capabilities
   */
  private getPerformanceClass(capabilities: any): string {
    if (capabilities.isLowEndDevice) {
      return 'performance-minimal';
    } else if (capabilities.isMobile) {
      return 'performance-reduced';
    } else {
      return 'performance-optimal';
    }
  }

  /**
   * Enable debug mode for performance monitoring
   */
  private enableDebugMode(): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.add('debug-performance', 'debug-layers');
    
    // Update FPS display every second
    setInterval(() => {
      const fps = this.optimizer.getFPS();
      this.managedElements.forEach((_, element) => {
        element.setAttribute('data-fps', fps.toString());
      });
    }, 1000);
  }

  /**
   * Optimize a card element for performance
   */
  optimizeCard(element: HTMLElement): void {
    if (this.managedElements.has(element)) {
      return; // Already optimized
    }

    if (this.options.enableAutoOptimization) {
      this.optimizer.optimizeElement(element);
    }

    // Add performance monitoring attributes
    if (this.options.enablePerformanceMonitoring) {
      element.setAttribute('data-performance-managed', 'true');
      element.setAttribute('data-fps', this.optimizer.getFPS().toString());
    }

    // Apply adaptive quality classes
    if (this.options.enableAdaptiveQuality) {
      this.applyAdaptiveQuality(element);
    }

    this.managedElements.set(element, true);
  }

  /**
   * Remove optimization from a card element
   */
  unoptimizeCard(element: HTMLElement): void {
    if (!this.managedElements.has(element)) {
      return; // Not managed
    }

    this.optimizer.unoptimizeElement(element);
    
    // Remove performance attributes
    element.removeAttribute('data-performance-managed');
    element.removeAttribute('data-fps');
    
    // Remove adaptive quality classes
    element.classList.remove('performance-optimal', 'performance-reduced', 'performance-minimal');

    this.managedElements.delete(element);
  }

  /**
   * Apply adaptive quality settings to element
   */
  private applyAdaptiveQuality(element: HTMLElement): void {
    const config = this.optimizer.getConfig();
    
    // Apply quality-based classes
    if (!config.enableComplexEffects) {
      element.classList.add('performance-reduced');
    }
    
    if (!config.enableSparkles) {
      element.classList.add('performance-minimal');
    }

    // Set CSS custom properties for adaptive settings
    element.style.setProperty('--max-animation-layers', config.maxAnimationLayers.toString());
    element.style.setProperty('--animation-duration', `${config.animationDuration}ms`);
  }

  /**
   * Update performance settings for all managed elements
   */
  updatePerformanceSettings(): void {
    this.managedElements.forEach((_, element) => {
      this.applyAdaptiveQuality(element);
    });
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return {
      fps: this.optimizer.getFPS(),
      isPerformanceAcceptable: this.optimizer.isPerformanceAcceptable(),
      config: this.optimizer.getConfig(),
      managedElementsCount: this.managedElements.size
    };
  }

  /**
   * Force quality reduction for all managed elements
   */
  reduceQuality(): void {
    this.managedElements.forEach((_, element) => {
      element.classList.add('performance-reduced');
      element.classList.remove('performance-optimal');
    });
  }

  /**
   * Restore optimal quality for all managed elements
   */
  restoreQuality(): void {
    this.managedElements.forEach((_, element) => {
      element.classList.add('performance-optimal');
      element.classList.remove('performance-reduced', 'performance-minimal');
    });
  }

  /**
   * Destroy manager and clean up resources
   */
  destroy(): void {
    // Clean up all managed elements
    this.managedElements.forEach((_, element) => {
      this.unoptimizeCard(element);
    });

    // Remove performance stylesheet
    if (this.performanceStylesheet && this.performanceStylesheet.parentNode) {
      this.performanceStylesheet.parentNode.removeChild(this.performanceStylesheet);
    }

    // Remove debug classes
    if (this.options.debugMode && typeof document !== 'undefined') {
      document.documentElement.classList.remove('debug-performance', 'debug-layers');
    }

    this.managedElements.clear();
  }
}

/**
 * Global performance manager instance
 */
let globalManager: CardPerformanceManager | null = null;

/**
 * Get or create global performance manager
 */
export function getCardPerformanceManager(options?: CardPerformanceOptions): CardPerformanceManager {
  if (!globalManager) {
    globalManager = new CardPerformanceManager(options);
  }
  return globalManager;
}

/**
 * Simple utility functions for easy integration
 */

/**
 * Optimize a card element with default settings
 */
export function optimizeCard(element: HTMLElement): void {
  const manager = getCardPerformanceManager();
  manager.optimizeCard(element);
}

/**
 * Unoptimize a card element
 */
export function unoptimizeCard(element: HTMLElement): void {
  const manager = getCardPerformanceManager();
  manager.unoptimizeCard(element);
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  const manager = getCardPerformanceManager();
  return manager.getPerformanceMetrics();
}

/**
 * Initialize performance optimization for all cards in a container
 */
export function initializeCardPerformance(
  container: HTMLElement, 
  options?: CardPerformanceOptions
): CardPerformanceManager {
  const manager = getCardPerformanceManager(options);
  
  // Find all card elements and optimize them
  const cardElements = container.querySelectorAll('.card-container, .enhanced-card');
  cardElements.forEach(element => {
    if (element instanceof HTMLElement) {
      manager.optimizeCard(element);
    }
  });

  return manager;
}

/**
 * Auto-detect and optimize cards when they're added to the DOM
 */
export function enableAutoCardOptimization(options?: CardPerformanceOptions): void {
  if (typeof document === 'undefined') return;

  const manager = getCardPerformanceManager(options);
  
  // Use MutationObserver to detect new card elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          // Check if the added element is a card or contains cards
          const cards = node.matches('.card-container, .enhanced-card') 
            ? [node] 
            : Array.from(node.querySelectorAll('.card-container, .enhanced-card'));
          
          cards.forEach(card => {
            if (card instanceof HTMLElement) {
              manager.optimizeCard(card);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Store observer for cleanup
  (manager as any)._mutationObserver = observer;
}

/**
 * Disable auto card optimization
 */
export function disableAutoCardOptimization(): void {
  const manager = getCardPerformanceManager();
  const observer = (manager as any)._mutationObserver;
  
  if (observer) {
    observer.disconnect();
    delete (manager as any)._mutationObserver;
  }
}

/**
 * Performance monitoring hook for React/Svelte components
 */
export function useCardPerformance(element: HTMLElement | null, options?: CardPerformanceOptions) {
  if (!element) return null;

  const manager = getCardPerformanceManager(options);
  
  // Optimize on mount
  manager.optimizeCard(element);
  
  // Return cleanup function
  return () => {
    manager.unoptimizeCard(element);
  };
}

/**
 * Batch optimize multiple card elements
 */
export function batchOptimizeCards(elements: HTMLElement[], options?: CardPerformanceOptions): void {
  const manager = getCardPerformanceManager(options);
  
  // Use requestAnimationFrame to batch DOM operations
  requestAnimationFrame(() => {
    elements.forEach(element => {
      manager.optimizeCard(element);
    });
  });
}

/**
 * Performance-aware card creation helper
 */
export function createOptimizedCard(
  container: HTMLElement,
  cardConfig: {
    frontImage: string;
    backImage?: string;
    cardType?: string;
    holographicStyle?: string;
  },
  options?: CardPerformanceOptions
): HTMLElement {
  // Create card structure
  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';
  
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner';
  
  const cardFront = document.createElement('div');
  cardFront.className = 'enhanced-card card-face';
  cardFront.style.setProperty('--front', `url(${cardConfig.frontImage})`);
  
  const cardBack = document.createElement('div');
  cardBack.className = `card-back card-face ${cardConfig.cardType || 'custom'}`;
  
  if (cardConfig.backImage) {
    cardBack.style.backgroundImage = `url(${cardConfig.backImage})`;
  }
  
  // Assemble structure
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardContainer.appendChild(cardInner);
  container.appendChild(cardContainer);
  
  // Optimize immediately
  const manager = getCardPerformanceManager(options);
  manager.optimizeCard(cardContainer);
  
  return cardContainer;
}