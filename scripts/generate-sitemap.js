#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const raw = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (!a.startsWith('--')) continue;
    const [key, val] = a.split('=');
    const name = key.replace(/^--/, '');
    if (val !== undefined) {
      out[name] = val;
    } else if (raw[i + 1] && !raw[i + 1].startsWith('--')) {
      out[name] = raw[i + 1];
      i++;
    } else {
      out[name] = true;
    }
  }
  return out;
}

const args = parseArgs();
const outDir = args.outDir || args['out-dir'] || '.';
const domainArg = args.domain || args.domainName || args.domainUrl || null;

function detectDomain() {
  if (domainArg) return domainArg;
  const env = process.env;

  // Priority order of environment variables for common hosts
  if (env.SITE_URL) return env.SITE_URL; // Netlify common
  if (env.URL) return env.URL; // Netlify alternative
  if (env.DEPLOY_URL) return env.DEPLOY_URL; // Netlify preview
  if (env.DEPLOY_PRIME_URL) return env.DEPLOY_PRIME_URL; // Netlify enterprise
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`; // Vercel (no protocol)
  if (env.CF_PAGES_URL) return env.CF_PAGES_URL; // Cloudflare Pages
  if (env.RENDER_EXTERNAL_URL) return env.RENDER_EXTERNAL_URL; // Render
  if (env.PUBLIC_URL) return env.PUBLIC_URL; // CRA / other

  // Local development fallback
  if (env.NODE_ENV === 'development') return 'http://localhost:5173';

  // Last resort
  return null;
}

let domain = detectDomain();
if (!domain) {
  console.warn('⚠️  No deployment URL detected via environment variables. Using https://example.com as a fallback.');
  domain = 'https://example.com';
}

// Normalize domain: add protocol if missing, remove trailing slash
if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(domain)) {
  domain = `https://${domain.replace(/^\/+/, '')}`;
}
domain = domain.replace(/\/+$, '');

const sitemapCmd = `svelte-sitemap --domain ${domain}/ --out-dir ${outDir}`;

try {
  console.log(`📍 Generating sitemap for: ${domain}/`);
  console.log(`📂 Output directory: ${outDir}`);
  execSync(sitemapCmd, { stdio: 'inherit' });
  console.log('✅ Sitemap generated successfully!');
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
