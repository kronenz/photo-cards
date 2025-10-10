/**
 * Form Validation Utility
 * Feature: 003-navigation-ui-renewal
 * Task: T023
 */

export interface ValidationRule {
	type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
	message: string;
	value?: any;
	validator?: (val: any) => boolean;
}

/**
 * Validate a field value against a set of rules
 * @param value - The value to validate
 * @param rules - Array of validation rules
 * @returns Error message string or null if valid
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
	for (const rule of rules) {
		switch (rule.type) {
			case 'required':
				if (!value || (typeof value === 'string' && value.trim() === '')) {
					return rule.message;
				}
				break;

			case 'email':
				if (!isValidEmail(value)) {
					return rule.message;
				}
				break;

			case 'minLength':
				if (typeof value === 'string' && value.length < rule.value) {
					return rule.message;
				}
				break;

			case 'maxLength':
				if (typeof value === 'string' && value.length > rule.value) {
					return rule.message;
				}
				break;

			case 'pattern':
				if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
					return rule.message;
				}
				break;

			case 'custom':
				if (rule.validator && !rule.validator(value)) {
					return rule.message;
				}
				break;
		}
	}
	return null;
}

/**
 * Validate an email address
 * @param email - Email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
	if (!email || typeof email !== 'string') return false;

	// RFC 5322 simplified regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate a password strength
 * @param password - Password string to validate
 * @returns Object with strength level and requirements met
 */
export function validatePassword(password: string): {
	strength: 'weak' | 'medium' | 'strong';
	requirements: {
		minLength: boolean;
		hasUppercase: boolean;
		hasLowercase: boolean;
		hasNumber: boolean;
		hasSpecial: boolean;
	};
} {
	const requirements = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
	};

	const score = Object.values(requirements).filter(Boolean).length;

	let strength: 'weak' | 'medium' | 'strong';
	if (score <= 2) strength = 'weak';
	else if (score <= 3) strength = 'medium';
	else strength = 'strong';

	return { strength, requirements };
}

/**
 * Validate multiple fields at once
 * @param fields - Object with field names and their values
 * @param rules - Object with field names and their validation rules
 * @returns Object with field names and error messages (or null if valid)
 */
export function validateForm(
	fields: Record<string, any>,
	rules: Record<string, ValidationRule[]>
): Record<string, string | null> {
	const errors: Record<string, string | null> = {};

	for (const [fieldName, fieldRules] of Object.entries(rules)) {
		const value = fields[fieldName];
		errors[fieldName] = validateField(value, fieldRules);
	}

	return errors;
}

/**
 * Check if form has any errors
 * @param errors - Error object from validateForm
 * @returns true if form has errors, false otherwise
 */
export function hasErrors(errors: Record<string, string | null>): boolean {
	return Object.values(errors).some((error) => error !== null);
}
