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

// ============================================
// Presigned URL Upload (MinIO Direct)
// Feature: 004-production-service-integration
// ============================================

import type { Team, Rarity } from '$lib/types/models';

export interface CardData {
  title: string;
  subtitle?: string;
  team: Team;
  rarity: Rarity;
  number?: string;
  stats?: Record<string, number>;
  is_shared?: boolean;
}

export interface CardUploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface CardUploadResult {
  success: boolean;
  card?: {
    id: string;
    title: string;
    image_url: string;
    team: string;
    rarity: string;
  };
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate card image file
 */
export function validateCardImage(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: '파일을 선택해주세요.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.' };
  }

  return { valid: true };
}

/**
 * Get presigned URL for direct upload to MinIO
 */
async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  fileSize: number,
  folder: string = 'cards'
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string } | null> {
  try {
    const response = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType, fileSize, folder })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '업로드 URL 생성에 실패했습니다.');
    }

    const data = await response.json();
    return {
      uploadUrl: data.uploadUrl,
      objectKey: data.objectKey,
      publicUrl: data.publicUrl
    };
  } catch (err: any) {
    console.error('Get presigned URL error:', err);
    return null;
  }
}

/**
 * Upload file directly to MinIO using presigned URL
 */
async function uploadToMinIODirect(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('네트워크 오류가 발생했습니다.')));
    xhr.addEventListener('abort', () => reject(new Error('업로드가 취소되었습니다.')));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Confirm upload and create card record
 */
async function confirmCardUpload(
  objectKey: string,
  cardData: CardData
): Promise<CardUploadResult> {
  try {
    const response = await fetch('/api/upload/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey, cardData })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || '카드 생성에 실패했습니다.' };
    }

    return { success: true, card: data.card };
  } catch (err: any) {
    console.error('Confirm upload error:', err);
    return { success: false, error: err.message || '카드 생성에 실패했습니다.' };
  }
}

/**
 * Complete card upload flow with presigned URL
 * 1. Validate file
 * 2. Get presigned URL
 * 3. Upload directly to MinIO
 * 4. Confirm upload and create card record
 */
export async function uploadCardWithPresign(
  file: File,
  cardData: CardData,
  onProgress?: (progress: CardUploadProgress) => void
): Promise<CardUploadResult> {
  const updateProgress = (status: CardUploadProgress['status'], progress: number, message: string) => {
    if (onProgress) onProgress({ status, progress, message });
  };

  try {
    // Step 1: Validate
    updateProgress('uploading', 0, '파일 검증 중...');
    const validation = validateCardImage(file);
    if (!validation.valid) {
      updateProgress('error', 0, validation.error!);
      return { success: false, error: validation.error };
    }

    // Step 2: Get presigned URL
    updateProgress('uploading', 10, '업로드 준비 중...');
    const presigned = await getPresignedUploadUrl(file.name, file.type, file.size);
    if (!presigned) {
      updateProgress('error', 10, '업로드 URL 생성에 실패했습니다.');
      return { success: false, error: '업로드 URL 생성에 실패했습니다.' };
    }

    // Step 3: Upload to MinIO
    updateProgress('uploading', 20, '이미지 업로드 중...');
    try {
      await uploadToMinIODirect(file, presigned.uploadUrl, (progress) => {
        updateProgress('uploading', 20 + (progress * 0.6), `이미지 업로드 중... ${progress}%`);
      });
    } catch (uploadError: any) {
      updateProgress('error', 0, uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // Step 4: Confirm and create card
    updateProgress('processing', 85, '카드 생성 중...');
    const result = await confirmCardUpload(presigned.objectKey, cardData);

    if (result.success) {
      updateProgress('complete', 100, '카드가 생성되었습니다!');
    } else {
      updateProgress('error', 85, result.error || '카드 생성에 실패했습니다.');
    }

    return result;
  } catch (err: any) {
    updateProgress('error', 0, err.message || '알 수 없는 오류가 발생했습니다.');
    return { success: false, error: err.message || '알 수 없는 오류가 발생했습니다.' };
  }
}