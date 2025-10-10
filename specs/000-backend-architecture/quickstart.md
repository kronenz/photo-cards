# 백엔드 아키텍처 빠른 시작 가이드

## 🚀 5분 만에 시작하기

홀로그래픽 카드 커뮤니티 프로젝트의 백엔드 환경을 빠르게 설정하고 실행하는 방법을 안내합니다.

## 📋 사전 요구사항

- Docker 및 Docker Compose 설치
- Node.js 18+ 설치
- Git 설치

## ⚡ 빠른 설정

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd photo-cards
```

### 2. 환경 변수 설정
```bash
cp docker.env .env
# .env 파일에서 필요한 설정을 수정하세요
```

### 3. Docker 서비스 시작
```bash
# 개발 환경 시작
npm run docker:setup

# 또는 직접 실행
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 서비스 상태 확인
```bash
# 서비스 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
npm run docker:logs
```

## 🌐 서비스 접근

### 백엔드 서비스
- **PocketBase API**: http://localhost:8090/api/
- **PocketBase Admin**: http://localhost:8090/_/
- **MinIO Console**: http://localhost:9001/
- **Redis**: localhost:6379

### 기본 계정 정보
- **MinIO**: minioadmin / minioadmin123
- **PocketBase**: 첫 접속 시 관리자 계정 생성

## 🔧 초기 설정

### 1. PocketBase 관리자 계정 생성
1. http://localhost:8090/_/ 접속
2. "Create admin" 클릭
3. 이메일과 비밀번호 입력
4. 관리자 계정 생성 완료

### 2. MinIO 버킷 생성
1. http://localhost:9001/ 접속
2. minioadmin / minioadmin123으로 로그인
3. "Create Bucket" 클릭
4. 버킷 이름: `holographic-cards`
5. 버킷 생성 완료

### 3. 컬렉션 설정
PocketBase Admin에서 다음 컬렉션들을 생성하세요:

#### unified_cards (통합 카드)
```json
{
  "name": "unified_cards",
  "type": "base",
  "schema": [
    {
      "name": "title",
      "type": "text",
      "required": true
    },
    {
      "name": "holographic_image",
      "type": "text",
      "required": true
    },
    {
      "name": "holographic_effect",
      "type": "select",
      "required": true,
      "options": {
        "values": ["overlay", "soft-light", "hard-light"]
      }
    },
    {
      "name": "holographic_intensity",
      "type": "number",
      "required": true
    },
    {
      "name": "community_creator",
      "type": "relation",
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false
      }
    },
    {
      "name": "community_is_public",
      "type": "bool",
      "required": true
    },
    {
      "name": "community_likes",
      "type": "number",
      "required": true
    },
    {
      "name": "context",
      "type": "select",
      "required": true,
      "options": {
        "values": ["test", "main", "gallery", "community"]
      }
    }
  ]
}
```

#### templates (템플릿)
```json
{
  "name": "templates",
  "type": "base",
  "schema": [
    {
      "name": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "description",
      "type": "text",
      "required": false
    },
    {
      "name": "category",
      "type": "text",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    },
    {
      "name": "creator",
      "type": "relation",
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": true
      }
    },
    {
      "name": "rating",
      "type": "number",
      "required": true
    },
    {
      "name": "downloads",
      "type": "number",
      "required": true
    },
    {
      "name": "is_public",
      "type": "bool",
      "required": true
    }
  ]
}
```

## 🧪 API 테스트

### 1. 기본 API 테스트
```bash
# 서비스 상태 확인
curl http://localhost:8090/api/health

# 카드 목록 조회
curl http://localhost:8090/api/collections/unified_cards/records
```

### 2. 인증 테스트
```bash
# 사용자 등록
curl -X POST http://localhost:8090/api/collections/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "name": "Test User"
  }'

# 로그인
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "test@example.com",
    "password": "password123"
  }'
```

### 3. 카드 생성 테스트
```bash
# 인증 토큰을 사용하여 카드 생성
curl -X POST http://localhost:8090/api/collections/unified_cards/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Card",
    "holographic_image": "https://example.com/image.jpg",
    "holographic_effect": "overlay",
    "holographic_intensity": 75,
    "community_creator": "USER_ID",
    "community_is_public": true,
    "community_likes": 0,
    "context": "test"
  }'
```

## 🔍 문제 해결

### 일반적인 문제

#### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :8090

# 다른 포트로 변경
# docker-compose.dev.yml에서 포트 수정
```

#### 2. Docker 서비스 시작 실패
```bash
# 로그 확인
docker-compose -f docker-compose.dev.yml logs

# 서비스 재시작
docker-compose -f docker-compose.dev.yml restart
```

#### 3. 데이터베이스 연결 실패
```bash
# PocketBase 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps pocketbase

# 컨테이너 재시작
docker-compose -f docker-compose.dev.yml restart pocketbase
```

### 로그 확인
```bash
# 모든 서비스 로그
npm run docker:logs

# 특정 서비스 로그
docker-compose -f docker-compose.dev.yml logs pocketbase
docker-compose -f docker-compose.dev.yml logs minio
docker-compose -f docker-compose.dev.yml logs redis
```

## 🛠️ 개발 도구

### 1. API 테스트 도구
- **Postman**: API 테스트 컬렉션
- **Insomnia**: REST 클라이언트
- **curl**: 명령줄 테스트

### 2. 데이터베이스 도구
- **PocketBase Admin**: 웹 기반 관리자 인터페이스
- **MinIO Console**: 객체 스토리지 관리
- **Redis CLI**: 캐시 데이터 확인

### 3. 모니터링 도구
- **Docker Desktop**: 컨테이너 모니터링
- **htop**: 시스템 리소스 모니터링
- **netstat**: 네트워크 연결 확인

## 📚 다음 단계

### 1. 상세 설정
- [BACKEND_ARCHITECTURE_GUIDE.md](./BACKEND_ARCHITECTURE_GUIDE.md) 참조
- [API_REFERENCE.md](./API_REFERENCE.md) 참조

### 2. 개발 시작
- [CLAUDE_DEVELOPMENT_GUIDE.md](./CLAUDE_DEVELOPMENT_GUIDE.md) 참조
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) 참조

### 3. 프로덕션 배포
- [plan.md](./plan.md) 참조
- [spec.md](./spec.md) 참조

## 🆘 지원

### 문제 신고
- GitHub Issues에 문제 신고
- 상세한 로그와 함께 문제 설명

### 문서 개선
- 문서에 오류나 개선사항 발견 시 PR 제출
- 추가 예제나 설명이 필요한 경우 이슈 생성

---

이 빠른 시작 가이드를 통해 5분 만에 백엔드 환경을 설정하고 개발을 시작할 수 있습니다. 추가 질문이나 문제가 있는 경우 언제든지 문의해주세요!
