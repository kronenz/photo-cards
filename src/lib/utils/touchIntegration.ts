/**
 * Touch Integration Utility
 * Handles touch events with mouse event duplication prevention
 * Implements requirements 4.1, 4.2, 4.3 for enhanced card interaction
 */

export interface TouchPosition {
	x: number;
	y: number;
}

export interface TouchGesture {
	type: 'tap' | 'hold' | 'move' | 'cancel';
	position: TouchPosition;
	duration: number;
	distance: number;
}

export interface TouchIntegrationConfig {
	tapTimeThreshold: number; // milliseconds
	moveThreshold: number; // pixels
	holdThreshold: number; // milliseconds
	preventMouseDelay: number; // milliseconds
}

export class TouchIntegrationHandler {
	private config: TouchIntegrationConfig;
	private touchStartTime: number = 0;
	private touchStartPos: TouchPosition = { x: 0, y: 0 };
	private isProcessingTouch: boolean = false;
	private preventMouseEvents: boolean = false;
	private touchHoldTimeout: number | null = null;
	private mousePreventionTimeout: number | null = null;

	// Event callbacks
	private onTouchStart?: (position: TouchPosition) => void;
	private onTouchMove?: (position: TouchPosition, distance: number) => void;
	private onTouchEnd?: (gesture: TouchGesture) => void;
	private onTouchHold?: (position: TouchPosition) => void;
	private onTap?: (position: TouchPosition, duration: number) => void;

	constructor(config: Partial<TouchIntegrationConfig> = {}) {
		this.config = {
			tapTimeThreshold: 300,
			moveThreshold: 10,
			holdThreshold: 150,
			preventMouseDelay: 100,
			...config
		};
	}

	/**
	 * Set event callbacks
	 */
	setCallbacks(callbacks: {
		onTouchStart?: (position: TouchPosition) => void;
		onTouchMove?: (position: TouchPosition, distance: number) => void;
		onTouchEnd?: (gesture: TouchGesture) => void;
		onTouchHold?: (position: TouchPosition) => void;
		onTap?: (position: TouchPosition, duration: number) => void;
	}): void {
		this.onTouchStart = callbacks.onTouchStart;
		this.onTouchMove = callbacks.onTouchMove;
		this.onTouchEnd = callbacks.onTouchEnd;
		this.onTouchHold = callbacks.onTouchHold;
		this.onTap = callbacks.onTap;
	}

	/**
	 * Handle touch start event
	 * Requirement 4.1: Apply holographic effect on touch
	 */
	handleTouchStart(e: TouchEvent, element: HTMLElement): void {
		e.preventDefault();
		
		if (e.touches.length === 0) return;

		// Set touch processing flags to prevent mouse event duplication
		this.isProcessingTouch = true;
		this.preventMouseEvents = true;

		const touch = e.touches[0];
		const rect = element.getBoundingClientRect();
		
		this.touchStartTime = Date.now();
		this.touchStartPos = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top
		};

		// Call touch start callback for holographic effect
		this.onTouchStart?.(this.touchStartPos);

