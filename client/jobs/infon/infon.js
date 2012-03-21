/**
 * @author Zenna Tavares
 */

var Infon = function(bitString) {
    this.length = bitString.length;
    this.permBody = bitString;
    this.currentBody = bitString;
    this.types = [];

    this.getLength = function() {
        return this.length;
    };


    this.getCurrentBody = function() {
        return this.currentBody;
    };


    this.updateCurrentBody = function() {
        this.currentBody = this.tempBody;
    };


    this.updatePermBody = function(bitString) {
        this.permBody = bitString;
        this.currentBody = bitString;
    }


    this.getPermBody = function() {
        return this.permBody;
    }

};

var Space = function() {
    this.infons = [];
    this.edges = [];
    this.numEdges = 0;
    this.temperature = 0;
    this.simulating = false;

    this.addInfon = function(infon) {
        infon.id = this.infons.length;
        this.infons.push(infon);
        this.edges.push([]);
        return infon.id;
    };


    this.addEdge = function(infonA, infonB) {
        this.edges[infonA.id].push(infonB.id);
        this.numEdges += 1
    };


    this.addEdgeFromId = function(infonAId, infonBId) {
        this.edges[infonAId].push(infonBId);
        this.numEdges += 1
    }


    this.getNumEdges = function() {
        return this.numEdges;
    };


    this.numOutEdgesFromId = function(infonId) {
        return this.edges[infonId].length;
    };


    this.getOutInfonsFromId = function(infonId) {
        return this.edges[infonId];
    };


    this.getNumInfons = function() {
        return this.infons.length;
    };


    this.getInfonFromId = function(infonId) {
        return this.infons[infonId];
    };


    this.appendSpace = function(space) {
        var idMapping = {};
        var numInfons = space.getNumInfons();
        var displacement = this.getNumInfons();
        for(var i = 0; i < numInfons; ++i) {
            var toAdd = space.getInfonFromId(i);
            var newInfonId = this.addInfon(toAdd);
            var edges = space.getOutInfonsFromId(i);
            this.edges[i] = edges.map(function(value) {
                return value + displacement;
            });

            idMapping[i] = newInfonId;
        }
        return idMapping;
    }

};

// Simulation step
var doStep = function(space) {
    var toUpdate = [];
    for(var i = 0; i < space.getNumInfons(); ++i) {
        var currentInfon = space.getInfonFromId(i);
        var outInfonIds = space.getOutInfonsFromId(i);
        if(outInfonIds.length > 0) {
            var bitString = [];
            for(var j = 0; j < outInfonIds.length; ++j) {
                var outInfonBits = space.getInfonFromId(outInfonIds[j]).getCurrentBody();
                bitString = bitString.concat(outInfonBits);
            }
            currentInfon.tempBody = hokum(bitString, currentInfon.getPermBody(), currentInfon.getLength());
            toUpdate.push(i);
        }
    }
    var actuallyUpdated = 0;
    for(var i = 0; i < toUpdate.length; ++i) {
        var currentInfon = space.getInfonFromId(toUpdate[i]);
        if(currentInfon.getCurrentBody() + "" !== currentInfon.tempBody + "") {
            actuallyUpdated += 1
        }
        currentInfon.updateCurrentBody(currentInfon.tempBody);
    }
    return actuallyUpdated;
}

var updateInfonsFromDec = function(dec, space, infonsToUpdate) {
    var argLengths = [], allArgs = [];
    var totalArgLength = 0;
    for(var i = 0; i < infonsToUpdate.length; ++i) {
        var infon = space.getInfonFromId(infonsToUpdate[i]);
        argLengths.push(infon.getLength());
        totalArgLength += argLengths[i];
    }
    var unslicedArgs = decToBitString(dec, totalArgLength);
    if(Math.log(dec + 1) / Math.LN2 > totalArgLength) {
        throw "i is too big for number of infons specified";
    }

    var startSlice = 0;
    for(var j = 0; j < infonsToUpdate.length; ++j) {
        var slice = unslicedArgs.slice(startSlice, startSlice + argLengths[j]);
        space.getInfonFromId(infonsToUpdate[j]).updatePermBody(slice);
        allArgs.push(slice);
        startSlice += argLengths[j];
    }
    return allArgs;
}

