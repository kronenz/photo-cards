<script>
	
	import { activeCard } from "$stores/activeCard.js"; // activeCard 스토어를 가져옵니다.
	
	let thisGrid; // 현재 그리드 요소를 참조할 변수를 선언합니다.
	
	$: active = thisGrid && thisGrid.contains( $activeCard ); // thisGrid가 존재하고 activeCard를 포함하면 active를 true로 설정합니다.
	
</script>

<section 
	class="card-grid" 
	class:active  
	bind:this={thisGrid} 
>

<slot />

</section>

<style>
	.card-grid {
		display: grid; /* 그리드 레이아웃을 사용합니다 */
		grid-template-columns: 1fr; /* 기본적으로 1열 그리드를 만듭니다 */
		grid-gap: 50px 2vw; /* 행간 50px, 열간 2vw의 간격을 설정합니다 */
		transform-style: preserve-3d; /* 3D 변환을 위한 스타일을 설정합니다 */
		height: 100%; /* 그리드의 높이를 부모 요소의 100%로 설정합니다 */
		width: 95vw; /* 그리드의 너비를 부모 요소의 100%로 설정합니다 */
		margin: auto; /* 그리드를 수평 중앙에 배치합니다 */
		padding: 50px; /* 그리드 주변에 50px의 패딩을 추가합니다 */
		position: relative; /* 자식 요소의 위치 기준점이 됩니다 */
	}
	
	.card-grid.active {
		z-index: 99; /* 활성화된 그리드를 다른 요소 위에 표시합니다 */
	}
		

	@media screen and (min-width: 1200px) {
		.card-grid {
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* 화면 너비가 1200px 이상일 때 5열 그리드로 변경합니다 */
		}
	}
	
	@media screen and (max-width: 1200px) { /* 화면 너비가 1200px 이하일 때 적용되는 스타일을 정의합니다 */
		
		:global( .card-grid > .card ) {
			--row: 1; /* 기본 행 변수를 설정합니다 */
			grid-column: 1; /* 모든 카드를 첫 번째 열에 배치합니다 */
			grid-row: var(--row); /* 행 위치를 변수로 설정합니다 */
			transition: opacity 0.2s ease, transform 0.2s ease; /* 불투명도와 변형에 0.2초의 전환 효과를 적용합니다 */
		}

		:global( .card-grid > .card:nth-child(1n) ) {
			position: relative; /* 상대적 위치 지정을 사용합니다 */
			left: -100px; /* 왼쪽으로 100px 이동합니다 */
			top: 20px; /* 위로 20px 이동합니다 */
			z-index: calc(var(--card-scale) * 10 + 54); /* z-index를 동적으로 계산합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(-10deg); /* 3D 변환과 -10도 회전을 적용합니다 */
			opacity: 1; /* 완전히 불투명하게 설정합니다 */
		}
		:global( .card-grid > .card:nth-child(2n) ) {
			left: -50px; /* 왼쪽으로 50px 이동합니다 */
			top: 10px; /* 위로 10px 이동합니다 */
			z-index: calc(var(--card-scale) * 10 + 53); /* z-index를 동적으로 계산합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(-5deg); /* 3D 변환과 -5도 회전을 적용합니다 */
			opacity: 0.99; /* 약간 투명하게 설정합니다 */
		}
		:global( .card-grid > .card:nth-child(3n) ) {
			left: 0px; /* 원래 위치에 둡니다 */
			top: 0px; /* 원래 위치에 둡니다 */
			z-index: calc(var(--card-scale) * 10 + 52); /* z-index를 동적으로 계산합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(0deg); /* 3D 변환을 적용하고 회전은 없습니다 */
			opacity: 0.98; /* 약간 더 투명하게 설정합니다 */
		}
		:global( .card-grid > .card:nth-child(4n) ) {
			left: 50px; /* 오른쪽으로 50px 이동합니다 */
			top: 10px; /* 위로 10px 이동합니다 */
			z-index: calc(var(--card-scale) * 10 + 51); /* z-index를 동적으로 계산합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(5deg); /* 3D 변환과 5도 회전을 적용합니다 */
			opacity: 0.97; /* 더 투명하게 설정합니다 */
		}
		:global( .card-grid > .card:nth-child(5n) ) {
			left: 100px; /* 오른쪽으로 100px 이동합니다 */
			top: 20px; /* 위로 20px 이동합니다 */
			z-index: calc(var(--card-scale) * 10 + 50); /* z-index를 동적으로 계산합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(10deg); /* 3D 변환과 10도 회전을 적용합니다 */
			opacity: 0.96; /* 가장 투명하게 설정합니다 */
		}
		:global( .card-grid > .card.interacting) ,
		:global( .card-grid > .card.active ) {
			opacity: 1; /* 상호작용 중이거나 활성화된 카드는 완전히 불투명하게 설정합니다 */
		}
		
		:global( .card-grid > .card:nth-child(n+6):nth-child(-n+10) ) { grid-row: 2; } /* 6번째부터 10번째 카드를 2행에 배치합니다 */
		:global( .card-grid > .card:nth-child(n+11):nth-child(-n+15) ) { grid-row: 3; } /* 11번째부터 15번째 카드를 3행에 배치합니다 */
		:global( .card-grid > .card:nth-child(n+16):nth-child(-n+20) ) { grid-row: 4; } /* 16번째부터 20번째 카드를 4행에 배치합니다 */
		:global( .card-grid > .card:nth-child(n+21):nth-child(-n+25) ) { grid-row: 5; } /* 21번째부터 25번째 카드를 5행에 배치합니다 */
		:global( .card-grid > .card:nth-child(n+26):nth-child(-n+30) ) { grid-row: 6; } /* 26번째부터 30번째 카드를 6행에 배치합니다 */
		:global( .card-grid > .card:nth-child(n+31) ) {
			grid-row: auto; /* 31번째 이후의 카드는 자동으로 행을 배치합니다 */
			grid-column: auto; /* 31번째 이후의 카드는 자동으로 열을 배치합니다 */
			transform: none!important; /* 변형을 제거합니다 */
			left: 0!important; /* 왼쪽 위치를 초기화합니다 */
			top: 0!important; /* 위쪽 위치를 초기화합니다 */
		}

	}
	
	@media screen and (min-width: 600px) and (max-width: 1200px) { /* 화면의 너비가 600px 에서 1200px 사이일때 적용 */
		.card-grid {
			max-width: 420px; /* 그리드의 최대 너비를 420px로 제한합니다 */
			margin: auto; /* 그리드를 수평 중앙에 배치합니다 */
		}
		:global( .card-grid > .card:nth-child(1n) ) {
			left: -100px; /* 왼쪽으로 100px 이동합니다 */
			top: 20px; /* 위로 20px 이동합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(-10deg); /* 3D 변환과 -10도 회전을 적용합니다 */
		}
		:global( .card-grid > .card:nth-child(2n) ) {
			left: -50px; /* 왼쪽으로 50px 이동합니다 */
			top: 10px; /* 위로 10px 이동합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(-5deg); /* 3D 변환과 -5도 회전을 적용합니다 */
		}
		:global( .card-grid > .card:nth-child(3n) ) {
			left: 0px; /* 원래 위치에 둡니다 */
			top: 0px; /* 원래 위치에 둡니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(0deg); /* 3D 변환을 적용하고 회전은 없습니다 */
		}
		:global( .card-grid > .card:nth-child(4n) ) {
			left: 50px; /* 오른쪽으로 50px 이동합니다 */
			top: 10px; /* 위로 10px 이동합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(5deg); /* 3D 변환과 5도 회전을 적용합니다 */
		}
		:global( .card-grid > .card:nth-child(5n) ) {
			left: 100px; /* 오른쪽으로 100px 이동합니다 */
			top: 20px; /* 위로 20px 이동합니다 */
			transform: translate3d(0, 0, 0.1px) rotateZ(10deg); /* 3D 변환과 10도 회전을 적용합니다 */
		}
	}

	:global( .card-grid > .card.active ) {
		transform: translate3d(0, 0, 0.1px)!important; /* 활성화된 카드의 변형을 초기화합니다 */
	}
	
</style>
