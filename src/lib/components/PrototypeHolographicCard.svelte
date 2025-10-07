<script lang="ts">
  import { onMount } from 'svelte';

  export let title = "손흥민";
  export let team = "lg"; // lg, doosan, kt, samsung, nc, kia, lotte, ssg, hanwha, kiwoom
  export let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'legendary';
  export let image = "https://picsum.photos/400/560?random=1";
  export let size: 'small' | 'medium' | 'large' | 'featured' = 'large';

  let cardContainer: HTMLDivElement;
  let isFlipped = false;

  function handleMouseMove(e: MouseEvent) {
    if (!cardContainer) return;

    const rect = cardContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // 3D tilt effect
    const rotateX = ((y - centerY) / centerY) * 15; // -15 to 15 degrees
    const rotateY = ((x - centerX) / centerX) * 15;

    cardContainer.style.setProperty('--rotate-x', `${-rotateX}deg`);
    cardContainer.style.setProperty('--rotate-y', `${rotateY}deg`);
    cardContainer.style.setProperty('--mouse-x', `${percentX}%`);
    cardContainer.style.setProperty('--mouse-y', `${percentY}%`);
  }

  function handleMouseLeave() {
    if (!cardContainer) return;
    cardContainer.style.removeProperty('--rotate-x');
    cardContainer.style.removeProperty('--rotate-y');
  }

  function handleClick() {
    isFlipped = !isFlipped;
  }

  // Touch support
  function handleTouchMove(e: TouchEvent) {
    if (!cardContainer) return;
    const touch = e.touches[0];
    const rect = cardContainer.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    cardContainer.style.setProperty('--mouse-x', `${percentX}%`);
    cardContainer.style.setProperty('--mouse-y', `${percentY}%`);
  }
</script>

<div
  class="card-container"
  data-size={size}
  bind:this={cardContainer}
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  on:click={handleClick}
  on:touchmove={handleTouchMove}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="card-3d-wrapper" class:flipped={isFlipped}>
    <!-- Front Face -->
    <div class="card-face card-front">
      <!-- Holographic Layers -->
      <div class="holo-layer holo-rainbow"></div>
      <div class="holo-layer holo-sparkle"></div>
      <div class="holo-layer holo-gradient"></div>

      <!-- Card Image -->
      <div class="card-image">
        <img src={image} alt={title} />
      </div>

      <!-- Card Info -->
      <div class="card-info">
        <h3 class="card-title text-gradient">{title}</h3>
        <div class="card-rarity" data-rarity={rarity}>
          {rarity.toUpperCase()}
        </div>
      </div>
    </div>

    <!-- Back Face -->
    <div class="card-face card-back" data-team={team}>
      <div class="card-back-pattern"></div>
      <div class="holo-layer holo-rainbow"></div>
      <div class="card-back-content">
        <div class="card-back-logo">KBO</div>
        <div class="card-back-team">{team.toUpperCase()}</div>
      </div>
    </div>
  </div>
</div>

