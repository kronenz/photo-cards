<script lang="ts">
	import { writable } from 'svelte/store';
	import UserProfileEditor from '$lib/components/auth/UserProfileEditor.svelte';
	import UserProfileCard from '$lib/components/auth/UserProfileCard.svelte';
	import TeamBadgeSelector from '$lib/components/auth/TeamBadgeSelector.svelte';
	import AvatarUploader from '$lib/components/auth/AvatarUploader.svelte';
	import type { UserProfile } from '$lib/types/auth';
	import { USER_GRADES } from '$lib/types/auth';

	let showProfileEditor = false;
	let selectedTeam = undefined;
	let avatarFile = null;

	// Mock user for demo
	const mockUser: UserProfile = {
		id: 'demo-user-123',
		email: 'demo@example.com',
		username: 'demo_user',
		displayName: '데모 사용자',
		avatar: undefined,
		bio: '홀로그래픽 카드를 사랑하는 KBO 팬입니다.',
		location: '서울, 대한민국',
		website: 'https://example.com',
		favoriteTeam: undefined,
		fanSince: '2010년',
		stadiumVisits: ['잠실야구장', '고척스카이돔'],
		favoritePlayer: '이승엽',
		grade: USER_GRADES.fan,
		stats: {
			cardsCreated: 15,
			totalLikes: 234,
			totalViews: 1250,
			followers: 45,
			following: 32,
			gradePoints: 350,
			commentsReceived: 89,
			featuredCards: 3,
			monthlyActive: true,
			joinDate: '2023-01-15T00:00:00Z',
			lastActive: new Date().toISOString()
		},
		preferences: {
			emailNotifications: true,
			pushNotifications: true,
			publicProfile: true,
			showStats: true,
			theme: 'dark',
			language: 'ko',
			holographicQuality: 'high',
			autoSave: true
		},
		isVerified: false,
		badges: ['early-adopter', 'card-creator'],
		achievements: ['first-card', 'popular-creator'],
		created: '2023-01-15T00:00:00Z',
		updated: new Date().toISOString()
	};

	// Create a writable store for the mock user
	const user = writable(mockUser);

	function handleEditProfile() {
		showProfileEditor = true;
	}

	function handleAvatarUpload(event) {
		avatarFile = event.detail;
		console.log('Avatar uploaded:', avatarFile.name);
	}

	function handleTeamSelect(event) {
		selectedTeam = event.detail;
		console.log('Team selected:', selectedTeam.name);
	}
</script>

<svelte:head>
	<title>OAuth 인증 데모 - Holographic Card Community</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-white mb-4">사용자 프로필 시스템 데모</h1>
			<p class="text-xl text-white/80">Apple 스타일 프로필 편집 & KBO 팬 인증</p>
		</div>

		<!-- Demo Components -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<!-- Avatar Uploader Demo -->
			<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
				<h2 class="text-2xl font-bold text-white mb-4">아바타 업로더</h2>
				<div class="flex justify-center">
					<AvatarUploader 
						currentAvatar={$user.avatar}
						size="lg"
						on:upload={handleAvatarUpload}
						on:remove={() => console.log('Avatar removed')}
					/>
				</div>
			</div>

			<!-- Team Badge Selector Demo -->
			<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
				<h2 class="text-2xl font-bold text-white mb-4">팀 선택</h2>
				<TeamBadgeSelector 
					selectedTeam={selectedTeam}
					on:select={handleTeamSelect}
					on:clear={() => selectedTeam = undefined}
				/>
			</div>
		</div>

		<!-- User Profile Info -->
		<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
			<h2 class="text-2xl font-bold text-white mb-4">사용자 정보</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
				<div>
					<p><strong>이름:</strong> {$user.displayName}</p>
					<p><strong>이메일:</strong> {$user.email}</p>
					<p><strong>등급:</strong> {$user.grade.koreanName} ({$user.grade.points}점)</p>
					<p><strong>응원팀:</strong> {$user.favoriteTeam?.name || '선택 안함'}</p>
				</div>
				<div>
					<p><strong>카드 제작:</strong> {$user.stats.cardsCreated}개</p>
					<p><strong>총 좋아요:</strong> {$user.stats.totalLikes}개</p>
					<p><strong>팔로워:</strong> {$user.stats.followers}명</p>
					<p><strong>가입일:</strong> {new Date($user.created).toLocaleDateString('ko-KR')}</p>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex flex-wrap gap-4 justify-center mb-8">
			<button
				on:click={handleEditProfile}
				class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
			>
				프로필 편집
			</button>
		</div>

		<!-- User Profile Card -->
		<div class="flex justify-center">
			<UserProfileCard profile={$user} />
		</div>
	</div>
</div>

<!-- Modals -->
<UserProfileEditor 
	bind:isOpen={showProfileEditor}
	on:success={() => showProfileEditor = false}
	on:close={() => showProfileEditor = false}
/>