# MinIO Erasure Set 구성 가이드

## 📋 Erasure Set이란?

MinIO의 Erasure Set은 데이터를 여러 디스크에 분산 저장하여 **고가용성**과 **데이터 보호**를 제공하는 기능입니다.

### 🔧 Erasure Set 구성 요구사항

- **최소 디스크 수**: 4개
- **권장 디스크 수**: 4, 6, 8, 10, 12, 14, 16개
- **패리티 레벨**: 디스크 수의 절반 (예: 4개 디스크 → 2개 패리티)

## 🚀 구성 옵션

### 1. 개발용 (단일 디스크)
```yaml
# docker-compose.dev.yml
minio:
  command: server /data --console-address ":9001"
  volumes:
    - minio_data_dev:/data
```
- **용도**: 개발 및 테스트
- **특징**: Erasure coding 없음, 빠른 설정
- **데이터 보호**: 없음 (디스크 장애 시 데이터 손실)

### 2. 프로덕션용 (4디스크 Erasure Set)
```yaml
# docker-compose.yml
minio:
  command: server /data1 /data2 /data3 /data4 --console-address ":9001"
  volumes:
    - minio_data1:/data1
    - minio_data2:/data2
    - minio_data3:/data3
    - minio_data4:/data4
```
- **용도**: 프로덕션 환경
- **특징**: 2개 디스크 장애까지 복구 가능
- **데이터 보호**: 높음

### 3. 클러스터용 (4노드 Erasure Set)
```yaml
# docker-compose.minio-cluster.yml
minio1:
  command: server http://minio{1...4}/data --console-address ":9001"
minio2:
  command: server http://minio{1...4}/data --console-address ":9001"
minio3:
  command: server http://minio{1...4}/data --console-address ":9001"
minio4:
  command: server http://minio{1...4}/data --console-address ":9001"
```
- **용도**: 고가용성 프로덕션 환경
- **특징**: 노드 장애 시에도 서비스 지속
- **데이터 보호**: 최고

## 📊 Erasure Set 성능 비교

| 구성 | 디스크 수 | 패리티 | 최대 장애 허용 | 용량 효율성 | 성능 |
|------|-----------|--------|----------------|-------------|------|
| 단일 디스크 | 1 | 0 | 0 | 100% | 최고 |
| 4디스크 | 4 | 2 | 2 | 50% | 높음 |
| 6디스크 | 6 | 3 | 3 | 50% | 높음 |
| 8디스크 | 8 | 4 | 4 | 50% | 중간 |
| 16디스크 | 16 | 8 | 8 | 50% | 낮음 |

## 🛠️ 사용 방법

### 개발 환경 시작
```bash
# 단일 디스크 모드 (빠른 개발용)
npm run docker:setup
```

### 프로덕션 환경 시작
```bash
# 4디스크 erasure set 모드
npm run docker:setup:prod
```

### 클러스터 환경 시작
```bash
# 4노드 클러스터 모드 (고가용성)
npm run docker:minio:cluster
```

## 🔍 Erasure Set 상태 확인

### 1. MinIO Console에서 확인
1. http://localhost:9001 접속
2. 로그인 후 "Cluster" 탭 확인
3. 디스크 상태 및 erasure set 정보 확인

### 2. 명령어로 확인
```bash
# MinIO 클라이언트 설치
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# MinIO 서버에 연결
mc alias set myminio http://localhost:9000 minioadmin minioadmin123

# 클러스터 정보 확인
mc admin info myminio

# 디스크 상태 확인
mc admin heal myminio
```

## ⚠️ 주의사항

### 1. 디스크 용량
- 모든 디스크는 **동일한 용량**이어야 합니다
- 가장 작은 디스크 용량에 맞춰 전체 용량이 결정됩니다

### 2. 네트워크 설정
- 클러스터 모드에서는 모든 노드가 서로 통신 가능해야 합니다
- 방화벽 설정 확인 필요

### 3. 데이터 마이그레이션
- 단일 디스크에서 erasure set으로 마이그레이션은 **불가능**합니다
- 새로 설정하여 데이터를 다시 업로드해야 합니다

## 🔧 문제 해결

### 1. Erasure Set이 제대로 구성되지 않는 경우
```bash
# 모든 컨테이너 중지
docker-compose down

# 볼륨 삭제 (데이터 손실 주의!)
docker volume prune -f

# 다시 시작
docker-compose up -d
```

### 2. 디스크 용량 불일치 오류
```bash
# 각 디스크 용량 확인
docker exec photo-cards-minio ls -la /data1
docker exec photo-cards-minio ls -la /data2
docker exec photo-cards-minio ls -la /data3
docker exec photo-cards-minio ls -la /data4
```

### 3. 클러스터 노드 연결 실패
```bash
# 네트워크 연결 확인
docker network ls
docker network inspect photo-cards_photo-cards-network

# 컨테이너 간 통신 테스트
docker exec photo-cards-minio-1 ping minio2
docker exec photo-cards-minio-1 ping minio3
docker exec photo-cards-minio-1 ping minio4
```

## 📈 성능 최적화

### 1. 디스크 I/O 최적화
```yaml
# docker-compose.yml에 추가
minio:
  ulimits:
    nofile:
      soft: 65536
      hard: 65536
```

### 2. 메모리 최적화
```yaml
# docker-compose.yml에 추가
minio:
  environment:
    - MINIO_CACHE_DRIVES=/tmp/cache
    - MINIO_CACHE_EXCLUDE=*.pdf,*.mp4
    - MINIO_CACHE_QUOTA=80
    - MINIO_CACHE_AFTER=3
    - MINIO_CACHE_WATERMARK_LOW=70
    - MINIO_CACHE_WATERMARK_HIGH=90
```

### 3. 네트워크 최적화
```yaml
# docker-compose.yml에 추가
minio:
  sysctls:
    - net.core.rmem_max=16777216
    - net.core.wmem_max=16777216
```

## 🎯 권장 설정

### 개발 환경
- **구성**: 단일 디스크
- **용량**: 10GB
- **용도**: 빠른 개발 및 테스트

### 스테이징 환경
- **구성**: 4디스크 erasure set
- **용량**: 각 50GB
- **용도**: 프로덕션과 유사한 환경 테스트

### 프로덕션 환경
- **구성**: 4노드 클러스터 (각 노드 4디스크)
- **용량**: 각 1TB
- **용도**: 고가용성 및 대용량 데이터 처리
