/**
 * 비디오 처리 및 최적화 유틸리티
 * 클라이언트사이드 비디오 처리와 썸네일 생성
 */

// 지원되는 비디오 포맷
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mov',
  'video/avi'
] as const;

// 비디오 최적화 옵션
export interface VideoOptimizationOptions {
  maxDuration?: number; // 최대 길이 (초)
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'mp4' | 'webm';
  thumbnailTime?: number; // 썸네일 생성 시점 (초)
}

// 비디오 메타데이터
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
  aspectRatio: number;
  fps?: number;
}

/**
 * 비디오 메타데이터 추출
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: file.type,
        aspectRatio: video.videoWidth / video.videoHeight
      };
      
      // URL 정리
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('비디오 메타데이터를 읽을 수 없습니다.'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * 비디오 썸네일 생성 (고품질)
 */
export async function generateVideoThumbnail(
  file: File,
  options: {
    time?: number;
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Blob> {
  const {
    time = 1,
    width = 400,
    height = 280,
    quality = 0.8
  } = options;
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다.'));
      return;
    }
    
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      // 썸네일 생성 시점 설정
      const thumbnailTime = Math.min(time, video.duration - 0.1);
      video.currentTime = thumbnailTime;
    };
    
    video.onseeked = () => {
      try {
        // 캔버스 크기 설정
        const aspectRatio = video.videoWidth / video.videoHeight;
        let canvasWidth = width;
        let canvasHeight = height;
        
        // 비율 유지하면서 크기 조정
        if (aspectRatio > canvasWidth / canvasHeight) {
          canvasHeight = Math.round(canvasWidth / aspectRatio);
        } else {
          canvasWidth = Math.round(canvasHeight * aspectRatio);
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 비디오 프레임을 캔버스에 그리기
        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        
        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('썸네일 생성에 실패했습니다.'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('비디오를 로드할 수 없습니다.'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * 비디오 다중 썸네일 생성 (타임라인용)
 */
export async function generateVideoTimeline(
  file: File,
  options: {
    count?: number;
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Blob[]> {
  const {
    count = 5,
    width = 160,
    height = 90,
    quality = 0.7
  } = options;
  
  const metadata = await extractVideoMetadata(file);
  const thumbnails: Blob[] = [];
  
  // 균등한 간격으로 썸네일 생성
  for (let i = 0; i < count; i++) {
    const time = (metadata.duration / (count + 1)) * (i + 1);
    try {
      const thumbnail = await generateVideoThumbnail(file, {
        time,
        width,
        height,
        quality
      });
      thumbnails.push(thumbnail);
    } catch (error) {
      console.warn(`썸네일 생성 실패 (${time}초):`, error);
    }
  }
  
  return thumbnails;
}

/**
 * 비디오 길이 검증
 */
export function validateVideoDuration(
  duration: number,
  maxDuration: number = 10
): { isValid: boolean; error?: string } {
  if (duration > maxDuration) {
    return {
      isValid: false,
      error: `비디오 길이가 ${maxDuration}초를 초과합니다. (현재: ${Math.round(duration)}초)`
    };
  }
  
  return { isValid: true };
}

/**
 * 비디오 해상도 검증
 */
export function validateVideoResolution(
  width: number,
  height: number,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): { isValid: boolean; error?: string } {
  if (width > maxWidth || height > maxHeight) {
    return {
      isValid: false,
      error: `비디오 해상도가 ${maxWidth}x${maxHeight}를 초과합니다. (현재: ${width}x${height})`
    };
  }
  
  return { isValid: true };
}

/**
 * 비디오 파일 크기 추정
 */
export function estimateVideoSize(
  duration: number,
  width: number,
  height: number,
  quality: number = 0.8
): number {
  // 대략적인 비트레이트 계산 (픽셀 수와 품질 기반)
  const pixels = width * height;
  const baseBitrate = pixels * 0.1; // 기본 비트레이트
  const qualityMultiplier = 0.5 + (quality * 0.5); // 품질에 따른 배수
  const bitrate = baseBitrate * qualityMultiplier;
  
  // 크기 = 비트레이트 * 시간 / 8 (바이트 단위)
  return Math.round((bitrate * duration) / 8);
}

/**
 * 비디오 압축 (WebCodecs API 사용 - 지원되는 브라우저에서만)
 */
export async function compressVideo(
  file: File,
  options: VideoOptimizationOptions = {}
): Promise<Blob> {
  // WebCodecs API 지원 확인
  if (!('VideoEncoder' in window)) {
    throw new Error('이 브라우저는 비디오 압축을 지원하지 않습니다.');
  }
  
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.8,
    format = 'mp4'
  } = options;
  
  // 현재는 기본 구현만 제공 (실제 압축은 복잡한 WebCodecs 구현 필요)
  console.warn('비디오 압축 기능은 아직 구현되지 않았습니다.');
  return file;
}

/**
 * 비디오 포맷 변환 지원 여부 확인
 */
export function checkVideoFormatSupport(): {
  mp4: boolean;
  webm: boolean;
  mov: boolean;
} {
  const video = document.createElement('video');
  
  return {
    mp4: video.canPlayType('video/mp4') !== '',
    webm: video.canPlayType('video/webm') !== '',
    mov: video.canPlayType('video/quicktime') !== ''
  };
}

/**
 * 최적 비디오 포맷 선택
 */
export function getOptimalVideoFormat(): 'mp4' | 'webm' {
  const support = checkVideoFormatSupport();
  
  // WebM이 지원되면 WebM 우선 (더 나은 압축률)
  if (support.webm) return 'webm';
  
  // 그렇지 않으면 MP4
  return 'mp4';
}

/**
 * 비디오 시간 포맷팅
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 비디오 품질 프리셋
 */
export const VIDEO_QUALITY_PRESETS = {
  low: { quality: 0.5, maxWidth: 640, maxHeight: 480 },
  medium: { quality: 0.7, maxWidth: 1280, maxHeight: 720 },
  high: { quality: 0.85, maxWidth: 1920, maxHeight: 1080 },
  ultra: { quality: 0.95, maxWidth: 3840, maxHeight: 2160 }
} as const;

/**
 * KBO 야구 비디오 특화 설정
 */
export const KBO_VIDEO_PRESETS = {
  // 홈런 순간 (고품질, 슬로우 모션 지원)
  homerun: {
    maxDuration: 8,
    quality: 0.9,
    maxWidth: 1920,
    maxHeight: 1080,
    thumbnailTime: 2
  },
  
  // 도루 성공 (중간 품질, 빠른 액션)
  steal: {
    maxDuration: 5,
    quality: 0.8,
    maxWidth: 1280,
    maxHeight: 720,
    thumbnailTime: 1.5
  },
  
  // 수비 명장면 (고품질, 다양한 각도)
  defense: {
    maxDuration: 6,
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    thumbnailTime: 2
  },
  
  // 결정적 순간 (최고 품질)
  clutch: {
    maxDuration: 10,
    quality: 0.95,
    maxWidth: 1920,
    maxHeight: 1080,
    thumbnailTime: 3
  },
  
  // 응원 영상 (표준 품질, 긴 길이 허용)
  cheer: {
    maxDuration: 15,
    quality: 0.7,
    maxWidth: 1280,
    maxHeight: 720,
    thumbnailTime: 2
  }
} as const;