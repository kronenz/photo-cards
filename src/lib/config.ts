import { dev } from '$app/environment';
import { 
	PUBLIC_APP_NAME, 
	PUBLIC_APP_URL, 
	PUBLIC_API_URL 
} from '$env/static/public';

export interface AppConfig {
	appName: string;
	appUrl: string;
	apiUrl: string;
	pocketbaseUrl: string;
	isDevelopment: boolean;
	isProduction: boolean;
	storage: {
		type: 'local' | 'minio';
		path?: string;
		endpoint?: string;
		bucket?: string;
	};
	email: {
		enabled: boolean;
		host?: string;
		port?: number;
	};
}

export const config: AppConfig = {
	appName: PUBLIC_APP_NAME || 'Holographic Card Community',
	appUrl: PUBLIC_APP_URL || (dev ? 'http://localhost:5173' : 'https://your-domain.com'),
	apiUrl: PUBLIC_API_URL || (dev ? 'http://localhost:8090' : 'https://your-domain.com/api'),
	pocketbaseUrl: PUBLIC_API_URL || (dev ? 'http://localhost:8090' : 'https://your-domain.com/api'),
	isDevelopment: dev,
	isProduction: !dev,
	storage: {
		type: dev ? 'local' : 'minio',
		path: dev ? './uploads' : undefined,
		endpoint: dev ? undefined : 'localhost:9000',
		bucket: 'holographic-cards'
	},
	email: {
		enabled: !dev, // Disable email in development by default
		host: 'smtp.gmail.com',
		port: 587
	}
};

export default config;