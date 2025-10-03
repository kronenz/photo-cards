/**
 * 이미지 처리 및 최적화 유틸리티
 * Sharp.js 기반 서버사이드 처리와 Canvas API 기반 클라이언트사이드 처리
 */

// 지원되는 이미지 포맷
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
] as const;

// 지원되는 비디오 포맷
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/avi'
] as const;

// 지원되는 오디오 포맷
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a'
] as const;

// 이미지 최적화 옵션
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-100
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  progressive?: boolean;
}

// 카드 사이즈 프리셋
export const CARD_PRESETS = {
  // 표준 포토카드 비율 (2.5:3.5 = 5:7)
  standard: { width: 660, height: 921 },
  // 썸네일
  thumbnail: { width: 200, height: 280 },
  // 미리보기
  preview: { width: 400, height: 560 },
  // 고해상도 (인쇄용)
  print: { width: 1320, height: 1842 }
} as const;

/**
 * 클라이언트사이드 이미지 리사이징 (Canvas API 사용)
 */
export async function resizeImageClient(
  file: File,
  options: ImageOptimizationOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // 목표 크기 계산
        const { width: targetWidth, height: targetHeight } = calculateDimensions(
          img.width,
          img.height,
          options
        );
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 배경색 설정 (투명도 지원하지 않는 포맷용)
        if (options.background && options.format !== 'png') {
          ctx.fillStyle = options.background;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }
        
        // 이미지 그리기
        if (options.fit === 'cover') {
          drawImageCover(ctx, img, targetWidth, targetHeight);
        } else {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }
        
        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          getMimeType(options.format || 'jpeg'),
          (options.quality || 85) / 100
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 이미지 크기 계산
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ImageOptimizationOptions
): { width: number; height: number } {
  const { width: targetWidth, height: targetHeight, fit = 'cover' } = options;
  
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  if (!targetWidth) {
    const ratio = targetHeight! / originalHeight;
    return { width: Math.round(originalWidth * ratio), height: targetHeight! };
  }
  
  if (!targetHeight) {
    const ratio = targetWidth / originalWidth;
    return { width: targetWidth, height: Math.round(originalHeight * ratio) };
  }
  
  // 둘 다 지정된 경우
  if (fit === 'fill') {
    return { width: targetWidth, height: targetHeight };
  }
  
  const widthRatio = targetWidth / originalWidth;
  const heightRatio = targetHeight / originalHeight;
  
  if (fit === 'contain') {
    const ratio = Math.min(widthRatio, heightRatio);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }
  
  // cover (기본값)
  const ratio = Math.max(widthRatio, heightRatio);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}

/**
 * Cover fit으로 이미지 그리기
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (imgRatio > canvasRatio) {
    // 이미지가 더 넓음 - 높이에 맞춤
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  } else {
    // 이미지가 더 높음 - 너비에 맞춤
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imgRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  }
  
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

/**
 * MIME 타입 변환
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif'
  };
  
  return mimeTypes[format] || 'image/jpeg';
}

/**
 * 이미지 메타데이터 추출
 */
export async function extractImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
  lastModified: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for metadata'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 비디오 썸네일 생성
 */
export async function generateVideoThumbnail(
  file: File,
  timeOffset: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeOffset, video.duration);
    };
    
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // 16:9 비율로 썸네일 생성
        const aspectRatio = video.videoWidth / video.videoHeight;
        const thumbnailWidth = 400;
        const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);
        
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        
        ctx.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 파일 타입 검증
 */
export function validateFileType(file: File): {
  isValid: boolean;
  type: 'image' | 'video' | 'audio' | null;
  error?: string;
} {
  if (SUPPORTED_IMAGE_FORMATS.includes(file.type as any)) {
    return { isValid: true, type: 'image' };
  }
  
  if (SUPPORTED_VIDEO_FORMATS.includes(file.type as any)) {
    return { isValid: true, type: 'video' };
  }
  
  if (SUPPORTED_AUDIO_FORMATS.includes(file.type as any)) {
    return { isValid: true, type: 'audio' };
  }
  
  return {
    isValid: false,
    type: null,
    error: `지원하지 않는 파일 형식입니다: ${file.type}`
  };
}

/**
 * 이미지 품질 자동 최적화
 */
export function getOptimalQuality(fileSize: number): number {
  // 파일 크기에 따른 품질 자동 조정
  if (fileSize < 500 * 1024) return 95; // 500KB 미만: 고품질
  if (fileSize < 2 * 1024 * 1024) return 85; // 2MB 미만: 중품질
  if (fileSize < 5 * 1024 * 1024) return 75; // 5MB 미만: 보통품질
  return 65; // 5MB 이상: 저품질
}

/**
 * 프로그레시브 JPEG 여부 결정
 */
export function shouldUseProgressive(width: number, height: number): boolean {
  // 큰 이미지에서만 프로그레시브 사용
  return width * height > 640 * 480;
}

/**
 * WebP 지원 여부 확인
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * AVIF 지원 여부 확인
 */
export function supportsAVIF(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

/**
 * 최적 포맷 선택
 */
export function getOptimalFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * 배치 이미지 처리
 */
export async function processBatchImages(
  files: File[],
  options: ImageOptimizationOptions,
  onProgress?: (processed: number, total: number) => void
): Promise<Blob[]> {
  const results: Blob[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const validation = validateFileType(file);
    
    if (validation.isValid && validation.type === 'image') {
      try {
        const optimized = await resizeImageClient(file, options);
        results.push(optimized);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // 원본 파일을 Blob으로 변환하여 추가
        results.push(file);
      }
    } else {
      // 이미지가 아닌 파일은 원본 그대로
      results.push(file);
    }
    
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}