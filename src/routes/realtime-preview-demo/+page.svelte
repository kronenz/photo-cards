<script lang="ts">
  import { onMount } from 'svelte';

  // State variables
  let selectedDemo = 'kbo-legend';
  let holographicEnabled = true;
  let previewQuality = 'high';
  let performanceMode = false;

  // Canvas settings
  let canvasSettings = {
    width: 660,
    height: 921,
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
  };

  // Demo elements
  let demoElements = [
    {
      id: 'title',
      type: 'text',
      x: 50,
      y: 50,
      width: 560,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      data: {
        content: 'KBO 홀로그래픽 카드',
        fontSize: 36,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffffff',
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
        padding: 16,
        borderRadius: 12
      }
    },
    {
      id: 'player-name',
      type: 'text',
      x: 100,
      y: 200,
      width: 460,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: 3,
      data: {
        content: '이승엽',
        fontSize: 48,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffd700',
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 1,
        textShadow: '0 0 20px #ffd700, 2px 2px 4px rgba(0,0,0,0.8)',
        background: 'transparent',
        padding: 0,
        borderRadius: 0
      }
    }
  ];

  // Demo presets
  const demoPresets = {
    'kbo-legend': {
      name: 'KBO 레전드',
      description: '이승엽 선수 기념 카드'
    }
  };

  // Event handlers
  function toggleHolographic() {
    holographicEnabled = !holographicEnabled;
  }

  function changeQuality(quality: string) {
    previewQuality = quality;
  }

  onMount(() => {
    console.log('Real-time Preview Demo loaded');
  });
</script>

<svelte:head>
  <title>실시간 미리보기 & Apple 수준 렌더링 - KBO 홀로그래픽 카드</title>
  <meta name="description" content="60fps 실시간 미리보기와 4K 고품질 렌더링으로 완벽한 KBO 카드를 만들어보세요" />
</svelte:head>

