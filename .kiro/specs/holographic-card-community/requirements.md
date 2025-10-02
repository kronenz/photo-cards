# Requirements Document

## Introduction

홀로그래픽 효과 야구 카드 갤러리 커뮤니케이션 서비스는 Civitai의 AI 아트 커뮤니티 철학을 홀로그래픽 카드 문화에 적용한 플랫폼입니다. 사용자들이 자신만의 홀로그래픽 카드를 제작하고, 공유하며, 평가하고, 피드백을 주고받을 수 있는 커뮤니티 중심의 서비스를 제공합니다. Civitai의 모델 공유 및 평가 시스템을 참고하여, 카드 제작 기술과 창작물을 공유하고 발전시킬 수 있는 생태계를 구축하는 것을 목표로 합니다.

## Requirements

### Requirement 1

**User Story:** As a KBO 팬, I want to create immersive holographic cards that capture the emotion and story of baseball moments, including photos, videos, and memorable statistics, so that I can preserve and share the passion and glory of Korean baseball.

#### 감동과 스토리가 담긴 카드 제작 시스템

1. WHEN 사용자가 미디어를 업로드하면 THEN 시스템은 다양한 형태의 콘텐츠를 지원해야 한다:
   - 📸 **정적 이미지**: 기본 사진 + 홀로그래픽 효과
   - 🎬 **동영상 카드**: 짧은 하이라이트 영상 (3-10초)
   - 📊 **기록 카드**: 타율, 홈런, ERA 등 통계 데이터 시각화
   - 🎵 **사운드 카드**: 응원가, 해설 음성, 타격음 등 오디오 포함

2. WHEN 사용자가 "영광의 순간" 카드를 제작하면 THEN 시스템은 특별한 템플릿을 제공해야 한다:
   - ⚾ **홈런 순간**: 공이 날아가는 궤적과 함께 동영상 재생
   - 🏃 **도루 성공**: 슬라이딩 장면의 슬로우 모션 효과
   - 🤾 **수비 명장면**: 다이빙 캐치, 더블플레이 등 화려한 수비
   - 🎯 **결정적 순간**: 끝내기 안타, 역전 홈런 등 드라마틱한 장면

3. WHEN 사용자가 스토리텔링을 추가하면 THEN 시스템은 감정적 요소를 지원해야 한다:
   - 📝 **배경 스토리**: "그날의 기억", "선수의 각오" 등 텍스트 오버레이
   - 💭 **명언 추가**: 선수 인터뷰, 명감독 어록 등 인상적인 말들
   - 📅 **역사적 맥락**: 경기 날짜, 상황, 의미 등 상세 정보
   - 🎭 **감정 표현**: 기쁨, 아쉬움, 감동, 열정 등 감정 아이콘

4. WHEN 사용자가 고급 편집을 진행하면 THEN 시스템은 전문적 도구를 제공해야 한다:
   - 🎨 **동적 효과**: 파티클, 불꽃, 번개 등 특수 효과
   - 📐 **레이아웃**: 다중 이미지 조합, 콜라주 스타일
   - 🎪 **애니메이션**: 텍스트 등장 효과, 이미지 전환 효과
   - 🌈 **홀로그래픽**: 실물 카드 수준의 프리미엄 홀로 효과

5. WHEN 카드가 완성되면 THEN 시스템은 몰입감 있는 상호작용을 제공해야 한다:
   - 🖱️ **3D 인터랙션**: 마우스 움직임에 따른 실물 카드 느낌
   - ▶️ **자동 재생**: 호버 시 동영상/애니메이션 자동 시작
   - 🔊 **사운드 효과**: 카드별 고유 사운드 (타격음, 응원소리 등)
   - 📱 **반응형**: 모바일에서도 완벽한 터치 인터랙션

### Requirement 2

**User Story:** As a 카드 제작자, I want to organize my created cards in a personal gallery with grid layout, so that I can easily manage and showcase my collection.

#### Acceptance Criteria

1. WHEN 사용자가 갤러리에 접근하면 THEN 시스템은 그리드 형식으로 카드들을 표시해야 한다
2. WHEN 사용자가 카드를 선택하면 THEN 시스템은 상세 보기와 편집 옵션을 제공해야 한다
3. WHEN 사용자가 카드를 공개/비공개로 설정하면 THEN 시스템은 해당 설정을 저장하고 반영해야 한다
4. WHEN 사용자가 카드를 정렬하면 THEN 시스템은 날짜, 인기도, 제목 등으로 정렬 옵션을 제공해야 한다
5. WHEN 갤러리가 로딩되면 THEN 시스템은 무한 스크롤 또는 페이지네이션으로 성능을 최적화해야 한다

