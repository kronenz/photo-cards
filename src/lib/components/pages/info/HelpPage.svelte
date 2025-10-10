<!--
  Help Page with FAQ
  Feature: 003-navigation-ui-renewal
  Task: T094 - US5 (Korean)
-->
<script lang="ts">
	import Accordion from '$lib/components/design-system/Accordion.svelte';

	const faqCategories = [
		{
			title: '시작하기',
			items: [
				{
					title: '홀로그래픽 카드란 무엇인가요?',
					content:
						'홀로그래픽 카드는 한국프로야구 선수들의 멋진 순간을 프리미엄 홀로그래픽 효과와 함께 디지털 카드로 제작하고 수집할 수 있는 플랫폼입니다. 실물 트레이딩 카드처럼 수집하고, 친구들과 공유하며, 나만의 컬렉션을 완성할 수 있습니다.'
				},
				{
					title: '회원가입은 어떻게 하나요?',
					content:
						'화면 우측 상단의 "회원가입" 버튼을 클릭하거나, 이메일 또는 Google/GitHub 계정으로 간편하게 가입할 수 있습니다. 회원가입 후 바로 카드 제작과 수집을 시작할 수 있습니다.'
				},
				{
					title: '첫 카드를 만들려면 어떻게 해야 하나요?',
					content:
						'로그인 후 "카드 만들기" 메뉴를 클릭하세요. 좋아하는 선수의 사진을 업로드하고, 선수 이름, 구단, 포지션 등을 입력하면 자동으로 홀로그래픽 효과가 적용된 프리미엄 카드가 생성됩니다.'
				}
			]
		},
		{
			title: '카드 제작',
			items: [
				{
					title: '어떤 이미지를 사용할 수 있나요?',
					content:
						'PNG, JPG, WebP 형식의 이미지 파일을 사용할 수 있습니다. 최대 파일 크기는 10MB이며, 고해상도 이미지를 사용하면 더욱 선명한 카드를 만들 수 있습니다. 저작권이 있는 이미지 사용 시 주의해주세요.'
				},
				{
					title: '홀로그래픽 효과는 무엇인가요?',
					content:
						'홀로그래픽 효과는 실물 프리미엄 트레이딩 카드에 적용되는 특수 효과를 디지털로 재현한 것입니다. 마우스를 카드 위로 움직이면 빛의 반사와 무지갯빛 그라데이션이 실시간으로 변화하며, 카드에 생동감을 더해줍니다.'
				},
				{
					title: '카드를 수정하거나 삭제할 수 있나요?',
					content:
						'네, 언제든지 가능합니다. 내 컬렉션에서 카드를 선택한 후 "수정" 또는 "삭제" 버튼을 클릭하세요. 삭제된 카드는 복구할 수 없으니 신중하게 선택해주세요.'
				},
				{
					title: '한 번에 여러 장의 카드를 만들 수 있나요?',
					content:
						'현재는 한 번에 한 장씩 카드를 제작할 수 있습니다. 향후 업데이트에서 일괄 업로드 기능을 추가할 예정입니다.'
				}
			]
		},
		{
			title: '컬렉션 & 공유',
			items: [
				{
					title: '컬렉션은 어떻게 관리하나요?',
					content:
						'"컬렉션" 메뉴에서 내가 만든 모든 카드를 확인할 수 있습니다. 구단별, 포지션별로 필터링하거나 이름/날짜순으로 정렬할 수 있습니다. 검색 기능을 사용하면 특정 선수의 카드를 빠르게 찾을 수 있습니다.'
				},
				{
					title: '카드를 다른 사람과 공유할 수 있나요?',
					content:
						'네, 각 카드마다 고유한 링크가 생성됩니다. 공유 버튼을 클릭하면 SNS나 메신저로 카드를 공유할 수 있습니다. 친구들에게 내 컬렉션을 자랑해보세요!'
				},
				{
					title: '다른 사람의 카드를 볼 수 있나요?',
					content:
						'갤러리 메뉴에서 다른 사용자들이 공개한 카드를 둘러볼 수 있습니다. 마음에 드는 카드에 좋아요를 누르거나 댓글을 남길 수 있습니다.'
				}
			]
		},
		{
			title: '마켓플레이스',
			items: [
				{
					title: '템플릿 마켓플레이스는 무엇인가요?',
					content:
						'다른 사용자들이 만든 카드 디자인 템플릿을 구매하거나 판매할 수 있는 공간입니다. 프리미엄 디자인 템플릿을 사용하면 더욱 멋진 카드를 쉽게 만들 수 있습니다.'
				},
				{
					title: '내 템플릿을 판매할 수 있나요?',
					content:
						'네, 크리에이터 등록 후 자신만의 템플릿을 업로드하고 판매할 수 있습니다. 판매 수익의 70%를 가져가실 수 있으며, 나머지는 플랫폼 운영비로 사용됩니다.'
				}
			]
		},
		{
			title: '계정 & 설정',
			items: [
				{
					title: '프로필 정보를 변경하려면?',
					content:
						'화면 우측 상단의 프로필 아이콘을 클릭한 후 "설정" 메뉴로 이동하세요. 이름, 프로필 사진, 좋아하는 구단 등을 변경할 수 있습니다.'
				},
				{
					title: '비밀번호를 잊어버렸어요',
					content:
						'로그인 페이지의 "비밀번호 찾기" 링크를 클릭하세요. 가입 시 사용한 이메일 주소를 입력하면 비밀번호 재설정 링크가 전송됩니다.'
				},
				{
					title: '계정을 삭제하고 싶어요',
					content:
						'설정 > 계정 관리 > 계정 삭제 메뉴에서 진행할 수 있습니다. 계정 삭제 시 모든 카드와 데이터가 영구적으로 삭제되며 복구할 수 없습니다.'
				},
				{
					title: '다크 모드는 어떻게 사용하나요?',
					content:
						'화면 우측 상단의 테마 토글 버튼(🌙/☀️)을 클릭하면 다크 모드와 라이트 모드를 전환할 수 있습니다. 선택한 테마는 자동으로 저장됩니다.'
				}
			]
		},
		{
			title: '기술 지원',
			items: [
				{
					title: '카드 이미지가 업로드되지 않아요',
					content:
						'파일 형식(PNG, JPG, WebP)과 크기(10MB 이하)를 확인해주세요. 문제가 계속되면 브라우저 캐시를 삭제하거나 다른 브라우저를 시도해보세요. 그래도 해결되지 않으면 고객센터로 문의해주세요.'
				},
				{
					title: '홀로그래픽 효과가 보이지 않아요',
					content:
						'최신 버전의 Chrome, Safari, Firefox, Edge 브라우저를 사용하는지 확인해주세요. 오래된 브라우저에서는 일부 효과가 제대로 표시되지 않을 수 있습니다.'
				},
				{
					title: '모바일에서도 사용할 수 있나요?',
					content:
						'네, 모든 기능이 모바일에 최적화되어 있습니다. 터치 제스처로 카드를 회전하거나 확대할 수 있으며, 모바일 브라우저에서도 홀로그래픽 효과를 감상할 수 있습니다.'
				},
				{
					title: '오류가 발생했어요',
					content:
						'페이지를 새로고침하거나 로그아웃 후 다시 로그인해보세요. 문제가 지속되면 에러 메시지를 캡처하여 고객센터(help@kbocards.com)로 문의해주세요.'
				}
			]
		}
	];
