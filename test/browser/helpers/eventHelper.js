(function() {
  'use strict';

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


  window.EventHelper = {
    expectEvents: expectEvents
  };

}());
