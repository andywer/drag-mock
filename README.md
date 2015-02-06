# drag-mock
Trigger HTML5 drag &amp; drop events for testing

## Requirements

You won't need anything, but a plain website and an ES5 compatible browser (e.g. IE9+, Chrome, Firefox, ...).
No additional libraries required.


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

If you would like to set some properties on the event object you may pass an optional properties object as second
parameter:

```javascript
var dragStartElement = document.querySelector('.draggable');
var dropTargetElement = document.querySelector('.drop-target');

dragMock
  .dragStart(dragStartElement, { clientX: 300, clientY: 400 })
  .drop(dropTargetElement, { clientX: 200, clientY: 500 });
```

You can also customize the events by passing an optional callback function. The callback is called after creating the
event, but before dispatching it. If your callback takes less than two arguments then it will be called once for
the dragstart/drop event. It will be called for all events created if the callback takes two arguments:

```javascript
dragMock
  .dragStart(dragStartElement, function(event, eventName) {
    // will be called for all created events (mousedown, dragstart), because the callback takes two arguments
    dragStartEvent.dataTransfer.setData('application/json', { hello: 'world' });
  })
  .drop(dropTargetElement, function(dropEvent) {
    // a callback with less than two parameters will only be called once for the primary ('drop') event

    var data = dropEvent.dataTransfer.getData('application/json');
    console.log('Hello ' + data.hello);
  });
```

## License

This software is licensed under the terms of the MIT license. See LICENSE for details.
