import { defineConfig, loadEnv } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {

  // 현재 모드의 환경 변수를 로드합니다.
  // 이렇게 하는 이유:
  // 1. 현재 실행 모드(개발/프로덕션)에 따라 적절한 환경 변수를 사용할 수 있습니다.
  // 2. 프로젝트의 루트 디렉토리에서 환경 변수를 찾아 로드합니다.
  // 3. 빈 문자열을 prefix로 사용하여 모든 환경 변수를 로드합니다.
  const venv = loadEnv(mode, process.cwd(), '')

  // 'VITE_' 접두사로 시작하는 환경 변수만 필터링하여 새로운 객체를 생성합니다.
  // 이렇게 하는 이유:
  // 1. Vite에서 클라이언트 사이드 코드에 노출될 환경 변수를 제한합니다.
  // 2. 'VITE_' 접두사가 없는 민감한 환경 변수가 실수로 노출되는 것을 방지합니다.
  // 3. 필요한 환경 변수만 선택적으로 사용하여 보안을 강화합니다.
  const env = Object.keys(venv)
    .filter((item) => item.startsWith("VITE_"))
    .reduce((cur, key) => { 
      return Object.assign(cur, { [key]: venv[key] })
    }, {});

  // HTML 플러그인 정의
  const htmlPlugin = () => {
    return {
        // 플러그인 이름 설정
        name: "html-transform",
        // HTML 변환 함수
        transformIndexHtml(html) {
          // HTML 내의 %로 둘러싸인 모든 문자열을 찾아 대체합니다.
          // 이렇게 하는 이유:
          // 1. 환경 변수를 HTML에 동적으로 주입할 수 있습니다.
          // 2. 빌드 시점에 환경 변수 값을 결정할 수 있어 보안성이 향상됩니다.
          // 3. 개발 및 프로덕션 환경에서 서로 다른 설정을 쉽게 적용할 수 있습니다.
          // 4. 코드의 재사용성과 유지보수성이 향상됩니다.
          return html.replace(/%(.*?)%/g, function (match, p1) {
            // 환경 변수에서 해당 키의 값을 찾아 반환합니다.
            // 이렇게 하는 이유:
            // 1. HTML 내의 환경 변수 플레이스홀더를 실제 값으로 대체할 수 있습니다.
            // 2. 런타임에 환경 변수 값을 동적으로 결정할 수 있습니다.
            // 3. 민감한 정보를 코드에 직접 노출시키지 않고 안전하게 관리할 수 있습니다.
            return env[p1];
          });
        },
    };
  };
  return {
    // 플러그인 배열: Svelte, SvelteKit, 그리고 사용자 정의 HTML 플러그인을 사용
    plugins: [
      sveltekit(),
      htmlPlugin(),
      visualizer({
        filename: './stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false
      })
    ],
    build: {
      // Bundle size monitoring (T008)
      chunkSizeWarningLimit: 500, // 500KB limit per chunk
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'vendor-svelte': ['svelte', '@sveltejs/kit'],
            'vendor-ui': ['bits-ui']
          }
        }
      }
    },
    server: {
      watch: {
        // 파일 변경 감지를 위한 폴링 설정
        // true로 설정하면 파일 시스템 이벤트를 사용할 수 없는 환경에서도 변경 감지 가능
        // false로 설정하면 파일 시스템 이벤트를 사용하여 효율적으로 변경 감지
        // 기본값은 false이며, 대부분의 경우 이 설정이 적합함
        usePolling: false
      },
      fs: {
        // 파일 시스템 접근에 대한 엄격한 제한을 해제
        strict: false
      }
    }
  }
});
