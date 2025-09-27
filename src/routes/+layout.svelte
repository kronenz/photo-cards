<script>
	import { page } from '$app/stores';
	import '$lib/styles/css/global.css';
	import '$lib/styles/css/cards.css';
	import '$lib/styles/css/cards/base.css';
	import '$lib/styles/css/cards/basic.css';
	import '$lib/styles/css/cards/reverse-holo.css';
	import '$lib/styles/css/cards/regular-holo.css';
	import '$lib/styles/css/cards/cosmos-holo.css';
	import '$lib/styles/css/cards/amazing-rare.css';
	import '$lib/styles/css/cards/radiant-holo.css';
	import '$lib/styles/css/cards/v-regular.css';
	import '$lib/styles/css/cards/v-full-art.css';
	import '$lib/styles/css/cards/v-max.css';
	import '$lib/styles/css/cards/v-star.css';
	import '$lib/styles/css/cards/trainer-full-art.css';
	import '$lib/styles/css/cards/rainbow-holo.css';
	import '$lib/styles/css/cards/rainbow-alt.css';
	import '$lib/styles/css/cards/secret-rare.css';
	import '$lib/styles/css/cards/trainer-gallery-holo.css';
	import '$lib/styles/css/cards/trainer-gallery-v-regular.css';
	import '$lib/styles/css/cards/trainer-gallery-v-max.css';
	import '$lib/styles/css/cards/trainer-gallery-secret-rare.css';
	import '$lib/styles/css/cards/shiny-rare.css';
	import '$lib/styles/css/cards/shiny-v.css';
	import '$lib/styles/css/cards/shiny-vmax.css';
	import '$lib/styles/css/cards/swsh-pikachu.css';
</script>

<link rel="icon" href="%sveltekit.assets%/favicon.png" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<header class="main-header">
  <a href="/" class="logo">Holo-Cards</a>
  <nav>
    <a href="/gallery" class:active={$page.url.pathname === '/gallery'}>My Gallery</a>
    <a href="/public-gallery" class:active={$page.url.pathname === '/public-gallery'}>Public Gallery</a>
  </nav>
</header>

<main>
	<slot />
</main>

<style>
	main {
		padding: 4rem 2rem;
		width: 100%;
		min-height: calc(100vh - 4rem);
		box-sizing: border-box;
	}

    :global(body) {
      margin: 0;
      background-color: #1a202c;
      color: #f7fafc;
      font-family: sans-serif;
    }

    .main-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      height: 4rem;
      background-color: #2d3748;
      z-index: 1000;
      box-sizing: border-box;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      color: white;
    }

    nav a {
      margin-left: 1.5rem;
      text-decoration: none;
      color: #a0aec0;
      transition: color 0.2s;
    }

    nav a:hover {
      color: white;
    }

    nav a.active {
		color: white;
        font-weight: bold;
	}
</style>