
var fs = require('fs');


var EXPORT_METHODS = ['dragStart', 'dragEnter', 'dragOver', 'dragLeave', 'drop', 'delay'];
var WEBDRIVER_ASYNC_EXEC_TIMEOUT = 2000;

var nextClientActionId = 1;


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
    ')(done);';

  self.webdriver
    .timeoutsAsyncScript(WEBDRIVER_ASYNC_EXEC_TIMEOUT)
    .executeAsync(new Function('done', scriptBody))
    .then(function(output) {
        callback(output)
    })
}


var DragMockClientActionBridge = function(webdriver, actionId) {
  this.webdriver = webdriver;
  this.actionId = actionId;
};


EXPORT_METHODS.forEach(function(methodName) {
  DragMockClientActionBridge.prototype[methodName] = function() {
    var self = this;

    var args = Array.prototype.slice.call(arguments);
    var callback = function () {};

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    var browserScript = function(done) {

      var findElement = function(selector) {
        var result;
        if (stringStartsWithOneOf(selector, ['/', '(', '../', './', '*/'])) {
          result = document
            .evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue;
        } else {
          result = document.querySelector(selector);
        }
        if (!result) {
          throw new Error('Cannot find element with selector: "' + selector + '"');
        }
        return result;
      };

      var stringStartsWithOneOf = function(string, prefixArray) {
        return prefixArray.some(function(prefix) {
          return string.indexOf(prefix) === 0;
        });
      };

      // executed in browser context
      window._dragMockActions = window._dragMockActions || {};
      var action = window._dragMockActions[actionId] || dragMock;

      if (stringStartsWithOneOf(methodName, ['drag', 'drop'])) {
        // first argument is element selector
        args[0] = findElement(args[0]);
      }
      action = action[methodName].apply(action, args);

      window._dragMockActions[actionId] = action;
      action.then(done);
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

  EXPORT_METHODS.forEach(function(methodName) {
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
