import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	
	kit: {
		// adapter-auto를 사용하여 자동으로 적절한 어댑터를 선택합니다.
		adapter: adapter(),

		// 파일 구조를 정의하는 객체입니다.
		files: {
			routes: 'src/routes', 			// 라우트 파일들의 위치를 'src/routes'로 지정합니다.
			lib: 'src/lib', 			// lib 디렉토리의 위치를 지정합니다.
			assets: 'src/assets',  // favicon.png 파일의 위치를 지정합니다.
		},
		// 별칭을 정의하여 import 문을 더 간단하게 만듭니다.
		alias: {
			$lib: 'src/lib',
			$css: 'public/css',
			$fonts: 'src/statics/fonts'
		},
		// 정적 자산 처리를 위한 설정
		paths: {
			assets: ''
		}
	},

	vitePlugin: {
		// 이 설정은 컴파일 시 발생하는 경고를 learn.svelte.dev 에디터에서 볼 수 있게 합니다.
		onwarn: (warning, defaultHandler) => {
			console.log('svelte:warnings:%s', JSON.stringify(warning));
			defaultHandler(warning);
		}
	}
};

export default config;
