<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' | 'holographic' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let loading = false;
	export let href: string | undefined = undefined;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let fullWidth = false;

	$: classes = [
		'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg-primary',
		// Variants
		variant === 'primary' && 'btn-primary focus:ring-dark-accent-primary',
		variant === 'secondary' && 'btn-secondary focus:ring-dark-accent-primary',
		variant === 'ghost' && 'btn-ghost focus:ring-dark-accent-primary',
		variant === 'holographic' && 'btn-holographic focus:ring-dark-accent-primary',
		// Sizes
		size === 'sm' && 'px-3 py-2 text-sm rounded-lg',
		size === 'md' && 'px-4 py-2.5 text-base rounded-xl',
		size === 'lg' && 'px-6 py-3 text-lg rounded-xl',
		// States
		disabled && 'opacity-50 cursor-not-allowed',
		loading && 'cursor-wait',
		fullWidth && 'w-full'
	].filter(Boolean).join(' ');
</script>

{#if href && !disabled}
	<a {href} class={classes} role="button" tabindex="0">
		{#if loading}
			<svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		<slot />
	</a>
{:else}
	<button {type} {disabled} class={classes} on:click>
		{#if loading}
			<svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		<slot />
	</button>
{/if}