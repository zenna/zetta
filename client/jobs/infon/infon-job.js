importScripts('../../api/zetta-api.js');
importScripts('infon.js');
importScripts('funcs.js');
importScripts('helpers.js');

var startComputations = function() {
    findAnd(postWinners);
}

var resumeComputations = function() {
    // Let's do some computation;
}

var postWinners = function(winners) {
    for(var i = 0; i < winners.length; ++i) {
        self.postMessage(winners[i].getNumInfons());
    }
}

self.addEventListener('zetta/start', (function(x) {
    return function() {
        self.postMessage(x);
        finsdAnd(x);
    }
})(postWinners), false);

// :et's try two types of edge!