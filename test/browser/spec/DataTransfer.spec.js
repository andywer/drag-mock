(function() {
  'use strict';

  var DataTransfer = dragMock.DataTransfer;

  describe('DataTransfer object', function() {

    var dataTransfer;

    beforeEach(function() {
      dataTransfer = new DataTransfer();
    });

    it('getData method returns falsy value if no data has been set', function() {
      expect(dataTransfer.getData('text')).to.not.be.ok();
    });

    it('can get previously set data', function() {
      dataTransfer.setData('text', 'Hello World');
      dataTransfer.setData('application/json', { hello: 'world' });

      expect(dataTransfer.getData('text')).to.equal('Hello World');
      expect(dataTransfer.getData('application/json')).to.eql({ hello: 'world' });
    });

    it('can clear all data', function() {
      dataTransfer.setData('text', 'Hello World');
      dataTransfer.setData('application/json', { hello: 'world' });

      dataTransfer.clearData();

      expect(dataTransfer.getData('text')).to.not.be.ok();
      expect(dataTransfer.getData('application/json')).to.not.be.ok();
    });

    it('can clear data of a specific format', function() {
      dataTransfer.setData('text', 'Hello World');
      dataTransfer.setData('application/json', { hello: 'world' });

      dataTransfer.clearData('text');

      expect(dataTransfer.getData('text')).to.not.be.ok();
      expect(dataTransfer.getData('application/json')).to.eql({ hello: 'world' });
    });

    it('has setDragImage() method', function() {
      expect(dataTransfer.setDragImage).to.not.throwError();
    });

  });
}());
