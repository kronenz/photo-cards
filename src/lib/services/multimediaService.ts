/**
 * 통합 멀티미디어 처리 서비스
 * 이미지, 비디오, 오디오 파일의 업로드, 처리, 최적화를 담당
 */

import { browser } from '$app/environment';
import type { ImageOptimizationOptions } from '../utils/imageProcessing.js';
import type { VideoOptimizationOptions, VideoMetadata } from '../utils/videoProcessing.js';
import type { AudioMetadata } from '../utils/audioProcessing.js';

import {
  resizeImageClient,
  validateFileType,
  getOptimalQuality,
  getOptimalFormat,
  CARD_PRESETS,
  extractImageMetadata
} from '../utils/imageProcessing.js';

import {
  extractVideoMetadata,
  generateVideoThumbnail,
  generateVideoTimeline,
  validateVideoDuration,
  validateVideoResolution,
  KBO_VIDEO_PRESETS
} from '../utils/videoProcessing.js';

import {
  extractAudioMetadata,
  generateWaveform,
  validateAudioDuration,
  KBO_AUDIO_PRESETS
} from '../utils/audioProcessing.js';

// 처리된 미디어 파일 인터페이스
export interface ProcessedMediaFile {
  id: string;
  originalFile: File;
  type: 'image' | 'video' | 'audio';
  
  // 기본 정보
  name: string;
  size: number;
  mimeType: string;
  
  // 처리된 파일들
  optimized?: Blob;
  thumbnail?: Blob;
  preview?: string; // Data URL
  
  // 메타데이터
  metadata: ImageMetadata | VideoMetadata | AudioMetadata;
  
  // 추가 처리 결과
  waveform?: string; // 오디오 파형 (Data URL)
  timeline?: Blob[]; // 비디오 타임라인 썸네일들
  
  // 처리 상태
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
}

// 처리 옵션
export interface MediaProcessingOptions {
  // 이미지 옵션
  imagePreset?: keyof typeof CARD_PRESETS;
  imageQuality?: number;
  
  // 비디오 옵션
  videoPreset?: keyof typeof KBO_VIDEO_PRESETS;
  generateTimeline?: boolean;
  timelineCount?: number;
  
  // 오디오 옵션
  audioPreset?: keyof typeof KBO_AUDIO_PRESETS;
  generateWaveform?: boolean;
  waveformWidth?: number;
  
  // 공통 옵션
  generateThumbnails?: boolean;
  onProgress?: (fileId: string, progress: number) => void;
}

/**
 * 멀티미디어 처리 서비스 클래스
 */
export class MultimediaService {
  private processingQueue: Map<string, ProcessedMediaFile> = new Map();
  
  /**
   * 단일 파일 처리
   */
  async processFile(
    file: File,
    options: MediaProcessingOptions = {}
  ): Promise<ProcessedMediaFile> {
    const fileId = this.generateFileId();
    
    // 파일 타입 검증
    const validation = validateFileType(file);
    if (!validation.isValid) {
      throw new Error(validation.error || '지원하지 않는 파일 형식입니다.');
    }
    
    // 초기 처리 객체 생성
    const processedFile: ProcessedMediaFile = {
      id: fileId,
      originalFile: file,
      type: validation.type!,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      metadata: {} as any,
      status: 'processing',
      progress: 0
    };
    
    this.processingQueue.set(fileId, processedFile);
    this.updateProgress(fileId, 10, options.onProgress);
    
    try {
      // 타입별 처리
      switch (validation.type) {
        case 'image':
          await this.processImage(processedFile, options);
          break;
        case 'video':
          await this.processVideo(processedFile, options);
          break;
        case 'audio':
          await this.processAudio(processedFile, options);
          break;
      }
      
      processedFile.status = 'completed';
      processedFile.progress = 100;
      this.updateProgress(fileId, 100, options.onProgress);
      
      return processedFile;
    } catch (error) {
      processedFile.status = 'error';
      processedFile.error = error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.';
      throw error;
    }
  }
  
