<script lang="ts">
  import { onMount } from 'svelte';
  import KBOGloryMomentCreator from '$lib/components/KBOGloryMomentCreator.svelte';
  import type { GloryMomentTemplate, KBOTeam, EmotionIcon, FamousQuote, KBOCheerSound } from '$lib/data/kboTemplates.js';

  let createdCards: any[] = [];
  let showCreator = true;
  let currentCard: any = null;

  function handleCardCreated(event: CustomEvent) {
    const cardData = event.detail;
    createdCards = [...createdCards, {
      id: Date.now(),
      ...cardData,
      createdAt: new Date()
    }];
    
    currentCard = cardData;
    showCreator = false;
    
    console.log('카드 생성 완료:', cardData);
  }

  function startNewCard() {
    showCreator = true;
    currentCard = null;
  }

  function viewCard(card: any) {
    currentCard = card;
    showCreator = false;
  }

  onMount(() => {
    console.log('KBO 영광의 순간 카드 생성기 데모 시작');
  });
</script>

<svelte:head>
  <title>KBO 영광의 순간 카드 생성기 - 홀로그래픽 카드 커뮤니티</title>
  <meta name="description" content="KBO 야구의 특별한 순간들을 홀로그래픽 카드로 만들어보세요" />
</svelte:head>

