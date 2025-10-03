<!--
Performance Optimization Test Page
Task 10 Implementation - 성능 최적화 및 브라우저 호환성 구현

Demonstrates:
- Performance optimization integration
- Browser compatibility fallbacks
- Low-end device adaptations
- Real-time performance monitoring
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    initializeCardPerformance, 
    getPerformanceMetrics,
    type CardPerformanceManager 
  } from '$lib/utils/cardPerformanceIntegration';

  let container: HTMLElement;
  let performanceManager: CardPerformanceManager | null = null;
  let metrics = {
    fps: 0,
    isPerformanceAcceptable: true,
    config: {
      enableWillChange: true,
      useTransform3d: true,
      enableGPUAcceleration: true,
      maxAnimationLayers: 6,
      animationDuration: 600,
      enableSparkles: true,
      enableComplexEffects: true,
      frameRateTarget: 60,
      memoryThreshold: 100
    },
    managedElementsCount: 0
  };

  let debugMode = false;
  let showMetrics = true;

  // Sample card data
  const cards = [
    {
      id: 'pikachu',
      name: 'Pikachu',
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png',
      type: 'pokemon',
      holographicStyle: 'cosmic'
    },
    {
      id: 'charizard',
      name: 'Charizard', 
      image: 'https://assets.pokemon.com/assets/cms2/img/pokedx/detail/006.png',
      type: 'pokemon',
      holographicStyle: 'rainbow'
    },
    {
      id: 'lg-twins',
      name: 'LG Twins',
      image: '/kbo-logos/lg.png',
      type: 'kbo',
      team: 'lg',
      holographicStyle: 'aurora'
    },
    {
      id: 'doosan-bears',
      name: 'Doosan Bears',
      image: '/kbo-logos/doosan.png', 
      type: 'kbo',
      team: 'doosan',
      holographicStyle: 'neon'
    }
  ];

  onMount(() => {
    if (container) {
      // Initialize performance optimization
      performanceManager = initializeCardPerformance(container, {
        enableAutoOptimization: true,
        enablePerformanceMonitoring: true,
        enableAdaptiveQuality: true,
        debugMode: debugMode
      });

      // Update metrics every second
      const metricsInterval = setInterval(() => {
        if (showMetrics) {
          metrics = getPerformanceMetrics();
        }
      }, 1000);

      return () => {
        clearInterval(metricsInterval);
      };
    }
  });

  onDestroy(() => {
    if (performanceManager) {
      performanceManager.destroy();
    }
  });

  function toggleDebugMode() {
    debugMode = !debugMode;
    if (performanceManager) {
      performanceManager.destroy();
      performanceManager = initializeCardPerformance(container, {
        enableAutoOptimization: true,
        enablePerformanceMonitoring: true,
        enableAdaptiveQuality: true,
        debugMode: debugMode
      });
    }
  }

  function forceQualityReduction() {
    if (performanceManager) {
      performanceManager.reduceQuality();
      metrics = getPerformanceMetrics();
    }
  }

  function restoreQuality() {
    if (performanceManager) {
      performanceManager.restoreQuality();
      metrics = getPerformanceMetrics();
    }
  }

  function handleCardClick(event: Event) {
    const cardContainer = (event.currentTarget as HTMLElement).closest('.card-container');
    if (cardContainer) {
      const cardInner = cardContainer.querySelector('.card-inner');
      if (cardInner) {
        cardInner.classList.toggle('flipped');
      }
    }
  }
</script>

<svelte:head>
  <title>Performance Optimization Test - Enhanced Card Interactions</title>
  <link rel="stylesheet" href="/src/enhanced-holographic-effects.css">
  <link rel="stylesheet" href="/src/lib/styles/performance-optimizations.css">
</svelte:head>

