/**
 * @author Zenna Tavares
 */

// BitString Specific -------------------------------------
// Number of bist required to represent inters in range 0 - decimal - 1
var numBitsReqForDecimal = function(decimal) {
    if(decimal <= 0) {
        throw "invalid range for decimal";
    }
    return Math.ceil(Math.log(decimal) / Math.LN2);
};

var inArray = function(array, value) {
    return array.indexOf(value) === -1 ? false : true;
}

var incrementBitString = function(bitString) {
    var newBitString;
    var decBitString = bitStringToDec(bitString);
    if(Math.pow(2, bitString.length) - 1 === decBitString) {
        newBitString = zeroBitString(bitString.length);
    }
    else {
        newBitString = decToBitString(++decBitString, bitString.length);
    }
    return newBitString;
}

// Create a bitString of length length reset to 0
var zeroBitString = function(length) {
    var bitString = [];
    for(var i = 0; i < length; ++i) {
        bitString.push(0);
    }
    return bitString;
}

var bitStringToDec = function(bitString) {
    var integer = 0;
    for(var i = 0; i < bitString.length; ++i) {
        integer += Math.pow(2, bitString.length - i - 1) * bitString[i];
    }
    return integer;
};

// Convert decimal to bitString of specified length (>= number required)
var decToBitString = function(decimal, length) {
    var bitString;
    if(decimal < 0) {
        throw "must be positive"
    }
    else if(decimal === 0) {
        bitString = [0];
    }
    else {
        bitString = [];
        while(decimal > 0) {
            bitString.unshift(decimal % 2);
            decimal = decimal >> 1;
        }
    }
    if( typeof length !== "undefined" && length > bitString.length) {
        for(var i = 0; i < length - bitString.length; ++i) {
            bitString.unshift(0);
        }
    }
    return bitString;

};

// Infon specific ----------------
// Create a infon where each bit is sampled uniformly from {0,1}
var createRandomInfon = function(length) {
    return new Infon(createRandomBitString(length));
};

// Create a bitString where each bit is sampled uniformly from {0,1}
var createRandomBitString = function(length) {
    var bitString = [];
    for(var i = 0; i < length; ++i) {
        bitString.push(Math.round(Math.random()));
    }
    return bitString;
}

// Create a space of random infons
var createRandomSpace = function(maxSize, numInfons) {
    var earth = new Space();
    for(var i = 0; i < numInfons; ++i) {
        var randomInfon = createRandomInfon(Math.ceil(Math.random() * maxSize));
        earth.addInfon(randomInfon);
    }
    return earth;
};

// Create a space of random infons
var createRandomSpaceWithFunc = function(argLengths, outputLengths, funcOuts, maxSize, numInfons, allowArgOutputSharing) {
    var earth = new Space();
    var argIds = [], outputIds = [];

    // Create enough infons for arguments
    for(var i = 0; i < argLengths.length; ++i) {
        var randomInfon = createRandomInfon(argLengths[i]);
        randomInfon.types.push('arg');
        earth.addInfon(randomInfon);
        argIds.push(randomInfon.id);

    }

    for(var i = 0; i < outputLengths.length; ++i) {
        possibleShares = allIndexesOf(argLengths, outputLengths[i]);
        possibleShares = possibleShares.filter(function(element, index, array) {
            return !('output' in earth.getInfonFromId(element).types);
        });

        var shareArg = flip(0.5) && allowArgOutputSharing;
        var randomInfon;
        if(shareArg && possibleShares.length > 0) {
            randomInfon = earth.getInfonFromId(getRandomElement(possibleShares));
            randomInfon.out = funcOuts[i];
            randomInfon.types.push('output');
        }
        else {
            randomInfon = createRandomInfon(outputLengths[i]);
            randomInfon.out = funcOuts[i];
            randomInfon.types.push('output');
            earth.addInfon(randomInfon);
        }
        outputIds.push(randomInfon.id);

    }
    var sizeDebt = numInfons - earth.getNumInfons();
    for(var i = 0; i < sizeDebt; ++i) {
        var randomInfon = createRandomInfon(Math.ceil(Math.random() * maxSize));
        earth.addInfon(randomInfon);
    }

    return {
        space : earth,
        argIds : argIds,
        outputIds : outputIds
    };
};

