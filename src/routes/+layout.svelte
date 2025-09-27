<link rel="icon" href="%sveltekit.assets%/favicon.png" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<main>
	<slot />
</main>

<style>
	main {
		padding: 0;
		width: 100%;
		min-height: 100vh;
	}

    :global(body) {
        margin: 0;
        background-color: #2d3748;
        color: #f7fafc;
        font-family: sans-serif;
    }
</style>