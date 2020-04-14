/**
 * Converts a file or project path to a name which is used when generating
 * require statments and export statements in bundle.js. This is also used
 * by the client to map project paths in metadata to the appropriate module
 * in the bundle.js file. This is written with JavaScript instead of TypeScript
 * so that it can be used by the application-bundler without having to run
 * the TypeScript compiler. The corresponding .d.ts file is used to refer to
 * this module in TypeScript.
 * @param sFilePath - The path to be mapped to a JavaScript variable name
 */
function pathToExportName(sFilePath) {
  let sMemberName = '';
  let aPathSegments = _pathToSegments(sFilePath);
  aPathSegments.forEach((sSegment, index) => {
    // Replace dashes with two underscores because JavaScript variables can't have dashes.
    sSegment = sSegment.replace(/-/g, '__');
    sMemberName += sSegment.split('.').join('_').toLowerCase();
    if (index < aPathSegments.length - 1) {
      sMemberName += '_';
    }
  });
  return sMemberName;
};
exports.pathToExportName = pathToExportName;

function _pathToSegments(sFilePath) {
  if (sFilePath.startsWith('./')) {
    sFilePath = sFilePath.slice(2, sFilePath.length);
  }

  let aPathSegments = sFilePath.split('/');

  // Remove the empty string at the beginning,
  // which exists if the string starts with a slash.
  if (sFilePath.startsWith('/')) {
    aPathSegments.splice(0, 1);
  }

  return aPathSegments;
}