var createRandomSpaceWithDomain = function(actions, observations, maxSize, numInfons) {
    var space = new Space();
    for(var i = 0; i < actions.length; ++i) {
        var numBitsRequired = numBitsReqForDecimal(actions[i].range);
        var infon = new Infon(zeroBitString(numBitsRequired));
        infon.types.push('action');
        infon.actionFunc = actions[i].func;
        space.addInfon(infon);
    }

    for(var i = 0; i < observations.length; ++i) {
        var numBitsRequired = numBitsReqForDecimal(observations[i].range);
        for(var j = 0; j < observations[i].number; ++j) {
            var infon = new Infon(zeroBitString(numBitsRequired));
            // infon.observeFunc = observations[i].observeFunc(i);
            infon.types.push('perhipheral');
            space.addInfon(infon);
        }
    }
    var sizeDebt = numInfons - space.getNumInfons();
    for(var i = 0; i < sizeDebt; ++i) {
        var randomInfon = createRandomInfon(Math.ceil(Math.random() * maxSize));
        space.addInfon(randomInfon);
    }

    return space;
};

var simulateAndDrawSpace = function(space) {
    var canvas = new spaceDraw(space, '#candidates');
}

// Converts space into d3 style graph for visual\alisation
var spaceToGraph = function(space) {
    var nodes = [];
    var links = [];

    for(var i = 0; i < space.getNumInfons(); ++i) {
        var currentInfon = space.getInfonFromId(i);
        var body = currentInfon.getPermBody();
        var bodyAsInt = bitStringToDec(body);
        nodes.push({
            id : currentInfon.id,
            types : currentInfon.types
        });

        var outInfons = space.getOutInfonsFromId(i);
        for(var j = 0; j < outInfons.length; ++j) {
            links.push({
                source : outInfons[j].sourceId,
                target : currentInfon.id,
                value : 1,
                type : outInfons[j].edgeType
            })
        }
    }

    return {
        nodes : nodes,
        links : links
    };

}

// Find all direct predecessors, and concatenate their string
var concatenateEdgesToBitString = function(space, currentInfon, edgeType) {
    var outInfonIds = space.getOutInfonsFromId(currentInfon.id, edgeType);
    var bitString = [];
    if(outInfonIds.length > 0) {
        for(var j = 0; j < outInfonIds.length; ++j) {
            var outInfonBits = space.getInfonFromId(outInfonIds[j].sourceId).getCurrentBody();
            bitString = bitString.concat(outInfonBits);
        }
    }
    return bitString;
}

var createRandomEdges = function(space, virtualEdgeProb, applyEdgeProb) {
    var numInfons = space.getNumInfons();
    
    // Create virtual edges first
    for(var i = 0; i < numInfons; ++i) {
        var locus = space.getInfonFromId(i);
        if(Math.random() < virtualEdgeProb / 2) {
            var randomSource = space.getInfonFromId(randInteger(0, numInfons));
            addVirtualEdge(space, locus, randomSource, createRandomBitString);
        }
    }

    // Then create 'apply' edges
    for(var i = 0; i < numInfons; ++i) {
        var locus = space.getInfonFromId(i);
        if(Math.random() < applyEdgeProb) {
            var edgeType, numBitsInput;
            var length = locus.getLength();
            numBitsInput = Math.pow(2, length) * length;
            edgeType = 'apply';

            var inputBitsRemaining = numBitsInput;
            var neighbourIds = [], numTries = 1000;
            for(var j = 0; j < numTries; ++j) {
                var randomInfonId = Math.floor(Math.random() * space.getNumInfons());
                var randomInfon = space.getInfonFromId(randomInfonId);
                if(randomInfon.getLength() <= inputBitsRemaining) {
                    neighbourIds.push(randomInfonId);
                    inputBitsRemaining -= randomInfon.getLength();
                }
            }

            if(inputBitsRemaining === 0) {
                for(var j = 0; j < neighbourIds.length; ++j) {
                    space.addEdgeFromId(i, neighbourIds[j], edgeType);

                }
            }
            else {
                console.log("could not find suitable neighbours")
            }
        }
    }
};

