define(function() {

  describe('Load Custom Template source html', function() {
    it('Should get custom template rather than original', function(){
      expect(window.customTemplateVariable).toEqual(true);
    });
  });
});
