<script lang="ts">
	export let type: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' = 'text';
	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let required = false;
	export let error = '';
	export let label = '';
	export let id = '';
	export let autocomplete = '';

	let focused = false;
	let inputElement: HTMLInputElement;

	$: hasValue = value && value.length > 0;
	$: showLabel = label && (focused || hasValue);

	function handleFocus() {
		focused = true;
	}

	function handleBlur() {
		focused = false;
	}

	export function focus() {
		inputElement?.focus();
	}
</script>

<div class="relative">
	{#if label}
		<label 
			for={id} 
			class="absolute left-3 transition-all duration-200 pointer-events-none {showLabel 
				? 'top-2 text-xs text-dark-accent-primary' 
				: 'top-1/2 -translate-y-1/2 text-base text-dark-text-tertiary'
			}"
		>
			{label}
		</label>
	{/if}
	
	{#if type === 'text'}
		<input
			bind:this={inputElement}
			bind:value
			type="text"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{:else if type === 'email'}
		<input
			bind:this={inputElement}
			bind:value
			type="email"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{:else if type === 'password'}
		<input
			bind:this={inputElement}
			bind:value
			type="password"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{:else if type === 'search'}
		<input
			bind:this={inputElement}
			bind:value
			type="search"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{:else if type === 'url'}
		<input
			bind:this={inputElement}
			bind:value
			type="url"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{:else}
		<input
			bind:this={inputElement}
			bind:value
			type="tel"
			{id}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			class="input {label ? 'pt-6 pb-2' : ''} {error ? 'border-dark-accent-error focus:border-dark-accent-error focus:ring-dark-accent-error/20' : ''}"
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input
			on:change
		/>
	{/if}
	
	{#if error}
		<div class="mt-2 flex items-center gap-2 text-sm text-dark-accent-error">
			<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>
			{error}
		</div>
	{/if}
</div>