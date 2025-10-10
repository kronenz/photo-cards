# 컴포넌트 아키텍처 가이드

## 📋 개요

이 문서는 홀로그래픽 카드 커뮤니티 프로젝트의 컴포넌트 아키텍처와 설계 원칙에 대한 상세한 가이드입니다.

## 🏗️ 컴포넌트 계층 구조

```
src/lib/components/
├── unified/                    # 통합 컴포넌트
│   ├── UnifiedHolographicCard.svelte
│   ├── ShowoffModal.svelte
│   ├── CardEditor.svelte
│   └── UserProfile.svelte
├── marketplace/                # 마켓플레이스 컴포넌트
│   ├── TemplateDetailModal.svelte
│   ├── TemplateFilters.svelte
│   ├── RatingStats.svelte
│   ├── RecommendedTemplates.svelte
│   └── TrendingTemplates.svelte
├── holographic/               # 홀로그래픽 효과 컴포넌트
│   ├── HolographicEffect.svelte
│   ├── CardRenderer.svelte
│   ├── EffectControls.svelte
│   └── AnimationPreview.svelte
├── community/                 # 커뮤니티 컴포넌트
│   ├── PostCard.svelte
│   ├── CommentSection.svelte
│   ├── LikeButton.svelte
│   └── ShareButton.svelte
├── ui/                       # 기본 UI 컴포넌트
│   ├── Button.svelte
│   ├── Modal.svelte
│   ├── Input.svelte
│   ├── Card.svelte
│   └── LoadingSpinner.svelte
└── layout/                   # 레이아웃 컴포넌트
    ├── Header.svelte
    ├── Footer.svelte
    ├── Sidebar.svelte
    └── Navigation.svelte
```

## 🎯 컴포넌트 설계 원칙

### 1. 단일 책임 원칙 (SRP)
각 컴포넌트는 하나의 명확한 책임을 가져야 합니다.

```svelte
<!-- ✅ 좋은 예: 단일 책임 -->
<!-- Button.svelte -->
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
</script>

<button 
  class="btn btn-{variant} btn-{size}" 
  {disabled}
  on:click
>
  <slot />
</button>
```

```svelte
<!-- ❌ 나쁜 예: 여러 책임 -->
<!-- BadComponent.svelte -->
<script lang="ts">
  // 버튼 로직
  export let variant: string;
  // 모달 로직
  export let isOpen: boolean;
  // 폼 로직
  export let formData: any;
</script>
```

### 2. 재사용성 (Reusability)
컴포넌트는 다양한 상황에서 재사용 가능해야 합니다.

```svelte
<!-- Card.svelte - 재사용 가능한 카드 컴포넌트 -->
<script lang="ts">
  export let title: string;
  export let description?: string;
  export let image?: string;
  export let variant: 'default' | 'compact' | 'detailed' = 'default';
  export let clickable: boolean = false;
</script>

<div 
  class="card card-{variant}" 
  class:clickable
  on:click
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
>
  {#if image}
    <img src={image} alt={title} class="card-image" />
  {/if}
  
  <div class="card-content">
    <h3 class="card-title">{title}</h3>
    {#if description}
      <p class="card-description">{description}</p>
    {/if}
    <slot />
  </div>
</div>
```

### 3. Props 인터페이스 정의
TypeScript를 사용하여 명확한 Props 인터페이스를 정의합니다.

```typescript
// types/component.ts
export interface CardProps {
  title: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'compact' | 'detailed';
  clickable?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export interface HolographicCardProps extends CardProps {
  holographicImage: string;
  holographicEffect: 'overlay' | 'soft-light' | 'hard-light';
  holographicIntensity: number;
  animationDuration: number;
}
```

### 4. 이벤트 처리
컴포넌트 간 통신을 위한 이벤트 시스템을 사용합니다.

```svelte
<!-- ParentComponent.svelte -->
<script lang="ts">
  import ChildComponent from './ChildComponent.svelte';
  
  function handleChildEvent(event: CustomEvent) {
    console.log('Child event received:', event.detail);
  }
</script>

<ChildComponent on:custom-event={handleChildEvent} />
```

