<!--
  Help Page - Simple Version without Accordion
  Feature: 003-navigation-ui-renewal
  Task: T094 - US5 (Korean)
-->
<script lang="ts">
	const faqCategories = [
		{
			title: '시작하기',
			items: [
				{
					title: '홀로그래픽 카드란 무엇인가요?',
					content:
						'홀로그래픽 카드는 한국프로야구() 선수들의 멋진 순간을 프리미엄 홀로그래픽 효과와 함께 디지털 카드로 제작하고 수집할 수 있는 플랫폼입니다.'
				},
				{
					title: '회원가입은 어떻게 하나요?',
					content:
						'화면 우측 상단의 "회원가입" 버튼을 클릭하거나, 이메일 또는 Google/GitHub 계정으로 간편하게 가입할 수 있습니다.'
				}
			]
		}
	];
</script>

<div class="help-page">
	<div class="help-container">
		<!-- Hero Section -->
		<section class="hero">
			<h1 class="hero-title">도움말</h1>
			<p class="hero-subtitle">홀로그래픽 카드 플랫폼 이용 가이드</p>
		</section>

		<!-- FAQ Section -->
		<section class="faq-section">
			{#each faqCategories as category}
				<div class="faq-category">
					<h2 class="category-title">{category.title}</h2>
					{#each category.items as item}
						<details class="faq-item">
							<summary class="faq-question">{item.title}</summary>
							<div class="faq-answer">{item.content}</div>
						</details>
					{/each}
				</div>
			{/each}
		</section>
	</div>
</div>

<style>
	.help-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
		padding: 80px 20px;
	}

	.help-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		margin-bottom: 48px;
	}

	.hero-title {
		font-size: 48px;
		font-weight: 800;
		margin: 0 0 16px 0;
		background: linear-gradient(135deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 20px;
		color: #999;
	}

	.faq-category {
		margin-bottom: 48px;
	}

	.category-title {
		font-size: 28px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 24px;
	}

	.faq-item {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		margin-bottom: 16px;
		padding: 20px;
	}

	.faq-question {
		font-size: 18px;
		font-weight: 600;
		color: #fff;
		cursor: pointer;
		list-style: none;
	}

	.faq-answer {
		margin-top: 12px;
		font-size: 16px;
		color: #999;
		line-height: 1.6;
	}
</style>
