//importScripts('zetta.js');
self.addEventListener('message', function(e) {
    self.postMessage("I'M WORKING");
}, false);

// $.subscribe("/zetta/start", startComputations);

//dtf[b_, p_] := Sum[StirlingS2[2^(b*p), i], {i, 2^b}]

var startComputations = function() {
    // Let's go!
    
}

var resumeComputations = function() {
    // Let's do some computation;
}