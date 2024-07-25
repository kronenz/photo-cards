//import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter() 함수를 사용하여 SvelteKit 애플리케이션을 특정 환경에 맞게 빌드합니다.
		// 이는 애플리케이션을 다양한 호스팅 플랫폼에 배포할 수 있게 해주는 중요한 설정입니다.
		//adapter: adapter(),

		// 파일 구조를 정의하는 객체입니다.
		files: {
			// 라우트 파일들의 위치를 'src/routes'로 지정합니다.
			// 이는 애플리케이션의 페이지와 API 엔드포인트가 이 디렉토리에 위치함을 나타냅니다.
			// 이 설정으로 개발자는 일관된 파일 구조를 유지할 수 있습니다.
			routes: 'src/routes'
		},
		// 튜토리얼을 위해 CSRF 보호를 비활성화합니다.
		// 실제 애플리케이션에서는 이렇게 하지 마세요. 보안에 심각한 위험이 될 수 있습니다!
		// CSRF(Cross-Site Request Forgery)는 웹사이트 취약점 공격의 한 종류로,
		// 사용자가 자신의 의지와는 무관하게 공격자가 의도한 행위를 특정 웹사이트에 요청하게 하는 공격입니다.
		// 자세한 정보는 https://kit.svelte.dev/docs/configuration#csrf 를 참조하세요.
		csrf: false
	},

	vitePlugin: {
		// 이 설정은 컴파일 시 발생하는 경고를 learn.svelte.dev 에디터에서 볼 수 있게 합니다.
		// 개발 중 발생하는 잠재적인 문제점을 조기에 발견하고 수정할 수 있도록 도와줍니다.
		onwarn: (warning, defaultHandler) => {
			// 경고 메시지를 JSON 형식으로 변환하여 콘솔에 출력합니다.
			console.log('svelte:warnings:%s', JSON.stringify(warning));
			// 기본 경고 핸들러를 호출하여 추가적인 처리를 수행합니다.
			defaultHandler(warning);
		}
	}
};

export default config;
