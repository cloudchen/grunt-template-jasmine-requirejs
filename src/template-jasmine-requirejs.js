
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
      '2.1.5' : __dirname + '/../vendor/require-2.1.5.js'
    };

exports.process = function(grunt, task, context) {

  var version = context.options.version;

  // find the latest version if none given
  if (!version) {
    version = Object.keys(requirejs).sort().pop();
  }

  var src = context.scripts.src;
  var baseUrl = context.options.requireConfig && context.options.requireConfig.baseUrl;
  if (!baseUrl) {
    baseUrl = '/';
  }

  // Remove baseUrl and .js from src files
  src.forEach(function(script, i){
    if (baseUrl) {
      script = script.replace(new RegExp('^' + baseUrl),"");
    }
    src[i] = script.replace(/\.js$/,"");
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

