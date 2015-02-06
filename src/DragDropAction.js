
var eventFactory = require('./eventFactory')
  , DataTransfer = require('./DataTransfer');


function _noop() {}


function mergeInto(destObj, srcObj) {
  for (var key in srcObj) {
    if (!srcObj.hasOwnProperty(key)) { continue; }   // ignore inherited properties

    destObj[key] = srcObj[key];
  }

  return destObj;
}


function parseParams(targetElement, eventProperties, configCallback) {
  if (typeof eventProperties === 'function') {
    configCallback = eventProperties;
    eventProperties = null;
  }

  if (!targetElement || typeof targetElement !== 'object') {
    throw new Error('Expected first parameter to be a targetElement. Instead got: ' + targetElement);
  }

  return {
    targetElement: targetElement,
    eventProperties: eventProperties || {},
    configCallback: configCallback || _noop
  };
}


function customizeEvent(event, eventProperties, configCallback, isPrimaryEvent) {
  // copy eventProperties into event
  if (eventProperties) {
    mergeInto(event, eventProperties);
  }

  if (configCallback) {
    // call configCallback only for the primary event if the callback takes less than two arguments
    if (configCallback.length < 2) {
      if (isPrimaryEvent) { configCallback(event); }
    }
    // call configCallback for each event if the callback takes two arguments
    else {
      configCallback(event, event.type);
    }
  }
}


function createAndDispatchEvents(targetElement, eventNames, primaryEventName, dataTransfer, eventProperties, configCallback) {
  eventNames.forEach(function(eventName) {
    var event = eventFactory.createEvent(eventName, dataTransfer);
    var isPrimaryEvent = eventName === primaryEventName;

    customizeEvent(event, eventProperties, configCallback, isPrimaryEvent);

    targetElement.dispatchEvent(event);
  });
}


var DragDropAction = function() {
  this.lastDragSource = null;
  this.lastDataTransfer = null;
};


DragDropAction.prototype.dragStart = function(targetElement, eventProperties, configCallback) {
  var params = parseParams(targetElement, eventProperties, configCallback)
    , events = ['mousedown', 'dragstart', 'drag']
    , dataTransfer = new DataTransfer();

  createAndDispatchEvents(params.targetElement, events, 'drag', dataTransfer, params.eventProperties, params.configCallback);

  this.lastDragSource = targetElement;
  this.lastDataTransfer = dataTransfer;

  return this;
};


DragDropAction.prototype.drop = function(targetElement, eventProperties, configCallback) {
  var params = parseParams(targetElement, eventProperties, configCallback);
  var events = ['mouseup', 'drop'];

  createAndDispatchEvents(params.targetElement, events, 'drop', this.lastDataTransfer, params.eventProperties, params.configCallback);

  if (this.lastDragSource) {
    // trigger dragend event on last drag source element
    createAndDispatchEvents(this.lastDragSource, ['dragend'], 'drop', this.lastDataTransfer, params.eventProperties, params.configCallback);
  }

  return this;
};

module.exports = DragDropAction;
