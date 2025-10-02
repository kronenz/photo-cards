<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let effect:
		| 'cosmic'
		| 'rainbow'
		| 'aurora'
		| 'neon'
		| 'basic'
		| 'reverse'
		| 'secret'
		| 'galaxy'
		| 'prism' = 'basic';
	export let intensity = 0.8;
	export let interactive = true;
	export let width = '280px';
	export let height = '392px'; // 66:92 ratio (standard trading card)

	let cardElement: HTMLElement;
	let isHovered = false;

	// Pokemon Cards CSS style variables
	let pointerX = 50;
	let pointerY = 50;
	let pointerFromCenter = 0;
	let pointerFromTop = 0;
	let pointerFromLeft = 0;
	let cardOpacity = 0;
	let rotateX = 0;
	let rotateY = 0;
	let isSpinning = false;
	let spinRotation = 0;

	onMount(() => {
		if (!browser || !interactive) return;

		function updateCardVariables() {
			if (!cardElement) return;

			cardElement.style.setProperty('--pointer-x', `${pointerX}%`);
			cardElement.style.setProperty('--pointer-y', `${pointerY}%`);
			cardElement.style.setProperty('--pointer-from-center', `${pointerFromCenter}`);
			cardElement.style.setProperty('--pointer-from-top', `${pointerFromTop}`);
			cardElement.style.setProperty('--pointer-from-left', `${pointerFromLeft}`);
			cardElement.style.setProperty('--card-opacity', `${cardOpacity}`);
			cardElement.style.setProperty('--rotate-x', `${rotateX}deg`);
			cardElement.style.setProperty('--rotate-y', `${rotateY}deg`);
			cardElement.style.setProperty('--background-x', `${pointerX}%`);
			cardElement.style.setProperty('--background-y', `${pointerY}%`);
		}

		function handleMouseMove(e: MouseEvent) {
			if (!cardElement) return;

			const rect = cardElement.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// Calculate pointer position as percentage
			pointerX = ((e.clientX - rect.left) / rect.width) * 100;
			pointerY = ((e.clientY - rect.top) / rect.height) * 100;

			// Calculate distance from center (0 to 1)
			const deltaX = (e.clientX - centerX) / (rect.width / 2);
			const deltaY = (e.clientY - centerY) / (rect.height / 2);
			pointerFromCenter = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);

			// Calculate distance from edges
			pointerFromTop = pointerY / 100;
			pointerFromLeft = pointerX / 100;

			// Enhanced 3D rotation with more dramatic effect
			const maxRotation = 25; // Increased from 17.5 for more dramatic effect
			const rotationMultiplier = 1 + pointerFromCenter * 0.5; // Stronger rotation when further from center

			rotateX = deltaY * -1 * maxRotation * rotationMultiplier;
			rotateY = deltaX * maxRotation * rotationMultiplier;

			// Add subtle translation for more realistic movement
			const maxTranslate = 8;
			const translateX = deltaX * maxTranslate;
			const translateY = deltaY * maxTranslate;

			cardElement.style.setProperty('--translate-x', `${translateX}px`);
			cardElement.style.setProperty('--translate-y', `${translateY}px`);

			updateCardVariables();
		}

		function handleMouseEnter() {
			isHovered = true;
			cardOpacity = intensity;

			// Add entrance animation
			cardElement.style.setProperty('--card-scale', '1.05');

			updateCardVariables();
		}

		function handleMouseLeave() {
			isHovered = false;
			if (!isSpinning) {
				cardOpacity = 0;
				rotateX = 0;
				rotateY = 0;
				pointerFromCenter = 0;

				// Reset all transformations smoothly
				cardElement.style.setProperty('--card-scale', '1');
				cardElement.style.setProperty('--translate-x', '0px');
				cardElement.style.setProperty('--translate-y', '0px');

				updateCardVariables();
			}
		}

		function handleClick() {
			if (isSpinning) return;

			isSpinning = true;
			spinRotation = 0;

			// Y축 기준 빙글빙글 회전 애니메이션
			const spinAnimation = () => {
				spinRotation += 18; // 회전 속도 (Y축 기준)

				if (spinRotation < 360) {
					// 1바퀴 회전
					cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
					requestAnimationFrame(spinAnimation);
				} else {
					// 감속 효과
					let deceleration = 18;
					const decelerateAnimation = () => {
						deceleration *= 0.92; // 감속 비율
						spinRotation += deceleration;

						if (deceleration > 1) {
							cardElement.style.setProperty('--spin-rotation', `${spinRotation}deg`);
							requestAnimationFrame(decelerateAnimation);
						} else {
							// 애니메이션 완료
							isSpinning = false;
							spinRotation = 0;
							cardElement.style.setProperty('--spin-rotation', '0deg');
							// 마우스가 카드 위에 없으면 효과 제거
							if (!isHovered) {
								cardOpacity = 0;
								rotateX = 0;
								rotateY = 0;
								pointerFromCenter = 0;
								cardElement.style.setProperty('--card-scale', '1');
								cardElement.style.setProperty('--translate-x', '0px');
								cardElement.style.setProperty('--translate-y', '0px');
								updateCardVariables();
							}
						}
					};
					decelerateAnimation();
				}
			};

			spinAnimation();
		}

		// Touch support for mobile
		function handleTouchMove(e: TouchEvent) {
			e.preventDefault();
			const touch = e.touches[0];
			handleMouseMove({
				clientX: touch.clientX,
				clientY: touch.clientY,
			} as MouseEvent);
		}

		cardElement.addEventListener('mousemove', handleMouseMove);
		cardElement.addEventListener('mouseenter', handleMouseEnter);
		cardElement.addEventListener('mouseleave', handleMouseLeave);
		cardElement.addEventListener('click', handleClick);
		cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
		cardElement.addEventListener('touchstart', handleMouseEnter);
		cardElement.addEventListener('touchend', handleMouseLeave);

		return () => {
			if (cardElement) {
				cardElement.removeEventListener('mousemove', handleMouseMove);
				cardElement.removeEventListener('mouseenter', handleMouseEnter);
				cardElement.removeEventListener('mouseleave', handleMouseLeave);
				cardElement.removeEventListener('click', handleClick);
				cardElement.removeEventListener('touchmove', handleTouchMove);
				cardElement.removeEventListener('touchstart', handleMouseEnter);
				cardElement.removeEventListener('touchend', handleMouseLeave);
			}
		};
	});

	$: cardClasses = [
		'holographic-card',
		`card--${effect}`,
		'relative overflow-hidden transition-transform duration-100 ease-out',
	].join(' ');
</script>

<div bind:this={cardElement} class={cardClasses} style="width: {width}; height: {height};">
	<!-- Card Content -->
	<div class="relative z-10 w-full h-full">
		<slot />
	</div>

	<!-- Enhanced Pokemon Cards CSS Holographic Effects -->
	{#if interactive}
		<div class="card__texture"></div>
		<div class="card__foil"></div>
		<div class="card__shine"></div>
		<div class="card__glare"></div>
		<!-- Additional sparkle layer for premium effects -->
		{#if effect === 'rainbow' || effect === 'cosmic' || effect === 'secret' || effect === 'galaxy'}
			<div class="card__sparkles"></div>
		{/if}
	{/if}
</div>
