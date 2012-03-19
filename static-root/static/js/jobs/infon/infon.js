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

var setupCanvas = function(space) {
    var canvas = new spaceDraw(space);
    return canvas;
}

var concatenateEdgesToBitString = function(space, currentInfon) {
    var outInfonIds = space.getOutInfonsFromId(currentInfon.id);
    var bitString = [];
    if(outInfonIds.length > 0) {
        for(var j = 0; j < outInfonIds.length; ++j) {
            var outInfonBits = space.getInfonFromId(outInfonIds[j]).getPermBody();
            bitString = bitString.concat(outInfonBits);
        }
    }
    return bitString;
}

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
    // console.log("actually changed:" ,actuallyUpdated);
}

// Randomly generate infons to recreate some function
var optimiseRandomly = function(funcArgLengths, funcOuts, funcOutLengths, infonSizeRange, infonCountRange) {
    console.log("optimising");
    var numTries = 10000;
    var winners = [];
    for(var attempt = 0; attempt < numTries; ++attempt) {

        var moon = new Space();
        createInfonsFromFuncs(funcArgLengths, funcOuts, funcOutLengths, moon);

        var totalArgsLength = 0;
        for(var i = 0; i < funcArgLengths.length; ++i) {
            totalArgsLength += funcArgLengths[i];
        }

        var earth = createRandomSpace(getRandomelement(infonSizeRange), getRandomelement(infonCountRange));
        var idMapping = earth.appendSpace(moon);
        createRandomEdges(earth, 0.8);

        // Randomise Outputs
        for(var i = 0; i < funcOuts.length; ++i) {
            var infonId = idMapping[funcArgLengths.length + i];
            var infon = earth.getInfonFromId(infonId);
            infon.updatePermBody(createRandomBitString(infon.getLength()));
        }

        //Cool down
        var updatedArgs = {};
        var allArgs = [];
        var unslicedArgs = decToBitString(0, totalArgsLength);
        var startSlice = 0;
        for(var j = 0; j < funcArgLengths.length; ++j) {
            updatedArgs[idMapping[j]] = unslicedArgs.slice(startSlice, startSlice + funcArgLengths[j]);
            allArgs.push(updatedArgs[idMapping[j]]);
            startSlice += funcArgLengths[j];
        }
        updateSpecialInfons(earth, updatedArgs);
        var step;
        var numStepsSimulate = 10;
        for( step = 0; step < numStepsSimulate; ++step) {
            numChanged = doStep(earth);
        }
        var cooled = numChanged === 0 ? true : false;
        if(cooled) {
            var alpha;
        }
        // Exhaustively enumerate all combinations of input value
        var score = 0;
        for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
            // console.log("atempt:", attempt, " i:", i);
            var updatedArgs = {};
            var allArgs = [];
            var unslicedArgs = decToBitString(i, totalArgsLength);

            // num bits for all combs or arg values
            var startSlice = 0;
            for(var j = 0; j < funcArgLengths.length; ++j) {
                updatedArgs[idMapping[j]] = unslicedArgs.slice(startSlice, startSlice + funcArgLengths[j]);
                allArgs.push(updatedArgs[idMapping[j]]);
                startSlice += funcArgLengths[j];
            }

            updateSpecialInfons(earth, updatedArgs);
            var numStepsSimulate = 10;
            var numChanged = 1;
            // Anything g
            // var step;
            // for( step = 0; step < numStepsSimulate && numChanged > 0; ++step)
            // {
            // numChanged = doStep(earth);
            // }
            //
            numChanged = doStep(earth);

            // console.log(step)

            // var maxNumStepsTillStable = 4;
            if(cooled) {
                // if(step < maxNumStepsTillStable) {
                for(var j = 0; j < funcOuts.length; ++j) {
                    var infonId = idMapping[funcArgLengths.length + j];
                    var infon = earth.getInfonFromId(infonId);
                    score += infon.outFunc(infon.getCurrentBody(), allArgs)[0];
                }
            }
            // }
        }
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

var findAnd = function() {
    var funcArgLengths = [1,1];
    var funcOutLengths = 1;

    var andOut = function(myValue, args) {
        return myValue[0] === args[1][0] && args[0][0] ? [1] : [0];
    }

    var winners = optimiseRandomly(funcArgLengths, [andOut], [funcOutLengths], range(1, 4), range(1, 6));
    a = winners;
    console.log("drawing winners")
    for(var i = 0; i < winners.length; ++i) {
        var canvas = new spaceDraw(winners[i], '#candidates');

        canvas.update();
    }
}

var findNegation = function() {
    var negateArgLength = 1;
    var funcOutLengths = 1

    var negateOut = function(myValue, args) {
        return myValue[0] === 1 - args[0][0] ? [1] : [0];
    }

    var winners = optimiseRandomly([negateArgLength], [negateOut], [funcOutLengths], range(1, 4), range(1, 4));
    a = winners;
    console.log("drawing winners")
    for(var i = 0; i < winners.length; ++i) {
        var canvas = new spaceDraw(winners[i], '#candidates');

        canvas.update();
    }
}

var updateSpecialInfons = function(space, args) {
    for(var infonId in args) {
        var infon = space.getInfonFromId(infonId);
        infon.updatePermBody(args[infonId]);
    }
}

var simulate = function(space, canvas, draw) {
    step(space);
    if(draw) {
        canvas.update(space);
    }
    setTimeout(simulate, 1000, space, canvas);
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
    //
    // }
    // }
    // }
    //
    // /*
    // * For all pairs
    // * var tempera
    // *
    // *
    // */
};

var main = function(params, draw) {
    if(params.earth === null) {
        params.earth = createRandomSpace(20, 4);
        setup(params.earth, 0.8);
        if(draw) {
            params.canvas = setupCanvas(params.earth);
        }
    }
    else if(numUpdates.length === 0) {
        simulate(params.earth, params.canvas)
    }
    return params;
};


$(document).ready(function() {
    findAnd();
    // var params = {
    // earth : null,
    // canvas : null
    // };
    // $('html').click(function() {
    // findNegation();
    // // params = main(params, true);
    // });

})