```svelte
<!-- ChildComponent.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('custom-event', {
      message: 'Hello from child!',
      timestamp: Date.now()
    });
  }
</script>

<button on:click={handleClick}>Click me</button>
```

## 🎨 스타일링 전략

### 1. CSS 모듈화
컴포넌트별로 독립적인 CSS를 작성합니다.

```svelte
<!-- HolographicCard.svelte -->
<script lang="ts">
  // 컴포넌트 로직
</script>

<div class="holographic-card">
  <div class="card-content">
    <!-- 카드 내용 -->
  </div>
</div>

<style>
  .holographic-card {
    position: relative;
    width: 300px;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card-content {
    position: relative;
    z-index: 2;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
```

### 2. CSS 변수 활용
테마와 커스터마이징을 위한 CSS 변수를 사용합니다.

```css
/* globals.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 다크 테마 */
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --secondary-color: #94a3b8;
  --background-color: #1e293b;
  --text-color: #f1f5f9;
}
```

### 3. Tailwind CSS 클래스
유틸리티 클래스를 활용한 빠른 스타일링

```svelte
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold text-gray-900">{title}</h3>
  <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
    Action
  </button>
</div>
```

## 🔄 상태 관리

### 1. 컴포넌트 내부 상태
간단한 상태는 컴포넌트 내부에서 관리합니다.

```svelte
<script lang="ts">
  let isOpen = false;
  let isLoading = false;
  let data: any[] = [];
  
  async function loadData() {
    isLoading = true;
    try {
      data = await fetchData();
    } finally {
      isLoading = false;
    }
  }
</script>
```

### 2. 전역 상태 관리
복잡한 상태는 Svelte store를 사용합니다.

```typescript
// stores/user.ts
import { writable } from 'svelte/store';
import type { User } from '$lib/types/user';

export const user = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);

// stores/cards.ts
import { writable, derived } from 'svelte/store';
import type { UnifiedCard } from '$lib/types/card';

export const cards = writable<UnifiedCard[]>([]);
export const selectedCard = writable<UnifiedCard | null>(null);

export const publicCards = derived(
  cards,
  $cards => $cards.filter(card => card.community_is_public)
);
```

### 3. 컨텍스트 API
깊은 컴포넌트 트리에서 상태를 공유합니다.

```svelte
<!-- CardContext.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { UnifiedCard } from '$lib/types/card';
  
  export let card: UnifiedCard;
  export let onUpdate: (updatedCard: UnifiedCard) => void;
  
  setContext('card', {
    card,
    onUpdate
  });
</script>

<slot />
```

```svelte
<!-- CardEditor.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  
  const { card, onUpdate } = getContext('card');
  
  function handleSave() {
    onUpdate(card);
  }
</script>
```

## 🧪 테스트 전략

### 1. 컴포넌트 단위 테스트
```typescript
// tests/components/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
  it('renders with correct text', () => {
    const { getByRole } = render(Button, {
      props: { children: 'Click me' }
    });
    
    expect(getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      props: { onClick: handleClick }
    });
    
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 2. 통합 테스트
```typescript
// tests/integration/CardEditor.test.ts
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import CardEditor from '$lib/components/unified/CardEditor.svelte';

