(function() {
  'use strict';

  describe('drag-mock', function() {

    var elementA = document.querySelector('#dom-test > .a')
      , elementB = document.querySelector('#dom-test > .b')
      , elementC = document.querySelector('#dom-test > .c');

    it('can drag and drop', function(done) {

      var bListener, bDone = false
        , cListener, cDone = false
        , bTimeDropped, cTimeDropped;

      function listenersRun() {
        if (!(bDone && cDone)) { return; }

        expect(cTimeDropped - bTimeDropped).to.be.greaterThan(999);

        done();
      }

      function getMsTimestamp() {
        var now = new Date();

        return now.getTime() * 1000 + now.getMilliseconds();
      }

      elementB.addEventListener('drop', bListener = function(event) {
        expect(event.type).to.equal('drop');
        expect(event.clientX).to.equal(100);
        expect(event.clientY).to.equal(200);
        expect(event.dataTransfer.getData('text')).to.equal('Drop with care!');

        elementB.removeEventListener('drop', bListener);
        bTimeDropped = getMsTimestamp();

        bDone = true;
        listenersRun();
      });

      elementC.addEventListener('drop', cListener = function(event) {
        expect(event.type).to.equal('drop');
        expect(event.clientX).to.equal(500);
        expect(event.clientY).to.equal(400);
        expect(event.dataTransfer.getData('text')).to.equal('Drop with care!');

        elementC.removeEventListener('drop', cListener);

        var now = new Date();
        cTimeDropped = getMsTimestamp();

        cDone = true;
        listenersRun();
      });

      dragMock
        .dragStart(elementA, function(event) {
          event.dataTransfer.setData('text', 'Drop with care!');
        })
        .drop(elementB, { clientX: 100, clientY: 200 })
        .delay(1000)
        .drop(elementC, { clientX: 500, clientY: 400 });

    });

  });
}());
