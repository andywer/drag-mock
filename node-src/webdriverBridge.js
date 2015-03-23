
var fs = require('fs');

var nextClientActionId = 1;


var DragMockClientActionBridge = function(webdriver, actionId) {
  this.webdriver = webdriver;
  this.actionId = actionId;
};

['dragStart', 'dragOver', 'dragLeave', 'drop'].forEach(function(methodName) {
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
  function createActionAndCallMethod(methodName) {
    return function() {
      var clientAction = new DragMockClientActionBridge(this, nextClientActionId++);

      clientAction[methodName].apply(clientAction, arguments);

      return clientAction;
    };
  }

  webdriverPrototype.dragStart = createActionAndCallMethod('dragStart');
  webdriverPrototype.dragOver = createActionAndCallMethod('dragOver');
  webdriverPrototype.dragLeave = createActionAndCallMethod('dragLeave');
  webdriverPrototype.drop = createActionAndCallMethod('drop');
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
  },

  loadLibrary: function(webdriver, done) {
    var dragMockLib = fs.readFileSync(__dirname + '/../dist/drag-mock.js', { encoding: 'utf-8' });

    webdriver.execute(dragMockLib, function (error) {
      if (typeof done === 'function') { done(error); }
    });
  }

};

module.exports = webdriverBridge;