// Adds replacement infon from source to target
var addVirtualEdge = function(space, targetInfon, sourceInfon, bitStringGen) {
    var lengthTarget = targetInfon.getLength();
    var lengthSource = sourceInfon.getLength();
    var virtualInfonSize = lengthTarget * Math.pow(2, lengthSource);

    var virtualInfon = new Infon(bitStringGen(virtualInfonSize));
    virtualInfon.types.push('virtual');
    space.addInfon(virtualInfon);
    space.addEdge(virtualInfon, sourceInfon, 'virtualFromSource');
    space.addEdge(targetInfon, virtualInfon, 'virtualToTarget');
}

// Apply function defined by bitString func to argument
// n := for number of functions from size m -> n == n^m
var hokum = function(func, argument, n) {
    var argPosInString = bitStringToDec(argument) * n;
    return func.slice(argPosInString, argPosInString + n);
};

var runSimulation = function(space, canvas) {
    if(space.simulating === false) {
        space.simulating = true; (function loopy() {
            if(canvas) {
                canvas.update();
            }
            var numChanges;
            if(!paused) {
                numChanges = doStep(space);
            }
            else {
                numChanges = 1;
            }

            if(numChanges > 0) {
                setTimeout(loopy, 1000);
            }
            else {
                space.simulating = false;
            }
        })();
    }
}

// From an infonic space return a edgelist graph, useful for visualisation
var spaceDraw = function(space, parent) {
    var self = this;
    var graph = spaceToGraph(space);
    var w = 200, h = 200;
    var force = d3.layout.force().nodes(d3.values(graph.nodes)).links(graph.links).size([w, h]).linkDistance(60).charge(-300).on("tick", tick).start();

    var svg = d3.select(parent).append("svg:svg").attr("width", w).attr("height", h);

    // Per-type markers, as they don't inherit styles.
    svg.append("svg:defs").selectAll("marker").data(["apply", "virtualToTarget", "virtualFromSource"]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", -1.5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5");

    var path = svg.append("svg:g").selectAll("path").data(force.links()).enter().append("svg:path").attr("class", function(d) {
        return "link " + d.type;
    }).attr("marker-end", function(d) {
        return "url(#" + d.type + ")";
    });

    var circle = svg.append("svg:g").selectAll("circle").data(force.nodes()).enter().append("svg:circle").attr("r", function(d) {
        return 6;// * space.getInfonFromId(d.id).getLength();
    }).style("fill", function(d) {
        if(d.types.indexOf('arg') != -1 && d.types.indexOf('output') != -1) {
            return "green";
        }
        else if(d.types.indexOf('arg') !== -1) {
            return "blue"
        }
        else if(d.types.indexOf('output') !== -1) {
            return "red";
        }
        else if(d.types.indexOf('perhipheral') != -1) {
            return "pink";
        }
        else if(d.types.indexOf('action') != -1) {
            return "yellow";
        }
        else if(d.types.indexOf('virtual') != -1) {
            return "orange";
        }
        else {
            return "grey";
        }
    }).on("click", function(d) {
        var infon = space.getInfonFromId(d.id);
        var body;
        if(event.button === 0) {
            body = infon.getPermBody();
        }
        else if(event.button === 1) {
            body = infon.getCurrentBody();
        }
        var decPermBody = bitStringToDec(body);
        var newBody;
        if(Math.pow(2, body.length) - 1 === decPermBody) {
            newBody = zeroBitString(body.length);
        }
        else {
            newBody = decToBitString(++decPermBody, body.length);
        }

        if(event.button === 0) {
            infon.updatePermBody(newBody);

        }
        else if(event.button === 1) {
            infon.updateCurrentBodyDirectly(newBody);

        }
        runSimulation(space, self);

    }).call(force.drag);

    var text = svg.append("svg:g").selectAll("g").data(force.nodes()).enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.

    text.append("svg:text").attr("x", 8).attr("y", ".31em").attr("class", "shadow").text(function(d) {
        return "";
    });


    text.append("svg:text").attr("x", 8).attr("y", ".31em").text(function(d) {
        return "";
    });

    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });


        circle.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });


        text.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    }


    this.update = function() {
        for(var i = 0; i < space.getNumInfons(); ++i) {(function(index) {
                text.selectAll('text').text(function(d) {
                    var infon = space.getInfonFromId(d.index);
                    var string = d.index + "-c:" + infon.getCurrentBody().join("") + " p:" + infon.getPermBody().join("");
                    string += " f:" + concatenateEdgesToBitString(space, infon, 'apply').join("");
                    return string;
                });

            })(i);
        }
    }


    this.update();
};
