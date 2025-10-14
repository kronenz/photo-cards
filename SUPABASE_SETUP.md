# Supabase 인증 시스템 설정 가이드

Baseball Photo Cards 프로젝트의 Supabase 인증 시스템 설정 및 사용 가이드입니다.

## 📋 목차

1. [Supabase 데이터베이스 설정](#supabase-데이터베이스-설정)
2. [인증 시스템 설정](#인증-시스템-설정)
3. [OAuth 설정](#oauth-설정)
4. [사용법](#사용법)
5. [트러블슈팅](#트러블슈팅)

---

## 🗄️ Supabase 데이터베이스 설정

### 1. Supabase Studio 접속

```bash
# Backend 서비스가 실행 중인지 확인
cd /root/develop/baseball/frontend/backend
docker-compose ps

# Supabase Studio 접속
# URL: http://localhost:3000
# Username: baseball_admin
# Password: baseball_cards_2025_secure_password
```

### 2. users 테이블 생성

Supabase Studio SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- users 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,

    -- Baseball 관련 필드
    favorite_team TEXT,
    fan_since TEXT,
    favorite_player TEXT,

    -- 등급 시스템
    grade TEXT DEFAULT 'rookie' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 자신의 프로필은 읽을 수 있음
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 정책 생성: 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 정책 생성: 공개 프로필은 모두 볼 수 있음
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
USING (true);

-- 정책 생성: 새 사용자 생성 시 자동으로 프로필 생성
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. cards 테이블 생성 (선택사항)

```sql
-- cards 테이블 생성
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,

    -- Baseball 관련 필드
    team TEXT,
    player TEXT,
    year INTEGER,

    -- 공개 설정
    is_public BOOLEAN DEFAULT TRUE,

    -- 통계
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- 정책: 공개 카드는 모두 볼 수 있음
CREATE POLICY "Public cards are viewable by everyone"
ON public.cards FOR SELECT
USING (is_public = true);

-- 정책: 자신의 카드는 모두 볼 수 있음
CREATE POLICY "Users can view own cards"
ON public.cards FOR SELECT
USING (auth.uid() = user_id);

-- 정책: 자신의 카드만 수정 가능
CREATE POLICY "Users can update own cards"
ON public.cards FOR UPDATE
USING (auth.uid() = user_id);

-- 정책: 자신의 카드만 삭제 가능
CREATE POLICY "Users can delete own cards"
ON public.cards FOR DELETE
USING (auth.uid() = user_id);

-- 정책: 인증된 사용자는 카드 생성 가능
CREATE POLICY "Authenticated users can create cards"
ON public.cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 인증 시스템 설정

### 1. 환경 변수 확인

`.env` 파일이 올바르게 설정되어 있는지 확인:

```bash
# Frontend .env 파일
VITE_SUPABASE_URL="http://localhost:8100"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 또는 서버 사이드
SUPABASE_URL="http://localhost:8100"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. 이메일 인증 설정

Supabase Studio → Authentication → Settings:

- **Email Confirmation**: 개발 환경에서는 비활성화 가능
- **Secure Email Change**: 보안 강화가 필요하면 활성화

---

## 🔑 OAuth 설정

### Google OAuth 설정

1. **Google Cloud Console 설정**
   - https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URIs: `http://localhost:8100/auth/v1/callback`

2. **Supabase에 등록**
   - Supabase Studio → Authentication → Providers
   - Google 활성화
   - Client ID와 Secret 입력

### Kakao OAuth 설정

1. **Kakao Developers 설정**
   - https://developers.kakao.com/
   - 내 애플리케이션 → 애플리케이션 추가하기
   - Application name: `Baseball Photo Cards`
   - Redirect URI: `http://localhost:8100/auth/v1/callback`

2. **Supabase에 등록**
   - Supabase Studio → Authentication → Providers
   - Kakao 활성화 (현재 Supabase는 Kakao를 기본 지원하지 않으므로 Custom OAuth Provider로 설정 필요)
   - Client ID와 Secret 입력

3. **참고사항**
   - Supabase에서 Kakao는 기본 제공되지 않을 수 있습니다
   - 대안: 백엔드에서 직접 Kakao OAuth를 처리하거나 Third-party 라이브러리 사용

### Naver OAuth 설정

1. **Naver Developers 설정**
   - https://developers.naver.com/
   - 내 애플리케이션 → 애플리케이션 등록
   - Application name: `Baseball Photo Cards`
   - Callback URL: `http://localhost:8100/auth/v1/callback`
   - 사용 API: 회원 이름, 이메일 주소

2. **Supabase에 등록**
   - Supabase Studio → Authentication → Providers
   - Naver 활성화 (현재 Supabase는 Naver를 기본 지원하지 않으므로 Custom OAuth Provider로 설정 필요)
   - Client ID와 Secret 입력

3. **참고사항**
   - Supabase에서 Naver는 기본 제공되지 않을 수 있습니다
   - 대안: 백엔드에서 직접 Naver OAuth를 처리하거나 Third-party 라이브러리 사용

**⚠️ 중요**: Supabase는 기본적으로 Google, GitHub, GitLab, Bitbucket, Azure, Facebook, Twitter, Discord, Twitch 등을 지원합니다. Kakao와 Naver는 기본 제공되지 않으므로, 실제 프로덕션 환경에서는 다음 방법 중 하나를 선택해야 합니다:

1. **백엔드에서 직접 OAuth 처리**: Kakao/Naver OAuth를 백엔드에서 처리하고 Supabase 세션 생성
2. **Third-party 인증 서비스**: Auth0, Firebase Auth 등을 통한 Kakao/Naver 연동
3. **Custom OAuth Provider**: Supabase의 커스텀 OAuth 기능 활용 (고급)

---

## 📚 사용법

### 회원가입

```typescript
import { supabaseAuthService } from '$lib/services/supabaseAuthService';

// 이메일/비밀번호 회원가입
const user = await supabaseAuthService.signUpWithEmail(
  'user@example.com',
  'password123',
  'DisplayName' // 선택사항
);

// OAuth 회원가입
await supabaseAuthService.signInWithOAuth('google');
await supabaseAuthService.signInWithOAuth('kakao');
await supabaseAuthService.signInWithOAuth('naver');
```

### 로그인

```typescript
// 이메일/비밀번호 로그인
const user = await supabaseAuthService.signInWithEmail(
  'user@example.com',
  'password123'
);

// OAuth 로그인
await supabaseAuthService.signInWithOAuth('github');
```

### 로그아웃

```typescript
await supabaseAuthService.signOut();
```

### 사용자 정보 가져오기

```typescript
// 현재 사용자
const currentUser = supabaseAuthService.getCurrentUser();

// Reactive Store 사용
import { supabaseUser, isSupabaseAuthenticated } from '$lib/services/supabaseAuthService';

$: if ($isSupabaseAuthenticated) {
  console.log('Logged in user:', $supabaseUser);
}
```

### 프로필 업데이트

```typescript
await supabaseAuthService.updateProfile({
  display_name: 'New Display Name',
  bio: 'Hello, I love baseball!',
  favorite_team: 'doosan'
});
```

### 아바타 업데이트

```typescript
const file = /* File from input */;
const avatarUrl = await supabaseAuthService.updateAvatar(file);
```

---

## 🐛 트러블슈팅

### 1. "Failed to fetch" 에러

**원인**: Supabase backend가 실행되지 않음

**해결**:
```bash
cd /root/develop/baseball/frontend/backend
docker-compose ps  # 서비스 상태 확인
docker-compose up -d  # 서비스 시작
```

### 2. "Invalid JWT" 에러

**원인**: JWT_SECRET과 ANON_KEY가 일치하지 않음

**해결**:
1. Backend `.env` 파일 확인:
   ```bash
   cat /root/develop/baseball/frontend/backend/.env | grep JWT_SECRET
   ```
2. Frontend `.env` 파일의 ANON_KEY가 같은 secret으로 서명되었는지 확인

### 3. "Row Level Security" 에러

**원인**: RLS 정책이 올바르게 설정되지 않음

**해결**:
1. Supabase Studio SQL Editor에서 RLS 정책 확인
2. 위의 SQL 스크립트를 다시 실행

### 4. OAuth 리다이렉트 실패

**원인**: Callback URL이 올바르지 않음

**해결**:
1. OAuth 앱 설정에서 Callback URL 확인:
   ```
   http://localhost:8100/auth/v1/callback
   ```
2. Supabase Studio에서 Redirect URLs 설정 확인

### 5. CORS 에러

**원인**: Supabase가 frontend URL을 허용하지 않음

**해결**:
1. Supabase Studio → Settings → API
2. CORS Settings에 `http://localhost:5173` 추가

---

## 📊 테스트

### 1. 회원가입 테스트

```bash
# Frontend 실행
npm run dev

# 브라우저에서 접속
# http://localhost:5173/auth/signup
```

### 2. 로그인 테스트

```bash
# http://localhost:5173/auth/login
```

### 3. API 테스트

```bash
# Supabase API 테스트
curl http://localhost:8100/rest/v1/users

# Health check
curl http://localhost:8100/rest/v1/
```

---

## 🔗 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth 설정](https://supabase.com/docs/guides/auth/social-login)

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] Supabase backend 실행 중
- [ ] users 테이블 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 회원가입 테스트 성공
- [ ] 로그인 테스트 성공
- [ ] OAuth 설정 (선택사항)
- [ ] 프로필 업데이트 테스트

---

**마지막 업데이트**: 2025-10-10
**작성자**: Claude Code
