<script lang="ts">
  import { onMount } from 'svelte';
  import '../../enhanced-holographic-effects.css';
  

  
  onMount(() => {
    // 카드 뒤집기 이벤트 리스너 추가 - DOM에서 직접 선택
    const containers = document.querySelectorAll('.card-container');
    
    containers.forEach(container => {
      container.addEventListener('click', handleCardFlip);
    });
    
    return () => {
      containers.forEach(container => {
        container.removeEventListener('click', handleCardFlip);
      });
    };
  });
  
  function handleCardFlip(event: Event) {
    const container = event.currentTarget;
    const cardInner = container.querySelector('.card-inner');
    
    if (cardInner.classList.contains('animating')) {
      return; // 애니메이션 중이면 무시
    }
    
    // 애니메이션 상태 설정
    cardInner.classList.add('animating');
    
    // 뒤집기 상태 토글
    cardInner.classList.toggle('flipped');
    
    // 애니메이션 완료 후 상태 해제
    setTimeout(() => {
      cardInner.classList.remove('animating');
    }, 600);
  }
</script>

<svelte:head>
  <title>3D Card Flip Test</title>
</svelte:head>

<main>
  <h1>3D 카드 뒤집기 테스트</h1>
  <p>카드를 클릭하면 Y축으로 회전하면서 뒷면이 나타납니다.</p>
  
  <div class="cards-container">
    <!-- 포켓몬 카드 테스트 -->
    <div class="card-container">
      <div class="card-inner">
        <div class="card-face enhanced-card pika" 
             style="--front: url('https://assets.codepen.io/13471/pikachu.webp');">
        </div>
        <div class="card-face card-back pokemon">
          <div class="back-content">
            <h3>포켓몬</h3>
            <p>피카츄</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- KBO LG 카드 테스트 -->
    <div class="card-container">
      <div class="card-inner">
        <div class="card-face enhanced-card lg" 
             style="--front: url('https://i.imgur.com/example.jpg');">
        </div>
        <div class="card-face card-back lg">
          <div class="back-content">
            <h3>LG 트윈스</h3>
            <p>KBO 리그</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 커스텀 카드 테스트 -->
    <div class="card-container">
      <div class="card-inner">
        <div class="card-face enhanced-card" 
             style="--front: linear-gradient(45deg, #ff6b6b, #4ecdc4);">
        </div>
        <div class="card-face card-back custom">
          <div class="back-content">
            <h3>커스텀</h3>
            <p>홀로그래픽</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    min-height: 100vh;
    color: white;
  }
  
  h1 {
    margin-bottom: 1rem;
    color: #00ffff;
  }
  
  p {
    margin-bottom: 2rem;
    opacity: 0.8;
  }
  
  .cards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    padding: 2rem 0;
  }
  
  .back-content {
    text-align: center;
    color: white;
    z-index: 10;
    position: relative;
  }
  
  .back-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px rgba(255,255,255,0.5);
  }
  
  .back-content p {
    font-size: 1rem;
    opacity: 0.9;
    text-shadow: 0 0 5px rgba(255,255,255,0.3);
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .cards-container {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>