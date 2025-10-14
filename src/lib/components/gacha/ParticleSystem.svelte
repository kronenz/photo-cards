<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { RarityType } from '$lib/gacha/types';

  export let rarity: RarityType = 'common';
  export let active = false;
  export let x = 50; // Center X position (%)
  export let y = 50; // Center Y position (%)

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let animationFrameId: number;
  let particles: Particle[] = [];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
  }

  // Rarity-specific particle configurations
  const particleConfigs = {
    common: {
      count: 10,
      colors: ['#9ca3af', '#d1d5db', '#6b7280'],
      size: [2, 4],
      speed: [1, 2],
      life: [30, 50]
    },
    rare: {
      count: 20,
      colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      size: [3, 6],
      speed: [1.5, 3],
      life: [40, 60]
    },
    epic: {
      count: 40,
      colors: ['#a855f7', '#c084fc', '#e9d5ff'],
      size: [4, 8],
      speed: [2, 4],
      life: [50, 70]
    },
    legendary: {
      count: 80,
      colors: ['#fbbf24', '#fcd34d', '#fef3c7', '#ffffff'],
      size: [5, 12],
      speed: [2.5, 5],
      life: [60, 90]
    }
  };

  function createParticle(centerX: number, centerY: number, config: typeof particleConfigs.common): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
    const life = config.life[0] + Math.random() * (config.life[1] - config.life[0]);

    return {
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward bias
      size,
      opacity: 1,
      life,
      maxLife: life,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    };
  }

  function initParticles() {
    if (!canvas) return;

    const config = particleConfigs[rarity];
    const centerX = (canvas.width * x) / 100;
    const centerY = (canvas.height * y) / 100;

    particles = [];
    for (let i = 0; i < config.count; i++) {
      particles.push(createParticle(centerX, centerY, config));
    }
  }

  function updateParticles() {
    particles = particles.filter((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity

      // Update rotation
      p.rotation += p.rotationSpeed;

      // Update life and opacity
      p.life--;
      p.opacity = p.life / p.maxLife;

      return p.life > 0;
    });
  }

  function drawParticles() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx!.save();
      ctx!.globalAlpha = p.opacity;
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);

      // Draw particle based on rarity
      if (rarity === 'legendary') {
        // Star shape for legendary
        drawStar(ctx!, 0, 0, 5, p.size, p.size / 2, p.color);
      } else if (rarity === 'epic') {
        // Diamond shape for epic
        drawDiamond(ctx!, 0, 0, p.size, p.color);
      } else {
        // Circle for common/rare
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx!.fill();

        // Add glow for rare+
        if (rarity !== 'common') {
          ctx!.shadowBlur = 10;
          ctx!.shadowColor = p.color;
        }
      }

      ctx!.restore();
    });
  }

  function drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
  }

  function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
  }

  function animate() {
    updateParticles();
    drawParticles();

    if (particles.length > 0 || active) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('resize', resizeCanvas);
  });

  // Start animation when active
  $: if (active && canvas) {
    initParticles();
    animate();
  }
</script>

<canvas bind:this={canvas} class="particle-canvas" class:active></canvas>

<style>
  .particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .particle-canvas.active {
    opacity: 1;
  }
</style>
