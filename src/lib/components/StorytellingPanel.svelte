<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide, fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let activeCategory = 'moments';
  let selectedStory: any = null;
  let customStoryText = '';
  let selectedEmotion = 'joy';

  // KBO 스토리텔링 카테고리
  const storyCategories = {
    moments: {
      name: '영광의 순간',
      icon: '🏆',
      stories: [
        {
          id: 'homerun',
          title: '홈런의 순간',
          description: '공이 담장을 넘어가는 그 순간의 감동',
          template: '"{player}의 시원한 홈런! 공이 {direction} 담장을 넘어갑니다!"',
          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
          icon: '⚾'
        },
        {
          id: 'steal',
          title: '도루 성공',
          description: '완벽한 타이밍의 도루 성공',
          template: '"{player}의 번개같은 도루! {base}를 안전하게 훔쳤습니다!"',
          background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
          icon: '🏃'
        },
        {
          id: 'defense',
          title: '수비 명장면',
          description: '환상적인 수비 플레이',
          template: '"{player}의 신기에 가까운 수비! 관중들이 탄성을 지릅니다!"',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          icon: '🤾'
        },
        {
          id: 'walkoff',
          title: '끝내기 안타',
          description: '경기를 결정짓는 마지막 한 방',
          template: '"{player}의 끝내기 안타! {team}이 극적인 승리를 거둡니다!"',
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          icon: '🎯'
        },
        {
          id: 'perfectgame',
          title: '완전경기',
          description: '역사에 남을 완벽한 경기',
          template: '"{player}의 완전경기 달성! KBO 역사에 길이 남을 순간입니다!"',
          background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
          icon: '👑'
        }
      ]
    },
    emotions: {
      name: '감정 표현',
      icon: '💭',
      stories: [
        {
          id: 'joy',
          title: '기쁨과 환희',
          description: '승리의 기쁨을 표현',
          template: '"이 순간을 위해 얼마나 기다렸는지... 꿈만 같습니다!"',
          background: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
          icon: '😊'
        },
        {
          id: 'determination',
          title: '의지와 각오',
          description: '강한 의지를 보여주는 순간',
          template: '"포기하지 않겠습니다. 끝까지 최선을 다하겠습니다!"',
          background: 'linear-gradient(135deg, #fd79a8, #e84393)',
          icon: '💪'
        },
        {
          id: 'gratitude',
          title: '감사와 겸손',
          description: '팬들과 동료들에 대한 감사',
          template: '"팬 여러분의 응원이 있었기에 가능했습니다. 감사합니다!"',
          background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
          icon: '🙏'
        },
        {
          id: 'nostalgia',
          title: '추억과 그리움',
          description: '과거를 회상하는 감성',
          template: '"그때 그 순간이 생각납니다... 시간이 참 빠르네요."',
          background: 'linear-gradient(135deg, #81ecec, #74b9ff)',
          icon: '🌅'
        }
      ]
    },
    quotes: {
      name: '명언과 어록',
      icon: '💬',
      stories: [
        {
          id: 'legendary',
          title: '레전드 어록',
          description: 'KBO 역사에 남은 명언들',
          template: '"야구는 실패의 스포츠다. 하지만 포기하지 않는 자가 승리한다."',
          background: 'linear-gradient(135deg, #2d3436, #636e72)',
          icon: '🎭'
        },
        {
          id: 'motivation',
          title: '동기부여',
          description: '힘이 되는 격려의 말',
          template: '"오늘의 노력이 내일의 기적을 만든다."',
          background: 'linear-gradient(135deg, #00b894, #00cec9)',
          icon: '🔥'
        },
        {
          id: 'teamwork',
          title: '팀워크',
          description: '함께하는 힘에 대한 이야기',
          template: '"혼자서는 할 수 없지만, 함께라면 무엇이든 가능하다."',
          background: 'linear-gradient(135deg, #e17055, #d63031)',
          icon: '🤝'
        }
      ]
    },
    history: {
      name: '역사적 순간',
      icon: '📚',
      stories: [
        {
          id: 'debut',
          title: '데뷔 첫 경기',
          description: '프로 무대 첫 발을 내딛는 순간',
          template: '"{year}년 {month}월 {day}일, {player}의 KBO 데뷔전"',
          background: 'linear-gradient(135deg, #55a3ff, #003d82)',
          icon: '🌟'
        },
        {
          id: 'record',
          title: '기록 달성',
          description: '새로운 기록을 세우는 역사적 순간',
          template: '"{player}, KBO 역사상 {number}번째 {record} 달성!"',
          background: 'linear-gradient(135deg, #ffd700, #ffb300)',
          icon: '📊'
        },
        {
          id: 'retirement',
          title: '은퇴식',
          description: '선수 생활을 마무리하는 감동의 순간',
          template: '"{player}의 {years}년 선수 생활이 막을 내립니다..."',
          background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
          icon: '👋'
        },
        {
          id: 'championship',
          title: '우승의 순간',
          description: '팀의 영광스러운 우승',
          template: '"{team}, {year}년 한국시리즈 우승! 역사를 만들었습니다!"',
          background: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
          icon: '🏆'
        }
      ]
    }
  };

  // 감정 아이콘 매핑
  const emotionIcons = {
    joy: '😊',
    excitement: '🤩',
    determination: '💪',
    gratitude: '🙏',
    nostalgia: '🌅',
    pride: '😤',
    hope: '🌟',
    sadness: '😢'
  };

  function selectStory(story: any) {
    selectedStory = story;
    dispatch('storySelected', story);
  }

  function addStoryElement() {
    if (!selectedStory) return;

    const storyElement = {
      type: 'text',
      width: 300,
      height: 80,
      data: {
        content: selectedStory.template,
        fontSize: 18,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffffff',
        fontWeight: '500',
        textAlign: 'center',
        background: selectedStory.background,
        padding: 16,
        borderRadius: 12,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }
    };

    dispatch('storyElementAdded', storyElement);
  }

  function addCustomStory() {
    if (!customStoryText.trim()) return;

    const customElement = {
      type: 'text',
      width: 280,
      height: 60,
      data: {
        content: customStoryText,
        fontSize: 16,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffffff',
        fontWeight: '400',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.7)',
        padding: 12,
        borderRadius: 8
      }
    };

    dispatch('storyElementAdded', customElement);
    customStoryText = '';
  }

  function addEmotionOverlay() {
    const emotionElement = {
      type: 'text',
      width: 60,
      height: 60,
      data: {
        content: emotionIcons[selectedEmotion],
        fontSize: 48,
        fontFamily: 'Apple Color Emoji',
        color: '#ffffff',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
        animation: 'pulse 1.5s ease-in-out infinite'
      }
    };

    dispatch('storyElementAdded', emotionElement);
  }

  function addDateStamp() {
    const today = new Date();
    const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    
    const dateElement = {
      type: 'text',
      width: 120,
      height: 30,
      data: {
        content: dateString,
        fontSize: 14,
        fontFamily: 'SF Mono',
        color: '#86868b',
        fontWeight: '400',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: 6,
        borderRadius: 4
      }
    };

    dispatch('storyElementAdded', dateElement);
  }

  function addPlayerNameplate() {
    const nameplateElement = {
      type: 'text',
      width: 200,
      height: 40,
      data: {
        content: '선수명',
        fontSize: 20,
        fontFamily: 'Apple SD Gothic Neo',
        color: '#ffffff',
        fontWeight: '700',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: 8,
        borderRadius: 20,
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
      }
    };

    dispatch('storyElementAdded', nameplateElement);
  }
