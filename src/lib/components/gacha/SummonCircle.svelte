<script lang="ts">
  export let active = false;
</script>

<div class="summon-circle" class:active>
  <svg viewBox="0 0 300 300" class="circle-svg">
    <!-- Outer rotating circle -->
    <circle
      cx="150"
      cy="150"
      r="140"
      fill="none"
      stroke="url(#gradient1)"
      stroke-width="2"
      class="outer-circle"
    />

    <!-- Middle rotating circle -->
    <circle
      cx="150"
      cy="150"
      r="110"
      fill="none"
      stroke="url(#gradient2)"
      stroke-width="1.5"
      class="middle-circle"
    />

    <!-- Inner magic circle pattern -->
    <g class="inner-pattern">
      {#each Array(8) as _, i}
        <line
          x1="150"
          y1="150"
          x2={150 + Math.cos((i * Math.PI) / 4) * 80}
          y2={150 + Math.sin((i * Math.PI) / 4) * 80}
          stroke="rgba(102, 126, 234, 0.6)"
          stroke-width="1"
        />
      {/each}
    </g>

    <!-- Center glow -->
    <circle
      cx="150"
      cy="150"
      r="40"
      fill="url(#glow)"
      class="center-glow"
    />

    <!-- Gradients -->
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>

      <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#764ba2;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.8" />
      </linearGradient>

      <radialGradient id="glow">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
      </radialGradient>
    </defs>
  </svg>

  <!-- Particles -->
  {#if active}
    <div class="particles">
      {#each Array(12) as _, i}
        <div
          class="particle"
          style:--angle="{(i * 360) / 12}deg"
          style:--delay="{i * 0.1}s"
        ></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .summon-circle {
    position: relative;
    width: 300px;
    height: 300px;
  }

  .circle-svg {
    width: 100%;
    height: 100%;
  }

  .outer-circle {
    animation: rotateClockwise 4s linear infinite;
    transform-origin: center;
  }

  .middle-circle {
    animation: rotateCounterClockwise 6s linear infinite;
    transform-origin: center;
  }

  .inner-pattern {
    animation: rotateClockwise 8s linear infinite;
    transform-origin: center;
  }

  .center-glow {
    animation: pulse 2s ease-in-out infinite;
  }

  /* Active state: faster rotation */
  .summon-circle.active .outer-circle {
    animation: rotateClockwise 1s linear infinite;
  }

  .summon-circle.active .middle-circle {
    animation: rotateCounterClockwise 1.5s linear infinite;
  }

  .summon-circle.active .inner-pattern {
    animation: rotateClockwise 2s linear infinite;
  }

  .summon-circle.active .center-glow {
    animation: activePulse 0.5s ease-in-out infinite;
  }

  /* Particles */
  .particles {
    position: absolute;
    inset: 0;
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, #667eea, transparent);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: particleFloat 2s ease-out infinite;
    animation-delay: var(--delay);
    transform: rotate(var(--angle)) translateX(0);
  }

  /* Animations */
  @keyframes rotateClockwise {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateCounterClockwise {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
      filter: drop-shadow(0 0 20px #667eea);
    }
    50% {
      opacity: 1;
      filter: drop-shadow(0 0 40px #764ba2);
    }
  }

  @keyframes activePulse {
    0%,
    100% {
      opacity: 0.8;
      filter: drop-shadow(0 0 30px #667eea);
    }
    50% {
      opacity: 1;
      filter: drop-shadow(0 0 60px #764ba2);
    }
  }

  @keyframes particleFloat {
    0% {
      transform: rotate(var(--angle)) translateX(0);
      opacity: 1;
    }
    100% {
      transform: rotate(var(--angle)) translateX(150px);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .summon-circle {
      width: 200px;
      height: 200px;
    }
  }
</style>
