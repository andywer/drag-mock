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

},{"./DataTransfer":2,"./eventFactory":4}],4:[function(require,module,exports){

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

},{"./DataTransfer":2}],5:[function(require,module,exports){

var DragDropAction = require('./DragDropAction')
  , webdriverBridge = require('./webdriverBridge');


function call(instance, methodName, args) {
  return instance[methodName].apply(instance, args);
}


var dragMock = {
  dragStart: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragStart', arguments);
  },
  drop: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'drop', arguments);
  },

  extendWebdriver: function(webdriver) {
    webdriverBridge.init(webdriver);
  },

  // Just for unit testing:
  DataTransfer: require('./DataTransfer'),
  DragDropAction: require('./DragDropAction'),
  eventFactory: require('./eventFactory')
};

module.exports = dragMock;

},{"./DataTransfer":2,"./DragDropAction":3,"./eventFactory":4,"./webdriverBridge":6}],6:[function(require,module,exports){

var nextClientActionId = 1;


var DragMockClientActionBridge = function(webdriver, actionId) {
  this.webdriver = webdriver;
  this.actionId = actionId;
};

['dragStart', 'drop'].forEach(function(methodName) {
  DragMockClientActionBridge.prototype[methodName] = function() {
    var self = this;

    var args = Array.prototype.slice.call(arguments);
    var callback = function () {};

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    var browserScript = function() {
      // executed in browser context
      window._dragMockActions = window._dragMockActions || {};
      var action = window._dragMockActions[actionId] || dragMock;

      args[0] = document.querySelector(args[0]);
      var returnedAction = action[methodName].apply(action, args);

      window._dragMockActions[actionId] = returnedAction;

      return returnedAction;
    };

    // using this ugly hack, since selenium seems to not pass arguments given to the execute() method
    var script =
      'var methodName = ' + JSON.stringify(methodName) + ';' +
      'var actionId = ' + JSON.stringify(self.actionId) + ';' +
      'var args = ' + JSON.stringify(args) + ';' +
      'return (' +
      browserScript +
      ')();';

    this.webdriver.execute(
      script, function(err) {
        // back in node.js context
        callback(err, self);
      });

    return self;
  };
});


function extendWebdriverPrototype(webdriverPrototype) {
  webdriverPrototype.dragStart = function() {
    var clientAction = new DragMockClientActionBridge(this, nextClientActionId++);

    clientAction.dragStart.apply(clientAction, arguments);

    return clientAction;
  };

  webdriverPrototype.drop = function() {
    var clientAction = new DragMockClientActionBridge(this, nextClientActionId++);

    clientAction.drop.apply(clientAction, arguments);

    return clientAction;
  };
}

function extendWebdriverFactory(webdriver) {
  var originalMethod = webdriver.remote;

  webdriver.remote = function() {
    var instance = originalMethod.apply(webdriver, arguments);

    extendWebdriverPrototype(instance.constructor.prototype);
    return instance;
  }
}

var webdriverBridge = {
  init: function(webdriver) {
    if (webdriver.version && webdriver.remote) {
      extendWebdriverFactory(webdriver);
    } else {
      extendWebdriverPrototype(webdriver.constructor.prototype);
    }
  }
};

module.exports = webdriverBridge;

},{}]},{},[1]);
