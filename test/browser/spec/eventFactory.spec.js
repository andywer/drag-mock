(function() {
  'use strict';

  var eventFactory = dragMock.eventFactory
    , DataTransfer = dragMock.DataTransfer;

  describe('Event factory', function() {

    it('has a createEvent method', function() {
      expect(eventFactory.createEvent).to.be.a(Function);
    });

    it('createEvent method produces valid MouseEvents', function() {
      var mouseDownEvent = eventFactory.createEvent('mousedown');

      expect(mouseDownEvent.type).to.equal('mousedown');
    });

    it('createEvent method produces valid DragEvents', function() {
      var dragStartEvent = eventFactory.createEvent('dragstart');

      expect(dragStartEvent).to.be.a(Event);
      expect(dragStartEvent.type).to.equal('dragstart');
    });

    it('createEvent method produces events with dataTransfer objects', function() {
      ['drag', 'dragstart', 'dragenter', 'dragover', 'dragend', 'drop', 'dragleave'].forEach(function(eventName) {
        var event = eventFactory.createEvent(eventName);
        expect(event.dataTransfer).to.be.a(DataTransfer);
      });
    });

    it('createEvent method allows reusing dataTransfer objects', function() {
      var dragEvent = eventFactory.createEvent('drag');
      var dropEvent = eventFactory.createEvent('drop', {}, dragEvent.dataTransfer);

      expect(dropEvent.dataTransfer).to.equal(dragEvent.dataTransfer);
    });

  });
}());
