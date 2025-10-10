/**
 * Error Handler Utility
 * Feature: 003-navigation-ui-renewal
 * Backend Integration: Centralized error handling for PocketBase
 */

import { goto } from '$app/navigation';

export class AppError extends Error {
	constructor(
		message: string,
		public code: string,
		public fieldErrors?: Record<string, string>
	) {
		super(message);
		this.name = 'AppError';
	}
}

/**
 * Handle PocketBase errors with type-safe AppError
 * @param error - PocketBase error object
 * @returns AppError with translated message
 */
export function handlePocketBaseError(error: any): AppError {
	// Unauthorized - redirect to login
	if (error.status === 401) {
		goto('/login');
		return new AppError('로그인이 필요합니다', 'UNAUTHORIZED');
	}

	// Validation errors - extract field-level errors
	if (error.status === 400 || error.status === 422) {
		const fieldErrors: Record<string, string> = {};
		if (error.data?.data) {
			for (const [field, err] of Object.entries(error.data.data as Record<string, any>)) {
				fieldErrors[field] = (err as any).message;
			}
		}
		return new AppError('입력값이 올바르지 않습니다', 'VALIDATION_ERROR', fieldErrors);
	}

	// Not found
	if (error.status === 404) {
		return new AppError('요청한 데이터를 찾을 수 없습니다', 'NOT_FOUND');
	}

	// Forbidden
	if (error.status === 403) {
		return new AppError('접근 권한이 없습니다', 'FORBIDDEN');
	}

	// Server error
	if (error.status >= 500) {
		return new AppError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'SERVER_ERROR');
	}

	// Generic error
	return new AppError(error.message || '알 수 없는 오류가 발생했습니다', 'UNKNOWN_ERROR');
}

/**
 * Display error as toast notification
 * @param error - AppError or Error object
 */
export function showErrorToast(error: AppError | Error) {
	// This will be implemented with ToastNotification component
	console.error(error);
}
