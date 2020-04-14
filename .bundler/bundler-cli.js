#!/usr/bin/env node
const Bundler = require('./bundler').Bundler;
const bundlerArgs = require('./bundler-args');
const chalk = require('chalk');

function doBuild() {
  const bundler = new Bundler(bundlerArgs);
  console.log("\n" + '[hh:mm:ss]'.timestamp + chalk.magenta(" -- cleaning --"));
  return bundler.cleanBuild()
  .then(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    // gets them again with the real names
    console.log("\n" + '[hh:mm:ss]'.timestamp + chalk.magenta(" -- building --"));
    return bundler.buildClientDefinitions();
  });
};

doBuild()
.catch((err) => {
  console.error(chalk.red(err));
  // There was a problem somewhere, do not return with 0
  process.exit(-1)
});