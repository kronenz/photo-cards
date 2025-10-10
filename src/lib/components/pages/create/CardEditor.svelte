<!--
  Card Editor Component - Form with validation
  Feature: 003-navigation-ui-renewal
  Task: T043 - US2
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/design-system/Input.svelte';
	import Button from '$lib/components/design-system/Button.svelte';
	import { validateField } from '$lib/utils/validation';

	export let playerName = '';
	export let team = '';
	export let position = '';
	export let year = '';
	export let holographicEffect = true;

	const dispatch = createEventDispatcher<{
		update: {
			playerName: string;
			team: string;
			position: string;
			year: string;
			holographicEffect: boolean;
		};
		save: void;
	}>();

	let errors: Record<string, string | null> = {
		playerName: null,
		team: null,
		position: null,
		year: null
	};

	const teams = [
		'LG 트윈스',
		'두산 베어스',
		'KT 위즈',
		'삼성 라이온즈',
		'롯데 자이언츠',
		'한화 이글스',
		'KIA 타이거즈',
		'NC 다이노스',
		'SSG 랜더스',
		'키움 히어로즈'
	];

	const positions = ['투수', '포수', '내야수', '외야수', '지명타자'];

	function validateForm() {
		errors.playerName = validateField(playerName, [
			{ type: 'required', message: '선수 이름을 입력하세요.' },
			{ type: 'minLength', message: '2자 이상 입력하세요.', value: 2 }
		]);

		errors.team = validateField(team, [
			{ type: 'required', message: '구단을 선택하세요.' }
		]);

		errors.position = validateField(position, [
			{ type: 'required', message: '포지션을 선택하세요.' }
		]);

		errors.year = validateField(year, [
			{ type: 'pattern', message: '올바른 연도를 입력하세요. (예: 2024)', value: '^\\d{4}$' }
		]);

		return Object.values(errors).every((error) => error === null);
	}

	function handleSubmit() {
		if (validateForm()) {
			dispatch('save');
		}
	}

	$: {
		dispatch('update', {
			playerName,
			team,
			position,
			year,
			holographicEffect
		});
	}
</script>

<div class="editor-container">
	<form on:submit|preventDefault={handleSubmit} class="editor-form">
		<div class="form-section">
			<h3 class="section-title">기본 정보</h3>

			<div class="form-field">
				<label for="playerName" class="field-label">선수 이름 *</label>
				<Input
					id="playerName"
					bind:value={playerName}
					placeholder="예: 김민재"
					error={errors.playerName || ''}
					on:blur={() => {
						errors.playerName = validateField(playerName, [
							{ type: 'required', message: '선수 이름을 입력하세요.' }
						]);
					}}
				/>
			</div>

			<div class="form-field">
				<label for="team" class="field-label">구단 *</label>
				<select
					id="team"
					bind:value={team}
					class="field-select"
					class:error={errors.team}
					on:blur={() => {
						errors.team = validateField(team, [
							{ type: 'required', message: '구단을 선택하세요.' }
						]);
					}}
				>
					<option value="">구단 선택</option>
					{#each teams as teamOption}
						<option value={teamOption}>{teamOption}</option>
					{/each}
				</select>
				{#if errors.team}
					<span class="field-error">{errors.team}</span>
				{/if}
			</div>

			<div class="form-field">
				<label for="position" class="field-label">포지션 *</label>
				<select
					id="position"
					bind:value={position}
					class="field-select"
					class:error={errors.position}
					on:blur={() => {
						errors.position = validateField(position, [
							{ type: 'required', message: '포지션을 선택하세요.' }
						]);
					}}
				>
					<option value="">포지션 선택</option>
					{#each positions as positionOption}
						<option value={positionOption}>{positionOption}</option>
					{/each}
				</select>
				{#if errors.position}
					<span class="field-error">{errors.position}</span>
				{/if}
			</div>

			<div class="form-field">
				<label for="year" class="field-label">연도</label>
				<Input
					id="year"
					bind:value={year}
					placeholder="예: 2024"
					error={errors.year || ''}
					on:blur={() => {
						if (year) {
							errors.year = validateField(year, [
								{ type: 'pattern', message: '올바른 연도를 입력하세요.', value: '^\\d{4}$' }
							]);
						}
					}}
				/>
			</div>
		</div>

		<div class="form-section">
			<h3 class="section-title">효과</h3>

			<div class="form-field">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={holographicEffect} />
					<span>홀로그래픽 효과 사용</span>
				</label>
				<p class="field-hint">카드에 프리미엄 홀로그래픽 효과를 적용합니다.</p>
			</div>
		</div>

		<div class="form-actions">
			<Button type="submit" variant="primary" fullWidth>
				💾 카드 저장
			</Button>
		</div>
	</form>
</div>

<style>
	.editor-container {
		width: 100%;
		max-width: 500px;
	}

	.editor-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--font-title3);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid var(--border-primary);
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

	.field-select {
		padding: var(--space-md);
		font-size: var(--font-body);
		color: var(--text-primary);
		background-color: var(--surface-primary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		cursor: pointer;
	}

	.field-select:hover {
		border-color: var(--primary);
	}

	.field-select:focus {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
		border-color: var(--primary);
	}

	.field-select.error {
		border-color: var(--error);
	}

	.field-error {
		font-size: var(--font-callout);
		color: var(--error);
	}

	.field-hint {
		font-size: var(--font-callout);
		color: var(--text-secondary);
		margin: 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--font-body);
		color: var(--text-primary);
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: var(--primary);
	}

	.form-actions {
		margin-top: var(--space-lg);
	}

	@media (max-width: 768px) {
		.editor-container {
			max-width: 100%;
		}
	}
</style>
