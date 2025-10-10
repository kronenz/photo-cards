#!/bin/bash

# Docker PocketBase 중지 스크립트
# 사용법: ./scripts/docker-stop.sh [dev|prod]

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

# Docker 서비스 중지
stop_services() {
    local mode=${1:-dev}
    
    log_info "Docker 서비스 중지 중... (모드: $mode)"
    
    if [ "$mode" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    log_success "Docker 서비스가 중지되었습니다"
}

# 볼륨 정리 (선택사항)
cleanup_volumes() {
    local cleanup=${1:-false}
    
    if [ "$cleanup" = "true" ]; then
        log_warning "볼륨을 정리합니다. 모든 데이터가 삭제됩니다!"
        read -p "정말로 계속하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker volume prune -f
            log_success "볼륨이 정리되었습니다"
        else
            log_info "볼륨 정리를 취소했습니다"
        fi
    fi
}

# 메인 함수
main() {
    local mode=${1:-dev}
    local cleanup=${2:-false}
    
    log_info "Docker PocketBase 서비스를 중지합니다..."
    
    stop_services "$mode"
    cleanup_volumes "$cleanup"
    
    log_success "Docker PocketBase 서비스 중지가 완료되었습니다!"
    echo ""
    log_info "다시 시작하려면: ./scripts/docker-setup.sh $mode"
    log_info "볼륨까지 정리하려면: ./scripts/docker-stop.sh $mode true"
}

# 스크립트 실행
main "$@"
