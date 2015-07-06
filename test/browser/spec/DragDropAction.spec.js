(function() {
  'use strict';

  var DragDropAction = dragMock.DragDropAction;

  var elementA = document.querySelector('#dom-test > .a')
    , elementB = document.querySelector('#dom-test > .b');


  function getMsTimestamp() {
    var now = new Date();

    return now.getTime() * 1000 + now.getMilliseconds();
  }


  describe('DragDropAction', function() {

    var action;

    beforeEach(function() {
      action = new DragDropAction();
    });

    it('provides expected methods', function() {
      expect(action).to.be.a(DragDropAction);
      expect(action.dragStart).to.be.a(Function);
      expect(action.dragLeave).to.be.a(Function)
      expect(action.drop).to.be.a(Function);
      expect(action.then).to.be.a(Function);
      expect(action.delay).to.be.a(Function);
    });


    describe('dragStart method', function() {

      it('throws error if called without valid targetElement', function() {
        expect(action.dragStart).withArgs(null).to.throwError(/Expected first parameter to be a targetElement/);
      });

      it('creates expected events', function(done) {
        EventHelper.expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done);

        action.dragStart(elementA);
      });

      it('creates events with given properties', function(done) {
        EventHelper.expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, { hello: 'world', foo: 'bar' });
      });

      it('customizes events using a custom callback', function(done) {
        EventHelper.expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, function(event, eventName) {
          event.hello = 'world';
          event.foo = 'bar';
        });
      });

      it('calls one-argument callback only once for drag event', function() {
        var timesCalled = 0;

        action.dragStart(elementA, function(event) {
          expect(event.type).to.equal('drag');
          timesCalled++;
        });

        expect(timesCalled).to.equal(1);
      });

      it('calls two-argument callback for mousedown, drag & dragstart event', function() {
        var timesCalled = 0
          , eventNames = [];

        action.dragStart(elementA, function(event, eventName) {
          eventNames.push(eventName);
          timesCalled++;
        });

        expect(timesCalled).to.equal(3);
        expect(eventNames).to.eql(['mousedown', 'dragstart', 'drag']);
      });

      it('customizes events with given properties and using a custom callback', function(done) {
        EventHelper.expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, { hello: 'world' }, function(event, eventName) {
          event.foo = 'bar';
        });
      });

    });


    describe('dragEnter method', function() {

      it('creates expected events (without prior call to dragStart())', function(done) {
        EventHelper.expectEvents(elementA, ['mousemove', 'mouseover', 'dragenter'], done);

        action.dragEnter(elementA);
      });

    });

    describe('dragOver method', function() {

      it('creates expected events (without prior call to dragStart())', function(done) {
        EventHelper.expectEvents(elementA, ['mousemove', 'mouseover', 'dragover'], done);

        action.dragOver(elementA);
      });

    });

    describe('dragLeave method', function() {

      it('creates expected events (without prior call to dragStart())', function(done) {
        EventHelper.expectEvents(elementA, ['mousemove', 'mouseover', 'dragleave'], done);

        action.dragLeave(elementA);
      });

    });

    describe('drop method', function() {

      it('creates expected events (without prior call to dragStart())', function(done) {
        EventHelper.expectEvents(elementA, ['mousemove', 'mouseup', 'drop'], done);

        action.drop(elementA);
      });

      it('triggers a dragEnd event on the drag source', function(done) {
        EventHelper.expectEvents(elementA, ['dragend'], done);

        action.dragStart(elementA).drop(elementB);
      });

    });

    describe('delay & then method', function() {

      it('can delay execution', function(done) {
        var startTimeMs = getMsTimestamp();

        action.delay(250).delay(500).then(function() {
          expect(this).to.equal(action);
          expect(getMsTimestamp() - startTimeMs).to.be.greaterThan(749);

          done();
        });
      });

    });


    it('methods are chainable', function() {
      expect(action.dragStart(elementA)).to.be(action);
      expect(action.drop(elementA)).to.be(action);
    });

    it('makes passing data through dataTransfer possible', function(done) {
      var listenerA, listenerB;

      function cleanUp() {
        elementA.removeEventListener('drag', listenerA);
        elementB.removeEventListener('drop', listenerB);
      }

      elementA.addEventListener('drag', listenerA = function(event) {
        event.dataTransfer.setData('test', { foo: 'bar' });
      });

      elementB.addEventListener('drop', listenerB = function(event) {
        var data = event.dataTransfer.getData('test');
        expect(data).to.eql({ foo: 'bar' });

        cleanUp();
        done();
      });

      action.dragStart(elementA).drop(elementB);
    });

  });
}());