<div class="demo-page">
  <!-- Header -->
  <header class="demo-header">
    <div class="header-content">
      <h1>🎬 실시간 미리보기 & Apple 수준 렌더링</h1>
      <p>60fps 부드러운 인터랙션과 4K 고품질 렌더링을 경험해보세요</p>
    </div>
    
    <div class="header-actions">
      <a href="/advanced-editor-demo" class="nav-link">🎨 고급 편집기</a>
      <a href="/kbo-demo" class="nav-link">⚾ KBO 데모</a>
      <a href="/" class="nav-link">🏠 홈</a>
    </div>
  </header>

  <!-- Demo Controls -->
  <div class="demo-controls">
    <div class="control-section">
      <h3>데모 프리셋</h3>
      <div class="preset-buttons">
        <button class="preset-btn active">
          <div class="preset-name">KBO 레전드</div>
          <div class="preset-description">이승엽 선수 기념 카드</div>
        </button>
      </div>
    </div>

    <div class="control-section">
      <h3>미리보기 설정</h3>
      <div class="setting-controls">
        <label class="toggle-control">
          <input type="checkbox" bind:checked={holographicEnabled} on:change={toggleHolographic} />
          <span class="toggle-slider"></span>
          <span class="toggle-label">홀로그래픽 효과</span>
        </label>

        <div class="quality-control">
          <label>미리보기 품질:</label>
          <select bind:value={previewQuality} on:change={() => changeQuality(previewQuality)}>
            <option value="preview">미리보기 (빠름)</option>
            <option value="high">고품질 (균형)</option>
            <option value="ultra">최고품질 (느림)</option>
          </select>
        </div>

        {#if performanceMode}
          <div class="performance-warning">
            ⚡ 성능 모드 활성화됨 - 품질이 자동으로 조정되었습니다
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Preview Area -->
  <div class="preview-area">
    <div class="preview-container">
      <div class="card-preview" style="
        width: {canvasSettings.width}px;
        height: {canvasSettings.height}px;
        background: {canvasSettings.background};
      ">
        {#each demoElements as element}
          <div class="element-preview" style="
            position: absolute;
            left: {element.x}px;
            top: {element.y}px;
            width: {element.width}px;
            height: {element.height}px;
            opacity: {element.opacity};
            z-index: {element.zIndex};
          ">
            {#if element.type === 'text'}
              <div class="text-element" style="
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
              ">
                {element.data.content}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      
      <div class="preview-overlay">
        <div class="preview-info">
          <span class="preview-title">{demoPresets['kbo-legend'].name}</span>
          <span class="preview-size">{canvasSettings.width} × {canvasSettings.height}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="action-btn primary" on:click={() => console.log('Capture preview')}>
        📸 미리보기 캡처
      </button>
      <button class="action-btn secondary" on:click={() => console.log('Export')}>
        📤 고품질 내보내기
      </button>
      <button class="action-btn tertiary" on:click={() => console.log('Share')}>
        📱 공유하기
      </button>
    </div>
  </div>

  <!-- Feature Highlights -->
  <div class="feature-highlights">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>60fps 실시간 미리보기</h3>
      <p>부드러운 홀로그래픽 효과와 실시간 인터랙션</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <h3>Apple 수준 렌더링</h3>
      <p>4K/8K 고품질 최종 출력</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">📱</div>
      <h3>소셜 미디어 최적화</h3>
      <p>플랫폼별 자동 포맷 생성</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">💾</div>
      <h3>Apple 스타일 저장</h3>
      <p>부드러운 저장 애니메이션과 피드백</p>
    </div>
  </div>
</div>

<style>
  .demo-page {
    min-height: 100vh;
    background: #0f0f23;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  }

  .demo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    background: rgba(28, 28, 30, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-content p {
    margin: 0;
    font-size: 16px;
    color: #86868b;
  }

  .header-actions {
    display: flex;
    gap: 16px;
  }

  .nav-link {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .demo-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .control-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .preset-btn {
    padding: 16px 20px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid #6366f1;
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    text-align: left;
  }

  .preset-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 14px;
    color: #86868b;
  }

  .setting-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .toggle-control {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .toggle-control input {
    display: none;
  }

  .toggle-slider {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
  }

  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .toggle-control input:checked + .toggle-slider {
    background: #6366f1;
  }

  .toggle-control input:checked + .toggle-slider::after {
    transform: translateX(20px);
  }

  .quality-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .quality-control select {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
  }

  .performance-warning {
    padding: 12px 16px;
    background: rgba(255, 159, 10, 0.1);
    border: 1px solid rgba(255, 159, 10, 0.3);
    border-radius: 8px;
    color: #ff9f0a;
    font-size: 14px;
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 40px;
  }

  .preview-container {
    position: relative;
    transform: scale(0.6);
  }

  .card-preview {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .element-preview {
    pointer-events: none;
  }

  .text-element {
    user-select: none;
    word-wrap: break-word;
    overflow: hidden;
  }

  .preview-overlay {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(28, 28, 30, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 16px;
    display: flex;
    gap: 16px;
  }

  .preview-title {
    font-size: 14px;
    font-weight: 600;
  }

  .preview-size {
    font-size: 12px;
    color: #86868b;
    font-family: 'SF Mono', monospace;
  }

  .action-buttons {
    display: flex;
    gap: 16px;
  }

  .action-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .action-btn.tertiary {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .action-btn:hover {
    transform: translateY(-2px);
  }

  .feature-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .feature-card p {
    margin: 0;
    font-size: 14px;
    color: #86868b;
  }

  @media (max-width: 768px) {
    .demo-header {
      flex-direction: column;
      gap: 16px;
      padding: 16px 20px;
    }

    .demo-controls {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    .action-buttons {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .feature-highlights {
      grid-template-columns: 1fr;
      padding: 20px;
    }
  }
</style>