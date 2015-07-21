(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var dragMock = require('./src/index.js');

if (typeof define === 'function') {
  define('dragMock', function() {
    return dragMock;
  });
}

window.dragMock = dragMock;

},{"./src/index.js":5}],2:[function(require,module,exports){

function removeFromArray(array, item) {
  var index = array.indexOf(item);

  if (index >= 0) {
    array.splice(index, 1);
  }
}


var DataTransfer = function() {
  this.dataByFormat = {};

  this.dropEffect = 'none';
  this.effectAllowed = 'all';
  this.files = [];
  this.types = [];
};

DataTransfer.prototype.clearData = function(dataFormat) {
  if (dataFormat) {
    delete this.dataByFormat[dataFormat];
    removeFromArray(this.types, dataFormat);
  } else {
    this.dataByFormat = {};
    this.types = [];
  }
};

DataTransfer.prototype.getData = function(dataFormat) {
  return this.dataByFormat[dataFormat];
};

DataTransfer.prototype.setData = function(dataFormat, data) {
  this.dataByFormat[dataFormat] = data;

  if (this.types.indexOf(dataFormat) < 0) {
    this.types.push(dataFormat);
  }

  return true;
};

DataTransfer.prototype.setDragImage = function() {
  // don't do anything (the stub just makes sure there is no error thrown if someone tries to call the method)
};

module.exports = DataTransfer;

},{}],3:[function(require,module,exports){

var eventFactory = require('./eventFactory')
  , DataTransfer = require('./DataTransfer');


function _noop() {}


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


function customizeEvent(event, configCallback, isPrimaryEvent) {
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
    var event = eventFactory.createEvent(eventName, eventProperties, dataTransfer);
    var isPrimaryEvent = eventName === primaryEventName;

    customizeEvent(event, configCallback, isPrimaryEvent);

    targetElement.dispatchEvent(event);
  });
}


var DragDropAction = function() {
  this.lastDragSource = null;
  this.lastDataTransfer = null;
  this.pendingActionsQueue = [];
};


DragDropAction.prototype._queue = function(fn) {
  this.pendingActionsQueue.push(fn);

  if (this.pendingActionsQueue.length === 1) {
    this._queueExecuteNext();
  }
};

DragDropAction.prototype._queueExecuteNext = function() {
  if (this.pendingActionsQueue.length === 0) { return; }

  var self = this;
  var firstPendingAction = this.pendingActionsQueue[0];

  var doneCallback = function() {
    self.pendingActionsQueue.shift();
    self._queueExecuteNext();
  };

  if (firstPendingAction.length === 0) {
    firstPendingAction.call(this);
    doneCallback();
  } else {
    firstPendingAction.call(this, doneCallback);
  }
};


DragDropAction.prototype.dragStart = function(targetElement, eventProperties, configCallback) {
  var params = parseParams(targetElement, eventProperties, configCallback)
    , events = ['mousedown', 'dragstart', 'drag']
    , dataTransfer = new DataTransfer();

  this._queue(function() {
    createAndDispatchEvents(params.targetElement, events, 'drag', dataTransfer, params.eventProperties, params.configCallback);

    this.lastDragSource = targetElement;
    this.lastDataTransfer = dataTransfer;
  });

  return this;
};


DragDropAction.prototype.dragEnter = function(overElement, eventProperties, configCallback) {
  var params = parseParams(overElement, eventProperties, configCallback)
    , events = ['mousemove', 'mouseover', 'dragenter'];

  this._queue(function() {
    createAndDispatchEvents(params.targetElement, events, 'dragenter', this.lastDataTransfer, params.eventProperties, params.configCallback);
  });

  return this;
};

DragDropAction.prototype.dragOver = function(overElement, eventProperties, configCallback) {
  var params = parseParams(overElement, eventProperties, configCallback)
    , events = ['mousemove', 'mouseover', 'dragover'];

  this._queue(function() {
    createAndDispatchEvents(params.targetElement, events, 'drag', this.lastDataTransfer, params.eventProperties, params.configCallback);
  });

  return this;
};

DragDropAction.prototype.dragLeave = function(overElement, eventProperties, configCallback) {
  var params = parseParams(overElement, eventProperties, configCallback)
    , events = ['mousemove', 'mouseover', 'dragleave'];

  this._queue(function() {
    createAndDispatchEvents(params.targetElement, events, 'dragleave', this.lastDataTransfer, params.eventProperties, params.configCallback);
  });

  return this;
};

DragDropAction.prototype.drop = function(targetElement, eventProperties, configCallback) {
  var params = parseParams(targetElement, eventProperties, configCallback);
  var eventsOnDropTarget = ['mousemove', 'mouseup', 'drop'];
  var eventsOnDragSource = ['dragend'];

  this._queue(function() {
    createAndDispatchEvents(params.targetElement, eventsOnDropTarget, 'drop', this.lastDataTransfer, params.eventProperties, params.configCallback);

    if (this.lastDragSource) {
      // trigger dragend event on last drag source element
      createAndDispatchEvents(this.lastDragSource, eventsOnDragSource, 'drop', this.lastDataTransfer, params.eventProperties, params.configCallback);
    }
  });

  return this;
};

DragDropAction.prototype.then = function(callback) {
  this._queue(function() { callback.call(this); });    // make sure _queue() is given a callback with no arguments

  return this;
};

DragDropAction.prototype.delay = function(waitingTimeMs) {
  this._queue(function(done) {
    window.setTimeout(done, waitingTimeMs);
  });

  return this;
};

module.exports = DragDropAction;

},{"./DataTransfer":2,"./eventFactory":4}],4:[function(require,module,exports){

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

},{"./DataTransfer":2}],5:[function(require,module,exports){

var DragDropAction = require('./DragDropAction');


function call(instance, methodName, args) {
  return instance[methodName].apply(instance, args);
}


var dragMock = {
  dragStart: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragStart', arguments);
  },
  dragEnter: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragEnter', arguments);
  },
  dragOver: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragOver', arguments);
  },
  dragLeave: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragLeave', arguments);
  },
  drop: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'drop', arguments);
  },
  delay: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'delay', arguments);
  },

  // Just for unit testing:
  DataTransfer: require('./DataTransfer'),
  DragDropAction: require('./DragDropAction'),
  eventFactory: require('./eventFactory')
};

module.exports = dragMock;

},{"./DataTransfer":2,"./DragDropAction":3,"./eventFactory":4}]},{},[1]);
