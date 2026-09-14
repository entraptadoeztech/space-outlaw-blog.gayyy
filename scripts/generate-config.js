import fs from 'fs';
import path from 'path';

// Get the Vercel URL or use localhost for local development
const url = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:5173';

const config = {
  url: url,
  environment: process.env.VERCEL_ENV || 'development',
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
  gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  timestamp: new Date().toISOString()
};

// Ensure build directory exists
const buildDir = 'build';
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Write config.json to build directory
fs.writeFileSync(
  path.join(buildDir, 'config.json'),
  JSON.stringify(config, null, 2)
);

console.log('✓ Generated config.json with URL:', config.url);
