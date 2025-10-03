// Haptic feedback service for mobile devices
class HapticService {
  private isSupported: boolean;
  private isIOS: boolean;
  private isAndroid: boolean;

  constructor() {
    this.isSupported = this.checkSupport();
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
  }

  private checkSupport(): boolean {
    // Check for Vibration API support
    if ('vibrate' in navigator || 'vibrator' in navigator) {
      return true;
    }

    // Check for iOS haptic feedback support
    if (this.detectIOS() && 'DeviceMotionEvent' in window) {
      return true;
    }

    return false;
  }

  private detectIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  private detectAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Trigger light haptic feedback
   * Used for: button taps, selection changes, minor interactions
   */
  light(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS Taptic Engine - light impact
        this.triggerIOSHaptic('light');
      } else if (this.isAndroid) {
        // Android vibration pattern for light feedback
        if (navigator.vibrate) navigator.vibrate(10);
      } else {
        // Fallback for other devices
        if (navigator.vibrate) navigator.vibrate(10);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger medium haptic feedback
   * Used for: like button, bookmark, important actions
   */
  medium(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS Taptic Engine - medium impact
        this.triggerIOSHaptic('medium');
      } else if (this.isAndroid) {
        // Android vibration pattern for medium feedback
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        // Fallback for other devices
        if (navigator.vibrate) navigator.vibrate(20);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger heavy haptic feedback
   * Used for: errors, warnings, significant state changes
   */
  heavy(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS Taptic Engine - heavy impact
        this.triggerIOSHaptic('heavy');
      } else if (this.isAndroid) {
        // Android vibration pattern for heavy feedback
        if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
      } else {
        // Fallback for other devices
        if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger success haptic feedback
   * Used for: successful actions, confirmations
   */
  success(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS notification feedback - success
        this.triggerIOSNotification('success');
      } else {
        // Pattern for success: short-long-short
        if (navigator.vibrate) navigator.vibrate([10, 50, 100, 50, 10]);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger warning haptic feedback
   * Used for: warnings, cautions
   */
  warning(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS notification feedback - warning
        this.triggerIOSNotification('warning');
      } else {
        // Pattern for warning: double tap
        if (navigator.vibrate) navigator.vibrate([20, 100, 20]);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger error haptic feedback
   * Used for: errors, failures
   */
  error(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS notification feedback - error
        this.triggerIOSNotification('error');
      } else {
        // Pattern for error: triple tap
        if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 50]);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger selection haptic feedback
   * Used for: scrolling through options, picker changes
   */
  selection(): void {
    if (!this.isSupported) return;

    try {
      if (this.isIOS) {
        // iOS selection feedback
        this.triggerIOSSelection();
      } else {
        // Very light vibration for selection
        if (navigator.vibrate) navigator.vibrate(5);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Custom vibration pattern
   * @param pattern - Array of vibration durations in milliseconds
   */
  custom(pattern: number[]): void {
    if (!this.isSupported) return;

    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Custom haptic feedback failed:', error);
    }
  }

  private triggerIOSHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
    // Try to use iOS Haptic Feedback API if available
    if ('hapticFeedback' in window) {
      const haptic = (window as any).hapticFeedback;
      switch (intensity) {
        case 'light':
          haptic.impactOccurred('light');
          break;
        case 'medium':
          haptic.impactOccurred('medium');
          break;
        case 'heavy':
          haptic.impactOccurred('heavy');
          break;
      }
      return;
    }

    // Fallback to vibration API with iOS-appropriate patterns
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    if (navigator.vibrate) navigator.vibrate(patterns[intensity]);
  }

  private triggerIOSNotification(type: 'success' | 'warning' | 'error'): void {
    // Try to use iOS Haptic Feedback API if available
    if ('hapticFeedback' in window) {
      const haptic = (window as any).hapticFeedback;
      haptic.notificationOccurred(type);
      return;
    }

    // Fallback patterns
    const patterns = {
      success: [10, 50, 100, 50, 10],
      warning: [20, 100, 20],
      error: [50, 50, 50, 50, 50]
    };
    if (navigator.vibrate) navigator.vibrate(patterns[type]);
  }

  private triggerIOSSelection(): void {
    // Try to use iOS Haptic Feedback API if available
    if ('hapticFeedback' in window) {
      const haptic = (window as any).hapticFeedback;
      haptic.selectionChanged();
      return;
    }

    // Fallback to very light vibration
    if (navigator.vibrate) navigator.vibrate(5);
  }

  /**
   * Check if haptic feedback is supported on this device
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get device type for haptic feedback
   */
  getDeviceType(): 'ios' | 'android' | 'other' {
    if (this.isIOS) return 'ios';
    if (this.isAndroid) return 'android';
    return 'other';
  }

  /**
   * Disable haptic feedback (for user preferences)
   */
  disable(): void {
    this.isSupported = false;
  }

  /**
   * Enable haptic feedback (for user preferences)
   */
  enable(): void {
    this.isSupported = this.checkSupport();
  }
}

// Create singleton instance
export const hapticService = new HapticService();

// Export types for TypeScript
export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticType = 'success' | 'warning' | 'error' | 'selection';

// Utility functions for common haptic patterns
export const hapticPatterns = {
  // Social interactions
  like: () => hapticService.medium(),
  unlike: () => hapticService.light(),
  bookmark: () => hapticService.medium(),
  share: () => hapticService.light(),
  comment: () => hapticService.light(),

  // UI interactions
  buttonTap: () => hapticService.light(),
  toggle: () => hapticService.medium(),
  swipe: () => hapticService.selection(),
  scroll: () => hapticService.selection(),

  // Feedback
  success: () => hapticService.success(),
  error: () => hapticService.error(),
  warning: () => hapticService.warning(),

  // Card interactions
  cardFlip: () => hapticService.medium(),
  cardDrag: () => hapticService.light(),
  cardDrop: () => hapticService.medium(),

  // Navigation
  pageChange: () => hapticService.light(),
  modalOpen: () => hapticService.light(),
  modalClose: () => hapticService.light(),

  // Custom patterns for KBO theme
  homerun: () => hapticService.custom([50, 100, 200, 100, 50]), // Exciting pattern
  strikeout: () => hapticService.custom([100, 50, 100]), // Dramatic pattern
  cheer: () => hapticService.custom([20, 20, 20, 20, 20, 20]), // Rhythmic pattern
};

export default hapticService;