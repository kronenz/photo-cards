<!--
  Signup Form Component
  Feature: 003-navigation-ui-renewal
  Task: T079 - US4
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/design-system/Input.svelte';
	import Button from '$lib/components/design-system/Button.svelte';
	import { validateField, validatePassword } from '$lib/utils/validation';

	export let loading = false;

	const dispatch = createEventDispatcher<{
		submit: { email: string; password: string; name: string };
	}>();

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let agreedToTerms = false;

	let errors = {
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		terms: ''
	};

	$: passwordValidation = validatePassword(password);

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

		errors.password =
			validateField(password, [
				{ type: 'required', message: '비밀번호를 입력하세요.' },
				{ type: 'minLength', message: '비밀번호는 8자 이상이어야 합니다.', value: 8 }
			]) || '';

		if (passwordValidation.strength === 'weak') {
			errors.password = '비밀번호가 너무 약합니다. 대소문자, 숫자, 특수문자를 조합하세요.';
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
		} else {
			errors.confirmPassword = '';
		}

		if (!agreedToTerms) {
			errors.terms = '이용약관에 동의해주세요.';
		} else {
			errors.terms = '';
		}

		return Object.values(errors).every((error) => !error);
	}

	function handleSubmit() {
		if (validate()) {
			dispatch('submit', { email, password, name });
		}
	}
</script>

<div class="signup-form">
	<div class="form-header">
		<h2 class="form-title">회원가입</h2>
		<p class="form-subtitle">홀로그래픽 카드와 함께하세요</p>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="form-body">
		<div class="form-field">
			<label for="name" class="field-label">이름</label>
			<Input
				id="name"
				bind:value={name}
				placeholder="홍길동"
				error={errors.name}
				disabled={loading}
			/>
		</div>

		<div class="form-field">
			<label for="email" class="field-label">이메일</label>
			<Input
				id="email"
				type="email"
				bind:value={email}
				placeholder="your@email.com"
				error={errors.email}
				disabled={loading}
			/>
		</div>

		<div class="form-field">
			<label for="password" class="field-label">비밀번호</label>
			<Input
				id="password"
				type="password"
				bind:value={password}
				placeholder="••••••••"
				error={errors.password}
				disabled={loading}
			/>
			{#if password}
				<div class="password-strength">
					<div class="strength-bar">
						<div
							class="strength-fill"
							class:weak={passwordValidation.strength === 'weak'}
							class:medium={passwordValidation.strength === 'medium'}
							class:strong={passwordValidation.strength === 'strong'}
						></div>
					</div>
					<span class="strength-label"
						>{passwordValidation.strength === 'weak'
							? '약함'
							: passwordValidation.strength === 'medium'
								? '보통'
								: '강함'}</span
					>
				</div>
			{/if}
		</div>

		<div class="form-field">
			<label for="confirmPassword" class="field-label">비밀번호 확인</label>
			<Input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				placeholder="••••••••"
				error={errors.confirmPassword}
				disabled={loading}
			/>
		</div>

		<div class="form-field">
			<label class="checkbox-label" class:error={errors.terms}>
				<input type="checkbox" bind:checked={agreedToTerms} disabled={loading} />
				<span
					><a href="/terms" target="_blank">이용약관</a> 및
					<a href="/privacy" target="_blank">개인정보처리방침</a>에 동의합니다.</span
				>
			</label>
			{#if errors.terms}
				<span class="field-error">{errors.terms}</span>
			{/if}
		</div>

		<Button type="submit" variant="primary" fullWidth {loading}>
			회원가입
		</Button>
	</form>

	<div class="form-footer">
		<p class="footer-text">
			이미 계정이 있으신가요?
			<a href="/auth/login" class="footer-link">로그인</a>
		</p>
	</div>
</div>

<style>
	.signup-form {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		padding: var(--space-2xl);
		background-color: var(--surface-primary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
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
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	.form-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
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

	.password-strength {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.strength-bar {
		flex: 1;
		height: 4px;
		background-color: var(--surface-secondary);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.strength-fill {
		height: 100%;
		transition: all var(--transition-fast);
		border-radius: var(--radius-full);
	}

	.strength-fill.weak {
		width: 33%;
		background-color: var(--error);
	}

	.strength-fill.medium {
		width: 66%;
		background-color: var(--warning);
	}

	.strength-fill.strong {
		width: 100%;
		background-color: var(--success);
	}

	.strength-label {
		font-size: var(--font-caption1);
		color: var(--text-secondary);
		min-width: 40px;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		font-size: var(--font-callout);
		color: var(--text-secondary);
		cursor: pointer;
	}

	.checkbox-label.error {
		color: var(--error);
	}

	.checkbox-label input {
		margin-top: 2px;
		cursor: pointer;
		accent-color: var(--primary);
	}

	.checkbox-label a {
		color: var(--primary);
		text-decoration: underline;
	}

	.field-error {
		font-size: var(--font-callout);
		color: var(--error);
	}

	.form-footer {
		margin-top: var(--space-xl);
		text-align: center;
	}

	.footer-text {
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	.footer-link {
		color: var(--primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
	}

	.footer-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.signup-form {
			padding: var(--space-xl);
		}
	}
</style>
