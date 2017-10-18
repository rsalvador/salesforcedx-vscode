#!/usr/bin/env node

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const extensionToUpdate = ['packages/salesforcedx-apex-debugger'];

const sourceCoverageFolderName = 'coverage';
const sourceTestResultFileName = 'xunit.xml';
let targetCoverageFolderName, targetTestResultFileName;

if (process.argv.length === 4) {
  targetCoverageFolderName = process.argv[2];
  targetTestResultFileName = process.argv[3];
} else {
  console.log('Provide target coverage folder name and test result file name');
  exit(-1);
}

extensionToUpdate.forEach(extension => {
  packageDir = path.join(__dirname, '..', extension);
  const sourceCoverageFolderPath = path.join(
    packageDir,
    sourceCoverageFolderName
  );
  const sourceTestResultFilePath = path.join(
    packageDir,
    sourceTestResultFileName
  );
  console.log(
    `packageDir: ${packageDir} | sourceCoverageFolderPath: ${sourceCoverageFolderPath} | sourceTestResultFilePath: ${sourceTestResultFilePath}`
  );
  if (targetCoverageFolderName && fs.existsSync(sourceCoverageFolderPath)) {
    console.log(
      `Moving ${sourceCoverageFolderName} to ${targetCoverageFolderName}`
    );
    shell.mv(
      sourceCoverageFolderPath,
      path.join(packageDir, targetCoverageFolderName)
    );
  }
  if (sourceTestResultFileName && fs.existsSync(sourceTestResultFilePath)) {
    console.log(
      `Moving ${sourceTestResultFileName} to ${targetTestResultFileName}`
    );
    shell.mv(
      sourceTestResultFilePath,
      path.join(packageDir, targetTestResultFileName)
    );
  }
});
