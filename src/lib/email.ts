import { config } from './config.js';

export interface EmailService {
	sendWelcomeEmail(to: string, name: string): Promise<void>;
	sendNotificationEmail(to: string, subject: string, content: string): Promise<void>;
}

export class GmailEmailService implements EmailService {
	private host: string;
	private port: number;
	private user: string;
	private pass: string;

	constructor(host: string, port: number, user: string, pass: string) {
		this.host = host;
		this.port = port;
		this.user = user;
		this.pass = pass;
	}

	async sendWelcomeEmail(to: string, name: string): Promise<void> {
		if (!config.email.enabled) {
			console.log('📧 Email disabled in development. Would send welcome email to:', to);
			return;
		}

		// TODO: Implement actual email sending with nodemailer or similar
		console.log('📧 Sending welcome email:', { to, name });
	}

	async sendNotificationEmail(to: string, subject: string, content: string): Promise<void> {
		if (!config.email.enabled) {
			console.log('📧 Email disabled in development. Would send notification:', { to, subject });
			return;
		}

		// TODO: Implement actual email sending
		console.log('📧 Sending notification email:', { to, subject, content });
	}
}

export class MockEmailService implements EmailService {
	async sendWelcomeEmail(to: string, name: string): Promise<void> {
		console.log('📧 [MOCK] Welcome email sent to:', to, 'Name:', name);
	}

	async sendNotificationEmail(to: string, subject: string, content: string): Promise<void> {
		console.log('📧 [MOCK] Notification email:', { to, subject, content });
	}
}

// Factory function to create appropriate email service
export function createEmailService(): EmailService {
	if (config.isDevelopment) {
		return new MockEmailService();
	}

	if (config.email.enabled && config.email.host) {
		return new GmailEmailService(
			config.email.host,
			config.email.port || 587,
			process.env.SMTP_USER || '',
			process.env.SMTP_PASS || ''
		);
	}

	return new MockEmailService();
}

export const emailService = createEmailService();