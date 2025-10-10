<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let error: string = '';
	let errorDescription: string = '';

	onMount(() => {
		const errorParam = $page.url.searchParams.get('error');
		const errorDescriptionParam = $page.url.searchParams.get('error_description');
		
		error = errorParam || 'unknown_error';
		errorDescription = errorDescriptionParam || '알 수 없는 오류가 발생했습니다.';
	});

	function getErrorMessage(errorCode: string): string {
		const errorMessages: Record<string, string> = {
			'access_denied': '로그인이 취소되었습니다.',
			'invalid_request': '잘못된 요청입니다.',
			'unauthorized_client': '인증되지 않은 클라이언트입니다.',
			'unsupported_response_type': '지원하지 않는 응답 유형입니다.',
			'invalid_scope': '잘못된 권한 범위입니다.',
			'server_error': '서버 오류가 발생했습니다.',
			'temporarily_unavailable': '서비스가 일시적으로 사용할 수 없습니다.',
			'unknown_error': '알 수 없는 오류가 발생했습니다.'
		};
		
		return errorMessages[errorCode] || errorMessages['unknown_error'];
	}

	function handleRetry() {
		goto('/auth/signin');
	}

	function handleGoHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>로그인 오류 - 홀로그래픽 카드 커뮤니티</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Error Icon -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				로그인 오류
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				로그인 중에 문제가 발생했습니다
			</p>
		</div>

		<!-- Error Details -->
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					오류 내용
				</h3>
				<p class="text-gray-700 dark:text-gray-300">
					{getErrorMessage(error)}
				</p>
			</div>

			{#if errorDescription && errorDescription !== getErrorMessage(error)}
				<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
					<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
						상세 정보
					</h4>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{errorDescription}
					</p>
				</div>
			{/if}
		</div>

		<!-- Troubleshooting Tips -->
		<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
			<h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
				해결 방법
			</h3>
			<ul class="text-sm text-blue-800 dark:text-blue-400 space-y-1">
				<li>• 브라우저를 새로고침하고 다시 시도해보세요</li>
				<li>• 팝업 차단이 해제되어 있는지 확인해보세요</li>
				<li>• 다른 브라우저나 시크릿 모드를 사용해보세요</li>
				<li>• 문제가 지속되면 고객지원에 문의해주세요</li>
			</ul>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-3">
			<button
				on:click={handleRetry}
				class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
			>
				다시 시도
			</button>
			<button
				on:click={handleGoHome}
				class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
			>
				홈으로
			</button>
		</div>

		<!-- Support Link -->
		<div class="text-center mt-6">
			<p class="text-sm text-gray-500 dark:text-gray-400">
				문제가 계속 발생하나요? 
				<a href="/support" class="text-blue-600 dark:text-blue-400 hover:underline">
					고객지원 센터
				</a>에 문의하세요
			</p>
		</div>
	</div>
</div>