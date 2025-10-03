<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import HighQualityRenderer from './HighQualityRenderer.svelte';
  import AppleSaveAnimation from './AppleSaveAnimation.svelte';

  const dispatch = createEventDispatcher();

  export let elements: any[] = [];
  export let canvasSettings: any = {};

  let renderer: HighQualityRenderer;
  let showSaveAnimation = false;
  let saveAnimationType = 'export';
  let exportedFileName = '';
  let exportedFileSize = '';

  // Export formats and presets
  const exportFormats = {
    'social-media': {
      name: '소셜 미디어',
      icon: '📱',
      formats: [
        {
          id: 'instagram-post',
          name: 'Instagram 포스트',
          size: '1080×1080',
          preset: 'social-instagram',
          description: '정사각형 포스트용'
        },
        {
          id: 'instagram-story',
          name: 'Instagram 스토리',
          size: '1080×1920',
          preset: 'instagram-story',
          description: '세로형 스토리용'
        },
        {
          id: 'twitter-post',
          name: 'Twitter 포스트',
          size: '1200×675',
          preset: 'social-twitter',
          description: '트위터 이미지 포스트용'
        },
        {
          id: 'facebook-post',
          name: 'Facebook 포스트',
          size: '1200×630',
          preset: 'social-facebook',
          description: '페이스북 포스트용'
        }
      ]
    },
    'print-quality': {
      name: '인쇄 품질',
      icon: '🖨️',
      formats: [
        {
          id: 'print-4k',
          name: '4K 고화질',
          size: '3840×2160',
          preset: 'print-4k',
          description: '고품질 인쇄용'
        },
        {
          id: 'print-8k',
          name: '8K 초고화질',
          size: '7680×4320',
          preset: 'print-8k',
          description: '최고 품질 인쇄용'
        },
        {
          id: 'print-a4',
          name: 'A4 인쇄용',
          size: '2480×3508',
          preset: 'print-a4',
          description: 'A4 용지 인쇄용 (300DPI)'
        }
      ]
    },
    'web-optimized': {
      name: '웹 최적화',
      icon: '🌐',
      formats: [
        {
          id: 'web-hd',
          name: 'HD 웹용',
          size: '1920×1080',
          preset: 'web-hd',
          description: '웹사이트 고화질용'
        },
        {
          id: 'web-mobile',
          name: '모바일 최적화',
          size: '750×1334',
          preset: 'mobile-optimized',
          description: '모바일 기기 최적화'
        },
        {
          id: 'web-thumbnail',
          name: '썸네일',
          size: '400×400',
          preset: 'web-thumbnail',
          description: '썸네일 및 미리보기용'
        }
      ]
    }
  };

  // Custom export settings
  let customExport = {
    width: 1920,
    height: 1080,
    format: 'png',
    quality: 0.9,
    resolution: 2
  };

  let isExporting = false;
  let exportProgress = 0;
  let selectedCategory = 'social-media';
  let showCustomExport = false;

  async function exportWithPreset(preset: string, formatName: string) {
    if (!renderer) return;

    isExporting = true;
    saveAnimationType = 'export';
    showSaveAnimation = true;

    try {
      const dataUrl = await renderer.renderHighQuality(preset);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `holographic-card-${formatName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
      
      // Calculate approximate file size
      const sizeInBytes = Math.round(dataUrl.length * 0.75);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      
      exportedFileName = filename;
      exportedFileSize = `${sizeInMB} MB`;

      // Trigger download
      downloadFile(dataUrl, filename);

      dispatch('exportComplete', {
        preset,
        formatName,
        filename,
        fileSize: sizeInMB,
        dataUrl
      });

    } catch (error) {
      console.error('Export failed:', error);
      dispatch('exportError', { error });
      showSaveAnimation = false;
    } finally {
      isExporting = false;
    }
  }

  async function exportCustom() {
    if (!renderer) return;

    isExporting = true;
    saveAnimationType = 'export';
    showSaveAnimation = true;

    try {
      // Create custom preset
      const customPreset = {
        width: customExport.width,
        height: customExport.height,
        format: customExport.format,
        quality: customExport.quality,
        resolution: customExport.resolution
      };

      // Temporarily add to renderer presets
      renderer.exportPresets['custom'] = customPreset;
      
      const dataUrl = await renderer.renderHighQuality('custom');
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `holographic-card-custom-${customExport.width}x${customExport.height}-${timestamp}`;
      
      // Calculate file size
      const sizeInBytes = Math.round(dataUrl.length * 0.75);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      
      exportedFileName = filename;
      exportedFileSize = `${sizeInMB} MB`;

      downloadFile(dataUrl, filename);

      dispatch('exportComplete', {
        preset: 'custom',
        formatName: 'Custom',
        filename,
        fileSize: sizeInMB,
        dataUrl
      });

    } catch (error) {
      console.error('Custom export failed:', error);
      dispatch('exportError', { error });
      showSaveAnimation = false;
    } finally {
      isExporting = false;
    }
  }

  function downloadFile(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${getFileExtension(dataUrl)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getFileExtension(dataUrl: string): string {
    if (dataUrl.includes('image/png')) return 'png';
    if (dataUrl.includes('image/jpeg')) return 'jpg';
    if (dataUrl.includes('image/webp')) return 'webp';
    if (dataUrl.includes('image/svg')) return 'svg';
    return 'png';
  }

  function copyToClipboard(dataUrl: string) {
    // Convert data URL to blob and copy to clipboard
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const item = new ClipboardItem({ [blob.type]: blob });
        navigator.clipboard.write([item]);
        
        dispatch('copiedToClipboard');
      })
      .catch(error => {
        console.error('Failed to copy to clipboard:', error);
      });
  }

  function shareNative(dataUrl: string, filename: string) {
    if (navigator.share) {
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${filename}.png`, { type: blob.type });
          
          navigator.share({
            title: 'KBO 홀로그래픽 카드',
            text: '내가 만든 KBO 홀로그래픽 카드를 확인해보세요!',
            files: [file]
          });
        });
    }
  }

  function handleSaveAnimationComplete() {
    showSaveAnimation = false;
  }
