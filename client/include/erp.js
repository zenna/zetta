/**
 * @author Zenna Tavares : Elementary Random Primitives (ERPS)
 *
 */
// Bernoulli distribution
var flip = function(weight) {
    return Math.random() < weight ? true : false;
}

// Knuth method possion distribution
var poissionRnd = function(lambda) {
    var L = Math.exp(-lambda);
    var k = 0;
    var p = 1;
    do {
        k = k + 1;
        p = p * Math.random();
    } while (p > L);
    return k - 1;
}

// Gamma distribution
var gammaRnd = function() {
    var u = Math.random();
    var v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Return a random integer between 0 and n-1.
// n: the number of values possible
// Returns: an integer between 0 and n-1
var sampleInteger = function(n) {
    return Math.floor(Math.random() * n);
}

var randInteger = function(lowerBound, upperBound) {
    return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
}

// Return a random element from a list
var getRandomElement = function(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
};

// Stochastic if operator
var sIf = function(noiseLevel, predicate, consequent, alternate) {
    noisyPredicate = flip(noiseLevel) ? predicate : !predicate;
    if(noisyPredicate) {
        return consequent;
    }
    else {
        return alternate;
    }
}

// Use exp(probabilities)
var weightedExpSample = function(weightedArray) {
    var expArray = weightedArray.map(function(weight, index) {
        return Math.exp(weight);
    });

    return weightedSample(expArray);
}

// Samples from multinomial distribution
// args; weightedArray = list of weights e.g. [9.3,0.1,100]
// Returns index of list sampled according to weight
var weightedSample = function(weightedArray) {
    var totalReward = sum(weightedArray);
    indexedArray = weightedArray.map(function(weight, index, weightedArray) {
        return sum(weightedArray.slice(0, index + 1));
    });

    var randReal = Math.random() * totalReward;
    var randIndex = 0;
    for(var i = 0; i < indexedArray.length; ++i) {
        if(randReal <= indexedArray[i]) {
            return i;
        }
    }
    throw "Return not reached as index not found"
}

// ------ Stateful -----------------
var poissionRndSt = function(database, logLikelihood, lambda) {
    var currentParams = {
        type : 'poissionRnd',
        theta : arguments
    };

    var name = generateNameFromStackTrace();
    if( name in database && currentParams.type == dbParams.type) {
        dbParmas = database[name];
        if(currentParams.theta == dbParams.theta) {
            logLikelihood = logLikelihood + dbParams.logLikelihood
        }
        else {
            var l = Math.log(computeLikelihood());
            database.name.l = l;
            logLikelihood = logLikelihood + l;
        }
    }
    else {
    }

    var L = Math.exp(-lambda);
    var k = 0;
    var p = 1;
    do {
        k = k + 1;
        p = p * Math.random();
    } while (p > L);
    return k - 1;
}