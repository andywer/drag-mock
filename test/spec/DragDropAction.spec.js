'use strict';

(function() {
  var DragDropAction = dragMock.DragDropAction;

  var elementA = document.querySelector('#dom-test > .a')
    , elementB = document.querySelector('#dom-test > .b');


  function expectEvents(domElement, eventNames, done) {
    var eventTriggered = {};
    var doneCalled = false;

    function allEventsTriggered() {
      eventNames.forEach(function(eventName) {
        if (!eventTriggered[eventName]) { return false; }
      });

      return true;
    }

    eventNames.forEach(function(eventName) {
      eventTriggered[eventName] = false;

      domElement.addEventListener(eventName, function() {
        eventTriggered[eventName] = true;

        if (allEventsTriggered() && !doneCalled) {
          doneCalled = true;
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

    });

    it('methods are chainable', function() {
      expect(action.dragStart(elementA)).to.be(action);
      expect(action.drop(elementA)).to.be(action);
    });

  });
}());
