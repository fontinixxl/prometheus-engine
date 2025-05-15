/**
 * A quick cross‐platform config & CLI check for your monorepo.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHECKS = [
  { name: 'pnpm', cmd: 'pnpm --version' },
  { name: 'vite', cmd: 'vite --version' },
  { name: 'tsc', cmd: 'tsc --version' },
  { name: 'electron', cmd: 'electron --version' },
  { name: 'eslint', cmd: 'eslint --version' },
];

const FILES = [
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  '.eslintrc.js',
  'packages/editor/vite.config.ts',
  'packages/editor/tsconfig.json',
];

const PKG_SCRIPTS_ROOT = ['build', 'start', 'lint', 'test'];
const PKG_SCRIPTS_EDITOR = ['build', 'start', 'dev'];

function runCommand({ name, cmd }) {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        console.error(`✗ ${name} not found or failed: "${cmd}"`);
      } else {
        console.log(`✔ ${name}: ${stdout.trim()}`);
      }
      resolve();
    });
  });
}

function fileExists(filePath) {
  const exists = fs.existsSync(path.resolve(process.cwd(), filePath));
  console.log(`${exists ? '✔' : '✗'} ${filePath}`);
}

function checkPackageScripts(pkgPath, expected) {
  const fullPath = path.resolve(process.cwd(), pkgPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`✗ Missing ${pkgPath}`);
    return;
  }
  const pkg = require(fullPath);
  expected.forEach((s) => {
    const ok = pkg.scripts && pkg.scripts[s];
    console.log(`${ok ? '✔' : '✗'} ${pkgPath} script "${s}"`);
  });
}

(async () => {
  console.log('\n⏳ Running CLI version checks...\n');
  for (const check of CHECKS) {
    await runCommand(check);
  }

  console.log('\n⏳ Checking config files...\n');
  FILES.forEach(fileExists);

  console.log('\n⏳ Checking package.json scripts (root)...\n');
  checkPackageScripts('package.json', PKG_SCRIPTS_ROOT);

  console.log('\n⏳ Checking package.json scripts (editor)...\n');
  checkPackageScripts('packages/editor/package.json', PKG_SCRIPTS_EDITOR);

  console.log('\n✅ Sanity check complete.\n');
})();
