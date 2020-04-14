// Copyright 2017 SAP SE.
//
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific
// language governing permissions and limitations under the License.

'use strict';

module.exports = function (grunt) {

	var path = require("fs").existsSync(".bundler") ? ".bundler/" : "";
	//var bundleCmd="node " + path + "bundler-cli.js" + " --settings-file " + path + "settings.json"
	var bundleCmd = "node bundler-cli.js --settings-file settings.json";

	// Project configuration.
	grunt.initConfig({
		exec: {   // task name
			bundlerExec: {
				cmd: bundleCmd
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-exec');

	grunt.file.setBase(path);

	// default task
	grunt.registerTask('default', ['exec']);

};
