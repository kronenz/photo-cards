<!--
  Contact Page with Form
  Feature: 003-navigation-ui-renewal
  Task: T095 - US5 (Korean)
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/design-system/Input.svelte';
	import Button from '$lib/components/design-system/Button.svelte';
	import { validateField } from '$lib/utils/validation';

	const dispatch = createEventDispatcher<{
		submit: { name: string; email: string; subject: string; message: string };
	}>();

	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let loading = false;
	let submitted = false;

	let errors = {
		name: '',
		email: '',
		subject: '',
		message: ''
	};

	const contactMethods = [
		{
			icon: '📧',
			title: '이메일',
			value: 'help@kbocards.com',
			description: '평일 09:00 - 18:00 응답'
		},
		{
			icon: '💬',
			title: '카카오톡',
			value: '@kbocards',
			description: '실시간 채팅 지원'
		},
		{
			icon: '📞',
			title: '전화',
			value: '02-1234-5678',
			description: '평일 09:00 - 18:00'
		}
	];

	function validate() {
		errors.name =
			validateField(name, [
				{ type: 'required', message: '이름을 입력하세요.' },
				{ type: 'minLength', message: '2자 이상 입력하세요.', value: 2 }
			]) || '';

		errors.email =
			validateField(email, [
				{ type: 'required', message: '이메일을 입력하세요.' },
				{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
			]) || '';

		errors.subject =
			validateField(subject, [
				{ type: 'required', message: '제목을 입력하세요.' },
				{ type: 'minLength', message: '5자 이상 입력하세요.', value: 5 }
			]) || '';

		errors.message =
			validateField(message, [
				{ type: 'required', message: '문의 내용을 입력하세요.' },
				{ type: 'minLength', message: '10자 이상 입력하세요.', value: 10 }
			]) || '';

		return Object.values(errors).every((error) => !error);
	}

	async function handleSubmit() {
		if (!validate()) return;

		loading = true;

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			dispatch('submit', { name, email, subject, message });

			// Reset form
			name = '';
			email = '';
			subject = '';
			message = '';
			submitted = true;

			setTimeout(() => {
				submitted = false;
			}, 5000);
		} catch (error) {
			console.error('Failed to submit contact form:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="contact-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">문의하기</h1>
			<p class="hero-subtitle">
				궁금한 점이 있으신가요? 언제든지 문의해주세요.
			</p>
		</div>
	</section>

	<!-- Contact Methods -->
	<section class="contact-methods">
		<div class="container">
			<h2 class="section-title">연락 방법</h2>
			<div class="methods-grid">
				{#each contactMethods as method}
					<div class="method-card">
						<span class="method-icon">{method.icon}</span>
						<h3 class="method-title">{method.title}</h3>
						<p class="method-value">{method.value}</p>
						<p class="method-description">{method.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Contact Form -->
	<section class="contact-form-section">
		<div class="container">
			<div class="form-wrapper">
				{#if submitted}
					<div class="success-message">
						<span class="success-icon">✅</span>
						<h3 class="success-title">문의가 접수되었습니다!</h3>
						<p class="success-text">
							빠른 시일 내에 답변 드리겠습니다.<br />
							평일 기준 1-2 영업일 내에 회신 예정입니다.
						</p>
					</div>
				{:else}
					<div class="form-header">
						<h2 class="form-title">문의 양식</h2>
						<p class="form-subtitle">
							아래 양식을 작성해주시면 빠르게 답변해드리겠습니다.
						</p>
					</div>

					<form on:submit|preventDefault={handleSubmit} class="contact-form">
						<div class="form-row">
							<div class="form-field">
								<label for="name" class="field-label">이름 *</label>
								<Input
									id="name"
									bind:value={name}
									placeholder="홍길동"
									error={errors.name}
									disabled={loading}
								/>
							</div>

							<div class="form-field">
								<label for="email" class="field-label">이메일 *</label>
								<Input
									id="email"
									type="email"
									bind:value={email}
									placeholder="your@email.com"
									error={errors.email}
									disabled={loading}
								/>
							</div>
						</div>

						<div class="form-field">
							<label for="subject" class="field-label">문의 제목 *</label>
							<Input
								id="subject"
								bind:value={subject}
								placeholder="문의 제목을 입력하세요"
								error={errors.subject}
								disabled={loading}
							/>
						</div>

						<div class="form-field">
							<label for="message" class="field-label">문의 내용 *</label>
							<textarea
								id="message"
								bind:value={message}
								placeholder="문의 내용을 상세히 입력해주세요"
								class="field-textarea"
								class:error={errors.message}
								rows="8"
								disabled={loading}
							></textarea>
							{#if errors.message}
								<span class="field-error">{errors.message}</span>
							{/if}
						</div>

						<div class="form-actions">
							<Button type="submit" variant="primary" fullWidth {loading}>
								{loading ? '전송 중...' : '문의 보내기'}
							</Button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</section>

	<!-- FAQ Link -->
	<section class="faq-link-section">
		<div class="container">
			<div class="faq-link-content">
				<h3 class="faq-link-title">자주 묻는 질문을 확인해보셨나요?</h3>
				<p class="faq-link-text">
					대부분의 질문은 도움말 페이지에서 바로 해결할 수 있습니다.
				</p>
				<a href="/help" class="faq-link-button">도움말 보기</a>
			</div>
		</div>
	</section>
</div>

<style>
	.contact-page {
		min-height: 100vh;
		background-color: var(--background-primary);
	}

	/* Hero */
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

	.section-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-xl) 0;
		text-align: center;
	}

	/* Contact Methods */
	.contact-methods {
		background-color: var(--surface-secondary);
		padding: var(--space-3xl) 0;
	}

	.methods-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-lg);
	}

	.method-card {
		background-color: var(--surface-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
		border: 1px solid var(--border-primary);
		transition: all var(--transition-fast);
	}

	.method-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--primary);
	}

	.method-icon {
		font-size: 48px;
		display: block;
		margin-bottom: var(--space-md);
	}

	.method-title {
		font-size: var(--font-headline);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-sm) 0;
	}

	.method-value {
		font-size: var(--font-body);
		color: var(--primary);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--space-xs) 0;
	}

	.method-description {
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	/* Contact Form */
	.contact-form-section {
		padding: var(--space-3xl) 0;
	}

	.form-wrapper {
		max-width: 600px;
		margin: 0 auto;
	}

	.form-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.form-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-sm) 0;
	}

	.form-subtitle {
		font-size: var(--font-body);
		color: var(--text-secondary);
		margin: 0;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.field-label {
		font-size: var(--font-callout);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.field-textarea {
		padding: var(--space-md);
		font-size: var(--font-body);
		font-family: inherit;
		color: var(--text-primary);
		background-color: var(--surface-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		resize: vertical;
	}

	.field-textarea:hover {
		border-color: var(--primary);
	}

	.field-textarea:focus {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-color: var(--primary);
	}

	.field-textarea.error {
		border-color: var(--error);
	}

	.field-error {
		font-size: var(--font-callout);
		color: var(--error);
	}

	.form-actions {
		margin-top: var(--space-md);
	}

	/* Success Message */
	.success-message {
		text-align: center;
		padding: var(--space-3xl);
		background-color: var(--surface-secondary);
		border-radius: var(--radius-lg);
	}

	.success-icon {
		font-size: 64px;
		display: block;
		margin-bottom: var(--space-lg);
	}

	.success-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0 0 var(--space-md) 0;
	}

	.success-text {
		font-size: var(--font-body);
		color: var(--text-secondary);
		margin: 0;
		line-height: var(--line-height-relaxed);
	}

	/* FAQ Link */
	.faq-link-section {
		background: linear-gradient(135deg, var(--primary), var(--secondary));
		color: white;
		padding: var(--space-3xl) var(--space-lg);
	}

	.faq-link-content {
		max-width: var(--container-sm);
		margin: 0 auto;
		text-align: center;
	}

	.faq-link-title {
		font-size: var(--font-title2);
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--space-md) 0;
	}

	.faq-link-text {
		font-size: var(--font-body);
		opacity: 0.9;
		margin: 0 0 var(--space-xl) 0;
	}

	.faq-link-button {
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

	.faq-link-button:hover {
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

		.form-row {
			grid-template-columns: 1fr;
		}

		.methods-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
