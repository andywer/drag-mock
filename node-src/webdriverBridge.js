
var fs = require('fs');

var nextClientActionId = 1;

var exportMethods = ['dragStart', 'dragOver', 'dragLeave', 'drop', 'delay'];


// using this ugly hack, since selenium seems to not pass arguments given to the execute() method
function webdriverExecuteAsync(self, script, parameters, callback) {
  var parameterAssignments = '';

  for (var paramName in parameters) {
    var paramValue = parameters[paramName];
    parameterAssignments += 'var ' + paramName + ' = ' + JSON.stringify(paramValue) + ';';
  }

  var scriptBody =
    parameterAssignments +
    'return (' +
    script +
    ')();';

  this.webdriver.executeAsync(scriptBody, callback);
}


var DragMockClientActionBridge = function(webdriver, actionId) {
  this.webdriver = webdriver;
  this.actionId = actionId;
};


exportMethods.forEach(function(methodName) {
  DragMockClientActionBridge.prototype[methodName] = function() {
    var self = this;

    var args = Array.prototype.slice.call(arguments);
    var callback = function () {};

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    var browserScript = function(done) {
      // executed in browser context
      window._dragMockActions = window._dragMockActions || {};
      var action = window._dragMockActions[actionId] || dragMock;

      args[0] = document.querySelector(args[0]);
      var returnedAction = action[methodName].apply(action, args);

      window._dragMockActions[actionId] = returnedAction;

      returnedAction.then(done);
    };

    var parameters = {
      methodName: methodName,
      actionId: self.actionId,
      args: args
    };

    webdriverExecuteAsync(self, browserScript, parameters, function(err) {
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

  exportMethods.forEach(function(methodName) {
    webdriverPrototype[methodName] = createActionAndCallMethod(methodName);
  });
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