// Step until space is stable or maxSteps reached
var stepUntilStable = function(space) {
    var step;
    var numStepsSimulate = 20;
    var wasZero = false;
    for( step = 0; step < numStepsSimulate; ++step) {
        numChanged = doStep(space);
        if(numChanged === 0) {
            wasZero = true;
        }
        // TODO: DEBUG - REMOVE
        if(wasZero === true && numChanged > 0) {
            console.log("Houston! we have a stability prolbem");
        }
    }
    var stable = numChanged === 0 ? true : false;
    return [stable, step];
};

var assessSpaceSlow = function(space) {
    var numInfons = space.getNumInfons();
    var infonsToUpdate = [], funcOutsToTest = [];
    for(var i = 0; i < numInfons; ++i) {
        var infon = space.getInfonFromId(i);
        if('arg' in infon.types) {
            infonsToUpdate.push(infon.id)
        }
        else if('output' in infon.types) {
            funcOutsToTest.push(infon.id)
        }
    }
    return assessSpace(space, infonsToUpdate, funcOutsToTest);
}

totalStable = 0;
totalUnstable = 0;
var assessSpace = function(space, infonsToUpdate, funcOutsToTest) {
    //Cool down
    var allArgs = updateInfonsFromDec(0, space, infonsToUpdate);
    var stable = stepUntilStable(space);
    if(stable[0]) {
        totalStable++;
    }
    else {
        totalUnstable++;
    }
    var totalArgsLength = 0;

    for(var i = 0; i < allArgs.length; ++i) {
        totalArgsLength += allArgs[i].length;
    }

    // Exhaustively enumerate all combinations of input value
    var score = 0;
    for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
        var allArgs = updateInfonsFromDec(i, space, infonsToUpdate);
        // console.log(allArgs);

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
var optimiseRandomly = function(argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal) {
    console.log("optimising");
    var numTries = 1000;
    var winners = [];
    for(var attempt = 0; attempt < numTries; ++attempt) {
        var moon = new Space();
        var spaceT = createRandomSpace2(argLengths, outLengths, funcOuts, getRandomElement(infonSizeRange), getRandomElement(infonCountRange));
        createRandomEdges(spaceT.space, 0.8);
        var score = assessSpace(spaceT.space, spaceT.argIds, spaceT.outputIds);
        if(score >= scoreGoal) {
            console.log("winner");
            winners.push(spaceT.space);
            if(winners.length === 10) {
                drawWinners(winners);
                return;
            }
        }
    }

    setTimeout(optimiseRandomly, 100, argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal)
}

var simulate = function(space, canvas, draw) {
    // var computeReactionProbability = function(infonA, infonB, volume,
    // temperature) {
    // var BOLTZMAN_CONSTANT = 3.2;
    // var collisionProb = 1/volume*Math.PI*(infonA.getLength() +
    // infonB.getLength())
    // * Math.sqrt(8*BOLTZMAN_CONSTANT*temperature/Math.pi*velocity);
    // var collisionEnergy = Math.exp(-energy/(BOLTZMAN_CONSTANT*T));
    // return collisionProb * collisionEnergy;
    // }
    //
    // var volume = space.getNumInfons();
    // var numMolecules = space.getNumMolecules();
    // for (var i=0;i<numMolecules;++i) {
    // var infonA = space.getMoleculeFromId(i);
    // for (var j=i;++j != numMolecules;) {
    // var infonB = space.getMoleculeFromId(j);
    // var reactionProbability = computeReactionProbability(infonA, infonB,
    // space.getNumInfons, space.getTemperature());
    // var willReact = Math.random() < reactionProbability ? true : false;
    // if (willReact) {

};

paused = false;

$(document).ready(function() {
    $("html").keypress(function(event) {
        if(event.which == 112) {
            event.preventDefault();
        }
        if(paused) {
            paused = false;
            console.log('unpausing');
        }
        else {
            paused = true;
            console.log('pausing');

        }
    });

    findAnd();
    // findAddone();
    // // findNegation();
    // findConcat();
});
