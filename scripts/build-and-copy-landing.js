const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const landingDir = path.join(rootDir, 'landing');
const webPublicLandingDir = path.join(rootDir, 'web', 'public', 'landing');

try {
  // Check if landing dependencies need to be installed (e.g. on Netlify build containers)
  if (!fs.existsSync(path.join(landingDir, 'node_modules'))) {
    console.log('📦 Installing landing page dependencies on build server...');
    execSync('npm install --no-audit --no-fund', { cwd: landingDir, stdio: 'inherit' });
  }

  console.log('📦 Building landing page...');
  execSync('npm run build', { cwd: landingDir, stdio: 'inherit' });

  console.log('📂 Syncing landing build to web/public/landing...');
  if (fs.existsSync(webPublicLandingDir)) {
    fs.rmSync(webPublicLandingDir, { recursive: true, force: true });
  }

  fs.mkdirSync(webPublicLandingDir, { recursive: true });

  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach((child) => {
        copyRecursive(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  const landingDist = path.join(landingDir, 'dist');
  if (fs.existsSync(landingDist)) {
    copyRecursive(landingDist, webPublicLandingDir);
    console.log('✅ Landing page successfully copied to web/public/landing!');
  } else {
    console.warn('⚠️ landing/dist not found, using pre-built web/public/landing assets.');
  }
} catch (err) {
  console.error('⚠️ Warning during landing build/sync:', err.message);
  if (fs.existsSync(webPublicLandingDir) && fs.existsSync(path.join(webPublicLandingDir, 'index.html'))) {
    console.log('✅ Fallback: Using pre-committed web/public/landing assets.');
  } else {
    throw err;
  }
}
