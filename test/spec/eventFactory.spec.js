'use strict';

(function() {
  var eventFactory = dragMock.eventFactory;

  describe('Event factory', function() {

    it('has a createEvent method', function() {
      expect(eventFactory.createEvent).to.be.a(Function);
    });

    it('createEvent method produces valid MouseEvents', function() {
      var mouseDownEvent = eventFactory.createEvent('mousedown');

      expect(mouseDownEvent).to.be.a(MouseEvent);
      expect(mouseDownEvent.type).to.equal('mousedown');
    });

    it('createEvent method produces valid DragEvents', function() {
      var dragStartEvent = eventFactory.createEvent('dragstart');

      expect(dragStartEvent).to.be.a(Event);
      expect(dragStartEvent.type).to.equal('dragstart');
    });

  });
}());
