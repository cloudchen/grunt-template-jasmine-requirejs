exports.init = function(grunt, task, context) {
	var path = require('path');
	
	var copyTempFile = function(srcFile, destDir) {		
		var src = __dirname + srcFile;
    	var target = path.join(destDir,srcFile);
    	
    	grunt.file.copy(src, target);
    	return target;
	};

	var targetReporterDir = path.dirname(context.scripts.reporters[0]);
	var reporter = copyTempFile('/istanbul-coverage-reporter.js', targetReporterDir);

	
    context.scripts.reporters.unshift(reporter);

    task.phantomjs.on('jasmine.istanbul.coverage', function (coverage) {
       global.__coverage__ = coverage;
    });
};  

  