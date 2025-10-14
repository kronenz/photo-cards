/**
 * SSGOI-inspired Page Transitions for Svelte 4
 * Apple-style smooth page transitions
 */

import { cubicOut, cubicInOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

interface FadeScaleOptions {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	baseScale?: number;
}

interface SlideOptions {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	axis?: 'x' | 'y';
}

interface FlyOptions {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	x?: number;
	y?: number;
	opacity?: number;
}

/**
 * Fade + Scale transition (Apple-style)
 * 부드러운 페이드인 + 약간의 스케일 효과
 */
export function fadeScale(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 400,
		easing = cubicOut,
		baseScale = 0.98
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t) => {
			const scale = baseScale + (1 - baseScale) * t;
			return `
				opacity: ${t};
				transform: scale(${scale});
			`;
		}
	};
}

/**
 * Slide transition
 * 페이지가 슬라이드되는 효과
 */
export function slideTransition(node: Element, options: SlideOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 500,
		easing = cubicInOut,
		axis = 'x'
	} = options;

	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const primaryDimension = axis === 'y' ? node.clientHeight : node.clientWidth;

	return {
		delay,
		duration,
		easing,
		css: (t, u) => {
			const translateValue = axis === 'y'
				? `translateY(${u * primaryDimension}px)`
				: `translateX(${u * primaryDimension}px)`;

			return `
				opacity: ${t * opacity};
				transform: ${translateValue};
			`;
		}
	};
}

/**
 * Fly transition (개선된 버전)
 * 요소가 특정 방향에서 날아오는 효과
 */
export function flyTransition(node: Element, options: FlyOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 400,
		easing = cubicOut,
		x = 0,
		y = 0,
		opacity = 0
	} = options;

	const style = getComputedStyle(node);
	const targetOpacity = +style.opacity;
	const od = targetOpacity * (1 - opacity);

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${targetOpacity - od * u};
		`
	};
}

/**
 * Drill transition (계층 진입)
 * 화면이 확대되면서 진입하는 효과
 */
export function drillIn(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 500,
		easing = cubicOut,
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t) => {
			const scale = 0.9 + t * 0.1;
			return `
				opacity: ${t};
				transform: scale(${scale});
				transform-origin: center center;
			`;
		}
	};
}

/**
 * Drill transition (계층 나가기)
 * 화면이 축소되면서 나가는 효과
 */
export function drillOut(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 400,
		easing = cubicInOut,
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t, u) => {
			const scale = 1 - u * 0.05;
			return `
				opacity: ${t};
				transform: scale(${scale});
				transform-origin: center center;
			`;
		}
	};
}

/**
 * Hero transition (공유 요소 확장)
 * 카드가 확대되는 효과
 */
export function heroExpand(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 600,
		easing = cubicOut,
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t) => {
			const scale = 0.85 + t * 0.15;
			return `
				opacity: ${t};
				transform: scale(${scale});
				transform-origin: center center;
				filter: blur(${(1 - t) * 10}px);
			`;
		}
	};
}

/**
 * Scroll transition (스크롤 효과)
 * 페이지가 위/아래로 스크롤되는 효과
 */
export function scrollTransition(node: Element, options: SlideOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 500,
		easing = cubicInOut,
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			opacity: ${t};
			transform: translateY(${u * -100}%);
		`
	};
}

/**
 * Bounce transition (통통 튀는 효과)
 * 요소가 통통 튀면서 등장
 */
export function bounceIn(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 600,
	} = options;

	// Custom bounce easing
	const bounceEasing = (t: number): number => {
		const c = 1.70158;
		const c2 = c * 1.525;

		return t < 0.5
			? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
			: (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
	};

	return {
		delay,
		duration,
		easing: bounceEasing,
		css: (t) => {
			const scale = 0.7 + t * 0.3;
			return `
				opacity: ${t};
				transform: scale(${scale});
			`;
		}
	};
}

/**
 * Blur transition (블러 효과)
 * 블러와 함께 페이드 인/아웃
 */
export function blurFade(node: Element, options: FadeScaleOptions = {}): TransitionConfig {
	const {
		delay = 0,
		duration = 400,
		easing = cubicOut,
	} = options;

	return {
		delay,
		duration,
		easing,
		css: (t) => `
			opacity: ${t};
			filter: blur(${(1 - t) * 8}px);
		`
	};
}

/**
 * Stagger helper
 * 여러 요소를 순차적으로 애니메이션
 */
export function staggerDelay(index: number, baseDelay: number = 0, stagger: number = 50): number {
	return baseDelay + index * stagger;
}
