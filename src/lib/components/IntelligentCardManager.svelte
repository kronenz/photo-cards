<script lang="ts">
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { spring } from 'svelte/motion';
  
  export let cards: any[] = [];
  export let onCardsUpdate: (cards: any[]) => void = () => {};
  export let onSearchResults: (results: any[]) => void = () => {};

  // Search and filter state
  let searchQuery = '';
  let selectedTags: Set<string> = new Set();
  let sortBy = 'date'; // date, popularity, team, player, rating
  let sortOrder = 'desc'; // asc, desc
  let filterBy = {
    effectType: 'all',
    mediaFormat: 'all',
    rating: 'all',
    team: 'all',
    privacy: 'all'
  };

  // Smart collections
  let smartCollections = writable([
    { id: 'recent', name: '최근 생성', icon: '🕒', query: 'recent:7d', count: 0 },
    { id: 'popular', name: '인기 카드', icon: '🔥', query: 'likes:>10', count: 0 },
    { id: 'holographic', name: '홀로그래픽', icon: '✨', query: 'effect:holographic', count: 0 },
    { id: 'kbo', name: '카드', icon: '⚾', query: 'category:kbo', count: 0 },
    { id: 'favorites', name: '즐겨찾기', icon: '❤️', query: 'favorited:true', count: 0 },
    { id: 'untagged', name: '태그 없음', icon: '🏷️', query: 'tags:empty', count: 0 }
  ]);

  // Available tags and categories
  let availableTags: string[] = [];
  let availableTeams: string[] = ['LG 트윈스', '두산 베어스', 'KT 위즈', 'SSG 랜더스', 'NC 다이노스', 'KIA 타이거즈', '롯데 자이언츠', '한화 이글스', '삼성 라이온즈', 'kt wiz'];
  let availableEffects: string[] = ['holographic', 'rainbow', 'metallic', 'prismatic', 'chrome'];
  let availableFormats: string[] = ['image', 'video', 'audio', 'mixed'];

  // Search suggestions
  let searchSuggestions: string[] = [];
  let showSuggestions = false;

  // Animation springs
  const searchScale = spring(1, { stiffness: 0.3, damping: 0.8 });
  const filterOpacity = spring(0, { stiffness: 0.2, damping: 0.4 });

  // Processed cards store
  const processedCards = derived(
    [smartCollections],
    ([$smartCollections]) => {
      return processCards(cards);
    }
  );

  // Auto-tagging AI simulation
  function generateAutoTags(card: any): string[] {
    const tags: string[] = [];
    
    // Analyze title and description
    const text = `${card.title || ''} ${card.description || ''}`.toLowerCase();
    
    // team detection
    availableTeams.forEach(team => {
      if (text.includes(team.toLowerCase()) || text.includes(team.split(' ')[0].toLowerCase())) {
        tags.push(team);
      }
    });
    
    // Baseball terms
    const baseballTerms = ['홈런', '안타', '도루', '투수', '타자', '수비', '경기', '승리', '패배', '우승'];
    baseballTerms.forEach(term => {
      if (text.includes(term)) {
        tags.push(term);
      }
    });
    
    // Emotion detection
    const emotions = ['감동', '환희', '아쉬움', '희망', '열정', '추억'];
    emotions.forEach(emotion => {
      if (text.includes(emotion)) {
        tags.push(emotion);
      }
    });
    
    // Effect type detection
    if (card.holographicEffect) {
      tags.push('홀로그래픽');
    }
    
    // Media type detection
    if (card.hasVideo) tags.push('영상');
    if (card.hasAudio) tags.push('음성');
    if (card.hasMultipleImages) tags.push('콜라주');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Process cards with AI tagging and categorization
  function processCards(rawCards: any[]) {
    return rawCards.map(card => {
      // Auto-generate tags if not present
      if (!card.autoTags) {
        card.autoTags = generateAutoTags(card);
      }
      
      // Combine manual and auto tags
      card.allTags = [...new Set([...(card.tags || []), ...(card.autoTags || [])])];
      
      // Calculate popularity score
      card.popularityScore = calculatePopularityScore(card);
      
      // Determine category
      card.category = determineCategory(card);
      
      return card;
    });
  }

  // Calculate popularity score
  function calculatePopularityScore(card: any): number {
    const likes = card.stats?.likes || 0;
    const views = card.stats?.views || 0;
    const comments = card.stats?.comments || 0;
    const shares = card.stats?.shares || 0;
    
    // Weighted scoring
    return (likes * 3) + (views * 0.1) + (comments * 2) + (shares * 5);
  }

  // Determine card category
  function determineCategory(card: any): string {
    const tags = card.allTags || [];
    
    if (tags.some(tag => availableTeams.includes(tag))) return 'kbo';
    if (tags.includes('홀로그래픽')) return 'holographic';
    if (tags.includes('영상')) return 'video';
    if (tags.includes('음성')) return 'audio';
    if (tags.includes('콜라주')) return 'collage';
    
    return 'general';
  }

  // Search functionality
  function performSearch(query: string): any[] {
    if (!query.trim()) return cards;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return cards.filter(card => {
      const searchableText = `
        ${card.title || ''} 
        ${card.description || ''} 
        ${(card.allTags || []).join(' ')}
        ${card.category || ''}
      `.toLowerCase();
      
      return searchTerms.every(term => {
        // Handle special search operators
        if (term.startsWith('tag:')) {
          const tagName = term.substring(4);
          return (card.allTags || []).some(tag => tag.toLowerCase().includes(tagName));
        }
        
        if (term.startsWith('team:')) {
          const teamName = term.substring(5);
          return (card.allTags || []).some(tag => tag.toLowerCase().includes(teamName));
        }
        
        if (term.startsWith('effect:')) {
          const effectName = term.substring(7);
          return card.holographicEffect?.toLowerCase().includes(effectName);
        }
        
        if (term.startsWith('recent:')) {
          const days = parseInt(term.substring(7).replace('d', ''));
          const cardDate = new Date(card.createdAt);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          return cardDate > cutoffDate;
        }
        
        if (term.startsWith('likes:')) {
          const operator = term.includes('>') ? '>' : term.includes('<') ? '<' : '=';
          const value = parseInt(term.split(operator)[1]);
          const likes = card.stats?.likes || 0;
          
          if (operator === '>') return likes > value;
          if (operator === '<') return likes < value;
          return likes === value;
        }
        
        // Regular text search
        return searchableText.includes(term);
      });
    });
  }

  // Generate search suggestions
  function generateSearchSuggestions(query: string): string[] {
    if (!query.trim()) return [];
    
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Tag suggestions
    availableTags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push(`tag:${tag}`);
      }
    });
    
    // Team suggestions
    availableTeams.forEach(team => {
      if (team.toLowerCase().includes(queryLower)) {
        suggestions.push(`team:${team}`);
      }
    });
    
    // Effect suggestions
    availableEffects.forEach(effect => {
      if (effect.toLowerCase().includes(queryLower)) {
        suggestions.push(`effect:${effect}`);
      }
    });
    
    // Recent suggestions
    if ('recent'.includes(queryLower)) {
      suggestions.push('recent:7d', 'recent:30d', 'recent:90d');
    }
    
    // Popular suggestions
    if ('popular'.includes(queryLower) || 'likes'.includes(queryLower)) {
      suggestions.push('likes:>10', 'likes:>50', 'likes:>100');
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }

  // Sort cards
  function sortCards(cards: any[], sortBy: string, sortOrder: string): any[] {
    return [...cards].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'popularity':
          aValue = a.popularityScore || 0;
          bValue = b.popularityScore || 0;
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  // Filter cards
  function filterCards(cards: any[]): any[] {
    return cards.filter(card => {
      // Effect type filter
      if (filterBy.effectType !== 'all' && card.holographicEffect !== filterBy.effectType) {
        return false;
      }
      
      // Media format filter
      if (filterBy.mediaFormat !== 'all') {
        const hasVideo = card.hasVideo || false;
        const hasAudio = card.hasAudio || false;
        const hasMultipleImages = card.hasMultipleImages || false;
        
        switch (filterBy.mediaFormat) {
          case 'image':
            if (hasVideo || hasAudio) return false;
            break;
          case 'video':
            if (!hasVideo) return false;
            break;
          case 'audio':
            if (!hasAudio) return false;
            break;
          case 'mixed':
            if (!hasVideo && !hasAudio && !hasMultipleImages) return false;
            break;
        }
      }
      
      // Rating filter
      if (filterBy.rating !== 'all') {
        const rating = card.rating || 0;
        const minRating = parseInt(filterBy.rating);
        if (rating < minRating) return false;
      }
      
      // Team filter
      if (filterBy.team !== 'all') {
        const cardTags = card.allTags || [];
        if (!cardTags.includes(filterBy.team)) return false;
      }
      
      // Privacy filter
      if (filterBy.privacy !== 'all') {
        if (filterBy.privacy === 'public' && !card.isPublic) return false;
        if (filterBy.privacy === 'private' && card.isPublic) return false;
      }
      
      // Selected tags filter
      if (selectedTags.size > 0) {
        const cardTags = card.allTags || [];
        const hasAllTags = Array.from(selectedTags).every(tag => cardTags.includes(tag));
        if (!hasAllTags) return false;
      }
      
      return true;
    });
  }

  // Update smart collections count
  function updateSmartCollections() {
    smartCollections.update(collections => {
      return collections.map(collection => {
        const matchingCards = performSearch(collection.query);
        return { ...collection, count: matchingCards.length };
      });
    });
  }

  // Handle search input
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    
    // Generate suggestions
    searchSuggestions = generateSearchSuggestions(searchQuery);
    showSuggestions = searchSuggestions.length > 0 && searchQuery.length > 0;
    
    // Perform search
    const results = performSearch(searchQuery);
    const filtered = filterCards(results);
    const sorted = sortCards(filtered, sortBy, sortOrder);
    
    onSearchResults(sorted);
    searchScale.set(searchQuery ? 1.05 : 1);
  }

  // Handle suggestion click
  function handleSuggestionClick(suggestion: string) {
    searchQuery = suggestion;
    showSuggestions = false;
    handleSearchInput({ target: { value: suggestion } } as any);
  }

  // Handle tag selection
  function toggleTag(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
    selectedTags = new Set(selectedTags); // Trigger reactivity
    
    // Update results
    const results = performSearch(searchQuery);
    const filtered = filterCards(results);
    const sorted = sortCards(filtered, sortBy, sortOrder);
    
    onSearchResults(sorted);
  }

  // Handle sort change
  function handleSortChange() {
    const results = performSearch(searchQuery);
    const filtered = filterCards(results);
    const sorted = sortCards(filtered, sortBy, sortOrder);
    
    onSearchResults(sorted);
  }

  // Handle filter change
  function handleFilterChange() {
    filterOpacity.set(1);
    setTimeout(() => filterOpacity.set(0), 300);
    
    const results = performSearch(searchQuery);
    const filtered = filterCards(results);
    const sorted = sortCards(filtered, sortBy, sortOrder);
    
    onSearchResults(sorted);
  }

  // Extract all available tags from cards
  function extractAvailableTags() {
    const tagSet = new Set<string>();
    
    cards.forEach(card => {
      (card.allTags || []).forEach(tag => tagSet.add(tag));
    });
    
    availableTags = Array.from(tagSet).sort();
  }

  onMount(() => {
    // Process cards and extract tags
    cards = processCards(cards);
    extractAvailableTags();
    updateSmartCollections();
    
    // Initial search
    onSearchResults(sortCards(filterCards(cards), sortBy, sortOrder));
  });

  // Reactive statements
  $: if (cards.length) {
    cards = processCards(cards);
    extractAvailableTags();
    updateSmartCollections();
  }
