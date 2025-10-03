# Vercel 배포 가이드

## 배포 설정 완료 사항

✅ `@sveltejs/adapter-vercel` 설치 및 설정
✅ `vercel.json` 설정 파일 생성
✅ 환경 변수 예시 업데이트
✅ 빌드 스크립트 최적화

## Vercel 대시보드에서 설정해야 할 환경 변수

프로젝트 설정 > Environment Variables에서 다음 변수들을 설정하세요:

### 필수 환경 변수
```
AUTH_SECRET=your_random_secret_key_here
PUBLIC_APP_NAME=Holographic Card Community
PUBLIC_APP_URL=https://photo-cards-git-main-byun-sanghyeons-projects.vercel.app
```

### OAuth 설정 (필요한 경우)
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### PocketBase 설정 (백엔드 사용 시)
```
PUBLIC_API_URL=https://your-pocketbase-url.com
POCKETBASE_URL=https://your-pocketbase-url.com
```

## 배포 명령어

로컬에서 빌드 테스트:
```bash
npm run build:vercel
```

## 주요 변경 사항

1. **Adapter 변경**: `@sveltejs/adapter-static` → `@sveltejs/adapter-vercel`
2. **Runtime 설정**: Node.js 18.x 사용
3. **보안 헤더**: XSS 보호, 콘텐츠 타입 보호 등 추가
4. **SPA 라우팅**: 모든 경로를 index.html로 리다이렉트

## 배포 후 확인사항

- [ ] 메인 페이지 로딩 확인
- [ ] 라우팅 동작 확인
- [ ] 환경 변수 적용 확인
- [ ] 정적 자산 로딩 확인