/**
 * Error Handler Service
 * Feature: 004-production-service-integration (T006, T068)
 *
 * Centralized error handling with Korean error messages
 */

/**
 * Error codes mapped to Korean messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/invalid-credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/email-already-exists': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호가 너무 약합니다. 8자 이상으로 설정해주세요.',
  'auth/user-not-found': '등록되지 않은 사용자입니다.',
  'auth/session-expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'auth/unauthorized': '로그인이 필요합니다.',
  'auth/forbidden': '접근 권한이 없습니다.',
  'auth/oauth-failed': 'OAuth 인증에 실패했습니다. 다시 시도해주세요.',
  'auth/account-disabled': '비활성화된 계정입니다. 관리자에게 문의해주세요.',

  // Upload errors
  'upload/file-too-large': '파일 크기가 10MB를 초과합니다.',
  'upload/invalid-type': '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)',
  'upload/upload-failed': '파일 업로드에 실패했습니다. 다시 시도해주세요.',
  'upload/presign-failed': '업로드 준비에 실패했습니다.',
  'upload/storage-full': '저장 공간이 부족합니다.',
  'upload/processing-failed': '이미지 처리에 실패했습니다.',

  // Card errors
  'card/not-found': '카드를 찾을 수 없습니다.',
  'card/create-failed': '카드 생성에 실패했습니다.',
  'card/update-failed': '카드 수정에 실패했습니다.',
  'card/delete-failed': '카드 삭제에 실패했습니다.',
  'card/invalid-data': '카드 정보가 올바르지 않습니다.',

  // Collection errors
  'collection/not-found': '컬렉션을 찾을 수 없습니다.',
  'collection/load-failed': '컬렉션을 불러오는데 실패했습니다.',
  'collection/favorite-failed': '즐겨찾기 설정에 실패했습니다.',

  // Social errors
  'social/like-failed': '좋아요 처리에 실패했습니다.',
  'social/comment-failed': '댓글 작성에 실패했습니다.',
  'social/comment-delete-failed': '댓글 삭제에 실패했습니다.',
  'social/share-failed': '공유 설정에 실패했습니다.',
  'social/follow-failed': '팔로우 처리에 실패했습니다.',
  'social/comment-too-long': '댓글은 500자 이내로 작성해주세요.',

  // Gacha errors
  'gacha/pull-failed': '카드 뽑기에 실패했습니다.',
  'gacha/save-failed': '가챠 결과 저장에 실패했습니다.',
  'gacha/history-failed': '가챠 이력을 불러오는데 실패했습니다.',

  // Network errors
  'network/offline': '인터넷 연결을 확인해주세요.',
  'network/timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  'network/server-error': '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'network/unknown': '알 수 없는 오류가 발생했습니다.',

  // Validation errors
  'validation/required': '필수 입력 항목입니다.',
  'validation/email': '올바른 이메일 형식이 아닙니다.',
  'validation/password-mismatch': '비밀번호가 일치하지 않습니다.',
  'validation/min-length': '최소 글자 수를 충족하지 않습니다.',
  'validation/max-length': '최대 글자 수를 초과했습니다.',

  // Generic errors
  'error/unknown': '오류가 발생했습니다. 다시 시도해주세요.',
  'error/rate-limit': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'error/maintenance': '서비스 점검 중입니다.'
};

/**
 * HTTP status code to error message mapping
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  409: '충돌이 발생했습니다. 새로고침 후 다시 시도해주세요.',
  413: '파일 크기가 너무 큽니다.',
  422: '입력 데이터를 처리할 수 없습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다.',
  502: '서버 연결에 실패했습니다.',
  503: '서비스를 일시적으로 이용할 수 없습니다.',
  504: '서버 응답 시간이 초과되었습니다.'
};

/**
 * Get Korean error message from error code
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES['error/unknown'];
}

/**
 * Get Korean error message from HTTP status code
 */
export function getHttpErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || ERROR_MESSAGES['error/unknown'];
}

/**
 * Parse error from various sources and return Korean message
 */
export function parseError(error: unknown): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  if (error instanceof Error) {
    // Check if it's a PocketBase error
    const pbError = error as any;
    if (pbError.status) {
      return getHttpErrorMessage(pbError.status);
    }

    // Check for specific error codes in message
    for (const code of Object.keys(ERROR_MESSAGES)) {
      if (error.message.includes(code)) {
        return ERROR_MESSAGES[code];
      }
    }

    return error.message || ERROR_MESSAGES['error/unknown'];
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;

    // Check for error code
    if (errObj.code && ERROR_MESSAGES[errObj.code]) {
      return ERROR_MESSAGES[errObj.code];
    }

    // Check for HTTP status
    if (errObj.status && HTTP_ERROR_MESSAGES[errObj.status]) {
      return HTTP_ERROR_MESSAGES[errObj.status];
    }

    // Check for message field
    if (errObj.message) {
      return errObj.message;
    }
  }

  return ERROR_MESSAGES['error/unknown'];
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('offline') ||
      message.includes('failed to fetch')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;
    return errObj.status === 401 || errObj.status === 403;
  }
  return false;
}

/**
 * Log error for debugging (only in development)
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}

/**
 * Create a standardized error response
 */
export interface AppError {
  code: string;
  message: string;
  details?: string;
  recoverable: boolean;
}

export function createAppError(
  code: string,
  details?: string,
  recoverable = true
): AppError {
  return {
    code,
    message: getErrorMessage(code),
    details,
    recoverable
  };
}