describe('CardEditor', () => {
  it('saves card when form is submitted', async () => {
    const mockCard = {
      id: '1',
      title: 'Test Card',
      // ... other properties
    };
    
    const { getByLabelText, getByRole } = render(CardEditor, {
      props: { card: mockCard }
    });
    
    const titleInput = getByLabelText('Title');
    fireEvent.input(titleInput, { target: { value: 'Updated Title' } });
    
    const saveButton = getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      // Assert save was called
    });
  });
});
```

## 📱 반응형 디자인

### 1. 브레이크포인트 정의
```css
/* breakpoints.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}
```

### 2. 반응형 컴포넌트
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let windowWidth = 0;
  
  onMount(() => {
    const updateWidth = () => {
      windowWidth = window.innerWidth;
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  });
  
  $: isMobile = windowWidth < 768;
  $: isTablet = windowWidth >= 768 && windowWidth < 1024;
  $: isDesktop = windowWidth >= 1024;
</script>

<div class="card-grid" class:mobile={isMobile} class:tablet={isTablet} class:desktop={isDesktop}>
  <slot />
</div>

<style>
  .card-grid {
    display: grid;
    gap: 1rem;
  }
  
  .mobile {
    grid-template-columns: 1fr;
  }
  
  .tablet {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .desktop {
    grid-template-columns: repeat(3, 1fr);
  }
</style>
```

## ♿ 접근성 (A11y)

### 1. 시맨틱 HTML
```svelte
<article class="card" role="article">
  <header class="card-header">
    <h2 class="card-title">{title}</h2>
  </header>
  
  <main class="card-content">
    <p class="card-description">{description}</p>
  </main>
  
  <footer class="card-footer">
    <button 
      class="card-action"
      aria-label="Save card"
      on:click={handleSave}
    >
      Save
    </button>
  </footer>
</article>
```

### 2. 키보드 네비게이션
```svelte
<script lang="ts">
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<button 
  on:click={handleClick}
  on:keydown={handleKeydown}
  tabindex="0"
>
  Click me
</button>
```

### 3. ARIA 속성
```svelte
<div 
  class="modal" 
  role="dialog" 
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

## 🔧 성능 최적화

### 1. 지연 로딩
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let isVisible = false;
  let element: HTMLElement;
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  });
</script>

<div bind:this={element}>
  {#if isVisible}
    <slot />
  {:else}
    <div class="loading-placeholder">Loading...</div>
  {/if}
</div>
```

### 2. 메모이제이션
```svelte
<script lang="ts">
  import { derived } from 'svelte/store';
  
  export let items: any[];
  export let filter: string;
  
  $: filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  // 복잡한 계산이 필요한 경우
  $: expensiveCalculation = items.reduce((acc, item) => {
    // 복잡한 계산 로직
    return acc + item.value;
  }, 0);
</script>
```

### 3. 가상화
```svelte
<script lang="ts">
  import { VirtualList } from 'svelte-virtual-list';
  
  export let items: any[];
  export let itemHeight = 50;
  export let containerHeight = 400;
</script>

<VirtualList
  {items}
  {itemHeight}
  {containerHeight}
  let:item
  let:index
>
  <div class="list-item">
    {item.name} - {index}
  </div>
</VirtualList>
```

## 📚 컴포넌트 문서화

### 1. JSDoc 주석
```svelte
<script lang="ts">
  /**
   * 홀로그래픽 카드 컴포넌트
   * 
   * @param title - 카드 제목
   * @param holographicImage - 홀로그래픽 이미지 URL
   * @param holographicEffect - 홀로그래픽 효과 타입
   * @param holographicIntensity - 홀로그래픽 강도 (0-100)
   * @param onClick - 클릭 이벤트 핸들러
   */
  export let title: string;
  export let holographicImage: string;
  export let holographicEffect: 'overlay' | 'soft-light' | 'hard-light' = 'overlay';
  export let holographicIntensity: number = 50;
  export let onClick: (event: MouseEvent) => void;
</script>
```

### 2. Storybook 스토리
```typescript
// stories/HolographicCard.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import HolographicCard from '$lib/components/unified/HolographicCard.svelte';

const meta: Meta<HolographicCard> = {
  title: 'Components/HolographicCard',
  component: HolographicCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    holographicIntensity: {
      control: { type: 'range', min: 0, max: 100 }
    },
    holographicEffect: {
      control: { type: 'select' },
      options: ['overlay', 'soft-light', 'hard-light']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Sample Card',
    holographicImage: '/images/sample.jpg',
    holographicEffect: 'overlay',
    holographicIntensity: 75
  }
};
```

---

이 컴포넌트 아키텍처 가이드를 통해 일관성 있고 유지보수 가능한 컴포넌트를 개발할 수 있습니다. 추가 질문이나 특정 컴포넌트에 대한 상세한 설명이 필요한 경우 언제든지 문의해주세요.
