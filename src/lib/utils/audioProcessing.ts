/**
 * 오디오 처리 및 분석 유틸리티
 * 클라이언트사이드 오디오 처리와 시각화
 */

// 지원되는 오디오 포맷
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/aac',
  'audio/flac'
] as const;

// 오디오 메타데이터
export interface AudioMetadata {
  duration: number;
  size: number;
  type: string;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
}

// 오디오 분석 결과
export interface AudioAnalysis {
  waveform: number[];
  peaks: number[];
  rms: number;
  maxAmplitude: number;
  silenceRanges: Array<{ start: number; end: number }>;
}

/**
 * 오디오 메타데이터 추출
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      const metadata: AudioMetadata = {
        duration: audio.duration,
        size: file.size,
        type: file.type
      };
      
      // URL 정리
      URL.revokeObjectURL(audio.src);
      resolve(metadata);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('오디오 메타데이터를 읽을 수 없습니다.'));
    };
    
    audio.src = URL.createObjectURL(file);
  });
}

/**
 * 오디오 파형 생성 (Web Audio API 사용)
 */
export async function generateWaveform(
  file: File,
  options: {
    width?: number;
    height?: number;
    samples?: number;
    color?: string;
  } = {}
): Promise<string> {
  const {
    width = 800,
    height = 200,
    samples = 1000,
    color = '#007AFF'
  } = options;
  
  try {
    // AudioContext 생성
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer();
    
    // 오디오 디코딩
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 채널 데이터 추출 (모노로 변환)
    const channelData = audioBuffer.getChannelData(0);
    const sampleSize = Math.floor(channelData.length / samples);
    
    // 샘플링된 데이터 생성
    const waveformData: number[] = [];
    for (let i = 0; i < samples; i++) {
      const start = i * sampleSize;
      const end = start + sampleSize;
      let sum = 0;
      
      for (let j = start; j < end && j < channelData.length; j++) {
        sum += Math.abs(channelData[j]);
      }
      
      waveformData.push(sum / sampleSize);
    }
    
    // 정규화
    const maxValue = Math.max(...waveformData);
    const normalizedData = waveformData.map(value => value / maxValue);
    
    // Canvas에 파형 그리기
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // 배경 그리기
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);
    
    // 파형 그리기
    ctx.fillStyle = color;
    const barWidth = width / samples;
    const centerY = height / 2;
    
    for (let i = 0; i < normalizedData.length; i++) {
      const barHeight = normalizedData[i] * centerY;
      const x = i * barWidth;
      
      // 상하 대칭으로 그리기
      ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight * 2);
    }
    
    // AudioContext 정리
    audioContext.close();
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('파형 생성 실패:', error);
    throw new Error('오디오 파형을 생성할 수 없습니다.');
  }
}

/**
 * 오디오 스펙트럼 분석
 */
export async function analyzeAudioSpectrum(
  file: File,
  options: {
    fftSize?: number;
    smoothingTimeConstant?: number;
  } = {}
): Promise<Uint8Array> {
  const {
    fftSize = 2048,
    smoothingTimeConstant = 0.8
  } = options;
  
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    audio.oncanplaythrough = () => {
      try {
        // 오디오 소스 생성
        const source = audioContext.createMediaElementSource(audio);
        
        // 분석기 생성
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;
        
        // 연결
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // 주파수 데이터 추출
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // 오디오 재생 시작
        audio.play();
        
        // 잠시 후 데이터 수집
        setTimeout(() => {
          analyser.getByteFrequencyData(dataArray);
          audio.pause();
          audioContext.close();
          resolve(dataArray);
        }, 1000);
        
      } catch (error) {
        reject(error);
      }
    };
    
    audio.onerror = () => reject(new Error('오디오를 로드할 수 없습니다.'));
    audio.src = URL.createObjectURL(file);
  });
}

/**
 * 오디오 볼륨 정규화
 */
