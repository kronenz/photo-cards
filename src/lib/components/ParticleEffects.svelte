<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let type = 'sparkles';
  export let count = 50;
  export let color = '#ffd700';
  export let speed = 1;
  export let size = 3;
  export let lifetime = 2000;

  let container: HTMLDivElement;
  let particles: any[] = [];
  let animationId: number;
  let isActive = true;

  interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    element?: HTMLElement;
  }

  onMount(() => {
    initializeParticles();
    startAnimation();
  });

  onDestroy(() => {
    stopAnimation();
  });

  function initializeParticles() {
    particles = [];
    
    for (let i = 0; i < count; i++) {
      createParticle(i);
    }
  }

  function createParticle(id: number): Particle {
    const particle: Particle = {
      id,
      x: Math.random() * (container?.clientWidth || 300),
      y: Math.random() * (container?.clientHeight || 300),
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      size: size + Math.random() * size,
      color: Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color,
      life: 0,
      maxLife: lifetime + Math.random() * lifetime * 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      opacity: 1
    };

    // Create DOM element for particle
    const element = document.createElement('div');
    element.className = `particle particle-${type}`;
    element.style.cssText = getParticleStyle(particle);
    
    if (container) {
      container.appendChild(element);
      particle.element = element;
    }

    particles.push(particle);
    return particle;
  }

  function getParticleStyle(particle: Particle): string {
    const baseStyle = `
      position: absolute;
      left: ${particle.x}px;
      top: ${particle.y}px;
      width: ${particle.size}px;
      height: ${particle.size}px;
      transform: rotate(${particle.rotation}deg);
      opacity: ${particle.opacity};
      pointer-events: none;
      z-index: 1000;
    `;

    switch (type) {
      case 'sparkles':
        return baseStyle + `
          background: ${particle.color};
          border-radius: 50%;
          box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
          animation: sparkle 1s ease-in-out infinite alternate;
        `;
      
      case 'fireworks':
        return baseStyle + `
          background: radial-gradient(circle, ${particle.color} 0%, transparent 70%);
          border-radius: 50%;
          box-shadow: 0 0 ${particle.size * 3}px ${particle.color};
        `;
      
      case 'lightning':
        return baseStyle + `
          background: linear-gradient(45deg, ${particle.color}, #ffffff);
          clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
          filter: brightness(1.5);
          box-shadow: 0 0 ${particle.size * 4}px ${particle.color};
        `;
      
      case 'snow':
        return baseStyle + `
          background: ${particle.color};
          border-radius: 50%;
          opacity: ${particle.opacity * 0.8};
        `;
      
      case 'confetti':
        const colors = ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'];
        const confettiColor = colors[Math.floor(Math.random() * colors.length)];
        return baseStyle + `
          background: ${confettiColor};
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          transform: rotate(${particle.rotation}deg) scale(${0.5 + Math.random() * 0.5});
        `;
      
      default:
        return baseStyle + `
          background: ${particle.color};
          border-radius: 50%;
        `;
    }
  }

  function updateParticle(particle: Particle, deltaTime: number) {
    // Update position
    particle.x += particle.vx * deltaTime * 0.1;
    particle.y += particle.vy * deltaTime * 0.1;

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;

    // Update life
    particle.life += deltaTime;

    // Update opacity based on life
    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = Math.max(0, 1 - lifeRatio);

    // Apply physics based on particle type
    switch (type) {
      case 'sparkles':
        // Gentle floating motion
        particle.vy += Math.sin(particle.life * 0.01) * 0.1;
        break;
      
      case 'fireworks':
        // Explosive outward motion with gravity
        particle.vy += 0.2; // gravity
        particle.vx *= 0.99; // air resistance
        break;
      
      case 'lightning':
        // Erratic, fast movement
        particle.vx += (Math.random() - 0.5) * 2;
        particle.vy += (Math.random() - 0.5) * 2;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        break;
      
      case 'snow':
        // Gentle falling with drift
        particle.vy += 0.1; // gravity
        particle.vx += Math.sin(particle.life * 0.005) * 0.1; // drift
        break;
      
      case 'confetti':
        // Tumbling motion with gravity
        particle.vy += 0.15; // gravity
        particle.vx *= 0.98; // air resistance
        particle.rotationSpeed *= 0.99;
        break;
    }

    // Boundary checking and wrapping
    const containerWidth = container?.clientWidth || 300;
    const containerHeight = container?.clientHeight || 300;

    if (particle.x < -particle.size) {
      particle.x = containerWidth + particle.size;
    } else if (particle.x > containerWidth + particle.size) {
      particle.x = -particle.size;
    }

    if (particle.y < -particle.size) {
      particle.y = containerHeight + particle.size;
    } else if (particle.y > containerHeight + particle.size) {
      particle.y = -particle.size;
    }

    // Update DOM element
    if (particle.element) {
      particle.element.style.cssText = getParticleStyle(particle);
    }

    // Check if particle should be recycled
    if (particle.life >= particle.maxLife) {
      resetParticle(particle);
    }
  }

  function resetParticle(particle: Particle) {
    particle.x = Math.random() * (container?.clientWidth || 300);
    particle.y = Math.random() * (container?.clientHeight || 300);
    particle.vx = (Math.random() - 0.5) * speed * 2;
    particle.vy = (Math.random() - 0.5) * speed * 2;
    particle.life = 0;
    particle.rotation = Math.random() * 360;
    particle.opacity = 1;

    // Special spawn positions for certain effects
    switch (type) {
      case 'fireworks':
        // Spawn from center
        particle.x = (container?.clientWidth || 300) / 2;
        particle.y = (container?.clientHeight || 300) / 2;
        const angle = Math.random() * Math.PI * 2;
        const velocity = speed * (2 + Math.random() * 3);
        particle.vx = Math.cos(angle) * velocity;
        particle.vy = Math.sin(angle) * velocity;
        break;
      
      case 'snow':
        // Spawn from top
        particle.y = -particle.size;
        particle.vx = (Math.random() - 0.5) * speed * 0.5;
        particle.vy = speed * (0.5 + Math.random() * 0.5);
        break;
    }
  }

  let lastTime = 0;
  function animate(currentTime: number) {
    if (!isActive) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    particles.forEach(particle => {
      updateParticle(particle, deltaTime);
    });

    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!isActive) return;
    animationId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    isActive = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Clean up DOM elements
    particles.forEach(particle => {
      if (particle.element && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    particles = [];
  }

  // Reactive updates
  $: if (container) {
    stopAnimation();
    setTimeout(() => {
      isActive = true;
      initializeParticles();
      startAnimation();
    }, 100);
  }
</script>

<div
  class="particle-container"
  bind:this={container}
  class:sparkles={type === 'sparkles'}
  class:fireworks={type === 'fireworks'}
  class:lightning={type === 'lightning'}
  class:snow={type === 'snow'}
  class:confetti={type === 'confetti'}
>
  <!-- Particles are dynamically created in JavaScript -->
</div>

<style>
  .particle-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  /* Global particle animations */
  :global(.particle) {
    position: absolute;
    pointer-events: none;
  }

  /* Container-specific styles */
  .particle-container.sparkles {
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  }

  .particle-container.fireworks {
    background: radial-gradient(circle at center, rgba(255, 69, 0, 0.1) 0%, transparent 70%);
  }

  .particle-container.lightning {
    background: linear-gradient(45deg, rgba(0, 191, 255, 0.1) 0%, transparent 50%);
    animation: lightning-bg 0.5s ease-in-out infinite alternate;
  }

  .particle-container.snow {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  }

  .particle-container.confetti {
    background: radial-gradient(circle at center, rgba(255, 0, 110, 0.05) 0%, transparent 70%);
  }

  @keyframes lightning-bg {
    0% {
      background: linear-gradient(45deg, rgba(0, 191, 255, 0.1) 0%, transparent 50%);
    }
    100% {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    }
  }

  /* Performance optimizations */
  .particle-container {
    will-change: transform;
    transform: translateZ(0);
  }

  :global(.particle) {
    will-change: transform, opacity;
    transform: translateZ(0);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .particle-container {
      /* Reduce particle density on mobile for performance */
      opacity: 0.7;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .particle-container {
      /* Respect user's motion preferences */
      animation: none;
    }
    
    :global(.particle) {
      animation: none;
      transition: none;
    }
  }
</style>