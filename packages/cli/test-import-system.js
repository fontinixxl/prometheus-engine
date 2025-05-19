#!/usr/bin/env node

/**
 * Test script for the Prometheus Engine import system
 * This script verifies that the import system is working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Convert exec to a Promise-based function
const execAsync = promisify(exec);

// Resolve the project root from the current script location
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '../..');
const gamesDir = path.join(projectRoot, 'games');
const testGameName = 'test-import-system-game';
const testGameDir = path.join(gamesDir, testGameName);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Print a colored message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Run a command and return the output
 */
async function runCommand(command, cwd = projectRoot) {
  try {
    log(`Running command: ${command}`, colors.blue);
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stderr) {
      console.error(`${colors.yellow}Command warning: ${stderr}${colors.reset}`);
    }
    console.log(
      `${colors.blue}Command output: ${stdout.substring(0, 500)}${stdout.length > 500 ? '...' : ''}${colors.reset}`,
    );
    return stdout.trim();
  } catch (error) {
    console.error(`${colors.red}Command error: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Test the import system by creating a new game, building it, and verifying imports work
 */
async function testImportSystem() {
  // Print header
  log('\n============================================', colors.cyan);
  log(' PROMETHEUS ENGINE IMPORT SYSTEM TEST', colors.cyan + colors.bold);
  log('============================================\n', colors.cyan);

  // Step 1: Create a test game
  log('Step 1: Creating a test game...', colors.magenta);

  // Check if the test game already exists and remove it
  if (fs.existsSync(testGameDir)) {
    log(`Test game directory already exists, removing: ${testGameDir}`, colors.yellow);
    fs.rmSync(testGameDir, { recursive: true, force: true });
  }

  try {
    await runCommand(`pnpm --filter cli run exec ${testGameName}`);
    log('✅ Test game created successfully', colors.green);
  } catch (error) {
    log(`❌ Failed to create test game: ${error.message}`, colors.red);
    return false;
  }

  // Step 2: Verify the test game's structure and import setup
  log('\nStep 2: Verifying test game structure and imports...', colors.magenta);

  // Check if critical files exist
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'app.ts',
    'index.ts',
    'index.html',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(testGameDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} exists`, colors.green);
    } else {
      log(`❌ ${file} does not exist`, colors.red);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('❌ Some required files are missing', colors.red);
    return false;
  }

  // Check if app.ts uses the proper import syntax
  const appTsPath = path.join(testGameDir, 'app.ts');
  const appTsContent = fs.readFileSync(appTsPath, 'utf8');

  if (appTsContent.includes("import { Engine } from '@prometheus/engine-core'")) {
    log('✅ app.ts uses the proper import syntax', colors.green);
  } else {
    log('❌ app.ts does not use the proper import syntax', colors.red);
    return false;
  }

  // Step 3: Try to build the test game
  log('\nStep 3: Building the test game...', colors.magenta);

  try {
    await runCommand(`pnpm --filter ${testGameName} run build`);
    log('✅ Test game built successfully', colors.green);
  } catch (error) {
    log(`❌ Failed to build test game: ${error.message}`, colors.red);
    return false;
  }

  // Step 4: Clean up
  log('\nStep 4: Cleaning up...', colors.magenta);

  fs.rmSync(testGameDir, { recursive: true, force: true });
  log('✅ Test game directory removed', colors.green);

  // Final result
  log('\n============================================', colors.cyan);
  log(' 🎉 ALL TESTS PASSED! 🎉', colors.green + colors.bold);
  log(' The import system is working correctly.', colors.cyan);
  log('============================================\n', colors.cyan);

  return true;
}

// Run the test
testImportSystem().catch((error) => {
  log(`❌ Test failed with error: ${error.message}`, colors.red);
  process.exit(1);
});
