"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
// @ts-ignore
var fs_1 = require("fs");
// @ts-ignore
var path_1 = require("path");
// @ts-ignore
var child_process_1 = require("child_process");
// @ts-ignore
var API_DIR = (0, path_1.resolve)(__dirname, '..');
var DIST_DIR = (0, path_1.join)(API_DIR, 'dist');
var ROOT_DIR = (0, path_1.resolve)(API_DIR, '../..');
// First, let's generate the Prisma client in our database package
// console.log('Generating Prisma client in database package...');
// execSync('pnpm --filter database db:generate', {
//   stdio: 'inherit',
//   cwd: ROOT_DIR,
// });
// Now proceed with the rest of your build process
console.log('Building core package...');
(0, child_process_1.execSync)('pnpm --filter core build', { stdio: 'inherit' });
console.log('Building database package...');
(0, child_process_1.execSync)('pnpm --filter database build', { stdio: 'inherit' });
// Create necessary directories
if (!(0, fs_1.existsSync)(DIST_DIR)) {
    (0, fs_1.mkdirSync)(DIST_DIR, { recursive: true });
}
var CORE_DIST = (0, path_1.resolve)(ROOT_DIR, 'packages/core/dist');
var CORE_DEST = (0, path_1.join)(DIST_DIR, 'core');
var DATABASE_DIST = (0, path_1.resolve)(ROOT_DIR, 'packages/database');
var DATABASE_DEST = (0, path_1.join)(DIST_DIR, 'database');
[CORE_DEST, DATABASE_DEST].forEach(function (dir) {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
});
// Copy the built files
console.log('Copying core package...');
(0, fs_1.cpSync)(CORE_DIST, CORE_DEST, { recursive: true });
console.log('Copying database package...');
// Copy the compiled code
(0, fs_1.cpSync)((0, path_1.join)(DATABASE_DIST, 'dist'), DATABASE_DEST, {
    recursive: true
});
// Copy Prisma files and generated client
// console.log('Copying Prisma files...');
// cpSync(join(DATABASE_DIST, 'prisma'), join(DATABASE_DEST, 'prisma'), {
//   recursive: true,
// });
// // Before copying the Prisma client, let's find where it's actually generated
// console.log('Copying Prisma client...');
// // Prisma generates its client in the workspace's node_modules/.prisma/client
// const PRISMA_CLIENT_SRC = join(
//   ROOT_DIR,
//   'node_modules/.pnpm/@prisma+client@6.0.1_prisma@6.0.1/node_modules/@prisma/client'
// );
// const PRISMA_CLIENT_DEST = join(DATABASE_DEST, 'node_modules/.prisma/client');
// // Create the destination directory structure
// mkdirSync(join(DATABASE_DEST, 'node_modules/.prisma'), { recursive: true });
// Add some debugging information
// console.log('Prisma client source path:', PRISMA_CLIENT_SRC);
// console.log('Prisma client destination path:', PRISMA_CLIENT_DEST);
// // First check if the source exists to provide better error handling
// if (!existsSync(PRISMA_CLIENT_SRC)) {
//   console.error('Could not find Prisma client at:', PRISMA_CLIENT_SRC);
//   console.error('Make sure Prisma client was generated successfully');
//   throw new Error('Prisma client source not found');
// }
// // Copy the Prisma client
// try {
//   cpSync(PRISMA_CLIENT_SRC, PRISMA_CLIENT_DEST, { recursive: true });
// } catch (error) {
//   console.error('Error copying Prisma client:', error);
//   throw error;
// }
// Prepare package.json files
var pkgJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(API_DIR, 'package.json'), 'utf8'));
var modifiedPkgJson = __assign(__assign({}, pkgJson), { main: 'index.js', dependencies: __assign(__assign({}, pkgJson.dependencies), { core: 'file:./core', database: 'file:./database' }) });
delete modifiedPkgJson.devDependencies;
delete modifiedPkgJson.scripts;
// Write API package.json
(0, fs_1.writeFileSync)((0, path_1.join)(DIST_DIR, 'package.json'), JSON.stringify(modifiedPkgJson, null, 2));
// Prepare core package.json
var corePkgJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.resolve)(ROOT_DIR, 'packages/core/package.json'), 'utf8'));
delete corePkgJson.devDependencies;
delete corePkgJson.scripts;
(0, fs_1.writeFileSync)((0, path_1.join)(CORE_DEST, 'package.json'), JSON.stringify(corePkgJson, null, 2));
// Prepare database package.json
var dbPkgJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(DATABASE_DIST, 'package.json'), 'utf8'));
var deployedDbPkgJson = __assign(__assign({}, dbPkgJson), { main: 'index.js', module: 'index.mjs', types: 'index.d.ts' });
delete deployedDbPkgJson.devDependencies;
delete deployedDbPkgJson.scripts;
delete deployedDbPkgJson.exports;
(0, fs_1.writeFileSync)((0, path_1.join)(DATABASE_DEST, 'package.json'), JSON.stringify(deployedDbPkgJson, null, 2));
// Copy firebase configuration
console.log('Copying firebase.json...');
(0, fs_1.cpSync)((0, path_1.resolve)(API_DIR, 'firebase-for-deploy.json'), (0, path_1.join)(DIST_DIR, 'firebase.json'));
console.log('Deployment preparation completed!');
