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

  return {
    name,
    cli: dependencies.prisma,
    client: dependencies['@prisma/client'],
  };
});

const expectedVersion = declaredVersions[0]?.cli;
const mismatches = declaredVersions.filter(
  ({ cli, client }) =>
    !cli || !client || !cli.startsWith('7.') || cli !== client || cli !== expectedVersion
);

if (mismatches.length > 0) {
  for (const { name, cli, client } of mismatches) {
    console.error(
      `${name}: prisma (${cli ?? 'missing'}) and @prisma/client (${client ?? 'missing'}) must use the same Prisma 7 version.`
    );
  }
  process.exitCode = 1;
} else {
  const versions = declaredVersions
    .map(({ name, cli }) => `${name}=${cli}`)
    .join(', ');
  console.log(`Prisma package versions match: ${versions}`);
}