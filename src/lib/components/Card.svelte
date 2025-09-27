<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";

  export let imagePath = "";

  let thisCard;
  let interacting = false;

  // --- Helper functions from the original project ---
  const clamp = (val, min = 0, max = 1) => (val > max ? max : val < min ? min : val);
  const round = (num, prec = 2) => {
    const f = Math.pow(10, prec);
    return Math.floor(num * f) / f;
  };

  // --- Svelte spring animations for smooth interactions ---
  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);

  // --- Interaction logic ---
  const interact = (e) => {
    interacting = true;

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const rect = thisCard.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    springRotate.set({
      x: round(-(center.x / 3.5)),
      y: round(center.y / 2),
    });
    springGlare.set({
      x: round(percent.x),
      y: round(percent.y),
      o: 1,
    });
    springBackground.set({
      x: round(percent.x),
      y: round(percent.y),
    });
  };

  const interactEnd = () => {
    setTimeout(() => {
      interacting = false;
      springRotate.set({ x: 0, y: 0 });
      springGlare.set({ x: 50, y: 50, o: 0 });
      springBackground.set({ x: 50, y: 50 });
    }, 500);
  };

  // --- CSS custom properties for dynamic styling ---
  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --card-opacity: ${$springGlare.o};
    --rotate-x: ${$springRotate.y}deg;
    --rotate-y: ${$springRotate.x}deg;
    --background-x: ${$springBackground.x}%;
    --background-y: ${$springBackground.y}%;
  `;
</script>

<div class="card-container" bind:this={thisCard}>
  <div
    class="card holo"
    class:interacting
    style={dynamicStyles}
    on:pointermove={interact}
    on:pointerout={interactEnd}
    role="button"
    tabindex="0"
  >
    <div class="card__translater">
      <div class="card__rotator">
        <div class="card__front">
          <img src={imagePath} alt="User uploaded content" width="660" height="921" />
          <div class="card__shine" />
          <div class="card__glare" />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --card-aspect: 0.718;
    --card-radius: 4.55% / 3.5%;
    --card-glow: hsl(175, 100%, 90%);
  }

  .card-container {
    perspective: 600px;
  }

  .card {
    transform-style: preserve-3d;
    transform: rotateY(var(--rotate-y)) rotateX(var(--rotate-x));
    aspect-ratio: var(--card-aspect);
    border-radius: var(--card-radius);
    position: relative;
    width: 100%;
    box-shadow: 0px 10px 20px -5px black;
  }

  .card.interacting {
     box-shadow:
      0 0 3px -1px white,
      0 0 3px 1px var(--card-glow),
      0 0 12px 2px var(--card-glow),
      0px 10px 20px -5px black,
      0 0 40px -30px var(--card-glow),
      0 0 50px -20px var(--card-glow);
  }

  .card__translater,
  .card__rotator {
    display: grid;
    perspective: 600px;
    transform-origin: center;
  }

  .card__rotator,
  .card__front,
  .card__shine,
  .card__glare {
    width: 100%;
    display: grid;
    grid-area: 1/1;
    aspect-ratio: var(--card-aspect);
    border-radius: var(--card-radius);
    image-rendering: optimizeQuality;
    transform-style: preserve-3d;
    overflow: hidden;
  }

  .card__front img {
    width: 100%;
    height: auto;
    grid-area: 1/1;
  }

  .card__shine {
    transform: translateZ(1px);
    z-index: 3;
    background: transparent;
    background-size: cover;
    background-position: center;
    filter: brightness(.85) contrast(2.75) saturate(.65);
    mix-blend-mode: color-dodge;
    opacity: var(--card-opacity);
    will-change: transform, opacity, background-image, background-size, background-position, background-blend-mode, filter;
  }

  .card__glare {
    transform: translateZ(1.41px);
    background-image: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 100%, 0.8) 10%,
      hsla(0, 0%, 100%, 0.65) 20%,
      hsla(0, 0%, 0%, 0.5) 90%
    );
    opacity: var(--card-opacity);
    mix-blend-mode: overlay;
    will-change: transform, opacity, background-image, background-size, background-position, background-blend-mode, filter;
  }

  /* Regular Holo Effect */
  .holo .card__shine {
    --violet: #c929f1;
    --blue: #0dbde9;
    --green: #21e985;
    --yellow: #eedf10;
    --red: #f80e35;
    
    background-image: repeating-linear-gradient(
      110deg,
      var(--violet), var(--blue), var(--green), var(--yellow), var(--red),
      var(--violet), var(--blue), var(--green), var(--yellow), var(--red),
      var(--violet)
    );
    background-position: calc(((50% - var(--background-x)) * 2.6) + 50%) calc(((50% - var(--background-y)) * 3.5) + 50%);
    background-size: 400% 400%;
    background-blend-mode: overlay;
    filter: brightness(1.1) contrast(1.1) saturate(1.2);
    mix-blend-mode: color-dodge;
  }

  .holo .card__shine::before {
    content: "";
    grid-area: 1/1;
    border-radius: var(--card-radius);
    --bars: 3%;
    --bar-color: hsla(0, 0%, 70%, 1);
    --bar-bg: hsla(0, 0%, 0%, 1);

    background-image: repeating-linear-gradient(
      90deg,
      var(--bar-bg) calc(var(--bars) * 2),
      var(--bar-color) calc(var(--bars) * 3),
      var(--bar-bg) calc(var(--bars) * 3.5),
      var(--bar-color) calc(var(--bars) * 4),
      var(--bar-bg) calc(var(--bars) * 5),
      var(--bar-bg) calc(var(--bars) * 14)
    );
    background-position: calc((((50% - var(--background-x)) * 1.65) + 50%) + (var(--background-y) * 0.5)) var(--background-x);
    background-size: 200% 200%;
    background-blend-mode: screen;
    filter: brightness(1.15) contrast(1.1);
    mix-blend-mode: hard-light;
  }
</style>