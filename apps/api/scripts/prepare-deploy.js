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
var fs_1 = require("fs");
var path_1 = require("path");
var child_process_1 = require("child_process");
var API_DIR = (0, path_1.resolve)(__dirname, '..');
var DIST_DIR = (0, path_1.join)(API_DIR, 'dist');
var ROOT_DIR = (0, path_1.resolve)(API_DIR, '../..');
// Ensure dist directory exists
if (!(0, fs_1.existsSync)(DIST_DIR)) {
    (0, fs_1.mkdirSync)(DIST_DIR, { recursive: true });
}
// Build core package first
console.log('Building core package...');
(0, child_process_1.execSync)('pnpm --filter core build', { stdio: 'inherit' });
// Copy core dist to api dist/core
var CORE_DIST = (0, path_1.resolve)(ROOT_DIR, 'packages/core/dist');
var CORE_DEST = (0, path_1.join)(DIST_DIR, 'core');
if (!(0, fs_1.existsSync)(CORE_DEST)) {
    (0, fs_1.mkdirSync)(CORE_DEST, { recursive: true });
}
console.log('Copying core package...');
(0, fs_1.cpSync)(CORE_DIST, CORE_DEST, { recursive: true });
// Read and modify package.json
var pkgJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(API_DIR, 'package.json'), 'utf8'));
// Modify dependencies to use local core
var modifiedPkgJson = __assign(__assign({}, pkgJson), { main: 'index.js', dependencies: __assign(__assign({}, pkgJson.dependencies), { core: 'file:./core' }) });
// Remove devDependencies and other unnecessary fields
delete modifiedPkgJson.devDependencies;
delete modifiedPkgJson.scripts;
// Write modified package.json
(0, fs_1.writeFileSync)((0, path_1.join)(DIST_DIR, 'package.json'), JSON.stringify(modifiedPkgJson, null, 2));
// Copy core's package.json but remove all devDependencies
var corePkgJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.resolve)(ROOT_DIR, 'packages/core/package.json'), 'utf8'));
delete corePkgJson.devDependencies;
delete corePkgJson.scripts;
(0, fs_1.writeFileSync)((0, path_1.join)(CORE_DEST, 'package.json'), JSON.stringify(corePkgJson, null, 2));
// Copy firebase.json to dist
console.log('Copying firebase.json...');
(0, fs_1.cpSync)((0, path_1.resolve)(API_DIR, 'firebase-for-deploy.json'), (0, path_1.join)(DIST_DIR, 'firebase.json'));
console.log('Deployment preparation completed!');
