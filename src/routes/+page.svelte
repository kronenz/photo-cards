<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import HolographicCard from '$lib/components/HolographicCard.svelte';
	
	let mounted = false;
	let heroCards = [
		{ 
			id: 1, 
			title: "류현진", 
			effect: "cosmic", 
			rarity: "홀로 레어",
			image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=300&h=400&fit=crop&crop=face",
			team: "Toronto Blue Jays",
			position: "P",
			stats: { rating: 4.9, likes: 1247, views: "12.5k" }
		},
		{ 
			id: 2, 
			title: "김하성", 
			effect: "rainbow", 
			rarity: "레인보우 레어",
			image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300&h=400&fit=crop&crop=face",
			team: "San Diego Padres",
			position: "SS",
			stats: { rating: 4.7, likes: 892, views: "8.9k" }
		},
		{ 
			id: 3, 
			title: "최지만", 
			effect: "aurora", 
			rarity: "오로라 레어",
			image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=400&fit=crop&crop=face",
			team: "Tampa Bay Rays",
			position: "1B",
			stats: { rating: 4.5, likes: 634, views: "6.2k" }
		},
		{ 
			id: 4, 
			title: "박찬호", 
			effect: "secret", 
			rarity: "시크릿 레어",
			image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&crop=face",
			team: "LA Dodgers (Legend)",
			position: "P",
			stats: { rating: 5.0, likes: 2156, views: "25.8k" }
		},
		{ 
			id: 5, 
			title: "추신수", 
			effect: "galaxy", 
			rarity: "갤럭시 레어",
			image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&crop=face",
			team: "SSG Landers",
			position: "OF",
			stats: { rating: 4.8, likes: 1543, views: "18.7k" }
		}
	];
	
	onMount(() => {
		mounted = true;
		
		// Add floating particles animation
		if (browser) {
			createFloatingParticles();
		}
	});
	
	function createFloatingParticles() {
		// Simple particle animation implementation
		const particles = document.querySelector('.particles');
		if (!particles) return;
		
		for (let i = 0; i < 20; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';
			particle.style.cssText = `
				position: absolute;
				width: 4px;
				height: 4px;
				background: linear-gradient(45deg, #6366f1, #8b5cf6);
				border-radius: 50%;
				left: ${Math.random() * 100}%;
				top: ${Math.random() * 100}%;
				animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
				animation-delay: ${Math.random() * 2}s;
				opacity: 0.6;
			`;
			particles.appendChild(particle);
		}
	}
</script>

<svelte:head>
	<title>홀로그래픽 카드 커뮤니티 - AI 기반 야구카드 제작 플랫폼</title>
	<meta name="description" content="AI 기반 홀로그래픽 효과로 나만의 야구카드를 제작하고 전 세계 컬렉터들과 공유하세요. 프리미엄 홀로그래픽 효과와 커뮤니티 기능을 경험해보세요." />
</svelte:head>

<!-- Civitai-style Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-civitai-bg-primary/95 backdrop-blur-md border-b border-civitai-border-primary">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 bg-gradient-to-br from-civitai-accent-primary to-civitai-accent-secondary rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
					</svg>
				</div>
				<span class="text-xl font-bold text-civitai-text-primary">홀로카드</span>
			</div>
			
			<!-- Navigation Links -->
			<div class="hidden md:flex items-center gap-6">
				<a href="/" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">홈</a>
				<a href="/gallery" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">갤러리</a>
				<a href="/create" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">제작</a>
				<a href="/community" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">커뮤니티</a>
			</div>
			
			<!-- Auth Button -->
			<div class="flex items-center gap-3">
				<a href="/auth/signin" class="bg-civitai-accent-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
					로그인
				</a>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section - Civitai Style -->
