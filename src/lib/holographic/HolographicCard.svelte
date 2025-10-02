<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { HolographicType } from './HolographicEngine.js';
  
  // Props
  export let type: HolographicType = 'basic';
  export let image: string = '';
  export let title: string = '';
  export let subtitle: string = '';
  export let rarity: string = '★★★';
  export let team: string = '';
  export let animated: boolean = false;
  export let showPerformance: boolean = false;
  
  let cardElement: HTMLElement;
  let styleElement: HTMLStyleElement;
  let mounted = false;
  let animationTimeout: number;
  
  // 성능 정보
  let fps = 60;
  let frameTime = 16.67;
  
  onMount(() => {
    if (!browser) return;
    
    mounted = true;
    
    // 스타일 엘리먼트 생성 (how2code.md 방식)
    styleElement = document.createElement('style');
    styleElement.className = 'hover';
    document.head.appendChild(styleElement);
    
    // 이벤트 리스너 등록
    if (cardElement) {
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      cardElement.addEventListener('mouseout', handleMouseOut);
      cardElement.addEventListener('touchend', handleTouchEnd);
      cardElement.addEventListener('touchcancel', handleTouchEnd);
    }
  });
  
  onDestroy(() => {
    if (!browser) return;
    
    if (cardElement) {
      cardElement.removeEventListener('mousemove', handleMouseMove);
      cardElement.removeEventListener('touchmove', handleTouchMove);
      cardElement.removeEventListener('mouseout', handleMouseOut);
      cardElement.removeEventListener('touchend', handleTouchEnd);
      cardElement.removeEventListener('touchcancel', handleTouchEnd);
    }
    
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
  });
  
  // how2code.md 완벽 구현 - 마우스 이동 처리
  function handleMouseMove(e: MouseEvent) {
    if (!cardElement || !styleElement) return;
    
    const pos = [e.offsetX, e.offsetY];
    const rect = cardElement.getBoundingClientRect();
    
    // how2code.md 수학 공식 완벽 구현
    const l = pos[0];
    const t = pos[1];
    const h = rect.height;
    const w = rect.width;
    const px = Math.abs(Math.floor(100 / w * l) - 100);
    const py = Math.abs(Math.floor(100 / h * t) - 100);
    const pa = (50 - px) + (50 - py);
    
    // 그라디언트/배경 위치 계산
    const lp = (50 + (px - 50) / 1.5);
    const tp = (50 + (py - 50) / 1.5);
    const px_spark = (50 + (px - 50) / 7);
    const py_spark = (50 + (py - 50) / 7);
    const p_opc = 20 + (Math.abs(pa) * 1.5);
    const ty = ((tp - 50) / 2) * -1;
    const tx = ((lp - 50) / 1.5) * 0.5;
    
    // CSS 적용
    const grad_pos = `background-position: ${lp}% ${tp}%;`;
    const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
    const opc = `opacity: ${p_opc / 100};`;
    const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;
    
    // 스타일 태그에 CSS 적용 (how2code.md 방식)
    const style = `
      .holographic-card:hover:before { ${grad_pos} }
      .holographic-card:hover:after { ${sprk_pos} ${opc} }
    `;
    
    // 클래스 및 스타일 적용
    removeActiveFromAll();
    cardElement.classList.remove('animated');
    cardElement.classList.add('active');
    cardElement.style.cssText = tf;
    styleElement.innerHTML = style;
    
    clearTimeout(animationTimeout);
  }
  
  // 터치 이동 처리
  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!cardElement || !styleElement || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = cardElement.getBoundingClientRect();
    const pos = [touch.clientX - rect.left, touch.clientY - rect.top];
    
    // 마우스 이동과 동일한 로직 적용
    const l = pos[0];
    const t = pos[1];
    const h = rect.height;
    const w = rect.width;
    const px = Math.abs(Math.floor(100 / w * l) - 100);
    const py = Math.abs(Math.floor(100 / h * t) - 100);
    const pa = (50 - px) + (50 - py);
    
    const lp = (50 + (px - 50) / 1.5);
    const tp = (50 + (py - 50) / 1.5);
    const px_spark = (50 + (px - 50) / 7);
    const py_spark = (50 + (py - 50) / 7);
    const p_opc = 20 + (Math.abs(pa) * 1.5);
    const ty = ((tp - 50) / 2) * -1;
    const tx = ((lp - 50) / 1.5) * 0.5;
    
    const grad_pos = `background-position: ${lp}% ${tp}%;`;
    const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
    const opc = `opacity: ${p_opc / 100};`;
    const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;
    
    const style = `
      .holographic-card:hover:before { ${grad_pos} }
      .holographic-card:hover:after { ${sprk_pos} ${opc} }
    `;
    
    removeActiveFromAll();
    cardElement.classList.remove('animated');
    cardElement.classList.add('active');
    cardElement.style.cssText = tf;
    styleElement.innerHTML = style;
  }
  
  // 마우스 아웃 처리 (how2code.md 완벽 구현)
  function handleMouseOut() {
    if (!cardElement || !styleElement) return;
    
    styleElement.innerHTML = '';
    cardElement.removeAttribute('style');
    cardElement.classList.remove('active');
    
    animationTimeout = setTimeout(() => {
      if (cardElement) {
        cardElement.classList.add('animated');
      }
    }, 2500);
  }
  
  // 터치 종료 처리
  function handleTouchEnd() {
    handleMouseOut();
  }
  
  // 모든 카드에서 active 클래스 제거
  function removeActiveFromAll() {
    if (!browser) return;
    const allCards = document.querySelectorAll('.holographic-card');
    allCards.forEach(card => card.classList.remove('active'));
  }
  
  // 타입 변경 시 CSS 변수 업데이트
  $: if (cardElement && mounted) {
    cardElement.className = `holographic-card ${type}`;
    if (animated) {
      cardElement.classList.add('animated');
    }
  }
