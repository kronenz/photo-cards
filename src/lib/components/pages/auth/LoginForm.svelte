<!--
  Login Form Component
  Feature: 003-navigation-ui-renewal
  Task: T078 - US4
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/design-system/Input.svelte';
	import Button from '$lib/components/design-system/Button.svelte';
	import { validateField } from '$lib/utils/validation';

	export let loading = false;

	const dispatch = createEventDispatcher<{
		submit: { email: string; password: string };
		oauth: { provider: 'google' | 'github' };
	}>();

	let email = '';
	let password = '';
	let errors = {
		email: '',
		password: ''
	};

	function validate() {
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

		return !errors.email && !errors.password;
	}

	function handleSubmit() {
		if (validate()) {
			dispatch('submit', { email, password });
		}
	}

	function handleOAuth(provider: 'google' | 'github') {
		dispatch('oauth', { provider });
	}
</script>

<div class="login-form">
	<div class="form-header">
		<h2 class="form-title">로그인</h2>
		<p class="form-subtitle">홀로그래픽 카드에 오신 것을 환영합니다</p>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="form-body">
		<div class="form-field">
			<label for="email" class="field-label">이메일</label>
			<Input
				id="email"
				type="email"
				bind:value={email}
				placeholder="your@email.com"
				error={errors.email}
				disabled={loading}
				on:blur={() => {
					if (email) {
						errors.email =
							validateField(email, [{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]) ||
							'';
					}
				}}
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
		</div>

		<div class="form-extras">
			<label class="remember-label">
				<input type="checkbox" />
				<span>로그인 상태 유지</span>
			</label>
			<a href="/auth/forgot-password" class="forgot-link">비밀번호 찾기</a>
		</div>

		<Button type="submit" variant="primary" fullWidth {loading}>
			로그인
		</Button>
	</form>

	<div class="divider">
		<span class="divider-text">또는</span>
	</div>

	<div class="oauth-buttons">
		<button
			type="button"
			class="oauth-button google"
			on:click={() => handleOAuth('google')}
			disabled={loading}
		>
			<span class="oauth-icon">🔵</span>
			<span>Google로 계속하기</span>
		</button>
		<button
			type="button"
			class="oauth-button github"
			on:click={() => handleOAuth('github')}
			disabled={loading}
		>
			<span class="oauth-icon">⚫</span>
			<span>GitHub로 계속하기</span>
		</button>
	</div>

	<div class="form-footer">
		<p class="footer-text">
			계정이 없으신가요?
			<a href="/auth/signup" class="footer-link">회원가입</a>
		</p>
	</div>
</div>

<style>
	.login-form {
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

	.form-extras {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-callout);
	}

	.remember-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		cursor: pointer;
		color: var(--text-secondary);
	}

	.remember-label input {
		cursor: pointer;
		accent-color: var(--primary);
	}

	.forgot-link {
		color: var(--primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
	}

	.forgot-link:hover {
		text-decoration: underline;
	}

	.divider {
		position: relative;
		text-align: center;
		margin: var(--space-xl) 0;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background-color: var(--border-primary);
	}

	.divider-text {
		position: relative;
		padding: 0 var(--space-md);
		background-color: var(--surface-primary);
		color: var(--text-secondary);
		font-size: var(--font-callout);
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.oauth-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		background-color: var(--surface-primary);
		color: var(--text-primary);
		font-size: var(--font-body);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.oauth-button:hover:not(:disabled) {
		background-color: var(--surface-secondary);
		border-color: var(--primary);
	}

	.oauth-button:disabled {
		opacity: var(--opacity-disabled);
		cursor: not-allowed;
	}

	.oauth-icon {
		font-size: 1.2em;
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
		.login-form {
			padding: var(--space-xl);
		}
	}
</style>
