/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  safelist: [
    // Holographic blend modes for unified cards
    'mix-blend-overlay',
    'mix-blend-soft-light',
    'mix-blend-hard-light',
    // Transform perspective for 3D card flips
    'transform-style-3d',
    'backface-hidden',
    'perspective-1000',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-Inspired Premium Color System
        apple: {
          // Light Theme (Apple 스타일)
          light: {
            background: {
              primary: '#ffffff',      // 순백색 배경
              secondary: '#f8f9fa',    // 미묘한 그레이
              tertiary: '#f1f3f4',     // 카드 배경
              elevated: '#ffffff',     // 모달/드롭다운
              glass: 'rgba(255, 255, 255, 0.8)'
            },
            surface: {
              primary: '#ffffff',
              secondary: '#f8f9fa',
              tertiary: '#e9ecef',
              border: 'rgba(0, 0, 0, 0.06)'
            },
            text: {
              primary: '#1d1d1f',      // Apple 스타일 진한 그레이
              secondary: '#6e6e73',    // 보조 텍스트
              tertiary: '#86868b',     // 비활성 텍스트
              accent: '#007aff'        // Apple 블루
            }
          },
          // Dark Theme (Apple Dark Mode)
          dark: {
            background: {
              primary: '#000000',      // 순흑색 배경
              secondary: '#1c1c1e',    // 다크 그레이
              tertiary: '#2c2c2e',     // 카드 배경
              elevated: '#3a3a3c',     // 모달/드롭다운
              glass: 'rgba(28, 28, 30, 0.8)'
            },
            surface: {
              primary: '#1c1c1e',
              secondary: '#2c2c2e',
              tertiary: '#3a3a3c',
              border: 'rgba(255, 255, 255, 0.1)'
            },
            text: {
              primary: '#ffffff',
              secondary: '#ebebf5',
              tertiary: '#ebebf599',   // 60% 투명도
              accent: '#0a84ff'        // Apple 다크모드 블루
            }
          },
          // Apple Accent Colors
          accent: {
            blue: '#007aff',           // Apple 블루
            darkBlue: '#0a84ff',       // 다크모드 블루
            purple: '#5856d6',         // Apple 퍼플
            darkPurple: '#5e5ce6',     // 다크모드 퍼플
            green: '#34c759',          // Apple 그린
            darkGreen: '#30d158',      // 다크모드 그린
            orange: '#ff9500',         // Apple 오렌지
            darkOrange: '#ff9f0a',     // 다크모드 오렌지
            red: '#ff3b30',            // Apple 레드
            darkRed: '#ff453a',        // 다크모드 레드
            yellow: '#ffcc00',         // Apple 옐로우
            darkYellow: '#ffd60a',     // 다크모드 옐로우
            pink: '#ff2d92',           // Apple 핑크
            darkPink: '#ff375f',       // 다크모드 핑크
            teal: '#5ac8fa',           // Apple 틸
            darkTeal: '#64d2ff',       // 다크모드 틸
            indigo: '#5856d6',         // Apple 인디고
            darkIndigo: '#5e5ce6'      // 다크모드 인디고
          }
        },
        // KBO 구단별 홀로그래픽 컬러 시스템
        kbo: {
          lg: {
            primary: '#c41e3a',        // LG 트윈스 레드
            secondary: '#ff69b4',      // 핑크 액센트
            holographic: 'linear-gradient(135deg, #c41e3a, #ff69b4, #ffffff)'
          },
          doosan: {
            primary: '#131230',        // 두산 베어스 네이비
            secondary: '#4169e1',      // 블루 액센트
            holographic: 'linear-gradient(135deg, #131230, #4169e1, #87ceeb)'
          },
          kt: {
            primary: '#000000',        // KT 위즈 블랙
            secondary: '#ff0000',      // 레드 액센트
            holographic: 'linear-gradient(135deg, #000000, #ff0000, #ffffff)'
          },
          samsung: {
            primary: '#074ca1',        // 삼성 라이온즈 블루
            secondary: '#87ceeb',      // 라이트 블루
            holographic: 'linear-gradient(135deg, #074ca1, #87ceeb, #ffffff)'
          },
          lotte: {
            primary: '#041e42',        // 롯데 자이언츠 네이비
            secondary: '#c41e3a',      // 레드 액센트
            holographic: 'linear-gradient(135deg, #041e42, #c41e3a, #ffffff)'
          },
          kia: {
            primary: '#ea002c',        // KIA 타이거즈 레드
            secondary: '#000000',      // 블랙 액센트
            holographic: 'linear-gradient(135deg, #ea002c, #000000, #ffd700)'
          },
          nc: {
            primary: '#315288',        // NC 다이노스 블루
            secondary: '#c4a484',      // 골드 액센트
            holographic: 'linear-gradient(135deg, #315288, #c4a484, #ffffff)'
          },
          hanwha: {
            primary: '#ff6600',        // 한화 이글스 오렌지
            secondary: '#000000',      // 블랙 액센트
            holographic: 'linear-gradient(135deg, #ff6600, #000000, #ffffff)'
          },
          ssg: {
            primary: '#ce0e2d',        // SSG 랜더스 레드
            secondary: '#ffd700',      // 골드 액센트
            holographic: 'linear-gradient(135deg, #ce0e2d, #ffd700, #ffffff)'
          },
          kiwoom: {
            primary: '#570514',        // 키움 히어로즈 버건디
            secondary: '#ffd700',      // 골드 액센트
            holographic: 'linear-gradient(135deg, #570514, #ffd700, #ffffff)'
          }
        },
        // 프리미엄 홀로그래픽 효과 컬러
        holographic: {
          rainbow: 'linear-gradient(135deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff)',
          cosmic: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)',
          aurora: 'linear-gradient(135deg, #a8edea, #fed6e3, #d299c2, #fef9d7, #85ffbd)',
          neon: 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59, #ff9a9e, #fecfef)',
          gold: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffc107, #ffb300, #ff8f00)',
          silver: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #b8b8b8, #d4d4d4, #f0f0f0)',
          platinum: 'linear-gradient(135deg, #e5e4e2, #ffffff, #d3d3d3, #c0c0c0, #a8a8a8)'
        }
      },
      fontFamily: {
        // Apple 스타일 시스템 폰트 우선
        sans: [
          '"SF Pro Display"', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Apple SD Gothic Neo"',
          '"Pretendard"',
          '"Segoe UI"', 
          'system-ui', 
          'sans-serif'
        ],
        text: [
          '"SF Pro Text"', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Apple SD Gothic Neo"',
          '"Pretendard"',
          '"Segoe UI"', 
          'sans-serif'
        ],
        display: [
          '"SF Pro Display"', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'sans-serif'
        ],
        korean: [
          '"Apple SD Gothic Neo"', 
          '"Pretendard"', 
          '"Noto Sans KR"', 
          '-apple-system', 
          'sans-serif'
        ],
        mono: [
          '"SF Mono"', 
          '"Monaco"', 
          '"Cascadia Code"', 
          '"Roboto Mono"', 
          'monospace'
        ]
      },
      fontSize: {
        // Apple Human Interface Guidelines 기반 타이포그래피
        'caption2': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],    // 11px
        'caption1': ['0.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],      // 12px
        'footnote': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0' }],          // 13px
        'subheadline': ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0' }],       // 15px
        'callout': ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],                // 16px
        'body': ['1.0625rem', { lineHeight: '1.5', letterSpacing: '0' }],              // 17px (Apple 기본)
        'headline': ['1.0625rem', { lineHeight: '1.4', letterSpacing: '0' }],          // 17px
        'title3': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],        // 20px
        'title2': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],       // 22px
        'title1': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],        // 28px
        'largeTitle': ['2.125rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],   // 34px
        
        // 추가 디스플레이 사이즈 (홀로그래픽 카드용)
        'display1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],         // 48px
        'display2': ['4rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],         // 64px
        'display3': ['5rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],         // 80px
        
        // 반응형 타이포그래피 (Fluid Typography)
        'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.4' }],
        'sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5' }],
        'base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.5' }],
        'xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '1.4' }],
        '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '1.3' }],
        '3xl': ['clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)', { lineHeight: '1.2' }],
        '4xl': ['clamp(2.25rem, 1.9rem + 1.75vw, 3rem)', { lineHeight: '1.1' }],
        '5xl': ['clamp(3rem, 2.5rem + 2.5vw, 4rem)', { lineHeight: '1' }]
      },
      fontWeight: {
        // Apple SF Pro 폰트 웨이트
        ultralight: '100',  // SF Pro Ultralight
        thin: '200',        // SF Pro Thin
        light: '300',       // SF Pro Light
        normal: '400',      // SF Pro Regular
        medium: '500',      // SF Pro Medium
        semibold: '600',    // SF Pro Semibold
        bold: '700',        // SF Pro Bold
        heavy: '800',       // SF Pro Heavy
        black: '900'        // SF Pro Black
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        snug: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.1em'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'card': '1rem',
        '4xl': '2rem'
      },
      boxShadow: {
        // Apple 스타일 그림자 시스템
        'apple-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'apple-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        
        // 글래스모피즘 효과
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(255, 255, 255, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        
        // 홀로그래픽 글로우 효과
        'holographic-sm': '0 0 20px rgba(99, 102, 241, 0.15)',
        'holographic-md': '0 0 40px rgba(99, 102, 241, 0.25)',
        'holographic-lg': '0 0 60px rgba(99, 102, 241, 0.35)',
        'holographic-xl': '0 0 80px rgba(99, 102, 241, 0.45)',
        
        // KBO 구단별 글로우 효과
        'kbo-lg': '0 0 30px rgba(196, 30, 58, 0.3)',
        'kbo-doosan': '0 0 30px rgba(19, 18, 48, 0.3)',
        'kbo-kt': '0 0 30px rgba(255, 0, 0, 0.3)',
        'kbo-samsung': '0 0 30px rgba(7, 76, 161, 0.3)',
        'kbo-lotte': '0 0 30px rgba(4, 30, 66, 0.3)',
        'kbo-kia': '0 0 30px rgba(234, 0, 44, 0.3)',
        'kbo-nc': '0 0 30px rgba(49, 82, 136, 0.3)',
        'kbo-hanwha': '0 0 30px rgba(255, 102, 0, 0.3)',
        'kbo-ssg': '0 0 30px rgba(206, 14, 45, 0.3)',
        'kbo-kiwoom': '0 0 30px rgba(87, 5, 20, 0.3)',
        
        // 프리미엄 카드 효과
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'floating': '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
        
        // 내부 그림자 (깊이감)
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)'
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px'
      },
      transitionTimingFunction: {
        // Apple 스타일 이징 함수
        'apple-smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'holographic': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'card-flip': 'cubic-bezier(0.645, 0.045, 0.355, 1)'
      },
      transitionDuration: {
        // Apple 스타일 지속시간 (60fps 기준)
        '150': '150ms',   // 9 frames
        '200': '200ms',   // 12 frames
        '250': '250ms',   // 15 frames
        '350': '350ms',   // 21 frames
        '400': '400ms',   // 24 frames
        '600': '600ms',   // 36 frames
        '800': '800ms',   // 48 frames
        '1200': '1200ms'  // 72 frames
      },
      animation: {
        // 기본 애니메이션
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // 홀로그래픽 효과
        'holographic-rotate': 'holographic-rotate 20s linear infinite',
        'holographic-shimmer': 'holographic-shimmer 3s ease-in-out infinite',
        'holographic-glow': 'holographic-glow 2s ease-in-out infinite alternate',
        
        // Apple 스타일 인터랙션
        'float-up': 'float-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        
        // 카드 애니메이션
        'card-hover': 'card-hover 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'card-flip': 'card-flip 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
        'card-entrance': 'card-entrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        
        // 로딩 애니메이션
        'loading-dots': 'loading-dots 1.4s ease-in-out infinite',
        'loading-pulse': 'loading-pulse 1.5s ease-in-out infinite',
        'loading-spin': 'loading-spin 1s linear infinite'
      },
      keyframes: {
        // 기본 키프레임
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        
        // 홀로그래픽 효과
        'holographic-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'holographic-shimmer': {
          '0%, 100%': { 
            'background-position': '0% 50%',
            'filter': 'hue-rotate(0deg) brightness(1) saturate(1)'
          },
          '50%': { 
            'background-position': '100% 50%',
            'filter': 'hue-rotate(90deg) brightness(1.2) saturate(1.5)'
          }
        },
        'holographic-glow': {
          '0%': { 
            'box-shadow': '0 0 20px rgba(99, 102, 241, 0.3)',
            'filter': 'brightness(1)'
          },
          '100%': { 
            'box-shadow': '0 0 40px rgba(99, 102, 241, 0.6)',
            'filter': 'brightness(1.1)'
          }
        },
        
        // Apple 스타일 인터랙션
        'float-up': {
          '0%': { transform: 'translateY(0px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' }
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        
        // 카드 애니메이션
        'card-hover': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-8px) scale(1.03)' }
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' }
        },
        'card-entrance': {
          '0%': { 
            transform: 'translateY(50px) scale(0.9) rotateX(10deg)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0) scale(1) rotateX(0deg)', 
            opacity: '1' 
          }
        },
        
        // 로딩 애니메이션
        'loading-dots': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' }
        },
        'loading-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        'loading-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
        'gradient-aurora': 'linear-gradient(135deg, #a8edea, #fed6e3, #d299c2, #fef9d7)',
        'gradient-neon': 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59)',
        'gradient-rainbow': 'linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #da70d6, #98fb98)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
      }
    },
  },
  plugins: [],
}