### Requirement 3

**User Story:** As a 커뮤니티 멤버, I want to share my holographic cards publicly and receive feedback from other users, so that I can engage with the community and improve my skills.

#### Acceptance Criteria

1. WHEN 사용자가 카드를 공개하면 THEN 시스템은 커뮤니티 피드에 카드를 표시해야 한다
2. WHEN 다른 사용자가 카드를 보면 THEN 시스템은 추천, 공감, 댓글 기능을 제공해야 한다
3. WHEN 사용자가 댓글을 작성하면 THEN 시스템은 실시간으로 댓글을 업데이트해야 한다
4. WHEN 카드가 인기를 얻으면 THEN 시스템은 트렌딩 섹션에 노출해야 한다
5. WHEN 사용자가 알림을 받으면 THEN 시스템은 추천, 댓글, 팔로우 등의 활동을 알려줘야 한다

### Requirement 4

**User Story:** As a KBO 야구팬, I want to have user grades that reflect authentic Korean baseball fan culture and stadium experience, so that I can showcase my dedication and connect with fellow fans who share the same passion.

####응원단 등급 시스템 (KBO 팬 문화 기반)

1. WHEN 사용자가 가입하면 THEN 시스템은 "야구 입문자" 등급을 부여해야 한다
2. WHEN 사용자의 활동이 증가하면 THEN 시스템은 KBO 팬 문화를 반영한 등급을 업데이트해야 한다:
   - 🥎 **야구 입문자** (0-100점): 기본 카드 제작 기능
   - ⚾ **외야석 팬** (101-500점): 응원가 BGM 추가 가능
   - 🎺 **응원단 멤버** (501-1500점): 팀 컬러 홀로그래픽 효과 해금
   - 🏟️ **시즌권 홀더** (1501-5000점): 프리미엄 편집 도구, 무제한 업로드
   - 👑 **구단 레전드** (5001점+): 독점 효과, 멘토 자격, 수익 분배
3. WHEN 사용자가 특정 팀을 선택하면 THEN 시스템은 해당 팀의 응원 문화를 반영한 특별 배지를 제공해야 한다
4. WHEN 구단 레전드가 "명장 시리즈"를 발행하면 THEN 시스템은 "KBO 명예의 전당"에 영구 전시해야 한다
5. WHEN 시즌별 이벤트가 진행되면 THEN 시스템은 실제 KBO 일정과 연동한 특별 혜택을 제공해야 한다

### Requirement 5

**User Story:** As a SNS 사용자, I want to follow other users, send messages, and participate in community activities, so that I can build relationships and stay engaged with the platform.

#### Acceptance Criteria

1. WHEN 사용자가 다른 사용자를 팔로우하면 THEN 시스템은 팔로우 관계를 저장하고 피드를 업데이트해야 한다
2. WHEN 사용자가 메시지를 보내면 THEN 시스템은 실시간 채팅 기능을 제공해야 한다
3. WHEN 커뮤니티 이벤트가 있으면 THEN 시스템은 참여 기능과 알림을 제공해야 한다
4. WHEN 사용자가 프로필을 업데이트하면 THEN 시스템은 개인 정보와 포트폴리오를 관리할 수 있게 해야 한다
5. WHEN 사용자가 검색하면 THEN 시스템은 사용자, 카드, 태그 등을 통합 검색할 수 있어야 한다

### Requirement 6

**User Story:** As a 플랫폼 사용자, I want to experience a modern, dark-themed interface similar to Civitai's sophisticated design, so that I can focus on the visual content without eye strain and enjoy a premium feel.

#### Acceptance Criteria

1. WHEN 사용자가 플랫폼에 접속하면 THEN 시스템은 다크 테마를 기본으로 제공해야 한다
2. WHEN 카드가 표시되면 THEN 시스템은 어두운 배경에서 홀로그래픽 효과가 돋보이도록 해야 한다
3. WHEN 사용자가 갤러리를 탐색하면 THEN 시스템은 카드 기반 레이아웃으로 깔끔하게 정렬해야 한다
4. WHEN 인터랙션이 발생하면 THEN 시스템은 부드러운 호버 효과와 마이크로 애니메이션을 제공해야 한다
5. WHEN 모달이나 드롭다운이 열리면 THEN 시스템은 글래스모피즘과 블러 효과를 적용해야 한다
6. WHEN 사용자가 라이트 모드를 선택하면 THEN 시스템은 테마 전환 기능을 제공해야 한다

