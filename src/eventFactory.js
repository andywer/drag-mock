
function createEvent(eventName, eventType) {
  var event = document.createEvent(eventType);

  event.initEvent(eventName, true, true);

  return event;
}


var EventFactory = {
  createEvent: function(eventName) {
    var eventType = 'Event';

    if (eventName.substr(0, 5) === 'mouse') {
      eventType = 'MouseEvent';
    } else if (eventName.substr(0, 4) === 'drag' && window.DragEvent) {
      eventType = 'DragEvent';
    }

    return createEvent(eventName, eventType);
  }
};

module.exports = EventFactory;
