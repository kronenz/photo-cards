/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Actual Civitai.com color palette
        civitai: {
          bg: {
            primary: '#0B0F19',    // 실제 Civitai 메인 배경
            secondary: '#151922',  // 카드 배경
            tertiary: '#1E2329',   // 호버 상태
            elevated: '#252A34'    // 모달/드롭다운
          },
          surface: {
            primary: '#151922',    // 카드 표면
            secondary: '#1E2329',  // 입력 필드
            tertiary: '#252A34',   // 비활성 요소
            glass: 'rgba(21, 25, 34, 0.8)'
          },
          text: {
            primary: '#FFFFFF',    // 메인 텍스트
            secondary: '#9CA3AF',  // 보조 텍스트 (회색)
            tertiary: '#6B7280',   // 비활성 텍스트
            accent: '#3B82F6'      // 링크/액센트
          },
          accent: {
            primary: '#3B82F6',    // Civitai 블루
            secondary: '#8B5CF6',  // 보라색
            success: '#10B981',    
            warning: '#F59E0B',    
            error: '#EF4444',     
            info: '#06B6D4'       
          },
          border: {
            primary: 'rgba(255, 255, 255, 0.1)',
            secondary: 'rgba(255, 255, 255, 0.05)',
            accent: 'rgba(59, 130, 246, 0.3)'
          }
        },
        // Enhanced holographic colors
        holographic: {
          rainbow: '#ff0080',
          cosmic: '#667eea',
          aurora: '#a8edea',
          neon: '#12c2e9',
          gold: '#ffd700',
          silver: '#c0c0c0'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
        korean: ['"Pretendard"', '"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace']
      },
      fontSize: {
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
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'holographic-sm': '0 0 20px rgba(99, 102, 241, 0.15)',
        'holographic-md': '0 0 40px rgba(99, 102, 241, 0.25)',
        'holographic-lg': '0 0 60px rgba(99, 102, 241, 0.35)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      backdropBlur: {
        'xs': '2px'
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'holographic-rotate': 'holographic-rotate 20s linear infinite',
        'float-up': 'float-up 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.2s ease-out'
      },
      keyframes: {
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        'holographic-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
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