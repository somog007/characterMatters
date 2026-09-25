const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const landingDir = path.join(rootDir, 'welcome');
const webPublicLandingDir = path.join(rootDir, 'web', 'public', 'welcome');

try {
  // Check if welcome page directory exists
  if (fs.existsSync(landingDir)) {
    console.log('📦 Checking landing page / welcome build...');
    const welcomeDist = path.join(landingDir, 'dist');
    if (fs.existsSync(welcomeDist)) {
      if (!fs.existsSync(webPublicLandingDir)) {
        fs.mkdirSync(webPublicLandingDir, { recursive: true });
      }
      console.log('✅ Welcome static build verified.');
    }
  }
} catch (err) {
  console.warn('⚠️ Warning during landing sync:', err.message);
}