</script>

<!-- how2code.md 완벽 구현 - 단순하고 효과적인 구조 -->
<div class="three-d-wrapper">
  <div 
    bind:this={cardElement}
    class="holographic-card {type}"
    class:animated
    style="--front: url({image || 'https://assets.codepen.io/13471/charizard-gx.webp'})"
    role="button"
    aria-label="{title} 홀로그래픽 카드"
    tabindex="0"
  >
    <!-- 카드 콘텐츠 오버레이 -->
    <div class="card-content">
      <div class="card-header">
        {#if team}
          <span class="team-badge">{team}</span>
        {/if}
        <span class="rarity-badge">{rarity}</span>
      </div>
      
      <div class="card-footer">
        <h3 class="card-title">{title}</h3>
        {#if subtitle}
          <p class="card-subtitle">{subtitle}</p>
        {/if}
      </div>
    </div>
    
    <!-- 성능 모니터링 오버레이 -->
    {#if showPerformance && browser}
      <div class="performance-overlay">
        <div class="perf-item">
          <span class="perf-label">FPS:</span>
          <span class="perf-value" class:warning={fps < 50} class:error={fps < 30}>
            {fps}
          </span>
        </div>
        <div class="perf-item">
          <span class="perf-label">Frame:</span>
          <span class="perf-value">{frameTime}ms</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* how2code.md 완벽 구현 스타일 */
  .three-d-wrapper {
    perspective: 750px;
    isolation: isolate;
    transform: translate3d(0.1px, 0.1px, 0.1px);
  }
  
  .holographic-card {
    width: 300px;
    height: 420px;
    position: relative;
    overflow: hidden;
    margin: 20px;
    z-index: 10;
    touch-action: none;
    isolation: isolate;
    cursor: pointer;
    
    border-radius: 5% / 3.5%;
    box-shadow: 
      -5px -5px 5px -5px var(--color1, rgb(0, 231, 255)), 
      5px 5px 5px -5px var(--color2, rgb(255, 0, 231)), 
      -7px -7px 10px -5px transparent, 
      7px 7px 10px -5px transparent, 
      0 0 5px 0px rgba(255,255,255,0),
      0 55px 35px -20px rgba(0, 0, 0, 0.5);
    
    transition: transform 0.5s ease, box-shadow 0.2s ease;
    will-change: transform, filter;
    
    background-color: #040712;
    background-image: var(--front);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    transform-origin: center;
  }
  
  .holographic-card:hover {
    box-shadow: 
      -20px -20px 30px -25px var(--color1, rgb(0, 231, 255)), 
      20px 20px 30px -25px var(--color2, rgb(255, 0, 231)), 
      -7px -7px 10px -5px var(--color1, rgb(0, 231, 255)), 
      7px 7px 10px -5px var(--color2, rgb(255, 0, 231)), 
      0 0 13px 4px rgba(255,255,255,0.3),
      0 55px 35px -20px rgba(0, 0, 0, 0.5);
  }
  
  /* 카드 콘텐츠 오버레이 */
  .card-content {
    position: absolute;
    inset: 0;
    z-index: 10;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .team-badge {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 8px;
    border-radius: 6px;
    backdrop-filter: blur(10px);
  }
  
  .rarity-badge {
    font-size: 14px;
    color: #ffd700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  .card-footer {
    text-align: center;
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin: 0 0 4px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
    line-height: 1.2;
  }
  
  .card-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  /* 성능 모니터링 오버레이 */
  .performance-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 20;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 6px;
    font-size: 10px;
    font-family: monospace;
    backdrop-filter: blur(10px);
    pointer-events: none;
  }
  
  .perf-item {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 2px;
  }
  
  .perf-item:last-child {
    margin-bottom: 0;
  }
  
  .perf-value.warning {
    color: #ff9500;
  }
  
  .perf-value.error {
    color: #ff3b30;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .holographic-card {
      width: 250px;
      height: 350px;
      margin: 10px;
    }
    
    .card-content {
      padding: 16px;
    }
    
    .card-title {
      font-size: 16px;
    }
  }
  

</style>