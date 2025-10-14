# 회원가입 디버깅 가이드

## 현재 상태
- ✅ Supabase API는 정상 작동 (curl 테스트 성공)
- ✅ users 테이블 생성됨
- ✅ 자동 프로필 생성 트리거 설정됨
- ✅ 이메일 자동 확인 활성화됨
- ⚠️ 브라우저에서 회원가입 실패

## 확인 사항

### 1. 브라우저 개발자 도구에서 확인
1. http://localhost:5173/register 접속
2. F12 눌러서 개발자 도구 열기
3. Console 탭에서 확인:
   ```
   [SupabaseAuth] Starting signUp for: ...
   [SupabaseAuth] SignUp response: ...
   ```
4. Network 탭에서 확인:
   - `/auth/v1/signup` 요청의 Status Code
   - Response Body

### 2. 예상되는 문제들

#### 문제 A: CORS 에러
```
Access to fetch at 'http://localhost:8100/auth/v1/signup' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**해결:** Backend Kong 설정 확인 필요

#### 문제 B: 네트워크 에러
```
Failed to fetch
```
**해결:** Supabase 서비스 재시작 필요

#### 문제 C: 중복 이메일
```
User already registered
```
**해결:** 다른 이메일 사용

#### 문제 D: 비밀번호 조건 미충족
```
Password should be at least 6 characters
```
**해결:** 더 강한 비밀번호 사용 (8자 이상, 대소문자+숫자)

### 3. 수동 테스트

터미널에서 다음 명령어로 직접 테스트:

```bash
curl -X POST 'http://localhost:8100/auth/v1/signup' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE' \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_EMAIL@example.com","password":"YOUR_PASSWORD","data":{"display_name":"Your Name"}}'
```

성공하면:
```json
{
  "access_token": "...",
  "user": {
    "id": "...",
    "email": "..."
  }
}
```

### 4. 로그 확인

프론트엔드 서버 로그:
```bash
tail -f /tmp/vite.log
```

Supabase Auth 로그:
```bash
docker logs supabase-auth --tail 50 -f
```

## 성공 확인

회원가입 성공 시:
1. 브라우저에서 `/` (홈)으로 리다이렉트
2. 데이터베이스에 레코드 생성:
   ```bash
   docker exec supabase-db psql -U postgres -c "SELECT email, username FROM public.users ORDER BY created_at DESC LIMIT 1;"
   ```

## 빠른 해결 방법

모든 것이 실패하면:
1. Supabase 재시작:
   ```bash
   cd /root/develop/baseball/frontend/backend
   docker-compose restart supabase-auth
   ```

2. 프론트엔드 재시작:
   ```bash
   cd /root/develop/baseball/frontend/photo-cards
   lsof -ti:5173 | xargs kill -9
   npm run dev
   ```

3. 브라우저 캐시 삭제:
   - Ctrl+Shift+Delete
   - 캐시 및 쿠키 삭제
   - 페이지 새로고침
