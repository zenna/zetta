importScripts('zettaa-api.js');
importScripts('infon.js');

var startComputations = function() {
    // Let's go!
}

var resumeComputations = function() {
    // Let's do some computation;
}

worker.addEventListener('zetta/start', function() {
    findAnd();
}, false);
