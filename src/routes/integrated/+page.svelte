<script lang="ts">
  import IntegratedMainPage from '$lib/components/unified/IntegratedMainPage.svelte';
  import type { UnifiedUser, UnifiedCard } from '$lib/types/unified';

  // Mock user data
  const mockUser: UnifiedUser = {
    id: 'user-001',
    username: 'KBO팬2024',
    email: 'fan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KBO팬2024',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
    fanProfile: {
      fanLevel: { level: 3, name: '응원단 멤버' },
      currentPoints: 1250,
      favoriteTeam: 'team-lg-twins',
      achievedBadges: ['badge-first-card', 'badge-100-cards'],
      joinedFanclubs: ['team-lg-twins']
    },
    creatorProfile: {
      creatorLevel: 'gold',
      stats: {
        totalCards: 78,
        totalLikes: 3421,
        totalDownloads: 892,
        averageRating: 4.6,
        followers: 234,
        following: 156
      },
      isVerified: true,
      specializations: ['KBO', 'Custom Design']
    },
    collections: {
      owned: ['card-001', 'card-002', 'card-003'],
      collectionProgress: [
        { collectionId: 'col-kbo-2024', totalCards: 30, ownedCards: 15, progress: 50 },
        { collectionId: 'col-lg-twins', totalCards: 20, ownedCards: 20, progress: 100 }
      ],
      totalCards: 78,
      rareCards: 12
    },
    preferences: {
      theme: 'kbo-team',
      teamThemeColor: '#7B2D7F',
      notifications: {
        newFollower: true,
        cardLike: true,
        cardComment: true,
        levelUp: true
      },
      privacy: {
        showCollections: true,
        showActivity: true
      }
    }
  };

  // Mock cards data
  const mockCards: UnifiedCard[] = [
    {
      id: 'card-001',
      title: 'LG 트윈스 - 오지환',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
      holographic: {
        image: 'https://picsum.photos/400/560?random=1',
        backImage: 'https://picsum.photos/400/560?random=10',
        effect: 'soft-light',
        intensity: 80,
        isFlipped: false,
        animationDuration: 600
      },
      photocard: {
        rarity: 'epic',
        stats: {
          totalViews: 1523,
          uniqueCollectors: 342,
          completionRate: 12.5
        },
        collections: ['col-kbo-2024', 'col-lg-twins'],
        acquiredAt: new Date('2024-03-20')
      },
      community: {
        creator: 'user-001',
        isPublic: true,
        tags: ['LG트윈스', '오지환', '2024시즌', 'KBO'],
        template: 'template-kbo-player',
        metadata: {
          likes: 234,
          downloads: 89,
          rating: 4.7,
          ratingCount: 56
        }
      },
      context: 'main'
    },
    {
      id: 'card-002',
      title: '삼성 라이온즈 - 구자욱',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
      holographic: {
        image: 'https://picsum.photos/400/560?random=2',
        backImage: 'https://picsum.photos/400/560?random=11',
        effect: 'overlay',
        intensity: 75,
        isFlipped: false,
        animationDuration: 600
      },
      photocard: {
        rarity: 'legendary',
        stats: {
          totalViews: 2834,
          uniqueCollectors: 521,
          completionRate: 18.3
        },
        collections: ['col-kbo-2024'],
        acquiredAt: new Date('2024-03-18')
      },
      community: {
        creator: 'user-001',
        isPublic: true,
        tags: ['삼성라이온즈', '구자욱', '골든글러브'],
        metadata: {
          likes: 456,
          downloads: 123,
          rating: 4.9,
          ratingCount: 89
        }
      },
      context: 'main'
    },
    {
      id: 'card-003',
      title: 'KIA 타이거즈 - 김도영',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
      holographic: {
        image: 'https://picsum.photos/400/560?random=3',
        backImage: 'https://picsum.photos/400/560?random=12',
        effect: 'soft-light',
        intensity: 85,
        isFlipped: false,
        animationDuration: 600
      },
      photocard: {
        rarity: 'legendary',
        stats: {
          totalViews: 3245,
          uniqueCollectors: 678,
          completionRate: 22.6
        },
        collections: ['col-kbo-2024'],
        acquiredAt: new Date('2024-03-12')
      },
      community: {
        creator: 'user-001',
        isPublic: true,
        tags: ['KIA타이거즈', '김도영', '신인왕'],
        metadata: {
          likes: 678,
          downloads: 234,
          rating: 4.8,
          ratingCount: 112
        }
      },
      context: 'main'
    }
  ];
</script>

<svelte:head>
  <title>통합 홀로그래픽 플랫폼 - IntegratedMainPage Demo</title>
</svelte:head>

<IntegratedMainPage
  user={mockUser}
  initialCards={mockCards}
  layout="standard"
  showKBOSection={true}
  showCommunityFeed={true}
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--apple-background);
  }
</style>
