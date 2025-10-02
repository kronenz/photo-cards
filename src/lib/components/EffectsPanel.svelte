<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide, fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let activeCategory = 'holographic';
  let expandedSections: Set<string> = new Set(['holographic']);

  // Effect categories
  const effectCategories = {
    holographic: {
      name: '홀로그래픽',
      icon: '✨',
      effects: [
        {
          id: 'rainbow',
          name: '레인보우',
          preview: 'linear-gradient(135deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff)',
          settings: {
            intensity: 0.8,
            speed: 1.0,
            angle: 135
          }
        },
        {
          id: 'cosmic',
          name: '코스믹',
          preview: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)',
          settings: {
            intensity: 0.7,
            speed: 0.8,
            angle: 135
          }
        },
        {
          id: 'aurora',
          name: '오로라',
          preview: 'linear-gradient(135deg, #a8edea, #fed6e3, #d299c2, #fef9d7, #85ffbd)',
          settings: {
            intensity: 0.6,
            speed: 1.2,
            angle: 135
          }
        },
        {
          id: 'neon',
          name: '네온',
          preview: 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59, #ff9a9e, #fecfef)',
          settings: {
            intensity: 0.9,
            speed: 1.5,
            angle: 135
          }
        },
        {
          id: 'gold',
          name: '골드',
          preview: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107, #ffb300, #ff8f00)',
          settings: {
            intensity: 0.8,
            speed: 0.6,
            angle: 135
          }
        },
        {
          id: 'silver',
          name: '실버',
          preview: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #b8b8b8, #d4d4d4, #f0f0f0)',
          settings: {
            intensity: 0.7,
            speed: 0.8,
            angle: 135
          }
        }
      ]
    },
    kbo: {
      name: 'KBO 팀 컬러',
      icon: '⚾',
      effects: [
        {
          id: 'lg',
          name: 'LG 트윈스',
          preview: 'linear-gradient(135deg, #c41e3a, #ff69b4)',
          settings: { teamColor: '#c41e3a', accentColor: '#ff69b4' }
        },
        {
          id: 'doosan',
          name: '두산 베어스',
          preview: 'linear-gradient(135deg, #131230, #4169e1)',
          settings: { teamColor: '#131230', accentColor: '#4169e1' }
        },
        {
          id: 'kt',
          name: 'KT 위즈',
          preview: 'linear-gradient(135deg, #000000, #ff0000)',
          settings: { teamColor: '#000000', accentColor: '#ff0000' }
        },
        {
          id: 'samsung',
          name: '삼성 라이온즈',
          preview: 'linear-gradient(135deg, #074ca1, #87ceeb)',
          settings: { teamColor: '#074ca1', accentColor: '#87ceeb' }
        },
        {
          id: 'lotte',
          name: '롯데 자이언츠',
          preview: 'linear-gradient(135deg, #041e42, #c41e3a)',
          settings: { teamColor: '#041e42', accentColor: '#c41e3a' }
        },
        {
          id: 'kia',
          name: 'KIA 타이거즈',
          preview: 'linear-gradient(135deg, #ea002c, #000000)',
          settings: { teamColor: '#ea002c', accentColor: '#000000' }
        },
        {
          id: 'nc',
          name: 'NC 다이노스',
          preview: 'linear-gradient(135deg, #315288, #c4a484)',
          settings: { teamColor: '#315288', accentColor: '#c4a484' }
        },
        {
          id: 'hanwha',
          name: '한화 이글스',
          preview: 'linear-gradient(135deg, #ff6600, #000000)',
          settings: { teamColor: '#ff6600', accentColor: '#000000' }
        },
        {
          id: 'ssg',
          name: 'SSG 랜더스',
          preview: 'linear-gradient(135deg, #ce0e2d, #ffd700)',
          settings: { teamColor: '#ce0e2d', accentColor: '#ffd700' }
        },
        {
          id: 'kiwoom',
          name: '키움 히어로즈',
          preview: 'linear-gradient(135deg, #570514, #ffd700)',
          settings: { teamColor: '#570514', accentColor: '#ffd700' }
        }
      ]
    },
    particles: {
      name: '파티클 효과',
      icon: '🎆',
      effects: [
        {
          id: 'sparkles',
          name: '반짝임',
          preview: '✨',
          settings: {
            count: 50,
            size: 3,
            speed: 1,
            color: '#ffd700',
            lifetime: 2000
          }
        },
        {
          id: 'fireworks',
          name: '불꽃',
          preview: '🎆',
          settings: {
            count: 30,
            size: 5,
            speed: 2,
            color: '#ff4500',
            lifetime: 1500
          }
        },
        {
          id: 'lightning',
          name: '번개',
          preview: '⚡',
          settings: {
            count: 10,
            size: 8,
            speed: 3,
            color: '#00bfff',
            lifetime: 500
          }
        },
        {
          id: 'snow',
          name: '눈',
          preview: '❄️',
          settings: {
            count: 100,
            size: 2,
            speed: 0.5,
            color: '#ffffff',
            lifetime: 5000
          }
        },
        {
          id: 'confetti',
          name: '색종이',
          preview: '🎊',
          settings: {
            count: 80,
            size: 4,
            speed: 1.5,
            color: 'rainbow',
            lifetime: 3000
          }
        }
      ]
    },
    filters: {
      name: '필터 효과',
      icon: '🎨',
      effects: [
        {
          id: 'blur',
          name: '블러',
          preview: 'blur(5px)',
          settings: { amount: 5 }
        },
        {
          id: 'brightness',
          name: '밝기',
          preview: 'brightness(1.2)',
          settings: { amount: 1.2 }
        },
        {
          id: 'contrast',
          name: '대비',
          preview: 'contrast(1.3)',
          settings: { amount: 1.3 }
        },
        {
          id: 'saturate',
          name: '채도',
          preview: 'saturate(1.5)',
          settings: { amount: 1.5 }
        },
        {
          id: 'hue-rotate',
          name: '색조 회전',
          preview: 'hue-rotate(90deg)',
          settings: { amount: 90 }
        },
        {
          id: 'sepia',
          name: '세피아',
          preview: 'sepia(0.8)',
          settings: { amount: 0.8 }
        },
        {
          id: 'grayscale',
          name: '흑백',
          preview: 'grayscale(1)',
          settings: { amount: 1 }
        },
        {
          id: 'invert',
          name: '반전',
          preview: 'invert(1)',
          settings: { amount: 1 }
        }
      ]
    },
    shadows: {
      name: '그림자 효과',
      icon: '🌑',
      effects: [
        {
          id: 'soft-shadow',
          name: '부드러운 그림자',
          preview: '0 4px 20px rgba(0,0,0,0.3)',
          settings: {
            x: 0,
            y: 4,
            blur: 20,
            color: 'rgba(0,0,0,0.3)'
          }
        },
        {
          id: 'hard-shadow',
          name: '날카로운 그림자',
          preview: '5px 5px 0px rgba(0,0,0,0.8)',
          settings: {
            x: 5,
            y: 5,
            blur: 0,
            color: 'rgba(0,0,0,0.8)'
          }
        },
        {
          id: 'glow',
          name: '글로우',
          preview: '0 0 20px rgba(99,102,241,0.8)',
          settings: {
            x: 0,
            y: 0,
            blur: 20,
            color: 'rgba(99,102,241,0.8)'
          }
        },
        {
          id: 'inner-shadow',
          name: '내부 그림자',
          preview: 'inset 0 2px 10px rgba(0,0,0,0.5)',
          settings: {
            x: 0,
            y: 2,
            blur: 10,
            color: 'rgba(0,0,0,0.5)',
            inset: true
          }
        }
      ]
    }
  };

  function toggleSection(sectionId: string) {
    if (expandedSections.has(sectionId)) {
      expandedSections.delete(sectionId);
    } else {
      expandedSections.add(sectionId);
    }
    expandedSections = expandedSections;
  }

  function applyEffect(effect: any, category: string) {
    dispatch('effectApplied', {
      type: category,
      effect: effect.id,
      settings: effect.settings,
      preview: effect.preview
    });
  }

  function createCustomEffect() {
    // Open custom effect creator
    dispatch('customEffectRequested');
  }
