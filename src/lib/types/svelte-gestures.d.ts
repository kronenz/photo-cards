/**
 * Type declarations for svelte-gestures library
 * Feature: 002-integrated-holographic-platform
 */

declare module 'svelte-gestures' {
  export interface PanOptions {
    delay?: number;
    touchAction?: string;
  }

  export interface TapOptions {
    timeframe?: number;
    minDistance?: number;
  }

  export interface SwipeOptions {
    timeframe?: number;
    minSwipeDistance?: number;
    touchAction?: string;
  }

  export interface GestureCustomEvent<T = any> extends CustomEvent {
    detail: T;
  }

  export function pan(node: HTMLElement, options?: PanOptions): {
    destroy(): void;
  };

  export function tap(node: HTMLElement, options?: TapOptions): {
    destroy(): void;
  };

  export function swipe(node: HTMLElement, options?: SwipeOptions): {
    destroy(): void;
  };
}
