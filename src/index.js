
var DragDropAction = require('./DragDropAction');


function call(instance, methodName, args) {
  return instance[methodName].apply(instance, args);
}


var DragMock = {
  dragStart: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'dragStart', arguments);
  },
  drop: function(targetElement, eventProperties, configCallback) {
    return call(new DragDropAction(), 'drop', arguments);
  },

  // Just for unit testing:
  DataTransfer: require('./DataTransfer'),
  DragDropAction: require('./DragDropAction'),
  eventFactory: require('./eventFactory')
};

module.exports = DragMock;
