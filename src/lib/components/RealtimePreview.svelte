<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { spring } from 'svelte/motion';

  const dispatch = createEventDispatcher();

  export let elements: any[] = [];
  export let canvasSettings: any = {
    width: 660,
    height: 921,
    background: '#000000'
  };
  export let holographicEnabled = true;
  export let quality: 'preview' | 'high' | 'ultra' = 'preview';

  let previewContainer: HTMLDivElement;
  let animationFrame: number;
  let mousePosition = { x: 0, y: 0 };
  let isHovering = false;
  let performanceMode = false;

  // Spring animations for smooth interactions
  const cardTransform = spring(
    { rotateX: 0, rotateY: 0, scale: 1, z: 0 },
    { stiffness: 0.1, damping: 0.8 }
  );

  const holographicShift = spring(
    { hue: 0, saturation: 100, brightness: 100 },
    { stiffness: 0.2, damping: 0.9 }
  );

  // Performance monitoring
  let frameCount = 0;
  let lastFpsUpdate = 0;
  let currentFps = 60;
  let renderTime = 0;

  // Quality settings
  const qualitySettings = {
    preview: {
      resolution: 1,
      effects: 'basic',
      antialiasing: false,
      shadows: false,
      particles: 'reduced'
    },
    high: {
      resolution: 2,
      effects: 'enhanced',
      antialiasing: true,
      shadows: true,
      particles: 'full'
    },
    ultra: {
      resolution: 4,
      effects: 'premium',
      antialiasing: true,
      shadows: true,
      particles: 'full'
    }
  };

  onMount(() => {
    setupEventListeners();
    startRenderLoop();
    detectPerformanceCapabilities();
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  function setupEventListeners() {
    if (!previewContainer) return;

    previewContainer.addEventListener('mousemove', handleMouseMove);
    previewContainer.addEventListener('mouseenter', handleMouseEnter);
    previewContainer.addEventListener('mouseleave', handleMouseLeave);
    previewContainer.addEventListener('touchmove', handleTouchMove);
    previewContainer.addEventListener('touchstart', handleTouchStart);
    previewContainer.addEventListener('touchend', handleTouchEnd);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!previewContainer) return;

    const rect = previewContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;

    // Calculate rotation based on mouse position
    const rotateY = ((mousePosition.x - centerX) / centerX) * 15;
    const rotateX = ((centerY - mousePosition.y) / centerY) * 15;
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - centerX, 2) + Math.pow(mousePosition.y - centerY, 2)
    );
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const scale = 1 + (distance / maxDistance) * 0.05;

    cardTransform.set({
      rotateX,
      rotateY,
      scale,
      z: distance * 0.1
    });

    // Update holographic effect
    if (holographicEnabled) {
      updateHolographicEffect(mousePosition.x, mousePosition.y, rect.width, rect.height);
    }
  }

  function handleMouseEnter() {
    isHovering = true;
    dispatch('previewHover', { hovering: true });
  }

  function handleMouseLeave() {
    isHovering = false;
    cardTransform.set({ rotateX: 0, rotateY: 0, scale: 1, z: 0 });
    holographicShift.set({ hue: 0, saturation: 100, brightness: 100 });
    dispatch('previewHover', { hovering: false });
  }

  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseMove(mouseEvent);
    }
  }

  function handleTouchStart(event: TouchEvent) {
    handleMouseEnter();
  }

  function handleTouchEnd(event: TouchEvent) {
    handleMouseLeave();
  }

  function updateHolographicEffect(x: number, y: number, width: number, height: number) {
    const normalizedX = x / width;
    const normalizedY = y / height;
    
    // Create rainbow effect based on position
    const hue = (normalizedX * 360 + normalizedY * 180) % 360;
    const saturation = 80 + normalizedY * 20;
    const brightness = 90 + normalizedX * 20;

    holographicShift.set({ hue, saturation, brightness });
  }

  function startRenderLoop() {
    const render = (timestamp: number) => {
      const startTime = performance.now();
      
      // Update performance metrics
      frameCount++;
      if (timestamp - lastFpsUpdate >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = timestamp;
        
        // Adjust performance mode based on FPS
        if (currentFps < 30 && !performanceMode) {
          performanceMode = true;
          quality = 'preview';
          dispatch('performanceMode', { enabled: true });
        } else if (currentFps > 50 && performanceMode) {
          performanceMode = false;
          dispatch('performanceMode', { enabled: false });
        }
      }

      // Render elements
      renderElements();
      
      renderTime = performance.now() - startTime;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
  }

  function renderElements() {
    // This function handles the real-time rendering of elements
    // with optimizations based on current performance
    elements.forEach((element, index) => {
      updateElementTransform(element, index);
    });
  }

  function updateElementTransform(element: any, index: number) {
    const elementNode = previewContainer?.querySelector(`[data-element-id="${element.id}"]`);
    if (!elementNode) return;

    // Apply transforms based on current card rotation and element properties
    const baseTransform = `
      translate(${element.x}px, ${element.y}px)
      rotate(${element.rotation}deg)
      scale(${element.scale || 1})
    `;

    // Add holographic effects if enabled
    let holographicTransform = '';
    if (holographicEnabled && isHovering) {
      const depth = (index + 1) * 2;
      holographicTransform = `translateZ(${depth}px)`;
    }

    (elementNode as HTMLElement).style.transform = baseTransform + holographicTransform;
  }

  function detectPerformanceCapabilities() {
    // Detect device capabilities and adjust quality accordingly
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        // Adjust quality based on GPU capabilities
        if (renderer.includes('Intel') || renderer.includes('Mali')) {
          quality = 'preview';
        } else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
          quality = 'high';
        }
      }
    }

    // Check for mobile devices
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      quality = 'preview';
      performanceMode = true;
    }
  }

  function capturePreview(): Promise<string> {
    return new Promise((resolve) => {
      // Capture current preview as image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = canvasSettings.width * qualitySettings[quality].resolution;
      canvas.height = canvasSettings.height * qualitySettings[quality].resolution;
      
      if (ctx) {
        // Render high-quality version
        renderHighQuality(ctx, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      }
    });
  }

  function renderHighQuality(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Set high-quality rendering settings
    ctx.imageSmoothingEnabled = (qualitySettings as any)[quality].antialiasing;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas
    ctx.fillStyle = canvasSettings.background;
    ctx.fillRect(0, 0, width, height);
    
    // Render each element with high quality
    elements.forEach(element => {
      renderElementHighQuality(ctx, element, width, height);
    });
  }

  function renderElementHighQuality(ctx: CanvasRenderingContext2D, element: any, canvasWidth: number, canvasHeight: number) {
    ctx.save();
    
    // Apply element transforms
    const scaleX = canvasWidth / canvasSettings.width;
    const scaleY = canvasHeight / canvasSettings.height;
    
    ctx.translate(element.x * scaleX, element.y * scaleY);
    ctx.rotate((element.rotation || 0) * Math.PI / 180);
    ctx.scale(element.scale || 1, element.scale || 1);
    ctx.globalAlpha = element.opacity || 1;
    
    // Render based on element type
    switch (element.type) {
      case 'text':
        renderTextElement(ctx, element, scaleX, scaleY);
        break;
      case 'image':
        renderImageElement(ctx, element, scaleX, scaleY);
        break;
      case 'shape':
        renderShapeElement(ctx, element, scaleX, scaleY);
        break;
    }
    
    ctx.restore();
  }

  function renderTextElement(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    const data = element.data;
    
    ctx.font = `${data.fontWeight} ${data.fontSize * scaleX}px ${data.fontFamily}`;
    ctx.fillStyle = data.color;
    ctx.textAlign = data.textAlign;
    ctx.textBaseline = 'middle';
    
    // Apply text shadow if specified
    if (data.textShadow && data.textShadow !== 'none') {
      const shadowParts = data.textShadow.split(' ');
      if (shadowParts.length >= 4) {
        ctx.shadowOffsetX = parseFloat(shadowParts[0]) * scaleX;
        ctx.shadowOffsetY = parseFloat(shadowParts[1]) * scaleY;
        ctx.shadowBlur = parseFloat(shadowParts[2]) * scaleX;
        ctx.shadowColor = shadowParts.slice(3).join(' ');
      }
    }
    
    // Render text with word wrapping
    const lines = wrapText(ctx, data.content, element.width * scaleX);
    const lineHeight = data.fontSize * data.lineHeight * scaleY;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, index * lineHeight);
    });
  }

  function renderImageElement(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    // This would render image elements - implementation depends on image loading
    // For now, render a placeholder
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, element.width * scaleX, element.height * scaleY);
  }

  function renderShapeElement(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    const data = element.data;
    
    ctx.fillStyle = data.fill;
    if (data.stroke && data.stroke !== 'none') {
      ctx.strokeStyle = data.stroke;
      ctx.lineWidth = data.strokeWidth * scaleX;
    }
    
    // Render rectangle (can be extended for other shapes)
    ctx.fillRect(0, 0, element.width * scaleX, element.height * scaleY);
    if (data.stroke && data.stroke !== 'none') {
      ctx.strokeRect(0, 0, element.width * scaleX, element.height * scaleY);
    }
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Reactive updates
  $: if (elements) {
    renderElements();
  }

  // Export functions
  export { capturePreview };
</script>

<div
  class="realtime-preview"
  bind:this={previewContainer}
  style="
    width: {canvasSettings.width}px;
    height: {canvasSettings.height}px;
    background: {canvasSettings.background};
    transform: 
      perspective(1000px)
      rotateX({$cardTransform.rotateX}deg)
      rotateY({$cardTransform.rotateY}deg)
      scale({$cardTransform.scale})
      translateZ({$cardTransform.z}px);
  "
  class:holographic={holographicEnabled}
  class:performance-mode={performanceMode}
>
  <!-- Holographic overlay -->
  {#if holographicEnabled}
    <div
      class="holographic-overlay"
      style="
        background: linear-gradient(
          45deg,
          hsl({$holographicShift.hue}, {$holographicShift.saturation}%, {$holographicShift.brightness}%) 0%,
          hsl({($holographicShift.hue + 60) % 360}, {$holographicShift.saturation}%, {$holographicShift.brightness}%) 25%,
          hsl({($holographicShift.hue + 120) % 360}, {$holographicShift.saturation}%, {$holographicShift.brightness}%) 50%,
          hsl({($holographicShift.hue + 180) % 360}, {$holographicShift.saturation}%, {$holographicShift.brightness}%) 75%,
          hsl({($holographicShift.hue + 240) % 360}, {$holographicShift.saturation}%, {$holographicShift.brightness}%) 100%
        );
        opacity: {isHovering ? 0.3 : 0.1};
      "
    ></div>
  {/if}

  <!-- Elements -->
  {#each elements as element (element.id)}
    <div
      class="preview-element"
      data-element-id={element.id}
      style="
        position: absolute;
        left: {element.x}px;
        top: {element.y}px;
        width: {element.width}px;
        height: {element.height}px;
        opacity: {element.opacity || 1};
        z-index: {element.zIndex || 0};
        transform-style: preserve-3d;
      "
    >
      {#if element.type === 'text'}
        <div
          class="text-element"
          style="
            font-size: {element.data.fontSize}px;
            font-family: {element.data.fontFamily};
            color: {element.data.color};
            font-weight: {element.data.fontWeight};
            text-align: {element.data.textAlign};
            line-height: {element.data.lineHeight};
            text-shadow: {element.data.textShadow};
            background: {element.data.background};
            padding: {element.data.padding}px;
            border-radius: {element.data.borderRadius}px;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            word-wrap: break-word;
            overflow: hidden;
          "
        >
          {element.data.content}
        </div>
      {:else if element.type === 'image'}
        <img
          src={element.data.src}
          alt={element.data.alt}
          style="
            width: 100%;
            height: 100%;
            object-fit: {element.data.objectFit || 'cover'};
            filter: {element.data.filter || 'none'};
            border-radius: {element.data.borderRadius || 0}px;
          "
        />
      {:else if element.type === 'shape'}
        <div
          class="shape-element"
          style="
            width: 100%;
            height: 100%;
            background: {element.data.fill};
            border: {element.data.strokeWidth || 0}px solid {element.data.stroke || 'transparent'};
            border-radius: {element.data.borderRadius || 0}px;
          "
        ></div>
      {/if}
    </div>
  {/each}

  <!-- Performance indicator -->
  {#if performanceMode}
    <div class="performance-indicator">
      <span>⚡ Performance Mode</span>
      <span class="fps">{currentFps} FPS</span>
    </div>
  {/if}
</div>

<style>
  .realtime-preview {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    transform-style: preserve-3d;
    will-change: transform;
    cursor: pointer;
  }

  .realtime-preview.holographic {
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  }

  .realtime-preview.performance-mode {
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
  }

  .holographic-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    mix-blend-mode: overlay;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }

  .preview-element {
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .text-element {
    user-select: none;
    pointer-events: none;
  }

  .shape-element {
    pointer-events: none;
  }

  .performance-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', monospace;
    display: flex;
    gap: 8px;
    align-items: center;
    z-index: 1000;
  }

  .fps {
    color: #00ff00;
    font-weight: 600;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .realtime-preview {
      transform: scale(0.8);
      transform-origin: center;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .realtime-preview {
      transition: none;
    }
    
    .holographic-overlay {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .realtime-preview {
      border: 2px solid #ffffff;
    }
  }
</style>