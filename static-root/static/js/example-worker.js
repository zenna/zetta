importScripts('zetta.js');
self.addEventListener('message', function(e) {
  self.postMessage(e.data);
}, false);

$.subscribe("/zetta/start", startComputations);

var startComputations = function() {
    // Let's do some computation;
}
