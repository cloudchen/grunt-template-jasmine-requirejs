require.config({
  config: {
    math: {
      description: "Math module"
    },
    sum: {
      description: "Sum module"
    }
  },
  shim: {
    nonRequireJsLib: {
      init: function () {
        return this.nonRequireJsLib.noConflict();
      }
    }
  }
});

require(['app'], function(app) {
  app.start();
});