  /**
   * 다중 파일 처리
   */
  async processFiles(
    files: File[],
    options: MediaProcessingOptions = {}
  ): Promise<ProcessedMediaFile[]> {
    const results: ProcessedMediaFile[] = [];
    const errors: Error[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.processFile(files[i], {
          ...options,
          onProgress: (fileId, progress) => {
            // 전체 진행률 계산
            const overallProgress = Math.round(
              ((i * 100) + progress) / files.length
            );
            options.onProgress?.(fileId, overallProgress);
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`파일 처리 실패: ${files[i].name}`, error);
        errors.push(error as Error);
      }
    }
    
    if (errors.length > 0 && results.length === 0) {
      throw new Error(`모든 파일 처리에 실패했습니다: ${errors[0].message}`);
    }
    
    return results;
  }
  
  /**
   * 이미지 처리
   */
  private async processImage(
    processedFile: ProcessedMediaFile,
    options: MediaProcessingOptions
  ): Promise<void> {
    const { originalFile } = processedFile;
    
    // 메타데이터 추출
    this.updateProgress(processedFile.id, 20, options.onProgress);
    const metadata = await extractImageMetadata(originalFile);
    processedFile.metadata = {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width / metadata.height
    };
    
    // 이미지 최적화
    this.updateProgress(processedFile.id, 40, options.onProgress);
    const preset = options.imagePreset ? CARD_PRESETS[options.imagePreset] : CARD_PRESETS.standard;
    const quality = options.imageQuality || getOptimalQuality(originalFile.size);
    
    const optimizationOptions: ImageOptimizationOptions = {
      width: preset.width,
      height: preset.height,
      quality,
      format: getOptimalFormat(),
      fit: 'cover',
      progressive: true
    };
    
    processedFile.optimized = await resizeImageClient(originalFile, optimizationOptions);
    this.updateProgress(processedFile.id, 70, options.onProgress);
    
    // 썸네일 생성
    if (options.generateThumbnails) {
      const thumbnailOptions: ImageOptimizationOptions = {
        ...optimizationOptions,
        width: CARD_PRESETS.thumbnail.width,
        height: CARD_PRESETS.thumbnail.height,
        quality: 80
      };
      
      processedFile.thumbnail = await resizeImageClient(originalFile, thumbnailOptions);
    }
    
    // 미리보기 생성
    processedFile.preview = URL.createObjectURL(processedFile.optimized);
    this.updateProgress(processedFile.id, 90, options.onProgress);
  }
  
  /**
   * 비디오 처리
   */
  private async processVideo(
    processedFile: ProcessedMediaFile,
    options: MediaProcessingOptions
  ): Promise<void> {
    const { originalFile } = processedFile;
    
    // 메타데이터 추출
    this.updateProgress(processedFile.id, 20, options.onProgress);
    const metadata = await extractVideoMetadata(originalFile);
    processedFile.metadata = metadata;
    
    // 비디오 길이 검증
    const preset = options.videoPreset ? KBO_VIDEO_PRESETS[options.videoPreset] : KBO_VIDEO_PRESETS.homerun;
    const durationValidation = validateVideoDuration(metadata.duration, preset.maxDuration);
    if (!durationValidation.isValid) {
      throw new Error(durationValidation.error);
    }
    
    // 해상도 검증
    const resolutionValidation = validateVideoResolution(
      metadata.width,
      metadata.height,
      preset.maxWidth,
      preset.maxHeight
    );
    if (!resolutionValidation.isValid) {
      throw new Error(resolutionValidation.error);
    }
    
    // 썸네일 생성
    this.updateProgress(processedFile.id, 40, options.onProgress);
    if (options.generateThumbnails) {
      processedFile.thumbnail = await generateVideoThumbnail(originalFile, {
        time: preset.thumbnailTime,
        width: 400,
        height: 280,
        quality: 0.8
      });
    }
    
    // 타임라인 썸네일 생성
    this.updateProgress(processedFile.id, 60, options.onProgress);
    if (options.generateTimeline) {
      processedFile.timeline = await generateVideoTimeline(originalFile, {
        count: options.timelineCount || 5,
        width: 160,
        height: 90,
        quality: 0.7
      });
    }
    
    // 미리보기 URL 생성
    processedFile.preview = URL.createObjectURL(originalFile);
    this.updateProgress(processedFile.id, 90, options.onProgress);
  }
  
  /**
   * 오디오 처리
   */
  private async processAudio(
    processedFile: ProcessedMediaFile,
    options: MediaProcessingOptions
  ): Promise<void> {
    const { originalFile } = processedFile;
    
    // 메타데이터 추출
    this.updateProgress(processedFile.id, 20, options.onProgress);
    const metadata = await extractAudioMetadata(originalFile);
    processedFile.metadata = metadata;
    
    // 오디오 길이 검증
    const preset = options.audioPreset ? KBO_AUDIO_PRESETS[options.audioPreset] : KBO_AUDIO_PRESETS.cheer;
    const durationValidation = validateAudioDuration(metadata.duration, preset.maxDuration);
    if (!durationValidation.isValid) {
      throw new Error(durationValidation.error);
    }
    
    // 파형 생성
    this.updateProgress(processedFile.id, 50, options.onProgress);
    if (options.generateWaveform) {
      processedFile.waveform = await generateWaveform(originalFile, {
        width: options.waveformWidth || 800,
        height: 200,
        samples: 1000,
        color: '#007AFF'
      });
    }
    
    // 미리보기 URL 생성
    processedFile.preview = URL.createObjectURL(originalFile);
    this.updateProgress(processedFile.id, 90, options.onProgress);
  }
  
  /**
   * 진행률 업데이트
   */
  private updateProgress(
    fileId: string,
    progress: number,
    onProgress?: (fileId: string, progress: number) => void
  ): void {
    const processedFile = this.processingQueue.get(fileId);
    if (processedFile) {
      processedFile.progress = progress;
      onProgress?.(fileId, progress);
    }
  }
  
  /**
   * 파일 ID 생성
   */
  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * 처리 상태 조회
   */
  getProcessingStatus(fileId: string): ProcessedMediaFile | null {
    return this.processingQueue.get(fileId) || null;
  }
  
  /**
   * 처리 취소
   */
  cancelProcessing(fileId: string): void {
    const processedFile = this.processingQueue.get(fileId);
    if (processedFile && processedFile.status === 'processing') {
      processedFile.status = 'error';
      processedFile.error = '사용자에 의해 취소됨';
      this.processingQueue.delete(fileId);
    }
  }
  
  /**
   * 메모리 정리
   */
  cleanup(fileId: string): void {
    const processedFile = this.processingQueue.get(fileId);
    if (processedFile) {
      // Object URL 정리
      if (processedFile.preview && processedFile.preview.startsWith('blob:')) {
        URL.revokeObjectURL(processedFile.preview);
      }
      
      this.processingQueue.delete(fileId);
    }
  }
  
  /**
   * 모든 처리 정리
   */
  cleanupAll(): void {
    for (const [fileId] of this.processingQueue) {
      this.cleanup(fileId);
    }
  }
}

/**
 * 기본 멀티미디어 서비스 인스턴스
 */
export const multimediaService = new MultimediaService();

/**
 * KBO 특화 처리 프리셋
 */
export const KBO_PROCESSING_PRESETS = {
  // 홈런 순간 카드
  homerun: {
    imagePreset: 'standard' as const,
    videoPreset: 'homerun' as const,
    audioPreset: 'hit' as const,
    generateThumbnails: true,
    generateTimeline: true,
    generateWaveform: true,
    timelineCount: 5
  },
  
  // 도루 성공 카드
  steal: {
    imagePreset: 'standard' as const,
    videoPreset: 'steal' as const,
    audioPreset: 'cheer' as const,
    generateThumbnails: true,
    generateTimeline: true,
    generateWaveform: false,
    timelineCount: 3
  },
  
  // 수비 명장면 카드
  defense: {
    imagePreset: 'standard' as const,
    videoPreset: 'defense' as const,
    audioPreset: 'ambient' as const,
    generateThumbnails: true,
    generateTimeline: true,
    generateWaveform: false,
    timelineCount: 4
  },
  
  // 결정적 순간 카드
  clutch: {
    imagePreset: 'print' as const,
    videoPreset: 'clutch' as const,
    audioPreset: 'fanfare' as const,
    generateThumbnails: true,
    generateTimeline: true,
    generateWaveform: true,
    timelineCount: 6
  },
  
  // 응원 카드
  cheer: {
    imagePreset: 'standard' as const,
    videoPreset: 'cheer' as const,
    audioPreset: 'cheer' as const,
    generateThumbnails: true,
    generateTimeline: false,
    generateWaveform: true,
    timelineCount: 0
  }
} as const;

/**
 * 파일 크기 제한 검증
 */
export function validateFileSize(
  file: File,
  maxSize: number = 50 * 1024 * 1024 // 50MB
): { isValid: boolean; error?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `파일 크기가 ${maxSizeMB}MB를 초과합니다. (현재: ${Math.round(file.size / (1024 * 1024))}MB)`
    };
  }
  
  return { isValid: true };
}

/**
 * 배치 파일 검증
 */
export function validateFiles(
  files: File[],
  options: {
    maxFiles?: number;
    maxTotalSize?: number;
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    maxFiles = 10,
    maxTotalSize = 200 * 1024 * 1024, // 200MB
    allowedTypes = ['image/*', 'video/*', 'audio/*']
  } = options;
  
  const errors: string[] = [];
  
  // 파일 개수 검증
  if (files.length > maxFiles) {
    errors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
  }
  
  // 전체 크기 검증
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    const maxSizeGB = Math.round(maxTotalSize / (1024 * 1024 * 1024) * 10) / 10;
    errors.push(`전체 파일 크기가 ${maxSizeGB}GB를 초과합니다.`);
  }
  
  // 파일 타입 검증
  for (const file of files) {
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isAllowed) {
      errors.push(`지원하지 않는 파일 형식: ${file.name} (${file.type})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}