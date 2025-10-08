/**
 * Template Downloader Service
 *
 * Client-side service for downloading and managing templates
 * Handles localStorage caching and offline access
 */

import { TemplateSerializer } from './template-serializer';
import type { TemplateJSON } from '$lib/types/template';
import type { Card } from '$lib/types/collections';

interface DownloadedTemplate {
	templateId: string;
	templateJSON: TemplateJSON;
	metadata: {
		title: string;
		author: string;
		downloadedAt: string;
	};
}

export class TemplateDownloader {
	private readonly serializer: TemplateSerializer;
	private readonly storageKey = 'myTemplates';

	constructor() {
		this.serializer = new TemplateSerializer();
	}

	/**
	 * Download template from marketplace
	 */
	async downloadTemplate(templateId: string): Promise<{
		templateJSON: TemplateJSON;
		card: Card;
		metadata: any;
	}> {
		try {
			// Fetch from API
			const response = await fetch(`/api/templates/${templateId}/download`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Download failed');
			}

			const data = await response.json();
			const { templateJSON, metadata } = data;

			// Deserialize to Card
			const card = this.serializer.deserialize(templateJSON);

			// Save to localStorage
			this.saveToLocalStorage({
				templateId,
				templateJSON,
				metadata
			});

			return { templateJSON, card, metadata };
		} catch (error) {
			console.error('Download error:', error);
			throw error;
		}
	}

	/**
	 * Get all downloaded templates from localStorage
	 */
	getDownloadedTemplates(): DownloadedTemplate[] {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (!stored) return [];

			return JSON.parse(stored);
		} catch (error) {
			console.error('Failed to read downloaded templates:', error);
			return [];
		}
	}

	/**
	 * Get specific downloaded template
	 */
	getDownloadedTemplate(templateId: string): DownloadedTemplate | null {
		const templates = this.getDownloadedTemplates();
		return templates.find((t) => t.templateId === templateId) || null;
	}

	/**
	 * Check if template is already downloaded
	 */
	isDownloaded(templateId: string): boolean {
		return this.getDownloadedTemplate(templateId) !== null;
	}

	/**
	 * Save template to localStorage
	 */
	private saveToLocalStorage(template: DownloadedTemplate): void {
		try {
			const templates = this.getDownloadedTemplates();

			// Remove existing entry if present
			const filtered = templates.filter((t) => t.templateId !== template.templateId);

			// Add new entry
			filtered.push(template);

			// Save to localStorage
			localStorage.setItem(this.storageKey, JSON.stringify(filtered));
		} catch (error) {
			console.error('Failed to save template to localStorage:', error);

			// Check quota exceeded
			if (error instanceof DOMException && error.name === 'QuotaExceededError') {
				// Remove oldest templates to make space
				this.pruneOldTemplates(5);

				// Retry save
				try {
					const templates = this.getDownloadedTemplates();
					templates.push(template);
					localStorage.setItem(this.storageKey, JSON.stringify(templates));
				} catch (retryError) {
					throw new Error('Storage quota exceeded. Please delete some templates.');
				}
			} else {
				throw error;
			}
		}
	}

	/**
	 * Remove template from localStorage
	 */
	removeTemplate(templateId: string): boolean {
		try {
			const templates = this.getDownloadedTemplates();
			const filtered = templates.filter((t) => t.templateId !== templateId);

			if (filtered.length === templates.length) {
				return false; // Template not found
			}

			localStorage.setItem(this.storageKey, JSON.stringify(filtered));
			return true;
		} catch (error) {
			console.error('Failed to remove template:', error);
			return false;
		}
	}

	/**
	 * Clear all downloaded templates
	 */
	clearAll(): void {
		localStorage.removeItem(this.storageKey);
	}

	/**
	 * Get total storage size used
	 */
	getStorageSize(): { bytes: number; formatted: string } {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (!stored) return { bytes: 0, formatted: '0 B' };

			const bytes = new Blob([stored]).size;
			return {
				bytes,
				formatted: this.formatBytes(bytes)
			};
		} catch (error) {
			return { bytes: 0, formatted: '0 B' };
		}
	}

	/**
	 * Prune oldest templates to free up space
	 */
	private pruneOldTemplates(count: number): void {
		try {
			const templates = this.getDownloadedTemplates();

			// Sort by download date (oldest first)
			templates.sort(
				(a, b) =>
					new Date(a.metadata.downloadedAt).getTime() -
					new Date(b.metadata.downloadedAt).getTime()
			);

			// Remove oldest N templates
			const pruned = templates.slice(count);
			localStorage.setItem(this.storageKey, JSON.stringify(pruned));
		} catch (error) {
			console.error('Failed to prune templates:', error);
		}
	}

	/**
	 * Format bytes to human-readable string
	 */
	private formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	/**
	 * Export templates as JSON file (backup)
	 */
	exportTemplates(): void {
		try {
			const templates = this.getDownloadedTemplates();
			const blob = new Blob([JSON.stringify(templates, null, 2)], {
				type: 'application/json'
			});

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `kbo-templates-backup-${Date.now()}.json`;
			a.click();

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to export templates:', error);
			throw new Error('Export failed');
		}
	}

	/**
	 * Import templates from JSON file (restore)
	 */
	async importTemplates(file: File): Promise<number> {
		try {
			const text = await file.text();
			const imported: DownloadedTemplate[] = JSON.parse(text);

			if (!Array.isArray(imported)) {
				throw new Error('Invalid backup file format');
			}

			// Validate each template
			for (const template of imported) {
				if (!template.templateId || !template.templateJSON || !template.metadata) {
					throw new Error('Invalid template format in backup');
				}
			}

			// Merge with existing templates
			const existing = this.getDownloadedTemplates();
			const merged = [...existing];

			for (const template of imported) {
				const index = merged.findIndex((t) => t.templateId === template.templateId);
				if (index >= 0) {
					merged[index] = template; // Update existing
				} else {
					merged.push(template); // Add new
				}
			}

			localStorage.setItem(this.storageKey, JSON.stringify(merged));
			return imported.length;
		} catch (error) {
			console.error('Failed to import templates:', error);
			throw new Error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}
}

// Singleton instance
export const templateDownloader = new TemplateDownloader();
