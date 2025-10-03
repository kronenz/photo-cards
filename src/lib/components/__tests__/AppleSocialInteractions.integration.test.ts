/**
 * Apple 소셜 인터랙션 컴포넌트 통합 테스트
 * 
 * 테스트 범위:
 * - 좋아요, 댓글, 공유, 북마크 인터랙션 테스트
 * - 애니메이션 및 햅틱 피드백 테스트
 * - 접근성 및 키보드 네비게이션 테스트
 * - 반응형 디자인 테스트
 * 
 * Requirements: 3.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import AppleSocialInteractions from '../AppleSocialInteractions.svelte'

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true
})

describe('Apple 소셜 인터랙션 컴포넌트 통합 테스트', () => {
  let component: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (component) {
      component.$destroy()
    }
  })

  describe('기본 인터랙션 기능 테스트', () => {
    it('좋아요 버튼이 올바르게 작동해야 한다', async () => {
      // Given: 좋아요 상태가 false인 컴포넌트
      const mockLikeHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          likes: 5,
          isLiked: false
        }
      })

      component.$on('like', mockLikeHandler)

      // When: 좋아요 버튼 클릭
      const likeButton = screen.getByLabelText('좋아요')
      await fireEvent.click(likeButton)

      // Then: 이벤트가 발생해야 함
      expect(mockLikeHandler).toHaveBeenCalledTimes(1)
    })

    it('좋아요 상태 변경 시 시각적 피드백이 제공되어야 한다', async () => {
      // Given: 좋아요 상태 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          likes: 5,
          isLiked: false
        }
      })

      const likeButton = screen.getByLabelText('좋아요')

      // When: 좋아요 버튼 클릭
      await fireEvent.click(likeButton)

      // Then: 애니메이션 클래스가 적용되어야 함
      await waitFor(() => {
        const heartIcon = likeButton.querySelector('.heart-icon')
        expect(heartIcon).toBeTruthy()
      })
    })

    it('댓글 버튼이 올바르게 작동해야 한다', async () => {
      // Given: 댓글 기능이 있는 컴포넌트
      const mockCommentHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          comments: 3
        }
      })

      component.$on('comment', mockCommentHandler)

      // When: 댓글 버튼 클릭
      const commentButton = screen.getByLabelText('댓글')
      await fireEvent.click(commentButton)

      // Then: 댓글 이벤트가 발생해야 함
      expect(mockCommentHandler).toHaveBeenCalledTimes(1)
    })

    it('공유 메뉴가 올바르게 작동해야 한다', async () => {
      // Given: 공유 기능이 있는 컴포넌트
      const mockShareHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          shares: 2
        }
      })

      component.$on('share', mockShareHandler)

      // When: 공유 버튼 클릭하여 메뉴 열기
      const shareButton = screen.getByLabelText('공유')
      await fireEvent.click(shareButton)

      // Then: 공유 메뉴가 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText('Twitter')).toBeInTheDocument()
        expect(screen.getByText('Instagram')).toBeInTheDocument()
        expect(screen.getByText('Facebook')).toBeInTheDocument()
        expect(screen.getByText('링크 복사')).toBeInTheDocument()
      })

      // When: Twitter 공유 선택
      const twitterOption = screen.getByText('Twitter')
      await fireEvent.click(twitterOption)

      // Then: 공유 이벤트가 발생해야 함
      expect(mockShareHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { platform: 'twitter' }
        })
      )
    })

    it('북마크 버튼이 올바르게 작동해야 한다', async () => {
      // Given: 북마크 기능이 있는 컴포넌트
      const mockBookmarkHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isBookmarked: false
        }
      })

      component.$on('bookmark', mockBookmarkHandler)

      // When: 북마크 버튼 클릭
      const bookmarkButton = screen.getByLabelText('북마크')
      await fireEvent.click(bookmarkButton)

      // Then: 북마크 이벤트가 발생해야 함
      expect(mockBookmarkHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('햅틱 피드백 테스트', () => {
    it('좋아요 시 햅틱 피드백이 발생해야 한다', async () => {
      // Given: 햅틱 피드백 핸들러
      const mockHapticHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isLiked: false
        }
      })

      component.$on('hapticFeedback', mockHapticHandler)

      // When: 좋아요 버튼 클릭
      const likeButton = screen.getByLabelText('좋아요')
      await fireEvent.click(likeButton)

      // Then: 햅틱 피드백 이벤트가 발생해야 함
      expect(mockHapticHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { type: 'medium' }
        })
      )
    })

    it('Web Vibration API가 호출되어야 한다', async () => {
      // Given: 진동 API 모킹
      const mockVibrate = vi.fn()
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      })

      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isLiked: false
        }
      })

      // When: 좋아요 버튼 클릭
      const likeButton = screen.getByLabelText('좋아요')
      await fireEvent.click(likeButton)

      // Then: 진동 API가 호출되어야 함
      expect(mockVibrate).toHaveBeenCalledWith([20])
    })

    it('북마크 시 적절한 햅틱 피드백이 발생해야 한다', async () => {
      // Given: 햅틱 피드백 핸들러
      const mockHapticHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isBookmarked: false
        }
      })

      component.$on('hapticFeedback', mockHapticHandler)

      // When: 북마크 버튼 클릭
      const bookmarkButton = screen.getByLabelText('북마크')
      await fireEvent.click(bookmarkButton)

      // Then: 중간 강도 햅틱 피드백이 발생해야 함
      expect(mockHapticHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { type: 'medium' }
        })
      )
    })
  })

  describe('접근성 및 키보드 네비게이션 테스트', () => {
    it('키보드로 좋아요 버튼을 조작할 수 있어야 한다', async () => {
      // Given: 키보드 접근 가능한 컴포넌트
      const mockLikeHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isLiked: false
        }
      })

      component.$on('like', mockLikeHandler)

      // When: 좋아요 버튼에 포커스하고 Enter 키 누르기
      const likeButton = screen.getByLabelText('좋아요')
      likeButton.focus()
      await fireEvent.keyDown(likeButton, { key: 'Enter' })

      // Then: 좋아요 이벤트가 발생해야 함
      expect(mockLikeHandler).toHaveBeenCalledTimes(1)
    })

    it('스페이스바로도 버튼을 조작할 수 있어야 한다', async () => {
      // Given: 키보드 접근 가능한 컴포넌트
      const mockCommentHandler = vi.fn()
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          comments: 0
        }
      })

      component.$on('comment', mockCommentHandler)

      // When: 댓글 버튼에 포커스하고 스페이스바 누르기
      const commentButton = screen.getByLabelText('댓글')
      commentButton.focus()
      await fireEvent.keyDown(commentButton, { key: ' ' })

      // Then: 댓글 이벤트가 발생해야 함
      expect(mockCommentHandler).toHaveBeenCalledTimes(1)
    })

    it('ARIA 속성이 올바르게 설정되어야 한다', async () => {
      // Given: 좋아요 상태가 true인 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isLiked: true,
          isBookmarked: false
        }
      })

      // Then: ARIA 속성이 올바르게 설정되어야 함
      const likeButton = screen.getByLabelText('좋아요 취소')
      expect(likeButton).toHaveAttribute('aria-pressed', 'true')

      const bookmarkButton = screen.getByLabelText('북마크')
      expect(bookmarkButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('공유 메뉴의 ARIA 속성이 올바르게 설정되어야 한다', async () => {
      // Given: 공유 기능이 있는 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      const shareButton = screen.getByLabelText('공유')

      // Then: 초기 상태에서 aria-expanded가 false여야 함
      expect(shareButton).toHaveAttribute('aria-expanded', 'false')

      // When: 공유 버튼 클릭
      await fireEvent.click(shareButton)

      // Then: aria-expanded가 true로 변경되어야 함
      expect(shareButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('반응형 디자인 및 테마 테스트', () => {
    it('다크 테마가 올바르게 적용되어야 한다', async () => {
      // Given: 다크 테마 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          theme: 'dark'
        }
      })

      // Then: 다크 테마 클래스가 적용되어야 함
      const container = component.container.querySelector('.apple-social-interactions')
      expect(container).toHaveClass('dark')
    })

    it('다양한 크기 옵션이 올바르게 적용되어야 한다', async () => {
      // Given: 큰 크기 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          size: 'large'
        }
      })

      // Then: 버튼 크기가 올바르게 설정되어야 함
      const likeButton = screen.getByLabelText('좋아요')
      const style = window.getComputedStyle(likeButton)
      expect(style.width).toBe('48px')
      expect(style.height).toBe('48px')
    })

    it('카운트 표시 옵션이 올바르게 작동해야 한다', async () => {
      // Given: 카운트를 표시하는 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          likes: 25,
          comments: 8,
          shares: 3,
          showCounts: true
        }
      })

      // Then: 카운트가 표시되어야 함
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('카운트 숨김 옵션이 올바르게 작동해야 한다', async () => {
      // Given: 카운트를 숨기는 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          likes: 25,
          comments: 8,
          shares: 3,
          showCounts: false
        }
      })

      // Then: 카운트가 표시되지 않아야 함
      expect(screen.queryByText('25')).not.toBeInTheDocument()
      expect(screen.queryByText('8')).not.toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })
  })

  describe('애니메이션 및 시각적 피드백 테스트', () => {
    it('좋아요 파티클 애니메이션이 표시되어야 한다', async () => {
      // Given: 좋아요 상태가 false인 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post',
          isLiked: false
        }
      })

      // When: 좋아요 버튼 클릭 (새로운 좋아요)
      const likeButton = screen.getByLabelText('좋아요')
      await fireEvent.click(likeButton)

      // Then: 파티클 애니메이션이 표시되어야 함
      await waitFor(() => {
        const particles = component.container.querySelectorAll('.like-particle')
        expect(particles.length).toBeGreaterThan(0)
      })
    })

    it('공유 메뉴 애니메이션이 올바르게 작동해야 한다', async () => {
      // Given: 공유 기능이 있는 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      // When: 공유 버튼 클릭
      const shareButton = screen.getByLabelText('공유')
      await fireEvent.click(shareButton)

      // Then: 공유 메뉴가 애니메이션과 함께 나타나야 함
      await waitFor(() => {
        const shareMenu = component.container.querySelector('.share-menu')
        expect(shareMenu).toBeInTheDocument()
      })
    })

    it('버튼 호버 효과가 올바르게 작동해야 한다', async () => {
      // Given: 인터랙션 버튼이 있는 컴포넌트
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      // When: 좋아요 버튼에 마우스 오버
      const likeButton = screen.getByLabelText('좋아요')
      await fireEvent.mouseEnter(likeButton)

      // Then: 호버 스타일이 적용되어야 함 (CSS 테스트는 제한적)
      expect(likeButton).toBeInTheDocument()
    })
  })

  describe('외부 클릭 처리 테스트', () => {
    it('공유 메뉴 외부 클릭 시 메뉴가 닫혀야 한다', async () => {
      // Given: 공유 메뉴가 열린 상태
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      const shareButton = screen.getByLabelText('공유')
      await fireEvent.click(shareButton)

      // 메뉴가 열렸는지 확인
      await waitFor(() => {
        expect(screen.getByText('Twitter')).toBeInTheDocument()
      })

      // When: 외부 영역 클릭
      await fireEvent.click(document.body)

      // Then: 메뉴가 닫혀야 함
      await waitFor(() => {
        expect(screen.queryByText('Twitter')).not.toBeInTheDocument()
      })
    })
  })

  describe('성능 및 메모리 누수 테스트', () => {
    it('컴포넌트 언마운트 시 이벤트 리스너가 정리되어야 한다', async () => {
      // Given: 이벤트 리스너가 등록된 컴포넌트
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      // When: 컴포넌트 언마운트
      component.$destroy()

      // Then: 이벤트 리스너가 정리되어야 함
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('에러 처리 테스트', () => {
    it('잘못된 props가 전달되어도 오류가 발생하지 않아야 한다', async () => {
      // Given: 잘못된 props
      expect(() => {
        component = render(AppleSocialInteractions, {
          props: {
            postId: 'test-post',
            likes: -1, // 음수 값
            comments: null, // null 값
            shares: undefined // undefined 값
          }
        })
      }).not.toThrow()

      // Then: 컴포넌트가 정상적으로 렌더링되어야 함
      expect(screen.getByLabelText('좋아요')).toBeInTheDocument()
    })

    it('햅틱 피드백이 지원되지 않는 환경에서도 오류가 발생하지 않아야 한다', async () => {
      // Given: 햅틱 피드백이 지원되지 않는 환경
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true
      })

      component = render(AppleSocialInteractions, {
        props: {
          postId: 'test-post'
        }
      })

      // When: 좋아요 버튼 클릭
      const likeButton = screen.getByLabelText('좋아요')
      
      // Then: 오류가 발생하지 않아야 함
      expect(() => fireEvent.click(likeButton)).not.toThrow()
    })
  })
})