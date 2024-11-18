import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';

const API_DIR = resolve(__dirname, '..');
const DIST_DIR = join(API_DIR, 'dist');
const ROOT_DIR = resolve(API_DIR, '../..');

// Ensure dist directory exists
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

// Build core package first
console.log('Building core package...');
execSync('pnpm --filter core build', { stdio: 'inherit' });

// Copy core dist to api dist/core
const CORE_DIST = resolve(ROOT_DIR, 'packages/core/dist');
const CORE_DEST = join(DIST_DIR, 'core');

if (!existsSync(CORE_DEST)) {
  mkdirSync(CORE_DEST, { recursive: true });
}

console.log('Copying core package...');
cpSync(CORE_DIST, CORE_DEST, { recursive: true });

// Read and modify package.json
const pkgJson = JSON.parse(readFileSync(join(API_DIR, 'package.json'), 'utf8'));

// Modify dependencies to use local core
const modifiedPkgJson = {
  ...pkgJson,
  main: 'index.js',
  dependencies: {
    ...pkgJson.dependencies,
    core: 'file:./core',
  },
};

// Remove devDependencies and other unnecessary fields
delete modifiedPkgJson.devDependencies;
delete modifiedPkgJson.scripts;

// Write modified package.json
writeFileSync(
  join(DIST_DIR, 'package.json'),
  JSON.stringify(modifiedPkgJson, null, 2)
);

// Copy core's package.json but remove all devDependencies
const corePkgJson = JSON.parse(
  readFileSync(resolve(ROOT_DIR, 'packages/core/package.json'), 'utf8')
);
delete corePkgJson.devDependencies;
delete corePkgJson.scripts;
writeFileSync(
  join(CORE_DEST, 'package.json'),
  JSON.stringify(corePkgJson, null, 2)
);

// Copy firebase.json to dist
console.log('Copying firebase.json...');
cpSync(
  resolve(API_DIR, 'firebase-for-deploy.json'),
  join(DIST_DIR, 'firebase.json')
);

console.log('Deployment preparation completed!');