</script>

<div class="storytelling-panel">
  <div class="panel-header">
    <h3>스토리텔링</h3>
    <div class="quick-actions">
      <button class="quick-btn" on:click={addDateStamp} title="날짜 추가">
        📅
      </button>
      <button class="quick-btn" on:click={addPlayerNameplate} title="선수명 추가">
        👤
      </button>
      <button class="quick-btn" on:click={addEmotionOverlay} title="감정 표현 추가">
        😊
      </button>
    </div>
  </div>

  <div class="panel-content">
    <!-- Category Navigation -->
    <div class="category-nav">
      {#each Object.entries(storyCategories) as [categoryId, category]}
        <button
          class="category-btn"
          class:active={activeCategory === categoryId}
          on:click={() => activeCategory = categoryId}
        >
          <span class="category-icon">{category.icon}</span>
          <span class="category-name">{category.name}</span>
        </button>
      {/each}
    </div>

    <!-- Story Templates -->
    <div class="story-templates">
      {#each storyCategories[activeCategory].stories as story}
        <div
          class="story-card"
          class:selected={selectedStory?.id === story.id}
          on:click={() => selectStory(story)}
        >
          <div class="story-preview" style="background: {story.background}">
            <span class="story-icon">{story.icon}</span>
          </div>
          <div class="story-info">
            <h4>{story.title}</h4>
            <p>{story.description}</p>
            <div class="story-template">
              "{story.template.substring(0, 50)}..."
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Selected Story Details -->
    {#if selectedStory}
      <div class="selected-story" transition:slide={{ duration: 300 }}>
        <h4>선택된 스토리</h4>
        <div class="story-detail">
          <div class="story-preview-large" style="background: {selectedStory.background}">
            <span class="story-icon-large">{selectedStory.icon}</span>
          </div>
          <div class="story-content">
            <h5>{selectedStory.title}</h5>
            <p class="story-description">{selectedStory.description}</p>
            <div class="story-template-full">
              {selectedStory.template}
            </div>
            <button class="add-story-btn" on:click={addStoryElement}>
              ➕ 카드에 추가
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Custom Story Input -->
    <div class="custom-story">
      <h4>커스텀 스토리</h4>
      <textarea
        bind:value={customStoryText}
        placeholder="나만의 스토리를 입력하세요..."
        rows="3"
      ></textarea>
      <button
        class="add-custom-btn"
        disabled={!customStoryText.trim()}
        on:click={addCustomStory}
      >
        커스텀 스토리 추가
      </button>
    </div>

    <!-- Emotion Selector -->
    <div class="emotion-selector">
      <h4>감정 표현</h4>
      <div class="emotion-grid">
        {#each Object.entries(emotionIcons) as [emotion, icon]}
          {@const typedEmotion = emotion}
          <button
            class="emotion-btn"
            class:selected={selectedEmotion === emotion}
            on:click={() => selectedEmotion = emotion}
            title={typedEmotion}
          >
            {icon}
          </button>
        {/each}
      </div>
      <button class="add-emotion-btn" on:click={addEmotionOverlay}>
        감정 아이콘 추가
      </button>
    </div>

    <!-- Story Elements Library -->
    <div class="story-elements">
      <h4>스토리 요소</h4>
      <div class="elements-grid">
        <button class="element-btn" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 150,
          height: 30,
          data: {
            content: '⚾ KBO 리그',
            fontSize: 16,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '600',
            textAlign: 'center',
            background: 'rgba(99, 102, 241, 0.8)',
            padding: 8,
            borderRadius: 15
          }
        })}>
          🏟️ 리그 배지
        </button>

        <button class="element-btn" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 100,
          height: 25,
          data: {
            content: '2024 시즌',
            fontSize: 14,
            fontFamily: 'SF Mono',
            color: '#ffd700',
            fontWeight: '500',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            padding: 4,
            borderRadius: 4
          }
        })}>
          📅 시즌 태그
        </button>

        <button class="element-btn" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 80,
          height: 80,
          data: {
            content: '★',
            fontSize: 60,
            fontFamily: 'Apple Color Emoji',
            color: '#ffd700',
            textAlign: 'center',
            textShadow: '0 0 20px #ffd700',
            animation: 'glow 2s ease-in-out infinite alternate'
          }
        })}>
          ⭐ 스타 마크
        </button>

        <button class="element-btn" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 200,
          height: 40,
          data: {
            content: '🏆 CHAMPION 🏆',
            fontSize: 18,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            padding: 10,
            borderRadius: 20,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }
        })}>
          🏆 챔피언 배너
        </button>
      </div>
    </div>

    <!-- Story Templates by Team -->
    <div class="team-stories">
      <h4>구단별 스토리</h4>
      <div class="team-grid">
        <button class="team-btn lg" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 180,
          height: 35,
          data: {
            content: 'LG TWINS',
            fontSize: 16,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #c41e3a, #ff69b4)',
            padding: 8,
            borderRadius: 8
          }
        })}>
          LG 트윈스
        </button>

        <button class="team-btn doosan" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 180,
          height: 35,
          data: {
            content: 'DOOSAN BEARS',
            fontSize: 16,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #131230, #4169e1)',
            padding: 8,
            borderRadius: 8
          }
        })}>
          두산 베어스
        </button>

        <button class="team-btn kt" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 180,
          height: 35,
          data: {
            content: 'KT WIZ',
            fontSize: 16,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #000000, #ff0000)',
            padding: 8,
            borderRadius: 8
          }
        })}>
          KT 위즈
        </button>

        <button class="team-btn samsung" on:click={() => dispatch('storyElementAdded', {
          type: 'text',
          width: 180,
          height: 35,
          data: {
            content: 'SAMSUNG LIONS',
            fontSize: 16,
            fontFamily: 'Apple SD Gothic Neo',
            color: '#ffffff',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #074ca1, #87ceeb)',
            padding: 8,
            borderRadius: 8
          }
        })}>
          삼성 라이온즈
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .storytelling-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(28, 28, 30, 0.95);
    color: #ffffff;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .quick-actions {
    display: flex;
    gap: 4px;
  }

  .quick-btn {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .quick-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .category-nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }

  .category-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .category-btn.active {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
  }

  .category-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .category-name {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
  }

  .story-templates {
    margin-bottom: 24px;
  }

  .story-card {
    display: flex;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .story-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .story-card.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
  }

  .story-preview {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .story-icon {
    font-size: 20px;
  }

  .story-info {
    flex: 1;
    min-width: 0;
  }

  .story-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .story-info p {
    margin: 0 0 6px 0;
    font-size: 12px;
    color: #86868b;
    line-height: 1.3;
  }

  .story-template {
    font-size: 11px;
    color: #ebebf5;
    font-style: italic;
    opacity: 0.8;
  }

  .selected-story {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .selected-story h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #6366f1;
  }

  .story-detail {
    display: flex;
    gap: 12px;
  }

  .story-preview-large {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .story-icon-large {
    font-size: 30px;
  }

  .story-content {
    flex: 1;
  }

  .story-content h5 {
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .story-description {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #ebebf5;
  }

  .story-template-full {
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    color: #ffffff;
    font-style: italic;
    margin-bottom: 12px;
  }

  .add-story-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .add-story-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .custom-story,
  .emotion-selector,
  .story-elements,
  .team-stories {
    margin-bottom: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .custom-story h4,
  .emotion-selector h4,
  .story-elements h4,
  .team-stories h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #ebebf5;
  }

  .custom-story textarea {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 8px;
  }

  .custom-story textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .add-custom-btn,
  .add-emotion-btn {
    width: 100%;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .add-custom-btn:hover,
  .add-emotion-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .add-custom-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .emotion-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .emotion-btn {
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    font-size: 24px;
    transition: all 0.2s ease;
  }

  .emotion-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  .emotion-btn.selected {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }

  .elements-grid,
  .team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .element-btn,
  .team-btn {
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .element-btn:hover,
  .team-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .team-btn.lg { border-left: 4px solid #c41e3a; }
  .team-btn.doosan { border-left: 4px solid #131230; }
  .team-btn.kt { border-left: 4px solid #ff0000; }
  .team-btn.samsung { border-left: 4px solid #074ca1; }

  /* Scrollbar styling */
  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>