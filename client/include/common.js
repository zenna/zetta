/**
 * @author Zenna Tavares, Assortment of helper functions
 */

// Scale a value linearly give doman and range ranges
var scaleLinearly = function(value, domainMin, domainMax, rangeMin, rangeMax) {
    var domainRange = domainMax - domainMin;
    var rangeRange = rangeMax - rangeMin;
    return (value - domainMin) / (domainMax - domainMin) * (rangeMax - rangeMin) + rangeMin;
};
// ------ Array Functions ---------
// Sum values in array
"use strict";
var sum = function(arrayToSum) {
    return arrayToSum.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
    });
};
// Min value in array
var min = function(arrayToMin) {
    return Math.min.apply(Math.min, arrayToMin);
};
// Are arrays a and b equal? (required because [1,2] != [1,2] in js)
var arraysEqual = function(a, b) {
    return !(a < b || b < a);
};
var indexInListOfArrays = function(list, searchValue) {
    return list.indexOf(searchValue);
};
// Return a random element from a list
var getRandomElement = function(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
};
var sumArray = function(arrayToSum) {
    return arrayToSum.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
    });
};
// Return the index of the first element of a list where filterFunc(element) =is
// true
var indexOfFilteredList = function(list, filterFunc) {
    var index = -1;
    for(var i = 0; i < list.length; ++i) {
        if(filterFunc(list[i]) === true) {
            index = i;
            break;
        }
    }
    return index;
};
// Return the indices of the ALL elements of a list where filterFunc(element) =is
// true
var allIndexesOfFilteredList = function(list, filterFunc) {
    var indices = [];
    for(var i = 0; i < list.length; ++i) {
        if(filterFunc(list[i]) === true) {
            indices.push(i);
        }
    }
    return indices;
};
// Return the indices of the ALL elements of a list where element === value
var allIndexesOf = function(list, value) {
    return allIndexesOfFilteredList(list, function(val) {
        return val === value;
    })
};
// Return a range on interval [begin,end)
var range = function(begin, end) {
    var range = [];
    for(var i = begin; i < end; ++i) {
        range.push(i);
    }
    return range;
};
// Picks a random property from an object
var pickRandomProperty = function(obj) {
    var result, count = 0;
    for(var prop in obj) {
        if(Math.random() < 1 / ++count) {
            result = prop;
        }
    }
    return result;
};
// This function is for rearranging a list into an object keyed by some
// property of elements in the lsit
// it applies keyFilterFunc to elements to generate the key
// And applies objFilterFunc to elements to define what is stored
// By default objFilterFunc stores the entire element
var rearrangeListToObj = function(list, keyFilterFunc, objFilterFunc) {
    var objFilterFunc = typeof objFilterFunc === "undefined" ? function(x) {
        return x;
    } : objFilterFunc;
    var rearranged = {};
    for(var i = 0; i < list.length; ++i) {
        var key = keyFilterFunc(list[i]).toString();
        if(!( key in rearranged)) {
            rearranged[key] = [];
        }
        rearranged[key].push(objFilterFunc(list[i]));
    }
    return rearranged;
};
// Returns nested object from parent and list of properties (i.e. strack trace)
// e.g. parentObj = {a:{b:{c:true}}}, propertyStack = [a,b,c], returns true
var getNestedObjectFromPropertyStack = function(parentObj, propertyStack) {
    var nestedObj = parentObj;
    for(var i = 0; i < propertyStack.length; i++) {
        nestedObj = nestedObj[propertyStack[i]];
    }
    return nestedObj;
};
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
};
// Drawing ------------------------------------------------------------------
var drawGraph = function(graph, w, h, parent, onNodeClick, nodeColours, update) {
    var self = this;
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
        return 6;
        // * space.getInfonFromId(d.id).getLength();
    }).style("fill", nodeColours).on("click", onNodeClick).call(force.drag);

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

    update();
}
// ---------
var getSimImageData = function(context, x, y, width, height) {
    // Get the CanvasPixelArray from the given coordinates and dimensions.
    var imgd = context.getImageData(x, y, width, height);
    var pix = imgd.data;

    // Loop over each pixel and invert the color.
    for(var i = 0, n = pix.length; i < n; i += 4) {
        if(pix[i] > 0) {
            var alpha;
        }
        pix[i] = 255 - pix[i];
        // red
        pix[i + 1] = 255 - pix[i + 1];
        // green
        pix[i + 2] = 255 - pix[i + 2];
        // blue
        // i+3 is alpha (the fourth element)
    }
    // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imgd, x, y);
};