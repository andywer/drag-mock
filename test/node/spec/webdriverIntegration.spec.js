'use strict';

var expect = require('expect.js')
  , sinon = require('sinon')
  , fs = require('fs');

var dragMock = require('../../../');


function FakeWebdriverInstance() {
  this.args = Array.prototype.slice.call(arguments);
}

FakeWebdriverInstance.prototype.execute = function() {
  var args = Array.prototype.slice.call(arguments);
  var lastArg = args.pop();

  if (typeof lastArg === 'function') {
    lastArg(null);
  }
};


function createWebdriverFactoryMock() {
  var webdriverFactory = {
    remote: function(url) {
      return new FakeWebdriverInstance(url);
    },
    version: '0.0.0'
  };

  sinon.spy(webdriverFactory, 'remote');

  return webdriverFactory;
}


describe('webdriver.io integration', function() {

  it('integration methods are set on drag-mock', function() {
    expect(dragMock.extendWebdriver).to.be.a('function');
    expect(dragMock.loadLibrary).to.be.a('function');
  });

  describe('extendWebdriver() called on a webdriver factory', function() {
    var webdriver = createWebdriverFactoryMock();
    var originalRemoteMethod = webdriver.remote;

    dragMock.extendWebdriver(webdriver);

    it('replaces the webdriver factory\'s remote() method', function() {
      expect(webdriver.remote).to.not.equal(originalRemoteMethod);
    });

    it('remote() returns extended instances', function() {
      var webdriverInstance = webdriver.remote('foo bar');

      expect(webdriverInstance).to.be.a(FakeWebdriverInstance);
      expect(webdriverInstance.args).to.eql(['foo bar']);

      expect(webdriverInstance.dragStart).to.be.a('function');
      expect(webdriverInstance.drop).to.be.a('function');
    });
  });

  describe('extendWebdriver() called on a webdriver instance', function() {
    var webdriver = new FakeWebdriverInstance('foo bar');

    dragMock.extendWebdriver(webdriver);

    it('extends the given instance', function() {
      expect(webdriver.dragStart).to.be.a('function');
      expect(webdriver.dragEnter).to.be.a('function');
      expect(webdriver.dragOver).to.be.a('function');
      expect(webdriver.dragLeave).to.be.a('function');
      expect(webdriver.drop).to.be.a('function');
      expect(webdriver.delay).to.be.a('function');
    });
  });


  describe('loadLibrary()', function() {
    var webdriver = new FakeWebdriverInstance('foo bar');
    var dragMockLib = fs.readFileSync(__dirname + '/../../../dist/drag-mock.js', { encoding: 'utf-8' });

    sinon.spy(webdriver, 'execute');

    it('injects drag-mock code into browser context', function(done) {
      function assertions() {
        expect(webdriver.execute.callCount).to.equal(1);

        var executeCall = webdriver.execute.getCall(0);
        expect(executeCall.args[0]).to.eql(dragMockLib);
      }

      dragMock.loadLibrary(webdriver, function() {
        assertions();
        done();
      });
    });
  });

});
