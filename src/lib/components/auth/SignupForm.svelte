<script lang="ts">
	import { supabaseAuthService } from '$lib/services/supabaseAuthService';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let displayName = '';
	let isLoading = false;
	let error = '';

	async function handleSignup() {
		error = '';

		// Validation
		if (!email || !password || !confirmPassword) {
			error = '모든 필드를 입력해주세요.';
			return;
		}

		if (password !== confirmPassword) {
			error = '비밀번호가 일치하지 않습니다.';
			return;
		}

		if (password.length < 6) {
			error = '비밀번호는 최소 6자 이상이어야 합니다.';
			return;
		}

		isLoading = true;

		try {
			const user = await supabaseAuthService.signUpWithEmail(
				email,
				password,
				displayName || undefined
			);

			if (user) {
				goto('/');
			} else {
				error = '회원가입에 실패했습니다. 다시 시도해주세요.';
			}
		} catch (err) {
			console.error('Signup error:', err);
			error = '회원가입 중 오류가 발생했습니다.';
		} finally {
			isLoading = false;
		}
	}

	async function handleOAuthSignup(provider: 'github' | 'google') {
		isLoading = true;
		error = '';

		try {
			await supabaseAuthService.signInWithOAuth(provider);
		} catch (err) {
			console.error('OAuth signup error:', err);
			error = `${provider} 회원가입 중 오류가 발생했습니다.`;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="signup-form">
	<h2 class="title">회원가입</h2>

	{#if error}
		<div class="error-message" role="alert">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSignup}>
		<div class="form-group">
			<label for="email">이메일 *</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="이메일을 입력하세요"
				disabled={isLoading}
				required
			/>
		</div>

		<div class="form-group">
			<label for="displayName">닉네임 (선택)</label>
			<input
				id="displayName"
				type="text"
				bind:value={displayName}
				placeholder="닉네임을 입력하세요"
				disabled={isLoading}
			/>
		</div>

		<div class="form-group">
			<label for="password">비밀번호 *</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				placeholder="비밀번호를 입력하세요 (최소 6자)"
				disabled={isLoading}
				required
			/>
		</div>

		<div class="form-group">
			<label for="confirmPassword">비밀번호 확인 *</label>
			<input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				placeholder="비밀번호를 다시 입력하세요"
				disabled={isLoading}
				required
			/>
		</div>

		<button type="submit" class="btn-primary" disabled={isLoading}>
			{isLoading ? '가입 중...' : '회원가입'}
		</button>
	</form>

	<div class="divider">
		<span>또는</span>
	</div>

	<div class="oauth-buttons">
		<button
			type="button"
			class="btn-oauth btn-github"
			on:click={() => handleOAuthSignup('github')}
			disabled={isLoading}
		>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"
				/>
			</svg>
			GitHub로 시작하기
		</button>

		<button
			type="button"
			class="btn-oauth btn-google"
			on:click={() => handleOAuthSignup('google')}
			disabled={isLoading}
		>
			<svg width="20" height="20" viewBox="0 0 20 20">
				<path
					fill="#4285F4"
					d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
				/>
				<path
					fill="#34A853"
					d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
				/>
				<path
					fill="#FBBC05"
					d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
				/>
				<path
					fill="#EA4335"
					d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
				/>
			</svg>
			Google로 시작하기
		</button>
	</div>

	<div class="footer">
		<p>
			이미 계정이 있으신가요? <a href="/auth/login">로그인</a>
		</p>
	</div>
</div>

<style>
	.signup-form {
		width: 100%;
		max-width: 420px;
		margin: 0 auto;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}

	.title {
		font-size: 2rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.error-message {
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.875rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: white;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.form-group input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.btn-primary {
		width: 100%;
		padding: 0.875rem 1.5rem;
		margin-top: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.divider {
		position: relative;
		margin: 2rem 0;
		text-align: center;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: rgba(255, 255, 255, 0.1);
	}

	.divider span {
		position: relative;
		padding: 0 1rem;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.btn-oauth {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-oauth:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.btn-oauth:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-github {
		background: #24292e;
		border-color: #24292e;
	}

	.btn-github:hover:not(:disabled) {
		background: #2f363d;
		border-color: #2f363d;
	}

	.footer {
		margin-top: 2rem;
		text-align: center;
		font-size: 0.875rem;
	}

	.footer p {
		margin: 0.5rem 0;
		color: rgba(255, 255, 255, 0.6);
	}

	.footer a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.footer a:hover {
		color: #764ba2;
		text-decoration: underline;
	}
</style>