### Requirement 7

**User Story:** As a 커뮤니티 멤버, I want to discover and explore cards through advanced filtering and search capabilities similar to Civitai's model browsing, so that I can find inspiration and learn from other creators.

#### Acceptance Criteria

1. WHEN 사용자가 카드를 탐색하면 THEN 시스템은 태그, 스타일, 인기도, 최신순으로 필터링 옵션을 제공해야 한다
2. WHEN 사용자가 검색하면 THEN 시스템은 키워드 기반 검색과 태그 조합 검색을 지원해야 한다
3. WHEN 카드가 트렌딩하면 THEN 시스템은 Featured, Trending, New 섹션으로 분류해야 한다
4. WHEN 사용자가 카드를 보면 THEN 시스템은 관련 카드와 유사한 스타일의 카드를 추천해야 한다
5. WHEN 사용자가 카드 상세를 보면 THEN 시스템은 제작 과정, 사용된 효과, 기술적 정보를 표시해야 한다

### Requirement 8

**User Story:** As a 카드 크리에이터, I want to receive detailed feedback and ratings on my work similar to Civitai's review system, so that I can improve my skills and build reputation.

#### Acceptance Criteria

1. WHEN 다른 사용자가 내 카드를 평가하면 THEN 시스템은 별점과 상세 리뷰를 저장해야 한다
2. WHEN 리뷰가 작성되면 THEN 시스템은 기술적 품질, 창의성, 완성도 등 세부 평가 항목을 제공해야 한다
3. WHEN 내 카드가 평가받으면 THEN 시스템은 실시간 알림과 피드백 요약을 제공해야 한다
4. WHEN 평가가 누적되면 THEN 시스템은 내 전체 작품에 대한 통계와 성장 추이를 보여줘야 한다
5. WHEN 우수한 평가를 받으면 THEN 시스템은 배지나 특별 인증을 부여해야 한다

### Requirement 9

**User Story:** As a KBO 열성팬, I want to participate in authentic Korean baseball-themed challenges that celebrate our unique fan culture and memorable moments, so that I can showcase my passion and connect with the community through shared baseball memories.

#### KBO 팬 문화 이벤트 시스템

1. WHEN "KBO 시즌 챌린지"가 열리면 THEN 시스템은 한국 야구 특유의 이벤트를 제공해야 한다:
   - 🏆 **"그 해 그 순간"**: 역대 명경기 재현 카드 (예: 2002년 월드컵 4강, 1982년 프로야구 원년)
   - ⚾ **"홈런왕 시리즈"**: 이승엽, 박병호 등 KBO 홈런왕들의 명장면
   - 🎯 **"완전경기 기념"**: 한국 프로야구 완전경기 달성 순간들
   - 🌟 **"신인왕 예측"**: 매년 신인왕 후보 선수들의 카드 제작 경쟁

2. WHEN 사용자가 "덕후 인증 챌린지"에 참여하면 THEN 시스템은 한국 팬 문화를 반영해야 한다:
   - 📸 **"직관 인증샷"**: 실제 경기장 방문 인증과 연계한 특별 카드
   - 🎵 **"응원가 마스터"**: 각 팀 응원가를 활용한 카드 제작 챌린지
   - 🍗 **"치킨&맥주 세트"**: 직관 필수템과 함께하는 테마 카드
   - 🎺 **"응원 도구 자랑"**: 메가폰, 풍선, 응원봉 등을 활용한 창작

3. WHEN "팬 커미션 의뢰"가 게시되면 THEN 시스템은 한국적 요청 문화를 반영해야 한다:
   - 💝 **"최애 선수 카드"**: 개인적으로 좋아하는 선수의 특별 카드 의뢰
   - 🎂 **"생일 기념 카드"**: 선수 생일이나 개인 기념일 맞춤 제작
   - 💒 **"커플 야구 데이트"**: 연인과의 야구장 데이트 기념 카드
   - 👨‍👩‍👧‍👦 **"가족 응원단"**: 3대가 함께하는 야구 사랑 스토리

