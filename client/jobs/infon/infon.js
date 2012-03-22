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


    this.updateCurrentBodyDirectly = function(bitString) {
        this.currentBody = bitString;
    }


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
    this.simulating = false;

    this.addInfon = function(infon) {
        infon.id = this.infons.length;
        this.infons.push(infon);
        this.edges.push([]);
        return infon.id;
    };


    this.addEdge = function(infonA, infonB, edgeType) {
        this.edges[infonA.id].push({
            target : infonB.id,
            edgeType : edgeType
        });
    };


    this.addEdgeFromId = function(infonAId, infonBId, edgeType) {
        this.addEdge(this.getInfonFromId(infonAId), this.getInfonFromId(infonBId), edgeType);
    };


    this.numOutEdgesFromId = function(infonId) {
        return this.edges[infonId].length;
    };


    this.getOutInfonsFromId = function(infonId, edgeType) {
        var allEdges = this.edges[infonId];

        if(allEdges === undefined) {
            var alpha;
        }

        return typeof edgeType === "undefined" ? allEdges : allEdges.filter(function(element, index, array) {
            return element.edgeType === edgeType;
        });

    };


    this.getNumInfons = function() {
        return this.infons.length;
    };


    this.getInfonFromId = function(infonId) {
        return this.infons[infonId];
    };

    // Needs updating for multiple edge types
    // this.appendSpace = function(space) {
    // var idMapping = {};
    // var numInfons = space.getNumInfons();
    // var displacement = this.getNumInfons();
    // for(var i = 0; i < numInfons; ++i) {
    // var toAdd = space.getInfonFromId(i);
    // var newInfonId = this.addInfon(toAdd);
    // var edges = space.getOutInfonsFromId(i);
    // this.edges[i] = edges.map(function(value) {
    // return value + displacement;
    // });
    //
    // idMapping[i] = newInfonId;
    // }
    // return idMapping;
    // }

};

// Simulation step
var doStep = function(space) {
    var toUpdate = [];
    for(var i = 0; i < space.getNumInfons(); ++i) {
        var currentInfon = space.getInfonFromId(i);
        var body = currentInfon.getCurrentBody();

        // Do replace if infon has both edges for some reason
        // var replaceBitString = concatenateEdgesToBitString(space, currentInfon, 'replace');
        // if(replaceBitString.length > 0) {
            // body = currentInfon.tempBody = replaceBitString;
            // toUpdate.push(i);
// 
            // if(replaceBitString.length != currentInfon.getLength()) {
                // throw "replace infon is wrong size";
            // }
        // }
        // else {
            var outInfonIds = space.getOutInfonsFromId(currentInfon.id, 'apply');
            if(outInfonIds.length > 0) {
                var bitString = [];
                for(var j = 0; j < outInfonIds.length; ++j) {
                    var outInfonBits = space.getInfonFromId(outInfonIds[j].target).getCurrentBody();
                    bitString = bitString.concat(outInfonBits);
                }
                currentInfon.tempBody = hokum(bitString, currentInfon.getPermBody(), currentInfon.getLength());
                toUpdate.push(i);
            }
        // }
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

// Updates the current body of one or more infons
// With a decimal integer which when converted to a bitString
// is of the appropriate lenght: makes it easy to enumerate
// over possible argument values
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
            zetta.log("Houston! we have a stability prolbem");
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
        var spaceT = createRandomSpaceWithFunc(argLengths, outLengths, funcOuts, getRandomElement(infonSizeRange), getRandomElement(infonCountRange));
        createRandomEdges(spaceT.space, 0.8);
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

}