<div class="kbo-glory-demo">
  <!-- 헤더 -->
  <header class="demo-header">
    <div class="header-content">
      <h1 class="demo-title">
        <span class="title-icon">🏆</span>
        KBO 영광의 순간 카드 생성기
      </h1>
      <p class="demo-description">
        한국 프로야구의 특별한 순간들을 홀로그래픽 카드로 만들어 영원히 간직하세요
      </p>
      
      <div class="demo-stats">
        <div class="stat-item">
          <span class="stat-number">{createdCards.length}</span>
          <span class="stat-label">생성된 카드</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">10</span>
          <span class="stat-label">KBO 구단</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">14</span>
          <span class="stat-label">카테고리</span>
        </div>
      </div>
    </div>
  </header>

  <!-- 메인 콘텐츠 -->
  <main class="demo-main">
    {#if showCreator}
      <!-- 카드 생성기 -->
      <div class="creator-section">
        <KBOGloryMomentCreator
          on:cardCreated={handleCardCreated}
          on:stepChanged={(e) => console.log('단계 변경:', e.detail)}
        />
      </div>
    {:else if currentCard}
      <!-- 생성된 카드 보기 -->
      <div class="card-view-section">
        <div class="view-header">
          <h2 class="view-title">
            <span class="title-icon">✨</span>
            카드 생성 완료!
          </h2>
          <div class="view-actions">
            <button class="action-button secondary" on:click={startNewCard}>
              🎨 새 카드 만들기
            </button>
            <button class="action-button primary" on:click={() => alert('카드 저장 기능은 개발 중입니다!')}>
              💾 카드 저장
            </button>
          </div>
        </div>

        <!-- 카드 정보 표시 -->
        <div class="card-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">카테고리</span>
              <span class="info-value">{currentCard.template.category}</span>
            </div>
            <div class="info-item">
              <span class="info-label">템플릿</span>
              <span class="info-value">{currentCard.template.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">구단</span>
              <span class="info-value">{currentCard.team.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">선수</span>
              <span class="info-value">{currentCard.playerData.name} #{currentCard.playerData.number}</span>
            </div>
          </div>

          {#if currentCard.story.title}
            <div class="story-section">
              <h3 class="story-title">📝 스토리</h3>
              <div class="story-content">
                <h4>{currentCard.story.title}</h4>
                {#if currentCard.story.description}
                  <p>{currentCard.story.description}</p>
                {/if}
                {#if currentCard.story.context}
                  <div class="story-context">
                    <strong>상황:</strong> {currentCard.story.context}
                  </div>
                {/if}
                {#if currentCard.story.moment}
                  <div class="story-moment">
                    <strong>결정적 순간:</strong> {currentCard.story.moment}
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <div class="elements-section">
            <h3 class="elements-title">🎨 추가된 요소</h3>
            <div class="elements-list">
              {#if currentCard.emotion}
                <div class="element-chip emotion">
                  {currentCard.emotion.icon} {currentCard.emotion.name}
                </div>
              {/if}
              {#if currentCard.quote}
                <div class="element-chip quote">
                  💬 {currentCard.quote.author}의 명언
                </div>
              {/if}
              {#if currentCard.sound}
                <div class="element-chip sound">
                  🎵 {currentCard.sound.name}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- 카드 미리보기 (실제 구현에서는 KBOTemplateIntegration 컴포넌트 사용) -->
        <div class="card-preview">
          <div class="preview-card" style="--team-color: {currentCard.team.colors.primary}">
            <div class="card-header">
              <div class="team-logo">⚾</div>
              <div class="team-info">
                <div class="team-name">{currentCard.team.name}</div>
                <div class="player-info">{currentCard.playerData.name} #{currentCard.playerData.number}</div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="template-name">{currentCard.template.name}</div>
              {#if currentCard.story.title}
                <div class="card-title">{currentCard.story.title}</div>
              {/if}
              {#if currentCard.story.description}
                <div class="card-description">{currentCard.story.description}</div>
              {/if}
            </div>

            <div class="card-footer">
              {#if currentCard.emotion}
                <div class="emotion-display">
                  <span class="emotion-icon">{currentCard.emotion.icon}</span>
                  <span class="emotion-name">{currentCard.emotion.name}</span>
                </div>
              {/if}
              {#if currentCard.quote}
                <div class="quote-display">
                  <div class="quote-text">"{currentCard.quote.text}"</div>
                  <div class="quote-author">- {currentCard.quote.author}</div>
                </div>
              {/if}
            </div>

            <!-- 홀로그래픽 효과 -->
            <div class="holographic-overlay"></div>
          </div>
        </div>
      </div>
    {/if}
  </main>

  <!-- 생성된 카드 갤러리 -->
  {#if createdCards.length > 0}
    <section class="gallery-section">
      <h2 class="gallery-title">
        <span class="title-icon">🖼️</span>
        생성된 카드 갤러리
      </h2>
      
      <div class="cards-grid">
        {#each createdCards as card (card.id)}
          <button class="gallery-card" on:click={() => viewCard(card)}>
            <div class="gallery-card-preview" style="--team-color: {card.team.colors.primary}">
              <div class="gallery-card-header">
                <span class="gallery-team-name">{card.team.name}</span>
                <span class="gallery-player">{card.playerData.name}</span>
              </div>
              <div class="gallery-card-body">
                <div class="gallery-template">{card.template.name}</div>
                {#if card.story.title}
                  <div class="gallery-title">{card.story.title}</div>
                {/if}
              </div>
              <div class="gallery-card-footer">
                <span class="gallery-date">
                  {card.createdAt.toLocaleDateString('ko-KR')}
                </span>
                {#if card.emotion}
                  <span class="gallery-emotion">{card.emotion.icon}</span>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 기능 소개 -->
  <section class="features-section">
    <h2 class="features-title">
      <span class="title-icon">⚡</span>
      주요 기능
    </h2>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🏆</div>
        <h3 class="feature-name">14가지 카테고리</h3>
        <p class="feature-description">
          우승, 끝내기, 홈런, 신인왕 등 KBO 야구의 모든 특별한 순간들
        </p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">⚾</div>
        <h3 class="feature-name">10개 구단 지원</h3>
        <p class="feature-description">
          각 구단의 고유 컬러와 테마가 적용된 전용 카드 디자인
        </p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3 class="feature-name">스토리텔링</h3>
        <p class="feature-description">
          감정, 명언, 배경 스토리를 추가하여 더욱 의미 있는 카드 제작
        </p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎵</div>
        <h3 class="feature-name">사운드 효과</h3>
        <p class="feature-description">
          구단별 응원가와 야구 효과음으로 생동감 넘치는 카드
        </p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3 class="feature-name">홀로그래픽 효과</h3>
        <p class="feature-description">
          실물 카드 수준의 프리미엄 홀로그래픽 효과와 3D 인터랙션
        </p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3 class="feature-name">통계 시각화</h3>
        <p class="feature-description">
          선수 기록과 통계를 아름다운 차트로 시각화
        </p>
      </div>
    </div>
  </section>
</div>

<style>
  .kbo-glory-demo {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
    color: #ffffff;
  }

  /* 헤더 */
  .demo-header {
    padding: 60px 20px;
    text-align: center;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .demo-title {
    font-size: 48px;
    font-weight: 800;
    margin: 0 0 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .title-icon {
    font-size: 40px;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
  }

  .demo-description {
    font-size: 20px;
    color: #ebebf5;
    margin: 0 0 40px;
    line-height: 1.6;
  }

  .demo-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #6366f1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: #ebebf599;
  }

  /* 메인 콘텐츠 */
  .demo-main {
    padding: 40px 20px;
  }

  .creator-section {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* 카드 보기 섹션 */
  .card-view-section {
    max-width: 1000px;
    margin: 0 auto;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .view-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .view-actions {
    display: flex;
    gap: 12px;
  }

  .action-button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }

  .action-button.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .action-button.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  /* 카드 정보 */
  .card-info {
    background: rgba(28, 28, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .info-label {
    font-size: 12px;
    color: #ebebf599;
    font-weight: 500;
  }

  .info-value {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
  }

  .story-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    margin-bottom: 20px;
  }

  .story-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #6366f1;
  }

  .story-content h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #ffffff;
  }

  .story-content p {
    font-size: 14px;
    color: #ebebf5;
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .story-context,
  .story-moment {
    font-size: 13px;
    color: #ebebf599;
    margin-bottom: 8px;
  }

  .elements-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
  }

  .elements-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #8b5cf6;
  }

  .elements-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .element-chip {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }

  .element-chip.emotion {
    background: linear-gradient(135deg, #ec4899, #f97316);
  }

  .element-chip.quote {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
  }

  .element-chip.sound {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  /* 카드 미리보기 */
  .card-preview {
    display: flex;
    justify-content: center;
    padding: 40px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
  }

  .preview-card {
    width: 300px;
    height: 420px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid var(--team-color);
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .preview-card:hover {
    transform: translateY(-8px) rotateY(5deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .team-logo {
    width: 40px;
    height: 40px;
    background: var(--team-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .team-info {
    flex: 1;
  }

  .team-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--team-color);
    margin-bottom: 2px;
  }

  .player-info {
    font-size: 12px;
    color: #ebebf599;
  }

  .card-body {
    margin-bottom: 20px;
  }

  .template-name {
    font-size: 12px;
    color: #ebebf599;
    margin-bottom: 8px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .card-description {
    font-size: 13px;
    color: #ebebf5;
    line-height: 1.4;
  }

  .card-footer {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }

  .emotion-display {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  .emotion-icon {
    font-size: 16px;
  }

  .emotion-name {
    font-size: 12px;
    color: #ebebf5;
    font-weight: 500;
  }

  .quote-display {
    background: rgba(0, 0, 0, 0.5);
    padding: 12px;
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  .quote-text {
    font-size: 11px;
    color: #ffffff;
    font-style: italic;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .quote-author {
    font-size: 10px;
    color: #ebebf599;
    text-align: right;
  }

  .holographic-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    pointer-events: none;
    animation: holographicShimmer 3s ease-in-out infinite;
  }

  @keyframes holographicShimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  /* 갤러리 섹션 */
  .gallery-section {
    padding: 60px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .gallery-title {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    margin: 0 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .gallery-card {
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .gallery-card:hover {
    transform: translateY(-4px);
  }

  .gallery-card-preview {
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid var(--team-color);
    border-radius: 16px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .gallery-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .gallery-team-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--team-color);
  }

  .gallery-player {
    font-size: 11px;
    color: #ebebf599;
  }

  .gallery-card-body {
    margin-bottom: 16px;
  }

  .gallery-template {
    font-size: 10px;
    color: #ebebf599;
    margin-bottom: 6px;
  }

  .gallery-title {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
  }

  .gallery-card-footer {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .gallery-date {
    font-size: 10px;
    color: #ebebf599;
  }

  .gallery-emotion {
    font-size: 14px;
  }

  /* 기능 소개 */
  .features-section {
    padding: 80px 20px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .features-title {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    margin: 0 0 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(28, 28, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 20px;
    filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
  }

  .feature-name {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #ffffff;
  }

  .feature-description {
    font-size: 14px;
    color: #ebebf5;
    line-height: 1.6;
    margin: 0;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .demo-title {
      font-size: 32px;
      flex-direction: column;
      gap: 8px;
    }

    .demo-description {
      font-size: 16px;
    }

    .demo-stats {
      flex-direction: column;
      gap: 20px;
    }

    .view-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .view-actions {
      width: 100%;
      justify-content: stretch;
    }

    .action-button {
      flex: 1;
      justify-content: center;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .card-preview {
      padding: 20px;
    }

    .preview-card {
      width: 250px;
      height: 350px;
    }
  }
</style>