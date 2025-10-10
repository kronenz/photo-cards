<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { browser } from '$app/environment';
	import UnifiedCard from '$lib/components/v2/UnifiedCard.svelte';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;
	let rememberMe = false;

	async function handleSubmit() {
		error = '';
		loading = true;

		try {
			if (!email || !password) {
				throw new Error('이메일과 비밀번호를 입력하세요.');
			}

			await pb.collection('users').authWithPassword(email, password);

			if (rememberMe && browser) {
				localStorage.setItem('rememberMe', 'true');
			}

			goto('/');
		} catch (err: any) {
			error = err.message || '로그인에 실패했습니다.';
		} finally {
			loading = false;
		}
	}

	async function handleOAuth(provider: 'google' | 'github' | 'kakao' | 'naver') {
		error = '';
		loading = true;

		try {
			await pb.collection('users').authWithOAuth2({ provider });
			goto('/');
		} catch (err: any) {
			error = `${provider} 로그인에 실패했습니다.`;
			loading = false;
		}
	}
</script>

<div class="login-page">
	<!-- Left: Holographic Card Animation -->
	<div class="card-showcase">
		<div class="showcase-content">
			<h1 class="brand-title">홀로그래픽 카드 플랫폼</h1>
			<p class="brand-subtitle">나만의 프리미엄 카드 컬렉션을 시작하세요</p>

			<div class="demo-card">
				<UnifiedCard
					title="홀로그래픽"
					subtitle="프리미엄 카드"
					number="001"
					team="lg"
					rarity="legendary"
					image="https://picsum.photos/400/560?random=login"
					size="large"
					effectType="rainbow"
				/>
			</div>

			<div class="showcase-features">
				<div class="feature">
					<span class="feature-icon">✨</span>
					<span>60fps 홀로그래픽 효과</span>
				</div>
				<div class="feature">
					<span class="feature-icon">🎴</span>
					<span>무제한 카드 컬렉션</span>
				</div>
				<div class="feature">
					<span class="feature-icon">🤝</span>
					<span>커뮤니티 공유 & 거래</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Login Form -->
	<div class="form-container">
		<div class="form-wrapper">
			<div class="form-header">
				<h2 class="form-title">로그인</h2>
				<p class="form-subtitle">홀로그래픽 카드에 오신 것을 환영합니다</p>
			</div>

			<!-- OAuth Buttons -->
			<div class="oauth-section">
				<button
					type="button"
					class="oauth-button google"
					on:click={() => handleOAuth('google')}
					disabled={loading}
				>
					<svg class="oauth-icon" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					<span>Google로 계속하기</span>
				</button>

				<button
					type="button"
					class="oauth-button github"
					on:click={() => handleOAuth('github')}
					disabled={loading}
				>
					<svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span>GitHub로 계속하기</span>
				</button>

				<button
					type="button"
					class="oauth-button kakao"
					on:click={() => handleOAuth('kakao')}
					disabled={loading}
				>
					<svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 3c-5.799 0-10.5 3.664-10.5 8.185 0 2.868 1.912 5.389 4.785 6.825-.203.746-.765 2.814-.88 3.24-.14.525.192.518.403.376.174-.117 2.808-1.904 3.877-2.629.766.107 1.55.162 2.315.162 5.799 0 10.5-3.664 10.5-8.185S17.799 3 12 3z"
						/>
					</svg>
					<span>Kakao로 계속하기</span>
				</button>

				<button
					type="button"
					class="oauth-button naver"
					on:click={() => handleOAuth('naver')}
					disabled={loading}
				>
					<svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
					</svg>
					<span>Naver로 계속하기</span>
				</button>
			</div>

			<div class="divider">
				<span class="divider-text">또는</span>
			</div>

			<!-- Email Login Form -->
			<form on:submit|preventDefault={handleSubmit} class="login-form">
				<div class="form-field">
					<label for="email" class="field-label">이메일</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="your@email.com"
						disabled={loading}
						class="field-input"
						autocomplete="email"
					/>
				</div>

				<div class="form-field">
					<label for="password" class="field-label">비밀번호</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						disabled={loading}
						class="field-input"
						autocomplete="current-password"
					/>
				</div>

				<div class="form-extras">
					<label class="remember-label">
						<input type="checkbox" bind:checked={rememberMe} disabled={loading} />
						<span>로그인 상태 유지</span>
					</label>
					<a href="/auth/forgot-password" class="forgot-link">비밀번호 찾기</a>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				<button type="submit" class="submit-button" disabled={loading}>
					{#if loading}
						<span class="loading-spinner"></span>
						<span>로그인 중...</span>
					{:else}
						<span>로그인</span>
					{/if}
				</button>
			</form>

			<div class="form-footer">
				<p class="footer-text">
					계정이 없으신가요?
					<a href="/register" class="footer-link">회원가입</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.login-page {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 100vh;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
		overflow: hidden;
	}

	/* Left: Card Showcase */
	.card-showcase {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px;
		position: relative;
	}

	.showcase-content {
		max-width: 500px;
		text-align: center;
	}

	.brand-title {
		font-size: 48px;
		font-weight: 800;
		background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 16px 0;
		line-height: 1.2;
	}

	.brand-subtitle {
		font-size: 20px;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 0 60px 0;
	}

	.demo-card {
		margin: 0 auto 48px;
		display: flex;
		justify-content: center;
	}

	.showcase-features {
		display: flex;
		flex-direction: column;
		gap: 16px;
		text-align: left;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 16px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.feature-icon {
		font-size: 24px;
	}

	/* Right: Form Container */
	.form-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px;
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(20px);
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}

	.form-wrapper {
		width: 100%;
		max-width: 460px;
	}

	.form-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.form-title {
		font-size: 36px;
		font-weight: 700;
		color: white;
		margin: 0 0 8px 0;
	}

	.form-subtitle {
		font-size: 16px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	/* OAuth Buttons */
	.oauth-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 32px;
	}

	.oauth-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 14px 24px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.08);
		color: white;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.oauth-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
	}

	.oauth-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.oauth-button.kakao {
		background: #fee500;
		color: #000000;
		border-color: #fee500;
	}

	.oauth-button.kakao:hover:not(:disabled) {
		background: #fada0a;
	}

	.oauth-button.naver {
		background: #03c75a;
		color: white;
		border-color: #03c75a;
	}

	.oauth-button.naver:hover:not(:disabled) {
		background: #02b350;
	}

	.oauth-icon {
		width: 20px;
		height: 20px;
	}

	/* Divider */
	.divider {
		position: relative;
		text-align: center;
		margin: 32px 0;
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

	.divider-text {
		position: relative;
		padding: 0 16px;
		background: rgba(255, 255, 255, 0.02);
		color: rgba(255, 255, 255, 0.5);
		font-size: 14px;
	}

	/* Login Form */
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-label {
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.field-input {
		padding: 14px 16px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: white;
		font-size: 15px;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.field-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.field-input:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.12);
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.field-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-extras {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
	}

	.remember-label {
		display: flex;
		align-items: center;
		gap: 8px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
	}

	.remember-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #667eea;
	}

	.forgot-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.forgot-link:hover {
		color: #764ba2;
	}

	.error-message {
		padding: 12px 16px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 14px;
		text-align: center;
	}

	.submit-button {
		padding: 16px 24px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.submit-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 30px rgba(102, 126, 234, 0.4);
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.form-footer {
		margin-top: 32px;
		text-align: center;
	}

	.footer-text {
		font-size: 15px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.footer-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 700;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: #764ba2;
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.login-page {
			grid-template-columns: 1fr;
		}

		.card-showcase {
			display: none;
		}

		.form-container {
			border-left: none;
			padding: 40px 24px;
		}
	}

	@media (max-width: 768px) {
		.brand-title {
			font-size: 32px;
		}

		.brand-subtitle {
			font-size: 16px;
		}

		.form-title {
			font-size: 28px;
		}

		.oauth-section {
			gap: 10px;
		}

		.oauth-button {
			padding: 12px 20px;
			font-size: 14px;
		}
	}
</style>