</script>

<div class="help-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">도움말</h1>
			<p class="hero-subtitle">
				홀로그래픽 카드 사용에 대한 모든 것을 알아보세요
			</p>
		</div>
	</section>

	<!-- Quick Links -->
	<section class="quick-links">
		<div class="container">
			<h2 class="section-title">빠른 바로가기</h2>
			<div class="links-grid">
				<a href="#시작하기" class="link-card">
					<span class="link-icon">🚀</span>
					<h3 class="link-title">시작하기</h3>
					<p class="link-description">첫 카드 만들기</p>
				</a>
				<a href="#카드-제작" class="link-card">
					<span class="link-icon">✨</span>
					<h3 class="link-title">카드 제작</h3>
					<p class="link-description">카드 제작 가이드</p>
				</a>
				<a href="/contact" class="link-card">
					<span class="link-icon">💬</span>
					<h3 class="link-title">문의하기</h3>
					<p class="link-description">고객센터 연락</p>
				</a>
				<a href="#기술-지원" class="link-card">
					<span class="link-icon">🛠️</span>
					<h3 class="link-title">기술 지원</h3>
					<p class="link-description">문제 해결하기</p>
				</a>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="faq-section">
		<div class="container">
			<h2 class="section-title">자주 묻는 질문 (FAQ)</h2>

			{#each faqCategories as category}
				<div class="faq-category" id={category.title.replace(/\s+/g, '-')}>
					<h3 class="category-title">{category.title}</h3>
					<Accordion items={category.items} />
				</div>
			{/each}
		</div>
	</section>

	<!-- Contact CTA -->
	<section class="contact-cta">
		<div class="container">
			<div class="cta-content">
				<h2 class="cta-title">원하는 답변을 찾지 못하셨나요?</h2>
				<p class="cta-description">
					고객센터로 문의해주시면 빠르게 도와드리겠습니다.
				</p>
				<a href="/contact" class="cta-button">문의하기</a>
			</div>
		</div>
	</section>
</div>

<style>
	.help-page {
		min-height: 100vh;
		background-color: var(--background-primary);
	}

	/* Hero Section */
	.hero {
		background: linear-gradient(135deg, var(--primary), var(--secondary));
		color: white;
		padding: var(--space-3xl) var(--space-lg);
		text-align: center;
	}

	.hero-content {
		max-width: var(--container-md);
		margin: 0 auto;
	}

	.hero-title {
		font-size: var(--font-display);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--space-md) 0;
	}

	.hero-subtitle {
		font-size: var(--font-title3);
		opacity: 0.9;
		margin: 0;
	}

	/* Container */
	.container {
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}

	/* Section Title */
	.section-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-xl) 0;
		text-align: center;
	}

	/* Quick Links */
	.quick-links {
		background-color: var(--surface-secondary);
		padding: var(--space-3xl) 0;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-lg);
	}

	.link-card {
		background-color: var(--surface-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
		text-decoration: none;
		transition: all var(--transition-fast);
		border: 1px solid var(--border-primary);
	}

	.link-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--primary);
	}

	.link-icon {
		font-size: 48px;
		display: block;
		margin-bottom: var(--space-md);
	}

	.link-title {
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-xs) 0;
	}

	.link-description {
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	/* FAQ Section */
	.faq-section {
		padding: var(--space-3xl) 0;
	}

	.faq-category {
		margin-bottom: var(--space-3xl);
	}

	.category-title {
		font-size: var(--font-title3);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-lg) 0;
		padding-bottom: var(--space-sm);
		border-bottom: 3px solid var(--primary);
	}

	/* Contact CTA */
	.contact-cta {
		background: linear-gradient(135deg, var(--primary), var(--secondary));
		color: white;
		padding: var(--space-3xl) var(--space-lg);
	}

	.cta-content {
		max-width: var(--container-sm);
		margin: 0 auto;
		text-align: center;
	}

	.cta-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--space-md) 0;
	}

	.cta-description {
		font-size: var(--font-body);
		opacity: 0.9;
		margin: 0 0 var(--space-xl) 0;
	}

	.cta-button {
		display: inline-block;
		padding: var(--space-md) var(--space-2xl);
		background-color: white;
		color: var(--primary);
		text-decoration: none;
		border-radius: var(--radius-full);
		font-weight: var(--font-weight-bold);
		font-size: var(--font-body);
		transition: all var(--transition-fast);
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-xl);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-title {
			font-size: var(--font-title1);
		}

		.hero-subtitle {
			font-size: var(--font-headline);
		}

		.links-grid {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: var(--font-title3);
		}

		.category-title {
			font-size: var(--font-headline);
		}
	}
</style>
