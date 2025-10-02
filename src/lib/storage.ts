import { config } from './config.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

export interface StorageService {
	upload(file: File, path: string): Promise<string>;
	delete(path: string): Promise<void>;
	getUrl(path: string): string;
}

export class LocalStorageService implements StorageService {
	private basePath: string;

	constructor(basePath: string = './uploads') {
		this.basePath = basePath;
		this.ensureDirectory(basePath);
	}

	private async ensureDirectory(path: string): Promise<void> {
		if (!existsSync(path)) {
			await mkdir(path, { recursive: true });
		}
	}

	async upload(file: File, path: string): Promise<string> {
		const fullPath = join(this.basePath, path);
		const directory = dirname(fullPath);
		
		await this.ensureDirectory(directory);
		
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(fullPath, buffer);
		
		return path;
	}

	async delete(path: string): Promise<void> {
		const fullPath = join(this.basePath, path);
		// TODO: Implement file deletion
		console.log('Delete file:', fullPath);
	}

	getUrl(path: string): string {
		return `${config.appUrl}/uploads/${path}`;
	}
}

export class MinIOStorageService implements StorageService {
	private endpoint: string;
	private bucket: string;

	constructor(endpoint: string, bucket: string) {
		this.endpoint = endpoint;
		this.bucket = bucket;
	}

	async upload(file: File, path: string): Promise<string> {
		// TODO: Implement MinIO upload using MinIO client
		console.log('MinIO upload:', { file: file.name, path });
		return path;
	}

	async delete(path: string): Promise<void> {
		// TODO: Implement MinIO deletion
		console.log('MinIO delete:', path);
	}

	getUrl(path: string): string {
		return `https://${this.endpoint}/${this.bucket}/${path}`;
	}
}

// Factory function to create appropriate storage service
export function createStorageService(): StorageService {
	if (config.storage.type === 'minio' && config.storage.endpoint) {
		return new MinIOStorageService(
			config.storage.endpoint,
			config.storage.bucket || 'holographic-cards'
		);
	}
	
	return new LocalStorageService(config.storage.path);
}

export const storageService = createStorageService();