export async function normalizeAudioVolume(
  file: File,
  targetLevel: number = 0.8
): Promise<Blob> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 최대 진폭 찾기
    let maxAmplitude = 0;
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]));
      }
    }
    
    // 정규화 계수 계산
    const normalizationFactor = targetLevel / maxAmplitude;
    
    // 새 오디오 버퍼 생성
    const normalizedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // 각 채널 정규화
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = normalizedBuffer.getChannelData(channel);
      
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i] * normalizationFactor;
      }
    }
    
    // WAV 형식으로 인코딩 (간단한 구현)
    const wavBlob = encodeWAV(normalizedBuffer);
    audioContext.close();
    
    return wavBlob;
  } catch (error) {
    console.error('오디오 정규화 실패:', error);
    throw new Error('오디오 볼륨을 정규화할 수 없습니다.');
  }
}

/**
 * WAV 인코딩 (간단한 구현)
 */
function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const length = audioBuffer.length;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bytesPerSample = 2;
  
  const buffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
  const view = new DataView(buffer);
  
  // WAV 헤더 작성
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * bytesPerSample, true);
  
  // 오디오 데이터 작성
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * 오디오 길이 검증
 */
export function validateAudioDuration(
  duration: number,
  maxDuration: number = 30
): { isValid: boolean; error?: string } {
  if (duration > maxDuration) {
    return {
      isValid: false,
      error: `오디오 길이가 ${maxDuration}초를 초과합니다. (현재: ${Math.round(duration)}초)`
    };
  }
  
  return { isValid: true };
}

/**
 * 오디오 시간 포맷팅
 */
export function formatAudioDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 오디오 포맷 지원 여부 확인
 */
export function checkAudioFormatSupport(): {
  mp3: boolean;
  wav: boolean;
  ogg: boolean;
  m4a: boolean;
} {
  const audio = document.createElement('audio');
  
  return {
    mp3: audio.canPlayType('audio/mpeg') !== '',
    wav: audio.canPlayType('audio/wav') !== '',
    ogg: audio.canPlayType('audio/ogg') !== '',
    m4a: audio.canPlayType('audio/mp4') !== ''
  };
}

/**
 * KBO 야구 오디오 특화 설정
 */
export const KBO_AUDIO_PRESETS = {
  // 응원가 (중간 길이, 고품질)
  cheer: {
    maxDuration: 20,
    targetLevel: 0.9,
    fadeIn: true,
    fadeOut: true
  },
  
  // 타격음 (짧은 길이, 높은 볼륨)
  hit: {
    maxDuration: 3,
    targetLevel: 0.95,
    fadeIn: false,
    fadeOut: false
  },
  
  // 해설 음성 (긴 길이, 중간 볼륨)
  commentary: {
    maxDuration: 60,
    targetLevel: 0.7,
    fadeIn: true,
    fadeOut: true
  },
  
  // 경기장 분위기 (긴 길이, 낮은 볼륨)
  ambient: {
    maxDuration: 30,
    targetLevel: 0.5,
    fadeIn: true,
    fadeOut: true
  },
  
  // 승리 팡파레 (중간 길이, 높은 볼륨)
  fanfare: {
    maxDuration: 10,
    targetLevel: 0.9,
    fadeIn: false,
    fadeOut: true
  }
} as const;

/**
 * 오디오 시각화 생성 (원형 스펙트럼)
 */
export async function generateCircularSpectrum(
  file: File,
  options: {
    size?: number;
    color?: string;
    backgroundColor?: string;
  } = {}
): Promise<string> {
  const {
    size = 200,
    color = '#007AFF',
    backgroundColor = 'transparent'
  } = options;
  
  try {
    const spectrumData = await analyzeAudioSpectrum(file);
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;
    
    // 배경 그리기
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // 원형 스펙트럼 그리기
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const angleStep = (Math.PI * 2) / spectrumData.length;
    
    for (let i = 0; i < spectrumData.length; i++) {
      const angle = i * angleStep;
      const amplitude = spectrumData[i] / 255;
      const lineLength = amplitude * radius * 0.5;
      
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = centerX + Math.cos(angle) * (radius + lineLength);
      const endY = centerY + Math.sin(angle) * (radius + lineLength);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('원형 스펙트럼 생성 실패:', error);
    throw new Error('오디오 스펙트럼을 생성할 수 없습니다.');
  }
}