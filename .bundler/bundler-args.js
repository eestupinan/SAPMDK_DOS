const commandLineArgs = require('command-line-args');
const path = require('path');
const fs = require('fs-extra');
const process = require('process');
const chalk = require('chalk');

const optionDefinitions = [
  { name: 'application-name', type: String, multiple: false },
  { name: 'bundle-output-name', type: String, multiple: false },
  { name: 'create-bundle', type: Boolean, multiple: false },
  { name: 'editor-export', type: String, multiple: false },
  { name: 'externals', type: String, multiple: true },
  { name: 'nativescript-project', type: String, multiple: false },
  { name: 'settings-file', type: String, multiple: false },
  { name: 'seam-project', type: String, multiple: false },  
  { name: 'watch', type: Boolean, multiple: false },
  { name: 'help', type: String, multiple: false, defaultOption: true },
  { name: 'devtool', type: String, multiple: false },
  { name: 'bundle-target-path', type: String, multiple: false}
];

let options = commandLineArgs(optionDefinitions);

function processArguments() {
  function getMissingRequiredArgumentMessage() {
    if (!options['editor-export'] && !options['seam-project']) {
      return chalk.red('Missing both the ') + chalk.white.bold('editor-export') + chalk.red(' and ') + chalk.white.bold('seam-project ') + chalk.red('options. One of these must be specified.');
    }
    if (!options['create-bundle'] && !options['nativescript-project']) {
      return chalk.red('Missing both the ') + chalk.white.bold('create-bundle') + chalk.red(' and ') + chalk.white.bold('nativescript-project ') + chalk.red('options. One of these must be specified.');
    }
    return null;
  }
  const noArguments = Object.keys(options).length === 0;
  const settingsFileArgument = options['settings-file'];
  if (noArguments || settingsFileArgument) {
    const settingsFilePath = options['settings-file'] || process.cwd() + '/settings.json';
    console.log(chalk.cyan('trying to use settings file at ') + chalk.white(settingsFilePath));
    try {
      options = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
    } catch (e) {
      console.error(chalk.red('failed to parse settings file with path ') + chalk.white(settingsFilePath));
      throw e;
    }
  }

  const missingArgumentMessage = getMissingRequiredArgumentMessage();
  if (missingArgumentMessage) {
    console.error(missingArgumentMessage);
  }
  if (missingArgumentMessage || options.help) {
    const getUsage = require('command-line-usage')

    const sections = [
      {
        header: 'Application Bundler',
        content: 'Generates a bundle.js file that is used as an import into the NativeScript platform bundle. If no arguments are specified, a default argument "--settings-file settings.json" is used.'
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'bundle-output-name',
            typeLabel: '',
            description: 'Output filename of bundle. If not specified, uses the default bundle.js name'
          },
          {
            name: 'create-bundle',
            description: 'If this option is specified, a new zip file will be created called uploadBundle.zip. This can be used to upload the application bundle to HCP. Also, if this is specified, the application will not be copied to the NativeScript project path.'
          },
          {
            name: 'editor-export',
            typeLabel: '[underline]{file}',
            description: 'Path of the zip file exported from WebIDE which contains an application. If this is specified, the zipped application is what gets bundled and the seam-project option is ignored.'
          },
          {
            name: 'externals',
            typeLabel: '[underline]{module-name module-name ...}',
            description: 'Space-delimited list of NPM modules to be excluded from the bundle. Use this option for dependencies you expect to be in the environment when the application is built.  If not specified, the values "file-system" and "ui/dialogs" are automatically added.'
          },
          {
            name: 'nativescript-project',
            typeLabel: '[underline]{folder}',
            description: 'The location of the NativeScript project\'s app folder. As long as the create-bundle option isn\'t specified, the application bundle is copied here.'
          },
          {
            name: 'settings-file',
            typeLabel: '[underline]{file}',
            description: 'Path of the settings JSON file containing other options. If this is specified, all other command line arguments are ignored.'
          },
          {
            name: 'seam-project',
            typeLabel: '[underline]{folder}',
            description: 'The location of the base application definitions. Used to generate the bundle unless editor-export is specified.'
          },
          {
            name: 'seam-extensions',
            typeLabel: '[underline]{folder}',
            description: 'The location of the application extenstions. If it is specified, the entire contents of this directory will be copied to app/extensions/.'
          },
          {
            name: 'watch',
            description: 'If this option is specified, the script will watch for changes in the input files. If editor-export is also specified, any updates to the export zip file will cause the application to be rebundled. If editor-export is not specified, any changes to project files in the seam-project directory will cause the application to be rebundled.'
          },
          {
            name: 'help',
            description: 'Print this usage guide.'
          },
          {
            name: 'devtool',
            description: 'Choose a style of source mapping to enhance the debugging process.'
          },
          {
            name: 'bundle-target-path',
            typeLabel: '[underline]{folder}',
            description: 'The location of the target for bundle task. If this is specified, the bundle.js will be copied into it.'
          }   
        ]
      }
    ]
    const usage = getUsage(sections);
    console.log(usage);
    process.exit(-1);
  }
  if (options['create-bundle'] && options['nativescript-project']) {
    console.log(chalk.white('create-bundle') + chalk.cyan(' was specified, so ') + chalk.white('nativescript-project') + chalk.cyan(' will be ignored.'));
  }
  if (options['editor-export'] && options['seam-project']) {
    console.log(chalk.white('editor-export') + chalk.cyan(' was specified, so ') + chalk.white('seam-project') + chalk.cyan(' will be ignored.'));
  }
}

exports.applicationName = function () {
  return options['application-name'];
}

exports.bundleName = function () {
  return options['bundle-output-name'] || 'bundle.js' ;
}

exports.shouldCreateBundle = function () {
  return !!options['create-bundle'];
}

exports.shouldWatch = function () {
  return !!options['watch'];
}

exports.editorExport = function () {
  return options['editor-export'];
}

exports.externals = function () {
  return options['externals'] || [];
}

exports.libraryTarget = function () {
  return 'umd';
}

exports.nativeScriptProjectPath = function () {
  var sNativeScriptProject = options['nativescript-project'];
  if (!sNativeScriptProject) return undefined;
  return path.resolve(path.normalize(sNativeScriptProject));
}

exports.mdkBaseApplicationPath = function () {
  var mdkProjectPath = options['seam-project'];
  if (!mdkProjectPath) return undefined;
  return path.resolve(path.normalize(mdkProjectPath));
}

exports.seamExtensionsPath = function () {
  var sSeamExtensions = options['seam-extensions'];
  return sSeamExtensions ? path.resolve(path.normalize(sSeamExtensions)) : undefined;
}

// this file must exist in the dest folder
exports.projectIndexFile = function () {
  return "application-index.js";
}

exports.devtool = function() {
  return options['devtool'];
}

exports.bundleTargetPath = function () {
  var targetPath = options['bundle-target-path'];
  if (!targetPath) return undefined;
  return path.resolve(path.normalize(targetPath));
}

processArguments();
