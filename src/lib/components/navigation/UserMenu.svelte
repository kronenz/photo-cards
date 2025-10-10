<!--
  User Menu Component
  Feature: 003-navigation-ui-renewal
  Task: T031
  Dropdown menu for authenticated users
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import DropdownMenu from '$lib/components/design-system/DropdownMenu.svelte';

	export let user: {
		name: string;
		email: string;
		avatar?: string;
	} | null = null;

	const menuItems = [
		{
			label: '프로필',
			icon: '👤',
			onClick: () => goto('/profile')
		},
		{
			label: '내 컬렉션',
			icon: '📚',
			onClick: () => goto('/collections')
		},
		{
			label: '설정',
			icon: '⚙️',
			onClick: () => goto('/settings')
		},
		{
			label: '도움말',
			icon: '❓',
			onClick: () => goto('/help')
		},
		{
			label: '로그아웃',
			icon: '🚪',
			onClick: handleLogout
		}
	];

	async function handleLogout() {
		// TODO: Implement actual logout logic with auth service
		try {
			// await authService.logout();
			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

{#if user}
	<DropdownMenu items={menuItems} align="end">
		<button slot="trigger" let:builder use:builder.action {...builder} class="user-avatar-button">
			{#if user.avatar}
				<img src={user.avatar} alt={user.name} class="avatar-image" />
			{:else}
				<div class="avatar-placeholder">
					<span class="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>
				</div>
			{/if}
		</button>
	</DropdownMenu>
{:else}
	<a href="/login" class="login-button">로그인</a>
{/if}

<style>
	.user-avatar-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		border-radius: 50%;
		overflow: hidden;
		transition: all var(--transition-fast);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-avatar-button:hover {
		transform: scale(1.05);
		box-shadow: 0 0 0 3px var(--surface-secondary);
	}

	.user-avatar-button:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--primary), var(--secondary));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-initial {
		color: white;
		font-size: 1.2em;
		font-weight: var(--font-weight-bold);
	}

	.login-button {
		padding: var(--space-sm) var(--space-lg);
		background-color: var(--primary);
		color: white;
		text-decoration: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-callout);
		transition: all var(--transition-fast);
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.login-button:hover {
		background-color: var(--primary-dark);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.login-button:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	.login-button:active {
		transform: translateY(0);
	}
</style>
