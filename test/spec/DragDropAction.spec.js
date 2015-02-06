'use strict';

(function() {
  var DragDropAction = dragMock.DragDropAction;

  var elementA = document.querySelector('#dom-test > .a')
    , elementB = document.querySelector('#dom-test > .b');


  function expectEvents(domElement, eventNames, done, onEachEvent) {
    var eventTriggered = {}
      , eventListeners = {}
      , doneCalled = false;

    function allEventsTriggered() {
      var allTriggered = true;

      eventNames.forEach(function(eventName) {
        if (!eventTriggered[eventName]) { allTriggered = false; }
      });

      return allTriggered;
    }

    function cleanUp() {
      eventNames.forEach(function(eventName) {
        domElement.removeEventListener(eventName, eventListeners[eventName]);
      });
    }

    var timeOut = setTimeout(function() {
      if (!doneCalled) {
        var untriggeredEvents = [];

        eventNames.forEach(function(eventName) {
          if (!eventTriggered[eventName]) { untriggeredEvents.push(eventName); }
        });

        cleanUp();
        expect().fail('The following events have not been triggered: ' + untriggeredEvents.join(', '));
      }
    }, 1500);

    eventNames.forEach(function(eventName) {
      eventTriggered[eventName] = false;

      domElement.addEventListener(eventName, eventListeners[eventName] = function(event) {
        eventTriggered[eventName] = true;

        if (onEachEvent) { onEachEvent(event, domElement); }

        if (allEventsTriggered() && !doneCalled) {
          doneCalled = true;
          clearTimeout(timeOut);
          cleanUp();
          done();
        }
      });
    });
  }


  describe('DragDropAction', function() {
    var action;

    beforeEach(function() {
      action = new DragDropAction();
    });

    it('provides expected methods', function() {
      expect(action).to.be.a(DragDropAction);
      expect(action.dragStart).to.be.a(Function);
      expect(action.drop).to.be.a(Function);
    });

    describe('dragStart method', function() {

      it('throws error if called without valid targetElement', function() {
        expect(action.dragStart).withArgs(null).to.throwError(/Expected first parameter to be a targetElement/);
      });

      it('creates expected events', function(done) {
        expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done);

        action.dragStart(elementA);
      });

      it('creates events with given properties', function(done) {
        expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, { hello: 'world', foo: 'bar' });
      });

      it('customizes events using a custom callback', function(done) {
        expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, function(event) {
          event.hello = 'world';
          event.foo = 'bar';
        });
      });

      it('customizes events with given properties and using a custom callback', function(done) {
        expectEvents(elementA, ['mousedown', 'dragstart', 'drag'], done, function(event) {
          expect(event.hello).to.equal('world');
          expect(event.foo).to.equal('bar');
        });

        action.dragStart(elementA, { hello: 'world' }, function(event) {
          event.foo = 'bar';
        });
      });

    });

    describe('drop method', function() {

      it('creates expected events (without prior call to dragStart())', function(done) {
        expectEvents(elementA, ['mouseup', 'drop'], done);

        action.drop(elementA);
      });

      it('triggers a dragEnd event on the drag source', function(done) {
        expectEvents(elementA, ['dragend'], done);

        action.dragStart(elementA).drop(elementB);
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
