# drag-mock
Trigger HTML5 drag &amp; drop events for testing

## Setup

### Browser

TODO (plain or as AMD module)

### Node / Webpack

Install using

```bash
npm install drag-mock --save-dev
```

and require it in your code

```javascript
var dragMock = require('drag-mock');
```


## Usage

```javascript
var dragStartElement = document.querySelector('.draggable');
var dropTargetElement = document.querySelector('.drop-target');

dragMock
  .dragStart(dragStartElement)
  .drop(dropTargetElement);
```

## License

This software is licensed under the terms of the MIT license. See LICENSE for details.