</script>

<div class="effects-panel">
  <div class="panel-header">
    <h3>효과</h3>
    <button class="custom-btn" on:click={createCustomEffect} title="커스텀 효과 만들기">
      ⚙️
    </button>
  </div>

  <div class="effects-content">
    {#each Object.entries(effectCategories) as [categoryId, category]}
      <div class="effect-category">
        <button
          class="category-header"
          class:expanded={expandedSections.has(categoryId)}
          on:click={() => toggleSection(categoryId)}
        >
          <span class="category-icon">{category.icon}</span>
          <span class="category-name">{category.name}</span>
          <span class="expand-icon">
            {expandedSections.has(categoryId) ? '▼' : '▶'}
          </span>
        </button>

        {#if expandedSections.has(categoryId)}
          <div class="effects-grid" transition:slide={{ duration: 300 }}>
            {#each category.effects as effect}
              <button
                class="effect-item"
                on:click={() => applyEffect(effect, categoryId)}
                title={effect.name}
              >
                <div
                  class="effect-preview"
                  style="background: {effect.preview}"
                ></div>
                <span class="effect-name">{effect.name}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}

    <!-- Quick Effects -->
    <div class="quick-effects">
      <h4>빠른 효과</h4>
      <div class="quick-grid">
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'pulse' })}
        >
          💓 펄스
        </button>
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'shake' })}
        >
          📳 흔들기
        </button>
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'bounce' })}
        >
          🏀 바운스
        </button>
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'rotate' })}
        >
          🔄 회전
        </button>
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'float' })}
        >
          🎈 떠오름
        </button>
        <button
          class="quick-btn"
          on:click={() => dispatch('effectApplied', { type: 'animation', effect: 'glow' })}
        >
          ✨ 글로우
        </button>
      </div>
    </div>

    <!-- Effect Presets -->
    <div class="effect-presets">
      <h4>프리셋</h4>
      <div class="preset-list">
        <button
          class="preset-item"
          on:click={() => dispatch('effectApplied', { 
            type: 'preset', 
            effect: 'kbo-champion',
            settings: {
              holographic: 'gold',
              particles: 'fireworks',
              shadow: 'glow',
              animation: 'pulse'
            }
          })}
        >
          <div class="preset-preview champion"></div>
          <span>챔피언</span>
        </button>

        <button
          class="preset-item"
          on:click={() => dispatch('effectApplied', { 
            type: 'preset', 
            effect: 'rookie-star',
            settings: {
              holographic: 'rainbow',
              particles: 'sparkles',
              shadow: 'soft-shadow',
              animation: 'float'
            }
          })}
        >
          <div class="preset-preview rookie"></div>
          <span>신인왕</span>
        </button>

        <button
          class="preset-item"
          on:click={() => dispatch('effectApplied', { 
            type: 'preset', 
            effect: 'legend',
            settings: {
              holographic: 'cosmic',
              particles: 'lightning',
              shadow: 'glow',
              animation: 'rotate'
            }
          })}
        >
          <div class="preset-preview legend"></div>
          <span>레전드</span>
        </button>

        <button
          class="preset-item"
          on:click={() => dispatch('effectApplied', { 
            type: 'preset', 
            effect: 'vintage',
            settings: {
              holographic: 'sepia',
              filter: 'sepia',
              shadow: 'inner-shadow',
              animation: 'none'
            }
          })}
        >
          <div class="preset-preview vintage"></div>
          <span>빈티지</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .effects-panel {
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

  .custom-btn {
    padding: 6px 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .custom-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .effects-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .effect-category {
    margin-bottom: 20px;
  }

  .category-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-header:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .category-header.expanded {
    background: rgba(99, 102, 241, 0.1);
    border-color: #6366f1;
  }

  .category-icon {
    font-size: 18px;
    margin-right: 12px;
  }

  .category-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
  }

  .expand-icon {
    font-size: 12px;
    color: #86868b;
    transition: transform 0.2s ease;
  }

  .category-header.expanded .expand-icon {
    transform: rotate(90deg);
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-top: 12px;
    padding: 0 4px;
  }

  .effect-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .effect-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .effect-preview {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    margin-bottom: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .effect-name {
    font-size: 11px;
    color: #ebebf5;
    text-align: center;
    line-height: 1.2;
  }

  .quick-effects, .effect-presets {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .quick-effects h4, .effect-presets h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #ebebf5;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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
    transition: all 0.2s ease;
  }

  .quick-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preset-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .preset-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .preset-preview {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preset-preview.champion {
    background: linear-gradient(135deg, #ffd700, #ffed4e, #ffc107);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .preset-preview.rookie {
    background: linear-gradient(135deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff);
    animation: rainbow-shift 3s ease-in-out infinite;
  }

  .preset-preview.legend {
    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
    box-shadow: 0 0 25px rgba(102, 126, 234, 0.6);
  }

  .preset-preview.vintage {
    background: linear-gradient(135deg, #8b7355, #a0956b, #b8a082);
    filter: sepia(0.8);
  }

  @keyframes rainbow-shift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(180deg); }
  }

  /* Scrollbar styling */
  .effects-content::-webkit-scrollbar {
    width: 6px;
  }

  .effects-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .effects-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .effects-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>