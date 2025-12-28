// scripts/version.js
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(colors.cyan(`\nBuilding version ${packageJson.version}`));

