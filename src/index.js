/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2017-04-26 11:45:22
*/

'use strict';

var fs = require('fs');
var exec = require('child_process').exec;

var pkg = require('../package.json');

// plugin defination
module.exports = {

  command: 'dep <command>',

  description: pkg.description,

  options: [
    [ '    --npm <npm>', 'npm registry', 'https://registry.npm.taobao.org' ]
  ],

  action: function(command, options) {
    switch (command) {
      case 'install':
      case 'update':
        try {

          // filter out nowa & nowa plugins from dependencies
          var pkgPath = 'package.json';
          var pkgText = fs.readFileSync(pkgPath, 'utf-8');
          var pkgJson = JSON.parse(pkgText);
          filterOutNowa(pkgJson.dependencies);
          filterOutNowa(pkgJson.devDependencies);
          fs.writeFileSync(pkgPath, JSON.stringify(pkgJson));

          // run npm command
          var npm = options.npm || 'npm';
          var registry;
          if (/^https?:\/\//.test(npm)) {
            registry = npm;
            npm = 'npm';
          }
          var cmd = npm + ' ' + command;
          if (registry) {
            cmd += ' --registry=' + registry;
          }
          console.log('Running ' + cmd);
          exec(cmd, function(err, stdout, stderr) {

            // revert package.json
            fs.writeFileSync(pkgPath, pkgText);
            console.log(err || stderr || stdout);
            if (!err) {
              console.log('Done.');
            }
          });
        } catch(e) {
          console.error(e);
        }
        break;
      default:
        console.error('Unknow command ' + command);
    }
  }
};

// filter out nowa & nowa plugins from dependencies
function filterOutNowa(dependencies) {
  dependencies = dependencies || {};
  for (var key in dependencies) {
    if (/^nowa($|\-)/.test(key)) {
      delete dependencies[key];
    }
  }
}
