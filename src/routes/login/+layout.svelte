<script>
    // Svelte의 onMount 훅을 가져옵니다. 이는 컴포넌트가 DOM에 마운트된 후 실행될 코드를 정의하는 데 사용됩니다.
    import { onMount } from 'svelte';
    // PocketBase 인스턴스를 가져옵니다. 이는 백엔드와의 통신을 담당합니다.
    import { pb } from '$lib/pocketbase';
    // Svelte의 writable 스토어를 가져옵니다. 이는 반응형 상태를 만드는 데 사용됩니다.
    import { writable } from 'svelte/store';
  
    // 사용자 정보를 저장할 writable 스토어를 생성합니다. 초기값은 현재 인증된 사용자 모델입니다.
    export const user = writable(pb.authStore.model);
    // PocketBase의 인증 상태가 변경될 때마다 실행될 콜백을 설정합니다.
    pb.authStore.onChange((auth) => {
      // 인증 상태가 변경되면 user 스토어를 새로운 사용자 모델로 업데이트합니다.
      user.set(pb.authStore.model);
    });
  
    // 컴포넌트가 마운트된 후 실행될 코드를 정의합니다.
    onMount(() => {
      // 페이지 로드 시 인증 상태를 확인합니다.
      if (pb.authStore.isValid) {
        // 유효한 인증 정보가 있다면 user 스토어를 현재 사용자 모델로 설정합니다.
        user.set(pb.authStore.model);
      }
    });
</script>
  
<!-- 자식 컴포넌트를 렌더링할 위치를 지정합니다. -->
<slot />