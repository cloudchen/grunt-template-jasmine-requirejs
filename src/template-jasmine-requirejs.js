"use strict";

var template = __dirname + '/templates/jasmine-requirejs.html',
    requirejs  = {
      '2.0.0' : __dirname + '/../vendor/require-2.0.0.js',
      '2.0.1' : __dirname + '/../vendor/require-2.0.1.js',
      '2.0.2' : __dirname + '/../vendor/require-2.0.2.js',
      '2.0.3' : __dirname + '/../vendor/require-2.0.3.js',
      '2.0.4' : __dirname + '/../vendor/require-2.0.4.js',
      '2.0.5' : __dirname + '/../vendor/require-2.0.5.js',
      '2.0.6' : __dirname + '/../vendor/require-2.0.6.js',
      '2.1.0' : __dirname + '/../vendor/require-2.1.0.js',
      '2.1.1' : __dirname + '/../vendor/require-2.1.1.js',
      '2.1.2' : __dirname + '/../vendor/require-2.1.2.js',
      '2.1.3' : __dirname + '/../vendor/require-2.1.3.js',
      '2.1.4' : __dirname + '/../vendor/require-2.1.4.js',
      '2.1.5' : __dirname + '/../vendor/require-2.1.5.js',
      '2.1.6' : __dirname + '/../vendor/require-2.1.6.js',
      '2.1.7' : __dirname + '/../vendor/require-2.1.7.js',
      '2.1.8' : __dirname + '/../vendor/require-2.1.8.js'
    },
    path = require('path'),
    parse = require('./lib/parse');

function filterGlobPatterns(scripts) {
  Object.keys(scripts).forEach(function (group) {
    if (Array.isArray(scripts[group])) {
      scripts[group] = scripts[group].filter(function(script) {
        return script.indexOf('*') === -1;
      });
    } else {
      scripts[group] = [];
    }
  });
}

exports.process = function(grunt, task, context) {

  var version = context.options.version;

  // find the latest version if none given
  if (!version) {
    version = Object.keys(requirejs).sort().pop();
  }

  // Remove glob patterns from scripts (see https://github.com/gruntjs/grunt-contrib-jasmine/issues/42)
  filterGlobPatterns(context.scripts);

  // Extract config from main require config file
  if (context.options.requireConfigFile) {
    // Remove mainConfigFile from src files
    var requireConfigFiles = grunt.util._.flatten([context.options.requireConfigFile]);

    var normalizedPaths = grunt.util._.map(requireConfigFiles, function(configFile){
      return path.normalize(configFile);
    });
    context.scripts.src = grunt.util._.reject(context.scripts.src, function (script) {
      return grunt.util._.contains(normalizedPaths, path.normalize(script));
    });

    var configFromFiles = {};
    grunt.util._.map(requireConfigFiles, function (configFile) {
      grunt.util._.merge(configFromFiles, parse.findConfig(grunt.file.read(configFile)).config);
    });

    context.options.requireConfig = grunt.util._.merge(configFromFiles, context.options.requireConfig);
  }

  // Remove baseUrl and .js from src files
  var baseUrl = (context.options.requireConfig && context.options.requireConfig.baseUrl || '/');
  context.scripts.src.forEach(function(script, i){
    script = script.replace(new RegExp('^' + baseUrl + "/?"),"");
    context.scripts.src[i] = script.replace(/\.js$/,"");
  });

  // Prepend loaderPlugins to the appropriate files
  if (context.options.loaderPlugin) {
    Object.keys(context.options.loaderPlugin).forEach(function(type){
      if (context[type]) {
        context[type].forEach(function(file,i){
          context[type][i] = context.options.loaderPlugin[type] + '!' + file;
        });
      }
    });
  }

  if (!(version in requirejs)) {
      throw new Error('specified requirejs version [' + version + '] is not defined');
  } else {
      task.copyTempFile(requirejs[version],'require.js');
  }

  context.serializeRequireConfig = function(requireConfig) {
      var funcCounter = 0;
      var funcs = {};

      function generateFunctionId() {
          return '$template-jasmine-require_' + new Date().getTime() + '_' + (++funcCounter);
      }

      var jsonString = JSON.stringify(requireConfig, function(key, val) {
          var funcId;
          if (typeof val === 'function') {
              funcId = generateFunctionId();
              funcs[funcId] = val;
              return funcId;
          }
          return val;
      }, 2);

      Object.keys(funcs).forEach(function(id) {
          jsonString = jsonString.replace('"' + id + '"', funcs[id].toString());
      });

      return jsonString;
  };

  var source = grunt.file.read(template);
  return grunt.util._.template(source, context);
};

