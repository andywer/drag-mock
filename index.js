
var dragMock = require('./src')
  , webdriverBridge = require('./node-src/webdriverBridge');


/**
 * Extends the webdriver.io factory or instance with dragStart() & drop() methods.
 * @param {object}    webdriver
 */
dragMock.extendWebdriver = function(webdriver) {
  return webdriverBridge.init(webdriver);
};

/**
 * Loads the library into a browser context using a webdriver.io instance.
 * @param {object}    webdriver
 * @param {function}  [done]      Optional callback: done({object|null} error)
 */
dragMock.loadLibrary = function(webdriver, done) {
  return webdriverBridge.loadLibrary(webdriver, done);
};


module.exports = dragMock;
