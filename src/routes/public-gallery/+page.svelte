<script>
  import Card from '$lib/components/Card.svelte';
  import { images } from '$lib/stores/mock-store.js'; // Use the shared store

  let publicImages = [];
  images.subscribe(value => {
    publicImages = value.filter(img => img.isPublic);
  });
</script>

<div class="gallery-container">
  <header>
    <h1>Public Gallery</h1>
  </header>

  {#if publicImages.length > 0}
    <div class="gallery-grid">
      {#each publicImages as image (image.id)}
        <div class="gallery-item">
          <Card imagePath={image.imagePath} />
          <p class="creator-tag">Created by: {image.username}</p>
        </div>
      {/each}
    </div>
  {:else}
    <p>The public gallery is empty. Be the first to share something!</p>
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

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  .gallery-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .creator-tag {
    font-size: 0.9rem;
    color: #a0aec0;
    margin-top: 0.25rem;
  }

  p {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 4rem;
  }
</style>