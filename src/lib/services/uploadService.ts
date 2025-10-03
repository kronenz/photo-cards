/**
 * 파일 업로드 서비스
 * PocketBase와 연동하여 멀티미디어 파일 업로드 처리
 */

import { browser } from '$app/environment';
import type { ImageOptimizationOptions } from '../utils/imageProcessing.js';
import { 
  resizeImageClient, 
  validateFileType, 
  getOptimalQuality,
  getOptimalFormat,
  CARD_PRESETS 
} from '../utils/imageProcessing.js';

// 업로드 진행 상태
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// 업로드 결과
export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

// 업로드 옵션
export interface UploadOptions {
  optimize?: boolean;
  preset?: keyof typeof CARD_PRESETS;
  quality?: number;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * 파일 업로드 서비스 클래스
 */
export class UploadService {
  private baseUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * 단일 파일 업로드
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // 파일 타입 검증
    const validation = validateFileType(file);
    if (!validation.isValid) {
      throw new Error(validation.error || '지원하지 않는 파일 형식입니다.');
    }

    let processedFile: File | Blob = file;

    // 이미지 최적화
    if (options.optimize && validation.type === 'image') {
      processedFile = await this.optimizeImage(file, options);
    }

    // 업로드 실행
    return this.performUpload(processedFile, file.name, options);
  }

  /**
   * 다중 파일 업로드
   */
  async uploadFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], {
          ...options,
          onProgress: (progress) => {
            // 전체 진행률 계산
            const overallProgress = {
              loaded: i * 100 + progress.percentage,
              total: files.length * 100,
              percentage: Math.round((i * 100 + progress.percentage) / files.length)
            };
            options.onProgress?.(overallProgress);
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${files[i].name}:`, error);
        errors.push(error as Error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`모든 파일 업로드에 실패했습니다: ${errors[0].message}`);
    }

    return results;
  }

  /**
   * 이미지 최적화
   */
  private async optimizeImage(
    file: File,
    options: UploadOptions
  ): Promise<Blob> {
    const preset = options.preset ? CARD_PRESETS[options.preset] : CARD_PRESETS.standard;
    const quality = options.quality || getOptimalQuality(file.size);

    const optimizationOptions: ImageOptimizationOptions = {
      width: preset.width,
      height: preset.height,
      quality,
      format: getOptimalFormat(),
      fit: 'cover',
      progressive: true
    };

    return resizeImageClient(file, optimizationOptions);
  }

  /**
   * 실제 업로드 수행
   */
  private async performUpload(
    file: File | Blob,
    originalName: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const formData = new FormData();
    
    // Blob인 경우 File 객체로 변환
    if (file instanceof Blob && !(file instanceof File)) {
      const extension = this.getFileExtension(originalName);
      const optimizedName = this.generateOptimizedName(originalName);
      file = new File([file], optimizedName, { 
        type: file.type || 'application/octet-stream' 
      });
    }

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      originalName,
      uploadedAt: new Date().toISOString()
    }));

    return this.uploadWithRetry(formData, options);
  }

  /**
   * 재시도 로직이 포함된 업로드
   */
  private async uploadWithRetry(
    formData: FormData,
    options: UploadOptions,
    attempt: number = 1
  ): Promise<UploadResult> {
    try {
      return await this.performHttpUpload(formData, options);
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`Upload attempt ${attempt} failed, retrying...`, error);
        await this.delay(this.retryDelay * attempt);
        return this.uploadWithRetry(formData, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * HTTP 업로드 수행
   */
  private async performHttpUpload(
    formData: FormData,
    options: UploadOptions
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 진행률 추적
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          options.onProgress(progress);
        }
      };

      // 성공 처리
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      // 에러 처리
      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      // 타임아웃 처리
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // 요청 설정
      xhr.timeout = 60000; // 60초 타임아웃
      xhr.open('POST', `${this.baseUrl}/upload`);
      
      // CSRF 토큰이 있다면 추가
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        xhr.setRequestHeader('X-CSRF-Token', csrfToken);
      }

      xhr.send(formData);
    });
  }

  /**
   * 파일 확장자 추출
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  /**
   * 최적화된 파일명 생성
   */
  private generateOptimizedName(originalName: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    const format = getOptimalFormat();
    return `${nameWithoutExt}_optimized_${timestamp}.${format}`;
  }

  /**
   * CSRF 토큰 가져오기
   */
  private getCSRFToken(): string | null {
    if (!browser) return null;
    
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 업로드 취소
   */
  cancelUpload(uploadId: string): void {
    // 실제 구현에서는 진행 중인 업로드를 취소하는 로직 추가
    console.log(`Cancelling upload: ${uploadId}`);
  }

  /**
   * 업로드 상태 확인
   */
  async getUploadStatus(uploadId: string): Promise<{
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/upload/status/${uploadId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to get upload status:', error);
      return { status: 'failed', error: (error as Error).message };
    }
  }
}

/**
 * 기본 업로드 서비스 인스턴스
 */
export const uploadService = new UploadService();

/**
 * PocketBase 연동 업로드 함수
 */
export async function uploadToPocketBase(
  file: File,
  collection: string = 'media',
  options: UploadOptions = {}
): Promise<UploadResult> {
  // PocketBase 클라이언트가 있다면 사용
  if (browser && (window as any).pb) {
    const pb = (window as any).pb;
    
    try {
      // 파일 최적화
      let processedFile: File | Blob = file;
      if (options.optimize) {
        const validation = validateFileType(file);
        if (validation.type === 'image') {
          const preset = options.preset ? CARD_PRESETS[options.preset] : CARD_PRESETS.standard;
          processedFile = await resizeImageClient(file, {
            width: preset.width,
            height: preset.height,
            quality: options.quality || getOptimalQuality(file.size),
            format: getOptimalFormat(),
            fit: 'cover'
          });
        }
      }

      // PocketBase에 업로드
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('name', file.name);
      formData.append('type', file.type);
      formData.append('size', file.size.toString());

      const record = await pb.collection(collection).create(formData);

      return {
        id: record.id,
        filename: record.file,
        url: pb.files.getUrl(record, record.file),
        size: file.size,
        type: file.type,
        metadata: {
          width: record.width,
          height: record.height,
          duration: record.duration
        }
      };
    } catch (error) {
      console.error('PocketBase upload failed:', error);
      throw new Error(`업로드 실패: ${(error as Error).message}`);
    }
  }

  // PocketBase가 없으면 기본 업로드 서비스 사용
  return uploadService.uploadFile(file, options);
}

/**
 * 드래그 앤 드롭 헬퍼 함수들
 */
export const dragDropHelpers = {
  /**
   * 드래그 이벤트에서 파일 추출
   */
  getFilesFromDragEvent(event: DragEvent): File[] {
    const files: File[] = [];
    
    if (event.dataTransfer?.files) {
      files.push(...Array.from(event.dataTransfer.files));
    }
    
    if (event.dataTransfer?.items) {
      for (const item of Array.from(event.dataTransfer.items)) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }
    
    return files;
  },

  /**
   * 드래그 이벤트 기본 동작 방지
   */
  preventDefaults(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  },

  /**
   * 파일 타입 필터링
   */
  filterFilesByType(files: File[], acceptedTypes: string[]): File[] {
    return files.filter(file => {
      return acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
    });
  }
};