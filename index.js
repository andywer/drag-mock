
var dragMock = require('./src')
  , fs = require('fs')
  , webdriverBridge = require('./node-src/webdriverBridge');


/**
 * Extends the webdriver.io factory or instance with dragStart() & drop() methods.
 * @param {object}    webdriver
 */
dragMock.extendWebdriver = function(webdriver) {
  webdriverBridge.init(webdriver);
};

/**
 * Loads the library into a browser context using a webdriver.io instance.
 * @param {object}    webdriver
 * @param {function}  [done]      Optional callback: done({object|null} error)
 */
dragMock.loadLibrary = function(webdriver, done) {
  var dragMockLib = fs.readFileSync(__dirname + '/dist/drag-mock.js', { encoding: 'utf-8' });

  webdriver.execute(dragMockLib, function (error) {
    if (typeof done === 'function') { done(error); }
  });
};


module.exports = dragMock;