</script>

<div class="export-manager">
  <!-- Hidden renderer component -->
  <HighQualityRenderer
    bind:this={renderer}
    {elements}
    {canvasSettings}
    on:renderStart={(e) => dispatch('renderStart', e.detail)}
    on:renderComplete={(e) => dispatch('renderComplete', e.detail)}
    on:renderError={(e) => dispatch('renderError', e.detail)}
  />

  <!-- Export Categories -->
  <div class="export-categories">
    {#each Object.entries(exportFormats) as [categoryId, category]}
      <button
        class="category-btn"
        class:active={selectedCategory === categoryId}
        on:click={() => selectedCategory = categoryId}
      >
        <span class="category-icon">{category.icon}</span>
        <span class="category-name">{category.name}</span>
      </button>
    {/each}
    
    <button
      class="category-btn custom"
      class:active={showCustomExport}
      on:click={() => showCustomExport = !showCustomExport}
    >
      <span class="category-icon">⚙️</span>
      <span class="category-name">커스텀</span>
    </button>
  </div>

  <!-- Export Formats -->
  {#if !showCustomExport}
    <div class="export-formats">
      <h3>{(exportFormats as any)[selectedCategory].name} 내보내기</h3>
      
      <div class="formats-grid">
        {#each (exportFormats as any)[selectedCategory].formats as format}
          <div class="format-card">
            <div class="format-info">
              <h4>{format.name}</h4>
              <p class="format-size">{format.size}</p>
              <p class="format-description">{format.description}</p>
            </div>
            
            <div class="format-actions">
              <button
                class="export-btn primary"
                disabled={isExporting}
                on:click={() => exportWithPreset(format.preset, format.name)}
              >
                {#if isExporting}
                  <span class="spinner"></span>
                  내보내는 중...
                {:else}
                  📤 내보내기
                {/if}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Custom Export -->
  {#if showCustomExport}
    <div class="custom-export">
      <h3>커스텀 내보내기</h3>
      
      <div class="custom-settings">
        <div class="setting-row">
          <div class="setting-group">
            <label>너비 (px)</label>
            <input
              type="number"
              bind:value={customExport.width}
              min="100"
              max="10000"
            />
          </div>
          
          <div class="setting-group">
            <label>높이 (px)</label>
            <input
              type="number"
              bind:value={customExport.height}
              min="100"
              max="10000"
            />
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-group">
            <label>포맷</label>
            <select bind:value={customExport.format}>
              <option value="png">PNG (무손실)</option>
              <option value="jpg">JPG (압축)</option>
              <option value="webp">WebP (최적화)</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>품질: {Math.round(customExport.quality * 100)}%</label>
            <input
              type="range"
              bind:value={customExport.quality}
              min="0.1"
              max="1"
              step="0.1"
            />
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-group">
            <label>해상도 배율</label>
            <select bind:value={customExport.resolution}>
              <option value={1}>1x (기본)</option>
              <option value={2}>2x (고화질)</option>
              <option value={4}>4x (초고화질)</option>
            </select>
          </div>
        </div>
        
        <div class="custom-preview">
          <p>예상 크기: {customExport.width * customExport.resolution} × {customExport.height * customExport.resolution}px</p>
          <p>예상 파일 크기: ~{Math.round((customExport.width * customExport.height * customExport.resolution * customExport.resolution * 4) / (1024 * 1024))} MB</p>
        </div>
        
        <button
          class="export-btn primary large"
          disabled={isExporting}
          on:click={exportCustom}
        >
          {#if isExporting}
            <span class="spinner"></span>
            커스텀 내보내는 중...
          {:else}
            🎨 커스텀 내보내기
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="quick-actions">
    <h4>빠른 작업</h4>
    <div class="quick-buttons">
      <button
        class="quick-btn"
        on:click={() => exportWithPreset('social-instagram', 'Instagram')}
        disabled={isExporting}
      >
        📷 Instagram
      </button>
      
      <button
        class="quick-btn"
        on:click={() => exportWithPreset('social-twitter', 'Twitter')}
        disabled={isExporting}
      >
        🐦 Twitter
      </button>
      
      <button
        class="quick-btn"
        on:click={() => exportWithPreset('print-4k', '4K Print')}
        disabled={isExporting}
      >
        🖨️ 4K 인쇄
      </button>
      
      <button
        class="quick-btn"
        on:click={() => exportWithPreset('web-hd', 'HD Web')}
        disabled={isExporting}
      >
        🌐 웹 HD
      </button>
    </div>
  </div>
</div>

<!-- Save Animation -->
<AppleSaveAnimation
  bind:isVisible={showSaveAnimation}
  saveType={saveAnimationType}
  fileName={exportedFileName}
  fileSize={exportedFileSize}
  on:animationComplete={handleSaveAnimationComplete}
/>

<style>
  .export-manager {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 20px;
    background: rgba(28, 28, 30, 0.95);
    border-radius: 12px;
    color: #ffffff;
    max-height: 80vh;
    overflow-y: auto;
  }

  .export-categories {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .category-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }

  .category-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .category-btn.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: #6366f1;
  }

  .category-btn.custom {
    margin-left: auto;
  }

  .category-icon {
    font-size: 16px;
  }

  .category-name {
    font-weight: 500;
  }

  .export-formats h3,
  .custom-export h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
  }

  .formats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .format-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .format-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .format-info h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .format-size {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #6366f1;
    font-weight: 600;
    font-family: 'SF Mono', monospace;
  }

  .format-description {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: #86868b;
    line-height: 1.4;
  }

  .format-actions {
    display: flex;
    gap: 8px;
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn.primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
  }

  .export-btn.primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .export-btn.large {
    padding: 14px 24px;
    font-size: 16px;
    width: 100%;
    justify-content: center;
  }

  .export-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .custom-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .setting-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .setting-group label {
    font-size: 14px;
    font-weight: 500;
    color: #ebebf5;
  }

  .setting-group input,
  .setting-group select {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
  }

  .setting-group input:focus,
  .setting-group select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .custom-preview {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
  }

  .custom-preview p {
    margin: 0 0 4px 0;
    font-size: 13px;
    color: #86868b;
  }

  .custom-preview p:last-child {
    margin-bottom: 0;
  }

  .quick-actions {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 20px;
  }

  .quick-actions h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ebebf5;
  }

  .quick-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .quick-btn {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .quick-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .quick-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Scrollbar styling */
  .export-manager::-webkit-scrollbar {
    width: 6px;
  }

  .export-manager::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .export-manager::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .export-manager::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .export-manager {
      padding: 16px;
    }

    .formats-grid {
      grid-template-columns: 1fr;
    }

    .setting-row {
      grid-template-columns: 1fr;
    }

    .quick-buttons {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>