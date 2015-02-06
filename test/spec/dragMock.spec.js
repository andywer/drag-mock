'use strict';

(function() {
  describe('drag-mock', function() {

    var DragDropAction = dragMock.DragDropAction;

    var elementA = document.querySelector('#dom-test > .a')
      , elementB = document.querySelector('#dom-test > .b');

    it('can drag and drop', function(done) {

      var dropListener;

      elementB.addEventListener('drop', dropListener = function(event) {
        expect(event.type).to.equal('drop');
        expect(event.clientX).to.equal(100);
        expect(event.clientY).to.equal(200);
        expect(event.dataTransfer.getData('text')).to.equal('Drop with care!');

        elementB.removeEventListener('drop', dropListener);
        done();
      });

      dragMock
        .dragStart(elementA, function(event) {
          event.dataTransfer.setData('text', 'Drop with care!');
        })
        .drop(elementB, { clientX: 100, clientY: 200 });

    });

  });
}());
