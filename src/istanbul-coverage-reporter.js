(function () {
    var reporter = new jasmine.Reporter();
    
    reporter.reportRunnerResults = function (runner) {
    	var coverage = (typeof window.__coverage__ === 'undefined') ? {} : window.__coverage__;
        phantom.sendMessage('jasmine.istanbul.coverage', coverage);
    };

    jasmine.getEnv().addReporter(reporter);
})();