
"use strict";

var template = __dirname + '/templates/jasmine-requirejs.html',
    requirejs  = {
      '2.1.1' : __dirname + '/../vendor/require-2.1.1.js',
      '2.1.2' : __dirname + '/../vendor/require-2.1.2.js'
    },
    path = require('path'),
    parse = require('./lib/parse'),
    mixConfig = require('./lib/mixConfig');

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

function toQuotedString(array) {
  return "'" + array.join("','") + "'";
}

function serializeRequireConfig(requireConfig) {
  return JSON.stringify(requireConfig, function(key, val) {
    if (typeof val === 'function') {
      return '$$$FUNC' + val.toString() + '$$$';
    }
    return val;
  }, 2).replace(/"\$\$\$FUNC(.*?)\$\$\$"/mg, '$1').replace(/\\n/g, '\n');
}

exports.process = function(grunt, task, context) {

  var version = context.options.version,
      requireConfig = {};

  // find the latest version if none given
  if (!version) {
    version = Object.keys(requirejs).sort().pop();
  }

  // Remove glob patterns from scripts (see https://github.com/gruntjs/grunt-contrib-jasmine/issues/42)
  filterGlobPatterns(context.scripts);

  // Extract config from main require config file
  if (context.options.mainRequireConfigFile) {
    // Remove mainConfigFile from src files
    context.scripts.src = grunt.util._.reject(context.scripts.src, function (script) {
      return path.normalize(script) === path.normalize(context.options.mainRequireConfigFile);
    });

    requireConfig = parse.findConfig(grunt.file.read(context.options.mainRequireConfigFile)).config;
  }

  // requireConfig overrides main require config
  if (context.options.requireConfig) {
    mixConfig(requireConfig, context.options.requireConfig);
  }

  // Ensure baseUrl
  if (!requireConfig.baseUrl) {
    requireConfig.baseUrl = '/';
  }

  // Remove baseUrl and .js from src files
  context.scripts.src = context.scripts.src.map(function(script) {
    if (script.indexOf(requireConfig.baseUrl) === 0) {
      script = script.substr(requireConfig.baseUrl.length);
    }
    return script.replace(/\.js$/, '');
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

  task.copyTempFile(requirejs[version], 'require.js');

  return grunt.util._.template(grunt.file.read(template), {
    css: context.css,
    scripts: [].concat(
        context.scripts.jasmine,
        context.scripts.vendor,
        context.scripts.helpers,
        [context.temp + '/require.js']
    ),
    require: {
      config: serializeRequireConfig(requireConfig),
      sources: toQuotedString(context.scripts.src),
      specsAndReporters: toQuotedString([].concat(context.scripts.specs, context.scripts.reporters)),
      start: toQuotedString(context.scripts.start)
    }
  });
};