</script>

<div class="intelligent-card-manager">
  <!-- Search Bar -->
  <div class="search-section">
    <div class="search-container" style="scale: {$searchScale}">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        
        <input
          type="text"
          placeholder="Search cards... (try 'tag:KBO' or 'recent:7d')"
          bind:value={searchQuery}
          on:input={handleSearchInput}
          on:focus={() => showSuggestions = searchSuggestions.length > 0}
          on:blur={() => setTimeout(() => showSuggestions = false, 200)}
          class="search-input"
        />
        
        {#if searchQuery}
          <button 
            class="clear-search"
            on:click={() => {
              searchQuery = '';
              handleSearchInput({ target: { value: '' } } as any);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>
      
      <!-- Search Suggestions -->
      {#if showSuggestions}
        <div class="search-suggestions">
          {#each searchSuggestions as suggestion}
            <button 
              class="suggestion-item"
              on:click={() => handleSuggestionClick(suggestion)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              {suggestion}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Smart Collections -->
  <div class="smart-collections">
    <h3>Smart Collections</h3>
    <div class="collections-grid">
      {#each $smartCollections as collection}
        <button 
          class="collection-item"
          on:click={() => handleSuggestionClick(collection.query)}
        >
          <span class="collection-icon">{collection.icon}</span>
          <span class="collection-name">{collection.name}</span>
          <span class="collection-count">{collection.count}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Filters and Sort -->
  <div class="controls-section" style="opacity: {1 - $filterOpacity * 0.3}">
    <!-- Sort Controls -->
    <div class="sort-controls">
      <label>Sort by:</label>
      <select bind:value={sortBy} on:change={handleSortChange}>
        <option value="date">Date</option>
        <option value="popularity">Popularity</option>
        <option value="title">Title</option>
        <option value="rating">Rating</option>
      </select>
      
      <button 
        class="sort-order"
        class:desc={sortOrder === 'desc'}
        on:click={() => {
          sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
          handleSortChange();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {#if sortOrder === 'desc'}
            <path d="M3 6h18M7 12h10m-7 6h4"/>
          {:else}
            <path d="M3 18h18M7 12h10m-4 6h4"/>
          {/if}
        </svg>
      </button>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <label>Effect:</label>
        <select bind:value={filterBy.effectType} on:change={handleFilterChange}>
          <option value="all">All Effects</option>
          {#each availableEffects as effect}
            <option value={effect}>{effect}</option>
          {/each}
        </select>
      </div>
      
      <div class="filter-group">
        <label>Format:</label>
        <select bind:value={filterBy.mediaFormat} on:change={handleFilterChange}>
          <option value="all">All Formats</option>
          <option value="image">Image Only</option>
          <option value="video">With Video</option>
          <option value="audio">With Audio</option>
          <option value="mixed">Mixed Media</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Team:</label>
        <select bind:value={filterBy.team} on:change={handleFilterChange}>
          <option value="all">All Teams</option>
          {#each availableTeams as team}
            <option value={team}>{team}</option>
          {/each}
        </select>
      </div>
      
      <div class="filter-group">
        <label>Privacy:</label>
        <select bind:value={filterBy.privacy} on:change={handleFilterChange}>
          <option value="all">All Cards</option>
          <option value="public">Public Only</option>
          <option value="private">Private Only</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Tag Cloud -->
  {#if availableTags.length > 0}
    <div class="tag-cloud">
      <h4>Filter by Tags:</h4>
      <div class="tags-container">
        {#each availableTags.slice(0, 20) as tag}
          <button 
            class="tag-chip"
            class:selected={selectedTags.has(tag)}
            on:click={() => toggleTag(tag)}
          >
            {tag}
            {#if selectedTags.has(tag)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .intelligent-card-manager {
    background: var(--bg-secondary, #1a1a1a);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .search-section {
    margin-bottom: 24px;
  }
  
  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--input-bg, #2a2a2a);
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 12px 16px;
    transition: all 0.3s ease;
  }
  
  .search-input-wrapper:focus-within {
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  }
  
  .search-icon {
    color: var(--text-secondary, rgba(255, 255, 255, 0.6));
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text-primary, #fff);
    font-size: 16px;
    font-weight: 400;
  }
  
  .search-input::placeholder {
    color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  }
  
  .clear-search {
    background: none;
    border: none;
    color: var(--text-secondary, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s ease;
  }
  
  .clear-search:hover {
    color: var(--text-primary, #fff);
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--dropdown-bg, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-top: 8px;
    padding: 8px;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }
  
  .suggestion-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: none;
    border: none;
    color: var(--text-primary, #fff);
    text-align: left;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 14px;
  }
  
  .suggestion-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .smart-collections {
    margin-bottom: 24px;
  }
  
  .smart-collections h3 {
    color: var(--text-primary, #fff);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .collection-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }
  
  .collection-item:hover {
    background: var(--card-bg-hover, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .collection-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .collection-name {
    flex: 1;
    font-weight: 500;
  }
  
  .collection-count {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-primary, #fff);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .controls-section {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .sort-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .sort-controls label {
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 14px;
    font-weight: 500;
  }
  
  .sort-controls select {
    background: var(--input-bg, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--text-primary, #fff);
    font-size: 14px;
  }
  
  .sort-order {
    background: var(--button-bg, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .sort-order:hover {
    background: var(--button-bg-hover, #3a3a3a);
  }
  
  .sort-order.desc {
    background: #007AFF;
    border-color: #007AFF;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .filter-group label {
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .filter-group select {
    background: var(--input-bg, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--text-primary, #fff);
    font-size: 14px;
    min-width: 120px;
  }

  .tag-cloud {
    margin-top: 24px;
  }
  
  .tag-cloud h4 {
    color: var(--text-primary, #fff);
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tag-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--tag-bg, rgba(255, 255, 255, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: var(--text-primary, #fff);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tag-chip:hover {
    background: var(--tag-bg-hover, rgba(255, 255, 255, 0.15));
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .tag-chip.selected {
    background: #007AFF;
    border-color: #007AFF;
    color: white;
  }
  
  .tag-chip svg {
    width: 12px;
    height: 12px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .intelligent-card-manager {
      padding: 16px;
    }
    
    .collections-grid {
      grid-template-columns: 1fr;
    }
    
    .controls-section {
      flex-direction: column;
      gap: 16px;
    }
    
    .filter-controls {
      width: 100%;
    }
    
    .filter-group select {
      min-width: 100px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .intelligent-card-manager {
      --bg-secondary: #1a1a1a;
      --input-bg: #2a2a2a;
      --dropdown-bg: #2a2a2a;
      --card-bg: rgba(255, 255, 255, 0.05);
      --card-bg-hover: rgba(255, 255, 255, 0.1);
      --button-bg: #2a2a2a;
      --button-bg-hover: #3a3a3a;
      --tag-bg: rgba(255, 255, 255, 0.1);
      --tag-bg-hover: rgba(255, 255, 255, 0.15);
      --text-primary: #fff;
      --text-secondary: rgba(255, 255, 255, 0.7);
    }
  }
</style>