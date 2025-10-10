# Docker PocketBase 설정 가이드

이 프로젝트는 Docker를 사용하여 PocketBase, MinIO, Redis를 쉽게 실행할 수 있도록 구성되어 있습니다.

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 파일 복사
cp docker.env .env

# .env 파일을 편집하여 필요한 설정을 변경하세요
# 특히 POCKETBASE_ENCRYPTION_KEY는 반드시 변경해주세요
```

### 2. Docker 서비스 시작

```bash
# 개발 환경으로 시작
npm run docker:setup

# 또는 직접 실행
./scripts/docker-setup.sh dev

# 프로덕션 환경으로 시작
npm run docker:setup:prod
```

### 3. 서비스 접근

- **PocketBase Admin**: http://localhost:8090/_/
- **MinIO Console**: http://localhost:9001/
- **PocketBase API**: http://localhost:8090/api/

## 📋 사용 가능한 명령어

### NPM 스크립트

```bash
# Docker 서비스 시작
npm run docker:setup          # 개발 환경
npm run docker:setup:prod     # 프로덕션 환경

# Docker 서비스 중지
npm run docker:stop           # 개발 환경
npm run docker:stop:prod      # 프로덕션 환경

# 로그 확인
npm run docker:logs           # 개발 환경 로그
npm run docker:logs:prod      # 프로덕션 환경 로그

# 서비스 재시작
npm run docker:restart        # 개발 환경 재시작
npm run docker:restart:prod   # 프로덕션 환경 재시작
```

### 직접 스크립트 실행

```bash
# 서비스 시작
./scripts/docker-setup.sh [dev|prod]

# 서비스 중지
./scripts/docker-stop.sh [dev|prod]

# 볼륨까지 정리하여 중지
./scripts/docker-stop.sh [dev|prod] true
```

## 🐳 Docker 서비스 구성

### PocketBase
- **이미지**: `ghcr.io/pocketbase/pocketbase:latest`
- **포트**: 8090
- **데이터**: `./pocketbase/pb_data`
- **공개 파일**: `./pocketbase/pb_public`

### MinIO (파일 저장소)
- **이미지**: `minio/minio:latest`
- **포트**: 9000 (API), 9001 (Console)
- **기본 계정**: minioadmin / minioadmin123

### Redis (캐싱)
- **이미지**: `redis:7-alpine`
- **포트**: 6379
- **비밀번호**: redis123

## ⚙️ 환경 변수 설정

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
# PocketBase 설정
POCKETBASE_ENCRYPTION_KEY=your-32-char-encryption-key-here-change-this
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=admin123456

# MinIO 설정
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET=holographic-cards

# Redis 설정
REDIS_PASSWORD=redis123
REDIS_URL=redis://:redis123@localhost:6379

# 애플리케이션 설정
NODE_ENV=development
PUBLIC_APP_NAME=홀로그래픽 카드 커뮤니티
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8090
```

## 🔧 초기 설정

### 1. PocketBase 관리자 계정 생성

1. http://localhost:8090/_/ 에 접속
2. "Create admin" 클릭
3. 이메일과 비밀번호 입력
4. 관리자 계정 생성 완료

### 2. 컬렉션 설정

PocketBase Admin에서 다음 컬렉션들을 생성하세요:

- **users**: 사용자 정보
- **cards**: 카드 데이터
- **comments**: 댓글 데이터
- **templates**: 템플릿 데이터
- **reviews**: 리뷰 데이터

### 3. MinIO 버킷 설정

1. http://localhost:9001/ 에 접속
2. minioadmin / minioadmin123으로 로그인
3. `holographic-cards` 버킷 생성

## 🚨 문제 해결

### 서비스가 시작되지 않는 경우

```bash
# 로그 확인
npm run docker:logs

# 서비스 상태 확인
docker-compose ps

# 서비스 재시작
npm run docker:restart
```

### 포트 충돌 문제

다른 서비스가 같은 포트를 사용하는 경우, `docker-compose.yml`에서 포트를 변경하세요:

```yaml
ports:
  - "8091:8090"  # 8090 대신 8091 사용
```

### 데이터 초기화

```bash
# 모든 데이터 삭제 후 재시작
./scripts/docker-stop.sh dev true
./scripts/docker-setup.sh dev
```

## 📁 디렉토리 구조

```
photo-cards/
├── docker-compose.yml          # 프로덕션용 Docker Compose
├── docker-compose.dev.yml      # 개발용 Docker Compose
├── docker.env                  # 환경 변수 템플릿
├── .env                        # 실제 환경 변수 (생성 필요)
├── scripts/
│   ├── docker-setup.sh         # Docker 서비스 시작 스크립트
│   └── docker-stop.sh          # Docker 서비스 중지 스크립트
└── pocketbase/
    ├── pb_data/                # PocketBase 데이터
    ├── pb_public/              # PocketBase 공개 파일
    └── migrations/             # PocketBase 마이그레이션
```

## 🔄 개발 워크플로우

1. **개발 시작**:
   ```bash
   npm run docker:setup
   npm run dev
   ```

2. **개발 중**:
   - PocketBase Admin: http://localhost:8090/_/
   - 애플리케이션: http://localhost:5173

3. **개발 종료**:
   ```bash
   npm run docker:stop
   ```

4. **데이터 백업**:
   ```bash
   # pocketbase/pb_data 디렉토리를 백업
   tar -czf pocketbase-backup-$(date +%Y%m%d).tar.gz pocketbase/pb_data/
   ```

## 🚀 프로덕션 배포

프로덕션 환경에서는 다음 사항을 고려하세요:

1. **보안 설정**:
   - 강력한 암호화 키 사용
   - 관리자 비밀번호 변경
   - HTTPS 사용

2. **데이터 백업**:
   - 정기적인 데이터베이스 백업
   - 파일 저장소 백업

3. **모니터링**:
   - 서비스 상태 모니터링
   - 로그 모니터링
   - 리소스 사용량 모니터링
