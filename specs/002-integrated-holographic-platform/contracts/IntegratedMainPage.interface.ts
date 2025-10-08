/**
 * IntegratedMainPage Component Contract
 *
 * Feature: 002-integrated-holographic-platform
 * Purpose: Unified main page layout integrating CollectionDashboard, CommunityFeed, KBOTeamsSection
 *
 * This contract defines the public API for the IntegratedMainPage component
 * that combines Phase 2 (Main Renewal) and Phase 4 (Community) layouts.
 */

import type { UnifiedCard, UnifiedUser, Collection, CommunityPost, KBOTeam } from '$lib/types/unified';

// ===== PROPS INTERFACE =====

export interface IntegratedMainPageProps {
  /**
   * Current authenticated user
   * @required
   */
  user: UnifiedUser;

  /**
   * Initial cards to display (for SSR)
   */
  initialCards?: UnifiedCard[];

  /**
   * Layout variant
   * @default 'standard'
   */
  layout?: 'standard' | 'compact' | 'kbo-focus';

  /**
   * Whether to show the KBO teams section
   * @default true
   */
  showKBOSection?: boolean;

  /**
   * Whether to show the community feed
   * @default true
   */
  showCommunityFeed?: boolean;

  /**
   * Custom CSS class for the page wrapper
   */
  class?: string;
}

// ===== EVENTS INTERFACE =====

export interface IntegratedMainPageEvents {
  /**
   * Fired when user clicks "Show Off" button
   * @param card - The card to show off
   */
  showoff: (card: UnifiedCard) => void;

  /**
   * Fired when user selects a KBO team
   * @param team - The selected team
   */
  teamselect: (team: KBOTeam) => void;

  /**
   * Fired when user clicks on a collection
   * @param collection - The clicked collection
   */
  collectionclick: (collection: Collection) => void;

  /**
   * Fired when user interacts with a community post
   * @param post - The interacted post
   * @param action - The action performed
   */
  postaction: (post: CommunityPost, action: 'like' | 'comment' | 'share') => void;

  /**
   * Fired when user scrolls to bottom (for infinite scroll)
   */
  loadmore: () => void;
}

// ===== LAYOUT SECTIONS =====

export interface MainPageSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const DEFAULT_SECTIONS: MainPageSection[] = [
  { id: 'hero', title: 'Hero Banner', visible: true, order: 1 },
  { id: 'collection-dashboard', title: 'Collection Dashboard', visible: true, order: 2 },
  { id: 'kbo-teams', title: 'KBO Teams', visible: true, order: 3 },
  { id: 'community-feed', title: 'Community Feed', visible: true, order: 4 },
  { id: 'recommendations', title: 'Recommended Cards', visible: true, order: 5 },
];

// ===== COLLECTION DASHBOARD SECTION =====

export interface CollectionDashboardConfig {
  /**
   * Number of latest cards to display
   * @default 3
   */
  latestCardsCount: number;

  /**
   * Whether to show collection progress bars
   * @default true
   */
  showProgress: boolean;

  /**
   * Whether to show stats summary
   * @default true
   */
  showStats: boolean;

  /**
   * Maximum number of collections to show
   * @default 5
   */
  maxCollections: number;
}

export const DEFAULT_DASHBOARD_CONFIG: CollectionDashboardConfig = {
  latestCardsCount: 3,
  showProgress: true,
  showStats: true,
  maxCollections: 5,
};

// ===== COMMUNITY FEED SECTION =====

export interface CommunityFeedConfig {
  /**
   * Feed layout style
   * @default 'masonry'
   */
  layout: 'masonry' | 'grid' | 'list';

  /**
   * Number of columns for masonry/grid layout
   * @default 3
   */
  columns: number;

  /**
   * Posts per page for pagination
   * @default 20
   */
  postsPerPage: number;

  /**
   * Feed filter
   * @default 'following'
   */
  filter: 'all' | 'following' | 'popular' | 'new';

  /**
   * Whether to enable infinite scroll
   * @default true
   */
  infiniteScroll: boolean;
}

export const DEFAULT_FEED_CONFIG: CommunityFeedConfig = {
  layout: 'masonry',
  columns: 3,
  postsPerPage: 20,
  filter: 'following',
  infiniteScroll: true,
};

// ===== KBO TEAMS SECTION =====

export interface KBOTeamsSectionConfig {
  /**
   * Display style for teams
   * @default 'carousel'
   */
  display: 'carousel' | 'grid' | 'list';

  /**
   * Whether to show team stats
   * @default true
   */
  showStats: boolean;

  /**
   * Whether to show today's game banner
   * @default true
   */
  showTodayGame: boolean;

  /**
   * Whether to show fan count
   * @default true
   */
  showFanCount: boolean;
}

export const DEFAULT_KBO_CONFIG: KBOTeamsSectionConfig = {
  display: 'carousel',
  showStats: true,
  showTodayGame: true,
  showFanCount: true,
};

// ===== THEME INTEGRATION =====

export interface KBOTeamTheme {
  /**
   * Team ID
   */
  teamId: string;

  /**
   * Primary color (applied to header, accents)
   */
  primaryColor: string;

  /**
   * Secondary color (applied to buttons, links)
   */
  secondaryColor?: string;

  /**
   * Background gradient
   */
  gradient?: {
    from: string;
    to: string;
  };

  /**
   * Logo URL
   */
  logo: string;

  /**
   * Mascot image URL
   */
  mascot?: string;
}

// ===== RESPONSIVE BREAKPOINTS =====