4. WHEN 커미션을 완료하면 THEN 시스템은 한국적 검수 문화를 제공해야 한다:
   - 👀 **"꼼꼼 검수"**: 디테일까지 신경 쓰는 한국적 완벽주의 반영
   - 💬 **"소통 과정"**: 제작 과정에서의 지속적인 피드백 교환
   - 🎁 **"깜짝 선물"**: 기대 이상의 퀄리티로 감동 선사

5. WHEN "KBO 어워즈"가 열리면 THEN 시스템은 한국 야구 시상식을 모방해야 한다:
   - 🏆 **"골든글러브 카드상"**: 최고 수비 카드 선정
   - ⚾ **"MVP 카드상"**: 시즌 최고 카드 크리에이터
   - 🌟 **"신인상"**: 새로 가입한 크리에이터 중 최고 작품
   - 👑 **"명예의 전당"**: 전설적인 카드들의 영구 전시관

### Requirement 10

**User Story:** As a KBO 카드 컬렉터, I want a rarity system that reflects Korean baseball card collecting culture and creates authentic scarcity like real KBO cards, so that I can experience the thrill of collecting rare Korean baseball memorabilia.

#### KBO 카드 등급 시스템 (한국 야구카드 문화 기반)

1. WHEN 카드가 생성되면 THEN 시스템은 KBO 카드 문화를 반영한 희소성 등급을 부여해야 한다:
   - 🟫 **베이스 카드** (70%): 기본 선수 카드
   - 🟦 **인서트 카드** (20%): 특별 디자인 (예: 홈런왕, 도루왕)
   - 🟪 **패러렐 카드** (7%): 홀로그래픽 특수 효과
   - 🟨 **사인볼 카드** (2%): 디지털 사인 효과
   - 🟩 **게임 유니폼** (0.9%): 실제 경기 순간 재현
   - ⭐ **원오브원** (0.1%): 역사적 순간 (예: 완전경기, 사이클링 히트)

2. WHEN 카드 품질이 평가되면 THEN 시스템은 한국형 그레이딩을 적용해야 한다:
   - **민트 10**: 완벽한 상태 (추가 홀로그래픽 효과)
   - **니어민트 9**: 거의 완벽 (프리미엄 테두리)
   - **엑설런트 8**: 우수 (특별 배경)
   - **베리굿 7**: 양호 (기본 효과)

3. WHEN 특별 이벤트가 발생하면 THEN 시스템은 KBO 실제 이벤트와 연동한 한정 카드를 발행해야 한다:
   - 🏆 **한국시리즈 기념**: 우승팀 특별 카드
   - ⚡ **올스타전 기념**: 팬투표 1위 선수 카드
   - 🎯 **개막전 기념**: 시즌 첫 홈런/승리 카드
   - 🌟 **신인왕 기념**: 루키 특별 에디션

4. WHEN 커뮤니티 투표가 진행되면 THEN 시스템은 "팬들이 뽑은 베스트" 등급을 부여해야 한다

5. WHEN 시간이 경과하면 THEN 시스템은 "추억의 그 시절" 빈티지 가치를 부여해야 한다

### Requirement 11

**User Story:** As a KBO 카드 트레이더, I want a trading system that captures the authentic Korean baseball card trading experience, so that I can trade like at Jamsil Stadium card shops and complete my dream collection.

#### 한국형 카드 거래 시스템

1. WHEN 사용자가 트레이드를 제안하면 THEN 시스템은 "잠실 카드샵" 스타일 거래 환경을 제공해야 한다:
   - 💬 **흥정 채팅**: "이 카드 어때요?" 스타일 대화형 거래
   - 🤝 **신뢰도 시스템**: "단골 딜러" 평점 및 거래 후기
   - 📦 **안전 거래함**: 에스크로 방식 카드 보관

2. WHEN 거래가 진행되면 THEN 시스템은 한국 카드 문화를 반영한 검증을 제공해야 한다:
   - 🔍 **진품 인증서**: 디지털 홀로그램 인증
   - 📋 **거래 명세서**: 상세한 카드 정보 및 거래 조건
   - ⭐ **컨디션 평가**: 한국식 카드 상태 평가 (A+, A, B+, B, C)

