<script lang="ts">
	import { onMount } from 'svelte';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>홀로그래픽 카드 커뮤니티</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
	<div class="container mx-auto px-4 py-16">
		<div class="text-center">
			<h1 class="text-6xl font-bold text-white mb-6 gradient-text">
				홀로그래픽 카드 커뮤니티
			</h1>
			<p class="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
				야구 사진을 업로드하고 홀로그래픽 효과를 적용하여 나만의 특별한 카드를 만들어보세요. 
				커뮤니티와 함께 포토카드 문화를 즐겨보세요.
			</p>
			
			<div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
				<a 
					href="/auth/signin" 
					class="inline-block bg-white text-purple-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
				>
					시작하기
				</a>
				<a 
					href="/gallery" 
					class="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-purple-900 transition-colors"
				>
					갤러리 둘러보기
				</a>
			</div>
		</div>

		{#if mounted}
			<div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="text-center text-white">
					<div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">카드 제작</h3>
					<p class="text-gray-300">사진을 업로드하고 홀로그래픽 효과를 적용하여 멋진 카드를 만들어보세요</p>
				</div>

				<div class="text-center text-white">
					<div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">커뮤니티</h3>
					<p class="text-gray-300">다른 사용자들과 카드를 공유하고 소통하며 포토카드 문화를 즐겨보세요</p>
				</div>

				<div class="text-center text-white">
					<div class="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">등급 시스템</h3>
					<p class="text-gray-300">활동에 따라 등급이 올라가며 특별한 권한과 혜택을 받을 수 있습니다</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.gradient-text {
		background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>