/**
 * Performance Optimization Demo
 * Task 10 Implementation - 성능 최적화 및 브라우저 호환성 구현
 * 
 * Simple demonstration of performance optimization features
 */

import { 
  detectEnhancedCapabilities, 
  detectBrowserSupport, 
  generatePerformanceConfig,
  CardPerformanceOptimizer
} from './performanceOptimizer';

/**
 * Run performance optimization demo
 */
export function runPerformanceDemo() {
  console.log('🚀 Performance Optimization Demo Starting...\n');

  // 1. Device Capability Detection
  console.log('📱 Device Capabilities:');
  const capabilities = detectEnhancedCapabilities();
  console.log('- Mobile:', capabilities.isMobile);
  console.log('- Low-end device:', capabilities.isLowEndDevice);
  console.log('- Reduced motion:', capabilities.isReducedMotion);
  console.log('- GPU support:', capabilities.supportsGPU);
  console.log('- Device memory:', capabilities.deviceMemory, 'GB');
  console.log('- CPU cores:', capabilities.hardwareConcurrency);
  console.log('- Supports will-change:', capabilities.supportsWillChange);
  console.log('- Supports transform3d:', capabilities.supportsTransform3d);
  console.log('- Supports backface-visibility:', capabilities.supportsBackfaceVisibility);
  console.log('- Supports perspective:', capabilities.supportsPerspective);
  console.log('');

  // 2. Browser Support Detection
  console.log('🌐 Browser Support:');
  const browserSupport = detectBrowserSupport();
  console.log('- Overlay blend mode:', browserSupport.supportsOverlay);
  console.log('- Soft-light blend mode:', browserSupport.supportsSoftLight);
  console.log('- Color-dodge blend mode:', browserSupport.supportsColorDodge);
  console.log('- Transform-style preserve-3d:', browserSupport.supportsTransformStyle);
  console.log('- Perspective:', browserSupport.supportsPerspective);
  console.log('- Backface-visibility:', browserSupport.supportsBackfaceVisibility);
  console.log('- Will-change:', browserSupport.supportsWillChange);
  console.log('- Browser type:', 
    browserSupport.isWebKit ? 'WebKit' :
    browserSupport.isGecko ? 'Gecko' :
    browserSupport.isChromium ? 'Chromium' : 'Unknown');
  console.log('');

  // 3. Performance Configuration
  console.log('⚙️ Performance Configuration:');
  const config = generatePerformanceConfig(capabilities, browserSupport);
  console.log('- Will-change enabled:', config.enableWillChange);
  console.log('- Transform3d enabled:', config.useTransform3d);
  console.log('- GPU acceleration:', config.enableGPUAcceleration);
  console.log('- Max animation layers:', config.maxAnimationLayers);
  console.log('- Animation duration:', config.animationDuration + 'ms');
  console.log('- Sparkles enabled:', config.enableSparkles);
  console.log('- Complex effects enabled:', config.enableComplexEffects);
  console.log('- Target FPS:', config.frameRateTarget);
  console.log('- Memory threshold:', config.memoryThreshold + 'MB');
  console.log('');

  // 4. Performance Optimizer Demo
  console.log('🎯 Performance Optimizer Demo:');
  const optimizer = new CardPerformanceOptimizer();
  
  // Create a test element
  const testElement = document.createElement('div');
  testElement.className = 'card-container';
  testElement.style.width = '300px';
  testElement.style.height = '420px';
  testElement.style.background = 'linear-gradient(45deg, #ff0080, #0080ff)';
  testElement.style.borderRadius = '15px';
  testElement.style.margin = '20px';
  
  // Add to DOM temporarily for testing
  document.body.appendChild(testElement);
  
  console.log('- Test element created and added to DOM');
  
  // Optimize the element
  optimizer.optimizeElement(testElement);
  console.log('- Element optimized');
  console.log('- Will-change applied:', testElement.style.willChange);
  console.log('- Transform applied:', testElement.style.transform);
  console.log('- Isolation applied:', testElement.style.isolation);
  
  // Get performance metrics
  const fps = optimizer.getFPS();
  const isAcceptable = optimizer.isPerformanceAcceptable();
  const optimizerConfig = optimizer.getConfig();
  
  console.log('- Current FPS:', fps);
  console.log('- Performance acceptable:', isAcceptable);
  console.log('- Optimizer config:', optimizerConfig);
  
  // Cleanup
  setTimeout(() => {
    optimizer.unoptimizeElement(testElement);
    console.log('- Element unoptimized');
    console.log('- Will-change reset:', testElement.style.willChange);
    
    document.body.removeChild(testElement);
    optimizer.destroy();
    console.log('- Test element removed and optimizer destroyed');
    console.log('');
    console.log('✅ Performance Optimization Demo Complete!');
  }, 2000);

  return {
    capabilities,
    browserSupport,
    config,
    optimizer
  };
}

/**
 * Test CSS fallback generation
 */
export function testCSSFallbacks() {
  console.log('🎨 CSS Fallback Generation Test:');
  
  // Test with no browser support
  const noBrowserSupport = {
    supportsOverlay: false,
    supportsSoftLight: false,
    supportsColorDodge: false,
    supportsTransformStyle: false,
    supportsPerspective: false,
    supportsBackfaceVisibility: false,
    supportsWillChange: false,
    isWebKit: false,
    isGecko: false,
    isChromium: false
  };
  
  // Import the function dynamically to avoid issues
  import('./performanceOptimizer').then(({ generateCSSFallbacks }) => {
    const fallbacks = generateCSSFallbacks(noBrowserSupport);
    
    console.log('Generated CSS fallbacks:');
    console.log(fallbacks);
    
    // Test with full browser support
    const fullBrowserSupport = {
      supportsOverlay: true,
      supportsSoftLight: true,
      supportsColorDodge: true,
      supportsTransformStyle: true,
      supportsPerspective: true,
      supportsBackfaceVisibility: true,
      supportsWillChange: true,
      isWebKit: false,
      isGecko: false,
      isChromium: true
    };
    
    const noFallbacks = generateCSSFallbacks(fullBrowserSupport);
    console.log('No fallbacks needed (empty string):', noFallbacks === '');
  });
}

/**
 * Performance monitoring demo
 */
export function startPerformanceMonitoring() {
  console.log('📊 Starting Performance Monitoring...');
  
  const optimizer = new CardPerformanceOptimizer();
  let frameCount = 0;
  
  const monitor = () => {
    frameCount++;
    const fps = optimizer.getFPS();
    const isAcceptable = optimizer.isPerformanceAcceptable();
    
    if (frameCount % 60 === 0) { // Log every 60 frames (~1 second at 60fps)
      console.log(`Frame ${frameCount}: ${fps} FPS - ${isAcceptable ? 'Good' : 'Poor'} performance`);
    }
    
    if (frameCount < 300) { // Run for ~5 seconds
      requestAnimationFrame(monitor);
    } else {
      console.log('📊 Performance monitoring complete');
      optimizer.destroy();
    }
  };
  
  requestAnimationFrame(monitor);
  return optimizer;
}

// Auto-run demo if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runPerformanceDemo, 1000);
    });
  } else {
    setTimeout(runPerformanceDemo, 1000);
  }
}