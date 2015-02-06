
// uses event constructors
var ModernEventFactory = {
  createEvent: function(eventName, eventType) {
    var constructor = window[eventType];

    return new constructor(eventName, {
      view: window,
      bubbles: true,
      cancelable: true
    });
  }
};

// uses document.createEvent()
var FallbackEventFactory = {
  createEvent: function(eventName, eventType) {
    var event = document.createEvent(eventType);

    event.initEvent(eventName, true, true);

    return event;
  }
};

if (document.implementation.hasFeature('MouseEvent', '4.0')) {
  module.exports = ModernEventFactory;
} else {
  module.exports = FallbackEventFactory;
}
