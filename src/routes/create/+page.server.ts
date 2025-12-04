/**
 * Server-side auth guard for card creation page
 * Feature: 004-production-service-integration
 * Requires authentication to access
 */

import { requireAuth } from '$lib/server/authGuard';

export const load = requireAuth();
