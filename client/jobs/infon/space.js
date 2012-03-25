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


    this.addEdge = function(targetInfon, sourceInfon, edgeType) {
        this.edges[targetInfon.id].push({
            sourceId : sourceInfon.id,
            edgeType : edgeType
        });
    };


    this.addEdgeFromId = function(infonAId, infonBId, edgeType) {
        this.addEdge(this.getInfonFromId(infonAId), this.getInfonFromId(infonBId), edgeType);
    };


    this.numOutEdgesFromId = function(infonId) {
        return this.edges[infonId].length;
    };


    this.getPredecessors = function(targetInfon, edgeType) {
        return this.getOutInfonsFromId(targetInfon.id, edgeType)
    }


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
}

var handleApplyEdge = function(space, currentInfon, body, predecessors) {
    var toUpdate = [];
    if(predecessors.length > 0) {
        var bitString = [];
        for(var j = 0; j < predecessors.length; ++j) {
            var outInfonBits = space.getInfonFromId(predecessors[j]).getCurrentBody();
            bitString = bitString.concat(outInfonBits);
        }
        currentInfon.tempBody = hokum(bitString, body, currentInfon.getLength());
        toUpdate.push(currentInfon.id);
        
        if (currentInfon.tempBody.length != currentInfon.getCurrentBody().length) {
            throw "WHAA";
        }
    }
    return toUpdate;
}

// Simulation step
var doStep = function(space) {
    var toUpdate = [];
    for(var i = 0; i < space.getNumInfons(); ++i) {
        var currentInfon = space.getInfonFromId(i);
        var predecessors = space.getPredecessors(currentInfon);
        var edgeTypeToSource = rearrangeListToObj(predecessors, function(element) {
            return element.edgeType
        }, function(element) {
            return element.sourceId
        });

        var body = currentInfon.getCurrentBody();

        if(inArray(currentInfon.types, 'action')) {
            currentInfon.actionFunc(currentInfon.getCurrentBody());
        }
        if('virtualToTarget' in edgeTypeToSource) {
            var sourceInfonId = edgeTypeToSource.virtualToTarget[0];
            var sourceInfon = space.getInfonFromId(sourceInfonId);
            var inputId = space.getPredecessors(sourceInfon, 'virtualFromSource')[0].sourceId;
            var inputBitString = space.getInfonFromId(inputId).getCurrentBody();
            var output = hokum(sourceInfon.getCurrentBody(), inputBitString, currentInfon.getLength());
            currentInfon.tempBody = output;
            toUpdate.push(i);
            body = output;
        }
        if('virtualFromSource' in edgeTypeToSource) {
            if(edgeTypeToSource['apply'] !== undefined) {
                var toUpdateFromApply = handleApplyEdge(space, currentInfon, body, edgeTypeToSource['apply']);
                toUpdate = toUpdate.concat(toUpdateFromApply);
            }
        }
        if('apply' in edgeTypeToSource) {
            // console.log('apply');
            var toUpdateFromApply = handleApplyEdge(space, currentInfon, body, edgeTypeToSource['apply']);
            toUpdate = toUpdate.concat(toUpdateFromApply);
        }
    }

    // Problem of virtual infons
    // Idea: if infon has incoming edge from virtual infon, if finds virtual
    // infons source, and calls virtualInfon(Itssource)
    // it does this for all incoming virtual edges, concatenates output and
    // replaces itself.
    // ProblemHow can the infon know

    // var replaceBitString = concatenateEdgesToBitString(space, currentInfon,
    // 'replace');
    // if(replaceBitString.length > 0) {
    // body = currentInfon.tempBody = replaceBitString;
    // toUpdate.push(i);
    //
    // if(replaceBitString.length != currentInfon.getLength()) {
    // throw "replace infon is wrong size";
    // }
    // }
    // else {
    // var outInfonIds = space.getOutInfonsFromId(currentInfon.id, 'apply');
    // if(outInfonIds.length > 0) {
    // var bitString = [];
    // for(var j = 0; j < outInfonIds.length; ++j) {
    // var outInfonBits =
    // space.getInfonFromId(outInfonIds[j].sourceId).getCurrentBody();
    // bitString = bitString.concat(outInfonBits);
    // }
    // currentInfon.tempBody = hokum(bitString, currentInfon.getPermBody(),
    // currentInfon.getLength());
    // toUpdate.push(i);
    // }
    // }
    // }
    var actuallyUpdated = 0;
    for(var i = 0; i < toUpdate.length; ++i) {
        var currentInfon = space.getInfonFromId(toUpdate[i]);
        if(currentInfon.getCurrentBody() + "" !== currentInfon.tempBody + "") {
            actuallyUpdated += 1;
        }
        currentInfon.updateCurrentBody(currentInfon.tempBody);
    }
    return actuallyUpdated;
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