3. WHEN "KBO 카드 마켓"이 운영되면 THEN 시스템은 한국 시장 특성을 반영해야 한다:
   - 📈 **실시간 시세**: 인기 선수별 카드 가격 동향
   - 🏆 **시즌 연동 가격**: KBO 성적에 따른 카드 가치 변동
   - 📊 **팀별 인기도**: 각 구단 팬들의 카드 선호도 분석

4. WHEN "카드 경매장"이 열리면 THEN 시스템은 한국적 경매 문화를 제공해야 한다:
   - 🎯 **즉석 입찰**: 실시간 경쟁 입찰 시스템
   - ⏰ **마감 5분 연장**: 한국 경매 특유의 막판 스퍼트 방지
   - 🎊 **낙찰 축하**: 커뮤니티 축하 메시지 및 이벤트

5. WHEN 거래가 완료되면 THEN 시스템은 한국형 평판 관리를 제공해야 한다:
   - 🌟 **딜러 등급**: 새내기 → 단골 → 베테랑 → 카드샵 사장
   - 📝 **거래 후기**: "친절하고 빠른 거래였어요!" 스타일 리뷰
   - 🏅 **월간 우수 딜러**: 커뮤니티 인정 시스템

### Requirement 12

**User Story:** As a KBO 팬, I want authentic Korean baseball fan community features that reflect our unique cheering culture and stadium experience, so that I can bond with fellow fans and celebrate our shared passion for Korean baseball.

#### KBO 팬 커뮤니티 시스템

1. WHEN "구단별 팬클럽"이 생성되면 THEN 시스템은 한국 야구 팬 문화를 반영해야 한다:
   - 🏟️ **팀별 응원단**: LG 트윈스, 두산 베어스, KT 위즈 등 10개 구단별 전용 공간
   - 🎵 **응원가 라이브러리**: 각 팀 고유 응원가와 함께하는 카드 제작
   - 🎺 **치어리더 이벤트**: 팀 마스코트와 치어리더 테마 특별 카드
   - 📱 **구단 소식 연동**: 실제 KBO 뉴스와 연계한 실시간 업데이트

2. WHEN "KBO 시즌 토너먼트"가 개최되면 THEN 시스템은 한국 야구 시즌을 반영해야 한다:
   - ⚾ **정규시즌 배틀**: 실제 KBO 일정과 연동한 카드 대결
   - 🏆 **한국시리즈 특별전**: 플레이오프 진출팀 팬들의 카드 경쟁
   - 🌟 **올스타 투표**: 팬들이 직접 뽑는 베스트 카드 선정
   - 🎯 **신인왕 예측**: 루키 카드로 진행하는 예측 게임

3. WHEN "야구 덕후 프로젝트"가 시작되면 THEN 시스템은 협업 문화를 제공해야 한다:
   - 👥 **팀 프로젝트**: 구단별 역사 카드 시리즈 공동 제작
   - 🎨 **크리에이터 콜라보**: 유명 야구 유튜버/블로거와의 협업
   - 📚 **야구 백과사전**: 커뮤니티가 함께 만드는 KBO 역사 아카이브

4. WHEN "선배 팬 멘토링"이 진행되면 THEN 시스템은 세대 간 소통을 지원해야 한다:
   - 👴 **원로 팬**: 80년대부터의 야구 역사를 아는 베테랑 멘토
   - 🎓 **야구 교실**: 룰 설명, 선수 소개, 응원법 전수
   - 📖 **추억 공유**: "그때 그 경기" 스토리텔링 카드 제작

5. WHEN "직관 라이브"가 열리면 THEN 시스템은 실제 경기장 분위기를 재현해야 한다:
   - 📺 **경기 연동**: 실제 KBO 경기와 실시간 연동
   - 🎉 **응원 채팅**: "잘했어!", "홈런!", "파이팅!" 실시간 응원
   - 🍺 **치킨&맥주**: 직관 필수템과 함께하는 가상 응원석
   - 📸 **순간 포착**: 경기 하이라이트 순간을 카드로 즉석 제작

### Requirement 13

**User Story:** As a 플랫폼 운영자, I want advanced analytics and AI-powered features that enhance user experience and maintain platform quality, so that the community can thrive and grow sustainably.

#### Acceptance Criteria

