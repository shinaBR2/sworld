// @ts-ignore
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
// @ts-ignore
import { resolve, join } from 'path';
// @ts-ignore
import { execSync } from 'child_process';

// @ts-ignore
const API_DIR = resolve(__dirname, '..');
const DIST_DIR = join(API_DIR, 'dist');
const ROOT_DIR = resolve(API_DIR, '../..');

console.log('Building core package...');
execSync('pnpm --filter core build', { stdio: 'inherit' });

console.log('Building database package...');
execSync('pnpm --filter database build', { stdio: 'inherit' });

// Create necessary directories
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

const CORE_DIST = resolve(ROOT_DIR, 'packages/core/dist');
const CORE_DEST = join(DIST_DIR, 'core');

const DATABASE_DIST = resolve(ROOT_DIR, 'packages/database');
const DATABASE_DEST = join(DIST_DIR, 'database');

[CORE_DEST, DATABASE_DEST].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Copy the built files
console.log('Copying core package...');
cpSync(CORE_DIST, CORE_DEST, { recursive: true });

console.log('Copying database package...');
// Copy the compiled code
cpSync(join(DATABASE_DIST, 'dist'), DATABASE_DEST, {
  recursive: true,
});

const pkgJson = JSON.parse(readFileSync(join(API_DIR, 'package.json'), 'utf8'));
const modifiedPkgJson = {
  ...pkgJson,
  main: 'index.js',
  dependencies: {
    ...pkgJson.dependencies,
    core: 'file:./core',
    database: 'file:./database',
  },
};
delete modifiedPkgJson.devDependencies;
delete modifiedPkgJson.scripts;

// Write API package.json
writeFileSync(
  join(DIST_DIR, 'package.json'),
  JSON.stringify(modifiedPkgJson, null, 2)
);

// Prepare core package.json
const corePkgJson = JSON.parse(
  readFileSync(resolve(ROOT_DIR, 'packages/core/package.json'), 'utf8')
);
delete corePkgJson.devDependencies;
delete corePkgJson.scripts;
writeFileSync(
  join(CORE_DEST, 'package.json'),
  JSON.stringify(corePkgJson, null, 2)
);

// Prepare database package.json
const dbPkgJson = JSON.parse(
  readFileSync(join(DATABASE_DIST, 'package.json'), 'utf8')
);
const deployedDbPkgJson = {
  ...dbPkgJson,
  main: 'index.js',
  module: 'index.mjs',
  types: 'index.d.ts',
};
delete deployedDbPkgJson.devDependencies;
delete deployedDbPkgJson.scripts;
delete deployedDbPkgJson.exports;
writeFileSync(
  join(DATABASE_DEST, 'package.json'),
  JSON.stringify(deployedDbPkgJson, null, 2)
);

// Copy firebase configuration
console.log('Copying firebase.json...');
cpSync(
  resolve(API_DIR, 'firebase-for-deploy.json'),
  join(DIST_DIR, 'firebase.json')
);

console.log('Deployment preparation completed!');
