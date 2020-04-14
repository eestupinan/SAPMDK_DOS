const fs = require('fs-extra');
const program = require('commander');
const execSync = require('child_process').execSync;
const chalk = require('chalk');

// Helper functions
exports.fail = function(sMessage, bShowHelp) {
  exports.showError(sMessage);
  if (bShowHelp) program.outputHelp();
  process.exit(1);
}

exports.showError = function(sMessage) {
  console.error(chalk.red('Error: ') + sMessage);
}

exports.isDirectory = function(sPath) {
  try {
    return fs.statSync(sPath).isDirectory();
  } catch (e) {
    return false;
  }
}

exports.isFile = function(sPath) {
  try {
    return fs.statSync(sPath).isFile();
  } catch (e) {
    return false;
  }
}

exports.exec = function(sCommand, sErrorMessage, oOptions, bAllowFailure) {
  const bExecVerbose = exports.execVerbose;
  try {
    if (bExecVerbose) {
      console.log(sCommand);
    }
    const oResult = execSync(sCommand, oOptions);
    if (oResult && bExecVerbose) {
      console.log(oResult.toString());
    }
    return oResult;
  } catch (e) {
    const sStderr = e.stderr.toString();
    if (e.stdout) {
      console.log(e.stdout.toString());
    }
    if (sStderr) {
      console.log(sStderr);
    }
    if (!bAllowFailure) {
      exports.fail(sErrorMessage);
    }
  }
}

exports.execVerbose = false;
