/*global module:false*/
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        node : true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', '!src/lib/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test']
      }
    },
    connect: {
      test: {
        options: {
          port: 9000,
          host: 'localhost',
          base: '.'
        }
      }
    },
    jasmine: {
      requirejs: {
        src: 'test/fixtures/requirejs/src/**/*.js',
        options: {
          specs: 'test/fixtures/requirejs/spec/*Spec.js',
          helpers: 'test/fixtures/requirejs/spec/*Helper.js',
          host: 'http://localhost:<%= connect.test.options.port %>/',
          template : require('./'),
          templateOptions: {
            mainRequireConfigFile: 'test/fixtures/requirejs/src/main.js',
            requireConfig : {
              baseUrl: './test/fixtures/requirejs/src/',
              config: {
                sum: {
                  description: "Sum module (overridden)"
                }
              }
            }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['connect', 'jasmine:requirejs']);

  // Default task.
  grunt.registerTask('default', ['jshint','test']);

};
