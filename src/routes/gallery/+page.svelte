<script>
  import Card from '$lib/components/Card.svelte';
  export let data;
</script>

<div class="gallery-container">
  <header>
    <h1>Your Gallery</h1>
    <nav>
      <a href="/upload">Upload New Image</a>
      <a href="/auth/logout">Log Out</a>
    </nav>
  </header>

  {#if data.images.length > 0}
    <div class="gallery-grid">
      {#each data.images as image}
        <div class="gallery-item">
          <Card imagePath={image.imagePath} />
        </div>
      {/each}
    </div>
  {:else}
    <p>Your gallery is empty. <a href="/upload">Upload your first image!</a></p>
  {/if}
</div>

<style>
  .gallery-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: sans-serif;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  nav a {
    margin-left: 1rem;
    text-decoration: none;
    color: #007bff;
    font-size: 1rem;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  .gallery-item {
    width: 100%;
  }

  p {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 4rem;
  }
</style>