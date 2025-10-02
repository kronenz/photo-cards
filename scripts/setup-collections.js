import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// KBO 홀로그래픽 카드 커뮤니티 컬렉션 설정
const collections = {
  // 사용자 컬렉션 (확장)
  users: {
    name: 'users',
    type: 'auth',
    schema: [
      {
        name: 'username',
        type: 'text',
        required: true,
        options: {
          min: 3,
          max: 20,
          pattern: '^[a-zA-Z0-9_]+$'
        }
      },
      {
        name: 'displayName',
        type: 'text',
        required: true,
        options: {
          min: 2,
          max: 50
        }
      },
      {
        name: 'avatar',
        type: 'file',
        options: {
          maxSelect: 1,
          maxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'bio',
        type: 'text',
        options: {
          max: 500
        }
      },
      {
        name: 'favoriteTeam',
        type: 'select',
        options: {
          values: ['lg', 'doosan', 'kt', 'samsung', 'lotte', 'kia', 'nc', 'hanwha', 'ssg', 'kiwoom']
        }
      },
      {
        name: 'grade',
        type: 'select',
        options: {
          values: ['신입덕후', '외야석팬', '응원단멤버', '시즌권홀더', '구단레전드']
        }
      },
      {
        name: 'gradePoints',
        type: 'number',
        options: {
          min: 0
        }
      },
      {
        name: 'stats',
        type: 'json'
      },
      {
        name: 'preferences',
        type: 'json'
      },
      {
        name: 'isVerified',
        type: 'bool'
      }
    ],
    indexes: ['username', 'displayName', 'favoriteTeam', 'grade'],
    listRule: 'id != ""',
    viewRule: 'id != ""',
    createRule: '',
    updateRule: 'id = @request.auth.id',
    deleteRule: 'id = @request.auth.id'
  },

  // 홀로그래픽 카드 컬렉션
  cards: {
    name: 'cards',
    type: 'base',
    schema: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'description',
        type: 'text',
        options: {
          max: 1000
        }
      },
      {
        name: 'image',
        type: 'file',
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 10485760, // 10MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'video',
        type: 'file',
        options: {
          maxSelect: 1,
          maxSize: 52428800, // 50MB
          mimeTypes: ['video/mp4', 'video/webm']
        }
      },
      {
        name: 'audio',
        type: 'file',
        options: {
          maxSelect: 1,
          maxSize: 10485760, // 10MB
          mimeTypes: ['audio/mp3', 'audio/wav', 'audio/ogg']
        }
      },
      {
        name: 'holographicEffect',
        type: 'json',
        required: true
      },
      {
        name: 'elements',
        type: 'json'
      },
      {
        name: 'team',
        type: 'select',
        options: {
          values: ['lg', 'doosan', 'kt', 'samsung', 'lotte', 'kia', 'nc', 'hanwha', 'ssg', 'kiwoom']
        }
      },
      {
        name: 'category',
        type: 'select',
        options: {
          values: ['홈런순간', '도루성공', '수비명장면', '결정적순간', '영광의순간', '통계카드', '스토리카드']
        }
      },
      {
        name: 'rarity',
        type: 'select',
        options: {
          values: ['베이스카드', '인서트카드', '패러렐카드', '사인볼카드', '게임유니폼', '원오브원']
        }
      },
      {
        name: 'grade',
        type: 'select',
        options: {
          values: ['민트10', '니어민트9', '엑설런트8', '베리굿7']
        }
      },
      {
        name: 'tags',
        type: 'relation',
        options: {
          collectionId: 'tags',
          cascadeDelete: false,
          maxSelect: 10
        }
      },
      {
        name: 'userId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'isPublic',
        type: 'bool'
      },
      {
        name: 'likes',
        type: 'number',
        options: {
          min: 0
        }
      },
      {
        name: 'views',
        type: 'number',
        options: {
          min: 0
        }
      },
      {
        name: 'featured',
        type: 'bool'
      }
    ],
    indexes: ['userId', 'isPublic', 'team', 'category', 'rarity', 'featured', 'created'],
    listRule: 'isPublic = true || userId = @request.auth.id',
    viewRule: 'isPublic = true || userId = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'userId = @request.auth.id',
    deleteRule: 'userId = @request.auth.id'
  },

  // 태그 컬렉션
  tags: {
    name: 'tags',
    type: 'base',
    schema: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 50
        }
      },
      {
        name: 'color',
        type: 'text',
        options: {
          pattern: '^#[0-9A-Fa-f]{6}$'
        }
      },
      {
        name: 'description',
        type: 'text',
        options: {
          max: 200
        }
      },
      {
        name: 'usageCount',
        type: 'number',
        options: {
          min: 0
        }
      }
    ],
    indexes: ['name', 'usageCount'],
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""'
  },

  // 댓글 컬렉션
  comments: {
    name: 'comments',
    type: 'base',
    schema: [
      {
        name: 'content',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 1000
        }
      },
      {
        name: 'cardId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'cards',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'userId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'parentId',
        type: 'relation',
        options: {
          collectionId: 'comments',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'likes',
        type: 'number',
        options: {
          min: 0
        }
      }
    ],
    indexes: ['cardId', 'userId', 'parentId', 'created'],
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: 'userId = @request.auth.id',
    deleteRule: 'userId = @request.auth.id'
  },

  // 좋아요 컬렉션
  likes: {
    name: 'likes',
    type: 'base',
    schema: [
      {
        name: 'cardId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'cards',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'userId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      }
    ],
    indexes: ['cardId', 'userId', 'created'],
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '',
    deleteRule: 'userId = @request.auth.id'
  },

  // 팔로우 컬렉션
  follows: {
    name: 'follows',
    type: 'base',
    schema: [
      {
        name: 'followerId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'followingId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      }
    ],
    indexes: ['followerId', 'followingId', 'created'],
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '',
    deleteRule: 'followerId = @request.auth.id'
  },

  // 알림 컬렉션
  notifications: {
    name: 'notifications',
    type: 'base',
    schema: [
      {
        name: 'type',
        type: 'select',
        required: true,
        options: {
          values: ['like', 'comment', 'follow', 'card_featured', 'grade_up', 'achievement']
        }
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          max: 100
        }
      },
      {
        name: 'message',
        type: 'text',
        required: true,
        options: {
          max: 500
        }
      },
      {
        name: 'userId',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'fromUserId',
        type: 'relation',
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'cardId',
        type: 'relation',
        options: {
          collectionId: 'cards',
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'isRead',
        type: 'bool'
      },
      {
        name: 'data',
        type: 'json'
      }
    ],
    indexes: ['userId', 'type', 'isRead', 'created'],
    listRule: 'userId = @request.auth.id',
    viewRule: 'userId = @request.auth.id',
    createRule: '',
    updateRule: 'userId = @request.auth.id',
    deleteRule: 'userId = @request.auth.id'
  }
};

