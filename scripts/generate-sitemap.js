#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect the Netlify URL from environment variables
const getNetlifyUrl = () => {
  // Netlify provides DEPLOY_URL during build
  if (process.env.DEPLOY_URL) {
    return process.env.DEPLOY_URL;
  }

  // Fallback to SITE_URL if available
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  // Local development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5173';
  }

  // Default fallback (shouldn't reach here in production)
  console.warn('⚠️  No Netlify URL detected. Using default.');
  return 'https://example.com';
};

const netlifyUrl = getNetlifyUrl();
const sitemapCommand = `svelte-sitemap --domain ${netlifyUrl}/`;

try {
  console.log(`📍 Generating sitemap for: ${netlifyUrl}`);
  execSync(sitemapCommand, { stdio: 'inherit' });
  console.log('✅ Sitemap generated successfully!');
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
