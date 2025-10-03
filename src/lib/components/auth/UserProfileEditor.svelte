<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService, user } from '$lib/services/authService';
	import { KBO_TEAMS } from '$lib/data/kboTeams';
	import type { UserProfile, KBOTeam } from '$lib/types/auth';
	import TeamBadgeSelector from './TeamBadgeSelector.svelte';
	import AvatarUploader from './AvatarUploader.svelte';

	export let isOpen = false;

	const dispatch = createEventDispatcher();
	let isLoading = false;
	let error: string | null = null;
	let avatarFile: File | null = null;

	// Form data
	let formData: Partial<UserProfile> = {};

	// Initialize form data when user changes
	$: if ($user && isOpen) {
		formData = {
			displayName: $user.displayName,
			bio: $user.bio,
			location: $user.location,
			website: $user.website,
			favoriteTeam: $user.favoriteTeam,
			fanSince: $user.fanSince,
			favoritePlayer: $user.favoritePlayer,
			preferences: { ...$user.preferences }
		};
	}

	async function handleSubmit() {
		if (!$user) return;

		isLoading = true;
		error = null;

		try {
			// Upload avatar if selected
			if (avatarFile) {
				await authService.updateAvatar(avatarFile);
			}

			// Update profile
			await authService.updateProfile(formData);

			dispatch('success');
			isOpen = false;
		} catch (err) {
			error = err instanceof Error ? err.message : '프로필 업데이트에 실패했습니다.';
		} finally {
			isLoading = false;
		}
	}

	function handleAvatarUpload(event: CustomEvent<File>) {
		avatarFile = event.detail;
	}

	function handleAvatarRemove() {
		avatarFile = null;
	}

	function handleClose() {
		if (!isLoading) {
			isOpen = false;
			avatarFile = null;
			dispatch('close');
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}


</script>

{#if isOpen && $user}
	<!-- Modal Backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="profile-title"
	>
		<!-- Modal Content -->
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
				<h2 id="profile-title" class="text-xl font-bold text-gray-900 dark:text-white">
					프로필 편집
				</h2>
				<button
					on:click={handleClose}
					disabled={isLoading}
					class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
					aria-label="닫기"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
				<!-- Error Message -->
				{#if error}
					<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				{/if}

				<!-- Avatar Section -->
				<div class="flex justify-center">
					<AvatarUploader 
						currentAvatar={$user?.avatar}
						disabled={isLoading}
						size="lg"
						on:upload={handleAvatarUpload}
						on:remove={handleAvatarRemove}
					/>
				</div>

				<!-- Basic Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							표시 이름
						</label>
						<input
							type="text"
							bind:value={formData.displayName}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
							placeholder="홍길동"
							disabled={isLoading}
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							위치
						</label>
						<input
							type="text"
							bind:value={formData.location}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
							placeholder="서울, 대한민국"
							disabled={isLoading}
						/>
					</div>
				</div>

				<!-- Bio -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						자기소개
					</label>
					<textarea
						bind:value={formData.bio}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
						placeholder="야구를 사랑하는 홀로그래픽 카드 크리에이터입니다..."
						disabled={isLoading}
					></textarea>
				</div>

				<!-- Website -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						웹사이트
					</label>
					<input
						type="url"
						bind:value={formData.website}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						placeholder="https://example.com"
						disabled={isLoading}
					/>
				</div>

				<!-- KBO Fan Information -->
				<div class="border-t border-gray-200 dark:border-gray-700 pt-6">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">KBO 팬 정보</h3>
					
					<!-- Favorite Team -->
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							응원하는 팀
						</label>
						<TeamBadgeSelector 
							selectedTeam={formData.favoriteTeam}
							disabled={isLoading}
							on:select={(e) => formData.favoriteTeam = e.detail}
							on:clear={() => formData.favoriteTeam = undefined}
						/>
					</div>

					<!-- Fan Since & Favorite Player -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								팬이 된 시기
							</label>
							<input
								type="text"
								bind:value={formData.fanSince}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								placeholder="2010년"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								좋아하는 선수
							</label>
							<input
								type="text"
								bind:value={formData.favoritePlayer}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								placeholder="이승엽"
								disabled={isLoading}
							/>
						</div>
					</div>
				</div>

				<!-- Preferences -->
				{#if formData.preferences}
					<div class="border-t border-gray-200 dark:border-gray-700 pt-6">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">설정</h3>
						
						<div class="space-y-4">
							<label class="flex items-center gap-3">
								<input
									type="checkbox"
									bind:checked={formData.preferences.publicProfile}
									class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									disabled={isLoading}
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">공개 프로필</span>
							</label>

							<label class="flex items-center gap-3">
								<input
									type="checkbox"
									bind:checked={formData.preferences.showStats}
									class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									disabled={isLoading}
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">통계 표시</span>
							</label>

							<label class="flex items-center gap-3">
								<input
									type="checkbox"
									bind:checked={formData.preferences.emailNotifications}
									class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									disabled={isLoading}
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">이메일 알림</span>
							</label>
						</div>
					</div>
				{/if}

				<!-- Action Buttons -->
				<div class="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
					<button
						type="button"
						on:click={handleClose}
						disabled={isLoading}
						class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
					>
						취소
					</button>
					<button
						type="submit"
						disabled={isLoading}
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{#if isLoading}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						{/if}
						저장
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}