		// Set timeout for touch hold detection
		this.touchHoldTimeout = window.setTimeout(() => {
			if (this.isProcessingTouch) {
				this.onTouchHold?.(this.touchStartPos);
			}
		}, this.config.holdThreshold);
	}

	/**
	 * Handle touch move event
	 * Requirement 4.1: Update holographic effect during touch movement
	 */
	handleTouchMove(e: TouchEvent, element: HTMLElement): void {
		e.preventDefault();
		
		if (e.touches.length === 0 || !this.isProcessingTouch) return;

		const touch = e.touches[0];
		const rect = element.getBoundingClientRect();
		const currentPos: TouchPosition = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top
		};

		// Calculate movement distance
		const moveDistance = Math.sqrt(
			Math.pow(currentPos.x - this.touchStartPos.x, 2) + 
			Math.pow(currentPos.y - this.touchStartPos.y, 2)
		);

		// Call touch move callback for holographic effect update
		this.onTouchMove?.(currentPos, moveDistance);

		// If significant movement, clear tap gesture possibility
		if (moveDistance > this.config.moveThreshold && this.touchHoldTimeout) {
			clearTimeout(this.touchHoldTimeout);
			this.touchHoldTimeout = null;
		}
	}

	/**
	 * Handle touch end event
	 * Requirements 4.2: Tap gesture for card flip, 4.3: Prevent event duplication
	 */
	handleTouchEnd(e: TouchEvent, element: HTMLElement): void {
		if (!this.isProcessingTouch) return;

		const touchEndTime = Date.now();
		const touchDuration = touchEndTime - this.touchStartTime;

		// Clear touch hold timeout
		if (this.touchHoldTimeout) {
			clearTimeout(this.touchHoldTimeout);
			this.touchHoldTimeout = null;
		}

		// Calculate final movement distance
		let finalMoveDistance = 0;
		let endPos = this.touchStartPos;

		if (e.changedTouches.length > 0) {
			const touch = e.changedTouches[0];
			const rect = element.getBoundingClientRect();
			endPos = {
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top
			};
			
			finalMoveDistance = Math.sqrt(
				Math.pow(endPos.x - this.touchStartPos.x, 2) + 
				Math.pow(endPos.y - this.touchStartPos.y, 2)
			);
		}

		// Determine gesture type
		const isTapGesture = touchDuration < this.config.tapTimeThreshold && 
		                   finalMoveDistance < this.config.moveThreshold;

		const gesture: TouchGesture = {
			type: isTapGesture ? 'tap' : finalMoveDistance > this.config.moveThreshold ? 'move' : 'hold',
			position: endPos,
			duration: touchDuration,
			distance: finalMoveDistance
		};

		// Call appropriate callbacks
		if (isTapGesture) {
			this.onTap?.(this.touchStartPos, touchDuration);
		}
		
		this.onTouchEnd?.(gesture);

		// Reset touch processing flags with delay to prevent mouse event interference
		this.resetTouchFlags();
	}

	/**
	 * Handle touch cancel event
	 */
	handleTouchCancel(): void {
		if (!this.isProcessingTouch) return;

		// Clear touch hold timeout
		if (this.touchHoldTimeout) {
			clearTimeout(this.touchHoldTimeout);
			this.touchHoldTimeout = null;
		}

		const gesture: TouchGesture = {
			type: 'cancel',
			position: this.touchStartPos,
			duration: Date.now() - this.touchStartTime,
			distance: 0
		};

		this.onTouchEnd?.(gesture);
		this.resetTouchFlags();
	}

	/**
	 * Check if mouse events should be prevented
	 * Requirement 4.3: Prevent event duplication
	 */
	shouldPreventMouseEvent(): boolean {
		return this.preventMouseEvents || this.isProcessingTouch;
	}

	/**
	 * Reset touch processing flags with delay
	 */
	private resetTouchFlags(): void {
		// Clear any existing timeout
		if (this.mousePreventionTimeout) {
			clearTimeout(this.mousePreventionTimeout);
		}

		// Reset flags with delay to prevent mouse event interference
		this.mousePreventionTimeout = window.setTimeout(() => {
			this.isProcessingTouch = false;
			this.preventMouseEvents = false;
		}, this.config.preventMouseDelay);
	}

	/**
	 * Cleanup method
	 */
	destroy(): void {
		if (this.touchHoldTimeout) {
			clearTimeout(this.touchHoldTimeout);
		}
		if (this.mousePreventionTimeout) {
			clearTimeout(this.mousePreventionTimeout);
		}
		
		this.isProcessingTouch = false;
		this.preventMouseEvents = false;
	}

	/**
	 * Get current touch state for debugging
	 */
	getState(): {
		isProcessingTouch: boolean;
		preventMouseEvents: boolean;
		touchStartPos: TouchPosition;
		touchStartTime: number;
	} {
		return {
			isProcessingTouch: this.isProcessingTouch,
			preventMouseEvents: this.preventMouseEvents,
			touchStartPos: { ...this.touchStartPos },
			touchStartTime: this.touchStartTime
		};
	}
}

/**
 * Factory function to create a touch integration handler
 */
export function createTouchIntegrationHandler(
	config: Partial<TouchIntegrationConfig> = {}
): TouchIntegrationHandler {
	return new TouchIntegrationHandler(config);
}

/**
 * Utility function to detect touch support
 */
export function isTouchSupported(): boolean {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Utility function to detect if device is primarily touch-based
 */
export function isPrimaryTouchDevice(): boolean {
	return isTouchSupported() && 
	       (window.matchMedia('(pointer: coarse)').matches || 
	        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}