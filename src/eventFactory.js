
var DataTransfer = require('./DataTransfer');

var dataTransferEvents = ['drag', 'dragstart', 'dragend', 'drop'];


function createEvent(eventName, eventType, dataTransfer) {
  var event = document.createEvent(eventType);

  event.initEvent(eventName, true, true);

  if (dataTransferEvents.indexOf(eventName) > -1) {
    event.dataTransfer = dataTransfer || new DataTransfer();
  }

  return event;
}


var EventFactory = {
  createEvent: function(eventName, dataTransfer) {
    var eventType = 'Event';

    if (eventName.substr(0, 5) === 'mouse') {
      eventType = 'MouseEvent';
    } else if (eventName.substr(0, 4) === 'drag' && window.DragEvent) {
      eventType = 'DragEvent';
    }

    return createEvent(eventName, eventType, dataTransfer);
  }
};

module.exports = EventFactory;
