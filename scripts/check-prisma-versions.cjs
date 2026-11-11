const { readFileSync } = require('node:fs');
const path = require('node:path');

// Root and backend must declare the same Prisma 7 versions, or the generated
// client and the CLI that runs migrations can drift apart.
const rootDirectory = path.resolve(__dirname, '..');
const packageDirectories = [
  { name: 'root', directory: rootDirectory, packages: ['@prisma/prisma7', '@prisma/client'] },
  {
    name: 'backend',
    directory: path.join(rootDirectory, 'backend'),
    packages: ['@prisma/prisma7', '@prisma/client', '@prisma/adapter-pg'],
  },
];

const expectedVersion = '7.10.1';
const mismatches = [];

for (const { name, directory, packages } of packageDirectories) {
  const packageJson = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
  const dependencies = { ...packageJson.devDependencies, ...packageJson.dependencies };
  for (const packageName of packages) {
    if (dependencies[packageName] !== expectedVersion) {
      mismatches.push(`${name}: ${packageName}=${dependencies[packageName] ?? 'missing'} (expected ${expectedVersion})`);
    }
  }
}

if (mismatches.length > 0) {
  for (const mismatch of mismatches) console.error(mismatch);
  process.exitCode = 1;
} else {
  console.log(`Root and backend Prisma packages are all ${expectedVersion}.`);
}