async function setupCollections() {
  try {
    console.log('🚀 KBO 홀로그래픽 카드 커뮤니티 컬렉션 설정 시작...');
    
    // 관리자 로그인 (기본 계정)
    await pb.admins.authWithPassword('admin@kbo-cards.com', 'admin123456');
    console.log('✅ 관리자 인증 완료');
    
    // 각 컬렉션 생성
    for (const [key, collection] of Object.entries(collections)) {
      try {
        // 기존 컬렉션 확인
        try {
          await pb.collections.getOne(collection.name);
          console.log(`⚠️  컬렉션 '${collection.name}' 이미 존재함`);
          continue;
        } catch (error) {
          // 컬렉션이 없으면 생성
        }
        
        await pb.collections.create(collection);
        console.log(`✅ 컬렉션 '${collection.name}' 생성 완료`);
      } catch (error) {
        console.error(`❌ 컬렉션 '${collection.name}' 생성 실패:`, error.message);
      }
    }
    
    // 기본 태그 생성
    const defaultTags = [
      { name: 'KBO', color: '#007aff', description: 'KBO 리그 관련' },
      { name: '홈런', color: '#ff3b30', description: '홈런 관련 카드' },
      { name: '도루', color: '#34c759', description: '도루 관련 카드' },
      { name: '수비', color: '#ff9500', description: '수비 관련 카드' },
      { name: '투수', color: '#5856d6', description: '투수 관련 카드' },
      { name: '타자', color: '#ff2d92', description: '타자 관련 카드' },
      { name: '레전드', color: '#ffd700', description: '전설적인 순간' },
      { name: '신인', color: '#5ac8fa', description: '신인 선수 관련' },
      { name: '베테랑', color: '#8e8e93', description: '베테랑 선수 관련' },
      { name: '명장면', color: '#af52de', description: '명장면 모음' }
    ];
    
    for (const tag of defaultTags) {
      try {
        await pb.collection('tags').create({
          ...tag,
          usageCount: 0
        });
        console.log(`✅ 기본 태그 '${tag.name}' 생성 완료`);
      } catch (error) {
        console.log(`⚠️  태그 '${tag.name}' 이미 존재하거나 생성 실패`);
      }
    }
    
    console.log('🎉 KBO 홀로그래픽 카드 커뮤니티 컬렉션 설정 완료!');
    console.log('📝 다음 단계:');
    console.log('   1. npm run pocketbase 로 PocketBase 서버 시작');
    console.log('   2. http://localhost:8090/_/ 에서 관리자 계정 설정');
    console.log('   3. OAuth 설정 (GitHub, Google)');
    console.log('   4. npm run dev 로 개발 서버 시작');
    
  } catch (error) {
    console.error('❌ 컬렉션 설정 실패:', error);
  }
}

// 스크립트 실행
setupCollections();