<script>
  import Card from '$lib/components/Card.svelte';
  import { images } from '$lib/stores/mock-store.js'; // Use the shared store

  // --- Mocking a logged-in user ---
  const loggedInUsername = 'Jules';
  let myImages = [];
  images.subscribe(value => {
    myImages = value.filter(img => img.username === loggedInUsername);
  });

  function togglePublic(imageId) {
    images.update(currentImages => {
      return currentImages.map(img => {
        if (img.id === imageId) {
          return { ...img, isPublic: !img.isPublic };
        }
        return img;
      });
    });
  }
</script>

<div class="gallery-container">
  <header>
    <h1>Your Private Gallery</h1>
  </header>

  {#if myImages.length > 0}
    <div class="gallery-grid">
      {#each myImages as image (image.id)}
        <div class="gallery-item">
          <Card imagePath={image.imagePath} />
          <button on:click={() => togglePublic(image.id)} class="toggle-public-btn">
            {#if image.isPublic}
              Make Private
            {:else}
              Make Public
            {/if}
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <p>Your gallery is empty.</p>
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
  }

  .toggle-public-btn {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #4a5568;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .toggle-public-btn:hover {
    background-color: #2d3748;
  }

  p {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 4rem;
  }
</style>