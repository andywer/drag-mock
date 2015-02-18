
var dragMock = require('./src/index.js');

if (typeof define === 'function') {
  define('dragMock', function() {
    return dragMock;
  });
}

window.dragMock = dragMock;
