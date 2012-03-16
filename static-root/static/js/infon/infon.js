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
    }


    this.getPermBody = function() {
        return this.permBody;
    }

};

var Space = function() {
    this.infons = [];
    this.edges = [];
    this.numEdges = 0;

    this.addInfon = function(infon) {
        infon.id = this.infons.length;
        this.infons.push(infon);
        this.edges.push([]);
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

};

// Helpers
var createRandomInfon = function(length) {
    var bitString = [];
    for(var i = 0; i < length; ++i) {
        bitString.push(Math.round(Math.random()));
    }
    return new Infon(bitString);
};

var createRandomSpace = function(numInfons, maxSize) {
    var earth = new Space();
    for(var i = 0; i < numInfons; ++i) {
        var randomInfon = createRandomInfon(Math.ceil(Math.random() * maxSize));
        earth.addInfon(randomInfon);
    }
    return earth;
};

var createRandomEdges = function(space, p) {
    var numInfons = space.getNumInfons();
    var maxEdges = numInfons * numInfons;
    for(var i = 0; i < numInfons; ++i) {
        if(Math.random() < p) {
            var locus = space.getInfonFromId(i);
            var length = locus.getLength();
            var numBitsInput = Math.pow(2, length) * length;
            var inputBitsRemaining = numBitsInput;

            var neighbourIds = [], numTries = 1000;
            for(var j = 0; j < numTries && inputBitsRemaining != 0; ++j) {
                var randomInfonId = Math.floor(Math.random() * space.getNumInfons());
                if(neighbourIds.indexOf(randomInfonId) === -1) {
                    var randomInfon = space.getInfonFromId(randomInfonId);
                    if(randomInfon.getLength() <= inputBitsRemaining) {
                        neighbourIds.push(randomInfonId);
                        inputBitsRemaining -= randomInfon.getLength();
                    }
                }
            }

            if(inputBitsRemaining === 0) {
                for(var j = 0; j < neighbourIds.length; ++j) {
                    space.addEdgeFromId(i, neighbourIds[j]);
                }
            }
            else {
                console.log("could not find suitable neighbours")
            }
        }
    }
};

var bitStringToInt = function(bitString) {
    var integer = 0;
    for(var i = 0; i < bitString.length; ++i) {
        integer += Math.pow(2, bitString.length - i - 1) * bitString[i];
    }
    return integer;
}

//  TODO: Find function and return function applied to argument
var hokum = function(func, argument, n) {
    var argPosInString = bitStringToInt(argument) * n;
    return func.slice(argPosInString, argPosInString + n);
};

var spaceToGraph = function(space) {
    var nodes = [];
    var links = [];

    for(var i = 0; i < space.getNumInfons(); ++i) {
        var currentInfon = space.getInfonFromId(i);
        var body = currentInfon.getPermBody();
        var bodyAsInt = bitStringToInt(body);
        nodes.push({
            id : currentInfon.id
        });

        var outInfonIds = space.getOutInfonsFromId(i);
        var currentString = currentInfon.getPermBody() + "";
        for(var j = 0; j < outInfonIds.length; ++j) {
            var neighbourInfon = space.getInfonFromId(j);
            links.push({
                source : currentInfon.id,
                target : neighbourInfon.id,
                value : 1
            })
        }
    }

    return {
        nodes : nodes,
        links : links
    };

}

var spaceDraw = function(space) {
    var height = 960;
    var width = 500;
    var graph = spaceToGraph(space);
    var color = d3.scale.category20();
    var force = d3.layout.force().distance(30).size([width, height]).linkStrength(0.01);
    var svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    force.nodes(graph.nodes).links(graph.links).start();
    var link = svg.selectAll("line.link").data(graph.links).enter().append("line").attr("class", "link");

    var node = svg.selectAll("circle.node").data(graph.nodes).enter().append("svg:g").attr("class", "node");
    node.append("circle").attr("class", "node").attr("r", 4.5).attr("class", "node").call(force.drag);
    node.append("svg:text").style("pointer-events", "none").text(function(d) {
        var string = bitStringToInt(space.getInfonFromId(d.id).getCurrentBody());
        return string;
    });

    // Update positions
    force.on("tick", function() {
        link.attr("x1", function(d) {
            return d.source.x;
        }).attr("y1", function(d) {
            return d.source.y;
        }).attr("x2", function(d) {
            return d.target.x;
        }).attr("y2", function(d) {
            return d.target.y;
        });


        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    });


    this.update = function(space) {
        for(var i = 0; i < space.getNumInfons(); ++i) {(function(index) {
                node.selectAll("text").text(function(d) {
                    var string = d.index + ":" + bitStringToInt(space.getInfonFromId(d.index).getCurrentBody());
                    return string;
                });

            })(i);

        }
    }

};

var setup = function(space,p) {
    while(space.getNumEdges() === 0) {
        createRandomEdges(space, p);
    }
}

var setupCanvas = function(space) {
    var canvas = new spaceDraw(space);
    return canvas;
}

var simulate = function(space, canvas, draw) {
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
        if( typeof currentInfon.tempBody === "undefined") {
            console.log("something wrong here");
        }
        if(currentInfon.tempBody.length != currentInfon.getCurrentBody().length) {
            console.log("houston");
        }
        else if(currentInfon.getCurrentBody() + "" !== currentInfon.tempBody + "") {
            actuallyUpdated += 1
        }

        currentInfon.updateCurrentBody(currentInfon.tempBody);

    }
    numUpdates.push(actuallyUpdated);
            if (numUpdates.length % 100 === 0) {
            $('#data').text(numUpdates + "");
        }

    console.log(toUpdate.length, actuallyUpdated);
    if(draw) {
        canvas.update(space);
    }
    setTimeout(simulate, 1000, space, canvas);
};
numUpdates = [];
var main = function(params, draw) {
    if(params.earth === null) {
        params.earth = createRandomSpace(1000, 2);
        setup(params.earth, 0.8);
        if(draw) {
            params.canvas = setupCanvas(params.earth);
        }
    }
    else if (numUpdates.length ===0) {
        simulate(params.earth, params.canvas)
    }
    return params;
};


$(document).ready(function() {
    var params = {
        earth : null,
        canvas : null
    };
    $('html').click(function() {
        params = main(params);
    });

})