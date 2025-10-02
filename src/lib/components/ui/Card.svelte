<script lang="ts">
	export let variant: 'default' | 'elevated' | 'holographic' | 'glass' = 'default';
	export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
	export let hover = true;
	export let clickable = false;

	$: classes = [
		'rounded-card transition-all duration-300',
		// Variants
		variant === 'default' && 'card',
		variant === 'elevated' && 'card-elevated',
		variant === 'holographic' && 'card-holographic',
		variant === 'glass' && 'glass',
		// Padding
		padding === 'none' && 'p-0',
		padding === 'sm' && 'p-4',
		padding === 'md' && 'p-6',
		padding === 'lg' && 'p-8',
		// Interactive
		hover && 'hover:transform hover:-translate-y-1',
		clickable && 'cursor-pointer'
	].filter(Boolean).join(' ');
</script>

<div class={classes} on:click role={clickable ? 'button' : undefined} tabindex={clickable ? 0 : undefined}>
	<slot />
</div>