<!--
  Contact Page - Simple Version
  Feature: 003-navigation-ui-renewal
-->
<script lang="ts">
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let submitted = false;

	function handleSubmit() {
		console.log('Contact form submitted:', { name, email, subject, message });
		submitted = true;
		setTimeout(() => {
			submitted = false;
		}, 3000);
	}
</script>

<div class="contact-page">
	<div class="contact-container">
		<!-- Hero -->
		<section class="hero">
			<h1 class="hero-title">문의하기</h1>
			<p class="hero-subtitle">궁금한 점이 있으시면 언제든지 연락주세요</p>
		</section>

		<!-- Contact Form -->
		<section class="form-section">
			{#if submitted}
				<div class="success-message">
					<p>✅ 문의가 성공적으로 전송되었습니다!</p>
				</div>
			{:else}
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-group">
						<label for="name">이름</label>
						<input type="text" id="name" bind:value={name} required />
					</div>

					<div class="form-group">
						<label for="email">이메일</label>
						<input type="email" id="email" bind:value={email} required />
					</div>

					<div class="form-group">
						<label for="subject">제목</label>
						<input type="text" id="subject" bind:value={subject} required />
					</div>

					<div class="form-group">
						<label for="message">문의 내용</label>
						<textarea id="message" rows="8" bind:value={message} required></textarea>
					</div>

					<button type="submit" class="submit-btn">문의하기</button>
				</form>
			{/if}
		</section>
	</div>
</div>

<style>
	.contact-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
		padding: 80px 20px;
	}

	.contact-container {
		max-width: 600px;
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

	.form-section {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		padding: 32px;
	}

	.form-group {
		margin-bottom: 24px;
	}

	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #ccc;
		margin-bottom: 8px;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 14px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: #fff;
		font-size: 16px;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
		background: rgba(255, 255, 255, 0.08);
	}

	.submit-btn {
		width: 100%;
		padding: 16px 32px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border: none;
		border-radius: 12px;
		color: #fff;
		font-size: 18px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
	}

	.success-message {
		text-align: center;
		padding: 48px;
		font-size: 18px;
		color: #34c759;
	}
</style>
