/**
 * Global Setup for Playwright Tests
 * 
 * Feature: 002-integrated-holographic-platform
 * Task: T054 [US5]
 * 
 * Purpose: Setup test environment before running tests
 */

import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up test environment...');
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for development server to be ready
    const baseURL = process.env.BASE_URL || 'http://localhost:5173';
    console.log(`📡 Checking server at ${baseURL}...`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('✅ Server is ready');
    
    // Verify main page loads correctly
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Main page loaded successfully');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎉 Test environment setup complete');
}

export default globalSetup;
