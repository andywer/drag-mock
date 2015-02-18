
var DataTransfer = require('./DataTransfer');

var dataTransferEvents = ['drag', 'dragstart', 'dragend', 'drop'];


var EventFactory = {
  createEvent: function(eventName, dataTransfer) {
    var event = document.createEvent('CustomEvent');

    event.initCustomEvent(eventName, true, true, 0);

    if (dataTransferEvents.indexOf(eventName) > -1) {
      event.dataTransfer = dataTransfer || new DataTransfer();
    }

    return event;
  }
};

module.exports = EventFactory;