export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    maxWidth: 640,
    collectionCards: 1,
    feedColumns: 1,
    kboDisplay: 'list',
  },
  tablet: {
    maxWidth: 1024,
    collectionCards: 2,
    feedColumns: 2,
    kboDisplay: 'grid',
  },
  desktop: {
    maxWidth: 1920,
    collectionCards: 3,
    feedColumns: 3,
    kboDisplay: 'carousel',
  },
} as const;

// ===== SHOW OFF MODAL =====

export interface ShowoffModalData {
  /**
   * Card to show off
   */
  card: UnifiedCard;

  /**
   * Pre-filled caption
   */
  caption?: string;

  /**
   * Suggested tags
   */
  suggestedTags?: string[];

  /**
   * Whether to post publicly or to fanclub only
   */
  visibility: 'public' | 'fanclub' | 'followers';
}

export interface ShowoffModalResult {
  /**
   * Whether the modal was submitted or cancelled
   */
  submitted: boolean;

  /**
   * The created community post (if submitted)
   */
  post?: CommunityPost;
}

// ===== PERSONALIZATION =====

export interface PersonalizationConfig {
  /**
   * Whether to show personalized recommendations
   * @default true
   */
  enableRecommendations: boolean;

  /**
   * Whether to prioritize followed creators
   * @default true
   */
  prioritizeFollowing: boolean;

  /**
   * Whether to filter by favorite team
   * @default false
   */
  filterByTeam: boolean;

  /**
   * Whether to show "Welcome Back" section for returning users
   * @default true
   */
  showWelcomeBack: boolean;
}

export const DEFAULT_PERSONALIZATION: PersonalizationConfig = {
  enableRecommendations: true,
  prioritizeFollowing: true,
  filterByTeam: false,
  showWelcomeBack: true,
};

// ===== COMPONENT USAGE EXAMPLE =====

/**
 * Example usage in a Svelte route:
 *
 * ```svelte
 * <script lang="ts">
 *   import IntegratedMainPage from '$lib/components/unified/IntegratedMainPage.svelte';
 *   import type { UnifiedUser, UnifiedCard } from '$lib/types/unified';
 *
 *   export let data: { user: UnifiedUser; cards: UnifiedCard[] };
 *
 *   function handleShowoff(card: UnifiedCard) {
 *     // Open showoff modal
 *   }
 *
 *   function handleTeamSelect(team: KBOTeam) {
 *     // Apply team theme
 *   }
 *
 *   function handleLoadMore() {
 *     // Fetch more posts
 *   }
 * </script>
 *
 * <IntegratedMainPage
 *   user={data.user}
 *   initialCards={data.cards}
 *   layout="standard"
 *   on:showoff={handleShowoff}
 *   on:teamselect={handleTeamSelect}
 *   on:loadmore={handleLoadMore}
 * />
 * ```
 */

// ===== ACCESSIBILITY REQUIREMENTS =====

export const ACCESSIBILITY_REQUIREMENTS = {
  /**
   * Keyboard navigation
   */
  keyboardNavigation: {
    tab: 'Navigate between sections',
    enter: 'Activate focused element',
    arrow: 'Navigate within carousels/grids',
    home: 'Go to page top',
    end: 'Go to page bottom',
  },

  /**
   * ARIA landmarks
   */
  landmarks: {
    header: 'banner',
    nav: 'navigation',
    main: 'main',
    aside: 'complementary',
    footer: 'contentinfo',
  },

  /**
   * Skip links
   */
  skipLinks: [
    { href: '#collection-dashboard', label: 'Skip to collection dashboard' },
    { href: '#kbo-teams', label: 'Skip to KBO teams' },
    { href: '#community-feed', label: 'Skip to community feed' },
  ],

  /**
   * Screen reader announcements
   */
  announcements: {
    themeChange: 'Theme changed to [team name]',
    newPosts: '[count] new posts loaded',
    collectionComplete: 'Collection [name] completed!',
    levelUp: 'Fan level increased to [level name]',
  },
} as const;

// ===== PERFORMANCE REQUIREMENTS =====

export const PERFORMANCE_REQUIREMENTS = {
  /**
   * Target Time to Interactive (TTI)
   */
  targetTTI: 3000, // ms

  /**
   * Target First Contentful Paint (FCP)
   */
  targetFCP: 1500, // ms

  /**
   * Maximum cards to render before virtual scrolling kicks in
   */
  maxCardsBeforeVirtualScroll: 100,

  /**
   * Debounce delay for infinite scroll trigger
   */
  infiniteScrollDebounce: 200, // ms

  /**
   * Image lazy loading threshold
   */
  lazyLoadThreshold: '200px',

  /**
   * Target Lighthouse Performance score
   */
  targetLighthouseScore: 90,
} as const;

// ===== STATE SYNCHRONIZATION =====

export interface MainPageState {
  /**
   * Currently selected KBO team (for theme)
   */
  selectedTeam: KBOTeam | null;

  /**
   * Active community feed filter
   */
  feedFilter: CommunityFeedConfig['filter'];

  /**
   * Collections with unread updates
   */
  unreadCollections: string[];

  /**
   * Whether showoff modal is open
   */
  showoffModalOpen: boolean;

  /**
   * Scroll position (for restoration on navigation)
   */
  scrollPosition: number;

  /**
   * Loading state for infinite scroll
   */
  loadingMore: boolean;
}

// ===== ERROR HANDLING =====

export interface MainPageError {
  code: 'LOAD_FAILED' | 'TEAM_SELECT_FAILED' | 'POST_FAILED';
  message: string;
  section: 'collection' | 'kbo' | 'community' | 'recommendations';
}

export interface IntegratedMainPageErrorEvent {
  error: (error: MainPageError) => void;
}