<main class="performance-test-page">
  <header class="test-header">
    <h1>Performance Optimization Test</h1>
    <p>Testing enhanced card interactions with performance optimizations and browser compatibility</p>
    
    <div class="controls">
      <button on:click={toggleDebugMode} class:active={debugMode}>
        {debugMode ? 'Disable' : 'Enable'} Debug Mode
      </button>
      
      <button on:click={() => showMetrics = !showMetrics} class:active={showMetrics}>
        {showMetrics ? 'Hide' : 'Show'} Metrics
      </button>
      
      <button on:click={forceQualityReduction}>
        Reduce Quality
      </button>
      
      <button on:click={restoreQuality}>
        Restore Quality
      </button>
    </div>
  </header>

  {#if showMetrics}
    <section class="performance-metrics">
      <h2>Performance Metrics</h2>
      <div class="metrics-grid">
        <div class="metric">
          <label>FPS:</label>
          <span class="value" class:warning={metrics.fps < 30} class:good={metrics.fps >= 50}>
            {metrics.fps}
          </span>
        </div>
        
        <div class="metric">
          <label>Performance:</label>
          <span class="value" class:good={metrics.isPerformanceAcceptable} class:warning={!metrics.isPerformanceAcceptable}>
            {metrics.isPerformanceAcceptable ? 'Good' : 'Poor'}
          </span>
        </div>
        
        <div class="metric">
          <label>Managed Cards:</label>
          <span class="value">{metrics.managedElementsCount}</span>
        </div>
        
        <div class="metric">
          <label>Max Layers:</label>
          <span class="value">{metrics.config.maxAnimationLayers}</span>
        </div>
        
        <div class="metric">
          <label>Animation Duration:</label>
          <span class="value">{metrics.config.animationDuration}ms</span>
        </div>
        
        <div class="metric">
          <label>GPU Acceleration:</label>
          <span class="value" class:good={metrics.config.enableGPUAcceleration} class:warning={!metrics.config.enableGPUAcceleration}>
            {metrics.config.enableGPUAcceleration ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        <div class="metric">
          <label>Will-Change:</label>
          <span class="value" class:good={metrics.config.enableWillChange} class:warning={!metrics.config.enableWillChange}>
            {metrics.config.enableWillChange ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        <div class="metric">
          <label>Complex Effects:</label>
          <span class="value" class:good={metrics.config.enableComplexEffects} class:warning={!metrics.config.enableComplexEffects}>
            {metrics.config.enableComplexEffects ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </section>
  {/if}

  <section class="cards-container" bind:this={container}>
    <h2>Test Cards</h2>
    <div class="cards">
      {#each cards as card}
        <div class="card-container" data-card-type={card.type} data-team={card.team || ''}>
          <div class="card-inner">
            <!-- Card Front -->
            <div 
              class="enhanced-card card-face {card.holographicStyle} {card.type} {card.team || ''}"
              style="--front: url({card.image})"
              on:click={handleCardClick}
              role="button"
              tabindex="0"
              aria-label="Click to flip {card.name} card"
            >
            </div>
            
            <!-- Card Back -->
            <div class="card-back card-face {card.type} {card.team || ''}">
              <div class="back-content">
                <h3>{card.name}</h3>
                <p>Card Back</p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="test-info">
    <h2>Performance Features Tested</h2>
    <ul>
      <li><strong>GPU Acceleration:</strong> will-change and transform3d optimizations</li>
      <li><strong>Adaptive Quality:</strong> Automatic quality reduction based on performance</li>
      <li><strong>Browser Fallbacks:</strong> CSS @supports rules for unsupported features</li>
      <li><strong>Low-End Device Support:</strong> Reduced effects for limited hardware</li>
      <li><strong>Memory Management:</strong> Proper cleanup and resource management</li>
      <li><strong>Real-time Monitoring:</strong> FPS tracking and performance metrics</li>
    </ul>
    
    <h3>Browser Compatibility</h3>
    <ul>
      <li><strong>3D Transforms:</strong> Fallback to 2D transforms if unsupported</li>
      <li><strong>Blend Modes:</strong> Progressive fallback from overlay → multiply → normal</li>
      <li><strong>Perspective:</strong> Fallback to opacity transitions</li>
      <li><strong>Backface Visibility:</strong> Manual show/hide if unsupported</li>
    </ul>
  </section>
</main>

<style>
  .performance-test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    color: white;
    padding: 2rem;
  }

  .test-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .test-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #00e7ff, #ff00e7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    border: 2px solid #00e7ff;
    background: transparent;
    color: #00e7ff;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .controls button:hover,
  .controls button.active {
    background: #00e7ff;
    color: #0f0f23;
  }

  .performance-metrics {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
  }

  .performance-metrics h2 {
    margin-bottom: 1rem;
    color: #00e7ff;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
  }

  .metric label {
    font-weight: bold;
  }

  .metric .value {
    font-family: monospace;
    font-size: 1.1rem;
  }

  .metric .value.good {
    color: #00ff88;
  }

  .metric .value.warning {
    color: #ff8800;
  }

  .cards-container {
    margin-bottom: 2rem;
  }

  .cards-container h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #00e7ff;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    justify-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .test-info {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
  }

  .test-info h2,
  .test-info h3 {
    color: #00e7ff;
    margin-bottom: 1rem;
  }

  .test-info ul {
    list-style: none;
    padding: 0;
  }

  .test-info li {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .test-info li:last-child {
    border-bottom: none;
  }

  .test-info strong {
    color: #ff00e7;
  }

  /* Debug mode styles */
  :global(.debug-performance .card-container::after) {
    content: attr(data-fps) " FPS";
    position: absolute;
    top: -25px;
    left: 0;
    font-size: 12px;
    color: #00ff00;
    background: rgba(0, 0, 0, 0.8);
    padding: 2px 6px;
    border-radius: 3px;
    z-index: 1000;
    pointer-events: none;
  }

  :global(.debug-layers .card-container),
  :global(.debug-layers .card-inner),
  :global(.debug-layers .enhanced-card),
  :global(.debug-layers .card-back) {
    outline: 1px solid rgba(255, 0, 0, 0.5);
  }

  :global(.debug-layers .enhanced-card:before),
  :global(.debug-layers .enhanced-card:after),
  :global(.debug-layers .card-back:before),
  :global(.debug-layers .card-back:after) {
    outline: 1px solid rgba(0, 255, 0, 0.5);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .performance-test-page {
      padding: 1rem;
    }

    .test-header h1 {
      font-size: 2rem;
    }

    .controls {
      flex-direction: column;
      align-items: center;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .cards {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>