
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
