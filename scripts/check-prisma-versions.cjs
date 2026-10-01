const { readFileSync } = require('node:fs');
const path = require('node:path');

const rootDirectory = path.resolve(__dirname, '..');
const packageDirectories = [
  { name: 'root', directory: rootDirectory },
  { name: 'backend', directory: path.join(rootDirectory, 'backend') },
];

const declaredVersions = packageDirectories.map(({ name, directory }) => {
  const packageJson = JSON.parse(
    readFileSync(path.join(directory, 'package.json'), 'utf8')
  );
  const dependencies = {
    ...packageJson.devDependencies,
    ...packageJson.dependencies,
  };

  return { name, dependencies };
});

const expected = {
  prisma: '8.0.0-rc.18',
  '@prisma/client': '7.10.0',
  '@prisma/orm-postgres': '8.0.0-rc.12',
};
const mismatches = declaredVersions.filter(({ dependencies }) =>
  Object.entries(expected).some(([packageName, version]) => dependencies[packageName] !== version)
);

if (mismatches.length > 0) {
  for (const { name, dependencies } of mismatches) {
    const actual = Object.keys(expected)
      .map((packageName) => `${packageName}=${dependencies[packageName] ?? 'missing'}`)
      .join(', ');
    console.error(`${name}: expected ${Object.entries(expected).map(([key, value]) => `${key}=${value}`).join(', ')}; got ${actual}.`);
  }
  process.exitCode = 1;
} else if (declaredVersions.find(({ name }) => name === 'backend')?.dependencies['@prisma/prisma7'] !== '7.10.0') {
  console.error('backend: expected @prisma/prisma7=7.10.0.');
  process.exitCode = 1;
} else {
  console.log('Root and backend Prisma 7/8 package versions match the migration lock.');
}