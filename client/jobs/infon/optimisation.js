/**
 * @author Zenna Tavares
 */

var assessSpaceSlow = function(space) {
    var numInfons = space.getNumInfons();
    var infonsToUpdate = [], funcOutsToTest = [];
    for(var i = 0; i < numInfons; ++i) {
        var infon = space.getInfonFromId(i);
        if(inArray(infon.types, 'arg')) {
            infonsToUpdate.push(infon.id)
        }
        else if(inArray(infon.types, 'output')) {
            funcOutsToTest.push(infon.id)
        }
    }
    return assessSpace(space, infonsToUpdate, funcOutsToTest);
}

var assessSpace = function(space, infonsToUpdate, funcOutsToTest) {
    //Cool down
    var allArgs = updateInfonsFromDec(0, space, infonsToUpdate);
    var stable = stepUntilStable(space);
    var totalArgsLength = 0;

    for(var i = 0; i < allArgs.length; ++i) {
        totalArgsLength += allArgs[i].length;
    }

    // Exhaustively enumerate all combinations of input value
    var score = 0;
    for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
        var allArgs = updateInfonsFromDec(i, space, infonsToUpdate);

        var stableStep = stepUntilStable(space);
        if(stableStep[0]) {
            for(var j = 0; j < funcOutsToTest.length; ++j) {
                var infon = space.getInfonFromId(funcOutsToTest[j]);
                score += infon.out(infon.getCurrentBody(), allArgs)[0];
            }
        }
    }
    return score;
}

// Randomly generate infons to recreate some function
var optimiseRandomly = function(argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal, successCallback) {
    zetta.log("optimising");
    var numTries = 1000;
    var winners = [];
    for(var attempt = 0; attempt < numTries; ++attempt) {
        var moon = new Space();
        var spaceT = createRandomSpaceWithFunc(argLengths, outLengths, funcOuts, getRandomElement(infonSizeRange), getRandomElement(infonCountRange), false);
        createRandomEdges(spaceT.space, 0.8, 0.8);
        var score = assessSpace(spaceT.space, spaceT.argIds, spaceT.outputIds);
        if(score >= scoreGoal) {
            zetta.log("winner");
            winners.push(spaceT.space);
            if(winners.length === 10) {
                successCallback(winners);
                return;
            }
        }
    }
    if(winners.length < 1) {
        setTimeout(optimiseRandomly, 100, argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal, successCallback);
    }
    else {
        successCallback(winners);
    }
};

var createSpaceFromBasicFuncs = function(basicFuncs) {
    var space = new Space();    
    for(var i = 0; i < basicFuncs.length; ++i) {
        for(var j = 0; j < basicFuncs[i].inputLengths; ++j) {
            var infon = new Infon(zeroBitString(basicFuncs[i].inputLengths[j]));
            infon.types.push('input');
            space.addInfon(infon);
        }
        space.addCallOnSpec(basicFuncs[i].inputFuncs);

        for(var j = 0; j < basicFuncs[i].outputLengths; ++j) {
            var infon = new Infon(zeroBitString(basicFuncs[i].outputLengths[j]));
            infon.types.push('output');
            infon.outputFunc = basicFuncs[i].outputFunc[j];
            space.addInfon(infon);
        }
    }
    return space;
};

var initialiseSpace = function(basicFuncs,  initialModules, infonSizeRange, numInfons) {
    var universe = createSpaceFromBasicFuncs(basicFuncs);
    for(var i = 0; i < initialMolcules.length; ++i) {
        universe.appendSpace( initialModules);
    };

    // Create extra space to fill quota of infons
    var extraSpace = new Space();
    var sizeDebt = numInfons - universe.getNumInfons();
    for(var i = 0; i < sizeDebt; ++i) {
        var randomInfon = createRandomInfon(getRandomElement(infonSizeRange));
        space.addInfon(randomInfon);
    }
    createRandomEdges(extraSpace, 0.5, 0.5);
    universe.appendSpace(extraSpace);
    return universe;
};

var optimiseSimulatedAnnealing = function(basicFuncs, initialModules, infonSizeRange, numInfons, successCallback) {
    var universe = initialiseSpace(basicFuncs, initialModules, infonSizeRange, numInfons);
    var numCycles = 10, stepsPerCycle = 100000;
    var tempMin = 0, tempMax = 1000;
    var mostStable = [];
    for(var i = 0; i < numCycles; ++i) {
        console.log("starting cycle:", i);
        for(var j = 0; j < stepsPerCycle; ++j) {
            // Temperature varies sinusoidally between tempMax and tempMin
            var temperature = Math.cos(j / stepsPerCycle * Math.PI * 2);
            temperature = scaleLinearly(temperature, -1, 1, tempMin, tempMax);
            space.doStep();
            doCollisions(space, temperature);
            // Update Most stable
        }
        successCallback(mostStable);
    }
};

var scaleLinearly = function(value, domainMin, domainMax, rangeMin, rangeMax) {
    var domainRange = domainMax - domainMin;
    var rangeRange = rangeMax - rangeMin;
    return (value - domainMin) / (domainMax - domainMin) * (rangeMax - rangeMin) + rangeMin;
};

// Colliside infons
var doCollisions = function(space, temperature) {
    var computeReactionProbability = function(moduleA, moduleB, volume, temperature) {
        var BOLTZMAN_CONSTANT = 3.2;
        var collisionProb = 1 / volume * Math.PI * (infonA.getLength() + infonB.getLength()) * Math.sqrt(8 * BOLTZMAN_CONSTANT * temperature / Math.pi * velocity);
        var collisionEnergy = Math.exp(-energy / (BOLTZMAN_CONSTANT * T));
        return collisionProb * collisionEnergy;
    }
    
    // MoC specific
    var doReaction = function(space, moduleA, moduleB) {  
        var infon = flip(0.5) ? getRandomElement(moduleA) : getRandomElement(moduleB);
        var predecessors = space.getPredecessors(infon);
        if (predecessors.length > 0) {
            var randomPredecessor = getRandomElement(predecessors);
            space.removeEdge(infon.id, randomPredecessor.sourceId);
        }
    };

    var volume = space.getSize();
    var numModules = space.getNumModules();
    for(var i = 0; i < numModules; ++i) {
        var moduleA = space.getModuleFromId(i);
        for(var j = i; ++j != numMolecules; ) {
            var moduleB = space.getModuleFromId(j);
            var reactionProbability = computeReactionProbability(moduleA, moduleB, volume, temperature);
            var willReact = Math.random() < reactionProbability ? true : false;
            if(willReact) {
                doReaction(space, moduleA, moduleB);
            }
        }
    }
};

// 
var optimiseSomething = function() {
    // List of functions in space which may form useful subcomponents
    // Analgous to the function set in genetic programming
    var basicFuncs = [{
        name : 'and',
        inFuncs : enumAllInputs([1, 1]),
        inLengths : [1, 1],
        outFuncs : function(myValue, args) {
            return myValue[0] === (args[1][0] && args[0][0]) ? [1] : [0];
        },

        outLengths : [1]
    }];
    var  initialModules = [];
    var infonSizeRange = range(1, 9);
    var numInfons = 100;
    optimiseSimulatedAnnealing(basicFuncs,  initialModules, infonSizeRange, numInfons, drawWinners);
};
