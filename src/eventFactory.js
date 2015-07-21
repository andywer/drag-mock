
var DataTransfer = require('./DataTransfer');

var dataTransferEvents = ['drag', 'dragstart', 'dragenter', 'dragover', 'dragend', 'drop', 'dragleave'];


function mergeInto(destObj, srcObj) {
  for (var key in srcObj) {
    if (!srcObj.hasOwnProperty(key)) { continue; }   // ignore inherited properties

    destObj[key] = srcObj[key];
  }

  return destObj;
}


function createModernEvent(eventName, eventType, eventProperties) {
  if (eventType === 'DragEvent') { eventType = 'CustomEvent'; }     // Firefox fix (since FF does not allow us to override dataTransfer)

  var constructor = window[eventType];
  var options = { view: window, bubbles: true, cancelable: true };

  mergeInto(options, eventProperties);

  var event = new constructor(eventName, options);

  mergeInto(event, eventProperties);

  return event;
}


function createLegacyEvent(eventName, eventType, eventProperties) {
  var event;

  switch (eventType) {
    case 'MouseEvent':
      event = document.createEvent('MouseEvent');
      event.initEvent(eventName, true, true);
      break;

    default:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, 0);
  }

  // copy eventProperties into event
  if (eventProperties) {
    mergeInto(event, eventProperties);
  }

  return event;
}


function createEvent(eventName, eventType, eventProperties) {
  try {
    return createModernEvent(eventName, eventType, eventProperties);
  } catch (error) {
    return createLegacyEvent(eventName, eventType, eventProperties);
  }
}


var EventFactory = {
  createEvent: function(eventName, eventProperties, dataTransfer) {
    var eventType = 'CustomEvent';

    if (eventName.match(/^mouse/)) {
      eventType = 'MouseEvent';
    }

    var event = createEvent(eventName, eventType, eventProperties);

    if (dataTransferEvents.indexOf(eventName) > -1) {
      event.dataTransfer = dataTransfer || new DataTransfer();
    }

    return event;
  }
};

module.exports = EventFactory;