1. WHEN 카드가 업로드되면 THEN 시스템은 AI를 활용해 자동 태깅과 품질 평가를 수행해야 한다
2. WHEN 사용자가 활동하면 THEN 시스템은 개인화된 추천 알고리즘을 제공해야 한다
3. WHEN 부적절한 콘텐츠가 감지되면 THEN 시스템은 자동 모더레이션과 신고 처리를 수행해야 한다
4. WHEN 트렌드가 분석되면 THEN 시스템은 인사이트 대시보드와 통계를 제공해야 한다
5. WHEN 사용자 행동이 분석되면 THEN 시스템은 개선 사항을 제안하고 A/B 테스트를 지원해야 한다

### Requirement 14

**User Story:** As a 야구 역사 보존가, I want to create comprehensive baseball archives that capture legendary moments, player stories, and statistical achievements, so that future generations can experience the passion and glory of Korean baseball history.

#### KBO 역사 아카이브 & 레전드 스토리 시스템

1. WHEN "전설의 순간" 아카이브가 구축되면 THEN 시스템은 KBO 역사를 체계적으로 보존해야 한다:
   - 🏆 **역대 명경기**: 1982년 개막전부터 현재까지의 명장면들
   - ⚾ **기록 달성 순간**: 통산 홈런, 안타, 승수 등 대기록 순간들
   - 🌟 **레전드 선수**: 선동열, 이승엽, 박찬호 등 전설들의 스토리
   - 📚 **구단 역사**: 각 팀의 창단부터 현재까지의 발자취

2. WHEN 사용자가 "선수 스토리 카드"를 제작하면 THEN 시스템은 인물의 여정을 담아야 한다:
   - 👶 **성장 스토리**: 어린 시절부터 프로까지의 성장 과정
   - 💪 **극복 스토리**: 부상, 슬럼프를 이겨낸 감동적인 이야기
   - 🎯 **도전 정신**: 새로운 기록에 도전하는 선수의 열정
   - 👨‍👩‍👧‍👦 **가족 이야기**: 선수를 뒷받침하는 가족들의 사랑

3. WHEN "통계 시각화 카드"가 생성되면 THEN 시스템은 데이터를 감동적으로 표현해야 한다:
   - 📊 **성적 그래프**: 시즌별 성적 변화를 아름다운 차트로
   - 🎯 **비교 분석**: 역대 선수들과의 기록 비교
   - 🏃 **진행 상황**: 현재 진행 중인 기록 도전 현황
   - 🌡️ **컨디션 지표**: 선수의 현재 폼과 상태 분석

4. WHEN "감동 스토리 카드"가 제작되면 THEN 시스템은 감정적 몰입을 제공해야 한다:
   - 😭 **눈물의 순간**: 은퇴식, 마지막 경기 등 감동적인 장면
   - 🎉 **환희의 순간**: 우승, 개인 기록 달성 등 기쁨의 순간
   - 🤝 **우정과 라이벌**: 선수들 간의 특별한 관계와 경쟁
   - 💝 **팬과의 소통**: 선수와 팬들 사이의 따뜻한 에피소드

5. WHEN "미래 예측 카드"가 생성되면 THEN 시스템은 꿈과 희망을 담아야 한다:
   - 🔮 **신인 잠재력**: 유망주들의 미래 예상 성적
   - 🎯 **시즌 목표**: 선수들이 세운 올해의 목표와 각오
   - 🏆 **팀 전망**: 구단별 시즌 전망과 팬들의 기대
   - 🌟 **꿈의 무대**: 월드베이스볼클래식, 올림픽 등 국제대회 도전

### Requirement 15

**User Story:** As a 플랫폼 운영자, I want comprehensive monetization features that respect baseball card culture and traditions, so that the platform can generate sustainable revenue while rewarding passionate creators.

#### Acceptance Criteria

1. WHEN "프로 덕후 멤버십"이 활성화되면 THEN 시스템은 고급 편집 도구와 무제한 업로드를 제공해야 한다
2. WHEN "카드 마켓플레이스"가 운영되면 THEN 시스템은 디지털 카드 판매와 "인증서" 발행 기능을 제공해야 한다
3. WHEN "실물 카드 제작소"가 이용되면 THEN 시스템은 주문 관리와 "품질 보증서"를 제공해야 한다
4. WHEN "크리에이터 로열티"가 발생하면 THEN 시스템은 투명한 수익 분배와 "정산 리포트"를 제공해야 한다
5. WHEN "스폰서십 파트너십"이 진행되면 THEN 시스템은 야구 관련 브랜드와의 협업 관리를 제공해야 한다