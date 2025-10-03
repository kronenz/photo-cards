<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let elements: any[] = [];
  export let canvasSettings: any = {
    width: 660,
    height: 921,
    background: '#000000'
  };

  // Rendering options
  export let outputFormat = 'png'; // 'png' | 'jpg' | 'webp' | 'svg'
  export let quality = 1.0; // 0.1 to 1.0
  export let resolution = 4; // 1x to 8x
  export let includeEffects = true;
  export let antialiasing = true;

  // Export presets
  const exportPresets = {
    'social-instagram': {
      width: 1080,
      height: 1080,
      format: 'jpg',
      quality: 0.9,
      resolution: 2
    },
    'instagram-story': {
      width: 1080,
      height: 1920,
      format: 'jpg',
      quality: 0.9,
      resolution: 2
    },
    'social-twitter': {
      width: 1200,
      height: 675,
      format: 'jpg',
      quality: 0.85,
      resolution: 2
    },
    'social-facebook': {
      width: 1200,
      height: 630,
      format: 'jpg',
      quality: 0.9,
      resolution: 2
    },
    'print-4k': {
      width: 3840,
      height: 2160,
      format: 'png',
      quality: 1.0,
      resolution: 4
    },
    'print-8k': {
      width: 7680,
      height: 4320,
      format: 'png',
      quality: 1.0,
      resolution: 8
    },
    'print-a4': {
      width: 2480,
      height: 3508,
      format: 'png',
      quality: 1.0,
      resolution: 3
    },
    'web-hd': {
      width: 1920,
      height: 1080,
      format: 'webp',
      quality: 0.8,
      resolution: 2
    },
    'mobile-optimized': {
      width: 750,
      height: 1334,
      format: 'webp',
      quality: 0.7,
      resolution: 1
    },
    'web-thumbnail': {
      width: 400,
      height: 400,
      format: 'webp',
      quality: 0.8,
      resolution: 1
    }
  };

  let isRendering = false;
  let renderProgress = 0;
  let renderStatus = '';

  async function renderHighQuality(preset?: string): Promise<string> {
    isRendering = true;
    renderProgress = 0;
    renderStatus = 'Initializing renderer...';

    try {
      // Apply preset if specified
      let renderSettings = {
        width: canvasSettings.width * resolution,
        height: canvasSettings.height * resolution,
        format: outputFormat,
        quality,
        resolution,
        antialiasing,
        includeEffects
      };

      if (preset && (exportPresets as any)[preset]) {
        const presetSettings = (exportPresets as any)[preset];
        renderSettings = {
          ...renderSettings,
          width: presetSettings.width,
          height: presetSettings.height,
          format: presetSettings.format,
          quality: presetSettings.quality,
          resolution: presetSettings.resolution
        };
      }

      dispatch('renderStart', { settings: renderSettings });

      // Create high-resolution canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: false,
        colorSpace: 'display-p3' // Wide color gamut support
      });

      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      canvas.width = renderSettings.width;
      canvas.height = renderSettings.height;

      // Configure high-quality rendering
      ctx.imageSmoothingEnabled = renderSettings.antialiasing;
      ctx.imageSmoothingQuality = 'high';
      // High-quality text rendering (browser-specific optimization)

      renderStatus = 'Preparing canvas...';
      renderProgress = 10;

      // Clear canvas with background
      ctx.fillStyle = canvasSettings.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      renderStatus = 'Rendering elements...';
      renderProgress = 20;

      // Sort elements by z-index
      const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // Render each element
      for (let i = 0; i < sortedElements.length; i++) {
        const element = sortedElements[i];
        renderProgress = 20 + (i / sortedElements.length) * 60;
        renderStatus = `Rendering element ${i + 1}/${sortedElements.length}...`;

        await renderElement(ctx, element, renderSettings);
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      renderStatus = 'Applying effects...';
      renderProgress = 85;

      // Apply post-processing effects
      if (renderSettings.includeEffects) {
        await applyPostProcessingEffects(ctx, canvas, renderSettings);
      }

      renderStatus = 'Generating output...';
      renderProgress = 95;

      // Generate final output
      const dataUrl = await generateOutput(canvas, renderSettings);

      renderStatus = 'Complete!';
      renderProgress = 100;

      dispatch('renderComplete', { 
        dataUrl, 
        settings: renderSettings,
        size: {
          width: canvas.width,
          height: canvas.height,
          fileSize: Math.round(dataUrl.length * 0.75) // Approximate file size
        }
      });

      return dataUrl;

    } catch (error) {
      renderStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      dispatch('renderError', { error });
      throw error;
    } finally {
      isRendering = false;
    }
  }

  async function renderElement(ctx: CanvasRenderingContext2D, element: any, settings: any) {
    ctx.save();

    // Calculate scaling factors
    const scaleX = settings.width / canvasSettings.width;
    const scaleY = settings.height / canvasSettings.height;

    // Apply element transforms
    ctx.translate(element.x * scaleX, element.y * scaleY);
    ctx.rotate((element.rotation || 0) * Math.PI / 180);
    ctx.scale((element.scale || 1) * scaleX, (element.scale || 1) * scaleY);
    ctx.globalAlpha = element.opacity || 1;

    // Apply blend mode if specified
    if (element.blendMode) {
      ctx.globalCompositeOperation = element.blendMode;
    }

    // Render based on element type
    switch (element.type) {
      case 'text':
        await renderTextElementHQ(ctx, element, scaleX, scaleY);
        break;
      case 'image':
        await renderImageElementHQ(ctx, element, scaleX, scaleY);
        break;
      case 'shape':
        await renderShapeElementHQ(ctx, element, scaleX, scaleY);
        break;
      case 'particle':
        await renderParticleElementHQ(ctx, element, scaleX, scaleY);
        break;
      case 'collage':
        await renderCollageElementHQ(ctx, element, scaleX, scaleY);
        break;
    }

    ctx.restore();
  }

  async function renderTextElementHQ(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    const data = element.data;
    
    // Set font with high-quality rendering
    const fontSize = data.fontSize * Math.min(scaleX, scaleY);
    ctx.font = `${data.fontWeight} ${fontSize}px ${data.fontFamily}`;
    ctx.fillStyle = data.color;
    ctx.textAlign = data.textAlign || 'left';
    ctx.textBaseline = 'top';

    // Apply text shadow with high quality
    if (data.textShadow && data.textShadow !== 'none') {
      const shadowMatch = data.textShadow.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(.+)/);
      if (shadowMatch) {
        ctx.shadowOffsetX = parseFloat(shadowMatch[1]) * scaleX;
        ctx.shadowOffsetY = parseFloat(shadowMatch[2]) * scaleY;
        ctx.shadowBlur = parseFloat(shadowMatch[3]) * Math.min(scaleX, scaleY);
        ctx.shadowColor = shadowMatch[4];
      }
    }

    // Render background if specified
    if (data.background && data.background !== 'transparent') {
      ctx.fillStyle = data.background;
      ctx.fillRect(0, 0, element.width * scaleX, element.height * scaleY);
    }

    // Render text with proper line wrapping
    ctx.fillStyle = data.color;
    const lines = wrapTextHQ(ctx, data.content, element.width * scaleX);
    const lineHeight = fontSize * (data.lineHeight || 1.4);
    
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      
      // Apply text alignment
      let x = 0;
      if (data.textAlign === 'center') {
        x = (element.width * scaleX) / 2;
      } else if (data.textAlign === 'right') {
        x = element.width * scaleX;
      }
      
      ctx.fillText(line, x, y);
    });
  }

  async function renderImageElementHQ(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    if (!element.data.src) return;

    try {
      const img = await loadImage(element.data.src);
      
      // Apply filters if specified
      if (element.data.filter && element.data.filter !== 'none') {
        ctx.filter = element.data.filter;
      }

      // Calculate dimensions based on object-fit
      const { sx, sy, sw, sh, dx, dy, dw, dh } = calculateImageDimensions(
        img,
        element.width * scaleX,
        element.height * scaleY,
        element.data.objectFit || 'cover'
      );

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      
      // Reset filter
      ctx.filter = 'none';
    } catch (error) {
      console.warn('Failed to load image:', element.data.src, error);
      // Render placeholder
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, element.width * scaleX, element.height * scaleY);
    }
  }

  async function renderShapeElementHQ(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    const data = element.data;
    const width = element.width * scaleX;
    const height = element.height * scaleY;

    // Set fill and stroke styles
    if (data.fill) {
      ctx.fillStyle = data.fill;
    }
    
    if (data.stroke && data.stroke !== 'none') {
      ctx.strokeStyle = data.stroke;
      ctx.lineWidth = (data.strokeWidth || 1) * Math.min(scaleX, scaleY);
    }

    // Render shape based on type
    switch (data.shape) {
      case 'rectangle':
        if (data.borderRadius) {
          renderRoundedRect(ctx, 0, 0, width, height, data.borderRadius * Math.min(scaleX, scaleY));
        } else {
          ctx.fillRect(0, 0, width, height);
          if (data.stroke && data.stroke !== 'none') {
            ctx.strokeRect(0, 0, width, height);
          }
        }
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        if (data.fill) ctx.fill();
        if (data.stroke && data.stroke !== 'none') ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        if (data.fill) ctx.fill();
        if (data.stroke && data.stroke !== 'none') ctx.stroke();
        break;
    }
  }

  async function renderParticleElementHQ(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    // Render static representation of particle effects for high-quality output
    const data = element.data;
    const particleCount = Math.min(data.count || 50, 200); // Limit for performance
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * element.width * scaleX;
      const y = Math.random() * element.height * scaleY;
      const size = (data.size || 3) * Math.min(scaleX, scaleY);
      
      ctx.fillStyle = data.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  async function renderCollageElementHQ(ctx: CanvasRenderingContext2D, element: any, scaleX: number, scaleY: number) {
    // Render collage images in high quality
    const data = element.data;
    if (!data.images || data.images.length === 0) return;

    // Simple grid layout for high-quality rendering
    const cols = Math.ceil(Math.sqrt(data.images.length));
    const rows = Math.ceil(data.images.length / cols);
    const cellWidth = (element.width * scaleX) / cols;
    const cellHeight = (element.height * scaleY) / rows;

    for (let i = 0; i < data.images.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellWidth;
      const y = row * cellHeight;

      try {
        const img = await loadImage(data.images[i]);
        ctx.drawImage(img, x, y, cellWidth, cellHeight);
      } catch (error) {
        // Render placeholder
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }
    }
  }

  async function applyPostProcessingEffects(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: any) {
    // Apply holographic effects, color grading, etc.
    if (settings.includeEffects) {
      // Add subtle holographic shimmer
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 0, 150, 0.05)');
      gradient.addColorStop(0.25, 'rgba(0, 255, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.05)');
      gradient.addColorStop(0.75, 'rgba(255, 0, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0.05)');
      
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  async function generateOutput(canvas: HTMLCanvasElement, settings: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (settings.format === 'svg') {
          // For SVG, we'd need to recreate the elements as SVG
          // This is a simplified version
          resolve(generateSVGOutput());
        } else {
          const mimeType = `image/${settings.format}`;
          const dataUrl = canvas.toDataURL(mimeType, settings.quality);
          resolve(dataUrl);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function generateSVGOutput(): string {
    // Generate SVG representation of the card
    const svg = `
      <svg width="${canvasSettings.width}" height="${canvasSettings.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${canvasSettings.background}"/>
        ${elements.map(element => generateSVGElement(element)).join('')}
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  function generateSVGElement(element: any): string {
    switch (element.type) {
      case 'text':
        return `<text x="${element.x}" y="${element.y}" font-family="${element.data.fontFamily}" font-size="${element.data.fontSize}" fill="${element.data.color}">${element.data.content}</text>`;
      case 'shape':
        if (element.data.shape === 'rectangle') {
          return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.data.fill}"/>`;
        }
        break;
    }
    return '';
  }

  // Utility functions
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function calculateImageDimensions(img: HTMLImageElement, containerWidth: number, containerHeight: number, objectFit: string) {
    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    let dx = 0, dy = 0, dw = containerWidth, dh = containerHeight;

    switch (objectFit) {
      case 'cover':
        if (imgAspect > containerAspect) {
          sw = img.height * containerAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / containerAspect;
          sy = (img.height - sh) / 2;
        }
        break;
      case 'contain':
        if (imgAspect > containerAspect) {
          dh = containerWidth / imgAspect;
          dy = (containerHeight - dh) / 2;
        } else {
          dw = containerHeight * imgAspect;
          dx = (containerWidth - dw) / 2;
        }
        break;
      case 'fill':
        // Use default values (stretch to fill)
        break;
    }

    return { sx, sy, sw, sh, dx, dy, dw, dh };
  }

  function wrapTextHQ(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

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
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  function renderRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    if (ctx.strokeStyle !== 'transparent') {
      ctx.stroke();
    }
  }

  // Export functions
  export { renderHighQuality, exportPresets };
</script>

<!-- This component doesn't render UI, it's a service component -->
<div class="renderer-status" class:visible={isRendering}>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {renderProgress}%"></div>
    </div>
    <div class="status-text">{renderStatus}</div>
    <div class="progress-percent">{Math.round(renderProgress)}%</div>
  </div>
</div>

<style>
  .renderer-status {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    min-width: 300px;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .renderer-status.visible {
    opacity: 1;
    visibility: visible;
  }

  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: #ffffff;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .status-text {
    font-size: 14px;
    color: #ebebf5;
    text-align: center;
  }

  .progress-percent {
    font-size: 12px;
    color: #86868b;
    text-align: center;
    font-family: 'SF Mono', monospace;
  }
</style>