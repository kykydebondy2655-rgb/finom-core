/**
 * Application Constants
 * Centralized configuration values used across the application
 */

/**
 * Default temporary password for imported leads and new client accounts
 * This password is used consistently across:
 * - Admin lead imports (ClientImportModal)
 * - Admin API createLead function
 * - Agent SendAccountEmailModal
 * 
 * The client MUST change this password on first login (must_change_password flag)
 */
export const DEFAULT_TEMP_PASSWORD = 'TempPass123!';

/**
 * Base URL for the application
 */
export const APP_BASE_URL = 'https://pret-finom.co';

/**
 * Login URL for email templates
 */
export const LOGIN_URL = `${APP_BASE_URL}/login`;
