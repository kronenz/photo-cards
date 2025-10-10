#!/bin/bash

# Docker PocketBase 설정 스크립트
# 사용법: ./scripts/docker-setup.sh [dev|prod]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 확인
check_requirements() {
    log_info "시스템 요구사항 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다. Docker를 먼저 설치해주세요."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다. Docker Compose를 먼저 설치해주세요."
        exit 1
    fi
    
    log_success "시스템 요구사항 확인 완료"
}

# 환경 변수 파일 생성
setup_env_file() {
    log_info "환경 변수 파일 설정 중..."
    
    if [ ! -f ".env" ]; then
        if [ -f "docker.env" ]; then
            cp docker.env .env
            log_success ".env 파일이 생성되었습니다 (docker.env에서 복사)"
        else
            log_warning ".env 파일이 없습니다. docker.env 파일을 참고하여 .env 파일을 생성해주세요."
        fi
    else
        log_info ".env 파일이 이미 존재합니다."
    fi
}

# PocketBase 데이터 디렉토리 생성
setup_pocketbase_directories() {
    log_info "PocketBase 데이터 디렉토리 설정 중..."
    
    mkdir -p pocketbase/pb_data
    mkdir -p pocketbase/pb_public
    mkdir -p pocketbase/migrations
    
    # 권한 설정
    chmod 755 pocketbase/pb_data
    chmod 755 pocketbase/pb_public
    chmod 755 pocketbase/migrations
    
    log_success "PocketBase 디렉토리 설정 완료"
}

# Docker 서비스 시작
start_services() {
    local mode=${1:-dev}
    
    log_info "Docker 서비스 시작 중... (모드: $mode)"
    
    if [ "$mode" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "Docker 서비스가 시작되었습니다"
}

# 서비스 상태 확인
check_services() {
    log_info "서비스 상태 확인 중..."
    
    # PocketBase 상태 확인
    if curl -f http://localhost:8090/api/health &> /dev/null; then
        log_success "PocketBase가 정상적으로 실행 중입니다 (http://localhost:8090)"
    else
        log_warning "PocketBase가 아직 준비되지 않았습니다. 잠시 후 다시 확인해주세요."
    fi
    
    # MinIO 상태 확인
    if curl -f http://localhost:9000/minio/health/live &> /dev/null; then
        log_success "MinIO가 정상적으로 실행 중입니다 (http://localhost:9000)"
    else
        log_warning "MinIO가 아직 준비되지 않았습니다. 잠시 후 다시 확인해주세요."
    fi
    
    # Redis 상태 확인
    if docker exec photo-cards-redis-dev redis-cli ping &> /dev/null || docker exec photo-cards-redis redis-cli ping &> /dev/null; then
        log_success "Redis가 정상적으로 실행 중입니다"
    else
        log_warning "Redis가 아직 준비되지 않았습니다. 잠시 후 다시 확인해주세요."
    fi
}

# 초기 데이터 설정
setup_initial_data() {
    log_info "초기 데이터 설정 중..."
    
    # PocketBase 마이그레이션 실행
    if [ -d "pocketbase/migrations" ] && [ "$(ls -A pocketbase/migrations)" ]; then
        log_info "PocketBase 마이그레이션 실행 중..."
        # 마이그레이션은 PocketBase가 시작된 후 수동으로 실행해야 합니다
        log_warning "PocketBase 마이그레이션은 수동으로 실행해주세요:"
        log_warning "1. http://localhost:8090/_/ 에서 관리자 계정을 생성하세요"
        log_warning "2. Collections 탭에서 필요한 컬렉션을 생성하세요"
    fi
    
    log_success "초기 데이터 설정 완료"
}

# 메인 함수
main() {
    local mode=${1:-dev}
    
    log_info "Docker PocketBase 설정을 시작합니다..."
    
    check_requirements
    setup_env_file
    setup_pocketbase_directories
    start_services "$mode"
    
    log_info "서비스가 시작되었습니다. 잠시 후 상태를 확인합니다..."
    sleep 10
    check_services
    setup_initial_data
    
    log_success "Docker PocketBase 설정이 완료되었습니다!"
    echo ""
    log_info "다음 URL에서 서비스에 접근할 수 있습니다:"
    log_info "- PocketBase Admin: http://localhost:8090/_/"
    log_info "- MinIO Console: http://localhost:9001/"
    log_info "- PocketBase API: http://localhost:8090/api/"
    echo ""
    log_info "서비스 중지: docker-compose down"
    log_info "서비스 재시작: docker-compose up -d"
    log_info "로그 확인: docker-compose logs -f"
}

# 스크립트 실행
main "$@"
