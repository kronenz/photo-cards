<script lang="ts">
	/**
	 * Input Component
	 * Feature: 003-navigation-ui-renewal
	 * Accessibility: WCAG 2.1 AA compliant
	 */

	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
	export let label = '';
	export let placeholder = '';
	export let error = '';
	export let helperText = '';
	export let value = '';
	export let disabled = false;
	export let required = false;
	export let autocomplete = '';

	// Generate unique ID for accessibility
	const id = `input-${Math.random().toString(36).substr(2, 9)}`;
	const errorId = `${id}-error`;
	const helperId = `${id}-helper`;
</script>

<div class="input-wrapper">
	{#if label}
		<label class="input-label" for={id}>
			{label}
			{#if required}<span class="required" aria-label="required">*</span>{/if}
		</label>
	{/if}

	<input
		{id}
		{type}
		{placeholder}
		{disabled}
		{required}
		{autocomplete}
		bind:value
		class="input"
		class:error={!!error}
		class:disabled
		aria-invalid={!!error}
		aria-describedby={error ? errorId : helperText ? helperId : undefined}
		on:input
		on:blur
		on:focus
		on:change
		{...$$restProps}
	/>

	{#if error}
		<span id={errorId} class="error-message" role="alert">
			{error}
		</span>
	{:else if helperText}
		<span id={helperId} class="helper-text">
			{helperText}
		</span>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		width: 100%;
	}

	.input-label {
		font-size: var(--font-callout);
		font-weight: var(--font-weight-medium);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.required {
		color: var(--error);
		font-weight: var(--font-weight-bold);
	}

	.input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 2px solid var(--border-primary);
		border-radius: var(--radius-md);
		font-size: var(--font-body);
		font-family: var(--font-body);
		color: var(--text-primary);
		background-color: var(--surface-primary);
		transition: all var(--transition-fast);
	}

	.input::placeholder {
		color: var(--text-tertiary);
	}

	.input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.input:hover:not(:disabled):not(:focus) {
		border-color: var(--border-secondary);
	}

	.input.error {
		border-color: var(--error);
	}

	.input.error:focus {
		box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
	}

	.input:disabled,
	.input.disabled {
		opacity: var(--opacity-disabled);
		cursor: not-allowed;
		background-color: var(--surface-secondary);
	}

	.error-message {
		font-size: var(--font-footnote);
		color: var(--error);
		font-weight: var(--font-weight-medium);
	}

	.helper-text {
		font-size: var(--font-footnote);
		color: var(--text-secondary);
	}

	/* Dark mode adjustments */
	:global(.dark) .input {
		background-color: var(--surface-secondary);
	}
</style>
