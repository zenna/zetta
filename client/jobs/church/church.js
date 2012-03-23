// Query Implmentations  -------------------------------------------------------

// Rejection sampling based query
var query = function(expression, predicate) {
    var val = eval(expression);
    // or = expression() return [a,b,c], how to get a,b,c
    if(predicate(val) === true) {
        return val;
    }
    else {
        return query(expression, predicate);
    }
}

// Lexicalised sampling based query
var lexQuery = function(lexicons, expression, predicate) {
    var evaluatedLexicons = [];
    for(var i = 0; i < lexicons.length; ++i) {
        evaluatedLexicons[i] = lexicons[i]();
    }
    var val = expression.apply(this, evaluatedLexicons);
    if(predicate.apply(this, val) === true) {
        return val;
    }
    else {
        return lexQuery(lexicons, expression, predicate);
    }
}

// Helpers  -------------------------------------------------------------------

// Take a jsExpr, run it and return the result
var runJsExpr = function(jsExpr) {
    var program = new Program();
    program.jsExpr = jsExpr;
    program.compile();
    return program.program();
}

// Reepats expression numTimes times and returns list of results
var repeat = function(expression, numTimes) {
    var results = [];
    for(var i = 0; i < numTimes; ++i) {
        results.push(expression());
    }
    return results;
}

// Create histogram from list of values
// (e.g. [true,true,true,false] => {true:3,false:1})
var hist = function(list) {
    var histogram = {};
    for(var i = 0; i < list.length; ++i) {
        if(list[i] in hist) {
            histogram[list[i]] += 1;
        }
        else {
            histogram[list[i]] = 1;
        }
    }
    return histogram;
}

// Examples  -------------------------------------------------------------------

var pairFlip = function() {
    return query("[flip(), flip()]", function(pair) {
        return ((pair[0] === true) || (pair[1] == true)) ? true : false;
    });

}

var abcCoinFlip = function() {
    return lexQuery([
    function() {
        return flip(0.5);
    },

    function() {
        return flip(0.5);
    },

    function() {
        return flip(0.5);
    }], function(a, b, c) {
        return [a, b, c];
    }, function(a, b, c) {
        return (c || (a && (!b))) ? true : false
    })

}

var genExp = function() {
    if(flip(0.4)) {
        return [flip(0.5) ? ["add", 2] : ["minus", 2]].concat(genExp(), genExp());
    }
    else {
        return [[1 + sampleInteger(10), -1]];
    }
}

// Bher
var sampleProgram = function(database, logLikelihood) {
    var m = poissionRnd(database, logLikelihood, 3.);
    var X = [];
    for(var i = 0; i < m; ++i) {
        x[i] = gammaRnd();
    }
    for(var i = m; i < 2 * m; ++i) {
        x[i] = normalRnd();
    }
}

var traceMetroplisHastings = function(program, numIterations) {
    var initialOptions = {
        databse : {},
        logLikelihood : 0.0
    };
    traceOptions = traceUpdate(initialOptions, program);

    for(var i = 0; i < numIterations; ++i) {
        var randErpIndex = randomInteger(0, traceOptions.database.length - 1);
        var randomErp = traceOptions.database;
        //TODO
        // Sample a new value of x under a proposal
        // Compute probability of going from x to x'
        // Compute inverse probability
        // Compute likelihood of x'
        newTraceOptions = traceOptions;
        newTraceOptions.dictionary[name].x = xPrime;
        newTraceOptions.dictionary[name].logLikelihood = logLikelihoodPrime;
        newDictionary = traceOptions.dictionary.copy();
        if(Math.log(Math.random()) < newOptions.logLikelihood - traceOptions.logLikelihood + R - F) {
            traceOptions = newTraceOptions;
        }
        // Record samples
    }
}

var traceUpdate = function(traceOptions, program) {
    traceOptions.loglikelihood = 0.0;
    var database = traceOptions.database;
    program.call(database);
}

// This will generate a random program
// Evaluate it
// If its score = 24, it will return the expression
// Otherwise it will try again
// Given some stochastic process of generating programs,
// this method essentially samples from this process until a program is generated
// which produces a particular output
// It is akin to in a GP system, generating random programs until one has the
// lowest possible cost
var inductProgram = function() {
    return lexQuery([
    function() {
        return genExp()
    }], function(exp) {
        return [exp]
    }, function(exp) {
        return runJsExpr(exp) == 24
    })

}

//
// (lex-query ’((exp (gen-exp))) ’exp
// ’(begin (equal? (eval exp (get-current-environment)) 24) )
//
// var results = repeat(abcCoinFlip, 100);
// var histogram = hist(results);
//
// var resultsInduction = repeat(inductProgram, 100);
// var histogramInduction = hist(resultsInduction);