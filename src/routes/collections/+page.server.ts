/**
 * Server-side auth guard for collections page
 * Feature: 004-production-service-integration
 * Requires authentication to access
 */

import { requireAuth } from '$lib/server/authGuard';

export const load = requireAuth();
