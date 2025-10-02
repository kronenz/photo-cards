<script lang="ts">
  import AdvancedCardEditor from '$lib/components/AdvancedCardEditor.svelte';
  import { onMount } from 'svelte';

  let editorComponent: AdvancedCardEditor;
  let canvasData: any = null;
  let showExportModal = false;

  onMount(() => {
    // Initialize demo
    console.log('Advanced Card Editor Demo loaded');
  });

  function handleCanvasExported(event: CustomEvent) {
    canvasData = event.detail;
    showExportModal = true;
    console.log('Canvas exported:', canvasData);
  }

  function downloadCanvas() {
    if (!canvasData) return;
    
    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `holographic-card-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  function closeExportModal() {
    showExportModal = false;
  }
</script>

<svelte:head>
  <title>고급 카드 편집기 - KBO 홀로그래픽 카드</title>
  <meta name="description" content="Apple Keynote 수준의 고급 편집 도구로 KBO 야구 카드를 제작하세요" />
</svelte:head>

<div class="demo-page">
  <!-- Header -->
  <header class="demo-header">
    <div class="header-content">
      <h1>🎨 고급 카드 편집기</h1>
      <p>Apple Keynote 수준의 편집 도구로 감동적인 KBO 야구 카드를 만들어보세요</p>
    </div>
    
    <div class="header-actions">
      <a href="/kbo-demo" class="nav-link">
        ⚾ KBO 데모
      </a>
      <a href="/templates" class="nav-link">
        📋 템플릿
      </a>
      <a href="/" class="nav-link">
        🏠 홈
      </a>
    </div>
  </header>

  <!-- Feature Highlights -->
  <div class="feature-highlights">
    <div class="feature-card">
      <div class="feature-icon">📝</div>
      <h3>고급 텍스트 편집</h3>
      <p>Apple 수준의 타이포그래피와 텍스트 효과</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🎭</div>
      <h3>스토리텔링</h3>
      <p>KBO 야구 문화를 반영한 감동적인 스토리</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">✨</div>
      <h3>파티클 효과</h3>
      <p>불꽃, 번개, 반짝임 등 동적 특수 효과</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <h3>콜라주 편집</h3>
      <p>다중 이미지 조합과 레이아웃 시스템</p>
    </div>
  </div>

  <!-- Main Editor -->
  <main class="editor-main">
    <AdvancedCardEditor
      bind:this={editorComponent}
      on:canvasExported={handleCanvasExported}
    />
  </main>

  <!-- Instructions -->
  <div class="instructions">
    <h2>사용 방법</h2>
    <div class="instruction-grid">
      <div class="instruction-item">
        <span class="step-number">1</span>
        <div class="step-content">
          <h4>도구 선택</h4>
          <p>상단 툴바에서 텍스트, 이미지, 도형, 파티클, 콜라주 도구를 선택하세요</p>
        </div>
      </div>
      
      <div class="instruction-item">
        <span class="step-number">2</span>
        <div class="step-content">
          <h4>요소 추가</h4>
          <p>캔버스를 클릭하여 새로운 요소를 추가하고 드래그로 위치를 조정하세요</p>
        </div>
      </div>
      
      <div class="instruction-item">
        <span class="step-number">3</span>
        <div class="step-content">
          <h4>속성 편집</h4>
          <p>왼쪽 패널에서 선택된 요소의 속성을 세밀하게 조정하세요</p>
        </div>
      </div>
      
      <div class="instruction-item">
        <span class="step-number">4</span>
        <div class="step-content">
          <h4>효과 적용</h4>
          <p>오른쪽 패널에서 홀로그래픽 효과와 스토리텔링 요소를 추가하세요</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Keyboard Shortcuts -->
  <div class="shortcuts">
    <h3>키보드 단축키</h3>
    <div class="shortcut-grid">
      <div class="shortcut-item">
        <kbd>Delete</kbd>
        <span>선택된 요소 삭제</span>
      </div>
      <div class="shortcut-item">
        <kbd>Ctrl</kbd> + <kbd>D</kbd>
        <span>요소 복제</span>
      </div>
      <div class="shortcut-item">
        <kbd>Esc</kbd>
        <span>선택 해제</span>
      </div>
      <div class="shortcut-item">
        <kbd>Ctrl</kbd> + <kbd>Wheel</kbd>
        <span>확대/축소</span>
      </div>
    </div>
  </div>
</div>

<!-- Export Modal -->
{#if showExportModal}
  <div class="modal-overlay" on:click={closeExportModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h3>카드 내보내기</h3>
        <button class="close-btn" on:click={closeExportModal}>✕</button>
      </div>
      
      <div class="modal-body">
        <p>카드가 성공적으로 생성되었습니다!</p>
        
        <div class="export-stats">
          <div class="stat-item">
            <span class="stat-label">요소 개수:</span>
            <span class="stat-value">{canvasData?.elements?.length || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">캔버스 크기:</span>
            <span class="stat-value">{canvasData?.canvas?.width} × {canvasData?.canvas?.height}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">생성 시간:</span>
            <span class="stat-value">{new Date(canvasData?.metadata?.created).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="export-actions">
          <button class="export-btn primary" on:click={downloadCanvas}>
            💾 JSON 다운로드
          </button>
          <button class="export-btn secondary" on:click={closeExportModal}>
            📋 클립보드 복사
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

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
    position: sticky;
    top: 0;
    z-index: 100;
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
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .feature-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
  }

  .feature-card p {
    margin: 0;
    font-size: 14px;
    color: #86868b;
    line-height: 1.5;
  }

  .editor-main {
    height: calc(100vh - 200px);
    margin: 0 20px 40px 20px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .instructions {
    max-width: 1000px;
    margin: 0 auto 40px auto;
    padding: 0 40px;
  }

  .instructions h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    color: #ffffff;
  }

  .instruction-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .instruction-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-content h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .step-content p {
    margin: 0;
    font-size: 14px;
    color: #86868b;
    line-height: 1.5;
  }

  .shortcuts {
    max-width: 800px;
    margin: 0 auto 40px auto;
    padding: 0 40px;
  }

  .shortcuts h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    color: #ffffff;
  }

  .shortcut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
  }

  kbd {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', monospace;
    color: #ffffff;
  }

  .shortcut-item span {
    font-size: 14px;
    color: #86868b;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: rgba(28, 28, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
  }

  .close-btn {
    padding: 8px;
    background: transparent;
    border: none;
    color: #86868b;
    cursor: pointer;
    font-size: 16px;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-body p {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: #ebebf5;
  }

  .export-stats {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .stat-item:last-child {
    margin-bottom: 0;
  }

  .stat-label {
    font-size: 14px;
    color: #86868b;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .export-actions {
    display: flex;
    gap: 12px;
  }

  .export-btn {
    flex: 1;
    padding: 12px 20px;
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

  .export-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .export-btn.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .export-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .demo-header {
      flex-direction: column;
      gap: 16px;
      padding: 16px 20px;
    }

    .header-actions {
      width: 100%;
      justify-content: center;
    }

    .feature-highlights,
    .instructions,
    .shortcuts {
      padding: 0 20px;
    }

    .editor-main {
      margin: 0 10px 20px 10px;
      height: calc(100vh - 300px);
    }

    .instruction-grid,
    .shortcut-grid {
      grid-template-columns: 1fr;
    }

    .modal-content {
      width: 95%;
      margin: 20px;
    }

    .export-actions {
      flex-direction: column;
    }
  }
</style>