require.config({
  config: {
    math: {
      description: "Math module"
    },
    sum: {
      description: "Sum module"
    }
  }
});

require(['app'], function(app) {
  app.start();
});