<style>
  /* KBO Team Colors */
  :global(:root) {
    --kbo-lg-primary: #C30452;
    --kbo-lg-gradient: linear-gradient(135deg, #C30452 0%, #ED2E7E 100%);

    --kbo-doosan-primary: #131230;
    --kbo-doosan-gradient: linear-gradient(135deg, #131230 0%, #1E3A8A 100%);

    --kbo-kt-primary: #000000;
    --kbo-kt-gradient: linear-gradient(135deg, #000000 0%, #E3000F 100%);

    --kbo-samsung-primary: #074CA1;
    --kbo-samsung-gradient: linear-gradient(135deg, #074CA1 0%, #0EA5E9 100%);

    --kbo-nc-primary: #B0976D;
    --kbo-nc-gradient: linear-gradient(135deg, #B0976D 0%, #FFD700 100%);

    --kbo-kia-primary: #EA0029;
    --kbo-kia-gradient: linear-gradient(135deg, #EA0029 0%, #FF6B35 100%);

    --kbo-lotte-primary: #041E42;
    --kbo-lotte-gradient: linear-gradient(135deg, #041E42 0%, #0369A1 100%);

    --kbo-ssg-primary: #CE0E2D;
    --kbo-ssg-gradient: linear-gradient(135deg, #CE0E2D 0%, #E11D48 100%);

    --kbo-hanwha-primary: #FF6600;
    --kbo-hanwha-gradient: linear-gradient(135deg, #FF6600 0%, #FFAA00 100%);

    --kbo-kiwoom-primary: #820024;
    --kbo-kiwoom-gradient: linear-gradient(135deg, #820024 0%, #DC143C 100%);

    /* Holographic Spectrum */
    --holo-rainbow: linear-gradient(
      115deg,
      transparent 0%,
      rgb(255, 0, 72) 10%,
      rgb(255, 107, 53) 20%,
      rgb(255, 215, 0) 30%,
      rgb(0, 255, 136) 40%,
      rgb(0, 240, 255) 50%,
      rgb(0, 128, 255) 60%,
      rgb(168, 85, 247) 70%,
      rgb(255, 0, 247) 80%,
      transparent 90%
    );
  }

  /* Base Card Container */
  .card-container {
    perspective: 1000px;
    transform-style: preserve-3d;
    cursor: pointer;
    transition: transform 0.1s ease;
    transform:
      perspective(1000px)
      rotateX(var(--rotate-x, 0deg))
      rotateY(var(--rotate-y, 0deg));
  }

  .card-container:hover {
    transform:
      perspective(1000px)
      rotateX(var(--rotate-x, 0deg))
      rotateY(var(--rotate-y, 0deg))
      scale3d(1.05, 1.05, 1.05);
  }

  .card-3d-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-3d-wrapper.flipped {
    transform: rotateY(180deg);
  }

  /* Card Faces */
  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    background: linear-gradient(135deg, #1a1a27 0%, #12121a 100%);
  }

  .card-back {
    transform: rotateY(180deg);
  }

  /* Holographic Layers */
  .holo-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: color-dodge;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card-container:hover .holo-layer {
    opacity: 0.7;
  }

  /* Rainbow Holographic Effect */
  .holo-rainbow {
    background: var(--holo-rainbow);
    background-size: 200% 200%;
    filter: brightness(1.2) contrast(1.3);
    animation: holo-rainbow-flow 3s ease infinite;
  }

  @keyframes holo-rainbow-flow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Sparkle Effect */
  .holo-sparkle {
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 2%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.6) 0%, transparent 2%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 2%),
      radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.5) 0%, transparent 2%),
      radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.7) 0%, transparent 2%);
    background-size: 100% 100%;
    animation: sparkle-twinkle 2s ease-in-out infinite;
    mix-blend-mode: screen;
  }

  @keyframes sparkle-twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }

  /* Dynamic Gradient Effect */
  .holo-gradient {
    background: radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 255, 255, 0.8) 0%,
      rgba(0, 240, 255, 0.6) 20%,
      rgba(168, 85, 247, 0.4) 40%,
      transparent 70%
    );
    background-size: 200% 200%;
    mix-blend-mode: overlay;
  }

  /* Card Image */
  .card-image {
    position: absolute;
    top: 2rem;
    left: 1rem;
    right: 1rem;
    height: 60%;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Card Info */
  .card-info {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .card-title {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: white;
  }

  .text-gradient {
    background: linear-gradient(
      90deg,
      #FF0048 0%,
      #FF6B35 14%,
      #FFD700 28%,
      #00FF88 42%,
      #00F0FF 57%,
      #0080FF 71%,
      #A855F7 85%,
      #FF00F7 100%
    );
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .card-rarity {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-rarity[data-rarity="common"] {
    background: linear-gradient(135deg, #888 0%, #AAA 100%);
    color: white;
  }

  .card-rarity[data-rarity="rare"] {
    background: var(--kbo-samsung-gradient);
    box-shadow: 0 0 20px rgba(7, 76, 161, 0.5);
    color: white;
  }

  .card-rarity[data-rarity="epic"] {
    background: var(--kbo-kiwoom-gradient);
    box-shadow: 0 0 20px rgba(130, 0, 36, 0.5);
    color: white;
  }

  .card-rarity[data-rarity="legendary"] {
    background: linear-gradient(
      90deg,
      #FF0048 0%,
      #FFD700 25%,
      #00FF88 50%,
      #0080FF 75%,
      #FF00F7 100%
    );
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
    box-shadow:
      0 0 30px rgba(255, 215, 0, 0.6),
      0 0 60px rgba(255, 215, 0, 0.3);
    color: white;
    font-weight: 700;
  }

  /* Card Back Design */
  .card-back {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .card-back-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image:
      repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px);
  }

  .card-back-content {
    position: relative;
    z-index: 10;
    text-align: center;
    color: white;
  }

  .card-back-logo {
    font-family: 'Jalnan', 'GmarketSans Bold', cursive;
    font-size: 4rem;
    font-weight: 700;
    text-shadow: 0 0 30px currentColor;
    margin-bottom: 1rem;
  }

  .card-back-team {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  /* Team-specific back colors */
  .card-back[data-team="lg"] {
    background: var(--kbo-lg-gradient);
  }
  .card-back[data-team="doosan"] {
    background: var(--kbo-doosan-gradient);
  }
  .card-back[data-team="kt"] {
    background: var(--kbo-kt-gradient);
  }
  .card-back[data-team="samsung"] {
    background: var(--kbo-samsung-gradient);
  }
  .card-back[data-team="nc"] {
    background: var(--kbo-nc-gradient);
  }
  .card-back[data-team="kia"] {
    background: var(--kbo-kia-gradient);
  }
  .card-back[data-team="lotte"] {
    background: var(--kbo-lotte-gradient);
  }
  .card-back[data-team="ssg"] {
    background: var(--kbo-ssg-gradient);
  }
  .card-back[data-team="hanwha"] {
    background: var(--kbo-hanwha-gradient);
  }
  .card-back[data-team="kiwoom"] {
    background: var(--kbo-kiwoom-gradient);
  }

  /* Card Sizes */
  .card-container[data-size="small"] {
    width: 200px;
    height: 280px;
  }

  .card-container[data-size="medium"] {
    width: 280px;
    height: 392px;
  }

  .card-container[data-size="large"] {
    width: 360px;
    height: 504px;
  }

  .card-container[data-size="featured"] {
    width: 480px;
    height: 672px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .holo-layer,
    .card-3d-wrapper,
    .card-container {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
