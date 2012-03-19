/**
 * @author Zenna Tavares
 */

var Infon = function(bitString) {
    this.length = bitString.length;
    this.permBody = bitString;
    this.currentBody = bitString;

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
            currentInfon.tempBody = hokum(bitString, currentInfon.getCurrentBody(), currentInfon.getLength());
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
    var funcArgLengths = [];
    var totalArgLength = 0;
    for(var i = 0; i < infonsToUpdate; ++i) {
        var infon = space.getInfonFromId(infonsToUpdate[i]);
        funcArgLengths.push(infon.getLength());
        totalArgLength += funcArgLengths[i];
    }
    var unslicedArgs = decToBitString(0, totalArgsLength);
    if (Math.log(dec+1)/Math.LN2 > totalArgLength) {
        throw "i is too big for number of infons specified";
    }
    
    var startSlice = 0;
    for(var j = 0; j < infonsToUpdate.length; ++j) {
        var slice = unslicedArgs.slice(startSlice, startSlice + funcArgLengths[j]);
        space.getInfromFromId(infonsToUpdate[j]).updatePermBody(slice);
        allArgs.push(slice);
        startSlice += funcArgLengths[j];
    }
    return allArgs;
}

// var sliceArgs = function(i, funcArgLengths, idMapping) {
    // var totalArgsLength = sumArray(funcArgLengths);
    // var updatedArgs = {};
    // var allArgs = [];
    // var unslicedArgs = decToBitString(0, totalArgsLength);
    // var startSlice = 0;
    // for(var j = 0; j < funcArgLengths.length; ++j) {
        // updatedArgs[idMapping[j]] = unslicedArgs.slice(startSlice, startSlice + funcArgLengths[j]);
        // allArgs.push(updatedArgs[idMapping[j]]);
        // startSlice += funcArgLengths[j];
    // }
    // return {
        // updatedArgs : updatedArgs,
        // allArgs : allArgs
    // };
// }

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

assesSpaceSlow = function(space) {

}

var assessSpace = function(space, infonsToUpdate, funcOutsToTest) {

    //Cool down
    var allArgs = updateInfonsFromDec(0, space, infonsToUpdate);
    var stable = stepUntilStable(space);
    var totalArgsLength = sumArray(allArgs);

    // Exhaustively enumerate all combinations of input value
    var score = 0;
    for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
        // console.log("atempt:", attempt, " i:", i);
        var allArgs = updateInfonsFromDec(i, space, infonsToUpdate);

        var stableStep = stepUntilStable(space);
        if(stableStep[0]) {
            for(var j = 0; j < funcOutsToTest.length; ++j) {
                var infon = space.getInfonFromId(funcOutsToTest[i]);
                score += infon.outFunc(infon.getCurrentBody(), allArgs)[0];
            }
        }
    }
    return score;
}

// Randomly generate infons to recreate some function
var optimiseRandomly = function(funcArgLengths, funcOuts, funcOutLengths, infonSizeRange, infonCountRange) {
    console.log("optimising");
    var numTries = 1000;
    var winners = [];
    for(var attempt = 0; attempt < numTries; ++attempt) {

        var moon = new Space();
        createInfonsFromFuncs(funcArgLengths, funcOuts, funcOutLengths, moon);
        var totalArgsLength = sumArray(funcArgLengths);

        var earth = createRandomSpace(getRandomelement(infonSizeRange), getRandomelement(infonCountRange));
        var idMapping = earth.appendSpace(moon);
        createRandomEdges(earth, 0.8);

        // Randomise function args
        for(var i = 0; i < funcOuts.length; ++i) {
            var infonId = idMapping[funcArgLengths.length + i];
            var infon = space.getInfonFromId(infonId);
            infon.updatePermBody(createRandomBitString(infon.getLength()));
        }

        // // Randomise Outputs
        // for(var i = 0; i < funcOuts.length; ++i) {
        // var infonId = idMapping[funcArgLengths.length + i];
        // var infon = earth.getInfonFromId(infonId);
        // infon.updatePermBody(createRandomBitString(infon.getLength()));
        // }
        //
        // //Cool down
        // var updatedArgs = sliceArgs(0, funcArgLengths, idMapping);
        // updateSpecialInfons(earth, updatedArgs.updatedArgs);
        // var stable = stepUntilStable(earth);
        //
        // // Exhaustively enumerate all combinations of input value
        // var score = 0;
        // for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
        // // console.log("atempt:", attempt, " i:", i);
        // var updatedArgs = sliceArgs(i, funcArgLengths, idMapping);
        // updateSpecialInfons(earth, updatedArgs.updatedArgs);
        // var stableStep = stepUntilStable(earth);
        // if(stableStep[0]) {
        // for(var j = 0; j < funcOuts.length; ++j) {
        // var infonId = idMapping[funcArgLengths.length + j];
        // var infon = earth.getInfonFromId(infonId);
        // score += infon.outFunc(infon.getCurrentBody(),
        // updatedArgs.allArgs)[0];
        // }
        // }
        // }
        var score = assessSpace(earth, totalArgsLength, funcArgLengths, funcOuts, idMapping);
        if(score > 1) {
            console.log("winner")
            winners.push(earth);
            if(winners.length === 10) {
                return winners;
            }
        }
    }

    setTimeout(optimiseRandomly, 100, funcArgLengths, funcOuts, funcOutLengths, infonSizeRange, infonCountRange)
}

// var updateSpecialInfons = function(space, args) {
    // for(var infonId in args) {
        // var infon = space.getInfonFromId(infonId);
        // infon.updatePermBody(args[infonId]);
    // }
// }

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


$(document).ready(function() {
    findAnd();
});