<section class="relative pt-16 min-h-screen bg-civitai-bg-primary">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-5">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%);"></div>
	</div>
	
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
		<!-- Hero Content -->
		<div class="text-center mb-16">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-civitai-text-primary mb-6">
				AI 기반 <span class="text-transparent bg-clip-text bg-gradient-to-r from-civitai-accent-primary to-civitai-accent-secondary">홀로그래픽</span><br>
				야구카드 커뮤니티
			</h1>
			<p class="text-xl text-civitai-text-secondary mb-8 max-w-3xl mx-auto">
				최첨단 AI 기술로 실물과 같은 홀로그래픽 효과를 구현하고, 전 세계 컬렉터들과 작품을 공유하세요
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<a href="/auth/signin" class="bg-civitai-accent-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
					</svg>
					카드 제작 시작
				</a>
				<a href="/gallery" class="border border-civitai-border-primary hover:border-civitai-border-accent text-civitai-text-primary px-8 py-3 rounded-lg font-medium transition-colors">
					갤러리 둘러보기
				</a>
			</div>
		</div>
		
		<!-- Featured Cards Showcase - Pokemon Cards CSS Style -->
		{#if mounted}
			<div class="flex justify-center items-center gap-8 flex-wrap max-w-6xl mx-auto">
				{#each heroCards as card, index}
					<div class="animate-fade-in-up" style="animation-delay: {0.6 + index * 0.2}s;">
						<HolographicCard 
							effect={card.effect} 
							width="240px" 
							height="336px"
							intensity={1.2}
						>
							<!-- Enhanced Baseball Card Content -->
							<div class="w-full h-full rounded-xl overflow-hidden relative">
								<!-- Full Background Image -->
								<img 
									src={card.image} 
									alt={card.title}
									class="absolute inset-0 w-full h-full object-cover"
									loading="lazy"
								/>
								
								<!-- Holographic Pattern Overlay -->
								<div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
								
								<!-- Card Border Effect -->
								<div class="absolute inset-0 rounded-xl border-2 border-gradient-to-r from-yellow-400/50 via-purple-400/50 to-blue-400/50 pointer-events-none"></div>
								
								<!-- Top Gradient Overlay for Header -->
								<div class="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"></div>
								
								<!-- Bottom Gradient Overlay for Footer -->
								<div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
								
								<!-- Card Header -->
								<div class="absolute top-0 left-0 right-0 p-3 z-10">
									<h3 class="text-sm font-bold text-white text-center tracking-wider enhanced-text-shadow">{card.title}</h3>
									<div class="text-xs text-yellow-300 text-center mt-1 enhanced-text-shadow">⚾ BASEBALL LEGEND</div>
								</div>
								
								<!-- Position Badge -->
								<div class="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-black text-xs px-2 py-1 rounded-full font-bold shadow-lg z-10">
									{card.position}
								</div>
								
								<!-- Team Badge -->
								<div class="absolute top-12 left-3 right-3 z-10">
									<div class="enhanced-backdrop rounded-lg px-3 py-1 text-center">
										<div class="text-xs text-white/90 font-medium truncate enhanced-text-shadow">{card.team}</div>
									</div>
								</div>
								
								<!-- Enhanced Glare and Shimmer Effects -->
								<div class="card-image-overlay"></div>
								<div class="card-dynamic-glare"></div>
								<div class="card-shimmer"></div>
								<div class="card-border-glow"></div>
								
								<!-- Card Footer -->
								<div class="absolute bottom-0 left-0 right-0 p-3 z-10">
									<div class="text-center">
										<div class="inline-block px-3 py-1 enhanced-backdrop rounded-full mb-2">
											<p class="text-xs text-yellow-300 font-semibold enhanced-text-shadow">{card.rarity}</p>
										</div>
										<div class="flex justify-center items-center gap-4 text-xs text-white">
											<div class="flex items-center gap-1 enhanced-backdrop rounded-full px-2 py-1">
												<svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
												</svg>
												<span class="font-semibold enhanced-text-shadow">{card.stats.rating}</span>
											</div>
											<div class="flex items-center gap-1 enhanced-backdrop rounded-full px-2 py-1">
												<svg class="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
												</svg>
												<span class="font-semibold enhanced-text-shadow">{card.stats.likes}</span>
											</div>
											<div class="flex items-center gap-1 enhanced-backdrop rounded-full px-2 py-1">
												<svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
													<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
												</svg>
												<span class="font-semibold enhanced-text-shadow">{card.stats.views}</span>
											</div>
										</div>
									</div>
								</div>
								
								<!-- Rarity Symbol -->
								<div class="absolute top-3 left-3 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
									<span class="text-xs font-bold text-white">★</span>
								</div>
								
								<!-- Subtle Vignette Effect -->
								<div class="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 pointer-events-none"></div>
							</div>
						</HolographicCard>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Features Section - Civitai Style -->
<section class="py-20 bg-civitai-bg-secondary">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold text-civitai-text-primary mb-4">
				플랫폼 특징
			</h2>
			<p class="text-lg text-civitai-text-secondary max-w-2xl mx-auto">
				AI 기술과 커뮤니티의 힘으로 새로운 디지털 카드 경험을 제공합니다
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Feature 1 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-primary" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">AI 홀로그래픽 효과</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					최첨단 AI 기술로 실물 트레이딩 카드와 같은 생생한 홀로그래픽 효과를 구현합니다.
				</p>
			</div>
			
			<!-- Feature 2 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-secondary/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-secondary" fill="currentColor" viewBox="0 0 20 20">
						<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">커뮤니티 중심</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					전 세계 컬렉터들과 작품을 공유하고 피드백을 받으며 함께 성장하세요.
				</p>
			</div>
			
			<!-- Feature 3 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-success/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-success" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">프리미엄 품질</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					디지털 카드를 실제 홀로그래픽 카드로 인쇄하여 프리미엄 컬렉션을 완성하세요.
				</p>
			</div>
			
			<!-- Feature 4 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-warning/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-warning" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">무료 시작</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					가입비 없이 무료로 시작하고 무제한으로 카드를 제작할 수 있습니다.
				</p>
			</div>
			
			<!-- Feature 5 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-info/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-info" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">오픈소스</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					투명한 개발 과정과 커뮤니티 기여를 통해 함께 발전해나갑니다.
				</p>
			</div>
			
			<!-- Feature 6 -->
			<div class="bg-civitai-surface-primary border border-civitai-border-primary rounded-xl p-6 hover:border-civitai-border-accent transition-colors">
				<div class="w-12 h-12 bg-civitai-accent-error/10 rounded-lg flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-civitai-accent-error" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-civitai-text-primary mb-2">실시간 협업</h3>
				<p class="text-civitai-text-secondary text-sm leading-relaxed">
					실시간 댓글과 피드백을 통해 다른 크리에이터들과 협업할 수 있습니다.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section - Civitai Style -->
<section class="py-20 bg-civitai-bg-primary border-t border-civitai-border-primary">
	<div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl sm:text-4xl font-bold text-civitai-text-primary mb-4">
			지금 시작해보세요
		</h2>
		<p class="text-lg text-civitai-text-secondary mb-8 max-w-2xl mx-auto">
			무료로 가입하고 첫 번째 홀로그래픽 카드를 만들어보세요. 특별한 야구 순간을 영원히 간직할 수 있습니다.
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
			<a href="/auth/signin" class="bg-civitai-accent-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
				무료로 시작하기
			</a>
			<a href="/gallery" class="border border-civitai-border-primary hover:border-civitai-border-accent text-civitai-text-primary px-8 py-3 rounded-lg font-medium transition-colors">
				갤러리 둘러보기
			</a>
		</div>
		
		<div class="flex flex-wrap justify-center items-center gap-6 text-sm text-civitai-text-tertiary">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-civitai-accent-success" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
				<span>무료 가입</span>
			</div>
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-civitai-accent-success" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
				<span>무제한 제작</span>
			</div>
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-civitai-accent-success" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
				<span>커뮤니티 참여</span>
			</div>
		</div>
	</div>
</section>

<!-- Footer - Civitai Style -->
<footer class="bg-civitai-bg-secondary border-t border-civitai-border-primary py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Logo & Description -->
			<div class="col-span-1 md:col-span-2">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-8 h-8 bg-gradient-to-br from-civitai-accent-primary to-civitai-accent-secondary rounded-lg flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
						</svg>
					</div>
					<span class="text-xl font-bold text-civitai-text-primary">홀로카드</span>
				</div>
				<p class="text-civitai-text-secondary text-sm max-w-md">
					AI 기반 홀로그래픽 효과로 나만의 야구카드를 제작하고 전 세계 컬렉터들과 공유하는 커뮤니티 플랫폼입니다.
				</p>
			</div>
			
			<!-- Links -->
			<div>
				<h3 class="text-civitai-text-primary font-semibold mb-4">플랫폼</h3>
				<ul class="space-y-2 text-sm">
					<li><a href="/gallery" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">갤러리</a></li>
					<li><a href="/create" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">카드 제작</a></li>
					<li><a href="/community" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">커뮤니티</a></li>
					<li><a href="/pricing" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">요금제</a></li>
				</ul>
			</div>
			
			<div>
				<h3 class="text-civitai-text-primary font-semibold mb-4">지원</h3>
				<ul class="space-y-2 text-sm">
					<li><a href="/help" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">도움말</a></li>
					<li><a href="/contact" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">문의하기</a></li>
					<li><a href="/terms" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">이용약관</a></li>
					<li><a href="/privacy" class="text-civitai-text-secondary hover:text-civitai-text-primary transition-colors">개인정보처리방침</a></li>
				</ul>
			</div>
		</div>
		
		<div class="border-t border-civitai-border-primary mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
			<p class="text-civitai-text-tertiary text-sm">
				© 2024 홀로카드. All rights reserved.
			</p>
			<div class="flex items-center gap-4 mt-4 sm:mt-0">
				<a href="#" class="text-civitai-text-tertiary hover:text-civitai-text-secondary transition-colors">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
					</svg>
				</a>
				<a href="#" class="text-civitai-text-tertiary hover:text-civitai-text-secondary transition-colors">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
					</svg>
				</a>
				<a href="#" class="text-civitai-text-tertiary hover:text-civitai-text-secondary transition-colors">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(180deg); }
	}
	
	.particle {
		animation: float 4s ease-in-out infinite;
	}
</style>